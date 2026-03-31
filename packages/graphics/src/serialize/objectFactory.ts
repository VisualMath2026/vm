import {
  AxisGrid,
  FunctionPlot,
  Polyline,
  type Drawable2D
} from "../renderer2d/primitives";

export function objectFactory(obj: unknown): Drawable2D {
  if (!obj || typeof obj !== "object") {
    throw new Error("objectFactory: invalid object");
  }

  const shape = obj as {
    type?: string;
    id?: string;
    step?: number;
    majorEvery?: number;
    points?: { x: number; y: number }[];
    xMin?: number;
    xMax?: number;
  };

  switch (shape.type) {
    case "AxisGrid":
      return new AxisGrid(shape.step ?? 1, shape.majorEvery ?? 5);

    case "Polyline":
      return new Polyline(
        String(shape.id ?? "poly"),
        Array.isArray(shape.points) ? shape.points : []
      );

    case "FunctionPlot": {
      const id = String(shape.id ?? "fn");
      const xMin = Number(shape.xMin ?? -5);
      const xMax = Number(shape.xMax ?? 5);

      const presets: Record<string, (x: number) => number> = {
        sin: (x) => Math.sin(x),
        cos: (x) => Math.cos(x),
        parabola: (x) => x * x
      };

      const fn = presets[id] ?? ((x) => Math.sin(x));
      return new FunctionPlot(id, fn, xMin, xMax);
    }

    default:
      throw new Error(`objectFactory: unknown type ${String(shape.type)}`);
  }
}
