// https://tile.openstreetmap.org/{z}/{x}/{y}.png

// request tile from server
export function requestTile(z, x, y) {
    // if(z < 0 || x < 0 || y < 0 || z > 18 || x > Math.pow(2, z) - 1 || y > Math.pow(2, z) - 1){
    //     return Promise.reject("invalid tile");
    // }
    return new Promise((resolve, reject) => {
        let img = new Image();
        img.src = `https://tile.openstreetmap.org/${z}/${x}/${y}.png`;
        img.onload = () => {
            resolve(img);
        }
        img.onerror = (e) => {
            reject(e);
        }
    })
}



export class Bounded3DArray {
    constructor(size) {
        this.size = size;
        this.map = new Map();
        this.queue = [];
        this.priorityLevels = new Map(); // 用于存储每个缩放级别的优先级
    }

    // 设置缩放级别的优先级
    setPriorityForZoom(zoom, priority) {
        this.priorityLevels.set(zoom, priority);
    }

    push(z, x, y, value) {
        const key = `${z},${x},${y}`;
        if (!this.map.has(key)) {
            if (this.queue.length >= this.size) {
                this.removeLowestPriority();
            }
            this.queue.push(key);
        }
        this.map.set(key, { value, priority: this.priorityLevels.get(z) || 0 });
    }

    // 批量插入方法
    pushBatch(tiles) {
        for (const [z, x, y, value] of tiles) {
            this.push(z, x, y, value);
        }
    }

    get(z, x, y) {
        const key = `${z},${x},${y}`;
        const item = this.map.get(key);
        return item ? item.value : undefined;
    }

    has(z, x, y) {
        const key = `${z},${x},${y}`;
        return this.map.has(key);
    }

    // 移除优先级最低的瓦片
    removeLowestPriority() {
        let lowestPriorityKey = this.queue[0];
        let lowestPriority = this.map.get(lowestPriorityKey).priority;

        for (let i = 1; i < this.queue.length; i++) {
            const key = this.queue[i];
            const priority = this.map.get(key).priority;
            if (priority < lowestPriority) {
                lowestPriorityKey = key;
                lowestPriority = priority;
            }
        }

        this.queue.splice(this.queue.indexOf(lowestPriorityKey), 1);
        this.map.delete(lowestPriorityKey);
    }

    // 清空缓存
    clear() {
        this.map.clear();
        this.queue = [];
    }

    // 调整缓存大小
    resize(newSize) {
        this.size = newSize;
        while (this.queue.length > this.size) {
            this.removeLowestPriority();
        }
    }
}

export class TileManager {
    constructor(viewWindow, tileStack, drawTile) {
        this.viewWindow = viewWindow;
        this.tileStack = tileStack;
        this.maxConcurrentRequests = 4; // 最大并发请求数
        this.retryDelay = 1000; // 重试延迟（毫秒）
        this.maxRetries = 3; // 最大重试次数
        this.drawTile = drawTile;
    }

    async drawTiles(tileGrids) {
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
                const distance = Math.sqrt(Math.pow(i - centerX, 2) + Math.pow(j - centerY, 2));
                tiles.push({ x: i, y: j, distance });
            }
        }
        return tiles.sort((a, b) => a.distance - b.distance);
    }

    async processTileBatch(batch) {
        const promises = batch.map(tile => this.processTile(tile.x, tile.y));
        await Promise.all(promises);
    }

    async processTile(x, y) {
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

}

