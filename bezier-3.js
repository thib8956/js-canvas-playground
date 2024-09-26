import { resizeCanvas, drawCircle, drawLine, cubicBezier } from "./common.js";

function drawPoints(ctx, points) {
    const [a, b, c, d] = points;
    drawLine(ctx, a, b, 0xFF00FF);
    drawLine(ctx, c, d, 0xFF00FF);
    for (const p of points) {
        drawCircle(ctx, p, 2, 0xFF00FF);
    }
}

function drawCurve(ctx, curve) {
    for (let i=0; i < curve.length - 1; ++i) {
        drawLine(ctx, curve[i], curve[i+1], 0xFFFFFF);
    }
}


function init() {
    const canvas = document.getElementById("canvas");
    let selection = undefined;
    let points = [
        { x: 300, y: 100 },
        { x: 400, y: 100 },
        { x: 100, y: 300 },
        { x: 300, y: 300 },
    ];

    if (canvas.getContext) {
        const ctx = canvas.getContext("2d");
        resizeCanvas(ctx); // Init canvas
        drawPoints(ctx, points);
        const bezier = cubicBezier(...points);
        drawCurve(ctx, bezier);

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
                const bezier = cubicBezier(...points);
                drawCurve(ctx, bezier);
                drawPoints(ctx, points);
            }
        };

        canvas.onmouseup = () => {
            selection = undefined;
        };
    }
}

init();

