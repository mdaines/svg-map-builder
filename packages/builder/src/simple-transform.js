import { Bounds } from "./bounds.js";

export class SimpleTransform {
  constructor(a = 1, tx = 0, ty = 0) {
    this.a = a;
    this.tx = tx;
    this.ty = ty;
  }

  inverse() {
    const a = this.a;
    const tx = this.tx;
    const ty = this.ty;

    if (a == 0) {
      console.warn("Can't invert transform with zero scale");
      return new this.constructor(a, tx, ty);
    }

    return new this.constructor(
      1 / a,
      1 / a * -tx,
      1 / a * -ty
    );
  }

  concat(t) {
    return new this.constructor(
      this.a * t.a,
      this.a * t.tx + this.tx,
      this.a * t.ty + this.ty
    );
  }

  scale(s) {
    return new this.constructor(
      this.a * s,
      this.tx,
      this.ty
    );
  }

  translate(dx, dy) {
    return new this.constructor(
      this.a,
      this.a * dx + this.tx,
      this.a * dy + this.ty
    );
  }

  convertPoint({ x, y }) {
    return {
      x: this.a * x + this.tx,
      y: this.a * y + this.ty
    };
  }

  convertBounds(bounds) {
    return new Bounds(
      this.a * bounds.minX + this.tx,
      this.a * bounds.minY + this.ty,
      this.a * bounds.maxX + this.tx,
      this.a * bounds.maxY + this.ty
    );
  }

  convertSize({ width, height }) {
    return {
      width: this.a * width,
      height: this.a * height
    };
  }
}
