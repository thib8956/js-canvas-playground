export function resizeCanvas(ctx) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.canvas.width  = window.innerWidth;
    ctx.canvas.height = window.innerHeight;
}

export function lerp(a, b, p) {
    return { 
        x: a.x + (b.x - a.x) * p,
        y: a.y + (b.y - a.y) * p
    };
}

export function drawCircle(ctx, {x, y}, radius, color) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2*Math.PI);
    ctx.strokeStyle = `#${color.toString(16)}`
    ctx.lineWidth = 5;
    ctx.stroke();
    ctx.restore();
}

export function drawLine(ctx, start, end, color, dashed=false) {
    ctx.save();
    ctx.beginPath();
    if (dashed) ctx.setLineDash([5, 5]);
    ctx.strokeStyle = `#${color.toString(16)}`
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
    ctx.restore();
}

export function drawDashedLine(ctx, start, end, color) {
    drawLine(ctx, start, end, color, true);
}

