import Protobuf from "pbf";
import { VectorTile, type VectorTileLayer, type VectorTileFeature } from "@mapbox/vector-tile";
import { type PMTiles } from "pmtiles";
import { type Feature } from "./feature.js";
import { type TileSource } from "./tile-source.js";
import { type TileIdentifier } from "./tile-identifier.js";
import { type Tile } from "./tile.js";
import { type Point } from "./point.js";
import { type GeomType } from "./constants.js";

/** @internal */
class FeatureWrapper implements Feature {
  feature: VectorTileFeature;

  constructor(feature: VectorTileFeature) {
    this.feature = feature;
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
    return this.feature.loadGeometry();
  }
}

/** @internal */
class TileWrapper implements Tile {
  layer: VectorTileLayer;

  constructor(layer: VectorTileLayer) {
    this.layer = layer;
  }

  get extent(): number {
    return this.layer.extent;
  }

  get features(): Iterable<Feature> {
    return {
      [Symbol.iterator]: (function*(this: TileWrapper) {
        for (let i = 0; i < this.layer.length; i++) {
          yield new FeatureWrapper(this.layer.feature(i));
        }
      }).bind(this)
    }
  }
}

export class VectorTileSource implements TileSource {
  archive: PMTiles;
  layer: string;

  constructor(archive: PMTiles, layer: string) {
    this.archive = archive;
    this.layer = layer;
  }

  /** @internal */
  async getMetadata(): Promise<{ maxZoom: number }> {
    const { maxZoom } = await this.archive.getHeader();

    return { maxZoom };
  }

  /** @internal */
  async getTile(tileId: TileIdentifier): Promise<Tile | undefined> {
    let [z, x, y] = tileId;

    // wrap x to 0..<z^2
    x = x & ((1 << z) - 1);

    const response = await this.archive.getZxy(z, x, y);

    if (typeof response === "undefined") {
      return undefined;
    }

    const tile = new VectorTile(new Protobuf(response.data));
    const layer = tile.layers[this.layer];

    if (typeof layer !== "undefined") {
      return new TileWrapper(layer);
    } else {
      return undefined;
    }
  }
}