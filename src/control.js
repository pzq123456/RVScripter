const arrowPath = new Path2D(`M293.808,239.59l-82.841-82.878l60.437-34.929c3.54-2.047,5.601-5.936,5.306-10.015c-0.295-4.08-2.894-7.632-6.692-9.146 L14.699,0.762C10.734-0.821,6.212,0.109,3.193,3.127c-3.018,3.017-3.948,7.541-2.368,11.504l101.813,255.434 c1.515,3.801,5.066,6.401,9.147,6.696c4.081,0.301,7.972-1.766,10.017-5.309l34.904-60.449l82.835,82.868 c2.002,2.004,4.719,3.129,7.551,3.129c2.833,0,5.55-1.126,7.553-3.129l39.162-39.186 C297.976,250.516,297.976,243.758,293.808,239.59z`)
const grabPath = new Path2D("M28.09,9.74a4,4,0,0,0-1.16.19c-.19-1.24-1.55-2.18-3.27-2.18A4,4,0,0,0,22.13,8,3.37,3.37,0,0,0,19,6.3a3.45,3.45,0,0,0-2.87,1.32,3.65,3.65,0,0,0-1.89-.51A3.05,3.05,0,0,0,11,9.89v.91c-1.06.4-4.11,1.8-4.91,4.84s.34,8,2.69,11.78a25.21,25.21,0,0,0,5.9,6.41.9.9,0,0,0,.53.17H25.55a.92.92,0,0,0,.55-.19,13.13,13.13,0,0,0,3.75-6.13A25.8,25.8,0,0,0,31.41,18v-5.5A3.08,3.08,0,0,0,28.09,9.74ZM29.61,18a24,24,0,0,1-1.47,9.15A12.46,12.46,0,0,1,25.2,32.2H15.47a23.75,23.75,0,0,1-5.2-5.72c-2.37-3.86-3-8.23-2.48-10.39A5.7,5.7,0,0,1,11,12.76v7.65a.9.9,0,0,0,1.8,0V9.89c0-.47.59-1,1.46-1s1.49.52,1.49,1v5.72h1.8V8.81c0-.28.58-.71,1.46-.71s1.53.48,1.53.75v6.89h1.8V10l.17-.12a2.1,2.1,0,0,1,1.18-.32c.93,0,1.5.44,1.5.68l0,6.5H27V11.87a1.91,1.91,0,0,1,1.12-.33c.86,0,1.52.51,1.52.94Z");

function drawPointer(x, y, size = 10, type = "arrow"){
    switch (type) {
        case "grab":
            drawGrab(x, y, size);
            break;
        case "x":
            drawPointerX(x, y, size);
            break;
        case "arrow":
            drawArrow(x, y, size);
            break;
        default:
            drawPointerO(x, y, size);
    }
}

function drawGrab(x, y, size = 10){
    const scale = size / 32;
    controlctx.save();
    controlctx.translate(x, y);
    controlctx.scale(scale, scale);
    controlctx.fillStyle = 'black';
    controlctx.fill(grabPath);
    controlctx.restore();
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

function drawArrow(x, y, size = 10) {
    const scale = size / 300;
    controlctx.save();
    controlctx.translate(x, y);
    controlctx.scale(scale, scale);
    controlctx.fillStyle = 'black';
    controlctx.strokeStyle = 'white';
    controlctx.lineWidth = 10;
    controlctx.fill(arrowPath);
    controlctx.stroke(arrowPath);
    controlctx.restore();
}

class ControlRenderer{ // 渲染逻辑与地图渲染不一样，所以单独写一个类 而不是继承Renderer
    constructor(controlCanvas){
        this.controlCanvas = controlCanvas;
        this.controlctx = this.controlCanvas.getContext('2d');
        this.pointer = null;
        this.pointerType = "arrow";
        this.textSize = 20;
        this.textArea = null;
    }


}