import * as turf from "@turf/bbox";
import geojsonvt from "geojson-vt";
import { GeomType } from "./constants.js";
import { convertBounds } from "./convert.js";
import { type Bounds } from "./bounds.js";
import { type Feature } from "./feature.js";
import { type TileSource } from "./tile-source.js";
import { type TileIdentifier } from "./tile-identifier.js";
import { type Tile } from "./tile.js";
import { type Point } from "./point.js";

type Coordinate = [number, number];

function mapCoordinates(geometry: Coordinate[]): Point[] {
  return geometry.map(([x, y]) => ({ x, y }));
}

function mapRings(geometry: Coordinate[][]): Point[][] {
  return geometry.map(ring => mapCoordinates(ring));
}

class FeatureWrapper implements Feature {
  feature: geojsonvt.Feature;

  constructor(feature: any) {
    this.feature = feature;
  }

  get id() {
    return this.feature.id;
  }

  get type(): GeomType {
    return this.feature.type as unknown as GeomType;
  }

  get properties(): Record<string, any> {
    // tags is declared in @types/geojson-vt as optional (ie, it may be undefined), but the GeoJSON spec says that the properties property must either be an object or null, and geojson-vt appears to just pass it through.

    if (this.feature.tags == null) {
      return {};
    } else {
      return this.feature.tags;
    }
  }

  get geometry(): Point[][] {
    // geometry is declared in @types/geojson-vt as Geometry[], but it's Geometry[][] for line strings and polygons.

    if (this.type === GeomType.POINT) {
      return [mapCoordinates(this.feature.geometry as unknown as Coordinate[])];
    } else if (this.type === GeomType.LINESTRING || this.type === GeomType.POLYGON) {
      return mapRings(this.feature.geometry as unknown as Coordinate[][]);
    } else {
      return [];
    }
  }
}

class TileWrapper implements Tile {
  tile: any;
  extent: number;

  constructor(tile: any, extent: number) {
    this.tile = tile;
    this.extent = extent;
  }

  get features(): Iterable<Feature> {
    return {
      [Symbol.iterator]: (function*(this: TileWrapper) {
        for (const feature of this.tile.features) {
          yield new FeatureWrapper(feature);
        }
      }).bind(this)
    }
  }
}

export class GeoJSONTileSource implements TileSource {
  /** @internal */
  tileIndex: any;

  bounds: Bounds;

  constructor(data: any, options: any) {
    this.tileIndex = geojsonvt(data, options);
    this.bounds = convertBounds(...(turf.bbox(data) as [number, number, number, number]));
  }

  /** @internal */
  async getMetadata(): Promise<{ maxZoom: number }> {
    return {
      maxZoom: this.tileIndex.options.maxZoom
    };
  }

  /** @internal */
  async getTile(tileId: TileIdentifier): Promise<Tile | undefined> {
    const tile = this.tileIndex.getTile(...tileId);

    if (tile == null) {
      return undefined;
    }

    return new TileWrapper(tile, this.tileIndex.options.extent);
  }
}
