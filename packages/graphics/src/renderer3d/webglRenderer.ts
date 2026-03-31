export interface WebGLMesh {
  id: string;
  vertices: Float32Array;
  indices: Uint16Array;
}

export class WebGLRenderer {
  private readonly gl: WebGL2RenderingContext;
  private program: WebGLProgram | null = null;

  constructor(private readonly canvas: HTMLCanvasElement) {
    const context = canvas.getContext("webgl2");
    if (!context) {
      throw new Error("WebGL2 is not available");
    }

    this.gl = context;
  }

  init(vertexSrc: string, fragmentSrc: string) {
    const vs = this.compile(this.gl.VERTEX_SHADER, vertexSrc);
    const fs = this.compile(this.gl.FRAGMENT_SHADER, fragmentSrc);

    const program = this.gl.createProgram();
    if (!program) {
      throw new Error("createProgram failed");
    }

    this.gl.attachShader(program, vs);
    this.gl.attachShader(program, fs);
    this.gl.linkProgram(program);

    if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
      const log = this.gl.getProgramInfoLog(program);
      throw new Error(`Program link failed: ${log}`);
    }

    this.program = program;
  }

  render(mesh: WebGLMesh) {
    void mesh;
    if (!this.program) {
      throw new Error("Renderer is not initialized");
    }

    const gl = this.gl;
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(1, 1, 1, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.useProgram(this.program);
  }

  private compile(type: number, src: string): WebGLShader {
    const shader = this.gl.createShader(type);
    if (!shader) {
      throw new Error("createShader failed");
    }

    this.gl.shaderSource(shader, src);
    this.gl.compileShader(shader);

    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      const log = this.gl.getShaderInfoLog(shader);
      throw new Error(`Shader compile failed: ${log}`);
    }

    return shader;
  }
}
