// Adapted from
// https://webgpufundamentals.org/webgpu/lessons/webgpu-fundamentals.html
// Great place to get more detailed descriptions on all of this!

// Consider using the "wgsl-analyzer" in VS Code to syntax hilight the WGSL

const mat4 = {
  /** @type{(width: number, height: number, depth: number, dst?: Float32Array) => Float32Array} */
  orthographicProjection(width, height, depth, dst) {
    // Note: This matrix flips the Y axis so that 0 is at the top.
    dst = dst || new Float32Array(16);
    dst[ 0] = 2 / width;  dst[ 1] = 0;            dst[ 2] = 0;            dst[ 3] = 0;
    dst[ 4] = 0;          dst[ 5] = -2 / height;  dst[ 6] = 0;            dst[ 7] = 0;
    dst[ 8] = 0;          dst[ 9] = 0;            dst[10] = 0.5 / depth;  dst[11] = 0;
    dst[12] = -1;         dst[13] = 1;            dst[14] = 0.5;          dst[15] = 1;
    return dst;
  },

  /** @type{(dst?: Float32Array) => Float32Array} */
  identity(dst) {
    dst = dst || new Float32Array(16);
    dst[ 0] = 1;  dst[ 1] = 0;  dst[ 2] = 0;   dst[ 3] = 0;
    dst[ 4] = 0;  dst[ 5] = 1;  dst[ 6] = 0;   dst[ 7] = 0;
    dst[ 8] = 0;  dst[ 9] = 0;  dst[10] = 1;   dst[11] = 0;
    dst[12] = 0;  dst[13] = 0;  dst[14] = 0;   dst[15] = 1;
    return dst;
  },

  /** @type{(a: Float32Array, b: Float32Array, dst?: Float32Array) => Float32Array} */
  multiply(a, b, dst) {
    dst = dst || new Float32Array(16);
    const b00 = b[0 * 4 + 0];
    const b01 = b[0 * 4 + 1];
    const b02 = b[0 * 4 + 2];
    const b03 = b[0 * 4 + 3];
    const b10 = b[1 * 4 + 0];
    const b11 = b[1 * 4 + 1];
    const b12 = b[1 * 4 + 2];
    const b13 = b[1 * 4 + 3];
    const b20 = b[2 * 4 + 0];
    const b21 = b[2 * 4 + 1];
    const b22 = b[2 * 4 + 2];
    const b23 = b[2 * 4 + 3];
    const b30 = b[3 * 4 + 0];
    const b31 = b[3 * 4 + 1];
    const b32 = b[3 * 4 + 2];
    const b33 = b[3 * 4 + 3];
    const a00 = a[0 * 4 + 0];
    const a01 = a[0 * 4 + 1];
    const a02 = a[0 * 4 + 2];
    const a03 = a[0 * 4 + 3];
    const a10 = a[1 * 4 + 0];
    const a11 = a[1 * 4 + 1];
    const a12 = a[1 * 4 + 2];
    const a13 = a[1 * 4 + 3];
    const a20 = a[2 * 4 + 0];
    const a21 = a[2 * 4 + 1];
    const a22 = a[2 * 4 + 2];
    const a23 = a[2 * 4 + 3];
    const a30 = a[3 * 4 + 0];
    const a31 = a[3 * 4 + 1];
    const a32 = a[3 * 4 + 2];
    const a33 = a[3 * 4 + 3];

    dst[0] = b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30;
    dst[1] = b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31;
    dst[2] = b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32;
    dst[3] = b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33;

    dst[4] = b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30;
    dst[5] = b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31;
    dst[6] = b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32;
    dst[7] = b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33;

    dst[8] = b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30;
    dst[9] = b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31;
    dst[10] = b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32;
    dst[11] = b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33;

    dst[12] = b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30;
    dst[13] = b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31;
    dst[14] = b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32;
    dst[15] = b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33;

    return dst;
  },

  /** @type{(t: [tx: number, ty: number, tz: number], dst?: Float32Array) => Float32Array} */
  translation([tx, ty, tz], dst) {
    dst = dst || new Float32Array(16);
    dst[ 0] = 1;   dst[ 1] = 0;   dst[ 2] = 0;   dst[ 3] = 0;
    dst[ 4] = 0;   dst[ 5] = 1;   dst[ 6] = 0;   dst[ 7] = 0;
    dst[ 8] = 0;   dst[ 9] = 0;   dst[10] = 1;   dst[11] = 0;
    dst[12] = tx;  dst[13] = ty;  dst[14] = tz;  dst[15] = 1;
    return dst;
  },

  /** @type{(angleInRadians: number, dst?: Float32Array) => Float32Array} */
  rotationX(angleInRadians, dst) {
    const c = Math.cos(angleInRadians);
    const s = Math.sin(angleInRadians);
    dst = dst || new Float32Array(16);
    dst[ 0] = 1;  dst[ 1] = 0;   dst[ 2] = 0;  dst[ 3] = 0;
    dst[ 4] = 0;  dst[ 5] = c;   dst[ 6] = s;  dst[ 7] = 0;
    dst[ 8] = 0;  dst[ 9] = -s;  dst[10] = c;  dst[11] = 0;
    dst[12] = 0;  dst[13] = 0;   dst[14] = 0;  dst[15] = 1;
    return dst;
  },

  /** @type{(angleInRadians: number, dst?: Float32Array) => Float32Array} */
  rotationY(angleInRadians, dst) {
    const c = Math.cos(angleInRadians);
    const s = Math.sin(angleInRadians);
    dst = dst || new Float32Array(16);
    dst[ 0] = c;  dst[ 1] = 0;  dst[ 2] = -s;  dst[ 3] = 0;
    dst[ 4] = 0;  dst[ 5] = 1;  dst[ 6] = 0;   dst[ 7] = 0;
    dst[ 8] = s;  dst[ 9] = 0;  dst[10] = c;   dst[11] = 0;
    dst[12] = 0;  dst[13] = 0;  dst[14] = 0;   dst[15] = 1;
    return dst;
  },

  /** @type{(angleInRadians: number, dst?: Float32Array) => Float32Array} */
  rotationZ(angleInRadians, dst) {
    const c = Math.cos(angleInRadians);
    const s = Math.sin(angleInRadians);
    dst = dst || new Float32Array(16);
    dst[ 0] = c;   dst[ 1] = s;  dst[ 2] = 0;  dst[ 3] = 0;
    dst[ 4] = -s;  dst[ 5] = c;  dst[ 6] = 0;  dst[ 7] = 0;
    dst[ 8] = 0;   dst[ 9] = 0;  dst[10] = 1;  dst[11] = 0;
    dst[12] = 0;   dst[13] = 0;  dst[14] = 0;  dst[15] = 1;
    return dst;
  },

  /** @type{(s: [sx: number, sy: number, sz: number], dst?: Float32Array) => Float32Array} */
  scaling([sx, sy, sz], dst) {
    dst = dst || new Float32Array(16);
    dst[ 0] = sx;  dst[ 1] = 0;   dst[ 2] = 0;    dst[ 3] = 0;
    dst[ 4] = 0;   dst[ 5] = sy;  dst[ 6] = 0;    dst[ 7] = 0;
    dst[ 8] = 0;   dst[ 9] = 0;   dst[10] = sz;   dst[11] = 0;
    dst[12] = 0;   dst[13] = 0;   dst[14] = 0;    dst[15] = 1;
    return dst;
  },

  /** @type{(m: Float32Array, translation: [number, number, number], dst?: Float32Array) => Float32Array} */
  translate(m, translation, dst) {
    return mat4.multiply(m, mat4.translation(translation), dst);
  },

  /** @type{(m: Float32Array, angleInRadians: number, dst?: Float32Array) => Float32Array} */
  rotateX(m, angleInRadians, dst) {
    return mat4.multiply(m, mat4.rotationX(angleInRadians), dst);
  },

  /** @type{(m: Float32Array, angleInRadians: number, dst?: Float32Array) => Float32Array} */
  rotateY(m, angleInRadians, dst) {
    return mat4.multiply(m, mat4.rotationY(angleInRadians), dst);
  },

  /** @type{(m: Float32Array, angleInRadians: number, dst?: Float32Array) => Float32Array} */
  rotateZ(m, angleInRadians, dst) {
    return mat4.multiply(m, mat4.rotationZ(angleInRadians), dst);
  },

  /** @type{(m: Float32Array, scale: [number, number, number], dst?: Float32Array) => Float32Array} */
  scale(m, scale, dst) {
    return mat4.multiply(m, mat4.scaling(scale), dst);
  },
};

