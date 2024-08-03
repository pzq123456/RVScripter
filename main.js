const UICanvas = document.getElementById('ui-layer');
const gameCanvas = document.getElementById('game-layer');
const backgroundCanvas = document.getElementById('background-layer');

draw();

function draw(){
    drawBackground(backgroundCanvas);
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

function drawBackground(canvas){
    // draw a gradient in the background
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, 'blue');
    gradient.addColorStop(1, 'white');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // draw some stars in the background
    ctx.fillStyle = 'yellow';
    for(let i = 0; i < 100; i++){
        ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 2, 2);
    }
}

