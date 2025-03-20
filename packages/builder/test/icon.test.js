import assert from "node:assert/strict";
import { Icon } from "../lib/icon.js";
import { JSDOM } from "jsdom";

describe("Icon", function() {
  it("render", function() {
    const icon = new Icon({
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

    const document = new JSDOM().window.document;

    const result = icon.render({ document });

    assert.strictEqual(result.namespaceURI, "http://www.w3.org/2000/svg");
    assert.strictEqual(result.localName, "circle");
    assert.strictEqual(result.getAttribute("cx"), "4");
    assert.strictEqual(result.getAttribute("cy"), "4");
    assert.strictEqual(result.getAttribute("r"), "3");
  });
});
