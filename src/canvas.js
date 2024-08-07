import { uuid } from './utils.js';

/**
 * this class will create and maintain two canvas layers (exactally vertial in Z axis) like:
 * root\ zIndexFrom = 0 (e.g.)
 *  game Layer\ zIndex = 1
 *  text Layer\ zIndex = 2
 *  control Layer\ zIndex = 3
 */
export class Canvas{
    constructor(
        parentElement = null,
        id = 'editor',
        width = 1024, 
        height = 1024, 
        zIndexFrom = 0 
    ){
        this.uuid = uuid();
        this.width = width;
        this.height = height;
        this.parentElement = parentElement;
        this.id = id;
        this.zIndexFrom = zIndexFrom;
        this.root = null;
        this.layers = null;

        this.#createRoot();
        this.#createCanvas();
        this.#appendRoot();
    }

    getCtx(name){
        return this.layers[name].getContext('2d');
    }

    getControlLayer(){
        return this.layers["control"];
    }

    #createRoot(){
        this.root = document.createElement('div');
        this.root.id = this.id +"-"+this.uuid;

        let style = {
            width: this.width + 'px',
            height: this.height + 'px',
            position: 'relative',
            zIndex: this.zIndexFrom,
            backgroundColor: 'gray',
        }

        for(let key in style){
            this.root.style[key] = style[key];
        }

    }

    #appendRoot(){
        if(this.parentElement){
            this.parentElement.appendChild(this.root);
        }else{
            document.body.appendChild(this.root);
        }
    }

    #createCanvas(){
        let canvasLayerNames = ["game","text","control"];
        let zIndex = this.zIndexFrom + 1;
        this.layers = {};
        for(let i = 0; i < canvasLayerNames.length; i++){
            let name = canvasLayerNames[i];
            let layer = this.#createCanvasLayer(name, zIndex);
            this.layers[name] = layer;
            this.root.appendChild(layer);
            zIndex++;
        }
    }

    #createCanvasLayer(name, z){
        let myCanvas = document.createElement('canvas');
        myCanvas.width = this.width;
        myCanvas.height = this.height;
        myCanvas.id = this.id + "-" + name + "-" + this.uuid;
        myCanvas.style.position = 'absolute';
        myCanvas.style.zIndex = z;

        return myCanvas;
    }
}

