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

let project = viewWindow.project.bind(viewWindow);
let unproject = viewWindow.unproject.bind(viewWindow);
let translate = viewWindow.translate.bind(viewWindow);
let untranslate = viewWindow.untranslate.bind(viewWindow);

processGeoJSONData('./data/data.json').then(parsedData => {
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
let pointerType = "x";
let revX,revY;

function draw(x,y){
    if(!pointer){
        controlctx.clearRect(0, 0, canvasGroup.width, canvasGroup.height);
    }else{
        controlctx.clearRect(pointer.x - pointer.size, pointer.y - pointer.size, pointer.size * 2, pointer.size * 2);
    }

    pointer = {
        x: x,
        y: y,
        size: 16
    }

    drawPointer(x, y, pointer.size, pointerType);

    if(!textArea){
        textCtx.clearRect(0, 0, canvasGroup.width, canvasGroup.height);
    }else{
        textCtx.clearRect(textArea.x, textArea.y, textArea.width, textArea.height);
    }

    [revX,revY] = unproject(untranslate([x,y]));

    textCtx.fillStyle = 'black';
    textCtx.font = '20px serif';
    let textWidth = Math.floor(textCtx.measureText(`(${revX}, ${revY})`).width + 20);

    let textdx= 0;

    // 超出范围检测 并调整
    if(x + textWidth >= canvasGroup.width){
        textdx = - textWidth - 10;
    }else{
        textdx = 0;
    }

    textCtx.fillText(`(${revX}, ${revY})`, x + textdx, y + 10);

    // update textArea
    textArea = {
        x: x + textdx,
        y: y - 10,
        width: textWidth,
        height: 25
    }
}

let isDragging = false;
let lastX;
let lastY;

controlCanvas.addEventListener('mousedown', (event) => {
    isDragging = true;
    lastX = event.clientX;
    lastY = event.clientY;
    pointerType = "o";
});

controlCanvas.addEventListener('mouseup', () => {
    isDragging = false;
    pointerType = "x";
});

// mouse leave
controlCanvas.addEventListener('mouseleave', () => {
    isDragging = false;
    pointerType = "x";
});

controlCanvas.addEventListener('mousemove', (event) => {
    const rect = controlCanvas.getBoundingClientRect();
    let x = event.clientX - rect.left;
    let y = event.clientY - rect.top;
    draw(x, y);

    if (!isDragging) return;

    requestAnimationFrame(() => {
        throttle(drawMap(x, y));
    });
});

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


// 添加滚轮事件
controlCanvas.addEventListener('wheel', (event) => {
    // 鼠标滚轮控制 zoomLevel 在 0 - 20 个整数之间
    zoomLevel -= Math.sign(event.deltaY);
    zoomLevel = Math.min(18, Math.max(0, zoomLevel));
    // viewWindow.setCenter([revY, revX]);
    requestAnimationFrame(() => {
        throttle(drawZoom(zoomLevel));
    });
});

function drawZoom(zoomLevel){
    viewWindow.updateZ(zoomLevel);
    renderer.update();
    rasterRenderer.update();
}

// 使用
document.addEventListener('keydown', (event) => {

    if(event.key == "w"){
        zoomLevel += 1;
    }
    else if(event.key == "s"){
        zoomLevel -= 1;
    }
    zoomLevel = Math.min(18, Math.max(0, zoomLevel));

    viewWindow.setCenter([revY, revX]);

    drawZoom(zoomLevel);
});

function drawPointer(x, y, size = 10, type = "x"){
    switch (type) {
        case "o":
            drawPointerO(x, y, size);
            break;
        case "x":
            drawPointerX(x, y, size);
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