import { throttle } from "./utils.js";

const arrowPath = new Path2D(`M293.808,239.59l-82.841-82.878l60.437-34.929c3.54-2.047,5.601-5.936,5.306-10.015c-0.295-4.08-2.894-7.632-6.692-9.146 L14.699,0.762C10.734-0.821,6.212,0.109,3.193,3.127c-3.018,3.017-3.948,7.541-2.368,11.504l101.813,255.434 c1.515,3.801,5.066,6.401,9.147,6.696c4.081,0.301,7.972-1.766,10.017-5.309l34.904-60.449l82.835,82.868 c2.002,2.004,4.719,3.129,7.551,3.129c2.833,0,5.55-1.126,7.553-3.129l39.162-39.186 C297.976,250.516,297.976,243.758,293.808,239.59z`)
const grabPath = new Path2D("M28.09,9.74a4,4,0,0,0-1.16.19c-.19-1.24-1.55-2.18-3.27-2.18A4,4,0,0,0,22.13,8,3.37,3.37,0,0,0,19,6.3a3.45,3.45,0,0,0-2.87,1.32,3.65,3.65,0,0,0-1.89-.51A3.05,3.05,0,0,0,11,9.89v.91c-1.06.4-4.11,1.8-4.91,4.84s.34,8,2.69,11.78a25.21,25.21,0,0,0,5.9,6.41.9.9,0,0,0,.53.17H25.55a.92.92,0,0,0,.55-.19,13.13,13.13,0,0,0,3.75-6.13A25.8,25.8,0,0,0,31.41,18v-5.5A3.08,3.08,0,0,0,28.09,9.74ZM29.61,18a24,24,0,0,1-1.47,9.15A12.46,12.46,0,0,1,25.2,32.2H15.47a23.75,23.75,0,0,1-5.2-5.72c-2.37-3.86-3-8.23-2.48-10.39A5.7,5.7,0,0,1,11,12.76v7.65a.9.9,0,0,0,1.8,0V9.89c0-.47.59-1,1.46-1s1.49.52,1.49,1v5.72h1.8V8.81c0-.28.58-.71,1.46-.71s1.53.48,1.53.75v6.89h1.8V10l.17-.12a2.1,2.1,0,0,1,1.18-.32c.93,0,1.5.44,1.5.68l0,6.5H27V11.87a1.91,1.91,0,0,1,1.12-.33c.86,0,1.52.51,1.52.94Z");

class ControlRenderer{ // 渲染逻辑与地图渲染不一样，所以单独写一个类 而不是继承Renderer
    constructor(controlCanvas, textCanvas){
        this.controlCanvas = controlCanvas;
        this.controlctx = this.controlCanvas.getContext('2d');
        this.width = this.controlCanvas.width;
        this.pointer = null;
        this.pointerType = "arrow";
        this.textSize = 20;
        this.textArea = null;
        this.isDragging = false;
        this.pointerSize = 20;
    }

    render(x, y, revX, revY){
        // Draw new pointer
        this.drawPointer(x, y, this.pointerSize, this.pointerType);
        const textString = `(${revX}, ${revY})`;
        this.drawText(x, y, textString);
    }

    drawText(x, y, text){
        if (this.textArea) {
            this.controlctx.clearRect(this.textArea.x, this.textArea.y, this.textArea.width, this.textArea.height);
        }
        this.controlctx.font = `${this.textSize}px Arial`;
        const textWidth = Math.floor(this.controlctx.measureText(text).width + this.textSize / 2);
    
        let textdx = 20;
    
        if (x + textWidth >= this.width) {
            textdx = -textWidth - this.textSize / 2;
        }
    
        // Draw new text
        this.controlctx.fillText(text, x + textdx, y + this.textSize / 2);
    
        // Update textArea
        this.textArea = {
            x: x + textdx,
            y: y - this.textSize / 2,
            width: textWidth,
            height: this.textSize + 10
        };
    }

    drawPointer(x, y, size, type){
        if (this.pointer) {
            const pointerBounds = this.#getPointerBounds(this.pointer);
            this.controlctx.clearRect(pointerBounds.x, pointerBounds.y, pointerBounds.width, pointerBounds.height);
        }
        
        this.pointer = { x: x, y: y, size: this.pointerSize };
        this.drawPointers(x, y, size = this.pointerSize, type);
    }

    drawPointers(x, y, size = 10, type = "arrow"){
        switch (type) {
            case "grab":
                this.#drawGrab(x, y, size);
                break;
            case "x":
                this.#drawPointerX(x, y, size);
                break;
            case "arrow":
                this.#drawArrow(x, y, size);
                break;
            default:
                this.#drawArrow(x, y, size);
                break;
        }
    }

