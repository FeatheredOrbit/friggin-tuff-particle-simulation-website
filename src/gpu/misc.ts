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

export class Buffers {
  uniformData: uniformData;
  uniforms: GPUBuffer;
  particles: GPUBuffer;

  constructor(device: GPUDevice, textures: Textures) {
    this.uniformData = {
      // Both textures are the same so just use one.
      textureWidth: textures.texture1.width,
      textureHeight: textures.texture2.height
    };

    this.uniforms = device.createBuffer({
      // Vec4 of 4 u32s.
      size: 4 * 4,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      mappedAtCreation: false
    });

    this.particles = device.createBuffer({
      // Vec4 of 4 f32s.
      size: (4 * 4) * 200000, // Limit of 200,000 for now.
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
      mappedAtCreation: false
    });
  }
}

export class BindGroups {
  mainComputeLayout: GPUBindGroupLayout;
  fadeOutComputeLayout: GPUBindGroupLayout;

  constructor(device: GPUDevice, _textures: Textures, _buffers: Buffers) {

    this.mainComputeLayout = device.createBindGroupLayout({
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
    this.fadeOutComputeLayout = device.createBindGroupLayout({
      entries: [
        {
          binding: 0,
          visibility: GPUShaderStage.COMPUTE,
          storageTexture: {
            access: 'read-only',
            format: 'rgba8unorm',
            viewDimension: '2d',
          },
        },

        {
          binding: 1,
          visibility: GPUShaderStage.COMPUTE,
          storageTexture: {
            access: 'write-only',
            format: 'rgba8unorm',
            viewDimension: '2d',
          },
        },

        {
          binding: 2,
          visibility: GPUShaderStage.COMPUTE,
          buffer: {
            type: 'uniform',
            hasDynamicOffset: false,
            minBindingSize: 0,
          },
        },
      ],
    });



  }
}