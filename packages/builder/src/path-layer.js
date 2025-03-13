import { GeomType } from "./constants.js";
import { evaluateAttributes, evaluateEntry, AttributeData } from "./attributes.js";
import { clipGeometry } from "./clip.js";
import { Bounds } from "./bounds.js";

class ClippedFeature {
  constructor(feature, clipBounds) {
    this.feature = feature;
    this.clipBounds = clipBounds;
  }

  get id() {
    return this.feature.id;
  }

  get type() {
    return this.feature.type;
  }

  get properties() {
    return this.feature.properties;
  }

  get geometry() {
    return clipGeometry(this.feature, this.clipBounds);
  }
}

class ClippedTile {
  constructor(tile, bounds, viewbox, clipBounds, bufferLength) {
    this.tile = tile;

    // convert clip bounds to tile coordinates
    const tileClipBounds = new Bounds(
      Math.round((clipBounds.minX - bounds.minX) / bounds.width * tile.extent),
      Math.round((clipBounds.minY - bounds.minY) / bounds.height * tile.extent),
      Math.round((clipBounds.maxX - bounds.minX) / bounds.width * tile.extent),
      Math.round((clipBounds.maxY - bounds.minY) / bounds.height * tile.extent)
    );

    // convert buffer length to tile coordinates
    const tileBufferLength = Math.round(bufferLength / bounds.width * tile.extent);

    // clipped tile bounds in canvas coordinates
    this.bounds = bounds.intersection(clipBounds);

    // clipped tile viewbox in tile coordinates
    this.viewbox = viewbox.intersection(tileClipBounds);

    // clip bounds with buffer in tile coordinates
    this.clipBounds = tileClipBounds.insetBy(-tileBufferLength, -tileBufferLength);
  }

  get features() {
    return {
      tile: this.tile,
      clipBounds: this.clipBounds,
      *[Symbol.iterator]() {
        for (const feature of this.tile.features) {
          yield new ClippedFeature(feature, this.clipBounds);
        }
      }
    };
  }
}

function clippedTiles(layout, source, bufferLength) {
  return {
    async *[Symbol.asyncIterator]() {
      const clipBounds = layout.backgroundBounds;

      for (const tileId of await layout.overzoomedTileIds(source)) {
        const tile = await source.getTile(tileId);

        if (typeof tile === "undefined") {
          continue;
        }

        // unclipped tile bounds in canvas coordinates
        const bounds = layout.tileBounds(tileId);

        // unclipped tile viewbox in tile coordinates
        const viewbox = new Bounds(0, 0, tile.extent, tile.extent);

        yield new ClippedTile(tile, bounds, viewbox, layout.backgroundBounds, bufferLength);
      }
    }
  }
}

export class PathLayer {
  constructor({ visible, source, filter, attributes, clipBufferLength = 8 }) {
    this.visible = visible;
    this.source = source;
    this.filter = filter;
    this.attributes = attributes;
    this.clipBufferLength = clipBufferLength;
  }

  async render({ document, layout }) {
    const layerAttributeData = new AttributeData(undefined, layout);

    if (typeof this.visible !== "undefined" && !evaluateEntry(layerAttributeData, this.visible)) {
      return;
    }

    const fragment = document.createDocumentFragment();

    for await (const tile of clippedTiles(layout, this.source, this.clipBufferLength)) {
      const tileSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");

      let hasGeometry = false;

      for (const feature of tile.features) {
        if (feature.type == GeomType.POINT) {
          continue;
        }

        const attributeData = new AttributeData(feature, layout);

        if (typeof this.filter !== "undefined" && !this.filter(attributeData)) {
          continue;
        }

        const geometry = feature.geometry;

        if (geometry.length == 0) {
          continue;
        }

        let lastX = 0, lastY = 0;

        const d = [];

        for (const ring of feature.geometry) {
          d.push("m");

          ring.forEach(({ x, y }) => {
            d.push([x - lastX, y - lastY].join(","));

            lastX = x;
            lastY = y;
          });

          if (feature.type === GeomType.POLYGON) {
            d.push("z");
          }
        }

        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", d.join(" "));

        for (const [name, value] of evaluateAttributes(attributeData, this.attributes)) {
          path.setAttribute(name, value);
        }

        tileSvg.appendChild(path);

        hasGeometry = true;
      }

      if (!hasGeometry) {
        continue;
      }

      tileSvg.setAttribute("x", tile.bounds.x);
      tileSvg.setAttribute("y", tile.bounds.y);
      tileSvg.setAttribute("width", tile.bounds.width);
      tileSvg.setAttribute("height", tile.bounds.height);
      tileSvg.setAttribute("viewBox", `${tile.viewbox.minX} ${tile.viewbox.minY} ${tile.viewbox.width} ${tile.viewbox.height}`);

      fragment.appendChild(tileSvg);
    }

    return fragment;
  }
}
