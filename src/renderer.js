import { Bounded3DArray, requestTile } from './tileUtils.js';

class Renderer{ // 渲染器 基类
    constructor(canvas, viewWindow) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;
        this.viewWindow = viewWindow;
        this.TILE_SIZE = viewWindow.TILE_SIZE;

        this.previousZoomLevel = viewWindow.zoom;
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

    setScale(zoomLevel) {
        // 计算 delta
        const delta = zoomLevel - this.previousZoomLevel;
        
        // 计算新的缩放比例
        const scale = Math.pow(2, delta);

        // 更新画布的缩放比例
        this.ctx.restore(); // 恢复之前的状态
        this.ctx.save(); // 保存当前状态
        this.ctx.transform(scale, 0, 0, scale, 0, 0); // 缩放画布

        // 更新 previousZoomLevel
        this.previousZoomLevel = zoomLevel;

        console.log(`Zoom level: ${zoomLevel}, Scale: ${scale}`);
    }

    drawSquare([x, y], size = this.viewWindow.TILE_SIZE) {
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

        this.setFillColor('rgba(255, 0, 0, 0.1)');
        this.setStrokeColor('black', 1);
        this.drawPolygons(screenCoor.polygons);

        this.setFillColor('orange');
        this.drawMultiPoints(screenCoor.multiPoints);

        this.setStrokeColor('purple', 2);
        this.drawMultiLines(screenCoor.multiLines);

        this.setFillColor('rgba(0, 255, 0, 0.1)');
        this.setStrokeColor('brown', 1);
        this.drawMultiPolygons(screenCoor.multiPolygons);

        drawInfoBar(this.ctx, this.viewWindow, this.width, this.height); // 信息条

        // // 文字底色
        // this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        // this.ctx.fillRect(this.viewWindow.x, this.viewWindow.y + this.height - 40, this.width, 40);

        // this.setTextStyle();
        // this.ctx.fillText(`Center: ${this.viewWindow.center}, Zoom: ${this.viewWindow.zoom},Scale: 1:${this.viewWindow.getMapScale()}, OpenStreetMap`,this.viewWindow.x, this.viewWindow.y + this.height - 10);

        // this.drawTileGrids(this.viewWindow.getTileGrids(this.viewWindow.zoom)); // debug
    }

}

export class RasterRenderer extends Renderer{ // 栅格渲染器
    constructor(canvas, viewWindow) {
        super(canvas, viewWindow);
        this.tileStack = new Bounded3DArray(256);

        this.maxConcurrentRequests = 4; // 最大并发请求数
        this.retryDelay = 1000; // 重试延迟（毫秒）
        this.maxRetries = 2; // 最大重试次数
    }

    // draw from top left
    drawTile([x, y], img, scale = 1) {
        this.ctx.drawImage(img, x * this.TILE_SIZE, y * this.TILE_SIZE, this.TILE_SIZE * scale, this.TILE_SIZE * scale);
    }

    // draw from bottom right
    drawTile2([x, y], img, scale = 1) {
        this.ctx.drawImage(img, x * this.TILE_SIZE - this.TILE_SIZE * (scale - 1), y * this.TILE_SIZE - this.TILE_SIZE * (scale - 1), this.TILE_SIZE * scale, this.TILE_SIZE * scale);
    }



    async drawTiles() {
        let tileGrids = this.viewWindow.getTileGrids();
        const { widthParts, heightParts, startX, startY } = tileGrids;
        const centerX = startX + Math.floor(widthParts / 2);
        const centerY = startY + Math.floor(heightParts / 2);

        // 根据到中心的距离对瓦片进行排序
        const sortedTiles = this.sortTilesByPriority(startX, startY, widthParts, heightParts, centerX, centerY);

        // 批量处理瓦片
        const batchSize = 16; // 每批处理的瓦片数
        for (let i = 0; i < sortedTiles.length; i += batchSize) {
            const batch = sortedTiles.slice(i, i + batchSize);
            await this.processTileBatch(batch);
        }
    }
    
