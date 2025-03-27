import { GeomType } from "./constants.js";
import { evaluateAttributes, evaluateOption, LayerData, FeatureData } from "./attributes.js";
import { type LayerOption, type FeatureOption, type FeatureAttributes } from "./attributes.js";
import { clipGeometry } from "./clip.js";
import { Bounds } from "./bounds.js";
import { type Layer } from "./layer.js";
import { type TileSource } from "./tile-source.js";
import { type Layout } from "./layout.js";
import { type Feature } from "./feature.js";
import { type Tile } from "./tile.js";
import { type Point } from "./point.js";

class ClippedFeature implements Feature {
  feature: Feature;
  clipBounds: Bounds;

  constructor(feature: Feature, clipBounds: Bounds) {
    this.feature = feature;
    this.clipBounds = clipBounds;
  }

  get id(): unknown {
    return this.feature.id;
  }

  get type(): GeomType {
    return this.feature.type;
  }

  get properties(): Record<string, unknown> {
    return this.feature.properties;
  }

  get geometry(): Point[][] {
    return clipGeometry(this.feature, this.clipBounds);
  }
}

class ClippedTile implements Tile {
  tile: Tile;
  bounds: Bounds;
  viewbox: Bounds;
  clipBounds: Bounds;

  constructor(tile: Tile, bounds: Bounds, viewbox: Bounds, clipBounds: Bounds, bufferLength: number) {
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

  get extent(): number {
    return this.tile.extent;
  }

  get features(): Iterable<Feature> {
    return {
      [Symbol.iterator]: (function*(this: ClippedTile) {
        for (const feature of this.tile.features) {
          yield new ClippedFeature(feature, this.clipBounds);
        }
      }.bind(this))
    };
  }
}

export function clippedTiles(layout: Layout, source: TileSource, bufferLength: number) {
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

export class PathLayer implements Layer {
  source: TileSource;
  visible: LayerOption<boolean>;
  filter: ((data: FeatureData) => boolean) | undefined;
  attributes: FeatureAttributes | undefined;
  clipBufferLength: number;

  constructor(
    source: TileSource,
    options?: {
      visible?: LayerOption<boolean>,
      filter?: (data: FeatureData) => boolean,
      attributes?: FeatureAttributes,
      clipBufferLength?: number
    }
  ) {
    this.source = source;
    this.visible = options?.visible ?? true;
    this.filter = options?.filter;
    this.attributes = options?.attributes;
    this.clipBufferLength = options?.clipBufferLength ?? 8;
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

    for await (const tile of clippedTiles(layout, this.source, this.clipBufferLength)) {
      const tileSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");

      let hasGeometry = false;

      for (const feature of tile.features) {
        if (feature.type == GeomType.POINT) {
          continue;
        }

        const featureData = new FeatureData(feature, layout);

        if (typeof this.filter !== "undefined" && !this.filter(featureData)) {
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

          for (const { x, y } of ring) {
            d.push([x - lastX, y - lastY].join(","));

            lastX = x;
            lastY = y;
          }

          if (feature.type === GeomType.POLYGON) {
            d.push("z");
          }
        }

        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", d.join(" "));

        for (const [name, value] of evaluateAttributes(featureData, this.attributes)) {
          path.setAttribute(name, value);
        }

        tileSvg.appendChild(path);

        hasGeometry = true;
      }

      if (!hasGeometry) {
        continue;
      }

      tileSvg.setAttribute("x", String(tile.bounds.x));
      tileSvg.setAttribute("y", String(tile.bounds.y));
      tileSvg.setAttribute("width", String(tile.bounds.width));
      tileSvg.setAttribute("height", String(tile.bounds.height));
      tileSvg.setAttribute("viewBox", `${tile.viewbox.minX} ${tile.viewbox.minY} ${tile.viewbox.width} ${tile.viewbox.height}`);

      fragment.appendChild(tileSvg);
    }

    return fragment;
  }
}
