const SCALE = 4;

const times: number[] = [];
let fps: number;


function init() {
    const canvas = document.getElementById("canvas") as HTMLCanvasElement | null;
    if (!canvas) throw new Error("unable to get canvas HTML element");

    const ctx = canvas.getContext("2d", { alpha: false }) as CanvasRenderingContext2D | null;
    if (!ctx) throw new Error("unable to get canvas 2D context");

    ctx.canvas.width  = window.innerWidth
    ctx.canvas.height = window.innerHeight

    const gridWidth = Math.floor(ctx.canvas.width / SCALE)
    const gridHeight = Math.floor(ctx.canvas.height / SCALE)


    const cells = new Array(gridWidth * gridHeight)
    cells.fill(0)

    const state = new Array(gridWidth * gridHeight)
    state.fill(0)

    for (let i=0; i < gridWidth * gridHeight; i++) state[i] = +(Math.random() * 4 < 1)

    window.requestAnimationFrame(t => update(ctx, cells, state));
}

// update loop, called every frame
function update(ctx: CanvasRenderingContext2D, cells: number[], state: number[]) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    const gridWidth = Math.floor(ctx.canvas.width / SCALE)
    const gridHeight = Math.floor(ctx.canvas.height / SCALE)

    for (let i=0; i < gridWidth * gridHeight; i++) cells[i] = state[i];

    ctx.beginPath(); // batch draw calls, only once per frame
    ctx.fillStyle = "white";
    for (let y=1; y < gridHeight - 1; y++) {
        for (let x=1; x < gridWidth - 1; x++) {
            const pos = gridWidth * y + x;
            // count neighbors
            const n = cells[pos - 1 - gridWidth]
                       + cells[pos     - gridWidth]
                       + cells[pos + 1 - gridWidth]
                       + cells[pos - 1]
                       + cells[pos + 1]
                       + cells[pos - 1 + gridWidth]
                       + cells[pos     + gridWidth]
                       + cells[pos + 1 + gridWidth];
            const cell = cells[pos];
            if (cell == 1) {
                state[pos] = +(n == 2 || n == 3)
            } else {
                state[pos] = +(n == 3)
            }

            if (cell == 1) {
                ctx.moveTo(x * SCALE, y * SCALE);
                ctx.rect(x * SCALE, y * SCALE, SCALE, SCALE);
            }
        }
    }
    ctx.fill(); // draw only once per frame

    const now = performance.now();
    while (times.length > 0 && times[0] <= now - 1000) {
      times.shift();
    }
    times.push(now);
    fps = times.length;

    ctx.save();
    ctx.fillStyle = "red";
    ctx.font = "bold 48px sans-serif";
    ctx.shadowColor = "white";
    ctx.fillText("" + fps, 10, 50);
    ctx.restore();

    window.requestAnimationFrame(t => update(ctx, cells, state));
}

init();

