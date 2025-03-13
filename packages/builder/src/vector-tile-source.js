import Protobuf from "pbf";
import { VectorTile } from "@mapbox/vector-tile";

class FeatureWrapper {
  constructor(feature) {
    this.feature = feature;
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
    return this.feature.loadGeometry();
  }
}

class TileWrapper {
  constructor(layer) {
    this.layer = layer;
  }

  get extent() {
    return this.layer.extent;
  }

  get features() {
    let nextIndex = 0;

    return {
      next: function() {
        if (nextIndex < this.layer.length) {
          return { value: new FeatureWrapper(this.layer.feature(nextIndex++)), done: false };
        } else {
          return { done: true };
        }
      }.bind(this),

      [Symbol.iterator]() {
        return this;
      }
    };
  }
}

export class VectorTileSource {
  constructor(archive, layer) {
    this.archive = archive;
    this.layer = layer;
  }

  async getMetadata() {
    const { maxZoom } = await this.archive.getHeader();

    return { maxZoom };
  }

  async getTile(tileId) {
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