import { lerp, drawCircle, drawLine, drawDashedLine, resizeCanvas } from "./common.js"

const points = [];

function cubicBezier(a, b, c, d, res=0.05) {
    const eps = 0.001; // to prevent issues with float comparaison (p <= 1)
    const curve = [];
    for (let p = 0; p - 1 < eps; p += res) {
        const ab = lerp(a, b, p); 
        const bc = lerp(b, c, p); 
        const cd = lerp(c, d, p); 
        const abc = lerp(ab, bc, p);
        const bcd = lerp(bc, cd, p);
        const abcd = lerp(abc, bcd, p);
        curve.push(abcd);
        console.log(p);
    }
    return curve;
}

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

