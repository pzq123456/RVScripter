const UICanvas = document.getElementById('ui-layer');
const gameCanvas = document.getElementById('game-layer');

draw();

function draw(){
    drawGame(gameCanvas);
    drawUI(UICanvas);
}

function drawUI(canvas){
    // draw some random rectangles in the top and bottom of the screen
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'red';
    ctx.fillRect(0, 0, canvas.width, 50);
    ctx.fillRect(0, canvas.height - 50, canvas.width, 50);

    // draw some text in the center of the screen
    ctx.fillStyle = 'black';
    ctx.font = '30px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Hello World', canvas.width / 2, canvas.height / 2);

}

function drawGame(canvas){
    // draw a circle in the center of the screen
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'green';
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, 50, 0, 2 * Math.PI);
    ctx.fill();
}

