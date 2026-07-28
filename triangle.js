// Adapted from
// https://webgpufundamentals.org/webgpu/lessons/webgpu-fundamentals.html
// Great place to get more detailed descriptions on all of this!

// Consider using the "wgsl-analyzer" in VS Code to syntax hilight the WGSL

async function main() {
    // Gets the GPU object to interact with from the browser
    const device = await (await navigator.gpu?.requestAdapter( {
        powerPreference: "high-performance",
    }))?.requestDevice();

    // Show an error message to the user if there's no WebGPU support
    if(!device) {      
        fail("No WebGPU support :(");
        return;
    }

    // These errors are automatically surfaced in the chrome terminal,
    // but need to be explicitly listened for on webkit
    device.addEventListener('uncapturederror', event => {
        console.error("WebGPU Error:", event.error.message);
    });

    // Create a canvas we will draw to
    const canvas = document.body.appendChild(document.createElement("canvas"));
    const context = canvas.getContext('webgpu');
    if(!context) {      
        fail("Failed to make canvas context");
        return;
    }
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

    // Compiles the shader code
    const renderModule = device.createShaderModule({
        label: 'render triangle',
        code: renderShaderCode,
    });

    // Describes the steps of our render pipeline:
    // First the vertex shader, then the fragment shader
    const renderPipeline = device.createRenderPipeline({
        label: 'render triangle pipline',
        layout: 'auto',
        vertex: { 
            entryPoint: 'triangles',
            module: renderModule,
        },
        fragment: {
            entryPoint: 'gradient',
            module: renderModule,
            targets: [{ format: presentationFormat }],
        },
    });

    // Create a uniform. This is where we'll pass the timestamp of each frame from the CPU to the GPU
    const uniformFloatCount = 1; // We only have one f32 in our uniform
    const uniformData = new Float32Array(uniformFloatCount); // allocate an array (CPU-side) to hold our uniform

    // Allocate a buffer (GPU-side) to hold the uniform data
    const uniformBuffer = device.createBuffer({
        size: 4 * uniformFloatCount, // 4 bytes per float
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });


    // In this bind group we'll render A
    const renderBindGroup = device.createBindGroup({
        label: 'bindGroup for reading a in render',
        layout: renderPipeline.getBindGroupLayout(0),
        entries: [
            { binding: 0, resource: uniformBuffer },
        ]
    });

    /** @type {GPURenderPassColorAttachment} */
    const colorAttachment = {
        // Sets background color in RGBA
        clearValue: [.3, .3, .3, 1],
        // Clear the background each frame
        loadOp: 'clear',
        // Save the new pixel data to the canvas
        storeOp: 'store',
        view: context.getCurrentTexture().createView()
    };

    // Describes how things should get rendered to the canvas
    /** @type {GPURenderPassDescriptor} */
    const renderPassDecriptor = {
        label: 'canvas renderPass',
        colorAttachments: [
            colorAttachment
        ],
    };

    // This bool will keep track of which buffer to treat as new or old

    const render = () => {
        device.queue.writeBuffer(uniformBuffer, 0, uniformData);

        // get the current texture from the canvas context and set it as
        // the texture to render to
        colorAttachment.view = context.getCurrentTexture().createView();

        // command encoder encodes commands
        const encoder = device.createCommandEncoder({ label: 'myEncoder'});

        // make a render pass encoder to render specific commands
        const renderPass = encoder.beginRenderPass(renderPassDecriptor);
        renderPass.setPipeline(renderPipeline);
        // Swap which buffers we are using each frame
        renderPass.setBindGroup(0, renderBindGroup);
        // Draw 3 vertices for each triangle
        renderPass.draw(6);
        renderPass.end();

        const commandBuffer = encoder.finish();
        device.queue.submit([commandBuffer]); // nothing happens until here - where the commands are all sent to the queue
    }


    // Used to resize canvas to fullscreen when window changes size
    const observer = new ResizeObserver(entries => {
        for (const entry of entries) {
            const canvas = entry.target;
            if(canvas instanceof HTMLCanvasElement) {
                const width = entry.contentBoxSize[0].inlineSize;
                const height = entry.contentBoxSize[0].blockSize;
                canvas.width = Math.max(1, Math.min(width, device.limits.maxTextureDimension2D));
                canvas.height = Math.max(1, Math.min(height, device.limits.maxTextureDimension2D));
            }
        }
    });
    observer.observe(canvas);

    // Called every frame by JS
    function frame(timestamp) {
        uniformData[0] = timestamp / 1000;
        render();
        // request to re-run this function again next animation frame
        requestAnimationFrame(frame);
    }

    // Start the first frame of animation
    requestAnimationFrame(frame);
}

const fail = (msg) => {
    const errorMessage = document.body.appendChild(document.createElement("span"));
    errorMessage.innerText = msg;
    console.log(msg);
}

main();