import { fillCircle, resizeCanvas } from "./common.js";
import Vec2d from "./vec.js";

interface Ball {
  pos: Vec2d;
  vel: Vec2d;
}

const gravity = new Vec2d(0, 1000); // px/s^2
let lastTime: number | undefined = undefined;

const box = [
  new Vec2d(300, 17),
  new Vec2d(582, 300),
  new Vec2d(300, 582),
  new Vec2d(17, 300),
];

const balls: Ball[] = [];

function update(ctx: CanvasRenderingContext2D, timestamp: number) {
  if (lastTime == null) lastTime = timestamp;
  const dt = (timestamp - lastTime) / 1000; // s
  lastTime = timestamp;

  const [a, b, c, d] = box;
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  // update
  for (let i = balls.length - 1; i >= 0; i--) {
    let ball = balls[i];

    const steps = 10;
    const stepDt = dt / steps;
    for (let step = 0; step < steps; step++) { // subdive the time step to improve accuracy
      balls[i].pos = ball.pos.add(ball.vel.scale(stepDt)); // update pos
      if (balls[i].pos.y > ctx.canvas.height) {
        balls.splice(i, 1); // remove if out of bounds
        continue;
      }
      ball.vel = ball.vel.add(gravity.scale(stepDt)); // apply gravity

      // check collisions with each segment of the box
      const friction = 0.5;
      const restitution = 0.8;
      ball = resolve_collision(ball, a, b, { friction, restitution});
      ball = resolve_collision(ball, b, c, { friction, restitution});
      ball = resolve_collision(ball, c, d, { friction, restitution});
      ball = resolve_collision(ball, d, a, { friction, restitution});
    }

    balls[i] = ball;
  }

  // drawing
  for (const p of balls) {
    fillCircle(ctx, p.pos, 5, 0xff00ff);
  }

  // draw box
  ctx.beginPath();
  ctx.moveTo(box[0].x, box[0].y);
  ctx.lineTo(box[1].x, box[1].y);
  ctx.lineTo(box[2].x, box[2].y);
  ctx.lineTo(box[3].x, box[3].y);
  ctx.closePath();
  ctx.strokeStyle = "#00ff00";
  ctx.stroke();

  window.requestAnimationFrame((t) => update(ctx, t));
}

function resolve_collision(ball: Ball, a: Vec2d, b: Vec2d, { restitution = 1, friction = 0 }: { restitution?: number, friction?: number } = {}) {
  const ab = b.sub(a);
  const ab_sqlen = ab.dot(ab);
  const point = ball.pos.sub(a); // pos of the ball relative to a

  // t reprents the position of the ball along the segment (0 = a, 1 = b)
  const t = clamp(point.dot(ab) / ab_sqlen, 0, 1);  // normalize dot product, then clamp if outside of the segment
  const closest_point = a.add(ab.scale(t));
  const offset = ball.pos.sub(closest_point); // vector from the point to the segment

  if (offset.length() < 5) {
    console.log("collide")
    const normal = offset.normalize();
    // Decompose velocity into normal and tangent components
    const norm_speed = ball.vel.dot(normal);
    const norm_velocity = normal.scale(norm_speed);
    const tangeant_velocity = ball.vel.sub(norm_velocity);
    // Only modify velocity if moving into the segment
    if (norm_speed < 0) {
      const new_normal_velocity = normal.scale(-norm_speed * restitution);
      const new_tangeant_velocity = tangeant_velocity.scale(1 - friction);
      ball.vel = new_normal_velocity.add(new_tangeant_velocity);
      return ball;
    }
  }

  return ball;
}

function clamp(n: number, min: number, max: number) {
  return Math.max(Math.min(n, max), min)
}

function addBall(x: number, y: number) {
  balls.push({
    pos: Vec2d.fromPoint({ x, y }),
    vel: new Vec2d(0, 0) // initial velocity is 0, but the ball will be accelerated by gravity
  });
}

window.onload = () => {
  const canvas = document.getElementById("canvas") as HTMLCanvasElement;
  if (canvas == null) throw new Error("Canvas not found")
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
  if (ctx == null) throw new Error("Canvas context not found")
  resizeCanvas(ctx);
  canvas.onclick = (evt: MouseEvent) => {
    const rect = canvas.getBoundingClientRect();
    const x = evt.clientX - rect.left;
    const y = evt.clientY - rect.top;
    addBall(x, y);
  };
  canvas.ontouchstart = (evt: TouchEvent) => {
    const rect = canvas.getBoundingClientRect();
    console.assert(evt.touches.length == 1, "mutiple touches are not supported");
    const x = evt.touches[0].clientX - rect.left;
    const y = evt.touches[0].clientY - rect.top;
    addBall(x, y);
  };

  window.requestAnimationFrame((t) => update(ctx, t));
};

window.onresize = () => {
  const canvas = document.getElementById("canvas") as HTMLCanvasElement;
  if (canvas == null) throw new Error("Canvas not found")
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
  if (ctx == null) throw new Error("Canvas context not found")
  resizeCanvas(ctx);
};
