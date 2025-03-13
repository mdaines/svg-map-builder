import assert from "node:assert/strict";
import { Layout } from "../src/layout.js";
import { Bounds } from "../src/bounds.js";

describe("Layout", function() {
  describe("camera", function() {
    it("world", function() {
      const layout = Layout.camera({
        center: { x: 0.5, y: 0.5 },
        zoom: 0,
        width: 512,
        height: 512,
        tileLength: 512
      });

      assert.deepStrictEqual(layout.canvasBounds, new Bounds(0, 0, 512, 512));
      assert.deepStrictEqual(layout.backgroundBounds, new Bounds(0, 0, 512, 512));

      assert.deepStrictEqual(layout.tileIds, [[0, 0, 0]]);

      assert.deepStrictEqual(layout.tileBounds([0, 0, 0]), new Bounds(0, 0, 512, 512));

      assert.strictEqual(layout.zoom, 0);
    });

    it("center", function() {
      const layout = Layout.camera({
        center: { x: 0.5, y: 0.5 },
        zoom: 1.25,
        width: 512,
        height: 512,
        tileLength: 512
      });

      assert.deepStrictEqual(layout.canvasBounds, new Bounds(0, 0, 512, 512));
      assert.deepStrictEqual(layout.backgroundBounds, new Bounds(0, 0, 512, 512));

      assert.deepStrictEqual(layout.tileIds, [[1, 0, 0], [1, 1, 0], [1, 0, 1], [1, 1, 1]]);

      assert.deepStrictEqual(layout.tileBounds([1, 0, 0]), new Bounds(-353, -353, 256, 256));
      assert.deepStrictEqual(layout.tileBounds([1, 1, 1]), new Bounds(256, 256, 865, 865));

      assert.strictEqual(layout.zoom, 1.2502984179063323);
    });
  });

  describe("box", function() {
    it("world", function() {
      const layout = Layout.box({
        bounds: new Bounds(0, 0, 1, 1),
        width: 512,
        height: 512,
        padding: 0,
        tileLength: 256
      });

      assert.deepStrictEqual(layout.canvasBounds, new Bounds(0, 0, 512, 512));
      assert.deepStrictEqual(layout.backgroundBounds, new Bounds(0, 0, 512, 512));

      assert.deepStrictEqual(layout.tileIds, [[1, 0, 0], [1, 1, 0], [1, 0, 1], [1, 1, 1]]);

      assert.deepStrictEqual(layout.tileBounds([1, 0, 0]), new Bounds(0, 0, 256, 256));
      assert.deepStrictEqual(layout.tileBounds([1, 1, 1]), new Bounds(256, 256, 512, 512));

      assert.strictEqual(layout.zoom, 1);
    });

    it("world with non integral zoom", function() {
      const layout = Layout.box({
        bounds: new Bounds(0, 0, 1, 1),
        width: 448,
        height: 448,
        padding: 0,
        tileLength: 256
      });

      assert.deepStrictEqual(layout.canvasBounds, new Bounds(0, 0, 448, 448));
      assert.deepStrictEqual(layout.backgroundBounds, new Bounds(0, 0, 448, 448));

      assert.deepStrictEqual(layout.tileIds, [[1, 0, 0], [1, 1, 0], [1, 0, 1], [1, 1, 1]]);

      assert.deepStrictEqual(layout.tileBounds([1, 0, 0]), new Bounds(0, 0, 224, 224));
      assert.deepStrictEqual(layout.tileBounds([1, 1, 1]), new Bounds(224, 224, 448, 448));

      assert.strictEqual(layout.zoom, 0.8073549220576041);
    });

    it("center", function() {
      const layout = Layout.box({
        bounds: new Bounds(0.25, 0.25, 0.75, 0.75),
        width: 512,
        height: 512,
        padding: 0,
        tileLength: 256
      });

      assert.deepStrictEqual(layout.canvasBounds, new Bounds(0, 0, 512, 512));
      assert.deepStrictEqual(layout.backgroundBounds, new Bounds(0, 0, 512, 512));

      assert.deepStrictEqual(layout.tileIds, [[2, 1, 1], [2, 2, 1], [2, 1, 2], [2, 2, 2]]);

      assert.deepStrictEqual(layout.tileBounds([2, 1, 1]), new Bounds(0, 0, 256, 256));
      assert.deepStrictEqual(layout.tileBounds([2, 2, 2]), new Bounds(256, 256, 512, 512));

      assert.strictEqual(layout.zoom, 2);
    });

    it("center with cropped tiles", function() {
      const layout = Layout.box({
        bounds: new Bounds(0.0625, 0.0625, 0.9375, 0.9375),
        width: 448,
        height: 448,
        tileLength: 256
      });

      assert.deepStrictEqual(layout.canvasBounds, new Bounds(0, 0, 448, 448));
      assert.deepStrictEqual(layout.backgroundBounds, new Bounds(0, 0, 448, 448));

      assert.deepStrictEqual(layout.tileIds, [[1, 0, 0], [1, 1, 0], [1, 0, 1], [1, 1, 1]]);

      assert.deepStrictEqual(layout.tileBounds([1, 0, 0]), new Bounds(-32, -32, 224, 224));
      assert.deepStrictEqual(layout.tileBounds([1, 1, 1]), new Bounds(224, 224, 480, 480));

      assert.strictEqual(layout.zoom, 1);
    });

    it("center with padding", function() {
      const layout = Layout.box({
        bounds: new Bounds(0.25, 0.25, 0.75, 0.75),
        width: 512,
        height: 512,
        padding: 128,
        tileLength: 256
      });

      assert.deepStrictEqual(layout.canvasBounds, new Bounds(0, 0, 512, 512));
      assert.deepStrictEqual(layout.backgroundBounds, new Bounds(0, 0, 512, 512));

      assert.deepStrictEqual(layout.tileIds, [[1, 0, 0], [1, 1, 0], [1, 0, 1], [1, 1, 1]]);

      assert.deepStrictEqual(layout.tileBounds([1, 0, 0]), new Bounds(0, 0, 256, 256));
      assert.deepStrictEqual(layout.tileBounds([1, 1, 1]), new Bounds(256, 256, 512, 512));

      assert.strictEqual(layout.zoom, 1);
    });

    it("world with odd length canvas", function() {
      const layout = Layout.box({
        bounds: new Bounds(0, 0, 1, 1),
        width: 501,
        height: 501,
        padding: 0,
        tileLength: 256
      });

      assert.deepStrictEqual(layout.canvasBounds, new Bounds(0, 0, 501, 501));
      assert.deepStrictEqual(layout.backgroundBounds, new Bounds(0, 0, 501, 501));

      assert.deepStrictEqual(layout.tileIds, [[1, 0, 0], [1, 1, 0], [1, 0, 1], [1, 1, 1]]);

      assert.deepStrictEqual(layout.tileBounds([1, 0, 0]), new Bounds(-1, -1, 250, 250));
      assert.deepStrictEqual(layout.tileBounds([1, 1, 1]), new Bounds(250, 250, 501, 501));

      assert.strictEqual(layout.zoom, 0.971543553950772);
    });

    it("world with larger tile length", function() {
      const layout = Layout.box({
        bounds: new Bounds(0, 0, 1, 1),
        width: 512,
        height: 512,
        padding: 0,
        tileLength: 512
      });

      assert.deepStrictEqual(layout.canvasBounds, new Bounds(0, 0, 512, 512));
      assert.deepStrictEqual(layout.backgroundBounds, new Bounds(0, 0, 512, 512));

      assert.deepStrictEqual(layout.tileIds, [[0, 0, 0]]);

      assert.deepStrictEqual(layout.tileBounds([0, 0, 0]), new Bounds(0, 0, 512, 512));

      assert.strictEqual(layout.zoom, 0);
    });

    it("world with padding", function() {
      const layout = Layout.box({
        bounds: new Bounds(0, 0, 1, 1),
        width: 512,
        height: 512,
        padding: 64,
        tileLength: 512
      });

      assert.deepStrictEqual(layout.canvasBounds, new Bounds(0, 0, 512, 512));
      assert.deepStrictEqual(layout.backgroundBounds, new Bounds(0, 64, 512, 448));

      assert.deepStrictEqual(layout.tileIds, [[0, -1, 0], [0, 0, 0], [0, 1, 0]]);

      assert.deepStrictEqual(layout.tileBounds([0, -1, 0]), new Bounds(-320, 64, 64, 448));
      assert.deepStrictEqual(layout.tileBounds([0, 0, 0]), new Bounds(64, 64, 448, 448));
      assert.deepStrictEqual(layout.tileBounds([0, 1, 0]), new Bounds(448, 64, 832, 448));

      assert.strictEqual(layout.zoom, -0.4150374992788438);
    });

    it("beyond edge", function() {
      const layout = Layout.box({
        bounds: new Bounds(0.5, 0, 1.5, 1),
        width: 512,
        height: 512,
        padding: 0,
        tileLength: 512
      });

      assert.deepStrictEqual(layout.canvasBounds, new Bounds(0, 0, 512, 512));
      assert.deepStrictEqual(layout.backgroundBounds, new Bounds(0, 0, 512, 512));

      assert.deepStrictEqual(layout.tileIds, [[0, 0, 0], [0, 1, 0]]);

      assert.deepStrictEqual(layout.tileBounds([0, 0, 0]), new Bounds(-256, 0, 256, 512));
      assert.deepStrictEqual(layout.tileBounds([0, 1, 0]), new Bounds(256, 0, 768, 512));

      assert.strictEqual(layout.zoom, 0);
    });

    it("zero width", function() {
      const layout = Layout.box({
        bounds: new Bounds(0.5, 0.0, 0.5, 1.0),
        width: 512,
        height: 512,
        tileLength: 512
      });

      assert.deepStrictEqual(layout.tileIds, [[0, 0, 0]]);

      assert.deepStrictEqual(layout.tileBounds([0, 0, 0]), new Bounds(0, 0, 512, 512));
    });

    it("zero height", function() {
      const layout = Layout.box({
        bounds: new Bounds(0.0, 0.5, 1.0, 0.5),
        width: 512,
        height: 512,
        tileLength: 512
      });

      assert.deepStrictEqual(layout.tileIds, [[0, 0, 0]]);

      assert.deepStrictEqual(layout.tileBounds([0, 0, 0]), new Bounds(0, 0, 512, 512));
    });

    it("padding is too large", function() {
      assert.throws(function() {
        const layout = Layout.box({
          bounds: new Bounds(0.0, 0.0, 1.0, 1.0),
          width: 512,
          height: 512,
          padding: 256
        });
      });
    });

    it("point", function() {
      assert.throws(function() {
        const layout = Layout.box({
          bounds: new Bounds(0.5, 0.5, 0.5, 0.5),
          width: 512,
          height: 512,
          tileLength: 512
        });
      });
    });

    it("null", function() {
      assert.throws(function() {
        const layout = Layout.box({
          bounds: new Bounds(0.5, 0.5, 0.5, 0.5),
          width: 512,
          height: 512,
          tileLength: 512
        });
      });
    });
  });

  describe("overzoomedTileIds", function() {
    it("should return tile ids for a lower zoom level", async function() {
      const fakeSource = {
        async getMetadata() {
          return { maxZoom: this.maxZoom };
        }
      };

      const layout = Layout.box({
        bounds: new Bounds(0, 0, 1, 1),
        width: 1024,
        height: 1024,
        padding: 0,
        tileLength: 512
      });

      fakeSource.maxZoom = 0;
      assert.deepStrictEqual(await layout.overzoomedTileIds(fakeSource), [[0, 0, 0]]);

      fakeSource.maxZoom = 1;
      assert.deepStrictEqual(await layout.overzoomedTileIds(fakeSource), [[1, 0, 0], [1, 1, 0], [1, 0, 1], [1, 1, 1]]);

      fakeSource.maxZoom = 2;
      assert.deepStrictEqual(await layout.overzoomedTileIds(fakeSource), [[1, 0, 0], [1, 1, 0], [1, 0, 1], [1, 1, 1]]);
    });
  });
});
