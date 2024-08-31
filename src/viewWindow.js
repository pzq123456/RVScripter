import { LatLongToPixelXY, PixelXYToLatLong, GroundResolutionInDegrees, ClipbyBoundaries} from "./projection.js";

export class ViewWindow{
    constructor(viewCenter, width = 1024, height = 1024, zoomLevel){
        this.width = width;
        this.height = height;
        this.zoom = zoomLevel;
        this.center = viewCenter; // [longitude, latitute] [经度，纬度]

        this.update();
        this.maxZoomLevel = 18;
    }

    getXY(){
        return [this.x, this.y];
    }

    getTileGrids(){
        const size = 256 * Math.pow(2, this.zoom);

        let interRect = getBboxIntersection([0, 0, size, size], this.getbbox());

        // let validWidth = Math.ceil(Math.min(this.width + this.x, size) / 256);
        // let validHeight = Math.ceil(Math.min(this.height + this.y, size) / 256);

        let validWidth = Math.ceil((interRect[2] - interRect[0]) / 256);
        let validHeight = Math.ceil((interRect[3] - interRect[1]) / 256);

        let startX = Math.floor(interRect[0] / 256);
        let startY = Math.floor(interRect[1] / 256);

        return {
            widthParts: validWidth, // 应当绘制的瓦片在横向上的个数
            heightParts: validHeight, // 应当绘制的瓦片在纵向上的个数
            startX: startX, // 起始瓦片的横向编码
            startY: startY, // 起始瓦片的纵向编码
        }
    }

    getGeobbox(){
        let [longitude1,latitute1] = this.unproject([this.x, this.y]);
        let [longitude2,latitute2] = this.unproject([this.x + this.width, this.y + this.height]);
        return [longitude1, latitute1, longitude2, latitute2];
    }

    getbbox(){
        return [this.x, this.y, this.x + this.width, this.y + this.height];
    }

    update(){ // 重新计算视窗的位置
        // this.x = Math.floor(this.project(this.center)[0]) - this.width / 2;
        // this.y = Math.floor(this.project(this.center)[1]) - this.height / 2;
        [this.x, this.y] = this.project(this.center).map((v, i) => Math.floor(v - (i === 0 ? this.width : this.height) / 2));
    }

    updateZ(zoomLevel){
        this.zoom = zoomLevel < 0 ? 0 : zoomLevel > this.maxZoomLevel ? this.maxZoomLevel : zoomLevel;
        this.update();
    }

    setCenter(viewCenter){
        this.center = viewCenter;
        this.update();
    }

    updateXY(dx,dy){
        this.x += dx;
        this.y += dy;

        const resolution = GroundResolutionInDegrees(this.center[1], this.zoom);
        // zoomlevel 相关的衰减系数 zoomlevel 越小，dx,dy 对应的经纬度变化越小
        let dLon = dx * resolution;
        let dLat = dy * resolution;
        this.center = ClipbyBoundaries([this.center[1] - dLat, this.center[0] + dLon]).reverse();
    }

    project([longitude, latitute], z = this.zoom){
        return LatLongToPixelXY(latitute, longitude, z);
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

function getBboxIntersection(rect1, rect2) {
    const [x1, y1, x2, y2] = rect1;
    const [x3, y3, x4, y4] = rect2;
    
    // Calculate the coordinates of the intersection rectangle
    const inter_x1 = Math.max(x1, x3);
    const inter_y1 = Math.max(y1, y3);
    const inter_x2 = Math.min(x2, x4);
    const inter_y2 = Math.min(y2, y4);
    
    // Check if the intersection is valid
    if (inter_x1 < inter_x2 && inter_y1 < inter_y2) {
        return [inter_x1, inter_y1, inter_x2, inter_y2];
    } else {
        return [0, 0, 0, 0];
    }
}