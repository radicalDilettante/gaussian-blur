const canvas = document.getElementById("canvas");
let imageData, ctx;
const image = new Image();
image.src = "../auckland.jpg";
image.onload = () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.height = window.innerHeight * 0.9 + "px";
  ctx = canvas.getContext("2d");
  ctx.drawImage(image, 0, 0);
  imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
};

const blur = document.getElementById("blur");
const reset = document.getElementById("reset");

blur.onclick = () => {
  const v1 = performance.now();
  const data = imageData.data;
  for (let i = 0; i < canvas.height * 4; i = i + 4) {
    for (let j = 0; j < canvas.width * 4; j = j + 4) {
      const r = canvas.width * i + j;
      data[r] = 255;
      data[r + 1] = 255;
      data[r + 2] = 255;
      data[r + 3] = 255;
    }
  }
  //   for (let i = 0; i < data.byteLength; i = i + 4) {
  //     data[i] = 255;
  //     data[i + 1] = 255;
  //     data[i + 2] = 255;
  //     data[i + 3] = 255;
  //   }
  ctx.putImageData(imageData, 0, 0);
  const v2 = performance.now();
  console.log(v2 - v1);
};

reset.onclick = () => {
  ctx.drawImage(image, 0, 0);
};
