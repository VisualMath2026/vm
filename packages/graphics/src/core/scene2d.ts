import { Camera2D } from "./camera2d";
import type { Drawable2D } from "../renderer2d/primitives";

export interface Scene2DSnapshot {
  schemaVersion: number;
  camera: ReturnType<Camera2D["snapshot"]>;
  objects: unknown[];
}

export class Scene2D {
  public camera = new Camera2D();
  private objects: Drawable2D[] = [];

  setViewport(width: number, height: number) {
    this.camera.setViewport(width, height);
  }

  add(obj: Drawable2D) {
    this.objects.push(obj);
  }

  clear() {
    this.objects = [];
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    for (const obj of this.objects) {
      obj.draw(ctx, this.camera);
    }
  }

  serialize(): Scene2DSnapshot {
    return {
      schemaVersion: 1,
      camera: this.camera.snapshot(),
      objects: this.objects.map((obj) => obj.serialize())
    };
  }

  load(snapshot: Scene2DSnapshot, factory: (obj: unknown) => Drawable2D) {
    if (snapshot.schemaVersion !== 1) {
      throw new Error("Unsupported schemaVersion");
    }

    this.camera.load(snapshot.camera);
    this.objects = snapshot.objects.map(factory);
  }
}
