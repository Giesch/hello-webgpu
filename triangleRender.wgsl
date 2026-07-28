struct Uniforms {
    time : f32
};

@group(0) @binding(0) var<uniform> uniforms : Uniforms;

@group(0) @binding(1) var<storage, read> nums : array<f32>;

@vertex fn hardcodedTriangles(
    @builtin(vertex_index) vertexIndex : u32,
) -> @builtin(position) vec4f {
    let pos = array(
        // First triangle
        vec2f(0.0, -1.0 * sin(uniforms.time)),
        vec2f(-0.5* sin(uniforms.time), -0.5),
        vec2f(0.5, -0.5),

        // Second triangle
        vec2f(-.8 + nums[0], 1.0),
        vec2f(.2 + nums[1], .8),
        vec2f(.3 + nums[2], .8),
    );
    
    return vec4f(pos[vertexIndex], 0.0, 1.0);
}

@fragment fn gradient(@builtin(position) pos : vec4f) -> @location(0) vec4f {
    return vec4f(pos.x/484.0 * sin(uniforms.time), pos.y/716.0, 1.0, 1.0);
}