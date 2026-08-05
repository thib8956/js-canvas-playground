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
    return new Vec2d(this.x + other.x, this.y + other.y);
  }

  sub(other: Vec2d): Vec2d {
    return new Vec2d(this.x - other.x, this.y - other.y);
  }

  length(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  distance(other: Vec2d): number {
    return this.sub(other).length();
  }

  lerp(other: Vec2d, t: number): Vec2d {
    // (1-t)*A + B*t
    return this.scale(1 - t).add(other.scale(t));
  }

  clamp(min: Vec2d, max: Vec2d): Vec2d {
    return new Vec2d(
      Math.min(Math.max(this.x, min.x), max.x),
      Math.min(Math.max(this.y, min.y), max.y)
    );
  }

  wrap(bounds: Vec2d) {
    return new Vec2d(trueMod(this.x, bounds.x), trueMod(this.y, bounds.y));
  }
}

// constants
const SNAKE_SIZE = 20;
const SNAKE_PADDING = 10;
const SEGMENT_SPACING = SNAKE_SIZE + SNAKE_PADDING;
const HEAD_COLOR = 0xf43f5e;
const TAIL_COLOR = 0xf4c3cc;
const APPLE_COLOR = 0x58f474;

const DIRECTIONS = {
  up: new Vec2d(0, -1),
  down: new Vec2d(0, 1),
  left: new Vec2d(-1, 0),
  right: new Vec2d(1, 0)
}

// state
let snake = [new Vec2d(100, 100), new Vec2d(100 - SEGMENT_SPACING, 100), new Vec2d(100 - SEGMENT_SPACING * 2, 100)];
let apple: Vec2d | undefined = undefined;
let velocity: Vec2d = new Vec2d(0, 0); // unit vector
let speed = 200; // px/s
let interpolation_factor = 10;
let paused = false;

// utility functions
function trueMod(v: number, max: number): number {
  return ((v % max) + max) % max;
}

function resizeCanvas(ctx: CanvasRenderingContext2D) {
  ctx.canvas.width = ctx.canvas.clientWidth;
  ctx.canvas.height = ctx.canvas.clientHeight;
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

function drawCircle(ctx: CanvasRenderingContext2D, center: Vec2d, radius: number, color: string) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(center.x, center.y, radius, 0, 2 * Math.PI);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.restore();
}

function getRandomPos(maxX: number, maxY: number): Vec2d {
  return new Vec2d(Math.random() * maxX, Math.random() * maxY)
}

function lerpColor(a: number, b: number, t: number) {
  const red = lerp(a >> 16, b >> 16, t)
  const green = lerp((a >> 8) & 0xff, (b >> 8) & 0xff, t)
  const blue = lerp(a & 0xff, b & 0xff, t)
  return (red << 16) | (green << 8) | blue
}

function lerp(a: number, b: number, t: number) {
  return (1-t)*a + b*t
}

let lastTime: number | undefined = undefined;

function update(ctx: CanvasRenderingContext2D, t: number) {
  if (lastTime == null) lastTime = t;
  const dt = (t - lastTime) / 1000; // s
  lastTime = t;
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
        snake[i] = leader.sub(unit.scale(SEGMENT_SPACING));
      }
    }

    // collisions
    // convert snake_head coords to screen space
    //const head = wrapCoords(snake_body[0], bounds);
    const head = snake[0].wrap(bounds)
    // check if snake head is overlapping apple
    if (head.distance(apple) < SNAKE_SIZE) {
      apple = getRandomPos(ctx.canvas.width, ctx.canvas.height);
      const { x: lastX, y: lastY } = snake[snake.length - 1];
      snake.push(new Vec2d(lastX, lastY));
      speed += 10;
      setStatusLine(`speed = ${speed}`)
    }
  }

  // draw apple
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  drawCircle(ctx, apple, SNAKE_SIZE / 2, `#${APPLE_COLOR.toString(16)}`)

  // draw snake
  for (let i = 0; i < snake.length - 1; ++i) {
    // draw a trail of overlapping circles by interpolating between the body positions
    for (let j = 0; j < interpolation_factor; ++j) {
      const pos = snake[i].lerp(snake[i + 1], j / interpolation_factor).wrap(bounds);
      const color = lerpColor(HEAD_COLOR, TAIL_COLOR, (i + j / interpolation_factor) / snake.length)
      drawCircle(ctx, pos, SNAKE_SIZE / 2, `#${color.toString(16)}`)
    }
  }
  const tail = snake[snake.length - 1].wrap(bounds)
  drawCircle(ctx, tail, SNAKE_SIZE / 2, `#${TAIL_COLOR.toString(16)}`)

  window.requestAnimationFrame((t) => update(ctx, t));
}


function init() {
  const canvas = document.getElementById("game-canvas") as HTMLCanvasElement | null;
  if (!canvas) throw new Error("unable to get canvas HTML element");
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D | null;
  if (!ctx) throw new Error("unable to get canvas 2D context");
  resizeCanvas(ctx);

  apple = getRandomPos(canvas.width, canvas.height)

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
      case "p":
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
