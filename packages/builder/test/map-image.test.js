import assert from "node:assert/strict";
import { BackgroundLayer } from "../lib/background-layer.js";
import { MapImage } from "../lib/map-image.js";
import { Icon } from "../lib/icon.js";
import { Layout } from "../lib/layout.js";
import { JSDOM } from "jsdom";

describe("MapImage", function() {
  describe("render", function() {
    it("renders with correct dimensions and viewBox", async function() {
      const layout = Layout.camera({
        center: { x: 0.5, y: 0.5 },
        zoom: 0,
        width: 256,
        height: 256,
        tileLength: 512
      });

      const mapImage = new MapImage({
        layout,
        icons: {},
        layers: []
      });

      const document = new JSDOM().window.document;

      const svg = await mapImage.render(document);
      assert.strictEqual(svg.namespaceURI, "http://www.w3.org/2000/svg");
      assert.strictEqual(svg.localName, "svg");
      assert.strictEqual(svg.getAttribute("width"), "256");
      assert.strictEqual(svg.getAttribute("height"), "256");
      assert.strictEqual(svg.getAttribute("viewBox"), "0 0 256 256");
    });

    it("renders icons as symbols", async function() {
      const layout = Layout.camera({
        center: { x: 0.5, y: 0.5 },
        zoom: 0,
        width: 256,
        height: 256
      });

      const circleIcon = new Icon({
        content: ({ document }) => {
          const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
          circle.setAttribute("cx", "4");
          circle.setAttribute("cy", "4");
          circle.setAttribute("r", "3");

          return circle;
        },
        width: 8,
        height: 8
      });

      const mapImage = new MapImage({
        layout,
        icons: {
          circle: circleIcon
        },
        layers: []
      });

      const document = new JSDOM().window.document;

      const svg = await mapImage.render(document);

      const defs = svg.children.item(0);
      assert.strictEqual(defs.namespaceURI, "http://www.w3.org/2000/svg");
      assert.strictEqual(defs.localName, "defs");

      const symbol1 = defs.children.item(0);
      assert.strictEqual(symbol1.namespaceURI, "http://www.w3.org/2000/svg");
      assert.strictEqual(symbol1.localName, "symbol");
      assert.strictEqual(symbol1.getAttribute("id"), "circle");
      assert.strictEqual(symbol1.getAttribute("width"), "8");
      assert.strictEqual(symbol1.getAttribute("height"), "8");
    });

    it("omits hidden layers", async function() {
      const layout = Layout.camera({
        center: { x: 0.5, y: 0.5 },
        zoom: 0,
        width: 256,
        height: 256
      });

      const background1 = new BackgroundLayer({
        visible: ({ zoom }) => zoom == 0,
        attributes: {
          fill: "blue"
        }
      });

      const background2 = new BackgroundLayer({
        visible: ({ zoom }) => zoom > 0,
        attributes: {
          fill: "green"
        }
      });

      const mapImage = new MapImage({
        layout,
        icons: {},
        layers: [
          background1,
          background2
        ]
      });

      const document = new JSDOM().window.document;

      const svg = await mapImage.render(document);
      assert.strictEqual(svg.children.length, 1);

      const backgroundRect = svg.children.item(0);
      assert.strictEqual(backgroundRect.namespaceURI, "http://www.w3.org/2000/svg");
      assert.strictEqual(backgroundRect.localName, "rect");
      assert.strictEqual(backgroundRect.getAttribute("fill"), "blue");
    });
  });
});
