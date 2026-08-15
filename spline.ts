import {
    Point, resizeCanvas,
    cubicBezier, quadraticBezier, drawCurve, drawPoints,
    catmullRom
} from "./common.js"

let mode: "catmull" | "bezier" = "bezier";
let looped = false;


function draw(ctx: CanvasRenderingContext2D, points: Point[]) {
  let start = 0;
  if (mode === "bezier") {
    while (true) {
      const sl = points.slice(start, start + 4);
      if (sl.length === 4) {
        const bezier = cubicBezier(...(sl as [Point, Point, Point, Point]));
        drawCurve(ctx, bezier);
        start += 3;
      } else if (sl.length === 3) {
        const bezier = quadraticBezier(...(sl as [Point, Point, Point]));
        drawCurve(ctx, bezier);
        start += 2;
      } else {
        break;
      }
    }
  } else if (mode === "catmull") {
    // Draw Catmull-Rom Spline.
    const catmull = catmullRom(points, { looped: looped });
    drawCurve(ctx, catmull);
  }
  drawPoints(ctx, points);
  setStatusLine();
}

function init() {
    const canvas = document.getElementById("canvas") as HTMLCanvasElement | null;
    if (!canvas) throw new Error("unable to get canvas HTML element");
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D | null;
    if (!ctx) throw new Error("unable to get canvas 2D context");
    resizeCanvas(ctx);

    let selection: number | undefined = undefined;
    let points = [
        { x: 227, y: 434 },
        { x: 341, y: 234 },
        { x: 649, y: 255 },
        { x: 765, y: 450 },
        { x: 800, y: 500 },
        { x: 850, y: 450 },
        { x: 900, y: 550 },
    ];

    resizeCanvas(ctx); // Init canvas
    draw(ctx, points);

    canvas.oncontextmenu = (evt) => {
        evt.preventDefault();
        points = [];
        // redraw
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        draw(ctx, points);
    };

    canvas.onmousedown = (evt: MouseEvent) => {
        const { clientX, clientY } = evt;
        const rect = ctx.canvas.getBoundingClientRect();
        const click = { x: clientX - rect.left, y: clientY - rect.top };  // screen to canvas coordinates

        for (const p of points) {
            if (Math.abs(p.x - click.x) < 10 && Math.abs(p.y - click.y) < 10) {
                selection = points.indexOf(p);
            }
        }
        if (selection === undefined) {
            points.push({ x: click.x, y: click.y });
            // redraw
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            draw(ctx, points);
            setStatusLine();
        }
    };

    canvas.ontouchstart = (evt: TouchEvent) => {
        console.assert(evt.touches.length === 1, "Multiple touch points are not supported");
        const { clientX, clientY } = evt.touches[0];
        for (const p of points) {
            if (Math.abs(p.x - clientX) < 10 && Math.abs(p.y - clientY) < 10) {
                selection = points.indexOf(p);
            }
        }
        if (selection === undefined) {
            points.push({ x: clientX, y: clientY });
            // redraw
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            draw(ctx, points);
        }
    };

    canvas.onmousemove = (evt: MouseEvent) => {
        if (selection !== undefined) {
            points[selection].x = evt.clientX;
            points[selection].y = evt.clientY;
            // redraw
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            draw(ctx, points);
            setStatusLine();
        }
    };

    canvas.ontouchmove = (evt: TouchEvent) => {
        console.assert(evt.touches.length === 1, "Multiple touch points are not supported");
        const { clientX, clientY } = evt.touches[0];
        if (selection !== undefined) {
            points[selection].x = clientX;
            points[selection].y = clientY;
            // redraw
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            draw(ctx, points);
            setStatusLine();
        }
    };

    canvas.onmouseup = () => {
        selection = undefined;
    };

    canvas.ontouchend = () => {
        selection = undefined;
    };

    window.onresize = () => {
      resizeCanvas(ctx);
      draw(ctx, points);
      setStatusLine();
    };

    window.onkeydown = (evt) => {
      if (evt.key === " ") mode = mode === "bezier" ? "catmull" : "bezier";
      if (evt.key === "l") looped = !looped;

      // redraw
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      draw(ctx, points);
      setStatusLine();
    };
}

function setStatusLine() {
  const statusLine = document.getElementById("status-line");
  if (!statusLine) throw new Error("Could not find status line");

  let msg = "";
  switch (mode) {
    case "bezier": {
      msg = "Bezier spline demo";
      break;
    }
    case "catmull": {
      msg = looped ? "Catmull-Rom spline demo (looped)" : "Catmull-Rom spline demo";
      break;
    }
  }
  statusLine.innerText = msg;
}

init();
