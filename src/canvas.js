/**
 * this class will create and maintain two canvas #layers (exactally vertial in Z axis) like:
 * root\ zIndexFrom = 0 (e.g.)
 *  game Layer\ zIndex = 1
 *  text Layer\ zIndex = 2
 *  control Layer\ zIndex = 3
 */

export class Canvas{
    #uuid;
    #width;
    #height;
    #layers;
    #parentElement;

    constructor(
        parentElement = null,
        layerNames = ["game", "text", "control"],
        width = 2048, 
        height = 1024, 
        zIndexFrom = 0 
    ){

        this.#uuid = uuid();
        this.#width = width;
        this.#height = height;

        this.#parentElement = parentElement;
        this.zIndexFrom = zIndexFrom;

        this.root = null;
        this.#layers = null;

        this.#createRoot();
        this.#createCanvas(layerNames);
        this.#appendRoot();
    }

    getCtx(name){
        return this.#layers[name].getContext('2d');
    }

    getLayer(name){
        return this.#layers[name];
    }

    get ControlLayer(){
        if(this.#layers["control"]){
            return this.#layers["control"];
        }else{
            let keys = Object.keys(this.#layers);
            return this.#layers[keys[keys.length - 1]];
        }
    }

    get uuid(){
        return this.#uuid;
    }

    get width(){
        return this.#width;
    }

    get height(){
        return this.#height;
    }

    /**
     * @param {HTMLElement} newParent
     */
    set parentElement(newParent){
        // 然后重新设置父元素
        this.#parentElement = newParent;
        this.#appendRoot();
    }

    #createRoot(){
        this.root = document.createElement('div');
        this.root.id = "layer-"+this.uuid;

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
        if(this.#parentElement){
            this.#parentElement.appendChild(this.root);
        }else{
            document.body.appendChild(this.root);
        }
    }

    #createCanvas(layerNames = ["game", "text", "control"]){
        let canvasLayerNames = layerNames;
        let zIndex = this.zIndexFrom + 1;
        this.#layers = {};
        for(let i = 0; i < canvasLayerNames.length; i++){
            let name = canvasLayerNames[i];
            let layer = this.#createCanvasLayer(name, zIndex);
            this.#layers[name] = layer;
            this.root.appendChild(layer);
            zIndex++;
        }
    }

    #createCanvasLayer(name, z){
        let myCanvas = document.createElement('canvas');
        myCanvas.width = this.width;
        myCanvas.height = this.height;
        myCanvas.id = name + "-" + this.uuid;
        myCanvas.style.position = 'absolute';
        myCanvas.style.zIndex = z;

        return myCanvas;
    }
}

