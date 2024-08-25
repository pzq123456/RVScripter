import { Canvas } from "./src/canvas.js";
import { Renderer } from "./src/renderer.js";
import { LatLongToPixelXY } from "./src/projection.js";

import { processGeoJSONData } from "./src/geoJSON.js";

const left = document.getElementById('left');

const canvasGroup = new Canvas(left,["map","text","control"]);

const mapCanvas = canvasGroup.getLayer("map");
const renderer = new Renderer(mapCanvas);

renderer.setFillColor('rgba(255, 0, 0, 0.3)');
renderer.setStrokeColor('green', 2);

function project([x,y],z = 2){
    return LatLongToPixelXY(y,x,z);
}

processGeoJSONData('./data/data.json').then(parsedData => {
    renderer.render(parsedData, project);
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

    // let [revX,revY] = transform([x, y], reverseMatrix);

    textCtx.fillStyle = 'black';
    textCtx.font = '20px serif';
    // let textWidth = Math.floor(textCtx.measureText(`(${x}, ${y})`).width + 20);
    let textWidth = Math.floor(textCtx.measureText(`(${x}, ${y})`).width + 20);

    // 超出范围检测 并调整
    if(x +  textWidth >= canvasGroup.width){
        x = x - textWidth;
    }else if(y == 0){
        y = 20;
    }

    textCtx.fillText(`(${x}, ${y})`, x + 10, y + 10);

    // update textArea
    textArea = {
        x: x - 10,
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