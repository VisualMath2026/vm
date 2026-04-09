import type { Renderable } from "../core/renderable";
import type { Camera2D } from "../core/camera2d";
import type {
  Axis2DJSON,
  Circle2DJSON,
  Grid2DJSON,
  Line2DJSON,
  Point2DJSON,
  Polyline2DJSON,
} from "../serialize/schema";

export interface BasePrimitiveOptions {
  id: string;
  visible?: boolean;
  strokeStyle?: string;
  fillStyle?: string;
  lineWidth?: number;
}

export interface Point2DOptions extends BasePrimitiveOptions {
  x: number;
  y: number;
  radius?: number;
}

export interface Line2DOptions extends BasePrimitiveOptions {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface Polyline2DOptions extends BasePrimitiveOptions {
  points: Array<{ x: number; y: number }>;
}

export interface Grid2DOptions extends BasePrimitiveOptions {
  step?: number;
  extent?: number;
}

export interface Axis2DOptions extends BasePrimitiveOptions {
  extent?: number;
}

export interface FunctionGraph2DOptions extends BasePrimitiveOptions {
  fn: (x: number) => number;
  xMin?: number;
  xMax?: number;
  samples?: number;
}

export interface Circle2DOptions extends BasePrimitiveOptions {
  x: number;
  y: number;
  radius: number;
}

abstract class BasePrimitive implements Renderable {
  id: string;
  type: string;
  visible: boolean;
  strokeStyle: string;
  fillStyle: string;
  lineWidth: number;

  constructor(type: string, options: BasePrimitiveOptions) {
    this.id = options.id;
    this.type = type;
    this.visible = options.visible ?? true;
    this.strokeStyle = options.strokeStyle ?? "#2563eb";
    this.fillStyle = options.fillStyle ?? "transparent";
    this.lineWidth = options.lineWidth ?? 2;
  }

  abstract render(context: CanvasRenderingContext2D, camera: Camera2D): void;
  abstract toJSON(): import("../serialize/schema").SceneObjectJSON;
}

export class Point2D extends BasePrimitive {
  x: number;
  y: number;
  radius: number;

  constructor(options: Point2DOptions) {
    super("point2d", options);
    this.x = options.x;
    this.y = options.y;
    this.radius = options.radius ?? 4;
  }

  render(context: CanvasRenderingContext2D, camera: Camera2D): void {
    if (!this.visible) return;
    const screen = camera.worldToScreen({ x: this.x, y: this.y }, context.canvas.width, context.canvas.height);
    context.save();
    context.beginPath();
    context.fillStyle = this.strokeStyle;
    context.arc(screen.x, screen.y, this.radius, 0, Math.PI * 2);
    context.fill();
    context.restore();
  }

  toJSON(): Point2DJSON {
    return {
      type: "point2d",
      id: this.id,
      visible: this.visible,
      x: this.x,
      y: this.y,
      radius: this.radius,
      strokeStyle: this.strokeStyle,
      fillStyle: this.fillStyle,
      lineWidth: this.lineWidth,
    };
  }
}

export class Line2D extends BasePrimitive {
  x1: number;
  y1: number;
  x2: number;
  y2: number;

  constructor(options: Line2DOptions) {
    super("line2d", options);
    this.x1 = options.x1;
    this.y1 = options.y1;
    this.x2 = options.x2;
    this.y2 = options.y2;
  }

  render(context: CanvasRenderingContext2D, camera: Camera2D): void {
    if (!this.visible) return;
    const a = camera.worldToScreen({ x: this.x1, y: this.y1 }, context.canvas.width, context.canvas.height);
    const b = camera.worldToScreen({ x: this.x2, y: this.y2 }, context.canvas.width, context.canvas.height);

    context.save();
    context.beginPath();
    context.strokeStyle = this.strokeStyle;
    context.lineWidth = this.lineWidth;
    context.moveTo(a.x, a.y);
    context.lineTo(b.x, b.y);
    context.stroke();
    context.restore();
  }

