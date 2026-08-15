import { Point } from "./common";

function trueMod(v: number, max: number): number {
  return ((v % max) + max) % max;
}

export default class Vec2d implements Point {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  static fromPoint(p: Point) {
    return new Vec2d(p.x, p.y);
  }

  static fromPolar(r: number, theta: number) {
    return new Vec2d(r * Math.cos(theta), r * Math.sin(theta));
  }

  static random(maxX: number, maxY: number) {
    return new Vec2d(Math.random() * maxX, Math.random() * maxY);
  }

  toString() {
    return `[${this.x}, ${this.y}]`;
  }

  toPolar() {
    return {
      r: this.length(),
      theta: Math.atan2(this.y, this.x),
    };
  }

  normalize(): Vec2d {
    const len = this.length();
    return new Vec2d(this.x / len, this.y / len);
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
    return Math.hypot(this.x, this.y);
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