    #getPointerBounds(pointer) {
        return {
            x: pointer.x - pointer.size,
            y: pointer.y - pointer.size,
            width: pointer.size * 2,
            height: pointer.size * 2 + 10
        };
    }
    
    #drawGrab(x, y, size = 10){
        const scale = size / 32;
        this.controlctx.save();
        this.controlctx.translate(x, y);
        this.controlctx.scale(scale, scale);
        this.controlctx.fillStyle = 'black';
        this.controlctx.fill(grabPath);
        this.controlctx.restore();
    }
    
    #drawPointerX(x, y, size = 10){
        size /= 2;
        this.controlctx.beginPath();
        this.controlctx.moveTo(x - size, y - size);
        this.controlctx.lineTo(x + size, y + size);
        this.controlctx.moveTo(x + size, y - size);
        this.controlctx.lineTo(x - size, y + size);
        this.controlctx.strokeStyle = 'green';
        this.controlctx.stroke();
    }
    
    #drawArrow(x, y, size = 10) {
        const scale = size / 300;
        this.controlctx.save();
        this.controlctx.translate(x, y);
        this.controlctx.scale(scale, scale);
        this.controlctx.fillStyle = 'black';
        this.controlctx.strokeStyle = 'white';
        this.controlctx.lineWidth = 10;
        this.controlctx.fill(arrowPath);
        this.controlctx.stroke(arrowPath);
        this.controlctx.restore();
    }
}

export class Controler{
    constructor(canvasGroup, viewWindow, vectorRenderer, rasterRenderer){
        this.controlCanvas = canvasGroup.ControlLayer;
        this.vectorRenderer = vectorRenderer;
        this.rasterRenderer = rasterRenderer;
        this.viewWindow = viewWindow;
        // this.untranslate = viewWindow.untranslate;
        // this.unproject = viewWindow.unproject;
        this.center;
        this.zoomLevel;
        this.revX = 0;
        this.revY = 0;
        
        
        this.controlRenderer = new ControlRenderer(this.controlCanvas, canvasGroup.getLayer("text"));

        this.lastX;
        this.lastY;
    }

    init(center, zoomLevel){
        this.setCenter(center);
        this.setZoomLevel(zoomLevel);
        this.addEventListeners();
    }

    setCenter(center){
        this.center = center;
    }

    setZoomLevel(zoomLevel){
        this.zoomLevel = zoomLevel;
    }

    addEventListeners(){
        this.controlCanvas.addEventListener("mousedown", this.#mouseDown.bind(this));
        this.controlCanvas.addEventListener("mousemove", this.#mouseMove.bind(this));
        this.controlCanvas.addEventListener("mouseup", this.#mouseUp.bind(this));
        this.controlCanvas.addEventListener("wheel", this.#wheel.bind(this));
    }

    #mouseDown(event){
        this.controlRenderer.isDragging = true;
        this.lastX = event.clientX;
        this.lastY = event.clientY;
        this.controlRenderer.pointerType = "grab";
        // console.log("down");

    }

    #mouseMove(event){
        const rect = this.controlCanvas.getBoundingClientRect();
        let x = event.clientX - rect.left;
        let y = event.clientY - rect.top;

        [this.revX, this.revY] = this.viewWindow.unproject(this.viewWindow.untranslate([x, y]));

        this.controlRenderer.render(x, y, this.revX, this.revY);

        if (!this.controlRenderer.isDragging) return;
        requestAnimationFrame(() => {
            this.#drawMap(x, y);
        });
    }

    #mouseUp(){
        this.controlRenderer.isDragging = false;
        this.controlRenderer.pointerType = "arrow";
    }

    #wheel(event){
        this.zoomLevel -= Math.sign(event.deltaY);
        this.zoomLevel = Math.min(this.viewWindow.maxZoomLevel, Math.max(0, this.zoomLevel));
        this.viewWindow.setCenter([this.revY, this.revX]);
        this.#drawZoom(this.zoomLevel);
    }

    #drawMap(x, y) {
        if (this.controlRenderer.isDragging) {
            let dx = x - this.lastX;
            let dy = y - this.lastY;
            this.viewWindow.updateXY(-dx, -dy);
            // this.vectorRenderer.update();
            // this.rasterRenderer.update();
            throttle(this.vectorRenderer.update(), 1000);
            throttle(this.rasterRenderer.update(), 1000);
            this.lastX = x;
            this.lastY = y;
        }
    }
    
    #drawZoom(zoomLevel){
        // this.viewWindow.updateZ(zoomLevel);
        throttle(this.viewWindow.updateZ(zoomLevel), 1000);
        throttle(this.vectorRenderer.update(), 1000);
        throttle(this.rasterRenderer.update(), 1000);
    }
}

