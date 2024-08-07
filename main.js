import { Canvas } from "./src/canvas.js";
const test = document.getElementById('left');

const canvas = new Canvas(test);
console.log(canvas.getControlLayer());

let textCtx = canvas.getCtx("text");
textCtx.fillStyle = "red";
textCtx.fillRect(0, 0, 100, 100);