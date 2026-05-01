import { BindGroups, Buffers, Pipelines, Textures } from "./misc.ts";

export class GPUEngine {
  adapter: GPUAdapter;
  device: GPUDevice;
  context: GPUCanvasContext;
  textures: Textures;
  buffers: Buffers;
  bindGroups: BindGroups;
  pipelines: Pipelines;

  // Used to alternate between bind groups since textures cannot be written and wrote to at the same time, it seems.
  renderStage: boolean;

  private constructor(
      adapter: GPUAdapter,
      device: GPUDevice,
      context: GPUCanvasContext
  ) {
    this.adapter = adapter;
    this.device = device;
    this.context = context;

    this.textures = new Textures(this.device, this.context.canvas as HTMLCanvasElement);
    this.buffers = new Buffers(this.device, this.textures, this.context);
    this.bindGroups = new BindGroups(this.device, this.textures, this.buffers);
    this.pipelines = new Pipelines(this.device, this.bindGroups);
    this.renderStage = false;

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

  public setParticles(particleData: ArrayBuffer) {
    this.device.queue.writeBuffer(this.buffers.particles, 0, particleData);
  }

  public render() {
    const encoder = this.device.createCommandEncoder();

    const compute_pass = encoder.beginComputePass();

    compute_pass.setBindGroup(0, this.renderStage ? this.bindGroups.fadeOutComputeBindGroup1 : this.bindGroups.fadeOutComputeBindGroup2);
    compute_pass.setPipeline(this.pipelines.fadeOutCompute);
    compute_pass.dispatchWorkgroups(
      (this.textures.texture1.width + 7) / 8,
      (this.textures.texture1.height + 7) / 8,
      1,
    );

    compute_pass.setBindGroup(0, this.renderStage ? this.bindGroups.mainComputeBindGroup1 : this.bindGroups.mainComputeBindGroup2);
    compute_pass.setPipeline(this.pipelines.mainCompute);
    compute_pass.dispatchWorkgroups(this.buffers.uniformData.particleNumber, 1, 1);

    compute_pass.end();

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

    render_pass.setBindGroup(0, this.renderStage ? this.bindGroups.renderBindGroup1 : this.bindGroups.renderBindGroup2);
    render_pass.setPipeline(this.pipelines.render);
    render_pass.draw(3, 1);

    render_pass.end();

    console.log("Render called");
    this.device.queue.submit([encoder.finish()]);

    this.renderStage = !this.renderStage;
  }
}