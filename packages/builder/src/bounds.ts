import { type Point } from "./point.js";

export class Bounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;

  static get null() {
    return new this(Infinity, Infinity, Infinity, Infinity);
  }

  constructor(minX: number, minY: number, maxX: number, maxY: number) {
    this.minX = minX;
    this.minY = minY;
    this.maxX = maxX;
    this.maxY = maxY;
  }

  get isNull() {
    return this.minX === Infinity && this.minY === Infinity && this.maxX === Infinity && this.maxY === Infinity;
  }

  get x() {
    return this.minX;
  }

  get y() {
    return this.minY;
  }

  get width() {
    return this.maxX - this.minX;
  }

  get height() {
    return this.maxY - this.minY;
  }

  get midX() {
    return this.minX + this.width * 0.5;
  }

  get midY() {
    return this.minY + this.height * 0.5;
  }

  contains(point: Point) {
    if (this.isNull) {
      return false;
    }

    return point.x >= this.minX && point.x <= this.maxX && point.y >= this.minY && point.y <= this.maxY;
  }

  intersection(other: Bounds) {
    if (this.isNull || other.isNull) {
      return Bounds.null;
    }

    const minX = Math.max(this.minX, other.minX);
    const minY = Math.max(this.minY, other.minY);
    const maxX = Math.min(this.maxX, other.maxX);
    const maxY = Math.min(this.maxY, other.maxY);

    if (minX > maxX || minY > maxY) {
      return Bounds.null;
    }

    return new Bounds(minX, minY, maxX, maxY);
  }

  union(other: Bounds) {
    if (this.isNull) {
      return new Bounds(other.minX, other.minY, other.maxX, other.maxY);
    }

    if (other.isNull) {
      return new Bounds(this.minX, this.minY, this.maxX, this.maxY);
    }

    const minX = Math.min(this.minX, other.minX);
    const minY = Math.min(this.minY, other.minY);
    const maxX = Math.max(this.maxX, other.maxX);
    const maxY = Math.max(this.maxY, other.maxY);

    return new Bounds(minX, minY, maxX, maxY);
  }

  insetBy(dMinX: number, dMinY: number = dMinX, dMaxX: number = dMinX, dMaxY: number = dMinY) {
    if (dMinX + dMaxX > this.width || dMinY + dMaxY > this.height) {
      return Bounds.null;
    }

    return new Bounds(this.minX + dMinX, this.minY + dMinY, this.maxX - dMaxX, this.maxY - dMaxY);
  }

  offsetBy(dx: number, dy: number) {
    return new Bounds(this.minX + dx, this.minY + dy, this.maxX + dx, this.maxY + dy);
  }

  centeredAt(cx: number, cy: number) {
    return new Bounds(cx - this.width * 0.5, cy - this.height * 0.5, cx + this.width * 0.5, cy + this.height * 0.5);
  }
}
