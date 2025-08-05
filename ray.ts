import { 
    Point, resizeCanvas, drawCircle, drawLine, 
    cubicBezier, quadraticBezier, drawCurve, drawPoints
} from "./common.js"

const GRID_SIZE = 20;

function init() {
    const canvas = document.getElementById("canvas") as HTMLCanvasElement | null;
    if (!canvas) throw new Error("unable to get canvas HTML element");

    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D | null;
    if (!ctx) throw new Error("unable to get canvas 2D context");

    resizeCanvas(ctx);

    drawGrid(ctx);

    const points: Point[] = [];
    canvas.onmousedown = (evt: MouseEvent) => {
        const { clientX, clientY } = evt;
        if (points.length < 2) {
            // clamp to grid
            const p = {
                x: Math.floor(clientX / GRID_SIZE) * GRID_SIZE + GRID_SIZE/2,
                y: Math.floor(clientY / GRID_SIZE) * GRID_SIZE + GRID_SIZE/2,
            };
            console.log(p);

            points.push(p);
            drawCircle(ctx, p, 1, 0xFF00FF);
        }

        if (points.length == 2) {
            const first: Point = points.shift()!;
            const second: Point = points.shift()!;
            const angle = Math.atan2(second.y - first.y, second.x - first.x);
            for (let i=0; i < 1000; i+=10) {
                const x = first.x + i * Math.cos(angle);
                const y = first.y + i * Math.sin(angle);
                drawCircle(ctx, { x, y }, 0.1, 0xFF0000);
            }
        }
    };


}

function drawGrid(ctx: CanvasRenderingContext2D) {
    for (let x = 0; x <= ctx.canvas.width; x += GRID_SIZE) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, ctx.canvas.height);
    }

    for (let y = 0; y <= ctx.canvas.height; y += GRID_SIZE) {
        ctx.moveTo(0, y);
        ctx.lineTo(ctx.canvas.width, y);
    }

    ctx.strokeStyle = '#ccc';
    ctx.stroke();
}

init();

