const canvas = document.getElementById("canvas");
let ctx;
const image = new Image();
image.src = "assest/auckland.jpg";
image.onload = () => {
  const width = 800;
  const height = 600;
  canvas.width = width;
  canvas.height = height;
  ctx = canvas.getContext("2d");
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
};

const blur = document.getElementById("blur_canvas");
const reset = document.getElementById("reset_canvas");
const result = document.getElementById("result_canvas");

blur.onclick = () => {
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const v1 = performance.now();
  const data = imageData.data;
  const weights = [0.0545, 0.2442, 0.4026, 0.2442, 0.0545];
  // const weights = [0.2, 0.2, 0.2, 0.2, 0.2]; // Box

  for (let i = 0; i < canvas.height * 4; i = i + 4) {
    for (let j = 0; j < canvas.width * 4; j = j + 4) {
      const redPixel = canvas.width * i + j;
      let red = 0;
      let green = 0;
      let blue = 0;
      for (let k = 0; k < 20; k = k + 4) {
        const pixel = j - 8 + k;
        const innerRedPixel = canvas.width * i + pixel;
        const weight = weights[k / 4];
        if (
          innerRedPixel > 0 &&
          innerRedPixel < canvas.height * canvas.width * 4
        ) {
          red += data[innerRedPixel] * weight;
          green += data[innerRedPixel + 1] * weight;
          blue += data[innerRedPixel + 2] * weight;
        } else {
          red += data[redPixel] * weight;
          green += data[redPixel + 1] * weight;
          blue += data[redPixel + 2] * weight;
        }
      }
      data[redPixel] = red;
      data[redPixel + 1] = green;
      data[redPixel + 2] = blue;
      data[redPixel + 3] = 255;
    }
  }

  for (let i = 0; i < canvas.height * 4; i = i + 4) {
    for (let j = 0; j < canvas.width * 4; j = j + 4) {
      const redPixel = canvas.width * i + j;
      let red = 0;
      let green = 0;
      let blue = 0;
      for (let k = 0; k < 5 * 4 * canvas.width; k = k + 4 * canvas.width) {
        const pixel = j - 8 * canvas.width + k;
        const innerRedPixel = canvas.width * i + pixel;
        const weight = weights[k / 4 / canvas.width];
        if (
          innerRedPixel > 0 &&
          innerRedPixel < canvas.height * 4 * canvas.width
        ) {
          red += data[innerRedPixel] * weight;
          green += data[innerRedPixel + 1] * weight;
          blue += data[innerRedPixel + 2] * weight;
        } else {
          red += data[redPixel] * weight;
          green += data[redPixel + 1] * weight;
          blue += data[redPixel + 2] * weight;
        }
      }
      data[redPixel] = red;
      data[redPixel + 1] = green;
      data[redPixel + 2] = blue;
      data[redPixel + 3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);
  const v2 = performance.now();
  result.innerHTML = `It takes ${v2 - v1}ms`;
};

reset.onclick = () => {
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  result.innerHTML = "";
};
