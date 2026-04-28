export class GPUEngine {
  adapter: GPUAdapter;
  device: GPUDevice;

  private constructor(adapter: GPUAdapter, device: GPUDevice) {
    this.adapter = adapter;
    this.device = device;
  }

  static async create() {
    if (!navigator.gpu) {
      throw Error('WebGPU not supported.');
    }

    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) {
      throw Error('Failed to get adapter.');
    }

    const device = await adapter.requestDevice();
    if (!device) {
      throw Error('Failed to get adapter.');
    }

    console.log('Success!');
    return new GPUEngine(adapter, device);
  }
}
