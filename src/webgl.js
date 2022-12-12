const utils = new WebGLUtils();
const canvasWebgl = document.getElementById("canvas_webgl");
canvasWebgl.width = 800;
canvasWebgl.height = 600;
const gl = utils.getGLContext(canvasWebgl);
gl.clearColor(0.0, 0.0, 0.0, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

const kernels = {
  edgeEnhancement: [
    1 / 16,
    2 / 16,
    1 / 16,
    2 / 16,
    4 / 16,
    2 / 16,
    1 / 16,
    2 / 16,
    1 / 16,
  ],
};

//Step1:
const vertexShader = `#version 300 es
precision mediump float;
in vec2 position;
in vec2 texCoords;
out vec2 textureCoords;
void main () {
    gl_Position = vec4(position.x, position.y * -1.0, 0.0, 1.0);
    textureCoords = texCoords;
}
`;

const fragmentShader = `#version 300 es
precision mediump float;
in vec2 textureCoords;
uniform sampler2D uImage;
uniform float activeIndex, uKernel[9], kernelWeight;
out vec4 color;
uniform bool isKernel;
vec4 applyKernel () {
    ivec2 dims = textureSize(uImage, 0);
    vec2 pixelJumpFactor = 2.0/vec2(dims);
    vec4 values =
    texture(uImage, textureCoords + pixelJumpFactor * vec2(-1, -1)) * uKernel[0] +
    texture(uImage, textureCoords + pixelJumpFactor * vec2(0, -1)) * uKernel[1] + 
    texture(uImage, textureCoords + pixelJumpFactor * vec2(1, -1)) * uKernel[2] + 
    texture(uImage, textureCoords + pixelJumpFactor * vec2(-1,  0)) * uKernel[3] +
    texture(uImage, textureCoords + pixelJumpFactor * vec2(0,  0)) * uKernel[4] + 
    texture(uImage, textureCoords + pixelJumpFactor * vec2(1,  0)) * uKernel[5] + 
    texture(uImage, textureCoords + pixelJumpFactor * vec2(-1,  1)) * uKernel[6] + 
    texture(uImage, textureCoords + pixelJumpFactor * vec2(0,  1)) * uKernel[7] + 
    texture(uImage, textureCoords  + pixelJumpFactor * vec2(1,  1)) * uKernel[8];
    
    vec4 updatedPixels = vec4(vec3((values/kernelWeight).rgb), 1.0);
    return updatedPixels;
}
void main() {
    vec4 tex = texture(uImage, textureCoords);
    if (isKernel) {
        tex = applyKernel();
    }
    color = tex;
}
`;

const program = utils.getProgram(gl, vertexShader, fragmentShader);

const currSX = -1.0,
  currSY = -1.0,
  currEX = 1.0,
  currEY = 1.0;
const lastSX = -1.0,
  lastSY = -1.0,
  lastEX = 1.0,
  lastEY = 1.0;
let vertices = utils.prepareRectVec2(currSX, currSY, currEX, currEY);
const textureCoordinates = utils.prepareRectVec2(0.0, 0.0, 1.0, 1.0);

let buffer = utils.createAndBindBuffer(
  gl.ARRAY_BUFFER,
  gl.STATIC_DRAW,
  new Float32Array(vertices)
);
const texBuffer = utils.createAndBindBuffer(
  gl.ARRAY_BUFFER,
  gl.STATIC_DRAW,
  new Float32Array(textureCoordinates)
);

const getCoords = () => {
  const obj = {
    startX: AR.x1,
    startY: AR.y1,
    endX: AR.x2,
    endY: AR.y2,
  };
  return utils.getGPUCoords(obj); //-1 to +1
};

let texture;
const webglImage = new Image();
let AR = null;
webglImage.src = "assest/auckland.jpg";
webglImage.onload = () => {
  AR = utils.getAspectRatio(gl, webglImage);
  const v = getCoords();
  vertices = utils.prepareRectVec2(v.startX, v.startY, v.endX, v.endY);
  buffer = utils.createAndBindBuffer(
    gl.ARRAY_BUFFER,
    gl.STATIC_DRAW,
    new Float32Array(vertices)
  );
  texture = utils.createAndBindTexture(gl, webglImage);
  render();
};
gl.useProgram(program);
const uImage = gl.getUniformLocation(program, "uImage");
gl.uniform1i(uImage, 0);

const render = () => {
  utils.linkGPUAndCPU(
    { program: program, buffer: buffer, dims: 2, gpuVariable: "position" },
    gl
  );
  utils.linkGPUAndCPU(
    { program: program, buffer: texBuffer, dims: 2, gpuVariable: "texCoords" },
    gl
  );
  gl.activeTexture(gl.TEXTURE0 + 0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 2);
};

const getDiff = (startX, startY, endX, endY) => {
  const obj = {
    startX: startX,
    startY: startY,
    endX: endX,
    endY,
  };
  const v = utils.getGPUCoords(obj); //-1 to +1
  v = utils.getGPUCoords0To2(v); //0 to 2
  const diffX = v.endX - v.startX;
  const diffY = v.endY - v.startY;
  return {
    x: diffX,
    y: diffY,
  };
};

const webglReset = document.getElementById("reset_webgl");
const webglBlur = document.getElementById("blur_webgl");
const webglResult = document.getElementById("result_webgl");
const isKernel = gl.getUniformLocation(program, "isKernel");
webglBlur.onclick = () => {
  const v1 = performance.now();
  gl.uniform1f(isKernel, 1.0);
  const kernelWeight = gl.getUniformLocation(program, "kernelWeight");
  const ker = gl.getUniformLocation(program, "uKernel[0]");
  gl.uniform1f(
    kernelWeight,
    kernels.edgeEnhancement.reduce((a, b) => a + b)
  );
  gl.uniform1fv(ker, kernels.edgeEnhancement);
  render();
  const v2 = performance.now();
  webglResult.innerHTML = `It takes ${v2 - v1}ms`;
};
webglReset.onclick = () => {
  gl.uniform1f(isKernel, 0.0);
  render();
  webglResult.innerHTML = "";
};
