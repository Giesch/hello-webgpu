@group(0) @binding(0) var<storage, read_write> oldData : array<f32>;
@group(0) @binding(1) var<storage, read_write> newData : array<f32>;

@compute @workgroup_size(1) fn scale(@builtin(global_invocation_id) id: vec3u) {
    let i = id.x;
    newData[i] = oldData[i] + 0.001;
}