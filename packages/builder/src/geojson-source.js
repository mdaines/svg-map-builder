import * as turf from "@turf/bbox";
import geojsonvt from "geojson-vt";
import { GeomType } from "./constants.js";
import { convertBounds } from "./convert.js";

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
    if (this.feature.tags === null) {
      return {};
    } else {
      return this.feature.tags;
    }
  }

  get geometry() {
    if (this.feature.type == GeomType.POINT) {
      return [this.feature.geometry.map(([x, y]) => ({ x, y }))];
    } else if (this.feature.type == GeomType.LINESTRING || this.feature.type == GeomType.POLYGON) {
      return this.feature.geometry.map(cs => cs.map(([x, y]) => ({ x, y })));
    } else {
      return [];
    }
  }
}

class TileWrapper {
  constructor(tile, extent) {
    this.tile = tile;
    this.extent = extent;
  }

  get features() {
    let nextIndex = 0;

    return {
      next: function() {
        if (nextIndex < this.tile.features.length) {
          return { value: new FeatureWrapper(this.tile.features[nextIndex++]), done: false };
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

export class GeoJSONSource {
  constructor(data, options) {
    this.tileIndex = geojsonvt(data, options);
    this.bounds = convertBounds(...turf.bbox(data));
  }

  async getMetadata() {
    return {
      maxZoom: this.tileIndex.options.maxZoom
    };
  }

  async getTile(tileId) {
    const tile = this.tileIndex.getTile(...tileId);

    if (tile == null) {
      return undefined;
    }

    return new TileWrapper(tile, this.tileIndex.options.extent);
  }
}
