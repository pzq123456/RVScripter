// // 测试 highlightjs 引用是否成功
// console.log(hljs);

const myConsoleDiv = document.getElementById('console-output');
// 转发 console.log() 等方法 用于直接在页面上显示
const consoleTypes = ['log', 'warn', 'error', 'info', 'debug'];
consoleTypes.forEach(function (type) {
    let oldMethod = console[type];
    console[type] = function () {
        let message = Array.prototype.slice.apply(arguments).join(' ');
        oldMethod.apply(console, arguments);
        CustomLogFunction(message, type, myConsoleDiv);
    }
});

// 处理错误
window.onerror = function (message, source, lineno, colno, error) {
    console.error(message, source, lineno, colno, error);
    // CustomLogFunction(message, 'error', myConsoleDiv);
    return true;
};

// 转发 iframe 中的 console.log() 等方法
const iframe = document.getElementById('output');
const iframeWindow = iframe.contentWindow;
const iframeConsole = iframeWindow.console;
consoleTypes.forEach(function (type) {
    let oldMethod = iframeConsole[type];
    iframeConsole[type] = function () {
        let message = Array.prototype.slice.apply(arguments).join(' ');
        oldMethod.apply(iframeConsole, arguments);
        CustomLogFunction(message, type, myConsoleDiv);
    }
});


// 自定义的日志函数
function CustomLogFunction(message, type, dom) {
    // 获取DOM元素
    let consoleOutput = dom;
    // 创建一个新的DOM元素，显示收集到的信息
    let logEntry = document.createElement('p');
    logEntry.textContent = message;
    logEntry.style = logStyles[type];
    // 将新元素添加到DOM中
    consoleOutput.appendChild(logEntry);
}

// style for each log type
const logStyles = {
    log: 'color: #fff',
    warn: 'color: #ff0',
    error: 'color: #f00',
    info: 'color: #0f0',
    debug: 'color: #1ff'
};

const runButton = document.getElementById('run');
const clearButton = document.getElementById('clear');
const htmlCode = document.getElementById('html-code');
const cssCode = document.getElementById('css-code');
const jsCode = document.getElementById('js-code');
const outputFrame = document.getElementById('output');

runButton.addEventListener('click', function () {
    try {
        // 获取文本框中的代码
        const htmlContent = htmlCode.value;
        const cssContent = cssCode.value;
        const jsContent = jsCode.innerText;

        // 在 iframe 中运行 HTML、CSS、JS
        const outputDocument = outputFrame.contentDocument;
        const head = outputDocument.querySelector('head');
        const body = outputDocument.querySelector('body');

        // Clear existing content
        head.innerHTML = '';
        body.innerHTML = '';

        // Set new content
        const styleElement = document.createElement('style');
        styleElement.innerHTML = cssContent;
        head.appendChild(styleElement);

        body.innerHTML = htmlContent;

        // Execute JavaScript code
        const scriptElement = document.createElement('script');
        scriptElement.innerHTML = `
            try {
                ${jsContent}
            } catch (error) {
                console.error('JavaScript error:', error.message);
            }
        `;
        body.appendChild(scriptElement);
    } catch (error) {
        console.error('An error occurred:', error.message);
        CustomLogFunction(error.message, 'error', myConsoleDiv);
    }
});



clearButton.addEventListener('click', function () {
    // 清空文本框和输出区域
    htmlCode.value = '';
    cssCode.value = '';
    jsCode.value = '';
    outputFrame.contentDocument.body.innerHTML = '';
});