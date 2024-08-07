import { Canvas } from "./src/canvas.js";
import { createToolbar } from "./src/helper.js";
const left = document.getElementById('left');
const right = document.getElementById('right');

const canvas = new Canvas(left).ControlLayer;

const ctx = canvas.getContext('2d');

function drawCustomCursor(x, y) {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // 清除画布内容
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, Math.PI * 2); // 绘制自定义光标（一个圆形）
    ctx.fillStyle = 'red'; // 自定义光标颜色
    ctx.fill();
    ctx.strokeStyle = 'black';
    ctx.stroke();
}

canvas.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    drawCustomCursor(x, y);
});

const toolbarConfig = [
    { name: 'Save', action: () => console.log('Save clicked') },
    { name: 'Load', action: () => console.log('Load clicked') },
    { name: 'Delete', action: () => console.log('Delete clicked') }
];

// 创建工具栏
createToolbar(toolbarConfig, right);