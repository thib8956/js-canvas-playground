const canvas = document.getElementById("game") as HTMLCanvasElement | null;
if (!canvas) throw new Error("unable to get canvas HTML element");
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D | null;
if (!ctx) throw new Error("unable to get canvas 2D context");

const img = new Image();
img.crossOrigin = "anonymous";
img.src = "/rose.png";
img.onload = () => {
    /*canvas.offscreenCanvas = document.createElement("canvas");
    canvas.offscreenCanvas.height = img.height;
    canvas.offscreenCanvas.width = img.width;
    canvas.offscreenCanvas.getContext("2d").drawImage(img, 0, 0);
    */
    ctx.drawImage(img, 0, 0);
};

function invert(imgData: ImageData) {
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
        //const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        data[i] = 255 - data[i];
        data[i+1] = 255 - data[i+1];
        data[i+2] = 255 - data[i+2];
    }
}

function greyscale(imgData: ImageData) {
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        data[i] = avg;
        data[i+1] = avg;
        data[i+2] = avg;
    }
}

function clamp(x: number, min: number, max: number) {
    return Math.min(Math.max(x, min), max);
}

function convolve(imageData: ImageData, kernel: number[]) {
    const width = imageData.width;
    const height = imageData.height;
    const data = imageData.data;
    const out = new ImageData(width, height);
    const kernelSize = Math.sqrt(kernel.length); // Assuming kernel is square
    const halfKernel = Math.floor(kernelSize / 2);

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let r = 0, g = 0, b = 0;

            for (let ky = -halfKernel; ky <= halfKernel; ky++) {
                for (let kx = -halfKernel; kx <= halfKernel; kx++) {
                    const px = x + kx;
                    const py = y + ky;
                    if (px >= 0 && px < width && py >= 0 && py < height) {
                        const idx = (py * width + px) * 4;
                        const kernelValue = kernel[(ky + halfKernel) * kernelSize + (kx + halfKernel)];
                        r += data[idx] * kernelValue;
                        g += data[idx + 1] * kernelValue;
                        b += data[idx + 2] * kernelValue;
                    }
                }
            }

            out.data[(y*width+x)*4] = r;
            out.data[(y*width+x)*4 + 1] = g;
            out.data[(y*width+x)*4 + 2] = b;
            out.data[(y*width+x)*4 + 3] = data[(y*width+x) * 4 + 3]; // preserve original alpha
        }
    }

    return out;
}

// multiply two 3x3 matrices
function matMult(a: number[], b: number[]) {
    const result = new Array(9).fill(0);
    for (let j = 0; j < 3; ++j){ 
        for (let i = 0; i < 3; ++i) {
            for (let k = 0; k < 3; ++k) {
                result[j*3+i] += a[j*3+k] * b[k*3+i];
            }
        }
    }
    return result;
}
 
canvas.onclick = () => {
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    ctx.clearRect(0, 0, canvas.height, canvas.width);
    //invert(imgData);
    //greyscale(imgData);
    //const identityKernel = [0, 0, 0, 0, 1, 0, 0, 0, 0];
    const gaussianKernel = [0.075, 0.124, 0.075, 0.124, 0.204, 0.124, 0.075, 0.124, 0.075]
    const convolved = convolve(imgData, gaussianKernel);
    ctx.putImageData(convolved, 0, 0);
};


const matrixA = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const matrixB = [9, 8, 7, 6, 5, 4, 3, 2, 1];

const result = matMult(matrixA, matrixB);
console.log(result);
