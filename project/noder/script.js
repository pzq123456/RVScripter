// 获取拖拽元素
const draggableElement = document.getElementById('myDiv');

// 初始化拖拽
draggableElement.draggable = true;

// 拖拽开始时的处理函数
draggableElement.addEventListener('dragstart', (event) => {
  event.dataTransfer.setData('text/plain', 'Drag me!'); // 设置拖拽数据
  draggableElement.style.backgroundColor = '#2980b9'; // 拖拽时改变背景颜色
});

// 拖拽结束时的处理函数
draggableElement.addEventListener('dragend', () => {
  draggableElement.style.backgroundColor = '#3498db'; // 恢复原始背景颜色
});