async function main() {
    // Gets the GPU object to interact with from the browser
    const device = await (await navigator.gpu?.requestAdapter( {
        powerPreference: "high-performance",
    }))?.requestDevice();

    // Show an error message to the user if there's no WebGPU support
    if(!device) {      
        fail("No WebGPU support :(");
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
      primitive: {
        cullMode: 'none',
      },
      depthStencil: {
        depthWriteEnabled: true,
        depthCompare: 'less',
        format: 'depth24plus'
      }
    });

    const uniformData = new Float32Array([
        ...mat4.identity(), // matrix
        0.0,                // time
        0.0, 0.0, 0.0       // padding
    ]); // allocate an array (CPU-side) to hold our uniform

    // Allocate a buffer (GPU-side) to hold the uniform data
    const uniformBuffer = device.createBuffer({
        size: uniformData.byteLength,
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

    let canvasTexture = context.getCurrentTexture();
    /** @type {GPURenderPassColorAttachment} */
    const colorAttachment = {
        // Sets background color in RGBA
        clearValue: [.3, .3, .3, 1],
        // Clear the background each frame
        loadOp: 'clear',
        // Save the new pixel data to the canvas
        storeOp: 'store',
        view: canvasTexture.createView()
    };

    let depthTexture = device.createTexture({
        size: [canvasTexture.width, canvasTexture.height],
        format: 'depth24plus',
        usage: GPUTextureUsage.RENDER_ATTACHMENT
    });

    /** @type {GPURenderPassDepthStencilAttachment} */
    let depthStencilAttachment = {
        depthClearValue: 1.0,
        depthLoadOp: 'clear',
        depthStoreOp: 'store',
        view: depthTexture.createView()
    };

    // Describes how things should get rendered to the canvas
    /** @type {GPURenderPassDescriptor} */
    const renderPassDecriptor = {
        label: 'canvas renderPass',
        colorAttachments: [colorAttachment],
        depthStencilAttachment
    };

    // This bool will keep track of which buffer to treat as new or old

    const render = () => {
        canvasTexture = context.getCurrentTexture();

        device.queue.writeBuffer(uniformBuffer, 0, uniformData);

        // get the current texture from the canvas context and set it as
        // the texture to render to
        colorAttachment.view = canvasTexture.createView();

        if (depthTexture.width !== canvasTexture.width ||
            depthTexture.height !== canvasTexture.height) {
          depthTexture.destroy();
          depthTexture = device.createTexture({
                size: [canvasTexture.width, canvasTexture.height],
                format: 'depth24plus',
                usage: GPUTextureUsage.RENDER_ATTACHMENT
            });
        }
        depthStencilAttachment.view = depthTexture.createView();

        // command encoder encodes commands
        const encoder = device.createCommandEncoder({ label: 'myEncoder'});

        // make a render pass encoder to render specific commands
        const renderPass = encoder.beginRenderPass(renderPassDecriptor);
        renderPass.setPipeline(renderPipeline);
        // Swap which buffers we are using each frame
        renderPass.setBindGroup(0, renderBindGroup);
        // Draw 3 vertices for each triangle
        renderPass.draw(12);
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
    /** @type{(timestamp: number) => void} */
    function frame(timestamp) {
        const seconds = timestamp / 1000;

        const matrix = mat4.identity();
        mat4.orthographicProjection(canvas.width, canvas.height, 400, matrix);
        mat4.translate(matrix, [500.0, 500.0, 0.0], matrix);
        const rotateRadians = Math.PI * seconds * 0.5;
        mat4.rotateX(matrix, rotateRadians, matrix);
        mat4.rotateY(matrix, rotateRadians, matrix);

        uniformData.set(matrix, 0);
        uniformData[16] = seconds;

        render();

        // request to re-run this function again next animation frame
        requestAnimationFrame(frame);
    }

    // Start the first frame of animation
    requestAnimationFrame(frame);
}

/** @type {(msg: string) => never} */
const fail = (msg) => {
    const errorMessage = document.body.appendChild(document.createElement("span"));
    errorMessage.innerText = msg;
    console.log(msg);
    throw new Error(msg);
}

main();
