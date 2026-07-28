struct Uniforms {
    time : f32
};

struct Vertex {
    @builtin(position) position: vec4f,
    @location(0) color: vec4f
};

// Gets updated at each animation frame by the cpu
@group(0) @binding(0) var<uniform> uniforms : Uniforms;

const scale = 0.1;

const width = 6.0 * scale;
const height = 4.0 * scale;

const bottomLeft = vec3f(-(width / 2.0), 0.0, 0.0);
const bottomRight = vec3f(width / 2.0, 0.0, 0.0);
const bottomFar = vec3f(0.0, 0.0, height);
const top = vec3f(0.0, height, height / 2.0);

const sides = array(
    // front
    bottomLeft, top, bottomRight,
    // back right
    bottomRight, top, bottomFar,
    // back left
    bottomLeft, top, bottomFar,
    // base
    bottomLeft, bottomRight, bottomFar
);

const red = vec4f(1.0, 0.0, 0.0, 1.0);
const green = vec4f(0.0, 1.0, 0.0, 1.0);
const blue = vec4f(0.0, 0.0, 1.0, 1.0);
const yellow = vec4f(0.0, 1.0, 1.0, 1.0);

@vertex fn triangles(
    @builtin(vertex_index) vertexIndex : u32
) -> Vertex {
    _ = uniforms.time;

    let face = vertexIndex / 3;
    let colors = array(red, blue, green, yellow);
    let color = colors[face];
    let position = vec4f(sides[vertexIndex], 1.0);

    return Vertex(position, color);
}

@fragment fn gradient(vertex: Vertex) -> @location(0) vec4f {
    return vertex.color;
}
