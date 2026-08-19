import { drawCircle, fillCircle, resizeCanvas } from "./common.js";
import Vec2d from "./vec.js";

const INITIAL_RADIUS = 100;
const MAX_SPEED = 300;

let lastTime: number | undefined = undefined;

// state
let velocity = Vec2d.fromPoint({ x: 0, y: 0 });
let pos = Vec2d.fromPoint({ x: 0, y: 0 });
let radius = INITIAL_RADIUS;
let blobs: Vec2d[] = [];

function update(ctx: CanvasRenderingContext2D, timestamp: number) {
  if (lastTime == null) lastTime = timestamp;
  const dt = (timestamp - lastTime) / 1000; // s
  lastTime = timestamp;

  // update
  pos = pos.add(velocity.scale(dt));
  // check collisions
  for (let i = blobs.length - 1; i >= 0; i--) {
    const blob = blobs[i];
    if (blob.distance(pos) < radius) {
      // merge blobs areas
      const new_area = Math.PI * radius ** 2 + Math.PI * 10 ** 2;
      // compute radius from new area
      radius = Math.sqrt(new_area / Math.PI);
      blobs.splice(i, 1);
    }
  }

  // drawing
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  // world space to screen space: always put (pos.x, pos.y) at the center of the screen
  ctx.translate(ctx.canvas.width / 2, ctx.canvas.height / 2);
  ctx.scale(INITIAL_RADIUS / radius, INITIAL_RADIUS / radius);
  ctx.translate(-pos.x, -pos.y)
  for (const pos of blobs) {
    fillCircle(ctx, pos, 10, 0x00ff00);
  }
  fillCircle(ctx, pos, radius, 0xff00ff);
  // Reset current transformation matrix to the identity matrix
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  window.requestAnimationFrame((t) => update(ctx, t));
}

window.onload = () => {
  const canvas = document.getElementById("canvas") as HTMLCanvasElement;
  if (canvas == null) throw new Error("Canvas not found")
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
  if (ctx == null) throw new Error("Canvas context not found")
  resizeCanvas(ctx);

  canvas.onmousemove = (e) => {
    const rect = canvas.getBoundingClientRect();
    // mouse coordinates relative to canvas
    const mouse = Vec2d.fromPoint({ x: e.clientX - rect.left, y: e.clientY - rect.top, });
    const center = Vec2d.fromPoint({ x: canvas.width / 2, y: canvas.height / 2, });
    const max = new Vec2d(MAX_SPEED, MAX_SPEED);
    velocity = mouse.sub(center).clamp(max.neg(), max);
  };

  for (let i = 0; i < 10000; ++i) {
    const x = (Math.random() - 0.5) * 10000;
    const y = (Math.random() - 0.5) * 10000;
    blobs.push(new Vec2d(x, y));
  }

  window.requestAnimationFrame((t) => update(ctx, t));
};

window.onresize = () => {
  const canvas = document.getElementById("canvas") as HTMLCanvasElement;
  if (canvas == null) throw new Error("Canvas not found")
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
  if (ctx == null) throw new Error("Canvas context not found")
  resizeCanvas(ctx);
};
