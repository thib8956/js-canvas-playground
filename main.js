
function drawCross(ctx, hue) {
  ctx.beginPath();
  ctx.moveTo(200, 200);
  ctx.lineTo(300, 300);
  ctx.moveTo(300, 200);
  ctx.lineTo(200, 300);
  ctx.lineWidth = 5;
  ctx.strokeStyle = `hsla(${hue}, 100%, 50%, 1)`;
  ctx.stroke();
}

function drawCircle(ctx) {
  ctx.beginPath();
  // arc(x, y, radius, startAngle, endAngle)
  ctx.arc(75, 75, 50, 0, Math.PI * 2);
  ctx.stroke();
}

let startTime = undefined;

let shapes = [];
let pendingClicks = [];

function animate(ctx, time) {
	if (!startTime) {
        startTime = time;
    }
	
	for (const evt of pendingClicks) {
		const h = Math.floor(Math.random() * 255);
		if (evt.kind == "circle") {
			shapes.push({kind: evt.kind, x: evt.x, y: evt.y, t: time, hue: h});
		} else if (evt.kind == "cross") {
			shapes.push({kind: evt.kind, x: evt.x, y: evt.y, t: time, hue: h});
		}
	}
	pendingClicks = [];
	
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	for (const shape of shapes) {
		const dt = time - shape.t;
        switch (shape.kind) {
            case "circle": 
                drawAnimatedCircle(ctx, dt, shape.x, shape.y, shape.hue);
                break;
            case "cross":
                drawAnimatedCross(ctx, dt, shape.x, shape.y, shape.hue);
                break;
        }
	}
	
	window.requestAnimationFrame(time => animate(ctx, time));
}

function drawAnimatedCircle(ctx, dt, x, y, hue) {
	const end = dt*2*Math.PI/500;
	ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, 50, 0, Math.min(end, 2*Math.PI));
	const percent = Math.trunc(100*Math.min(end, 2*Math.PI)/(2*Math.PI));
	ctx.strokeStyle = `hsla(${hue}, ${percent}%, 50%, 1)`;
	ctx.lineWidth = 5;
    ctx.stroke();
    ctx.restore();
}

function drawAnimatedCross(ctx, dt, x, y, hue) {
    startPoint = { x: x-50, y: y-50 };
    ctx.beginPath();
    ctx.moveTo(startPoint.x, startPoint.y);

    delta = 100*dt/250;
    if (delta < 100) { // draw \
        d = Math.min(delta, 100);
        ctx.lineTo(startPoint.x + d, startPoint.y + d);
    } else { // draw /
        ctx.lineTo(startPoint.x + 100, startPoint.y + 100); // keep \ drawn
        ctx.moveTo(startPoint.x + 100, startPoint.y);
        d = Math.min(delta-100, 100);
        ctx.lineTo(startPoint.x +100 - d, startPoint.y + d);
    }

    ctx.lineWidth = 5;
	const percent = Math.trunc(100*Math.min(delta, 100)/100);
	ctx.strokeStyle = `hsla(${hue}, ${percent}%, 50%, 1)`;
    ctx.stroke();
}

function resizeCanvas(ctx) {
	ctx.canvas.width  = window.innerWidth;
	ctx.canvas.height = window.innerHeight;
}

function init() {
    const canvas = document.getElementById("canvas");
        if (canvas.getContext) {
            const ctx = canvas.getContext("2d");
			resizeCanvas(ctx); // Init canvas
			
			window.addEventListener('resize', () => resizeCanvas(ctx));
			window.requestAnimationFrame(time => animate(ctx, time))
			
			canvas.addEventListener("click", (evt) => {
				const {clientX, clientY} = evt;
				pendingClicks.push({x: clientX, y: clientY, kind: "circle"});
			});
			
			canvas.addEventListener("contextmenu", (evt) => {
				evt.preventDefault();
				const {clientX, clientY} = evt;
				pendingClicks.push({x: clientX, y: clientY, kind: "cross"});
			});
        }
}

init();
