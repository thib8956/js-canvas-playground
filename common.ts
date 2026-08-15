export interface Point {
    x: number;
    y: number;
}

export function lerpPoint(a: Point, b: Point, p: number) {
    return {
        x: a.x + (b.x - a.x) * p,
        y: a.y + (b.y - a.y) * p
    };
}

export function lerpRgb(a: number, b: number, t: number) {
  // extract rgb components from a and b
  const [ra, ga, ba] = [a >> 16, (a >> 8) & 0xff, a & 0xff];
  const [rb, gb, bb] = [b >> 16, (b >> 8) & 0xff, b & 0xff];
  const red = lerp(ra, rb, t);
  const green = lerp(ga, gb, t);
  const blue = lerp(ba, bb, t);
  return (red << 16) | (green << 8) | blue
}

export function lerp(a: number, b: number, t: number) {
  return (1 - t) * a + b * t;
}

export function quadraticBezier(a: Point, b: Point, c: Point, res=0.05) {
    const eps = 0.001; // to prevent issues with float comparaison (p <= 1)
    const curve = [];
    for (let p = 0; p - 1 < eps; p += res) {
        const ab = lerpPoint(a, b, p);
        const bc = lerpPoint(b, c, p);
        const abc = lerpPoint(ab, bc, p);
        curve.push(abc);
    }
    return curve;
}

export function cubicBezier(a: Point, b: Point, c: Point, d: Point, res=0.05) {
    const eps = 0.001; // to prevent issues with float comparaison (p <= 1)
    const curve = [];
    for (let p = 0; p - 1 < eps; p += res) {
        const ab = lerpPoint(a, b, p);
        const bc = lerpPoint(b, c, p);
        const cd = lerpPoint(c, d, p);
        const abc = lerpPoint(ab, bc, p);
        const bcd = lerpPoint(bc, cd, p);
        const abcd = lerpPoint(abc, bcd, p);
        curve.push(abcd);
    }
    return curve;
}

export function catmullRom(points: Point[],  { res = 0.05, looped = false }: { res?: number; looped?: boolean } = {}) {
  let curve: Point[] = [];
  // In non-looped mode, the curve goes from `points[1]` to `points[points.length - 2]`: the first
  // and last points act as control points only.
  // In looped mode, just treat the array as a circular array.
  const tmax = looped ? points.length : points.length - 3;
  for (let t = 0; t < tmax; t += res) {
    const indices = looped ? getPointIndicesLooped(points, t) : getPointIndices(points, t);
    const pos = getSplinePoint(...indices, t);
    curve.push(pos);
  }
  return curve;

  function getPointIndices(points: Point[], t: number): [number, number, number, number] {
    // Select 4 consecutive control points in the points array according to t.
    // t = 1 => first point, t = 2 => second point, etc.
    const p1 = Math.floor(t) + 1;
    const p2 = p1 + 1;
    const p3 = p2 + 1;
    const p0 = p1 - 1;
    return [p0, p1, p2, p3];
  }

  function getPointIndicesLooped(points: Point[], t: number): [number, number, number, number] {
    const p1 = Math.floor(t);
    const p2 = (p1 + 1) % points.length;
    const p3 = (p2 + 1) % points.length;
    const p0 = (p1 - 1 + points.length) % points.length;
    return [p0, p1, p2, p3];
  }

  function getSplinePoint(p0: number, p1: number, p2: number, p3: number, t: number): Point {
    // Normalize t to [0, 1]
    t = t - Math.floor(t);

    const tt = t * t;
    const ttt = tt * t;

    // Catmull-Rom basis functions, derived from the matrix form
    const q1 = -ttt + 2.0 * tt - t;
    const q2 = 3.0 * ttt - 5.0 * tt + 2.0;
    const q3 = -3.0 * ttt + 4.0 * tt + t;
    const q4 = ttt - tt;

    // Interpolate x and y coordinates
    const tx = 0.5 * (points[p0].x * q1 + points[p1].x * q2 + points[p2].x * q3 + points[p3].x * q4);
    const ty = 0.5 * (points[p0].y * q1 + points[p1].y * q2 + points[p2].y * q3 + points[p3].y * q4);

    return { x: tx, y: ty };
  }
}

export function resizeCanvas(ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.canvas.width = ctx.canvas.clientWidth;
    ctx.canvas.height = ctx.canvas.clientHeight;
}

export function drawCircle(ctx: CanvasRenderingContext2D, center: Point, radius: number, color: number) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(center.x, center.y, radius, 0, 2*Math.PI);
    ctx.strokeStyle = rgbToString(color);
    ctx.lineWidth = 5;
    ctx.stroke();
    ctx.restore();
}

export function fillCircle(ctx: CanvasRenderingContext2D, center: Point, radius: number, color: number) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(center.x, center.y, radius, 0, 2 * Math.PI);
  ctx.fillStyle = rgbToString(color);
  ctx.fill();
  ctx.restore();
}

export function drawLine(ctx: CanvasRenderingContext2D, start: Point, end: Point, color: number, dashed=false) {
    ctx.save();
    ctx.beginPath();
    if (dashed) ctx.setLineDash([5, 5]);
    ctx.strokeStyle = rgbToString(color);
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
    ctx.restore();
}

export function rgbToString(color: number) {
  return `#${color.toString(16).padStart(6, '0')}`;
}

export function drawDashedLine(ctx: CanvasRenderingContext2D, start: Point, end: Point, color: number) {
    drawLine(ctx, start, end, color, true);
}

export function drawPoints(ctx: CanvasRenderingContext2D, points: Point[]) {
    for (const p of points) {
        drawCircle(ctx, p, 2, 0xFF00FF);
    }
}

export function drawCurve(ctx: CanvasRenderingContext2D, curve: Point[]) {
    for (let i=0; i < curve.length - 1; ++i) {
        drawLine(ctx, curve[i], curve[i+1], 0xFFFFFF);
    }
}
