import { evaluateOption, evaluateAttributes, LayerData, type LayerAttributes, type LayerOption } from "./attributes.js";
import { type Layer } from "./layer.js";
import { type Layout } from "./layout.js";

export class BackgroundLayer implements Layer {
  visible: LayerOption<boolean>;
  attributes: LayerAttributes | undefined;

  constructor(options?: {
    visible?: LayerOption<boolean>,
    attributes?: LayerAttributes
  }) {
    this.visible = options?.visible ?? true;
    this.attributes = options?.attributes;
  }

  /** @internal */
  async render({ document, layout }: {
    document: Document,
    layout: Layout
  }) {
    const layerData = new LayerData(layout);

    if (evaluateOption(layerData, this.visible) == false) {
      return;
    }

    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("x", String(layout.backgroundBounds.x));
    rect.setAttribute("y", String(layout.backgroundBounds.y));
    rect.setAttribute("width", String(layout.backgroundBounds.width));
    rect.setAttribute("height", String(layout.backgroundBounds.height));

    for (const [name, value] of evaluateAttributes(layerData, this.attributes)) {
      rect.setAttribute(name, value);
    }

    return rect;
  }
}
