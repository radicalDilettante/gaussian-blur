const canvas = document.getElementById("canvas");
let imageData, ctx;
const image = new Image();
image.src = "../auckland.jpg";
image.onload = () => {
  const width = 800;
  const height = 600;
  canvas.width = width;
  canvas.height = height;
  canvas.style.height = height * 0.9 + "px";
  ctx = canvas.getContext("2d");
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
};

const blur = document.getElementById("blur");
const reset = document.getElementById("reset");

blur.onclick = () => {
  const v1 = performance.now();
  const data = imageData.data;
  for (let i = 0; i < canvas.height * 4; i = i + 4) {
    for (let j = 0; j < canvas.width * 4; j = j + 4) {
      const redPixel = canvas.width * i + j;
      let red = 0;
      let green = 0;
      let blue = 0;
      for (let k = 0; k < 20; k = k + 4) {
        const pixel = j - 8 + k;
        const innerRedPixel = canvas.width * i + pixel;
        if (
          innerRedPixel > 0 &&
          innerRedPixel < canvas.height * canvas.width * 4
        ) {
          red += data[innerRedPixel];
          green += data[innerRedPixel + 1];
          blue += data[innerRedPixel + 2];
        } else {
          red += data[redPixel];
          green += data[redPixel + 1];
          blue += data[redPixel + 2];
        }
      }
      data[redPixel] = red * 0.2;
      data[redPixel + 1] = green * 0.2;
      data[redPixel + 2] = blue * 0.2;
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
        if (
          innerRedPixel > 0 &&
          innerRedPixel < canvas.height * 4 * canvas.width
        ) {
          red += data[innerRedPixel];
          green += data[innerRedPixel + 1];
          blue += data[innerRedPixel + 2];
        } else {
          red += data[redPixel];
          green += data[redPixel + 1];
          blue += data[redPixel + 2];
        }
      }
      data[redPixel] = red * 0.2;
      data[redPixel + 1] = green * 0.2;
      data[redPixel + 2] = blue * 0.2;
      data[redPixel + 3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);
  const v2 = performance.now();
  console.log(v2 - v1);
};

reset.onclick = () => {
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
};
