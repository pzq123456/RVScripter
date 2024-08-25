function uuid(){
    return Math.random().toString(36).substring(2, 15) + 
            Math.random().toString(36).substring(2, 15);
}

function stringfyColor(color){
    if(color instanceof Array){
        return `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
    }
    return color;
}

function mixColor(color1, color2, ratio = 0.5){
    let c1 = parseColor(color1);
    let c2 = parseColor(color2);
    return [
        c1[0] * ratio + c2[0] * (1 - ratio),
        c1[1] * ratio + c2[1] * (1 - ratio),
        c1[2] * ratio + c2[2] * (1 - ratio)
    ];
}

function parseColor(color){
    if(color.startsWith("rgb")){
        return color.match(/\d+/g).map(Number);
    }else if(color.startsWith("#")){
        return [
            parseInt(color.slice(1, 3), 16),
            parseInt(color.slice(3, 5), 16),
            parseInt(color.slice(5, 7), 16)
        ];
    }else if(color.startsWith("hsl")){
        return color.match(/\d+/g).map(Number);
    }
    return color;
}

// 防抖函数
function debounce(fn, delay = 100) {
    let timer = null;
    return function() {
        clearTimeout(timer);
        timer = setTimeout(() => {
            fn.apply(this, arguments);
        }, delay);
    };
}

function transform(XY, matrix = [1, 0, 0, 1, 0, 0]){
    let [x, y] = XY;
    let [
        a, b, 
        c, d, 
        e, f
    ] = matrix;

    return [
        a * x + c * y + e,
        b * x + d * y + f
    ];
}

/**
 * 获取屏幕 DPI
 */
function getScreenDPI(){
    let div = document.createElement('div');
    div.style = 'width: 1in; height: 1in; position: absolute; left: -100%; top: -100%;';
    document.body.appendChild(div);
    let dpi = getComputedStyle(div).getPropertyValue('width');
    document.body.removeChild(div);
    return parseInt(dpi);
}

/**
 * This function is usefull when you have a nested array like this(like GeoJSON coordinates):
 * [[[x1,y1],[x2,y2]...]] do any operation on each element([x,y]) and put the result in place.
 */
function applyOperationInNestedArray(arr, operation) {
    return arr.map(element => {
        if (Array.isArray(element[0])) {
            return applyOperationInNestedArray(element, operation);
        } else if (element.length === 2 && !Array.isArray(element[0])) {
            return operation(element);
        } else {
            return element;
        }
    });
}

// 截流函数
function throttle(fn, delay = 100) {
    let timer = null;
    return function() {
        if (!timer) {
            timer = setTimeout(() => {
                fn.apply(this, arguments);
                timer = null;
            }, delay);
        }
    };
}
