// https://webgpufundamentals.org/webgpu/lessons/webgpu-fundamentals.html

async function main() {
    const adapter = await navigator.gpu?.requestAdapter();
    const device = await adapter?.requestDevice();
    if(!device) {
        fail('need a browser that supports WebGPU');
        return;
    }

    device.addEventListener('uncapturederror', event => {
        console.error("WebGPU Error:", event.error.message);
    });

    const canvas = document.querySelector('canvas');

    const context = canvas.getContext('webgpu');
    const presentationFormat = navigator.gpu.getPreferredCanvasFormat();
    context.configure({
        device,
        format: presentationFormat,
    });

    // Load render shader code
    const renderResponse = await fetch("./triangleRender.wgsl");
    if(!renderResponse.ok) {
        fail("Failed to load render shaders");
        return;
    }
    const renderShaderCode = await renderResponse.text();

    //load compute shader code
    const computeResponse = await fetch("./triangleCompute.wgsl");
    if(!computeResponse.ok) {
        fail("Failed to load compute shaders");
        return;
    }
    const computeShaderCode = await computeResponse.text();

    const renderModule = device.createShaderModule({
        label: 'render triangle',
        code: renderShaderCode,
    });

    const computeModule = device.createShaderModule({
        label: 'compute triangle',
        code: computeShaderCode
    });

    const computePipeline = device.createComputePipeline({
        label: 'compute triangle pipeline',
        layout: 'auto',
        compute: {
            module: computeModule
        }
    });

    const renderPipeline = device.createRenderPipeline({
        label: 'render triangle pipline',
        layout: 'auto',
        vertex: { 
            entryPoint: 'hardcodedTriangles',
            module: renderModule,
        },
        fragment: {
            entryPoint: 'gradient',
            module: renderModule,
            targets: [{ format: presentationFormat }],
        },
    });

    const uniformFloatCount = 1; // We only have one f32 in our uniform
    const uniformData = new Float32Array(uniformFloatCount); // allocate an array (CPU-side) to hold our uniform

    // Allocate a buffer (GPU-side) to hold the uniform data
    const uniformBuffer = device.createBuffer({
        size: 4 * uniformFloatCount, // 4 bytes per float
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    const a = new Float32Array([0, 0, 0]);
    const b = new Float32Array([0, 0, 0]);

    const aBuffer = device.createBuffer({
        label: 'a buffer',
        size: a.byteLength,
        usage: GPUBufferUsage.STORAGE |
               GPUBufferUsage.COPY_DST |
               GPUBufferUsage.VERTEX,
    });

    const bBuffer = device.createBuffer({
        label: 'b buffer',
        size: b.byteLength,
        usage: GPUBufferUsage.STORAGE |
               GPUBufferUsage.COPY_DST |
               GPUBufferUsage.VERTEX,
    });

    const computeBindGroupAtoB = device.createBindGroup({
        label: 'bindGroup for reading from a and writing to b',
        layout: computePipeline.getBindGroupLayout(0),
        entries: [
            {binding: 0, resource: aBuffer},
            {binding: 1, resource: bBuffer},
        ]
    });

    const computeBindGroupBtoA = device.createBindGroup({
        label: 'bindGroup for reading from b and writing to a',
        layout: computePipeline.getBindGroupLayout(0),
        entries: [
            {binding: 0, resource: bBuffer},
            {binding: 1, resource: aBuffer},
        ]
    });

    const renderBindGroupA = device.createBindGroup({
        label: 'bindGroup for reading a in render',
        layout: renderPipeline.getBindGroupLayout(0),
        entries: [
            { binding: 0, resource: uniformBuffer },
            { binding: 1, resource: aBuffer }
        ]
    });

    const renderBindGroupB = device.createBindGroup({
        label: 'bindGroup for reading b in render',
        layout: renderPipeline.getBindGroupLayout(0),
        entries: [
            { binding: 0, resource: uniformBuffer },
            { binding: 1, resource: bBuffer }
        ]
    });

    const renderPassDecriptor = {
        label: 'canvas renderPass',
        colorAttachments: [
            {
                clearValue: [.3, .3, .3, 1],
                loadOp: 'clear',
                storeOp: 'store'
            }
        ],
    };

    device.queue.writeBuffer(aBuffer, 0, a);
    device.queue.writeBuffer(bBuffer, 0, b);

    let aToB = true;

    function render() {
        device.queue.writeBuffer(uniformBuffer, 0, uniformData);

        // get the current texture from the canvas context and set it as
        // the texture to render to
        renderPassDecriptor.colorAttachments[0].view = 
            context.getCurrentTexture().createView();

        // command encoder encodes commands
        const encoder = device.createCommandEncoder({ label: 'myEncoder'});

        const computePass = encoder.beginComputePass();
        computePass.setPipeline(computePipeline);
        // Swap which buffers we are using each frame
        computePass.setBindGroup(0, aToB ? computeBindGroupAtoB : computeBindGroupBtoA);
        computePass.dispatchWorkgroups(a.length);
        computePass.end();


        // make a render pass encoder to render specific commands
        const renderPass = encoder.beginRenderPass(renderPassDecriptor);
        renderPass.setPipeline(renderPipeline);
        // Swap which buffers we are using each frame
        renderPass.setBindGroup(0, aToB ? renderBindGroupB : renderBindGroupA);
        // Draw 3 vertices for each triangle
        renderPass.draw(6);
        renderPass.end();

        const commandBuffer = encoder.finish();
        device.queue.submit([commandBuffer]); // nothing happens until here - where the commands are all sent to the queue
        aToB = !aToB; // flip our buffers
    }


    // Used to resize canvas to fullscreen when window changes size
    const observer = new ResizeObserver(entries => {
        for (const entry of entries) {
            const canvas = entry.target;
            const width = entry.contentBoxSize[0].inlineSize;
            const height = entry.contentBoxSize[0].blockSize;
            canvas.width = Math.max(1, Math.min(width, device.limits.maxTextureDimension2D));
            canvas.height = Math.max(1, Math.min(height, device.limits.maxTextureDimension2D));
        }
    });

    observer.observe(canvas);


    function frame(timestamp) {
        uniformData[0] = timestamp / 1000;
        render();
        requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
}

function fail(msg) {
    console.log(msg);
    alert(msg);
}

main();