import { LatLongToPixelXY, PixelXYToLatLong, GroundResolutionInDegrees } from "./projection.js";

export class ViewWindow{
    constructor(viewCenter, width = 1024, height = 1024, zoomLevel){
        this.width = width;
        this.height = height;
        this.zoom = zoomLevel;
        this.center = viewCenter;

        this.x = this.project(this.center)[0] - this.width / 2;
        this.y = this.project(this.center)[1] - this.height / 2;

        this.maxZoomLevel = 18;
    }

    update(){ // 重新计算视窗的位置
        this.x = this.project(this.center)[0] - this.width / 2;
        this.y = this.project(this.center)[1] - this.height / 2;
    }

    updateZ(zoomLevel){
        this.zoom = zoomLevel > this.maxZoomLevel ? this.maxZoomLevel : zoomLevel;
        this.update();
    }

    updateCenter(viewCenter){
        this.center = viewCenter;
        this.update();
    }

    updateXY(dx,dy){
        let dLat = dy * GroundResolutionInDegrees(this.center[0], this.zoom);
        let dLon = dx * GroundResolutionInDegrees(this.center[0], this.zoom);
        this.center = [this.center[0] - dLon, this.center[1] + dLat];
        this.update();
    }

    project([x,y], z = this.zoom){
        return LatLongToPixelXY(y,x,z);
    }

    unproject([x,y], z = this.zoom){
        return PixelXYToLatLong(x,y,z);
    }

    translate([x,y]){
        return [x - this.x, y - this.y];
    }

    untranslate([x,y]){
        return [x + this.x, y + this.y];
    }
}