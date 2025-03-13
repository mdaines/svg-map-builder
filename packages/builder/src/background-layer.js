import { evaluateAttributes, evaluateEntry, AttributeData } from "./attributes.js";

export class BackgroundLayer {
  constructor({ visible, attributes }) {
    this.visible = visible;
    this.attributes = attributes;
  }

  async render({ document, layout }) {
    const layerAttributeData = new AttributeData(undefined, layout);

    if (typeof this.visible !== "undefined" && !evaluateEntry(layerAttributeData, this.visible)) {
      return;
    }

    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("x", layout.backgroundBounds.x);
    rect.setAttribute("y", layout.backgroundBounds.y);
    rect.setAttribute("width", layout.backgroundBounds.width);
    rect.setAttribute("height", layout.backgroundBounds.height);

    for (const [name, value] of evaluateAttributes(layerAttributeData, this.attributes)) {
      rect.setAttribute(name, value);
    }

    return rect;
  }
}
