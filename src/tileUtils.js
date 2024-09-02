// https://tile.openstreetmap.org/{z}/{x}/{y}.png

// request tile from server
export function requestTile(z, x, y) {
    return new Promise((resolve, reject) => {
        let img = new Image();
        img.src = `https://tile.openstreetmap.org/${z}/${x}/${y}.png`;
        // img.src = `https://tiles.stadiamaps.com/tiles/stamen_toner/${z}/${x}/${y}.png`; // 黑白地图
        // https://tile.tracestrack.com/en/{z}/{x}/{y}.png
        // img.src = `https://tile.tracestrack.com/en/${z}/${x}/${y}.png`; // 512*512

        img.onload = () => {
            resolve(img);
        }
        img.onerror = (e) => {
            reject(e);
        }
    })
}

// https://tiles.stadiamaps.com/tiles/stamen_toner/{z}/{x}/{y}.png



export class Bounded3DArray {
    constructor(size) {
        this.size = size;
        this.map = new Map();
        this.queue = [];
        this.priorityLevels = new Map(); // 用于存储每个缩放级别的优先级
    }

    // 默认 zoom 越小，优先级越高
    // 设置计算优先级地图的函数
    priorityFunction(zoom) {
        if (zoom < 3) {
            return 2;
        } else{
            return 1;
        }
    }

    // 设置缩放级别的优先级
    setPriorityForZoom(zoom, priority) {
        this.priorityLevels.set(zoom, priority);
    }

    push(z, x, y, value) {
        // 优先级计算

        // this.setPriorityForZoom(z, this.priorityFunction(z));

        const key = `${z},${x},${y}`;
        if (!this.map.has(key)) {
            if (this.queue.length >= this.size) {
                this.removeLowestPriority();
            }
            this.queue.push(key);
        }
        this.map.set(key, { value, priority: this.priorityLevels.get(z) || 0 });
        // // 优先级排序
        // this.queue.sort((a, b) => this.map.get(a).priority - this.map.get(b).priority);
        // 释放内存
        while (this.queue.length > this.size) {
            this.removeLowestPriority();
        }
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

