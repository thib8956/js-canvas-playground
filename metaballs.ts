let pos = { x: 0, y: 0 }

function init() {
    const canvas = document.getElementById("canvas") as HTMLCanvasElement | null;
    if (!canvas) throw new Error("unable to get canvas HTML element");
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D | null;
    if (!ctx) throw new Error("unable to get canvas 2D context");

    ctx.canvas.width  = window.innerWidth;
    ctx.canvas.height = window.innerHeight;

    canvas.onmousemove = (evt) => { 
        const { clientX, clientY } = evt;
        //const index = (clientY * canvas.width + clientX) * 4;
        /*console.log("color", 
            pixels[index],
            pixels[index+1],
            pixels[index+2]);*/
        pos = { x: clientX, y: clientY };
    }

    window.requestAnimationFrame(t => update(ctx, t));
}

function update(ctx: CanvasRenderingContext2D, timestamp: number) {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    const image = ctx.getImageData(0, 0, width, height);
    const pixels = image.data;

    for (let x=0; x < width; x++) {
        for (let y=0; y < height; y++) {
            const index = (y * width + x) * 4;
            const d1 = 6000 / ((x - width/2)*(x - width/2) + (y - height/2)*(y - height/2));
            const d2 = 8000 / ((x - pos.x)*(x - pos.x) + (y - pos.y)*(y - pos.y));
            if (d1 + d2 >= 0.90 && d1 + d2 <= 1.00) {
                pixels[index] = 255*d1;
                pixels[index+1] = 0;
                pixels[index+2] = 255*d2;
                pixels[index+3] = 255; 
            } else {
                pixels[index] = 0; 
                pixels[index+1] = 0; 
                pixels[index+2] = 0; 
                pixels[index+3] = 255; 
            }
        }
    }

    ctx.putImageData(image, 0, 0);
    window.requestAnimationFrame(t => update(ctx, t));
}

init();

