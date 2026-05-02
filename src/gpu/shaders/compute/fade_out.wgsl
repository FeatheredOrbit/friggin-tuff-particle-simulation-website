struct Uniforms {
    // X is number of particles.
    // Y is texture width.
    // Z is texture height.
    // W is window scale factor, needs to be reinterpreted as float though.
    data_1: vec4<u32>
}

@group(0) @binding(0)
var texture_read: texture_storage_2d<rgba8unorm, read>;

@group(0) @binding(1)
var texture_write: texture_storage_2d<rgba8unorm, write>;

@group(0) @binding(2)
var<uniform> uniforms: Uniforms;

@compute
@workgroup_size(8, 8)
fn main(@builtin(global_invocation_id) global_invocation_id: vec3<u32>) {
    let id_x = global_invocation_id.x;
    let id_y = global_invocation_id.y;

    if id_x >= uniforms.data_1.y || id_y >= uniforms.data_1.z { return; }

    var color = textureLoad(texture_read, vec2<u32>(id_x, id_y));
    var rgb = color.rgb;

    if max(max(rgb.r, rgb.g), rgb.b) <= 0.25 {
        rgb = vec3<f32>(0.0, 0.0, 0.0);
    }
    else {
        rgb *= 0.95;
    }

    textureStore(texture_write, vec2<u32>(id_x, id_y), vec4<f32>(rgb, 1.0));
}