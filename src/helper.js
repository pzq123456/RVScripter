function createButton(
    { name = 'Button', 
        action =  () => console.log('Button clicked'), 
        style = {} 
    } = {}
) {
    const button = document.createElement('button');
    button.textContent = name;
    button.onclick = action;

    // 应用自定义样式
    if (style) {
        Object.assign(button.style, style);
    }

    return button;
}

/**
 * 创建工具栏
 * @param {Array} toolbarConfig - 工具栏配置数组
 * @param {HTMLElement} parentElement - 父元素，工具栏将被附加到此元素中
 * @returns {HTMLElement} - 工具栏容器元素
 */
export function createToolbar(toolbarConfig, parentElement) {
    // 创建工具栏容器
    const toolbar = document.createElement('div');
    toolbar.style.display = 'flex'; // 设置工具栏为 flex 布局，可以根据需要调整

    // 遍历工具栏配置数组
    toolbarConfig.forEach(config => {
        // 创建按钮并添加到工具栏容器中
        const button = createButton(config);
        toolbar.appendChild(button);
    });

    // 将工具栏容器附加到父元素中
    parentElement.appendChild(toolbar);

    return toolbar;
}
