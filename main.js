import { Canvas } from "./src/canvas.js";
import { VectorRenderer, RasterRenderer } from "./src/renderer.js";
import { ViewWindow } from "./src/viewWindow.js";

import { processGeoJSONData } from "./src/geoJSON.js";

const left = document.getElementById('left');

const canvasGroup = new Canvas(left,["raster","vector","text","control"]);

const vectorCanvas = canvasGroup.getLayer("vector");
const rasterCanvas = canvasGroup.getLayer("raster");

let zoomLevel = 5;
let viewCenter = [116,36];

let viewWindow = new ViewWindow(viewCenter, canvasGroup.width, canvasGroup.height, zoomLevel);
const renderer = new VectorRenderer(vectorCanvas, viewWindow);
const rasterRenderer = new RasterRenderer(rasterCanvas, viewWindow);

let unproject = viewWindow.unproject.bind(viewWindow);
let untranslate = viewWindow.untranslate.bind(viewWindow);

processGeoJSONData('./data/china.json').then(parsedData => {
    renderer.injectData(parsedData);
    renderer.update();
    rasterRenderer.update();
});

const controlCanvas = canvasGroup.ControlLayer;
const textCanvas = canvasGroup.getLayer("text");
const controlctx = controlCanvas.getContext('2d');
const textCtx = textCanvas.getContext('2d');

let textArea = null;
let pointer = null;
let pointerType = "arrow";
let revX, revY;
let textSize = 20;

function draw(x, y) {
    if (pointer) {
        const pointerBounds = getPointerBounds(pointer);
        controlctx.clearRect(pointerBounds.x, pointerBounds.y, pointerBounds.width, pointerBounds.height);
    }
    
    pointer = { x: x, y: y, size: 30 };

    // Draw new pointer
    drawPointer(pointer.x, pointer.y, pointer.size, pointerType);

    if (textArea) {
        textCtx.clearRect(textArea.x, textArea.y, textArea.width, textArea.height);
    }

    [revX, revY] = unproject(untranslate([x, y]));

    const textString = `(${revX}, ${revY})`;
    textCtx.font = `${textSize}px Arial`;
    const textWidth = Math.floor(textCtx.measureText(textString).width + textSize / 2);

    let textdx = 20;
    if (x + textWidth >= canvasGroup.width) {
        textdx = -textWidth - textSize / 2;
    }

    // Draw new text
    textCtx.fillText(textString, x + textdx, y + textSize / 2);

    // Update textArea
    textArea = {
        x: x + textdx,
        y: y - textSize / 2,
        width: textWidth,
        height: textSize + 10
    };
}

function getPointerBounds(pointer) {
    return {
        x: pointer.x - pointer.size,
        y: pointer.y - pointer.size,
        width: pointer.size * 2,
        height: pointer.size * 2
    };
}

let isDragging = false;
let lastX;
let lastY;

addEventListeners(controlCanvas, [
    {
        event: 'mousedown',
        handler: (event) => {
            isDragging = true;
            lastX = event.clientX;
            lastY = event.clientY;
            pointerType = "grab";
        }
    },
    {
        event: 'mouseup',
        handler: () => {
            isDragging = false;
            pointerType = "arrow";
        }
    },
    {
        event: 'dblclick',
        handler: (event) => {
            copyToClipboard(`(${revX},${revY})`);
        }
    },
    {
        event: 'mouseleave',
        handler: () => {
            isDragging = false;
            pointerType = "arrow";
        }
    },
    {
        event: 'mousemove',
        handler: (event) => {
            const rect = controlCanvas.getBoundingClientRect();
            let x = event.clientX - rect.left;
            let y = event.clientY - rect.top;
            throttle(draw(x, y));

            if (!isDragging) return;
            requestAnimationFrame(() => {
                
                throttle(drawMap(x, y));
            });
        }
    },
    {
        event: 'wheel', // 添加滚轮事件
        handler: (event) => {
            // 调整 zoomLevel 在 0 - 20 个整数之间
            zoomLevel -= Math.sign(event.deltaY);
            zoomLevel = Math.min(viewWindow.maxZoomLevel, Math.max(0, zoomLevel));
            viewWindow.setCenter([revY, revX]);
            drawZoom(zoomLevel);
        }
    }
]);

// 双指触摸事件（模拟双击）
let lastTap = 0;

// 添加触摸事件监听器
addEventListeners(controlCanvas, [
    // 保留现有的鼠标事件处理器...
    
    // 触摸开始事件
    {
        event: 'touchstart',
        handler: (event) => {
            event.preventDefault(); // 防止默认行为（如滚动）
            isDragging = true;
            const touch = event.touches[0];
            lastX = touch.clientX;
            lastY = touch.clientY;
            pointerType = "o";
        }
    },
    // 触摸结束事件
    {
        event: 'touchend',
        handler: () => {
            isDragging = false;
            pointerType = "arrow";
        }
    },
    // 触摸取消事件
    {
        event: 'touchcancel',
        handler: () => {
            isDragging = false;
            pointerType = "arrow";
        }
    },
    // 触摸移动事件
    {
        event: 'touchmove',
        handler: (event) => {
            event.preventDefault();
            const touch = event.touches[0];
            const rect = controlCanvas.getBoundingClientRect();
            let x = touch.clientX - rect.left;
            let y = touch.clientY - rect.top;
            throttle(draw(x, y));

            if (!isDragging) return;
            requestAnimationFrame(() => {
                throttle(drawMap(x, y));
            });
        }
    },
    // 双指缩放事件（模拟鼠标滚轮缩放）
    {
        event: 'gesturechange',
        handler: (event) => {
            event.preventDefault();
            // 根据缩放比例调整 zoomLevel
            const zoomChange = event.scale > 1 ? -1 : 1;
            zoomLevel += zoomChange;
            zoomLevel = Math.min(viewWindow.maxZoomLevel, Math.max(0, zoomLevel));
            viewWindow.setCenter([revY, revX]);
            drawZoom(zoomLevel);
        }
    },
    {
        event: 'touchend',
        handler: (event) => {
            const currentTime = new Date().getTime();
            const tapLength = currentTime - lastTap;
            if (tapLength < 500 && event.touches.length === 0 && event.changedTouches.length === 1) {
                // 双击事件
                copyToClipboard(`(${revX},${revY})`);
            }
            lastTap = currentTime;
        }
    }

]);


function drawMap(x, y) {
    if (isDragging) {
        let dx = x - lastX;
        let dy = y - lastY;
        viewWindow.updateXY(-dx, -dy);
        renderer.update();
        rasterRenderer.update();
        lastX = x;
        lastY = y;
    }
}

function drawZoom(zoomLevel){
    viewWindow.updateZ(zoomLevel);
    renderer.update();
    rasterRenderer.update();
}

// function 
// 工具函数 将某个内容写入粘贴板
function copyToClipboard(str) {
    navigator.clipboard.writeText(str).then(function() {
        console.log('Async: Copying to clipboard was successful!');
    });
}

