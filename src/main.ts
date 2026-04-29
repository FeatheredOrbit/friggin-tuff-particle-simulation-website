import {GPUEngine} from "./gpu/gpu.ts";

let gpu_engine: GPUEngine | null;

async function init_gpu() {
  if (!gpu_engine) {
    gpu_engine = await GPUEngine.create();
    requestAnimationFrame(main_loop);
  }
}

function render() {
  if (gpu_engine) {
    gpu_engine.render();
  }
}

function main_loop() {
  render();

  requestAnimationFrame(main_loop);
}

window.document.addEventListener("DOMContentLoaded", init_gpu);
