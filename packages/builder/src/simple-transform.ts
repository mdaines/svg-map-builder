import { Bounds } from "./bounds.js";
import { type Point } from "./point.js";

/** @internal */
export class SimpleTransform {
  a: number;
  tx: number;
  ty: number;

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
      throw new Error("Can't invert transform with zero scale");
    }

    return new SimpleTransform(
      1 / a,
      1 / a * -tx,
      1 / a * -ty
    );
  }

  concat(t: SimpleTransform) {
    return new SimpleTransform(
      this.a * t.a,
      this.a * t.tx + this.tx,
      this.a * t.ty + this.ty
    );
  }

  scale(s: number) {
    return new SimpleTransform(
      this.a * s,
      this.tx,
      this.ty
    );
  }

  translate(dx: number, dy: number) {
    return new SimpleTransform(
      this.a,
      this.a * dx + this.tx,
      this.a * dy + this.ty
    );
  }

  convertPoint({ x, y }: Point) {
    return {
      x: this.a * x + this.tx,
      y: this.a * y + this.ty
    };
  }

  convertBounds(bounds: Bounds) {
    return new Bounds(
      this.a * bounds.minX + this.tx,
      this.a * bounds.minY + this.ty,
      this.a * bounds.maxX + this.tx,
      this.a * bounds.maxY + this.ty
    );
  }

  /**
   * @param options
   */
  convertSize({ width, height }: { width: number, height: number }) {
    return {
      width: this.a * width,
      height: this.a * height
    };
  }
}
