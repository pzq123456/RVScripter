import { Canvas } from "./src/canvas.js";
import { VectorRenderer, RasterRenderer } from "./src/renderer.js";

import { processGeoJSONData } from "./src/geoJSON.js";
import { ViewWindow } from "./src/viewWindow.js";

const left = document.getElementById('left');

const canvasGroup = new Canvas(left,["raster","vector","text","control"]);

const vectorCanvas = canvasGroup.getLayer("vector");
const rasterCanvas = canvasGroup.getLayer("raster");


let zoomLevel = 5;

let viewCenter = [116,36];

let viewWindow = new ViewWindow(viewCenter, canvasGroup.width, canvasGroup.height, zoomLevel);
const renderer = new VectorRenderer(vectorCanvas, viewWindow);
const rasterRenderer = new RasterRenderer(rasterCanvas, viewWindow);

// let project = viewWindow.project.bind(viewWindow);
let unproject = viewWindow.unproject.bind(viewWindow);
// let translate = viewWindow.translate.bind(viewWindow);
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
let revX,revY;

let isDragging = false;
let lastX;
let lastY;

function draw(x,y){
    if(!pointer){
        controlctx.clearRect(0, 0, canvasGroup.width, canvasGroup.height);
    }else{
        controlctx.clearRect(pointer.x - pointer.size, pointer.y - pointer.size, pointer.size * 2, pointer.size * 2);
    }

    pointer = {
        x: x,
        y: y,
        size: 20
    }

    drawPointer(x, y, pointer.size, pointerType);

    if(!textArea){
        textCtx.clearRect(0, 0, canvasGroup.width, canvasGroup.height);
    }else{
        textCtx.clearRect(textArea.x, textArea.y, textArea.width, textArea.height);
    }

    [revX,revY] = unproject(untranslate([x,y]));

    textCtx.fillStyle = 'black';
    textCtx.font = '40px serif';
    let textWidth = Math.floor(textCtx.measureText(`(${revX}, ${revY})`).width + 20);

    let textdx= 0;

    // 超出范围检测 并调整
    if(x + textWidth >= canvasGroup.width){
        textdx = - textWidth - 10;
    }else{
        textdx = 0;
    }

    // 添加背景色 透明的灰色
    // textCtx.fillStyle = 'rgba(255,255,255,0.3)';
    // textCtx.fillRect(x + textdx, y - 10, textWidth, 25);
    textCtx.fillStyle = 'black';
    textCtx.fillText(`(${revX}, ${revY})`, x + textdx, y + 20);

    // update textArea
    textArea = {
        x: x + textdx,
        y: y - 20,
        width: textWidth,
        height: 45
    }
}

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
    size /= 2;
    controlctx.beginPath();
    controlctx.arc(x, y, size, 0, Math.PI * 2); // 绘制自定义光标（一个圆形）
    controlctx.fillStyle = 'green'; // 自定义光标颜色
    controlctx.fill();
    controlctx.strokeStyle = 'white';
    controlctx.stroke();
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
    controlctx.fillStyle = 'green';
    controlctx.fill(svgPath);
    controlctx.restore();
}

// function 
// 工具函数 将某个内容写入粘贴板
function copyToClipboard(str) {
    navigator.clipboard.writeText(str).then(function() {
        console.log('Async: Copying to clipboard was successful!');
    });
}

