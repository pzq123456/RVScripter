import { Canvas } from "./src/canvas.js";
import { Renderer } from "./src/renderer.js";

import { processGeoJSONData } from "./src/geoJSON.js";
import { ViewWindow } from "./src/viewWindow.js";

import { requestTile } from "./src/tileUtils.js";

const left = document.getElementById('left');

const canvasGroup = new Canvas(left,["map","text","control"]);

const mapCanvas = canvasGroup.getLayer("map");


let zoomLevel = 2;

let viewCenter = [116,36];

let viewWindow = new ViewWindow(viewCenter, canvasGroup.width, canvasGroup.height, zoomLevel);
const renderer = new Renderer(mapCanvas, viewWindow);

renderer.setFillColor('rgba(255, 0, 0, 0.3)');
renderer.setStrokeColor('green', 2);

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
let pointerType = "x";

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
        renderer.update(zoomLevel, project, translate);
        lastX = x;
        lastY = y;
    }
}


// 添加滚轮事件
controlCanvas.addEventListener('wheel', (event) => {
    // let x = event.clientX - controlCanvas.getBoundingClientRect().left;
    // let y = event.clientY - controlCanvas.getBoundingClientRect().top;
    // 鼠标滚轮控制 zoomLevel 在 0 - 20 个整数之间
    zoomLevel -= Math.sign(event.deltaY);
    
    drawZoom(zoomLevel)
});

function drawZoom(zoomLevel){
    if(zoomLevel < 0){
        zoomLevel = 0;
    }else if(zoomLevel > 20){
        zoomLevel = 20;
    }
    viewWindow.updateZ(zoomLevel);
    renderer.update(zoomLevel, project, translate);
}

// 使用
document.addEventListener('keydown', (event) => {
    if(event.key == "w"){
        zoomLevel += 1;}
    else if(event.key == "s"){
        zoomLevel -= 1;
    }
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

// request tile and then add it to body
let tileList = [
    [0,0,0],
    [1,0,0],
    [1,1,0],
    [1,0,1],
    [1,1,1],
];

tileList.forEach(([z, x, y]) => {
    addTile(z, x, y);
});

function addTile(z, x, y){
    requestTile(z, x, y).then((img) => {
        img.width = 256;
        img.height = 256;
        left.appendChild(img);
    }).catch(e => {
        console.log(e);
    });
}