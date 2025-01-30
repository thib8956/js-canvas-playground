"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_js_1 = require("./common.js");
function drawPoints(ctx, points) {
    const [a, b, c, d] = points;
    (0, common_js_1.drawLine)(ctx, a, b, 0xFF00FF);
    (0, common_js_1.drawLine)(ctx, c, d, 0xFF00FF);
    for (const p of points) {
        (0, common_js_1.drawCircle)(ctx, p, 2, 0xFF00FF);
    }
}
function drawCurve(ctx, curve) {
    for (let i = 0; i < curve.length - 1; ++i) {
        (0, common_js_1.drawLine)(ctx, curve[i], curve[i + 1], 0xFFFFFF);
    }
}
function init() {
    const canvas = document.getElementById("game");
    if (!canvas)
        throw new Error("unable to get canvas HTML element");
    const ctx = canvas.getContext("2d");
    if (!ctx)
        throw new Error("unable to get canvas 2D context");
    let selection = undefined;
    let points = [
        { x: 227, y: 434 },
        { x: 341, y: 234 },
        { x: 649, y: 255 },
        { x: 765, y: 450 },
    ];
    (0, common_js_1.resizeCanvas)(ctx); // Init canvas
    drawPoints(ctx, points);
    const bezier = (0, common_js_1.cubicBezier)(...points);
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
            const bezier = (0, common_js_1.cubicBezier)(...points);
            drawCurve(ctx, bezier);
            drawPoints(ctx, points);
        }
    };
    canvas.onmouseup = () => {
        selection = undefined;
    };
}
init();
