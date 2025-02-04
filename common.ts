export interface Point {
    x: number;
    y: number;
}

export function lerp(a: Point, b: Point, p: number) {
    return { 
        x: a.x + (b.x - a.x) * p,
        y: a.y + (b.y - a.y) * p
    };
}

export function quadraticBezier(a: Point, b: Point, c: Point, res=0.05) {
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

export function cubicBezier(a: Point, b: Point, c: Point, d: Point, res=0.05) {
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

export function resizeCanvas(ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.canvas.width  = window.innerWidth;
    ctx.canvas.height = window.innerHeight;
}

export function drawCircle(ctx: CanvasRenderingContext2D, center: Point, radius: number, color: number) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(center.x, center.y, radius, 0, 2*Math.PI);
    ctx.strokeStyle = `#${color.toString(16)}`
    ctx.lineWidth = 5;
    ctx.stroke();
    ctx.restore();
}

export function drawLine(ctx: CanvasRenderingContext2D, start: Point, end: Point, color: number, dashed=false) {
    ctx.save();
    ctx.beginPath();
    if (dashed) ctx.setLineDash([5, 5]);
    ctx.strokeStyle = `#${color.toString(16)}`
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
    ctx.restore();
}

export function drawDashedLine(ctx: CanvasRenderingContext2D, start: Point, end: Point, color: number) {
    drawLine(ctx, start, end, color, true);
}

