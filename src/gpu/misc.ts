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
  renderLayout: GPUBindGroupLayout;

  mainComputeBindGroup1: GPUBindGroup;
  mainComputeBindGroup2: GPUBindGroup;

  fadeOutComputeBindGroup1: GPUBindGroup;
  fadeOutComputeBindGroup2: GPUBindGroup;

  renderBindGroup1: GPUBindGroup;
  renderBindGroup2: GPUBindGroup;

  constructor(device: GPUDevice, textures: Textures, buffers: Buffers) {
    this.mainComputeLayout = device.createBindGroupLayout({
      entries: [
        {
          binding: 0,
          visibility: GPUShaderStage.COMPUTE,
          storageTexture: {
            access: 'write-only',
            format: 'rgba8unorm',
            viewDimension: '2d',
          },
        },

        {
          binding: 1,
          visibility: GPUShaderStage.COMPUTE,
          buffer: {
            type: 'uniform',
            hasDynamicOffset: false,
            minBindingSize: 0,
          },
        },

        {
          binding: 2,
          visibility: GPUShaderStage.COMPUTE,
          buffer: {
            type: 'storage',
            hasDynamicOffset: false,
            minBindingSize: 0,
          },
        },
      ],
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
    this.renderLayout = device.createBindGroupLayout({
      entries: [
        {
          binding: 0,
          visibility: GPUShaderStage.FRAGMENT,
          texture: {
            sampleType: "float",
            viewDimension: '2d',
            multisampled: false
          }
        },

        {
          binding: 1,
          visibility: GPUShaderStage.FRAGMENT,
          sampler: { type: "non-filtering" }
        }
      ]
    });

    this.mainComputeBindGroup1 = device.createBindGroup({
      layout: this.mainComputeLayout,
      entries: [
        {
          binding: 0,
          resource: textures.texture1,
        },

        {
          binding: 1,
          resource: buffers.uniforms,
        },

        {
          binding: 2,
          resource: buffers.particles,
        },
      ],
    });
    this.mainComputeBindGroup2 = device.createBindGroup({
      layout: this.mainComputeLayout,
      entries: [
        {
          binding: 0,
          resource: textures.texture2,
        },

        {
          binding: 1,
          resource: buffers.uniforms,
        },

        {
          binding: 2,
          resource: buffers.particles,
        },
      ],
    });

    this.fadeOutComputeBindGroup1 = device.createBindGroup({
      layout: this.fadeOutComputeLayout,
      entries: [
        {
          binding: 0,
          resource: textures.texture2,
        },

        {
          binding: 1,
          resource: textures.texture1,
        },

        {
          binding: 2,
          resource: buffers.uniforms,
        },
      ],
    });
    this.fadeOutComputeBindGroup2 = device.createBindGroup({
      layout: this.fadeOutComputeLayout,
      entries: [
        {
          binding: 0,
          resource: textures.texture1,
        },

        {
          binding: 1,
          resource: textures.texture2,
        },

        {
          binding: 2,
          resource: buffers.uniforms,
        },
      ],
    });

    this.renderBindGroup1 = device.createBindGroup({
      layout: this.renderLayout,
      entries: [
        {
          binding: 0,
          resource: textures.texture2
        },

        {
          binding: 1,
          resource: textures.sampler
        }
      ]
    });
    this.renderBindGroup2 = device.createBindGroup({
      layout: this.renderLayout,
      entries: [
        {
          binding: 0,
          resource: textures.texture1
        },

        {
          binding: 1,
          resource: textures.sampler
        }
      ]
    });
  }
}



import mainComputeShader from 'shaders/compute/main.wgsl?raw';

export class Pipelines {
  mainCompute: GPUComputePipeline;

  constructor(device: GPUDevice, bindGroups: BindGroups) {
    const mainComputePipelineLayout = device.createPipelineLayout({
      bindGroupLayouts: [bindGroups.mainComputeLayout]
    });

    this.mainCompute = device.createComputePipeline({
      layout: mainComputePipelineLayout,
      compute: {
        module:  device.createShaderModule({ code: mainComputeShader }),
        entryPoint: "main"
      }
    });
  }
}