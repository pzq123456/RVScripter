export function init(selector) {
    const parentElement = ensureRelativePosition(selector); // 确保父元素的 position 为 relative
    const domLayer = createDomLayer(parentElement); // 创建一个带有自定义元素的容器
    const canvas = createCanvas(parentElement); // 创建一个与父元素大小相同的 canvas 元素
    const testDom = createTestDom();
    addDom(domLayer, testDom, 0, 0);
    return {
        "canvas": canvas,
        "domLayer": domLayer,
    }
}

function ensureRelativePosition(selector){
    const parentElement = queryDom(selector);

    if (!parentElement) {
        throw new Error('Invalid selector. No element matches selector.');
    }

    // 查看父元素的样式 position 是否为 static 若是则修改为 relative
    const position = window.getComputedStyle(parentElement).position;
    if (position === 'static') {
        parentElement.style.position = 'relative';
    }

    return parentElement;
}

/**
 * 该方法接受 id、dom 对象或者 class，并返回匹配的 DOM 元素
 * @param {string|HTMLElement} selector - 选择器，可以是 id、dom 对象或 class
 * @returns {HTMLElement|null} - 匹配的 DOM 元素，如果未找到则返回 null
 */
function queryDom(selector) {
    if(typeof selector == 'string'){
        const dom = document.querySelector(selector);
        if(dom){
            return dom;
        }else{
            throw new Error('Invalid selector. No element matches selector.');
        }        
    }else if(selector instanceof HTMLElement){
        return selector;
    }else{
        throw new Error('Invalid selector. No element matches selector.');
    }
}

/**
 * 在指定的父元素中添加一个与父元素大小相同的 canvas 元素，并将其置于父元素下层。
 * @param {string|HTMLElement} selector - 父元素的选择器或实例
 * @returns {HTMLCanvasElement} - 添加的 canvas 元素
 * @throws {Error} - 如果选择器无效或未找到匹配的父元素，则抛出错误
 */
function createCanvas(selector) {
    const parentElement = queryDom(selector);

    if (!parentElement) {
        throw new Error('Invalid selector. No element matches selector.');
    }

    const canvas = document.createElement('canvas');
    canvas.width = parentElement.clientWidth;
    canvas.height = parentElement.clientHeight;
    canvas.style.position = 'absolute';
    canvas.style.left = '0';
    canvas.style.top = '0';
    canvas.style.zIndex = '-1';
    parentElement.appendChild(canvas);

    return canvas;
}

/**
 * 在指定的父元素中添加一个带有自定义元素的容器，可以指定自定义元素的位置。
 * @param {string|HTMLElement} selector - 父元素的选择器或实例
 * @param {number} customElementLeft - 自定义元素左边距
 * @param {number} customElementTop - 自定义元素上边距
 * @returns {HTMLElement} - 添加的容器元素
 * @throws {Error} - 如果选择器无效或未找到匹配的父元素，则抛出错误
 */
function createDomLayer(selector) {
    const parentElement = queryDom(selector);

    if (!parentElement) {
        throw new Error('Invalid selector. No element matches selector.');
    }

    const container = document.createElement('div');
    container.style.position = 'relative';
    container.style.width = '100%';
    container.style.height = '100%';
    // 添加 id
    const id = `domlayer-${Date.now()}`;
    container.id = id;
    parentElement.appendChild(container);

    return container;
}

export function addDom(selector, dom, left, top){
    const parentElement = queryDom(selector);
    const container = document.getElementById(parentElement.id);
    dom.style.position = 'absolute';
    dom.style.left = `${left}px`;
    dom.style.top = `${top}px`;
    container.appendChild(dom);
}


function createTestDom(){
    const testDom = document.createElement('div');
    testDom.style.width = '100px';
    testDom.style.height = '100px';
    testDom.style.backgroundColor = 'red';
    testDom.id = 'testDom';
    return testDom;
}