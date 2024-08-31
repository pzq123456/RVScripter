import { Bounded3DArray, requestTile } from './tileUtils.js';

class Renderer{ // 渲染器 基类
    constructor(canvas, viewWindow) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;
        this.viewWindow = viewWindow;
    }

    clearCanvas(x = 0, y = 0) {
        this.ctx.clearRect(x, y, this.width, this.height);
    }

    setTranslate([x, y]) { // 设置平移
        this.ctx.restore();
        this.ctx.save();
        this.ctx.translate(-x, -y);
        this.clearCanvas(x,y);
    }

    update() {
        this.setTranslate(this.viewWindow.getXY());
        this.render();
    }

    render() {
        // 渲染函数
        console.log("Rendering...");
    }
}

export class VectorRenderer extends Renderer{ // 矢量渲染器
    constructor(canvas, viewWindow) {
        super(canvas, viewWindow);
        this.screenCache = new Map(); // 屏幕坐标缓存
        this.data = null;
        this.maxCacheSize = 5; // 缓存的最大大小 基于最近最少使用（LRU）的缓存策略
    }

    injectData(data) {
        this.data = data;
    }

    // updateData(newData) {
    //     // 遍历 newData，更新各个分类中的数据
    //     for (const [key, items] of Object.entries(newData)) {
    //         if (this.data[key]) {
    //             // 避免重复数据的添加或处理
    //             const existingDataSet = new Set(this.data[key].map(JSON.stringify));
    //             const uniqueItems = items.filter(item => !existingDataSet.has(JSON.stringify(item)));
                
    //             // 批量添加新数据
    //             this.data[key].push(...uniqueItems);
    //         } else {
    //             console.warn(`Unrecognized data category: ${key}`);
    //         }
    //     }
    // }

    setFillColor(color) {
        if (this.currentFillColor !== color) {
            this.ctx.fillStyle = color;
            this.currentFillColor = color;
        }
    }

    setStrokeColor(color, width = 1) {
        if (this.currentStrokeColor !== color || this.currentLineWidth !== width) {
            this.ctx.strokeStyle = color;
            this.ctx.lineWidth = width;
            this.currentStrokeColor = color;
            this.currentLineWidth = width;
        }
    }

    setTextStyle(font = '40px serif', color = 'black') {
        this.ctx.font = font;
        this.ctx.fillStyle = color;
    }

    drawPoints(points, radius = 5) {
        this.ctx.beginPath();
        points.forEach(({ coordinates }) => {
            const [x, y] = coordinates;
            this.ctx.moveTo(x + radius, y);
            this.ctx.arc(x, y, radius, 0, 2 * Math.PI);
        });
        this.ctx.fill();
    }

    drawLines(lines) {
        this.ctx.beginPath();
        lines.forEach(({ coordinates }) => {
            this.ctx.moveTo(coordinates[0][0], coordinates[0][1]);
            for (let i = 1; i < coordinates.length; i++) {
                this.ctx.lineTo(coordinates[i][0], coordinates[i][1]);
            }
        });
        this.ctx.stroke();
    }

    drawSquare([x, y], size = 256) {
        let realX = x * size;
        let realY = y * size;

        // draw rect 
        this.ctx.beginPath();
        this.ctx.moveTo(realX, realY);
        this.ctx.lineTo(realX + size, realY);
        this.ctx.lineTo(realX + size, realY + size);
        this.ctx.lineTo(realX, realY + size);
        this.ctx.closePath();
        this.ctx.stroke();

        // draw text in the center of rect
        this.ctx.fillText(`(${x},${y})`, realX + size / 2, realY + size / 2);
    }

    // debug function
    drawTileGrids(tileGrids){
        const { widthParts, heightParts, startX, startY } = tileGrids;

        // draw square
        for(let i = startX; i < startX + widthParts; i++){
            for(let j = startY; j < startY + heightParts; j++){
                this.drawSquare([i, j]);
            }
        }
    }

    drawPolygons(polygons) {
        this.ctx.beginPath();
        polygons.forEach(({ coordinates }) => {
            const outerRing = coordinates[0];
            this.ctx.moveTo(outerRing[0][0], outerRing[0][1]);
            for (let i = 1; i < outerRing.length; i++) {
                this.ctx.lineTo(outerRing[i][0], outerRing[i][1]);
            }
            this.ctx.closePath();
        });
        this.ctx.fill();
        this.ctx.stroke();
    }

    drawMultiPoints(multiPoints, radius = 5) {
        this.ctx.beginPath();
        multiPoints.forEach(({ coordinates }) => {
            coordinates.forEach(([x, y]) => {
                this.ctx.moveTo(x + radius, y);
                this.ctx.arc(x, y, radius, 0, 2 * Math.PI);
            });
        });
        this.ctx.fill();
    }

