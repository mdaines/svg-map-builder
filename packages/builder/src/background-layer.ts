import { evaluateAttributes, evaluateEntry, AttributeData, type Attributes, type AttributeEntry } from "./attributes.js";
import { type Layer } from "./layer.js";
import { type Layout } from "./layout.js";

export class BackgroundLayer implements Layer {
  visible: AttributeEntry<boolean>;
  attributes: Attributes;

  /**
   * @param options
   */
  constructor({ visible, attributes }: {
    visible: AttributeEntry<boolean>,
    attributes: Attributes
  }) {
    this.visible = visible;
    this.attributes = attributes;
  }

  /** @internal */
  async render({ document, layout }: {
    document: Document,
    layout: Layout
  }) {
    const layerAttributeData = new AttributeData(undefined, layout);

    if (typeof this.visible !== "undefined" && !evaluateEntry(layerAttributeData, this.visible)) {
      return;
    }

    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("x", String(layout.backgroundBounds.x));
    rect.setAttribute("y", String(layout.backgroundBounds.y));
    rect.setAttribute("width", String(layout.backgroundBounds.width));
    rect.setAttribute("height", String(layout.backgroundBounds.height));

    for (const [name, value] of evaluateAttributes(layerAttributeData, this.attributes)) {
      rect.setAttribute(name, value);
    }

    return rect;
  }
}
