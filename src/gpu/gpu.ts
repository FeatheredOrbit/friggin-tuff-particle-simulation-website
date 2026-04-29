import { BindGroups, Buffers, Textures } from './misc.ts';

export class GPUEngine {
  adapter: GPUAdapter;
  device: GPUDevice;
  context: GPUCanvasContext;
  textures: Textures;
  buffers: Buffers;
  bindGroups: BindGroups;

  private constructor(
      adapter: GPUAdapter,
      device: GPUDevice,
      context: GPUCanvasContext
  ) {
    this.adapter = adapter;
    this.device = device;
    this.context = context;

    this.textures = new Textures(this.device, this.context.canvas as HTMLCanvasElement);
    this.buffers = new Buffers(this.device, this.textures);
    this.bindGroups = new BindGroups(this.device, this.textures, this.buffers);

    console.log('GPU engine initialized correctly. Yuppie!');
  }

  static async create() {
    if (!navigator.gpu) {
      throw Error('WebGPU not supported.');
    }

    const adapter = await navigator.gpu.requestAdapter({
      powerPreference: "high-performance",
      forceFallbackAdapter: false
    });
    if (!adapter) {
      throw Error('Failed to get adapter.');
    }

    const device = await adapter.requestDevice();
    if (!device) {
      throw Error('Failed to get device.');
    }

    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    const context = canvas.getContext('webgpu');
    if (!context) {
      throw Error('Failed to get context.');
    }

    context.configure({
      device: device,
      format: navigator.gpu.getPreferredCanvasFormat()
    });

    return new GPUEngine(adapter, device, context);
  }

  public render() {
    const encoder = this.device.createCommandEncoder();

    const render_pass = encoder.beginRenderPass({
      colorAttachments: [
        {
          view: this.context.getCurrentTexture().createView(),
          clearValue: { r: 1.0, g: 0.0, b: 0.0, a: 1.0 },
          loadOp: "clear",
          storeOp: "store"
        }
      ]
    });
    render_pass.end();

    console.log("Render called");
    this.device.queue.submit([encoder.finish()]);
  }
}
