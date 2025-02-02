import { Point, resizeCanvas, drawCircle, drawLine, cubicBezier } from "./common.js";

function drawPoints(ctx: CanvasRenderingContext2D, points: Point[]) {
    const [a, b, c, d] = points;
    drawLine(ctx, a, b, 0xFF00FF);
    drawLine(ctx, c, d, 0xFF00FF);
    for (const p of points) {
        drawCircle(ctx, p, 2, 0xFF00FF);
    }
}

function drawCurve(ctx: CanvasRenderingContext2D, curve: Point[]) {
    for (let i=0; i < curve.length - 1; ++i) {
        drawLine(ctx, curve[i], curve[i+1], 0xFFFFFF);
    }
}


function init() {
    const canvas = document.getElementById("canvas") as HTMLCanvasElement | null;
    if (!canvas) throw new Error("unable to get canvas HTML element");
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D | null;
    if (!ctx) throw new Error("unable to get canvas 2D context");

    let selection: number | undefined = undefined;
    let points: [Point, Point, Point, Point] = [
        { x: 227, y: 434 },
        { x: 341, y: 234 },
        { x: 649, y: 255 },
        { x: 765, y: 450 },
    ];

    resizeCanvas(ctx); // Init canvas
    drawPoints(ctx, points);
    const bezier = cubicBezier(...points);
    drawCurve(ctx, bezier);

    canvas.ontouchstart = (evt: TouchEvent) => {
        console.assert(evt.touches.length === 1, "Multiple touch points are not supported");
        const { clientX, clientY } = evt.touches[0];
        for (const p of points) {
            if (Math.abs(p.x - clientX) < 10 && Math.abs(p.y - clientY) < 10) {
                selection = points.indexOf(p);
            }
        }
    };

    canvas.onmousedown = (evt: MouseEvent) => {
        const { clientX, clientY } = evt;
        for (const p of points) {
            if (Math.abs(p.x - clientX) < 10 && Math.abs(p.y - clientY) < 10) {
                selection = points.indexOf(p);
            }
        }
    };

    canvas.ontouchmove = (evt: TouchEvent) => {
        console.assert(evt.touches.length === 1, "Multiple touch points are not supported");
        const { clientX, clientY } = evt.touches[0];
        if (selection !== undefined) {
            points[selection].x = clientX;
            points[selection].y = clientY;
            // redraw
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            const bezier = cubicBezier(...points);
            drawCurve(ctx, bezier);
            drawPoints(ctx, points);
        }
    };


    canvas.onmousemove = (evt: MouseEvent) => {
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

    canvas.ontouchend = () => {
        selection = undefined;
    };


    canvas.onmouseup = () => {
        selection = undefined;
    };
}

init();

