import {GPUEngine} from "./gpu/gpu.ts";

let gpuEngine: GPUEngine | undefined;

async function init() {
  if (!gpuEngine) {
    gpuEngine = await GPUEngine.create();

    temporaryParticleInit();
    mainLoop();
  }
}

function render() {
  if (gpuEngine) {
    gpuEngine.render();
  }
}

function mainLoop() {
  render();

  requestAnimationFrame(mainLoop);
}

function temporaryParticleInit() {
  const amountOfParticles: number = 2;
  const valuesPerParticle = 4;

  const buffer = new ArrayBuffer(amountOfParticles * valuesPerParticle * Uint32Array.BYTES_PER_ELEMENT);

  const floatView = new Float32Array(buffer);


  floatView[0] = 1.0;
  floatView[1] = 0.0;
  floatView[2] = 0.0;
  floatView[3] = 0.0;

  floatView[4] = 0.0;
  floatView[5] = 50;
  floatView[6] = 0.0;
  floatView[7] = 0.0;

  if (gpuEngine) {
    gpuEngine.setParticles(buffer);
  }
}

window.document.addEventListener("DOMContentLoaded", init);
