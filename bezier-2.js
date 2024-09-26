import { lerp, drawCircle, drawLine, drawDashedLine, resizeCanvas, cubicBezier } from "./common.js"

const points = [];

function init() {
    const canvas = document.getElementById("canvas");
    if (canvas.getContext) {
        const ctx = canvas.getContext("2d");
        resizeCanvas(ctx); // Init canvas to full window size

        canvas.addEventListener("click", (evt) => {
            const {clientX, clientY} = evt;
            if (points.length < 4) {
                const p = {x: clientX, y: clientY};
                points.push(p);
                drawCircle(ctx, p, 1, 0xFF00FF);

                if (points.length == 4) {
                    const [a, b, c, d] = points;
                    drawDashedLine(ctx, a, b, 0xFF00FF);
                    drawDashedLine(ctx, b, c, 0xFF00FF);
                    drawDashedLine(ctx, c, d, 0xFF00FF);

                    const curve = cubicBezier(a, b, c, d);
                    for (let i=0; i < curve.length - 1; ++i) {
                        drawLine(ctx, curve[i], curve[i+1], 0xFFFFFF);
                    }
                }
            }
        });

        window.addEventListener('resize', () => resizeCanvas(ctx));
    }
}

init();

