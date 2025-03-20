import assert from "node:assert/strict";
import { BackgroundLayer } from "../lib/background-layer.js";
import { Layout } from "../lib/layout.js";
import { JSDOM } from "jsdom";
import serialize from "w3c-xmlserializer";

describe("BackgroundLayer", function() {
  describe("render", function() {
    it("renders a rect element", async function() {
      const layer = new BackgroundLayer({
        attributes: {
          fill: "green"
        }
      });

      const layout = Layout.camera({
        center: { x: 0.5, y: 0.5 },
        zoom: 0,
        width: 256,
        height: 256
      });

      const document = new JSDOM().window.document;

      const result = await layer.render({ document, layout });

      assert.strictEqual(result.namespaceURI, "http://www.w3.org/2000/svg");
      assert.strictEqual(result.localName, "rect");
      assert.strictEqual(result.getAttribute("x"), "0");
      assert.strictEqual(result.getAttribute("y"), "0");
      assert.strictEqual(result.getAttribute("width"), "256");
      assert.strictEqual(result.getAttribute("height"), "256");
      assert.strictEqual(result.getAttribute("fill"), "green");
    });

    it("evaluates styles", async function() {
      const layer = new BackgroundLayer({
        attributes: {
          fill: () => "blue",
          opacity: 0.5
        }
      });

      const layout = Layout.camera({
        center: { x: 0.5, y: 0.5 },
        zoom: 0,
        width: 256,
        height: 256
      });

      const document = new JSDOM().window.document;

      const result = await layer.render({ document, layout });

      assert.strictEqual(result.namespaceURI, "http://www.w3.org/2000/svg");
      assert.strictEqual(result.localName, "rect");
      assert.strictEqual(result.getAttribute("x"), "0");
      assert.strictEqual(result.getAttribute("y"), "0");
      assert.strictEqual(result.getAttribute("width"), "256");
      assert.strictEqual(result.getAttribute("height"), "256");
      assert.strictEqual(result.getAttribute("fill"), "blue");
      assert.strictEqual(result.getAttribute("opacity"), "0.5");
    });

    it("evaluates styles based on layout", async function() {
      const layer = new BackgroundLayer({
        attributes: {
          fill: ({ zoom }) => zoom == 0 ? "green" : "blue"
        }
      });

      const document = new JSDOM().window.document;

      {
        const layout = Layout.camera({
          center: { x: 0.5, y: 0.5 },
          zoom: 0,
          width: 256,
          height: 256
        });

        const result = await layer.render({ document, layout });

        assert.strictEqual(result.getAttribute("fill"), "green");
      }

      {
        const layout = Layout.camera({
          center: { x: 0.5, y: 0.5 },
          zoom: 1,
          width: 256,
          height: 256
        });

        const result = await layer.render({ document, layout });

        assert.strictEqual(result.getAttribute("fill"), "blue");
      }
    });

    it("covers the background bounds", async function() {
      const layer = new BackgroundLayer({
        attributes: {
          fill: "green"
        }
      });

      const layout = Layout.camera({
        center: { x: 0.5, y: 0.5 },
        zoom: 0,
        width: 512,
        height: 512,
        tileLength: 256
      });

      const document = new JSDOM().window.document;

      const result = await layer.render({ document, layout });

      assert.strictEqual(result.getAttribute("x"), "0");
      assert.strictEqual(result.getAttribute("y"), "128");
      assert.strictEqual(result.getAttribute("width"), "512");
      assert.strictEqual(result.getAttribute("height"), "256");
    });

    it("returns undefined if not visible", async function() {
      const layer = new BackgroundLayer({
        visible: ({ zoom }) => zoom > 0,
        attributes: {}
      });

      const document = new JSDOM().window.document;

      {
        const layout = Layout.camera({
          center: { x: 0.5, y: 0.5 },
          zoom: 0,
          width: 256,
          height: 256
        });

        const result = await layer.render({ document, layout });

        assert.strictEqual(result, undefined);
      }

      {
        const layout = Layout.camera({
          center: { x: 0.5, y: 0.5 },
          zoom: 1,
          width: 256,
          height: 256
        });

        const result = await layer.render({ document, layout });

        assert.notStrictEqual(result, undefined);
      }
    });

    it("renders depending on the literal value of visible", async function() {
      const layer = new BackgroundLayer({
        attributes: {}
      });

      const document = new JSDOM().window.document;

      const layout = Layout.camera({
        center: { x: 0.5, y: 0.5 },
        zoom: 0,
        width: 256,
        height: 256
      });

      {
        layer.visible = undefined;
        const result = await layer.render({ document, layout });

        assert.notStrictEqual(result, undefined);
      }

      {
        layer.visible = true;
        const result = await layer.render({ document, layout });

        assert.notStrictEqual(result, undefined);
      }

      {
        layer.visible = false;
        const result = await layer.render({ document, layout });

        assert.strictEqual(result, undefined);
      }
    });
  });
});