  toJSON(): Line2DJSON {
    return {
      type: "line2d",
      id: this.id,
      visible: this.visible,
      x1: this.x1,
      y1: this.y1,
      x2: this.x2,
      y2: this.y2,
      strokeStyle: this.strokeStyle,
      fillStyle: this.fillStyle,
      lineWidth: this.lineWidth,
    };
  }
}

export class Polyline2D extends BasePrimitive {
  points: Array<{ x: number; y: number }>;

  constructor(options: Polyline2DOptions) {
    super("polyline2d", options);
    this.points = options.points;
  }

  render(context: CanvasRenderingContext2D, camera: Camera2D): void {
    if (!this.visible || this.points.length === 0) return;

    context.save();
    context.beginPath();
    context.strokeStyle = this.strokeStyle;
    context.lineWidth = this.lineWidth;

    this.points.forEach((point, index) => {
      const screen = camera.worldToScreen(point, context.canvas.width, context.canvas.height);
      if (index === 0) {
        context.moveTo(screen.x, screen.y);
      } else {
        context.lineTo(screen.x, screen.y);
      }
    });

    context.stroke();
    context.restore();
  }

  toJSON(): Polyline2DJSON {
    return {
      type: "polyline2d",
      id: this.id,
      visible: this.visible,
      points: this.points,
      strokeStyle: this.strokeStyle,
      fillStyle: this.fillStyle,
      lineWidth: this.lineWidth,
    };
  }
}

export class Grid2D extends BasePrimitive {
  step: number;
  extent: number;

  constructor(options: Grid2DOptions) {
    super("grid2d", options);
    this.step = options.step ?? 1;
    this.extent = options.extent ?? 20;
    this.strokeStyle = options.strokeStyle ?? "#e5e7eb";
    this.lineWidth = options.lineWidth ?? 1;
  }

  render(context: CanvasRenderingContext2D, camera: Camera2D): void {
    if (!this.visible) return;

    context.save();
    context.strokeStyle = this.strokeStyle;
    context.lineWidth = this.lineWidth;

    for (let x = -this.extent; x <= this.extent; x += this.step) {
      const a = camera.worldToScreen({ x, y: -this.extent }, context.canvas.width, context.canvas.height);
      const b = camera.worldToScreen({ x, y: this.extent }, context.canvas.width, context.canvas.height);
      context.beginPath();
      context.moveTo(a.x, a.y);
      context.lineTo(b.x, b.y);
      context.stroke();
    }

    for (let y = -this.extent; y <= this.extent; y += this.step) {
      const a = camera.worldToScreen({ x: -this.extent, y }, context.canvas.width, context.canvas.height);
      const b = camera.worldToScreen({ x: this.extent, y }, context.canvas.width, context.canvas.height);
      context.beginPath();
      context.moveTo(a.x, a.y);
      context.lineTo(b.x, b.y);
      context.stroke();
    }

    context.restore();
  }

  toJSON(): Grid2DJSON {
    return {
      type: "grid2d",
      id: this.id,
      visible: this.visible,
      step: this.step,
      extent: this.extent,
      strokeStyle: this.strokeStyle,
      fillStyle: this.fillStyle,
      lineWidth: this.lineWidth,
    };
  }
}

export class Axis2D extends BasePrimitive {
  extent: number;

  constructor(options: Axis2DOptions) {
    super("axis2d", options);
    this.extent = options.extent ?? 20;
    this.strokeStyle = options.strokeStyle ?? "#111827";
  }

