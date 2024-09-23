
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

let circles = [];
let crosses = [];
let pendingClicks = [];

function animate(ctx, time) {
	if (!startTime) {
        startTime = time;
    }
	
	for (const evt of pendingClicks) {
		const h = Math.floor(Math.random() * 255);
		if (evt.kind == "circle") {
			circles.push({x: evt.x, y: evt.y, t: time, hue: h});
		} else if (evt.kind == "cross") {
			crosses.push({x: evt.x, y: evt.y, t: time, hue: h});
		}
	}
	pendingClicks = [];
	
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	for (const circle of circles) {
		const dt = time - circle.t;
		drawAnimatedCircle(ctx, dt, circle.x, circle.y, circle.hue);
	}
	
	for (const cross of crosses) {
		drawCross(ctx, cross.hue);
	}
	
	window.requestAnimationFrame(time => animate(ctx, time));
}

function drawAnimatedCircle(ctx, dt, x, y, hue) {
	const end = dt*((2*Math.PI) / 1000);
	ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, 50, 0, Math.min(end, 2*Math.PI));
	const percent = Math.trunc(100*Math.min(end, 2*Math.PI)/(2*Math.PI));
	ctx.strokeStyle = `hsla(${hue}, ${percent}%, 50%, 1)`;
	ctx.lineWidth = 5;
    ctx.stroke();
    ctx.restore();
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
