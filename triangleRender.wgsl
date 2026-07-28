struct Uniforms {
    time : f32
};

// Gets updated at each animation frame by the cpu
@group(0) @binding(0) var<uniform> uniforms : Uniforms;

// Gets modified in compute shader
@group(0) @binding(1) var<storage, read> nums : array<f32>;

@vertex fn triangles(
    @builtin(vertex_index) vertexIndex : u32,
) -> @builtin(position) vec4f {
    let pos = array(
        // First triangle - hardcoded + transforms varying on a sine wave with time
        vec2f(0.0, -1.0 * sin(uniforms.time)),
        vec2f(-0.5* sin(uniforms.time), -0.5),
        vec2f(0.5, -0.5),

        // Second triangle - hardcoded + x shifts from nums array
        // (gets updated in compute shader)
        vec2f(-.1 + nums[0], 1.0),
        vec2f(.2 + nums[1], .8),
        vec2f(.3 + nums[2], .8),
    );
    
    // Use x and y position, set z to 0, w to 1
    // w is used for perspective - unused in this example
    return vec4f(pos[vertexIndex], 0.0, 1.0);
}

@fragment fn gradient(@builtin(position) pos : vec4f) -> @location(0) vec4f {
    // Returns RGBA color
    // In our example we multiply using sin, time and position to make fun shifting gradients
    return vec4f(pos.x/484.0 * sin(uniforms.time), pos.y/716.0, 1.0, 1.0);
}