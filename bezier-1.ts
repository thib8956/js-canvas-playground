import { Point, lerp, drawCircle, drawLine, drawDashedLine, resizeCanvas } from "./common.js"

let points: Point[] = [];

function update(ctx: CanvasRenderingContext2D, time: number) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    const p = (Math.sin(0.001 * time) + 1.0) * 0.5;
    if (points.length == 2) {
        const [start, end] = points;
        drawCircle(ctx, lerp(start, end, p), 1, 0xFF0000);
    } else if (points.length === 3) {
        const [a, b, c] = points;
        const ab = lerp(a, b, p); 
        const bc = lerp(b, c, p);
        const abc = lerp(ab, bc, p);
        drawDashedLine(ctx, ab, bc, 0xFF0000);
        drawCircle(ctx, ab, 1, 0xFF0000);
        drawCircle(ctx, bc, 1, 0xFF0000);
        drawCircle(ctx, abc, 1, 0xFFFFFF);
    } else if (points.length === 4) {
        const [a, b, c, d] = points;
        const ab = lerp(a, b, p); 
        const bc = lerp(b, c, p); 
        const cd = lerp(c, d, p); 
        const abc = lerp(ab, bc, p);
        const bcd = lerp(bc, cd, p);
        const abcd = lerp(abc, bcd, p);

        drawDashedLine(ctx, ab, bc, 0xFF0000);
        drawDashedLine(ctx, bc, cd, 0xFF0000);
        drawDashedLine(ctx, abc, bcd, 0xFFFF00);
        drawCircle(ctx, ab, 1, 0xFF0000);
        drawCircle(ctx, bc, 1, 0xFF0000);
        drawCircle(ctx, cd, 1, 0xFF0000);
        drawCircle(ctx, abc, 1, 0xFFFF00);
        drawCircle(ctx, bcd, 1, 0xFFFF00);
        drawCircle(ctx, abcd, 1, 0xFFFFFF);
    }

    for (let i = 0; i < points.length - 1; ++i) {
        const current = points[i];
        const next = points[i+1];
        drawLine(ctx, current, next, 0xFF00FF);
    }

    for (const point of points) {
        drawCircle(ctx, point, 1, 0xFF00FF);
    }

    window.requestAnimationFrame(t => update(ctx, t));
}

function init() {
    const canvas = document.getElementById("game") as HTMLCanvasElement | null;
    if (!canvas) throw new Error("unable to get canvas HTML element");
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D | null;
    if (!ctx) throw new Error("unable to get canvas 2D context");

    resizeCanvas(ctx); // Init canvas to full window size

    canvas.addEventListener("click", (evt) => {
        const {clientX, clientY} = evt;
        if (points.length < 4) {
            points.push({x: clientX, y: clientY});
        }
    });

    window.addEventListener('resize', () => resizeCanvas(ctx));
    window.requestAnimationFrame(t => update(ctx, t));
}

init();

