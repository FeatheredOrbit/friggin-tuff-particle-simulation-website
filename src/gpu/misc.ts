export class Textures {
  texture1: GPUTexture;
  texture2: GPUTexture;

  // Not really a texture but it's related anyway.
  sampler: GPUSampler;

  constructor(device: GPUDevice, canvas: HTMLCanvasElement) {
     this.texture1 = device.createTexture({
       size: { width: canvas.width, height: canvas.height, depthOrArrayLayers: 1 },
       format: "rgba8unorm",
       dimension: "2d",
       usage: GPUTextureUsage.STORAGE_BINDING | GPUTextureUsage.TEXTURE_BINDING
     });

     this.texture2 = device.createTexture({
       size: { width: canvas.width, height: canvas.height, depthOrArrayLayers: 1 },
       format: "rgba8unorm",
       dimension: "2d",
       usage: GPUTextureUsage.STORAGE_BINDING | GPUTextureUsage.TEXTURE_BINDING
     });

     this.sampler = device.createSampler({
       magFilter: "nearest",
       minFilter: "nearest",
       mipmapFilter: "nearest"
     });

     console.log("Textures initialized correctly!");
  }
}

export class BindGroups {
  main_compute_layout: GPUBindGroupLayout;

  constructor(device: GPUDevice, _textures: Textures) {

    this.main_compute_layout = device.createBindGroupLayout({
      entries: [
        {
          binding: 0,
          visibility: GPUShaderStage.COMPUTE,
          storageTexture: {
            access: "write-only",
            format: "rgba8unorm",
            viewDimension: "2d"
          }
        },

        {
          binding: 1,
          visibility: GPUShaderStage.COMPUTE,
          buffer: {
            type: "uniform",
            hasDynamicOffset: false,
            minBindingSize: 0
          }
        },

        {
          binding: 2,
          visibility: GPUShaderStage.COMPUTE,
          buffer: {
            type: "storage",
            hasDynamicOffset: false,
            minBindingSize: 0
          }
        }
      ]
    });

  }
}