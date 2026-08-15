import Vec2d from "./vec.js";
import { fillCircle, lerp, resizeCanvas, rgbToString } from "./common.js";

const HEAD_COLOR = 0xf43f5e;
const APPLE_COLOR = 0x58f474;
const SNAKE_RADIUS = 10;
const TRAIL_SPACING = 2;
const GROWTH_RATE = 10; // px per apple
const INITIAL_BODY_LENGTH = 40; // px of visible body at startup

const DIRECTIONS = {
  up: new Vec2d(0, -1),
  down: new Vec2d(0, 1),
  left: new Vec2d(-1, 0),
  right: new Vec2d(1, 0)
}

// state
let apple: Vec2d | undefined;
let head: Vec2d = new Vec2d(200, 200);
let trail: Vec2d[] = [];                 // history of head positions
let bodyLength = INITIAL_BODY_LENGTH;    // px of snake body
let direction: Vec2d = DIRECTIONS.right; // unit vector
let speed = 200;                         // px/s

let lastTime: number | undefined;
let paused = false;

function update(ctx: CanvasRenderingContext2D, time: number) {
  if (lastTime == null) lastTime = time;
  const dt = (time - lastTime) / 1000; // s
  lastTime = time;
  const bounds = new Vec2d(ctx.canvas.width, ctx.canvas.height);
  // update state
  if (!paused) {
    // move the head
    head = head.add(direction.scale(speed * dt));

    // record the trail (history of head positions)
    const last_head = trail[0];
    if (last_head.distance(head) > 0.5) trail.unshift(head)

    // collisions
    if (head.wrap(bounds).distance(apple!) < SNAKE_RADIUS * 2) {
      apple = randomApple(bounds);
      bodyLength += GROWTH_RATE;
      speed += 10;
    }

    trimTrail();
  }

  // drawing
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  const t = (Math.sin(0.01 * time) + 1.0) * 0.5;
  const apple_size = lerp(SNAKE_RADIUS, SNAKE_RADIUS * 0.9, t)
  fillCircle(ctx, apple!, apple_size, APPLE_COLOR); // draw apple
  drawSnake(ctx);

  window.requestAnimationFrame((t) => update(ctx, t));
}

function drawSnake(ctx: CanvasRenderingContext2D) {
  const bounds = new Vec2d(ctx.canvas.width, ctx.canvas.height);
  ctx.strokeStyle = rgbToString(HEAD_COLOR);
  ctx.lineWidth = SNAKE_RADIUS * 2;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  ctx.beginPath();
  let prev = head.wrap(bounds);
  ctx.moveTo(prev.x, prev.y);
  let acc = 0;
  for (let i = 0; i < trail.length - 1; ++i) {
    const len = trail[i].distance(trail[i + 1]);
    acc += len;
    const pos = trail[i + 1].wrap(bounds);
    const isWrapped = prev && (Math.abs(pos.x - prev.x) > bounds.x / 2 || Math.abs(pos.y - prev.y) > bounds.y / 2);
    if (isWrapped) {
      ctx.stroke();
      ctx.beginPath();
    }
    ctx.lineTo(pos.x, pos.y);
    prev = pos;

    if (acc >= bodyLength) { ctx.stroke(); return; }
  }
  ctx.stroke();
}

function trimTrail() {
  const trail_margin = 50; // px of slack to keep in the trail
  let remaining = bodyLength + trail_margin;
  let cut = trail.length;
  for (let i = 0; i < trail.length - 1; ++i) {
    const seg = trail[i].distance(trail[i + 1]);
    if (seg > remaining) {
      cut = i + 1;
      break;
    }
    remaining -= seg;
  }
  if (cut < trail.length) trail.length = cut;
}

function randomApple(bounds: Vec2d) {
  return Vec2d.random(bounds.x - 2 * SNAKE_RADIUS, bounds.y - 2 * SNAKE_RADIUS);
}

function init() {
  const canvas = document.getElementById("game-canvas") as HTMLCanvasElement | null;
  if (!canvas) throw new Error("unable to get canvas HTML element");
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D | null;
  if (!ctx) throw new Error("unable to get canvas 2D context");
  resizeCanvas(ctx);

  const bounds = new Vec2d(canvas.width, canvas.height);
  apple = randomApple(bounds);

  // seed the trail behind the head so the body is visible immediately
  for (let d = 0; d < INITIAL_BODY_LENGTH; d += TRAIL_SPACING) {
    trail.push(new Vec2d(head.x - d, head.y));
  }

  window.onkeydown = (evt) => {
    let new_direction: Vec2d | undefined;
    switch (evt.key) {
      case "ArrowUp": case "z": new_direction = DIRECTIONS.up; break;
      case "ArrowDown": case "s": new_direction = DIRECTIONS.down; break;
      case "ArrowLeft": case "q": new_direction = DIRECTIONS.left; break;
      case "ArrowRight": case "d": new_direction = DIRECTIONS.right; break;
      case "p": paused = !paused; break;
    }
    if (!new_direction) return;
    if (new_direction.x === -direction.x && new_direction.y === -direction.y) return;
    if (new_direction.x === direction.x && new_direction.y === direction.y) return;
    direction = new_direction;
  };

  window.requestAnimationFrame((t) => update(ctx, t));
}

init();
