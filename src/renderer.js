export class Renderer {
    constructor(canvas, viewWindow) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;
        this.currentFillColor = null;
        this.currentStrokeColor = null;
        this.currentLineWidth = null;
        this.screenCache = new Map();
        this.data = null;
        this.viewWindow = viewWindow;
    }

    injectData(data) {
        this.data = data;
        this.ctx.font = '40px serif';
    }

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }

    drawBbox(bbox) {
        const [x1, y1, x2, y2] = bbox;
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.lineTo(x1, y2);
        this.ctx.closePath();
        this.ctx.stroke();
    }

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

    operate(parsedData, projection) {
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
                const screenCoords = applyOperationInNestedArray(coordinates, projection);
                screenCoor[key].push({coordinates: screenCoords});
            });
        });

        return screenCoor;
    }

    update(zoomLevel, projct, translate) {
        let screenCoor = this.screenCache.get(zoomLevel); // cache

        if (!screenCoor) {
            screenCoor = this.operate(this.data, projct); // Rasterize
            this.screenCache.set(zoomLevel, screenCoor);
        }

        screenCoor = this.operate(screenCoor, translate); // Translate

        this.render(screenCoor);
    }

    render(screenCoor) {
        this.clearCanvas();
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

        this.setFillColor('yellow');
        this.setStrokeColor('brown', 1);
        this.drawMultiPolygons(screenCoor.multiPolygons);

        // 绘制视窗
        // const [x1, y1, x2, y2] = this.viewWindow.getbbox();
        this.setStrokeColor('black', 2);
        // this.drawBbox([x1, y1, x2, y2]);
        // in the center of bbox text the viewCenter and zoomlevel
        this.ctx.fillText(`Center: ${this.viewWindow.center}, Zoom: ${this.viewWindow.zoom}`,0, 40);
    }
}
