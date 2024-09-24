const cellSize = 150;
const size = cellSize * 3;
const margin = 10;

let ctx = undefined;
let circle = true;
let pendingClicks = [];
let shapes = [];

function resizeCanvas() {
    ctx.canvas.width  = window.innerWidth;
    ctx.canvas.height = window.innerHeight;
}

function drawGrid(origin) {
    ctx.strokeStyle = "white";
    ctx.lineWidth = 5;

    for (let x = 1; x < 3; ++x) {
        ctx.moveTo(origin.x + x * cellSize, 0 + origin.y);
        ctx.lineTo(origin.x + x * cellSize, origin.y + size);
    }

    for (let y = 1; y < 3; ++y) {
        ctx.moveTo(origin.x + 0, origin.y + y * cellSize);
        ctx.lineTo(origin.x + size, origin.y + y * cellSize);
    }

    ctx.stroke();
}

function drawAnimatedCircle(dt, x, y, hue) {
    const end = dt*2*Math.PI/500;
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, 50, 0, Math.min(end, 2*Math.PI));
    const percent = Math.trunc(100*Math.min(end, 2*Math.PI)/(2*Math.PI));
    ctx.strokeStyle = `hsla(${hue}, ${percent}%, 50%, 1)`;
    ctx.lineWidth = 5;
    ctx.stroke();
    ctx.restore();
}

function drawAnimatedCross(dt, x, y, hue) {
    startPoint = { x: x-50, y: y-50 };
    ctx.beginPath();
    ctx.moveTo(startPoint.x, startPoint.y);

    delta = 100*dt/250;
    if (delta < 100) { // draw \
        d = Math.min(delta, 100);
        ctx.lineTo(startPoint.x + d, startPoint.y + d);
    } else { // draw /
        ctx.lineTo(startPoint.x + 100, startPoint.y + 100); // keep \ drawn
        ctx.moveTo(startPoint.x + 100, startPoint.y);
        d = Math.min(delta-100, 100);
        ctx.lineTo(startPoint.x +100 - d, startPoint.y + d);
    }

    ctx.lineWidth = 5;
    const percent = Math.trunc(100*Math.min(delta, 100)/100);
    ctx.strokeStyle = `hsla(${hue}, ${percent}%, 50%, 1)`;
    ctx.stroke();
}


function update(time) {
    const origin = { 
        x: ctx.canvas.width / 2 - size / 2,
        y: ctx.canvas.height / 2 - size / 2
    };

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    drawGrid(origin);

    for (const evt of pendingClicks) {
        const snapped = snapToGrid(origin, {x: evt.x, y: evt.y});
        const h = Math.floor(Math.random() * 255);
        if (snapped) {
            if (circle) {
                shapes.push({kind: "circle", x: snapped.x, y: snapped.y, t: time, hue: h});
            } else {
                shapes.push({kind: "cross", x: snapped.x, y: snapped.y, t: time, hue: h});
            }
            circle = !circle;
        }
    }
    pendingClicks = [];

    for (const shape of shapes) {
        const dt = time - shape.t;
        switch (shape.kind) {
            case "circle": 
                drawAnimatedCircle(dt, shape.x, shape.y, shape.hue);
                break;
            case "cross":
                drawAnimatedCross(dt, shape.x, shape.y, shape.hue);
                break;
        }
    }

    window.requestAnimationFrame(update);
}

function snapToGrid(origin, clientPos) {
    // Coord relative to origin of the grid (origin)
    const pt = { x: clientPos.x - origin.x, y: clientPos.y - origin.y };
    const gridIndex = {
        x: Math.floor(3 * pt.x / size),
        y: Math.floor(3 * pt.y / size)
    };
    if (gridIndex.x >= 0 && gridIndex.x <= 2 && gridIndex.y >= 0 && gridIndex.y <= 2) {
        const center = {
            x: origin.x + gridIndex.x * cellSize + cellSize/2,
            y: origin.y + gridIndex.y * cellSize + cellSize/2
        };
        return center;
    }
    return undefined;
}

function init() {
    const canvas = document.getElementById("canvas");
    if (canvas.getContext) {
        ctx = canvas.getContext("2d");
        resizeCanvas(ctx); // Init canvas

        canvas.addEventListener("click", (evt) => {
            const {clientX, clientY} = evt;
            pendingClicks.push({x: clientX, y: clientY});
        });

        //window.addEventListener('resize', () => resizeCanvas(ctx));
        window.requestAnimationFrame(update)
    }
}

init();