  render(context: CanvasRenderingContext2D, camera: Camera2D): void {
    if (!this.visible) return;

    const xAxisA = camera.worldToScreen({ x: -this.extent, y: 0 }, context.canvas.width, context.canvas.height);
    const xAxisB = camera.worldToScreen({ x: this.extent, y: 0 }, context.canvas.width, context.canvas.height);
    const yAxisA = camera.worldToScreen({ x: 0, y: -this.extent }, context.canvas.width, context.canvas.height);
    const yAxisB = camera.worldToScreen({ x: 0, y: this.extent }, context.canvas.width, context.canvas.height);

    context.save();
    context.strokeStyle = this.strokeStyle;
    context.lineWidth = this.lineWidth;

    context.beginPath();
    context.moveTo(xAxisA.x, xAxisA.y);
    context.lineTo(xAxisB.x, xAxisB.y);
    context.stroke();

    context.beginPath();
    context.moveTo(yAxisA.x, yAxisA.y);
    context.lineTo(yAxisB.x, yAxisB.y);
    context.stroke();

    context.restore();
  }

  toJSON(): Axis2DJSON {
    return {
      type: "axis2d",
      id: this.id,
      visible: this.visible,
      extent: this.extent,
      strokeStyle: this.strokeStyle,
      fillStyle: this.fillStyle,
      lineWidth: this.lineWidth,
    };
  }
}

export class FunctionGraph2D extends BasePrimitive {
  fn: (x: number) => number;
  xMin: number;
  xMax: number;
  samples: number;

  constructor(options: FunctionGraph2DOptions) {
    super("functionGraph2d", options);
    this.fn = options.fn;
    this.xMin = options.xMin ?? -10;
    this.xMax = options.xMax ?? 10;
    this.samples = options.samples ?? 200;
  }

  render(context: CanvasRenderingContext2D, camera: Camera2D): void {
    if (!this.visible) return;

    const points: Array<{ x: number; y: number }> = [];
    const step = (this.xMax - this.xMin) / this.samples;

    for (let i = 0; i <= this.samples; i += 1) {
      const x = this.xMin + i * step;
      const y = this.fn(x);
      if (Number.isFinite(y)) {
        points.push({ x, y });
      }
    }

    new Polyline2D({
      id: `${this.id}__polyline`,
      points,
      strokeStyle: this.strokeStyle,
      lineWidth: this.lineWidth,
      visible: this.visible,
    }).render(context, camera);
  }

  toJSON(): Polyline2DJSON {
    const points: Array<{ x: number; y: number }> = [];
    const step = (this.xMax - this.xMin) / this.samples;

    for (let i = 0; i <= this.samples; i += 1) {
      const x = this.xMin + i * step;
      const y = this.fn(x);
      if (Number.isFinite(y)) {
        points.push({ x, y });
      }
    }

    return {
      type: "polyline2d",
      id: this.id,
      visible: this.visible,
      points,
      strokeStyle: this.strokeStyle,
      fillStyle: this.fillStyle,
      lineWidth: this.lineWidth,
    };
  }
}

export class Circle2D extends BasePrimitive {
  x: number;
  y: number;
  radius: number;

  constructor(options: Circle2DOptions) {
    super("circle2d", options);
    this.x = options.x;
    this.y = options.y;
    this.radius = options.radius;
  }

  render(context: CanvasRenderingContext2D, camera: Camera2D): void {
    if (!this.visible) return;
    const center = camera.worldToScreen({ x: this.x, y: this.y }, context.canvas.width, context.canvas.height);

    context.save();
    context.beginPath();
    context.strokeStyle = this.strokeStyle;
    context.lineWidth = this.lineWidth;
    context.arc(center.x, center.y, this.radius * camera.zoom, 0, Math.PI * 2);

    if (this.fillStyle !== "transparent") {
      context.fillStyle = this.fillStyle;
      context.fill();
    }

    context.stroke();
    context.restore();
  }

  toJSON(): Circle2DJSON {
    return {
      type: "circle2d",
      id: this.id,
      visible: this.visible,
      x: this.x,
      y: this.y,
      radius: this.radius,
      strokeStyle: this.strokeStyle,
      fillStyle: this.fillStyle,
      lineWidth: this.lineWidth,
    };
  }
}
