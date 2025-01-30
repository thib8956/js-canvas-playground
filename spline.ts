import { Point, resizeCanvas, drawCircle, drawLine, cubicBezier, quadraticBezier } from "./common.js"

function drawPoints(ctx: CanvasRenderingContext2D, points: Point[]) {
    for (const p of points) {
        drawCircle(ctx, p, 2, 0xFF00FF);
    }
}


function drawCurve(ctx: CanvasRenderingContext2D, curve: Point[]) {
    for (let i=0; i < curve.length - 1; ++i) {
        drawLine(ctx, curve[i], curve[i+1], 0xFFFFFF);
    }
}

function draw(ctx: CanvasRenderingContext2D, points: Point[]) {
    let start = 0;
    while (true) {
        const sl = points.slice(start, start + 4);
        if (sl.length === 4) {
            const bezier = cubicBezier(...(sl as [Point, Point, Point, Point]));
            drawCurve(ctx, bezier);
            start += 3;
        } else if (sl.length === 3) {
            const bezier = quadraticBezier(...(sl as [Point, Point, Point]));
            drawCurve(ctx, bezier);
            start += 2;
        } else {
            break;
        }
    }
    drawPoints(ctx, points);
}

function init() {
    const canvas = document.getElementById("canvas") as HTMLCanvasElement | null;
    if (!canvas) throw new Error("unable to get canvas HTML element");

    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D | null;
    if (!ctx) throw new Error("unable to get canvas 2D context");

    let selection: number | undefined = undefined;
    let points = [
        { x: 227, y: 434 },
        { x: 341, y: 234 },
        { x: 649, y: 255 },
        { x: 765, y: 450 },
        { x: 800, y: 500 },
        { x: 850, y: 450 },
        { x: 900, y: 550 },
    ];
    
    resizeCanvas(ctx); // Init canvas
    draw(ctx, points);

    canvas.oncontextmenu = (evt) => {
        evt.preventDefault();
        points = [];
        // redraw
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        draw(ctx, points);
    };
    canvas.onmousedown = (evt) => {
        const { clientX, clientY } = evt;
        for (const p of points) {
            if (Math.abs(p.x - clientX) < 10 && Math.abs(p.y - clientY) < 10) {
                selection = points.indexOf(p);
            }
        }
        if (selection === undefined) {
            points.push({ x: clientX, y: clientY });
            // redraw
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            draw(ctx, points);

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

init();
