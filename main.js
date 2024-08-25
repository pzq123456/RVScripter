import { Canvas } from "./src/canvas.js";
import { Renderer } from "./src/renderer.js";
import { LatLongToPixelXY } from "./src/projection.js";

// import { test } from "./src/projection.js";

import { processGeoJSONData } from "./src/geoJSON.js";

const left = document.getElementById('left');
// const right = document.getElementById('right');

const canvasLayer = new Canvas(left,["a"]);

const canvas = canvasLayer.ControlLayer;


const renderer = new Renderer(canvas);

renderer.setFillColor('rgba(255, 0, 0, 0.3)');
renderer.setStrokeColor('green', 2);

function project([x,y],z = 3){
    return LatLongToPixelXY(y,x,z);
}

processGeoJSONData('./data/USA.json').then(parsedData => {
    renderer.render(parsedData, project);
});