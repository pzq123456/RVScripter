import { Canvas } from "./src/canvas.js";
import { Renderer } from "./src/renderer.js";
import { LatLongToPixelXY, PixelXYToLatLong } from "./src/projection.js";

import { processGeoJSONData } from "./src/geoJSON.js";

import { ViewWindow } from "./src/viewWindow.js";

const left = document.getElementById('left');

const canvasGroup = new Canvas(left,["map","text","control"]);

const mapCanvas = canvasGroup.getLayer("map");
const renderer = new Renderer(mapCanvas);

renderer.setFillColor('rgba(255, 0, 0, 0.3)');
renderer.setStrokeColor('green', 2);

let zoomLevel = 2;

// let viewCenter = [116,36];
let viewCenter = [0,0];


let viewWindow = new ViewWindow(viewCenter, 1024, 1024, zoomLevel);

let project = viewWindow.project.bind(viewWindow);
let unproject = viewWindow.unproject.bind(viewWindow);
let translate = viewWindow.translate.bind(viewWindow);
let untranslate = viewWindow.untranslate.bind(viewWindow);

processGeoJSONData('./data/data.json').then(parsedData => {
    renderer.injectData(parsedData);
    renderer.update(zoomLevel, project, translate);
});

const controlCanvas = canvasGroup.ControlLayer;
const textCanvas = canvasGroup.getLayer("text");

const controlctx = controlCanvas.getContext('2d');
const textCtx = textCanvas.getContext('2d');

let textArea = null;
let pointer = null;

function draw(x,y){
    if(!pointer){
        controlctx.clearRect(0, 0, canvasGroup.width, canvasGroup.height);
    }else{
        controlctx.clearRect(pointer.x - pointer.size, pointer.y - pointer.size, pointer.size * 2, pointer.size * 2);
    }

    pointer = {
        x: x,
        y: y,
        size: 10
    }

    drawPointer(x, y, pointer.size);

    if(!textArea){
        textCtx.clearRect(0, 0, canvasGroup.width, canvasGroup.height);
    }else{
        textCtx.clearRect(textArea.x, textArea.y, textArea.width, textArea.height);
    }

    let [revX,revY] = unproject(untranslate([x,y]));

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

// drug
let isDragging = false;
let lastX;
let lastY;

controlCanvas.addEventListener('mousedown', (event) => {
    isDragging = true;
    lastX = event.clientX;
    lastY = event.clientY;
});

controlCanvas.addEventListener('mouseup', () => {
    isDragging = false;
});

controlCanvas.addEventListener('mousemove', (event) => {
    const rect = controlCanvas.getBoundingClientRect();
    let x = event.clientX - rect.left;
    let y = event.clientY - rect.top;

    throttle(draw(x, y));

    // // drag map
    if(isDragging){
        let dx = event.clientX - lastX;
        let dy = event.clientY - lastY;
        viewWindow.updateXY(dx / 100, dy / 100);
        renderer.update(zoomLevel, project, translate);
    }

});

// 添加使用键盘控制视窗移动
document.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'ArrowLeft':
            viewWindow.updateXY(viewWindow.x + 10, viewWindow.y);
            break;
        case 'ArrowRight':
            viewWindow.updateXY(viewWindow.x - 10, viewWindow.y);
            break;
        case 'ArrowUp':
            viewWindow.updateXY(viewWindow.x, viewWindow.y + 10);
            break;
        case 'ArrowDown':
            viewWindow.updateXY(viewWindow.x, viewWindow.y - 10);
            break;
        default:
            break;
    }

    renderer.update(zoomLevel, project, translate);
});

// 添加滚轮事件
controlCanvas.addEventListener('wheel', (event) => {
    // 鼠标滚轮控制 zoomLevel 在 0 - 20 个整数之间
    zoomLevel -= Math.sign(event.deltaY);
    if(zoomLevel < 0){
        zoomLevel = 0;
    }else if(zoomLevel > 20){
        zoomLevel = 20;
    }

    // update viewWindow
    viewWindow.updateZ(zoomLevel);

    renderer.update(zoomLevel, project, translate);
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
    controlctx.fillStyle = 'red'; // 自定义光标颜色
    controlctx.fill();
    controlctx.strokeStyle = 'black';
    controlctx.stroke();
}

function drawPointerX(x, y, size = 10){
    size /= 2;
    controlctx.beginPath();
    controlctx.moveTo(x - size, y - size);
    controlctx.lineTo(x + size, y + size);
    controlctx.moveTo(x + size, y - size);
    controlctx.lineTo(x - size, y + size);
    controlctx.strokeStyle = 'red';
    controlctx.stroke();
}