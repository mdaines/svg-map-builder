import { GeomType } from "./constants.js";
import { evaluateAttributes, evaluateEntry, AttributeData } from "./attributes.js";

export class TileLayer {
  constructor({ visible, attributes }) {
    this.visible = visible;
    this.attributes = attributes;
  }

  async render({ document, layout }) {
    const layerAttributeData = new AttributeData(undefined, layout);

    if (typeof this.visible !== "undefined" && !evaluateEntry(layerAttributeData, this.visible)) {
      return;
    }

    const fragment = document.createDocumentFragment();

    const rectAttributes = evaluateAttributes(layerAttributeData, this.attributes);

    for (const tileId of layout.tileIds) {
      const tileBounds = layout.tileBounds(tileId);

      const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      rect.setAttribute("x", tileBounds.x);
      rect.setAttribute("y", tileBounds.y);
      rect.setAttribute("width", tileBounds.width);
      rect.setAttribute("height", tileBounds.height);

      for (const [name, value] of rectAttributes) {
        rect.setAttribute(name, value);
      }

      fragment.appendChild(rect);
    }

    return fragment;
  }
}
