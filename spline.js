import { resizeCanvas, drawCircle, drawLine, cubicBezier } from "./common.js"

function drawPoints(ctx, points) {
    for (const p of points) {
        drawCircle(ctx, p, 2, 0xFF00FF);
    }
}


function drawCurve(ctx, curve) {
    for (let i=0; i < curve.length - 1; ++i) {
        drawLine(ctx, curve[i], curve[i+1], 0xFFFFFF);
    }
}

function draw(ctx, points) {
    const bezier1 = cubicBezier(...points.slice(0, 4));
    drawCurve(ctx, bezier1);

    const bezier2 = cubicBezier(...points.slice(3, 7));
    drawCurve(ctx, bezier2);

    drawPoints(ctx, points);
}

function init() {
    const canvas = document.getElementById("canvas");
    let selection = undefined;
    let points = [
        { x: 227, y: 434 },
        { x: 341, y: 234 },
        { x: 649, y: 255 },
        { x: 765, y: 450 },
        { x: 800, y: 500 },
        { x: 850, y: 450 },
        { x: 900, y: 550 },
    ];
    
    if (canvas.getContext) {
        const ctx = canvas.getContext("2d");
        resizeCanvas(ctx); // Init canvas
        draw(ctx, points);

        canvas.onmousedown = (evt) => {
            const { clientX, clientY } = evt;
            for (const p of points) {
                if (Math.abs(p.x - clientX) < 10 && Math.abs(p.y - clientY) < 10) {
                    selection = points.indexOf(p);
                }
            }
        };

        canvas.onmousemove = (evt) => {
            if (selection !== undefined) {
                points[selection].x = evt.clientX;
                points[selection].y = evt.clientY;
                // redraw
                ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                draw(ctx, points);
            }
        };

        canvas.onmouseup = () => {
            selection = undefined;
        };

    }
}

init();
