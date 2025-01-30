"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_js_1 = require("./common.js");
let points = [];
function update(ctx, time) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    const p = (Math.sin(0.001 * time) + 1.0) * 0.5;
    if (points.length == 2) {
        const [start, end] = points;
        (0, common_js_1.drawCircle)(ctx, (0, common_js_1.lerp)(start, end, p), 1, 0xFF0000);
    }
    else if (points.length === 3) {
        const [a, b, c] = points;
        const ab = (0, common_js_1.lerp)(a, b, p);
        const bc = (0, common_js_1.lerp)(b, c, p);
        const abc = (0, common_js_1.lerp)(ab, bc, p);
        (0, common_js_1.drawDashedLine)(ctx, ab, bc, 0xFF0000);
        (0, common_js_1.drawCircle)(ctx, ab, 1, 0xFF0000);
        (0, common_js_1.drawCircle)(ctx, bc, 1, 0xFF0000);
        (0, common_js_1.drawCircle)(ctx, abc, 1, 0xFFFFFF);
    }
    else if (points.length === 4) {
        const [a, b, c, d] = points;
        const ab = (0, common_js_1.lerp)(a, b, p);
        const bc = (0, common_js_1.lerp)(b, c, p);
        const cd = (0, common_js_1.lerp)(c, d, p);
        const abc = (0, common_js_1.lerp)(ab, bc, p);
        const bcd = (0, common_js_1.lerp)(bc, cd, p);
        const abcd = (0, common_js_1.lerp)(abc, bcd, p);
        (0, common_js_1.drawDashedLine)(ctx, ab, bc, 0xFF0000);
        (0, common_js_1.drawDashedLine)(ctx, bc, cd, 0xFF0000);
        (0, common_js_1.drawDashedLine)(ctx, abc, bcd, 0xFFFF00);
        (0, common_js_1.drawCircle)(ctx, ab, 1, 0xFF0000);
        (0, common_js_1.drawCircle)(ctx, bc, 1, 0xFF0000);
        (0, common_js_1.drawCircle)(ctx, cd, 1, 0xFF0000);
        (0, common_js_1.drawCircle)(ctx, abc, 1, 0xFFFF00);
        (0, common_js_1.drawCircle)(ctx, bcd, 1, 0xFFFF00);
        (0, common_js_1.drawCircle)(ctx, abcd, 1, 0xFFFFFF);
    }
    for (let i = 0; i < points.length - 1; ++i) {
        const current = points[i];
        const next = points[i + 1];
        (0, common_js_1.drawLine)(ctx, current, next, 0xFF00FF);
    }
    for (const point of points) {
        (0, common_js_1.drawCircle)(ctx, point, 1, 0xFF00FF);
    }
    window.requestAnimationFrame(t => update(ctx, t));
}
function init() {
    const canvas = document.getElementById("game");
    if (!canvas)
        throw new Error("unable to get canvas HTML element");
    const ctx = canvas.getContext("2d");
    if (!ctx)
        throw new Error("unable to get canvas 2D context");
    (0, common_js_1.resizeCanvas)(ctx); // Init canvas to full window size
    canvas.addEventListener("click", (evt) => {
        const { clientX, clientY } = evt;
        if (points.length < 4) {
            points.push({ x: clientX, y: clientY });
        }
    });
    window.addEventListener('resize', () => (0, common_js_1.resizeCanvas)(ctx));
    window.requestAnimationFrame(t => update(ctx, t));
}
init();
