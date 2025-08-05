import { Point, resizeCanvas } from "./common.js"

let WIDTH = 800;
let HEIGHT = 600;

function add2(p1: Point, p2: Point) {
    return { x: p1.x + p2.x, y: p1.y + p2.y };
}

function init() {
    const canvas = document.getElementById("canvas") as HTMLCanvasElement | null;
    if (!canvas) throw new Error("unable to get canvas HTML element");

    const ctx = canvas.getContext("2d", { alpha: false }) as CanvasRenderingContext2D | null;
    if (!ctx) throw new Error("unable to get canvas 2D context");

    ctx.canvas.width  = WIDTH
    ctx.canvas.height = HEIGHT


    const cells = new Array(WIDTH * HEIGHT)
    cells.fill(0)

    const state = new Array(WIDTH * HEIGHT)
    state.fill(0)

    for (let i=0; i < WIDTH * HEIGHT; i++) state[i] = +(Math.random() * 4 < 1)

    canvas.addEventListener("click", (evt) => {
    });

    //window.addEventListener('resize', () => resizeCanvas(ctx));
    window.requestAnimationFrame(t => update(ctx, cells, state));
}

// update loop, called every frame
function update(ctx: CanvasRenderingContext2D, cells: number[], state: number[]) {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    for (let i=0; i < WIDTH * HEIGHT; i++) cells[i] = state[i];

    //const cell = (p: Point) => cells[p.x*WIDTH+ p.y];

    ctx.beginPath(); // batch draw calls, only once per frame
    ctx.fillStyle = "white";
    for (let y=1; y < HEIGHT - 1; y++) {
        for (let x=1; x < WIDTH - 1; x++) {
            const pos = WIDTH * y + x;
            // count neighbors
            const n = cells[pos - 1 - WIDTH]
                       + cells[pos     - WIDTH]
                       + cells[pos + 1 - WIDTH]
                       + cells[pos - 1]
                       + cells[pos + 1]
                       + cells[pos - 1 + WIDTH]
                       + cells[pos     + WIDTH]
                       + cells[pos + 1 + WIDTH];
            const cell = cells[pos];
            if (cell == 1) {
                state[pos] = +(n == 2 || n == 3)
            } else {
                state[pos] = +(n == 3)
            }

            if (cell == 1) {
                ctx.moveTo(x, y);
                ctx.rect(x, y, 1, 1);
            }
        }
    }
    ctx.fill(); // draw only once per frame

    window.requestAnimationFrame(t => update(ctx, cells, state));
}

init();
