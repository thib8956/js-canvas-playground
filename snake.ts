import Vec2d from "./vec.js";
import { resizeCanvas, fillCircle, lerp, lerpRgb } from "./common.js";

// constants
const SNAKE_RADIUS = 10;
const SNAKE_PADDING = 10;
const SEGMENT_SPACING = SNAKE_RADIUS + SNAKE_PADDING;
const HEAD_COLOR = 0xf43f5e;
const TAIL_COLOR = 0xf4c3cc;
const APPLE_COLOR = 0x58f474;

const DIRECTIONS = {
  up: new Vec2d(0, -1),
  down: new Vec2d(0, 1),
  left: new Vec2d(-1, 0),
  right: new Vec2d(1, 0)
}

function initSnake(pos: Vec2d, len: number) {
  return Array.from({ length: len }, (_, i) => pos.add(DIRECTIONS.left.scale(i * SEGMENT_SPACING)));
}
// state
let snake = initSnake(new Vec2d(200, 200), 10);
let apple: Vec2d | undefined = undefined;
let velocity: Vec2d = new Vec2d(0, 0); // unit vector
let speed = 200; // px/s
let interpolation_factor = 10;
let paused = false;

let lastTime: number | undefined = undefined;

function drawSnake(ctx: CanvasRenderingContext2D, bounds: Vec2d) {
  for (let i = 0; i < snake.length - 1; ++i) {
    // draw a trail of overlapping circles by interpolating between the body positions
    for (let j = 0; j < interpolation_factor; ++j) {
      const pos = snake[i].lerp(snake[i + 1], j / interpolation_factor).wrap(bounds);
      const t = (i + j / interpolation_factor) / snake.length;
      const color = lerpRgb(HEAD_COLOR, TAIL_COLOR, t);
      const size = lerp(SNAKE_RADIUS, SNAKE_RADIUS / 2, t);
      fillCircle(ctx, pos, size, color)
    }
  }
  const tail = snake[snake.length - 1].wrap(bounds)
  fillCircle(ctx, tail, SNAKE_RADIUS / 2, TAIL_COLOR)
}

function drawSnakeTube(ctx: CanvasRenderingContext2D, pts: Vec2d[]) {
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
  ctx.strokeStyle = "#f43f5e";
  ctx.lineWidth = SNAKE_RADIUS * 2;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.stroke();
}

function update(ctx: CanvasRenderingContext2D, time: number) {
  if (lastTime == null) lastTime = time;
  const dt = (time - lastTime) / 1000; // s
  lastTime = time;
  apple = apple as Vec2d;
  const bounds = new Vec2d(ctx.canvas.width, ctx.canvas.height);

  if (!paused) {
    // update head position
    snake[0] = snake[0].add(velocity.scale(speed * dt))
    // update body position by following the segment in front
    for (let i = 1; i < snake.length; i++) {
      const leader = snake[i - 1];
      const delta = leader.sub(snake[i]);
      const dist = delta.length();
      if (dist > SEGMENT_SPACING) {
        const unit = delta.scale(1 / dist); // unit vector in direction of delta
        const target = leader.sub(unit.scale(SEGMENT_SPACING));
        snake[i] = target;
      }
    }

    // collisions
    // convert snake_head coords to screen space
    //const head = wrapCoords(snake_body[0], bounds);
    const head = snake[0].wrap(bounds)
    if (head.distance(apple) < SNAKE_RADIUS * 2) {
      apple = Vec2d.random(bounds.x, bounds.y)
      const { x: lastX, y: lastY } = snake[snake.length - 1];
      snake.push(new Vec2d(lastX, lastY));
      speed += 10;
      setStatusLine(`speed = ${speed}`)
    }
  }

  // drawing
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  const t = (Math.sin(0.01 * time) + 1.0) * 0.5;
  const apple_size = lerp(SNAKE_RADIUS, SNAKE_RADIUS * 0.9, t)
  fillCircle(ctx, apple, apple_size, APPLE_COLOR); // draw apple
  drawSnake(ctx, bounds);

  window.requestAnimationFrame((t) => update(ctx, t));
}

function init() {
  const canvas = document.getElementById("game-canvas") as HTMLCanvasElement | null;
  if (!canvas) throw new Error("unable to get canvas HTML element");
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D | null;
  if (!ctx) throw new Error("unable to get canvas 2D context");
  resizeCanvas(ctx);

  apple = Vec2d.random(canvas.width, canvas.height)

  canvas.onmousemove = () => {};

  canvas.onclick = () => {};

  window.onkeydown = (evt) => {
    let new_direction: Vec2d | undefined;
    switch (evt.key) {
      case "ArrowUp": case "z": new_direction = DIRECTIONS.up; break;
      case "ArrowDown": case "s": new_direction = DIRECTIONS.down; break;
      case "ArrowLeft": case "q": new_direction = DIRECTIONS.left; break;
      case "ArrowRight": case "d": new_direction = DIRECTIONS.right; break;
      case "j": interpolation_factor++; break;
      case "k": interpolation_factor = Math.max(1, interpolation_factor-1); break;
      case "Space": case "p":
        paused = !paused;
        setStatusLine(paused ? "paused" : "", null);
        break;
    }
    if (evt.key === "k" || evt.key === "j") setStatusLine(`interpolation factor: ${interpolation_factor}`)
    if (!new_direction) return;
    if (new_direction.x === -velocity.x && new_direction.y === -velocity.y) return; // no 180° turns
    if (new_direction.x === velocity.x && new_direction.y === velocity.y) return; // no 180° turns
    velocity = new_direction;
  };

  window.requestAnimationFrame((t) => update(ctx, t));
}

function setStatusLine(text: string, timeout_ms: number | null = 2000) {
  const status_line = document.getElementById("status-line");
  if (!status_line) {
    throw new Error("unable to get status line HTML element");
  }
  status_line.innerText = text;

  if (timeout_ms != null) {
    setTimeout(() => {
      status_line.innerText = "";
    }, timeout_ms);
  }
}

init();
