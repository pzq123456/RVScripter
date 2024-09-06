import { Canvas } from "./src/canvas.js";
import { VectorRenderer, RasterRenderer } from "./src/renderer.js";
import { ViewWindow } from "./src/viewWindow.js";

import { processGeoJSONData } from "./src/geoJSON.js";

import { Controler } from "./src/control.js";

const left = document.getElementById('left');

const canvasGroup = new Canvas(left,["raster","vector","text","control"]);

const vectorCanvas = canvasGroup.getLayer("vector");
const rasterCanvas = canvasGroup.getLayer("raster");

let zoomLevel = 5;
let viewCenter = [116,36];

const viewWindow = new ViewWindow(viewCenter, canvasGroup.width, canvasGroup.height, zoomLevel);
const renderer = new VectorRenderer(vectorCanvas, viewWindow);
const rasterRenderer = new RasterRenderer(rasterCanvas, viewWindow);
processGeoJSONData('./data/china.json').then(parsedData => {
    renderer.injectData(parsedData);
    renderer.update();
    rasterRenderer.update();
});

let controler = new Controler(canvasGroup, viewWindow, renderer, rasterRenderer);
controler.init(viewCenter, zoomLevel);