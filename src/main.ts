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
  const amountOfParticles: number = 50;
  const valuesPerParticle = 4;

  const buffer = new ArrayBuffer(amountOfParticles * valuesPerParticle * Uint32Array.BYTES_PER_ELEMENT);

  const floatView = new Float32Array(buffer);

  for (let i = 0; i < amountOfParticles; i++) {
    const step = i * 4;

    floatView[step] = 0.0;
    floatView[step + 1] = 50.0 + i / 10000;
    floatView[step + 2] = 30.0 + i / 10000;
    floatView[step + 3] = 0.0;
  }

  if (gpuEngine) {
    gpuEngine.setParticles(buffer);
  }
}

window.document.addEventListener("DOMContentLoaded", init);
