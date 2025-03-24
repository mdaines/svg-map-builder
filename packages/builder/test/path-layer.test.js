import assert from "node:assert/strict";
import { PathLayer } from "../lib/path-layer.js";
import { Layout } from "../lib/layout.js";
import { JSDOM } from "jsdom";
import { getGeoJSONTileSource } from "./helpers.js";

describe("PathLayer", function() {
  describe("render", function() {
    it("renders path elements for a polygon", async function() {
      const source = getGeoJSONTileSource("polygon.geojson");

      const layer = new PathLayer({ source });

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

      const tile = result.children.item(0);
      assert.strictEqual(tile.namespaceURI, "http://www.w3.org/2000/svg");
      assert.strictEqual(tile.localName, "svg");
      assert.strictEqual(tile.getAttribute("viewBox"), "0 0 4096 4096");
      assert.strictEqual(tile.getAttribute("x"), "0");
      assert.strictEqual(tile.getAttribute("y"), "0");
      assert.strictEqual(tile.getAttribute("width"), "256");
      assert.strictEqual(tile.getAttribute("height"), "256");
      assert.strictEqual(tile.children.length, 4);

      const path = tile.children.item(0);
      assert.strictEqual(path.namespaceURI, "http://www.w3.org/2000/svg");
      assert.strictEqual(path.localName, "path");
    });

    it("renders path elements for a line", async function() {
      const source = getGeoJSONTileSource("line.geojson");

      const layer = new PathLayer({ source });

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

      const tile = result.children.item(0);
      assert.strictEqual(tile.namespaceURI, "http://www.w3.org/2000/svg");
      assert.strictEqual(tile.localName, "svg");
      assert.strictEqual(tile.getAttribute("viewBox"), "0 0 4096 4096");
      assert.strictEqual(tile.getAttribute("x"), "0");
      assert.strictEqual(tile.getAttribute("y"), "0");
      assert.strictEqual(tile.getAttribute("width"), "256");
      assert.strictEqual(tile.getAttribute("height"), "256");
      assert.strictEqual(tile.children.length, 2);

      const path = tile.children.item(0);

      assert.strictEqual(path.namespaceURI, "http://www.w3.org/2000/svg");
      assert.strictEqual(path.localName, "path");
    });

    it("renders elements with attributes depending on data", async function() {
      const source = getGeoJSONTileSource("polygon.geojson");

      const layer = new PathLayer({
        source,
        filter: ({ get }) => get("natural") == "water",
        attributes: {
          fill: ({ get }) => get("depth") == 1 ? "lightblue" : "blue",
          stroke: "green",
          strokeWidth: ({ get }) => get("depth", 0.5)
        }
      });

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

      const tile = result.children.item(0);
      assert.strictEqual(tile.children.length, 3);

      {
        const path = tile.children.item(0);
        assert.strictEqual(path.getAttribute("fill"), "lightblue");
        assert.strictEqual(path.getAttribute("stroke"), "green");
        assert.strictEqual(path.getAttribute("stroke-width"), "1");
      }

      {
        const path = tile.children.item(1);
        assert.strictEqual(path.getAttribute("fill"), "blue");
        assert.strictEqual(path.getAttribute("stroke"), "green");
        assert.strictEqual(path.getAttribute("stroke-width"), "2");
      }

      {
        const path = tile.children.item(2);
        assert.strictEqual(path.getAttribute("fill"), "blue");
        assert.strictEqual(path.getAttribute("stroke"), "green");
        assert.strictEqual(path.getAttribute("stroke-width"), "0.5");
      }
    });

    it("renders elements with attributes depending on layout", async function() {
      const source = getGeoJSONTileSource("polygon.geojson");

      const layer = new PathLayer({
        source,
        attributes: {
          fill: ({ zoom }) => zoom == 0 ? "green" : "blue"
        }
      });

      const document = new JSDOM().window.document;

      {
        let layout = Layout.camera({
          center: { x: 0.5, y: 0.5 },
          zoom: 0,
          width: 256,
          height: 256,
          tileLength: 256
        });

        const result = await layer.render({ document, layout });
        const tile = result.children.item(0);

        {
          const path = tile.children.item(0);
          assert.strictEqual(path.getAttribute("fill"), "green");
        }
      }

      {
        let layout = Layout.camera({
          center: { x: 0.5, y: 0.5 },
          zoom: 1,
          width: 256,
          height: 256,
          tileLength: 256
        });

        const result = await layer.render({ document, layout });
        const tile = result.children.item(0);

        {
          const path = tile.children.item(0);
          assert.strictEqual(path.getAttribute("fill"), "blue");
        }
      }
    });

    it("renders overzoomed tiles", async function() {
      const source = getGeoJSONTileSource("polygon.geojson", { maxZoom: 0 });

      const layer = new PathLayer({ source });

      const layout = Layout.camera({
        center: { x: 0.5, y: 0.5 },
        zoom: 1,
        width: 512,
        height: 512,
        tileLength: 256
      });

      const document = new JSDOM().window.document;

      const result = await layer.render({ document, layout });
      assert.strictEqual(result.children.length, 1);

      const tile = result.children.item(0);
      assert.strictEqual(tile.namespaceURI, "http://www.w3.org/2000/svg");
      assert.strictEqual(tile.localName, "svg");
      assert.strictEqual(tile.getAttribute("viewBox"), "0 0 4096 4096");
      assert.strictEqual(tile.getAttribute("x"), "0");
      assert.strictEqual(tile.getAttribute("y"), "0");
      assert.strictEqual(tile.getAttribute("width"), "512");
      assert.strictEqual(tile.getAttribute("height"), "512");
      assert.strictEqual(tile.children.length, 4);

      const path = tile.children.item(0);
      assert.strictEqual(path.namespaceURI, "http://www.w3.org/2000/svg");
      assert.strictEqual(path.localName, "path");
    });

    it("renders clipped tiles", async function() {
      const source = getGeoJSONTileSource("line.geojson");

      const layer = new PathLayer({ source });

      const layout = Layout.camera({
        center: { x: 0.5, y: 0.5 },
        zoom: 0.1,
        width: 256,
        height: 256,
        tileLength: 256
      });

      const document = new JSDOM().window.document;

      const result = await layer.render({ document, layout });
      assert.strictEqual(result.children.length, 1);

      {
        const tile = result.children.item(0);
        assert.strictEqual(tile.namespaceURI, "http://www.w3.org/2000/svg");
        assert.strictEqual(tile.localName, "svg");
        assert.strictEqual(tile.getAttribute("viewBox"), "149 149 3813 3813");
        assert.strictEqual(tile.getAttribute("x"), "0");
        assert.strictEqual(tile.getAttribute("y"), "0");
        assert.strictEqual(tile.getAttribute("width"), "256");
        assert.strictEqual(tile.getAttribute("height"), "256");
      }
    });
  });
});
