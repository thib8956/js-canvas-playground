const cellSize = 150;
const size = cellSize * 3;
const margin = 10;

let ctx = undefined;
let initialPos = undefined;
let circle = true;

function resizeCanvas() {
    ctx.canvas.width  = window.innerWidth;
    ctx.canvas.height = window.innerHeight;
}

function drawGrid() {
    ctx.strokeStyle = "white";
    ctx.lineWidth = 5;
    
    for (let x = 1; x < 3; ++x) {
        ctx.moveTo(initialPos.x + x * cellSize, 0 + initialPos.y);
        ctx.lineTo(initialPos.x + x * cellSize, initialPos.y + size);
    }

    for (let y = 1; y < 3; ++y) {
        ctx.moveTo(initialPos.x + 0, initialPos.y + y * cellSize);
        ctx.lineTo(initialPos.x + size, initialPos.y + y * cellSize);
    }

    ctx.stroke();
}


function drawCircle(x, y) {
  ctx.beginPath();
  // arc(x, y, radius, startAngle, endAngle)
  ctx.arc(x, y, 50, 0, Math.PI * 2);
  ctx.stroke();
}

function drawCross(x, y) {
    startPoint = { x: x-50, y: y-50 };
    ctx.beginPath();
    ctx.moveTo(startPoint.x, startPoint.y);
    ctx.lineTo(startPoint.x + 100, startPoint.y + 100);
    ctx.moveTo(startPoint.x + 100, startPoint.y);
    ctx.lineTo(startPoint.x, startPoint.y + 100);
    ctx.stroke();
}

function init() {
    const canvas = document.getElementById("canvas");
    if (canvas.getContext) {
        ctx = canvas.getContext("2d");
        resizeCanvas(ctx); // Init canvas
        ctx.fillStyle = "red";

        initialPos = { 
            x: ctx.canvas.width / 2 - size / 2,
            y: ctx.canvas.height / 2 - size / 2
        };

        ctx.fillRect(initialPos.x, initialPos.y, 5, 5); // origin of grid

        canvas.addEventListener("click", (evt) => {
            const {clientX, clientY} = evt;
            // Coord relative to origin of the grid (initialPos)
            const pt = { x: clientX - initialPos.x, y: clientY - initialPos.y };
            const gridIndex = {
                x: Math.floor(3 * pt.x / size),
                y: Math.floor(3 * pt.y / size)
            };
            if (gridIndex.x >= 0 && gridIndex.x <= 2 && gridIndex.y >= 0 && gridIndex.y <= 2) {
                ctx.fillStyle = "blue";
                const center = {
                    x: initialPos.x + gridIndex.x * cellSize + cellSize/2,
                    y: initialPos.y + gridIndex.y * cellSize + cellSize/2
                };
                if (circle) drawCircle(center.x, center.y);
                else drawCross(center.x, center.y);
                circle = !circle;
            }
        });

        //window.addEventListener('resize', () => resizeCanvas(ctx));
        //window.requestAnimationFrame(time => update(ctx, time))
        
        drawGrid(ctx);
    }
}

init();

