import { Canvas } from "./src/canvas.js";
import { Renderer } from "./src/renderer.js";
import { LatLongToPixelXY, PixelXYToLatLong } from "./src/projection.js";

import { processGeoJSONData } from "./src/geoJSON.js";

const left = document.getElementById('left');

const canvasGroup = new Canvas(left,["map","text","control"]);

const mapCanvas = canvasGroup.getLayer("map");
const renderer = new Renderer(mapCanvas);

renderer.setFillColor('rgba(255, 0, 0, 0.3)');
renderer.setStrokeColor('green', 2);

const zoomLevel = 2;

const viewCenter = [-158,21];

function project([x,y],z = zoomLevel){
    return LatLongToPixelXY(y,x,z);
}

function unproject([x,y],z = zoomLevel){
    return PixelXYToLatLong(x,y,z);
}



let viewWindow = { // 实际绘制的视窗
    x : project(viewCenter)[0] - 512,
    y : project(viewCenter)[1] - 512,
    center: viewCenter,
    width : 1024,
    height : 1024,
    zoom : zoomLevel
}

console.log(viewWindow);

function translate([x,y]){
    return [x - viewWindow.x, y - viewWindow.y];
}

function untranslate([x,y]){
    return [x + viewWindow.x, y + viewWindow.y];
}

processGeoJSONData('./data/data.json').then(parsedData => {
    renderer.render(parsedData, project, translate);
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

controlCanvas.addEventListener('mousemove', (event) => {
    const rect = controlCanvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // 控制更新频率
    throttle(draw(x, y));
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