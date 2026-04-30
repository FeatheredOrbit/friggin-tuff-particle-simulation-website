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
  const amountOfParticles: number = 1;
  const valuesPerParticle = 3;

  const buffer = new ArrayBuffer(amountOfParticles * valuesPerParticle * Uint32Array.BYTES_PER_ELEMENT);

  const floatView = new Float32Array(buffer);
  const  uintView = new Uint32Array(buffer);

  for (let i = 0; i < amountOfParticles; i++) {
    const offset = i * valuesPerParticle;

    floatView[offset] = 0.0;
    floatView[offset + 1] = i / 1000;
    floatView[offset + 2] = 0.0;
  }

  if (gpuEngine) {
    gpuEngine.setParticles(uintView);
  }
}

window.document.addEventListener("DOMContentLoaded", init);
