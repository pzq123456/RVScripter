import { LatLongToPixelXY, PixelXYToLatLong, GroundResolutionInDegrees} from "./projection.js";

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

    getGeobbox(){
        let [x1,y1] = this.unproject([this.x, this.y]);
        let [x2,y2] = this.unproject([this.x + this.width, this.y + this.height]);
        return [x1,y1,x2,y2];
    }

    getbbox(){
        return [-this.x, -this.y, -this.x + this.width, -this.y + this.height];
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
        this.x -= dx;
        this.y -= dy;

        const resolution = GroundResolutionInDegrees(this.center[1], this.zoom);
        let dLon = dx * resolution;
        let dLat = dy * resolution;
        this.center = [this.center[0] - dLon, this.center[1] + dLat];
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