    drawMultiLines(multiLines) {
        this.ctx.beginPath();
        multiLines.forEach(({ coordinates }) => {
            coordinates.forEach(line => {
                this.ctx.moveTo(line[0][0], line[0][1]);
                for (let i = 1; i < line.length; i++) {
                    this.ctx.lineTo(line[i][0], line[i][1]);
                }
            });
        });
        this.ctx.stroke();
    }

    drawMultiPolygons(multiPolygons) {
        this.ctx.beginPath();
        multiPolygons.forEach(({ coordinates }) => {
            coordinates.forEach(polygon => {
                const outerRing = polygon[0];
                this.ctx.moveTo(outerRing[0][0], outerRing[0][1]);
                for (let i = 1; i < outerRing.length; i++) {
                    this.ctx.lineTo(outerRing[i][0], outerRing[i][1]);
                }
                this.ctx.closePath();
            });
        });
        this.ctx.fill();
        this.ctx.stroke();
    }

    operate(parsedData, fn) {
        // 将地理坐标转换为屏幕坐标
        let screenCoor = {
            points: [],
            lines: [],
            polygons: [],
            multiPoints: [],
            multiLines: [],
            multiPolygons: []
        };

        // 并行操作
        Object.keys(parsedData).forEach(key => {
            parsedData[key].forEach(({coordinates}) => {
                // arr 判空 若空则跳过
                if (!coordinates.length) {
                    return;
                }
                const screenCoords = applyOperationInNestedArray(coordinates, fn);
                screenCoor[key].push({coordinates: screenCoords});
            });
        });

        return screenCoor;
    }

    update() {
        let zoomLevel = this.viewWindow.zoom;
        let projct = this.viewWindow.project.bind(this.viewWindow);

        let screenCoor = this.screenCache.get(zoomLevel); // cache

        if (!screenCoor) {
            screenCoor = this.operate(this.data, projct); // Rasterize
            this.screenCache.set(zoomLevel, screenCoor);
        }

        this.setTranslate(this.viewWindow.getXY());
        this.render(screenCoor);
        // console.log(this.screenCache.size);
        this.ensureCacheSize();
    }

    // 保持缓存大小不超过最大值
    ensureCacheSize() {
        while (this.screenCache.size > this.maxCacheSize) {
            // 删除最早插入的项
            const oldestKey = this.screenCache.keys().next().value;
            this.screenCache.delete(oldestKey);
        }
    }

    render(screenCoor) {

        // 绘制
        this.setFillColor('red');
        this.drawPoints(screenCoor.points);

        this.setStrokeColor('blue', 2);
        this.drawLines(screenCoor.lines);

        this.setFillColor('green');
        this.setStrokeColor('black', 1);
        this.drawPolygons(screenCoor.polygons);

        this.setFillColor('orange');
        this.drawMultiPoints(screenCoor.multiPoints);

        this.setStrokeColor('purple', 2);
        this.drawMultiLines(screenCoor.multiLines);

        this.setFillColor('rgba(0, 255, 0, 0.3)');
        this.setStrokeColor('brown', 1);
        this.drawMultiPolygons(screenCoor.multiPolygons);

        this.setFillColor('green');
        this.setTextStyle();
        this.ctx.fillText(`Center: ${this.viewWindow.center}, Zoom: ${this.viewWindow.zoom},Offset: ${this.viewWindow.getXY()} `,this.viewWindow.x, this.viewWindow.y + 40);

        // this.drawTileGrids(this.viewWindow.getTileGrids()); // debug
    }

}

export class RasterRenderer extends Renderer{ // 栅格渲染器
    constructor(canvas, viewWindow) {
        super(canvas, viewWindow);
        this.stackSize = Math.min(Math.pow(2, this.viewWindow.maxZoomLevel) * 2, 256);
        this.tileStack = new Bounded3DArray(this.stackSize);
    }

    drawTile([x, y], img) {
        let realX = x * 256;
        let realY = y * 256;
        img.width = 256;
        img.height = 256;
        this.ctx.drawImage(img, realX, realY);
    }

    drawTiles(tileGrids){
        const { widthParts, heightParts, startX, startY } = tileGrids;
        // draw square
        for(let i = startX; i < startX + widthParts; i++){
            for(let j = startY; j < startY + heightParts; j++){
                // 首先检查是否已经缓存了该瓦片
                if(this.tileStack.has(this.viewWindow.zoom, i, j)){
                    let img = this.tileStack.get(this.viewWindow.zoom, i, j);
                    this.drawTile([i, j], img);
                }else{
                    requestTile(this.viewWindow.zoom, i, j).then((img) => {
                        this.tileStack.push(this.viewWindow.zoom, i, j, img);
                        this.drawTile([i, j], img);
                    }).catch(e => {
                        console.error(e);
                    });
                }
                
            }
        }
    }

    render() {
        this.drawTiles(this.viewWindow.getTileGrids());
    }
}