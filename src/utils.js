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
 * This function is usefull when you have a nested array like this(eg. GeoJSON coordinates):
 * [[[x1,y1],[x2,y2]...]] do any operation on each element([x,y]) and return the result in place.
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

// 管道函数 将多个函数组合成一个函数
function pipeline(...operations) {
    return function(input) {
        return operations.reduce((acc, operation) => {
            return operation(acc);
        }, input);
    };
}

// // 截流函数
// function throttle(fn, delay = 100) {
//     let timer = null;
//     return function() {
//         if (!timer) {
//             timer = setTimeout(() => {
//                 fn.apply(this, arguments);
//                 timer = null;
//             }, delay);
//         }
//     };
// }

// @function throttle(fn: Function, time: Number, context: Object): Function
// Returns a function which executes function `fn` with the given scope `context`
// (so that the `this` keyword refers to `context` inside `fn`'s code). The function
// `fn` will be called no more than one time per given amount of `time`. The arguments
// received by the bound function will be any arguments passed when binding the
// function, followed by any arguments passed when invoking the bound function.
// Has an `L.throttle` shortcut.
/**
 * 节流函数，返回一个函数，该函数在给定的时间内最多执行一次
 * @param {Function} fn - 需要节流的函数
 * @param {Number} time - 间隔时间
 * @param {Object} context - 函数执行的上下文
 * @returns 
 */
function throttle(fn, time, context) {
	let lock, queuedArgs;

	function later() {
		// reset lock and call if queued
		lock = false;
		if (queuedArgs) {
			wrapperFn.apply(context, queuedArgs);
			queuedArgs = false;
		}
	}

	function wrapperFn(...args) {
		if (lock) {
			// called too soon, queue to call later
			queuedArgs = args;

		} else {
			// call and lock until later
			fn.apply(context, args); // .apply 就是指定函数执行的上下文和参数
			setTimeout(later, time);
			lock = true;
		}
	}

	return wrapperFn;
}

// 简单的防抖函数实现
function debounce(func, delay) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
}

function throttleAndDebounce(func, throttleLimit, debounceDelay) {
    let throttleTimeout;
    let debounceTimeout;
    let lastRan;

    return function(...args) {
        const context = this;

        if (!lastRan) {
            func.apply(context, args);
            lastRan = Date.now();
        } else {
            clearTimeout(debounceTimeout);
            debounceTimeout = setTimeout(() => {
                func.apply(context, args);
            }, debounceDelay);

            if (!throttleTimeout) {
                throttleTimeout = setTimeout(() => {
                    func.apply(context, args);
                    lastRan = Date.now();
                    throttleTimeout = null;
                }, throttleLimit);
            }
        }
    };
}