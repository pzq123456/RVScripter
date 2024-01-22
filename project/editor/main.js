// 以下代码是将 console.log() 等方法的输出转发到页面上的代码
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

// style for each log type
const logStyles = {
    log: 'color: #fff',
    warn: 'color: #ff0',
    error: 'color: #f00',
    info: 'color: #0f0',
    debug: 'color: #1ff'
};

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

// console 转发 end

// 初始化 Monaco Editor
require.config({
    paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.27.0/min/vs' }
});

require(['vs/editor/editor.main'], function () {
    const runButton = document.getElementById('run');
    const clearButton = document.getElementById('clear');
    const jsCode = document.getElementById('js-code');
    const jsEditor = monaco.editor.create(jsCode, {
        value: `const  L = window.L;
const mymap = window.mymap;
// Add a marker
var marker = L.marker([51.505, -0.09]).addTo(mymap);
// Add a popup to the marker
marker.bindPopup("<b>Hello World!</b><br>This is a Leaflet demo.").openPopup();`,
        language: 'javascript',
        theme: 'vs-dark',
        automaticLayout: true,
        minimap: { enabled: false }
    });

    // 监听运行按钮的点击事件
    runButton.addEventListener('click', function () {
        // 获取文本框中的内容
        const jsContent = jsEditor.getValue();
        // 在当前页面中执行 JavaScript 代码
        try {
            // 使用 Function 构造函数执行代码
            const executeCode = new Function(jsContent);
            executeCode();
        } catch (error) {
            console.error('Error executing code:', error);
            CustomLogFunction(error.message, 'error', myConsoleDiv);
        }
    });

    // 监听清空按钮的点击事件
    clearButton.addEventListener('click', function () {
        jsEditor.setValue('');
    });
});

var mymap = L.map('map').setView([51.505, -0.09], 13);
// mymap 绑定到 window 对象上，方便在控制台中调试
window.mymap = mymap;
window.L = L;
// Add a tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(mymap);
