// https://tile.openstreetmap.org/{z}/{x}/{y}.png

// request tile from server
export function requestTile(z, x, y) {
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

