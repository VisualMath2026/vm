import { Scene2D } from "../core/scene2d";
import { Interaction2D } from "../interaction/interaction2d";
import {
  Axis2D,
  Circle2D,
  FunctionGraph2D,
  Grid2D,
  Line2D,
  Point2D,
} from "../renderer2d/primitives";

export interface Demo2DController {
  scene: Scene2D;
  interaction: Interaction2D;
  render: () => void;
  dispose: () => void;
}

export function createDemo2D(canvas: HTMLCanvasElement): Demo2DController {
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("2D canvas context is not available");
  }

  const scene = new Scene2D({
    background: "#ffffff",
    camera: { x: 0, y: 0, zoom: 40, minZoom: 10, maxZoom: 400 },
  });

  scene
    .add(new Grid2D({ id: "grid", step: 1, extent: 20 }))
    .add(new Axis2D({ id: "axis", extent: 20, strokeStyle: "#111827", lineWidth: 2 }))
    .add(
      new FunctionGraph2D({
        id: "sin",
        fn: (x) => Math.sin(x),
        xMin: -10,
        xMax: 10,
        samples: 400,
        strokeStyle: "#2563eb",
        lineWidth: 2,
      })
    )
    .add(new Point2D({ id: "p0", x: 0, y: 0, radius: 5, strokeStyle: "#dc2626" }))
    .add(new Circle2D({ id: "c0", x: 2, y: 1, radius: 0.5, strokeStyle: "#16a34a", lineWidth: 2 }))
    .add(new Line2D({ id: "l0", x1: -2, y1: -1, x2: 3, y2: 2, strokeStyle: "#7c3aed", lineWidth: 2 }));

  const render = () => {
    scene.render(context);
  };

  const interaction = new Interaction2D(canvas, scene, { onChange: render });
  interaction.attach();
  render();

  return {
    scene,
    interaction,
    render,
    dispose: () => interaction.detach(),
  };
}
