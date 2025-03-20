import { type Layout } from "./layout.js";
import { type Icon } from "./icon.js";
import { type Layer } from "./layer.js";

export class MapImage {
  layout: Layout;
  icons: Record<string, Icon>;
  layers: Layer[];

  /**
   * @param options
   */
  constructor({ layout, icons = {}, layers }: {
    layout: Layout,
    icons: Record<string, Icon>,
    layers: Layer[]
  }) {
    this.layout = layout;
    this.icons = icons;
    this.layers = layers;
  }

  async render(document: Document): Promise<SVGSVGElement> {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");

    svg.setAttribute("width", String(this.layout.canvasBounds.width));
    svg.setAttribute("height", String(this.layout.canvasBounds.height));
    svg.setAttribute("viewBox", `${this.layout.canvasBounds.minX} ${this.layout.canvasBounds.minY} ${this.layout.canvasBounds.width} ${this.layout.canvasBounds.height}`);

    let hasDefs = false;

    const defsElement = document.createElementNS("http://www.w3.org/2000/svg", "defs");

    for (const [id, icon] of Object.entries(this.icons)) {
      const symbolElement = document.createElementNS("http://www.w3.org/2000/svg", "symbol");
      symbolElement.setAttribute("id", id);
      symbolElement.setAttribute("width", String(icon.width));
      symbolElement.setAttribute("height", String(icon.height));

      symbolElement.appendChild(this.icons[id].render({ document }));

      defsElement.appendChild(symbolElement);

      hasDefs = true;
    }

    if (hasDefs) {
      svg.appendChild(defsElement);
    }

    for (const layer of this.layers) {
      const content = await layer.render({
        document,
        layout: this.layout,
        icons: this.icons
      })

      if (typeof content !== "undefined") {
        svg.appendChild(content);
      }
    }

    return svg;
  }
}
