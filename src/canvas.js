/**
 * this class will create and maintain two canvas layers (exactally vertial in Z axis) like:
 * root\ zIndexFrom = 0 (e.g.)
 *  text Layer\ zIndex = 1
 *  game Layer\ zIndex = 2
 */
export class Canvas{
    constructor(
        width = 512, 
        height = 512, 
        parentElement = null,
        id = 'editor', 
        zIndexFrom = 0 
    ){
        this.width = width;
        this.height = height;
        this.parentElement = parentElement;
        this.id = id;
        this.zIndexFrom = zIndexFrom;
        this.layers = [];
        this.#createCanvas();
    }

    #createCanvas(){
        this.rootCanvas = document.createElement('canvas');
        this.rootCanvas.width = this.width;
        this.rootCanvas.height = this.height;
        this.rootCanvas.id = this.id;
        this.rootCanvas.style.position = 'absolute';
        this.rootCanvas.style.zIndex = this.zIndexFrom;
        this.rootCanvas.style.left = 0;
        this.rootCanvas.style.top = 0;
        this.parentElement.appendChild(this.rootCanvas);
    }
}