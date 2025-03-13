export class MapImage {
  constructor({ layout, icons = {}, layers }) {
    this.layout = layout;
    this.icons = icons;
    this.layers = layers;
  }

  async render(document) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");

    svg.setAttribute("width", this.layout.canvasBounds.width);
    svg.setAttribute("height", this.layout.canvasBounds.height);
    svg.setAttribute("viewBox", `${this.layout.canvasBounds.minX} ${this.layout.canvasBounds.minY} ${this.layout.canvasBounds.width} ${this.layout.canvasBounds.height}`);

    let hasDefs = false;

    const defsElement = document.createElementNS("http://www.w3.org/2000/svg", "defs");

    for (const [id, icon] of Object.entries(this.icons)) {
      const symbolElement = document.createElementNS("http://www.w3.org/2000/svg", "symbol");
      symbolElement.setAttribute("id", id);
      symbolElement.setAttribute("width", icon.width);
      symbolElement.setAttribute("height", icon.height);

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
