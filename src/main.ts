import {GPUEngine} from "./gpu.ts";

let gpu_engine: GPUEngine | null;

async function init_gpu() {
  if (!gpu_engine) {
    gpu_engine = await GPUEngine.create();
  }
}

window.document.addEventListener("DOMContentLoaded", init_gpu);
