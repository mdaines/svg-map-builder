import assert from "node:assert/strict";
import { Icon } from "../src/icon.js";
import { MarkerLayer } from "../src/marker-layer.js";
import { Layout } from "../src/layout.js";
import { JSDOM } from "jsdom";
import { getGeoJSONSource } from "./helpers.js";

describe("MarkerLayer", function() {
  it("render", async function() {
    const source = getGeoJSONSource("point.geojson");

    const circleIcon = new Icon({
      content: () => undefined,
      width: 8,
      height: 8
    });

    const mountainIcon = new Icon({
      content: () => undefined,
      width: 8,
      height: 8
    });

    const layer = new MarkerLayer({
      source,
      sortKey: ({ get }) => get("priority"),
      attributes: {
        dataOverlap: ""
      },
      icon: {
        id: ({ get }) => get("icon", "circle"),
        attributes: {
          fill: ({ has }) => has("number") ? "white" : "blue",
          stroke: "blue"
        }
      },
      text: {
        content: ({ get }) => get("name"),
        attributes: {
          fill: "blue"
        }
      }
    });

    const document = new JSDOM().window.document;

    const layout = Layout.camera({
      center: { x: 0.5, y: 0.5 },
      zoom: 0,
      width: 256,
      height: 256,
      tileLength: 256
    });

    const result = await layer.render({
      document,
      layout,
      icons: {
        "circle": circleIcon,
        "mountain": mountainIcon
      }
    });

    assert.strictEqual(result.children.length, 4);

    {
      const group = result.children.item(0);
      assert.strictEqual(group.namespaceURI, "http://www.w3.org/2000/svg");
      assert.strictEqual(group.localName, "g");
      assert.strictEqual(group.getAttribute("data-overlap"), "");

      const use = group.children.item(0);
      assert.strictEqual(use.namespaceURI, "http://www.w3.org/2000/svg");
      assert.strictEqual(use.localName, "use");
      assert.strictEqual(use.getAttribute("href"), "#circle");
      assert.strictEqual(use.getAttribute("fill"), "blue");
      assert.strictEqual(use.getAttribute("stroke"), "blue");

      const text = group.children.item(1);
      assert.strictEqual(text.namespaceURI, "http://www.w3.org/2000/svg");
      assert.strictEqual(text.localName, "text");
      assert.strictEqual(text.textContent, "Nihonbashi");
      assert.strictEqual(text.getAttribute("fill"), "blue");
    }

    {
      const group = result.children.item(1);
      assert.strictEqual(group.namespaceURI, "http://www.w3.org/2000/svg");
      assert.strictEqual(group.localName, "g");
      assert.strictEqual(group.getAttribute("data-overlap"), "");

      const use = group.children.item(0);
      assert.strictEqual(use.namespaceURI, "http://www.w3.org/2000/svg");
      assert.strictEqual(use.localName, "use");
      assert.strictEqual(use.getAttribute("href"), "#circle");
      assert.strictEqual(use.getAttribute("fill"), "white");
      assert.strictEqual(use.getAttribute("stroke"), "blue");

      const text = group.children.item(1);
      assert.strictEqual(text.namespaceURI, "http://www.w3.org/2000/svg");
      assert.strictEqual(text.localName, "text");
      assert.strictEqual(text.textContent, "Shizuoka");
      assert.strictEqual(text.getAttribute("fill"), "blue");
    }

    {
      const group = result.children.item(2);
      assert.strictEqual(group.namespaceURI, "http://www.w3.org/2000/svg");
      assert.strictEqual(group.localName, "g");
      assert.strictEqual(group.getAttribute("data-overlap"), "");

      const use = group.children.item(0);
      assert.strictEqual(use.namespaceURI, "http://www.w3.org/2000/svg");
      assert.strictEqual(use.localName, "use");
      assert.strictEqual(use.getAttribute("href"), "#circle");
      assert.strictEqual(use.getAttribute("fill"), "blue");
      assert.strictEqual(use.getAttribute("stroke"), "blue");

      const text = group.children.item(1);
      assert.strictEqual(text.namespaceURI, "http://www.w3.org/2000/svg");
      assert.strictEqual(text.localName, "text");
      assert.strictEqual(text.textContent, "Sanjō Ōhashi");
      assert.strictEqual(text.getAttribute("fill"), "blue");
    }

    {
      const group = result.children.item(3);
      assert.strictEqual(group.namespaceURI, "http://www.w3.org/2000/svg");
      assert.strictEqual(group.localName, "g");
      assert.strictEqual(group.getAttribute("data-overlap"), "");

      const use = group.children.item(0);
      assert.strictEqual(use.namespaceURI, "http://www.w3.org/2000/svg");
      assert.strictEqual(use.localName, "use");
      assert.strictEqual(use.getAttribute("href"), "#mountain");
      assert.strictEqual(use.getAttribute("fill"), "blue");
      assert.strictEqual(use.getAttribute("stroke"), "blue");

      const text = group.children.item(1);
      assert.strictEqual(text.namespaceURI, "http://www.w3.org/2000/svg");
      assert.strictEqual(text.localName, "text");
      assert.strictEqual(text.textContent, "Mt. Fuji");
      assert.strictEqual(text.getAttribute("fill"), "blue");
    }
  });

  it("render with missing properties", async function() {
    const source = getGeoJSONSource("point-properties.geojson");

    const circleIcon = new Icon({
      content: () => undefined,
      width: 8,
      height: 8
    });

    const layer = new MarkerLayer({
      source,
      icon: {
        id: ({ get }) => get("icon", "circle")
      },
      text: {
        content: ({ get }) => get("name")
      }
    });

    const document = new JSDOM().window.document;

    const layout = Layout.camera({
      center: { x: 0.5, y: 0.5 },
      zoom: 0,
      width: 256,
      height: 256,
      tileLength: 256
    });

    const result = await layer.render({
      document,
      layout,
      icons: {
        "circle": circleIcon
      }
    });

    assert.strictEqual(result.children.length, 5);

    {
      const group = result.children.item(0);
      assert.strictEqual(group.namespaceURI, "http://www.w3.org/2000/svg");
      assert.strictEqual(group.localName, "g");

      assert.strictEqual(group.children.length, 1);

      const use = group.children.item(0);
      assert.strictEqual(use.namespaceURI, "http://www.w3.org/2000/svg");
      assert.strictEqual(use.localName, "use");
      assert.strictEqual(use.getAttribute("href"), "#circle");
    }

    {
      const group = result.children.item(1);
      assert.strictEqual(group.namespaceURI, "http://www.w3.org/2000/svg");
      assert.strictEqual(group.localName, "g");

      assert.strictEqual(group.children.length, 1);

      const use = group.children.item(0);
      assert.strictEqual(use.namespaceURI, "http://www.w3.org/2000/svg");
      assert.strictEqual(use.localName, "use");
      assert.strictEqual(use.getAttribute("href"), "#circle");
    }

    {
      const group = result.children.item(2);
      assert.strictEqual(group.namespaceURI, "http://www.w3.org/2000/svg");
      assert.strictEqual(group.localName, "g");

      assert.strictEqual(group.children.length, 2);

      const use = group.children.item(0);
      assert.strictEqual(use.namespaceURI, "http://www.w3.org/2000/svg");
      assert.strictEqual(use.localName, "use");
      assert.strictEqual(use.getAttribute("href"), "#circle");

      const text = group.children.item(1);
      assert.strictEqual(text.namespaceURI, "http://www.w3.org/2000/svg");
      assert.strictEqual(text.localName, "text");
      assert.strictEqual(text.textContent, "Something");
    }

    {
      const group = result.children.item(3);
      assert.strictEqual(group.namespaceURI, "http://www.w3.org/2000/svg");
      assert.strictEqual(group.localName, "g");

      assert.strictEqual(group.children.length, 2);

      const use = group.children.item(0);
      assert.strictEqual(use.namespaceURI, "http://www.w3.org/2000/svg");
      assert.strictEqual(use.localName, "use");
      assert.strictEqual(use.getAttribute("href"), "#circle");

      const text = group.children.item(1);
      assert.strictEqual(text.namespaceURI, "http://www.w3.org/2000/svg");
      assert.strictEqual(text.localName, "text");
      assert.strictEqual(text.textContent, "false");
    }

    {
      const group = result.children.item(4);
      assert.strictEqual(group.namespaceURI, "http://www.w3.org/2000/svg");
      assert.strictEqual(group.localName, "g");

      assert.strictEqual(group.children.length, 2);

      const use = group.children.item(0);
      assert.strictEqual(use.namespaceURI, "http://www.w3.org/2000/svg");
      assert.strictEqual(use.localName, "use");
      assert.strictEqual(use.getAttribute("href"), "#circle");

      const text = group.children.item(1);
      assert.strictEqual(text.namespaceURI, "http://www.w3.org/2000/svg");
      assert.strictEqual(text.localName, "text");
      assert.strictEqual(text.textContent, "null");
    }
  });

  it("render with missing icon", async function() {
    const source = getGeoJSONSource("point.geojson");

    const layer = new MarkerLayer({
      source,
      icon: {
        id: "something"
      },
      text: {
        content: ({ get }) => get("name")
      }
    });

    const document = new JSDOM().window.document;

    const layout = Layout.camera({
      center: { x: 0.5, y: 0.5 },
      zoom: 0,
      width: 256,
      height: 256,
      tileLength: 256
    });

    const result = await layer.render({
      document,
      layout,
      icons: {}
    });

    assert.strictEqual(result.children.length, 4);

    {
      const group = result.children.item(0);
      assert.strictEqual(group.namespaceURI, "http://www.w3.org/2000/svg");
      assert.strictEqual(group.localName, "g");

      assert.strictEqual(group.children.length, 1);

      const text = group.children.item(0);
      assert.strictEqual(text.namespaceURI, "http://www.w3.org/2000/svg");
      assert.strictEqual(text.localName, "text");
      assert.strictEqual(text.textContent, "Nihonbashi");
    }
  });

  it("render without text", async function() {
    const source = getGeoJSONSource("point.geojson");

    const circleIcon = new Icon({
      content: () => undefined,
      width: 8,
      height: 8
    });

    const layer = new MarkerLayer({
      source,
      icon: {
        id: "circle"
      }
    });

    const document = new JSDOM().window.document;

    const layout = Layout.camera({
      center: { x: 0.5, y: 0.5 },
      zoom: 0,
      width: 256,
      height: 256,
      tileLength: 256
    });

    const result = await layer.render({
      document,
      layout,
      icons: {
        circle: circleIcon
      }
    });

    assert.strictEqual(result.children.length, 4);

    {
      const group = result.children.item(0);
      assert.strictEqual(group.namespaceURI, "http://www.w3.org/2000/svg");
      assert.strictEqual(group.localName, "g");

      assert.strictEqual(group.children.length, 1);

      const use = group.children.item(0);
      assert.strictEqual(use.namespaceURI, "http://www.w3.org/2000/svg");
      assert.strictEqual(use.localName, "use");
      assert.strictEqual(use.getAttribute("href"), "#circle");
    }
  });

  it("render without icon", async function() {
    const source = getGeoJSONSource("point.geojson");

    const layer = new MarkerLayer({
      source,
      text: {
        content: ({ get }) => get("name")
      }
    });

    const document = new JSDOM().window.document;

    const layout = Layout.camera({
      center: { x: 0.5, y: 0.5 },
      zoom: 0,
      width: 256,
      height: 256,
      tileLength: 256
    });

    const result = await layer.render({
      document,
      layout,
      icons: {}
    });

    assert.strictEqual(result.children.length, 4);

    {
      const group = result.children.item(0);
      assert.strictEqual(group.namespaceURI, "http://www.w3.org/2000/svg");
      assert.strictEqual(group.localName, "g");

      assert.strictEqual(group.children.length, 1);

      const text = group.children.item(0);
      assert.strictEqual(text.namespaceURI, "http://www.w3.org/2000/svg");
      assert.strictEqual(text.localName, "text");
      assert.strictEqual(text.textContent, "Nihonbashi");
    }
  });

  it("render attributes based on layout", async function() {
    const source = getGeoJSONSource("point.geojson");

    const circleIcon = new Icon({
      content: () => undefined,
      width: 8,
      height: 8
    });

    const layer = new MarkerLayer({
      source,
      icon: {
        id: "circle",
        attributes: {
          fill: ({ zoom }) => zoom == 0 ? "green" : "blue"
        }
      }
    });

    const document = new JSDOM().window.document;

    {
      const layout = Layout.camera({
        center: { x: 0.5, y: 0.5 },
        zoom: 0,
        width: 256,
        height: 256,
        tileLength: 256
      });

      const result = await layer.render({
        document,
        layout,
        icons: {
          circle: circleIcon
        }
      });

      const group = result.children.item(0);
      const use = group.children.item(0);
      assert.strictEqual(use.getAttribute("fill"), "green");
    }

    {
      const layout = Layout.camera({
        center: { x: 0.5, y: 0.5 },
        zoom: 1,
        width: 512,
        height: 512,
        tileLength: 256
      });

      const result = await layer.render({
        document,
        layout,
        icons: {
          circle: circleIcon
        }
      });

      const group = result.children.item(0);
      const use = group.children.item(0);
      assert.strictEqual(use.getAttribute("fill"), "blue");
    }
  });

  it("renders only one marker for each position", async function() {
    const source = getGeoJSONSource("zero-point.geojson");

    const layer = new MarkerLayer({
      source,
      text: {
        content: "blah"
      }
    });

    const document = new JSDOM().window.document;

    const layout = Layout.camera({
      center: { x: 0.5, y: 0.5 },
      zoom: 1,
      width: 256,
      height: 256,
      tileLength: 256
    });

    const result = await layer.render({
      document,
      layout,
      icons: {}
    });

    assert.strictEqual(result.children.length, 1);
  });
});
