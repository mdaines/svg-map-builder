import assert from "node:assert/strict";
import { SimpleTransform } from "../lib/simple-transform.js";
import { Bounds } from "../lib/bounds.js";

describe("SimpleTransform", function() {
  describe("constructor", function() {
    it("default is identity", function() {
      const t = new SimpleTransform();
      assert.strictEqual(t.a, 1);
      assert.strictEqual(t.tx, 0);
      assert.strictEqual(t.ty, 0);
    });
  });

  describe("concat", function() {
    it("returns a new transform with the expected values", function() {
      const t1 = new SimpleTransform();
      const t2 = t1.concat(new SimpleTransform().scale(2));

      assert.notStrictEqual(t1, t2);
      assert.strictEqual(t2.a, 2);
    });
  });

  describe("translate", function() {
    it("returns a new transform with the expected values", function() {
      const t1 = new SimpleTransform();
      const t2 = t1.translate(1, 2);

      assert.notStrictEqual(t1, t2);
      assert.strictEqual(t2.tx, 1);
      assert.strictEqual(t2.ty, 2);
    });
  });

  describe("scale", function() {
    it("returns a new transform with the expected values", function() {
      const t1 = new SimpleTransform();
      const t2 = t1.scale(3);

      assert.notStrictEqual(t1, t2);
      assert.strictEqual(t2.a, 3);
    });
  });

  describe("inverse", function() {
    it("returns a new transform with the expected values", function() {
      const t1 = new SimpleTransform().scale(2).translate(1, 2);
      const t2 = t1.inverse();

      assert.notStrictEqual(t1, t2);
      assert.strictEqual(t2.a, 0.5);
      assert.strictEqual(t2.tx, -1);
      assert.strictEqual(t2.ty, -2);
    });
  });

  it("convertBounds", function() {
    const t = new SimpleTransform().scale(2).translate(10, 20);
    const rect = new Bounds(0, 10, 300, 210);

    assert.deepStrictEqual(t.convertBounds(rect), new Bounds(20, 60, 620, 460));
  });
});
