import { GeomType } from "./constants.js";
import { evaluateOption, LayerData } from "./attributes.js";
import { type LayerOption } from "./attributes.js";
import { type Layer } from "./layer.js";
import { type Layout } from "./layout.js";

export class DebugLayer implements Layer {
  visible: LayerOption<boolean>;

  constructor(options?: {
    visible: LayerOption<boolean>
  }) {
    this.visible = options?.visible ?? true;
  }

  /** @internal */
  async render({ document, layout }: {
    document: Document,
    layout: Layout
  }): Promise<Node | undefined> {
    const layerData = new LayerData(layout);

    if (evaluateOption(layerData, this.visible) == false) {
      return;
    }

    const fragment = document.createDocumentFragment();

    for (const tileId of layout.tileIds) {
      const tileBounds = layout.tileBounds(tileId);

      const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      rect.setAttribute("x", String(tileBounds.x));
      rect.setAttribute("y", String(tileBounds.y));
      rect.setAttribute("width", String(tileBounds.width));
      rect.setAttribute("height", String(tileBounds.height));
      rect.setAttribute("fill", "none");
      rect.setAttribute("stroke", "yellow");

      fragment.appendChild(rect);
    }

    return fragment;
  }
}
