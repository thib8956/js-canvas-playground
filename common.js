"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lerp = lerp;
exports.quadraticBezier = quadraticBezier;
exports.cubicBezier = cubicBezier;
exports.resizeCanvas = resizeCanvas;
exports.drawCircle = drawCircle;
exports.drawLine = drawLine;
exports.drawDashedLine = drawDashedLine;
function lerp(a, b, p) {
    return {
        x: a.x + (b.x - a.x) * p,
        y: a.y + (b.y - a.y) * p
    };
}
function quadraticBezier(a, b, c, res = 0.05) {
    const eps = 0.001; // to prevent issues with float comparaison (p <= 1)
    const curve = [];
    for (let p = 0; p - 1 < eps; p += res) {
        const ab = lerp(a, b, p);
        const bc = lerp(b, c, p);
        const abc = lerp(ab, bc, p);
        curve.push(abc);
    }
    return curve;
}
function cubicBezier(a, b, c, d, res = 0.05) {
    const eps = 0.001; // to prevent issues with float comparaison (p <= 1)
    const curve = [];
    for (let p = 0; p - 1 < eps; p += res) {
        const ab = lerp(a, b, p);
        const bc = lerp(b, c, p);
        const cd = lerp(c, d, p);
        const abc = lerp(ab, bc, p);
        const bcd = lerp(bc, cd, p);
        const abcd = lerp(abc, bcd, p);
        curve.push(abcd);
    }
    return curve;
}
function resizeCanvas(ctx) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.canvas.width = window.innerWidth;
    ctx.canvas.height = window.innerHeight;
}
function drawCircle(ctx, center, radius, color) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(center.x, center.y, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = `#${color.toString(16)}`;
    ctx.lineWidth = 5;
    ctx.stroke();
    ctx.restore();
}
function drawLine(ctx, start, end, color, dashed = false) {
    ctx.save();
    ctx.beginPath();
    if (dashed)
        ctx.setLineDash([5, 5]);
    ctx.strokeStyle = `#${color.toString(16)}`;
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
    ctx.restore();
}
function drawDashedLine(ctx, start, end, color) {
    drawLine(ctx, start, end, color, true);
}
