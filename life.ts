import { Point, resizeCanvas } from "./common.js"

const WIDTH = 800;
const HEIGHT = 600;
const SCALING = 4;
const DIRECTIONS: Point[] = [
    { x: 0, y: -1},   // N
    { x: -1, y: -1},  // NW
    { x: 1, y: -1},   // NE
    { x: -1, y: 0},   // W
    { x: 1, y: 0},    // E
    { x: 0, y: 1},    // S
    { x: -1, y: 1},   // SW
    { x: 1, y: 1},    // SE
]

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

    const cells = new Array(WIDTH * HEIGHT / SCALING)
    cells.fill(0)

    const state = new Array(WIDTH * HEIGHT / SCALING)
    state.fill(0)

    for (let i=0; i < WIDTH * HEIGHT / SCALING; i++) state[i] = +(Math.random() * 4 < 1)

    console.log(state.length)

    //window.addEventListener('resize', () => resizeCanvas(ctx));
    window.requestAnimationFrame(t => update(ctx, cells, state));
}

// update loop, called every frame
function update(ctx: CanvasRenderingContext2D, cells: number[], state: number[]) {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    for (let i=0; i < WIDTH * HEIGHT / SCALING; i++) cells[i] = state[i];

    const cell = (p: Point) => cells[p.y*WIDTH/SCALING + p.x]

    ctx.beginPath(); // batch draw calls, only once per frame
    ctx.fillStyle = "white";
    for (let y=1; y < HEIGHT - 1; y++) {
        for (let x=1; x < WIDTH - 1; x++) {
            const p = { x, y };
            // count neighbors
            let neighbors = 0;
            for (const d of DIRECTIONS) {
                const pos = add2(p, d);
                neighbors += cell(pos);
            }

            if (cell(p) == 1) {
                state[p.y*WIDTH/SCALING+p.x] = +(neighbors == 2 || neighbors == 3)
            } else {
                state[p.y*WIDTH/SCALING+p.x] = +(neighbors == 3)
            }

            if (cell(p) == 1) {
                ctx.moveTo(p.x, p.y);
                ctx.rect(p.x, p.y, SCALING, SCALING);
            }
        }
    }
    ctx.fill(); // draw only once per frame

    window.requestAnimationFrame(t => update(ctx, cells, state));
}

init();
