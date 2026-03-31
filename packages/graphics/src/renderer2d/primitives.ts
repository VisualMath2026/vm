import { Camera2D } from "../core/camera2d";

export interface Drawable2D {
  id: string;
  draw(ctx: CanvasRenderingContext2D, cam: Camera2D): void;
  serialize(): unknown;
}

export class AxisGrid implements Drawable2D {
  id = "axis_grid";

  constructor(
    public step = 1,
    public majorEvery = 5
  ) {}

  draw(ctx: CanvasRenderingContext2D, cam: Camera2D) {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;

    const topLeft = cam.screenToWorld(0, 0);
    const bottomRight = cam.screenToWorld(width, height);

    const minX = Math.floor(Math.min(topLeft.x, bottomRight.x));
    const maxX = Math.ceil(Math.max(topLeft.x, bottomRight.x));
    const minY = Math.floor(Math.min(topLeft.y, bottomRight.y));
    const maxY = Math.ceil(Math.max(topLeft.y, bottomRight.y));

    ctx.save();
    ctx.lineWidth = 1;

    for (let x = minX; x <= maxX; x += this.step) {
      const p1 = cam.worldToScreen(x, minY);
      const p2 = cam.worldToScreen(x, maxY);

      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.strokeStyle =
        x % this.majorEvery === 0 ? "rgba(0,0,0,0.18)" : "rgba(0,0,0,0.08)";
      ctx.stroke();
    }

    for (let y = minY; y <= maxY; y += this.step) {
      const p1 = cam.worldToScreen(minX, y);
      const p2 = cam.worldToScreen(maxX, y);

      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.strokeStyle =
        y % this.majorEvery === 0 ? "rgba(0,0,0,0.18)" : "rgba(0,0,0,0.08)";
      ctx.stroke();
    }

    const xAxisStart = cam.worldToScreen(minX, 0);
    const xAxisEnd = cam.worldToScreen(maxX, 0);
    ctx.beginPath();
    ctx.moveTo(xAxisStart.x, xAxisStart.y);
    ctx.lineTo(xAxisEnd.x, xAxisEnd.y);
    ctx.strokeStyle = "rgba(0,0,0,0.6)";
    ctx.stroke();

    const yAxisStart = cam.worldToScreen(0, minY);
    const yAxisEnd = cam.worldToScreen(0, maxY);
    ctx.beginPath();
    ctx.moveTo(yAxisStart.x, yAxisStart.y);
    ctx.lineTo(yAxisEnd.x, yAxisEnd.y);
    ctx.strokeStyle = "rgba(0,0,0,0.6)";
    ctx.stroke();

    ctx.restore();
  }

  serialize() {
    return {
      type: "AxisGrid",
      step: this.step,
      majorEvery: this.majorEvery
    };
  }
}

export class Polyline implements Drawable2D {
  constructor(
    public id: string,
    public points: { x: number; y: number }[]
  ) {}

  draw(ctx: CanvasRenderingContext2D, cam: Camera2D) {
    if (this.points.length < 2) {
      return;
    }

    ctx.save();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgba(20,20,20,0.85)";
    ctx.beginPath();

    const first = cam.worldToScreen(this.points[0].x, this.points[0].y);
    ctx.moveTo(first.x, first.y);

    for (let i = 1; i < this.points.length; i += 1) {
      const point = cam.worldToScreen(this.points[i].x, this.points[i].y);
      ctx.lineTo(point.x, point.y);
    }

    ctx.stroke();
    ctx.restore();
  }

  serialize() {
    return {
      type: "Polyline",
      id: this.id,
      points: this.points
    };
  }
}

export class FunctionPlot implements Drawable2D {
  constructor(
    public id: string,
    public fn: (x: number) => number,
    public xMin: number,
    public xMax: number
  ) {}

  draw(ctx: CanvasRenderingContext2D, cam: Camera2D) {
    const steps = 300;
    const points: { x: number; y: number }[] = [];

    for (let i = 0; i <= steps; i += 1) {
      const x = this.xMin + (this.xMax - this.xMin) * (i / steps);
      const y = this.fn(x);
      if (Number.isFinite(y)) {
        points.push({ x, y });
      }
    }

    new Polyline(`${this.id}_poly`, points).draw(ctx, cam);
  }

  serialize() {
    return {
      type: "FunctionPlot",
      id: this.id,
      xMin: this.xMin,
      xMax: this.xMax,
      fn: "runtime"
    };
  }
}
