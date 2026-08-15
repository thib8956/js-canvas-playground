import Vec2d from "./vec.js";
import { drawCircle, resizeCanvas } from "./common.js";

const SEGMENT_SPACING = 100;

function initTrail(pos: Vec2d, len: number) {
  return Array.from({ length: len }, (_, i) => pos.add(new Vec2d(-1, 0).scale(i * SEGMENT_SPACING)));
}

// state
let target: Vec2d | undefined = undefined;
let trail = initTrail(new Vec2d(500, 500), 5);
let velocity = new Vec2d(500, 500);
let pause = false;
let mode: "follow" | "bounce" | "circle" = "follow";
let lastFrameTime: number | undefined = undefined;

function update(ctx: CanvasRenderingContext2D, timestamp: number) {
  if (!lastFrameTime) lastFrameTime = timestamp;
  const dt = (timestamp - lastFrameTime) / 1000; // seconds
  lastFrameTime = timestamp;
  if (!pause) {
  switch (mode) {
        case "bounce": updateBounce(ctx, dt); break;
        case "follow": updateFollow(ctx, dt); break;
        case "circle": updateCircle(ctx, dt); break;
        default: throw new Error(`Unknown mode: ${mode}`);
    }
  }

  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  for (const pos of trail) {
    drawCircle(ctx, pos, 20, 0xFF00FF);
  }

  window.requestAnimationFrame(t => update(ctx, t));
}

function updateFollow(ctx: CanvasRenderingContext2D, dt: number) {
  if (target) {
    // update head position towards the mouse cursor
    // using lerp with a factor of 0.1 moves 10% towards the target at each
    // frame, so this is framerate dependent:
    // trail[0] = trail[0].lerp(target, 0.1);
    // use exponential decay instead, this is framerate independent:
    // a = a + (b - a) * t  lerp formula
    // a = a + (b - a) * e^(-k * dt)  substitute t with e^(-k * dt)
    const alpha = Math.exp(-10 * dt)
    trail[0] = trail[0].lerp(target, alpha);
    updateTrail();
  }
}

function updateBounce(ctx: CanvasRenderingContext2D, dt: number) {
    // update head pos
    // P_t+1 = P_t + V * t
    const newPos = trail[0].add(velocity.scale(dt));
    if (newPos.x > ctx.canvas.width - 100) { velocity.x *= -1; newPos.x = ctx.canvas.width - 100; }
    if (newPos.y > ctx.canvas.height - 100) { velocity.y *= -1; newPos.y = ctx.canvas.height - 100; }
    if (newPos.x < 100) { velocity.x *= -1; newPos.x = 100; }
    if (newPos.y < 100) { velocity.y *= -1; newPos.y = 100; }
    trail[0] = newPos;
    updateTrail();
}

function updateCircle(ctx: CanvasRenderingContext2D, dt: number) {
  const center = new Vec2d(ctx.canvas.width / 2, ctx.canvas.height / 2);
  const rel = trail[0].sub(center); // distance from center
  const { r, theta } = rel.toPolar();
  trail[0] = center.add(Vec2d.fromPolar(r, theta + dt));
  updateTrail();
}

function updateTrail() {
  // "follow the leader" algorithm: keep segments at a fixed distance
  // from each other by moving each segment towards the segment in front of it.
  for (let i = 1; i < trail.length; i++) {
    const leader = trail[i - 1];
    const delta = leader.sub(trail[i]);
    const dist = delta.length();
    if (dist > SEGMENT_SPACING) {
      const remainder = dist - SEGMENT_SPACING; // excess distance to be covered
      const p = remainder / dist; // [0, 1]
      trail[i] = trail[i].lerp(leader, p);
    }
  }
}

function init() {
    const canvas = document.getElementById("canvas") as HTMLCanvasElement | null;
    if (!canvas) throw new Error("unable to get canvas HTML element");
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D | null;
    if (!ctx) throw new Error("unable to get canvas 2D context");
    ctx.canvas.width = ctx.canvas.clientWidth;
    ctx.canvas.height = ctx.canvas.clientHeight;

    canvas.onmousemove = (evt) => {
        const {clientX, clientY} = evt;
        target = new Vec2d(clientX, clientY);
    }

    canvas.onclick = () => {
        pause = !pause;
    }

    window.onkeydown = (evt) => {
      if (mode === "bounce") mode = "follow";
      else if (mode === "follow") mode = "circle";
      else if (mode === "circle") mode = "bounce";
      console.log(mode);
    }

    window.addEventListener('resize', () => resizeCanvas(ctx));

    window.requestAnimationFrame(t => update(ctx, t));
}

init();