    sortTilesByPriority(startX, startY, widthParts, heightParts, centerX, centerY) {
        const tiles = [];
        for (let i = startX; i < startX + widthParts; i++) {
            for (let j = startY; j < startY + heightParts; j++) {
                // 使用Chebyshev距离来实现矩形扩展
                const distance = Math.max(Math.abs(i - centerX), Math.abs(j - centerY));
                tiles.push({ x: i, y: j, distance });
            }
        }
        // 根据距离从小到大排序
        return tiles.sort((a, b) => a.distance - b.distance);
    }
    
    async processTileBatch(batch) {
        const promises = batch.map(tile => this.processTile(tile.x, tile.y));
        await Promise.all(promises);
    }

    async processTile(x, y) {
        let parentTileTL = this.tileStack.getParentTileIfTopLeft(this.viewWindow.zoom, x, y);
        let parentTileBR = this.tileStack.getParentTileIfBottomRight(this.viewWindow.zoom, x, y);

        if(parentTileTL){
            this.drawTile([x, y], parentTileTL,2);
        }

        if(parentTileBR){
            this.drawTile2([x, y], parentTileBR,2);
        }

        if (this.tileStack.has(this.viewWindow.zoom, x, y)) {
            const img = this.tileStack.get(this.viewWindow.zoom, x, y);
            this.drawTile([x, y], img);
        } else {
            await this.requestAndDrawTile(x, y);
        }
    }

    async requestAndDrawTile(x, y, retries = 0) {
        try {
            const img = await this.requestTileWithRetry(this.viewWindow.zoom, x, y);
            this.tileStack.push(this.viewWindow.zoom, x, y, img);
            this.drawTile([x, y], img);
        } catch (error) {
            console.error(`Failed to load tile at zoom ${this.viewWindow.zoom}, x: ${x}, y: ${y}`, error);
            if (retries < this.maxRetries) {
                setTimeout(() => this.requestAndDrawTile(x, y, retries + 1), this.retryDelay);
            }
        }
    }

    async requestTileWithRetry(zoom, x, y, retries = 0) {
        try {
            return await requestTile(zoom, x, y);
        } catch (error) {
            if (retries < this.maxRetries) {
                await new Promise(resolve => setTimeout(resolve, this.retryDelay));
                return this.requestTileWithRetry(zoom, x, y, retries + 1);
            }
            throw error;
        }
    }

    render() {
        this.drawTiles();
    }
}

function drawInfoBar(ctx, viewWindow, width, height, options = {}) {
    const {
        fontSize = '16px',                // 默认字体大小
        textColor = '#000',               // 默认文字颜色
        backgroundColor = 'rgba(255, 255, 255, 0.3)', // 默认底色
        dataSource = 'OpenStreetMap',     // 默认数据源
        align = 'right'                    // 默认左对齐，可以设为 'left' 或 'right'
    } = options;

    // 计算字体大小
    let size = parseInt(fontSize.replace('px', ''), 10);

    // 设置字体样式
    ctx.font = `${fontSize} Arial`;

    // 构建显示的文本内容
    const infoText = `Center: ${viewWindow.center}, Zoom: ${viewWindow.zoom}, Scale: 1:${viewWindow.getMapScale()}, data source: ${dataSource}`;

    // 测量文本宽度
    const textWidth = ctx.measureText(infoText).width;

    // 根据对齐方式计算文本起点和背景的宽度
    let textX = viewWindow.x;
    if (align === 'right') {
        textX = viewWindow.x + width;
    }

    // 设置文字底色，仅限于文字宽度区域
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(textX - textWidth, viewWindow.y + height - size, textWidth, size);

    // 设置文字颜色
    ctx.fillStyle = textColor;

    // 设置文字对齐方式
    ctx.textAlign = align;

    // 绘制文字信息
    ctx.fillText(
        infoText,
        textX,
        viewWindow.y + height
    );
}
