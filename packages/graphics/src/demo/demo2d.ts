import { Scene2D } from "../core/scene2d";
import { Interaction2D } from "../interaction/interaction2d";
import { AxisGrid, FunctionPlot } from "../renderer2d/primitives";
import { objectFactory } from "../serialize/objectFactory";
import { assertSnapshot } from "../serialize/schema";

export function runDemo(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Canvas2D context is not available");
  }

  const scene = new Scene2D();
  scene.setViewport(canvas.width, canvas.height);
  scene.add(new AxisGrid(1, 5));
  scene.add(new FunctionPlot("sin", Math.sin, -10, 10));

  const redraw = () => scene.draw(ctx);

  new Interaction2D(canvas, scene, redraw);
  redraw();

  const snapshot = scene.serialize();
  const json = JSON.stringify(snapshot);
  const parsed = JSON.parse(json);

  assertSnapshot(parsed);
  scene.clear();
  scene.load(parsed, objectFactory);
  redraw();

  return {
    snapshot,
    toJSON: () => json
  };
}