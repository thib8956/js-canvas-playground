class Vec2d {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    toString() {
        return `[${this.x}, ${this.y}]`;
    }

    scale(scalar: number): Vec2d {
        return new Vec2d(this.x * scalar, this.y * scalar);
    }

    add(other: Vec2d): Vec2d {
        return new Vec2d(this.x + other.x, this.y + other.y)
    }

    lerp(other: Vec2d, t: number): Vec2d {
        // (1-t)*A + B*t
        return this.scale(1-t).add(other.scale(t));
    }
}

// state
let target: Vec2d | undefined = undefined;
let pos = new Vec2d(200, 200);
let velocity = new Vec2d(500, 500);
let pause = false;
let mode: "follow" | "bounce" = "bounce";
let start: number | undefined = undefined;

function drawCircle(ctx: CanvasRenderingContext2D, center: Vec2d, radius: number, color: number) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(center.x, center.y, radius, 0, 2*Math.PI);
    ctx.strokeStyle = `#${color.toString(16)}`
    ctx.lineWidth = 5;
    ctx.stroke();
    ctx.restore();
}

function resizeCanvas(ctx: CanvasRenderingContext2D) {
    ctx.canvas.width  = window.innerWidth;
    ctx.canvas.height = window.innerHeight;
    ctx.clearRect(0, 0, ctx.canvas.height, ctx. canvas.width);
}

function update(ctx: CanvasRenderingContext2D, timestamp: number) {
    switch (mode) {
        case "bounce":
            updateBounce(ctx, timestamp);
        break;
        case "follow": 
            updateFollow(ctx);
        break;
        default:
            throw new Error(`Unknown mode: ${mode}`);
    }
    if (!pause) window.requestAnimationFrame(t => update(ctx, t));
}

function updateFollow(ctx: CanvasRenderingContext2D) {
    if (target) pos = pos.lerp(target, 0.01);
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    drawCircle(ctx, pos, 100, 0xFF00FF);
}

function updateBounce(ctx: CanvasRenderingContext2D, timestamp: number) {
    if (!start) start = timestamp;
    const dt = timestamp - start;
    // P_t+1 = P_t + V * t
    const newPos = pos.add(velocity.scale(0.001*dt));
    if (newPos.x > ctx.canvas.width - 100) { velocity.x *= -1; newPos.x = ctx.canvas.width - 100; }
    if (newPos.y > ctx.canvas.height - 100) { velocity.y *= -1; newPos.y = ctx.canvas.height - 100; }
    if (newPos.x < 100) { velocity.x *= -1; newPos.x = 100; }
    if (newPos.y < 100) { velocity.y *= -1; newPos.y = 100; }
    //console.log(velocity);

    pos = newPos;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    drawCircle(ctx, pos, 100, 0xFF00FF);
    start = timestamp;
}

function init() {
    const canvas = document.getElementById("canvas") as HTMLCanvasElement | null;
    if (!canvas) throw new Error("unable to get canvas HTML element");
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D | null;
    if (!ctx) throw new Error("unable to get canvas 2D context");

    ctx.canvas.width  = window.innerWidth;
    ctx.canvas.height = window.innerHeight;


    canvas.onmousemove = (evt) => {
        const {clientX, clientY} = evt;
        target = new Vec2d(clientX, clientY);
    }

    canvas.onclick = () => {
        if (pause) {
            window.requestAnimationFrame(t => update(ctx, t));
        }
        pause = !pause;
    }

    window.onkeydown = (evt) => {
        console.log("key down", evt);
        if (mode === "follow") mode = "bounce";
        else mode = "follow"
            console.log("mode", mode);
    }

    window.addEventListener('resize', () => resizeCanvas(ctx));

    window.requestAnimationFrame(t => update(ctx, t));
}

init();
