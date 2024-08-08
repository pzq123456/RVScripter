import { Canvas } from "./src/canvas.js";
import { createToolbar } from "./src/helper.js";
const left = document.getElementById('left');
const right = document.getElementById('right');

const canvasLayer = new Canvas(left);


const canvas = canvasLayer.ControlLayer;
const controlctx = canvas.getContext('2d');
const textCtx = canvasLayer.getCtx("text");



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

let textArea = null;
let pointer = null;

const MAXEXTENT = 20037508.342789244;
const MAXLAT = 85.05112877980659;

function draw(x, y) {

    if(!pointer){
        controlctx.clearRect(0, 0, canvas.width, canvas.height);
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
        textCtx.clearRect(0, 0, canvas.width, canvas.height);
    }else{
        textCtx.clearRect(textArea.x, textArea.y, textArea.width, textArea.height);
    }


    textCtx.fillStyle = 'black';
    textCtx.font = '20px serif';
    let textWidth = Math.floor(textCtx.measureText(`(${x}, ${y})`).width + 20);

    // 超出范围检测 并调整
    if(x +  textWidth >= canvas.width){
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

// 防抖函数
function debounce(fn, delay = 100) {
    let timer = null;
    return function() {
        clearTimeout(timer);
        timer = setTimeout(() => {
            fn.apply(this, arguments);
        }, delay);
    };
}

// 截流函数
function throttle(fn, delay = 100) {
    let timer = null;
    return function() {
        if (!timer) {
            timer = setTimeout(() => {
                fn.apply(this, arguments);
                timer = null;
            }, delay);
        }
    };
}

canvas.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    // 控制更新频率
    throttle(draw(x, y));
});

const toolbarConfig = [
    { name: 'Save', action: change },
    { name: 'Load', action: () => console.log('Load clicked') },
    { name: 'Delete', action: () => console.log('Delete clicked') }
];

function change(){
    canvasLayer.parentElement = right;
}

// 创建工具栏
createToolbar(toolbarConfig, right);