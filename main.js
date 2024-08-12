import { Canvas } from "./src/canvas.js";
import { createToolbar } from "./src/helper.js";
const left = document.getElementById('left');
const right = document.getElementById('right');

const canvasLayer = new Canvas(left);


const canvas = canvasLayer.ControlLayer;

const controlctx = canvas.getContext('2d');
const textCtx = canvasLayer.getCtx("text");
const gameCtx = canvasLayer.getCtx("game");

const viewWindow = { // 实际绘制的视窗
    x : -128,
    y : 128,
    width : 1024,
    height : 1024,
    zoom : 1 
}

let textArea = null;
let pointer = null;

const MAXEXTENT = 20037508.342789244;
const MAXLAT = 85.05112877980659;

function draw(x, y) {

    let windowVector = [
        [viewWindow.x, viewWindow.y],
        [viewWindow.x + viewWindow.width, viewWindow.y - viewWindow.height]
    ]

    let Xaxis = [ // X轴
        [0, 0],
        [viewWindow.width, 0]
    ]

    let Yaxis = [ // Y轴
        [0, 0],
        [0, viewWindow.height]
    ]

    const viewMatrix = [ // 视窗变换矩阵
        1, 0,
        0, -1,
        -viewWindow.x, viewWindow.y
    ]
    
    const reverseMatrix = [ // 逆变换矩阵
        1, 0,
        0, -1,
        viewWindow.x, viewWindow.y
    ]

    gameCtx.clearRect(0, 0, canvas.width, canvas.height);

    drawTransformedVector(windowVector, viewMatrix);

    drawTransformedVector(Xaxis, viewMatrix);
    drawTransformedVector(Yaxis, viewMatrix);

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

    let [revX,revY] = transform([x, y], reverseMatrix);

    textCtx.fillStyle = 'black';
    textCtx.font = '20px serif';
    // let textWidth = Math.floor(textCtx.measureText(`(${x}, ${y})`).width + 20);
    let textWidth = Math.floor(textCtx.measureText(`(${revX}, ${revY})`).width + 20);

    // 超出范围检测 并调整
    if(x +  textWidth >= canvas.width){
        x = x - textWidth;
    }else if(y == 0){
        y = 20;
    }

    textCtx.fillText(`(${revX}, ${revY})`, x + 10, y + 10);

    // update textArea
    textArea = {
        x: x - 10,
        y: y - 10,
        width: textWidth,
        height: 25
    }
}

canvas.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    // 控制更新频率
    throttle(draw(x, y));
});

// 添加键盘事件
document.addEventListener('keydown', (event) => {

    const rect = canvas.getBoundingClientRect();
    const pointerX = event.clientX - rect.left;
    const pointerY = event.clientY - rect.top;

    let x = viewWindow.x;
    let y = viewWindow.y;
    
    let step = 10;
    switch (event.key) {
        // wasd
        case 'w':
            y -= step;
            break;
        case 's':
            y += step;
            break;
        case 'a':
            x += step;
            break;
        case 'd':
            x -= step;
            break;
        default:
            break;
    }

    viewWindow.x = x;
    viewWindow.y = y;

    throttle(draw(pointerX, pointerY));
});

function center(){
    centerAt(100, 100);
}

function centerAt(x = 0, y = 0){
    viewWindow.x = x - viewWindow.width / 2;
    viewWindow.y = y + viewWindow.height / 2;
    throttle(draw(x, y));
}

const toolbarConfig = [
    { name: 'change', action: change },
    { name: 'center', action: center },
    { name: 'Delete', action: () => console.log('Delete clicked') }
];

function change(){
    canvasLayer.parentElement = right;
}

// 创建工具栏
createToolbar(toolbarConfig, right);

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

function drawTransformedVector(vector, matrix = viewMatrix, size = 30){
    let [ox, oy] = transform(vector[0], matrix);
    let [tx, ty] = transform(vector[1], matrix);
    drawVector([ox, oy], [tx, ty]);
}

function drawVector(O, XY, size = 30){
    let [x, y] = XY;
    let [ox, oy] = O;
    gameCtx.beginPath();
    gameCtx.moveTo(ox, oy);
    gameCtx.lineTo(x, y);
    gameCtx.strokeStyle = 'black';
    gameCtx.stroke();
    gameCtx.closePath();

    // draw arrow
    let angle = Math.atan2(y - oy, x - ox);
    let arrowLength = size;
    gameCtx.beginPath();
    gameCtx.moveTo(x, y);
    gameCtx.lineTo(x - arrowLength * Math.cos(angle - Math.PI / 6), y - arrowLength * Math.sin(angle - Math.PI / 6));
    gameCtx.moveTo(x, y);
    gameCtx.lineTo(x - arrowLength * Math.cos(angle + Math.PI / 6), y - arrowLength * Math.sin(angle + Math.PI / 6));
    gameCtx.strokeStyle = 'black';
    gameCtx.stroke();
    gameCtx.closePath();

    // draw text
    gameCtx.fillStyle = 'black';
    gameCtx.font = '20px serif';

    gameCtx.fillText(`(${ox}, ${oy})`, ox + 10, oy + 10);
    gameCtx.fillText(`(${x}, ${y})`, x + 10, y + 10);
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