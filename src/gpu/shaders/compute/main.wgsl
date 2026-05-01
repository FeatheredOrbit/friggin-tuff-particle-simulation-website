struct Uniforms {
    // X is number of particles.
    // Y is texture width.
    // Z is texture height.
    data_1: vec4<u32>
}

struct ParticleData {
    // X slot is particle type: 0 = Red || 1 = Green || 2 = Blue.
    // Y slot is x position.
    // Z slot is y position.
    data_1: vec4<f32>
}

const RED: f32 = 0.0;
const GREEN: f32 = 1.0;
const BLUE: f32 = 2.0;

const MAX_LOOK_DISTANCE: u32 = 100u;
const FORCE_MULTIPLER: f32 = 5.0;

@group(0) @binding(0)
var texture: texture_storage_2d<rgba8unorm, write>;

@group(0) @binding(1)
var<uniform> uniforms: Uniforms;

@group(0) @binding(2)
var<storage, read_write> particle_data: array<ParticleData>; 

@compute
@workgroup_size(64)
fn main(@builtin(global_invocation_id) global_invocation_id: vec3<u32>) {
    let id = global_invocation_id.x;

    if (id >= uniforms.data_1.x) {
        return;
    }

    behave(id);
    draw_texture(id);
}

fn behave(id: u32) {

    // For now check every particle for every particle, in the near future I will do spatial partitioning to save on iterations.
    for (var iter_id = 0u; iter_id < uniforms.data_1.x; iter_id++) {

        if (iter_id == id) { continue; }

        if (particle_data[id].data_1.x == RED) {
            red(id, iter_id);
        }

        if (particle_data[id].data_1.x == BLUE) {
            blue(id, iter_id);
        }

    }

    bound_check(id);

    // Check if the particle has gone out of bounds during behaviour, if so, bring it back.
    particle_data[id].data_1.y = clamp(particle_data[id].data_1.y, 0.0, f32(uniforms.data_1.y) - 1.0);
    particle_data[id].data_1.z = clamp(particle_data[id].data_1.z, 0.0, f32(uniforms.data_1.z) - 1.0);

}

// Called if particle under id is red.
// Red runs away from blue.
// Red runs away from red.
fn red(id: u32, iter_id: u32) {
    let epsilon = 0.1;

    let other_particle_x = particle_data[iter_id].data_1.y;
    let other_particle_y = particle_data[iter_id].data_1.z;

    let particle_x = particle_data[id].data_1.y;
    let particle_y = particle_data[id].data_1.z;

    let color_flag = particle_data[iter_id].data_1.x;

    if (color_flag == BLUE || color_flag == RED) {
       let dx = other_particle_x - particle_x;
       let dy = other_particle_y - particle_y;

        let length = sqrt(dx * dx + dy * dy);

        if length != 0.0 {
            let dir_x = dx / (pow(length, 2.0) + epsilon) * FORCE_MULTIPLER;
            let dir_y = dy / (pow(length, 2.0) + epsilon) * FORCE_MULTIPLER;

            particle_data[id].data_1.y -= dir_x;
            particle_data[id].data_1.z -= dir_y;
        }
    }
}

// Called if particle under id is blue.

// Blue is attracted to red.
// Blue is attracted to blue.
fn blue(id: u32, iter_id: u32) {
    let epsilon = 0.1;

    let other_particle_x = particle_data[iter_id].data_1.y;
    let other_particle_y = particle_data[iter_id].data_1.z;

    let particle_x = particle_data[id].data_1.y;
    let particle_y = particle_data[id].data_1.z;

    let color_flag = particle_data[iter_id].data_1.x;

    if (color_flag == BLUE || color_flag == RED) {
       let dx = other_particle_x - particle_x;
       let dy = other_particle_y - particle_y;

        let length = sqrt(dx * dx + dy * dy);

        if length != 0.0 {
            let dir_x = dx / (pow(length, 2.0) + epsilon) * FORCE_MULTIPLER;
            let dir_y = dy / (pow(length, 2.0) + epsilon) * FORCE_MULTIPLER;

            particle_data[id].data_1.y += dir_x;
            particle_data[id].data_1.z += dir_y;
        }
    }
}

// Particles should be pushed away from the walls of the screen.
fn bound_check(id: u32) {
    // Check for left wall.
    {
        let pos_x = particle_data[id].data_1.y;

        let dx = 0.0 - pos_x;

        let length = sqrt(dx * dx);

        if length != 0.0 {
            let dir_x = dx / pow(length, 2.0) * FORCE_MULTIPLER * 2;

            particle_data[id].data_1.y -= dir_x;
        }
    }

    // Check for right wall.
    {
        let pos_x = particle_data[id].data_1.y;
        let right_wall = f32(uniforms.data_1.y);

        let dx = right_wall - pos_x;

        let length = sqrt(dx * dx);

        if length != 0.0 {
            let dir_x = dx / pow(length, 2.0) * FORCE_MULTIPLER * 2;

            particle_data[id].data_1.y -= dir_x;
        }
    }

    // Check for ceiling.
    {
        let pos_y = particle_data[id].data_1.z;

        let dy = 0.0 - pos_y;

        let length = sqrt(dy * dy);

        if length != 0.0 {
            let dir_y = dy / pow(length, 2.0) * FORCE_MULTIPLER * 2;

            particle_data[id].data_1.z -= dir_y;
        }
    }

    // Check for floor.
    {
        let pos_y = particle_data[id].data_1.z;
        let floor = f32(uniforms.data_1.z);

        let dy = floor - pos_y;

        let length = sqrt(dy * dy);

        if length != 0.0 {
            let dir_y = dy / pow(length, 2.0) * FORCE_MULTIPLER * 2;

            particle_data[id].data_1.z -= dir_y;
        }
    }
}

fn draw_texture(id: u32) {
    var color = vec4<f32>(0.0, 0.0, 0.0, 1.0);

    if particle_data[id].data_1.x == RED {
        color = vec4<f32>(1.0, 0.0, 0.0, 1.0);
    }
    else if particle_data[id].data_1.x == GREEN {
        color = vec4<f32>(0.0, 1.0, 0.0, 1.0);
    }
    else if particle_data[id].data_1.x == BLUE {
        color = vec4<f32>(0.0, 0.0, 1.0, 1.0);
    }

    textureStore(
        texture,
        // Yeah this looks terrible but the reason is that the actual value is a float so it needs to be bitcasted
        // to float, but then this function takes integers so it needs to be casted into an integer.
        vec2<u32>(u32(particle_data[id].data_1.y), u32(particle_data[id].data_1.z)),
        color
    );
}
