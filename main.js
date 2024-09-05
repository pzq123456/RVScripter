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
            pointerType = "o";
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

function drawPointer(x, y, size = 10, type = "x"){
    switch (type) {
        case "o":
            drawPointerO(x, y, size);
            break;
        case "x":
            drawPointerX(x, y, size);
            break;
        case "arrow":
            drawPointerArrow(x, y, size);
            break;
        default:
            drawPointerO(x, y, size);
    }
}

function drawPointerO(x, y, size = 10){
    let path = "M28.09,9.74a4,4,0,0,0-1.16.19c-.19-1.24-1.55-2.18-3.27-2.18A4,4,0,0,0,22.13,8,3.37,3.37,0,0,0,19,6.3a3.45,3.45,0,0,0-2.87,1.32,3.65,3.65,0,0,0-1.89-.51A3.05,3.05,0,0,0,11,9.89v.91c-1.06.4-4.11,1.8-4.91,4.84s.34,8,2.69,11.78a25.21,25.21,0,0,0,5.9,6.41.9.9,0,0,0,.53.17H25.55a.92.92,0,0,0,.55-.19,13.13,13.13,0,0,0,3.75-6.13A25.8,25.8,0,0,0,31.41,18v-5.5A3.08,3.08,0,0,0,28.09,9.74ZM29.61,18a24,24,0,0,1-1.47,9.15A12.46,12.46,0,0,1,25.2,32.2H15.47a23.75,23.75,0,0,1-5.2-5.72c-2.37-3.86-3-8.23-2.48-10.39A5.7,5.7,0,0,1,11,12.76v7.65a.9.9,0,0,0,1.8,0V9.89c0-.47.59-1,1.46-1s1.49.52,1.49,1v5.72h1.8V8.81c0-.28.58-.71,1.46-.71s1.53.48,1.53.75v6.89h1.8V10l.17-.12a2.1,2.1,0,0,1,1.18-.32c.93,0,1.5.44,1.5.68l0,6.5H27V11.87a1.91,1.91,0,0,1,1.12-.33c.86,0,1.52.51,1.52.94Z";
    let svgPath = new Path2D(path);
    controlctx.save();
    controlctx.translate(x, y);
    controlctx.scale(size / 32, size / 34);
    controlctx.fillStyle = 'black';
    controlctx.fill(svgPath);
    controlctx.restore();
}

function drawPointerX(x, y, size = 10){
    size /= 2;
    controlctx.beginPath();
    controlctx.moveTo(x - size, y - size);
    controlctx.lineTo(x + size, y + size);
    controlctx.moveTo(x + size, y - size);
    controlctx.lineTo(x - size, y + size);
    controlctx.strokeStyle = 'green';
    controlctx.stroke();
}

function drawPointerArrow(x, y, size = 10) {
    let path = `M293.808,239.59l-82.841-82.878l60.437-34.929c3.54-2.047,5.601-5.936,5.306-10.015c-0.295-4.08-2.894-7.632-6.692-9.146 L14.699,0.762C10.734-0.821,6.212,0.109,3.193,3.127c-3.018,3.017-3.948,7.541-2.368,11.504l101.813,255.434 c1.515,3.801,5.066,6.401,9.147,6.696c4.081,0.301,7.972-1.766,10.017-5.309l34.904-60.449l82.835,82.868 c2.002,2.004,4.719,3.129,7.551,3.129c2.833,0,5.55-1.126,7.553-3.129l39.162-39.186 C297.976,250.516,297.976,243.758,293.808,239.59z`;
    let svgPath = new Path2D(path);
    controlctx.save();
    controlctx.translate(x, y);
    controlctx.scale(size / 300, size / 300);
    controlctx.fillStyle = 'black';
    controlctx.fill(svgPath);

    // white stroke
    controlctx.strokeStyle = 'white';
    controlctx.lineWidth = 10;
    controlctx.stroke(svgPath);

    controlctx.restore();
}

// function 
// 工具函数 将某个内容写入粘贴板
function copyToClipboard(str) {
    navigator.clipboard.writeText(str).then(function() {
        console.log('Async: Copying to clipboard was successful!');
    });
}

