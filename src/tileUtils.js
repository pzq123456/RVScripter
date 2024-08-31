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
    }

    push(z, x, y, value) {
        const key = `${z},${x},${y}`;
        if (!this.map.has(key)) {
            if (this.queue.length >= this.size) {
                const oldestKey = this.queue.shift();
                this.map.delete(oldestKey);
            }
            this.queue.push(key);
        }
        this.map.set(key, value);
    }

    get(z, x, y) {
        const key = `${z},${x},${y}`;
        return this.map.get(key);
    }

    has(z, x, y) {
        const key = `${z},${x},${y}`;
        return this.map.has(key);
    }
}

