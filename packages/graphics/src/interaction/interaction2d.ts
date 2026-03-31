import { Scene2D } from "../core/scene2d";

export class Interaction2D {
  private dragging = false;
  private lastX = 0;
  private lastY = 0;

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly scene: Scene2D,
    private readonly requestRedraw: () => void
  ) {
    canvas.addEventListener("pointerdown", (event) => {
      this.dragging = true;
      this.lastX = event.clientX;
      this.lastY = event.clientY;
      canvas.setPointerCapture(event.pointerId);
    });

    canvas.addEventListener("pointerup", (event) => {
      this.dragging = false;
      try {
        canvas.releasePointerCapture(event.pointerId);
      } catch {}
    });

    canvas.addEventListener("pointermove", (event) => {
      if (!this.dragging) {
        return;
      }

      const dx = event.clientX - this.lastX;
      const dy = event.clientY - this.lastY;
      this.lastX = event.clientX;
      this.lastY = event.clientY;

      this.scene.camera.pan(dx, dy);
      this.requestRedraw();
    });

    canvas.addEventListener(
      "wheel",
      (event) => {
        event.preventDefault();

        const factor = event.deltaY > 0 ? 0.92 : 1.08;
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        this.scene.camera.zoom(factor, { x, y });
        this.requestRedraw();
      },
      { passive: false }
    );
  }
}