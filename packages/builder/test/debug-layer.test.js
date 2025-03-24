import assert from "node:assert/strict";
import { DebugLayer } from "../lib/debug-layer.js";
import { Layout } from "../lib/layout.js";
import { JSDOM } from "jsdom";

describe("DebugLayer", function() {
  describe("render", function() {
    it("renders tile rectangles", async function() {
      const layer = new DebugLayer({});

      const layout = Layout.camera({
        center: { x: 0.5, y: 0.5 },
        zoom: 0,
        width: 256,
        height: 256,
        tileLength: 256
      });

      const document = new JSDOM().window.document;

      const result = await layer.render({ document, layout });
      assert.strictEqual(result.children.length, 1);

      const rect = result.children.item(0);
      assert.strictEqual(rect.namespaceURI, "http://www.w3.org/2000/svg");
      assert.strictEqual(rect.localName, "rect");
      assert.strictEqual(rect.getAttribute("x"), "0");
      assert.strictEqual(rect.getAttribute("y"), "0");
      assert.strictEqual(rect.getAttribute("width"), "256");
      assert.strictEqual(rect.getAttribute("height"), "256");
    });

    it("renders nothing if not visible", async function() {
      const layer = new DebugLayer({ visible: false });

      const layout = Layout.camera({
        center: { x: 0.5, y: 0.5 },
        zoom: 0,
        width: 256,
        height: 256,
        tileLength: 256
      });

      const document = new JSDOM().window.document;

      const result = await layer.render({ document, layout });
      assert.strictEqual(result, undefined);
    });
  });
});
