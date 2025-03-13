import assert from "node:assert/strict";
import { Bounds } from "../src/bounds.js";

describe("Bounds", function() {
  it("constructor", function() {
    const rect = new Bounds(0, 50, 300, 350);

    assert.strictEqual(rect.minX, 0);
    assert.strictEqual(rect.minY, 50);
    assert.strictEqual(rect.maxX, 300);
    assert.strictEqual(rect.maxY, 350);
  });

  it("computed properties", function() {
    const rect = new Bounds(0, 50, 300, 450);

    assert.strictEqual(rect.x, 0);
    assert.strictEqual(rect.y, 50);
    assert.strictEqual(rect.width, 300);
    assert.strictEqual(rect.height, 400);
    assert.strictEqual(rect.midX, 150);
    assert.strictEqual(rect.midY, 250);
  });

  it("null", function() {
    const rect = new Bounds(0, 50, 400, 350);
    const nullRect = Bounds.null;

    assert.strictEqual(rect.isNull, false);
    assert.strictEqual(nullRect.isNull, true);
  });

  it("contains", function() {
    const rect = new Bounds(0, 50, 400, 350);
    const nullRect = Bounds.null;

    assert.strictEqual(rect.contains({ x: 10, y: 60 }), true);
    assert.strictEqual(rect.contains({ x: 0, y: 0 }), false);

    assert.strictEqual(nullRect.contains({ x: 0, y: 0 }), false);
  });

  describe("intersection", function() {
    it("null", function() {
      const rect = new Bounds(0, 0, 100, 100);
      const nullRect = Bounds.null;

      assert.strictEqual(rect.intersection(nullRect).isNull, true);
      assert.strictEqual(nullRect.intersection(rect).isNull, true);
    });

    it("not intersecting", function() {
      const rect1 = new Bounds(0, 0, 200, 100);
      const rect2 = new Bounds(300, 300, 500, 400);

      assert.strictEqual(rect1.intersection(rect2).isNull, true);
      assert.strictEqual(rect2.intersection(rect1).isNull, true);
    });

    it("intersecting", function() {
      const rect1 = new Bounds(0, 0, 200, 100);
      const rect2 = new Bounds(100, 50, 300, 150);

      assert.deepStrictEqual(rect1.intersection(rect2), new Bounds(100, 50, 200, 100));
      assert.deepStrictEqual(rect2.intersection(rect1), new Bounds(100, 50, 200, 100));
    });

    it("contained", function() {
      const rect1 = new Bounds(10, 40, 20, 60);
      const rect2 = new Bounds(0, 0, 100, 100);

      assert.deepStrictEqual(rect1.intersection(rect2), new Bounds(10, 40, 20, 60));
      assert.deepStrictEqual(rect2.intersection(rect1), new Bounds(10, 40, 20, 60));
    });

    it("zero length", function() {
      const rect1 = new Bounds(0, 0, 100, 100);
      const rect2 = new Bounds(100, 0, 200, 100);
      const rect3 = new Bounds(0, 100, 100, 200);
      const rect4 = new Bounds(100, 100, 200, 200);

      assert.deepStrictEqual(rect1.intersection(rect2), new Bounds(100, 0, 100, 100));
      assert.deepStrictEqual(rect2.intersection(rect1), new Bounds(100, 0, 100, 100));

      assert.deepStrictEqual(rect1.intersection(rect3), new Bounds(0, 100, 100, 100));
      assert.deepStrictEqual(rect3.intersection(rect1), new Bounds(0, 100, 100, 100));

      assert.deepStrictEqual(rect1.intersection(rect4), new Bounds(100, 100, 100, 100));
      assert.deepStrictEqual(rect4.intersection(rect1), new Bounds(100, 100, 100, 100));
    });
  });

  describe("union", function() {
    it("null", function() {
      const rect = new Bounds(0, 0, 100, 100);
      const nullRect = Bounds.null;

      assert.deepStrictEqual(rect.union(nullRect), rect);
      assert.deepStrictEqual(nullRect.union(rect), rect);
    });

    it("intersecting", function() {
      const rect1 = new Bounds(0, 0, 200, 100);
      const rect2 = new Bounds(100, 50, 300, 150);

      assert.deepStrictEqual(rect1.union(rect2), new Bounds(0, 0, 300, 150));
      assert.deepStrictEqual(rect2.union(rect1), new Bounds(0, 0, 300, 150));
    });

    it("not intersecting", function() {
      const rect1 = new Bounds(0, 0, 200, 100);
      const rect2 = new Bounds(300, 300, 500, 400);

      assert.deepStrictEqual(rect1.union(rect2), new Bounds(0, 0, 500, 400));
      assert.deepStrictEqual(rect2.union(rect1), new Bounds(0, 0, 500, 400));
    });
  });

  it("insetBy", function() {
    const rect = new Bounds(0, 0, 100, 200);

    assert.deepStrictEqual(rect.insetBy(10, 20), new Bounds(10, 20, 90, 180));
    assert.deepStrictEqual(rect.insetBy(-10, -20), new Bounds(-10, -20, 110, 220));
    assert.deepStrictEqual(rect.insetBy(50, 100), new Bounds(50, 100, 50, 100));
    assert.deepStrictEqual(rect.insetBy(51, 100).isNull, true);
    assert.deepStrictEqual(rect.insetBy(50, 101).isNull, true);
  });

  it("offsetBy", function() {
    const rect = new Bounds(0, 0, 100, 200);

    assert.deepStrictEqual(rect.offsetBy(10, 20), new Bounds(10, 20, 110, 220));
  });

  it("centeredAt", function() {
    const rect = new Bounds(0, 0, 100, 200);

    assert.deepStrictEqual(rect.centeredAt(0, 0), new Bounds(-50, -100, 50, 100));
  });
});
