export interface Vec2 {
  x: number;
  y: number;
}

export class Camera2D {
  private origin: Vec2 = { x: 0, y: 0 };
  private scale = 60;
  private center: Vec2 = { x: 0, y: 0 };

  setViewport(width: number, height: number) {
    this.center = { x: width / 2, y: height / 2 };
  }

  pan(dxPx: number, dyPx: number) {
    this.origin.x -= dxPx / this.scale;
    this.origin.y += dyPx / this.scale;
  }

  zoom(factor: number, anchorPx?: Vec2) {
    const oldScale = this.scale;
    const nextScale = Math.min(Math.max(oldScale * factor, 10), 400);

    if (anchorPx) {
      const before = this.screenToWorld(anchorPx.x, anchorPx.y);
      this.scale = nextScale;
      const after = this.screenToWorld(anchorPx.x, anchorPx.y);
      this.origin.x += before.x - after.x;
      this.origin.y += before.y - after.y;
      return;
    }

    this.scale = nextScale;
  }

  worldToScreen(wx: number, wy: number): Vec2 {
    return {
      x: (wx - this.origin.x) * this.scale + this.center.x,
      y: (-(wy - this.origin.y)) * this.scale + this.center.y
    };
  }

  screenToWorld(px: number, py: number): Vec2 {
    return {
      x: (px - this.center.x) / this.scale + this.origin.x,
      y: -((py - this.center.y) / this.scale) + this.origin.y
    };
  }

  getScale(): number {
    return this.scale;
  }

  snapshot() {
    return {
      origin: { ...this.origin },
      scale: this.scale
    };
  }

  load(snapshot: { origin: Vec2; scale: number }) {
    this.origin = { ...snapshot.origin };
    this.scale = snapshot.scale;
  }
}