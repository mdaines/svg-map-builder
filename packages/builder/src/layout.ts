import { Bounds } from "./bounds.js";
import { SimpleTransform } from "./simple-transform.js";
import { type Point } from "./point.js";
import { type TileIdentifier } from "./tile-identifier.js";
import { type TileSource } from "./tile-source.js";

function boundsTransform(fromBounds: Bounds, toBounds: Bounds): SimpleTransform {
  let scale;

  if (fromBounds.width == 0) {
    scale = toBounds.height / fromBounds.height;
  } else if (fromBounds.height == 0) {
    scale = toBounds.width / fromBounds.width;
  } else {
    scale = Math.min(toBounds.width / fromBounds.width, toBounds.height / fromBounds.height);
  }

  return new SimpleTransform()
    .translate(toBounds.x, toBounds.y)
    .scale(scale)
    .translate(-fromBounds.x, -fromBounds.y);
}

function pixelAlignedTransform(transform: SimpleTransform, tileLength: number, canvasBounds: Bounds): SimpleTransform {
  const info = new TilePlacementInfo(transform, tileLength);

  // Find the tile at the center of the canvas bounds

  const tileId: TileIdentifier = [
    info.zoomLevel,
    Math.floor((canvasBounds.midX - transform.tx) / (transform.a / info.tileCount)),
    Math.floor((canvasBounds.midY - transform.ty) / (transform.a / info.tileCount))
  ];
  const tileBounds = info.tileBounds(tileId);

  // Round tile bounds to integral values

  const integralTileMinX = Math.floor(tileBounds.minX);
  const integralTileMinY = Math.floor(tileBounds.minY);
  const integralTileLength = Math.ceil(tileBounds.width);

  // Find integral world bounds from integral tile bounds

  const integralWorldMinX = integralTileMinX - tileId[1] * integralTileLength;
  const integralWorldMinY = integralTileMinY - tileId[2] * integralTileLength;
  const integralWorldLength = integralTileLength * info.tileCount;

  // The world bounds in canvas coordinates defines the transform from world coordinates.

  return new SimpleTransform(
    integralWorldLength,
    integralWorldMinX,
    integralWorldMinY
  );
}

class TilePlacementInfo {
  transform: SimpleTransform;
  tileLength: number;
  zoom: number;
  zoomLevel: number;
  tileCount: number;

  constructor(transform: SimpleTransform, tileLength: number) {
    this.transform = transform;
    this.tileLength = tileLength;

    this.zoom = Math.log2(this.transform.a / this.tileLength);
    this.zoomLevel = Math.max(0, Math.round(this.zoom));
    this.tileCount = 1 << this.zoomLevel;
  }

  tileBounds(tileId: TileIdentifier): Bounds {
    const tileCount = 1 << tileId[0];
    const x = tileId[1] / tileCount;
    const y = tileId[2] / tileCount;
    const length = 1 / tileCount;

    return this.transform.convertBounds(new Bounds(x, y, x + length, y + length));
  }
}

class TileRange {
  zoomLevel: number;
  tileLowerX: number;
  tileLowerY: number;
  tileUpperX: number;
  tileUpperY: number;

  constructor(transform: SimpleTransform, coverBounds: Bounds, zoomLevel: number) {
    this.zoomLevel = zoomLevel;

    // Convert the coverBounds to world coordinates and find the range of tiles that cover it.

    const coverWorldBounds = transform.inverse().convertBounds(coverBounds);
    const tileCount = 1 << zoomLevel;

    this.tileLowerX = Math.floor(coverWorldBounds.minX * tileCount);
    this.tileLowerY = Math.max(0, Math.min(tileCount, Math.floor(coverWorldBounds.minY * tileCount)));
    this.tileUpperX = Math.ceil(coverWorldBounds.maxX * tileCount);
    this.tileUpperY = Math.max(0, Math.min(tileCount, Math.ceil(coverWorldBounds.maxY * tileCount)));
  }

  get tileIds(): TileIdentifier[] {
    const tileIds: TileIdentifier[] = [];

    for (let y = this.tileLowerY; y < this.tileUpperY; y++) {
      for (let x = this.tileLowerX; x < this.tileUpperX; x++) {
        tileIds.push([this.zoomLevel, x, y]);
      }
    }

    return tileIds;
  }

  overzoomedTileIds(maxZoom: number): TileIdentifier[] {
    if (maxZoom >= this.zoomLevel) {
      return this.tileIds;
    }

    if (maxZoom < 0) {
      return [];
    }

    const shift = this.zoomLevel - maxZoom;

    const tileLowerX = this.tileLowerX >> shift;
    const tileLowerY = this.tileLowerY >> shift;
    const tileUpperX = this.tileUpperX >> shift;
    const tileUpperY = this.tileUpperY >> shift;

    const tileIds: TileIdentifier[] = [];

    for (let y = tileLowerY; y < tileUpperY; y++) {
      for (let x = tileLowerX; x < tileUpperX; x++) {
        tileIds.push([maxZoom, x, y]);
      }
    }

    return tileIds;
  }
}

export class Layout {
  /** @internal */
  canvasBounds: Bounds;

  /** @internal */
  transform: SimpleTransform;

  /** @internal */
  tileLength: number;

  /** @internal */
  tileInfo: TilePlacementInfo;

  /** @internal */
  backgroundBounds: Bounds;

  /** @internal */
  tileRange: TileRange;

  /**
   * @param options
   */
  static camera({ center, zoom, width, height, tileLength = 512 }: {
    center: Point,
    zoom: number,
    width: number,
    height: number,
    tileLength: number
  }) {
    const canvasBounds = new Bounds(0, 0, width, height);

    const scale = Math.pow(2, zoom) * tileLength;

    const transform = new SimpleTransform()
      .translate(width * 0.5, height * 0.5)
      .scale(scale)
      .translate(
        -center.x,
        -center.y
      );

    const adjustedTransform = pixelAlignedTransform(transform, tileLength, canvasBounds);

    return new this(canvasBounds, adjustedTransform, tileLength);
  }

  /**
   * @param options
   */
  static box({ bounds, width, height, padding = 0, tileLength = 512 }: {
    bounds: Bounds,
    width: number,
    height: number,
    padding: number,
    tileLength: number
  }) {
    if (bounds.isNull) {
      throw new Error("geometry bounds is null");
    }

    if (bounds.width == 0 && bounds.height == 0) {
      throw new Error("geometry bounds has zero size");
    }

    if (width <= padding * 2 || height <= padding * 2) {
      throw new Error("padding too large");
    }

    const canvasBounds = new Bounds(0, 0, width, height);

    const paddingBounds = canvasBounds.insetBy(padding);

    // Find the geometry bounds by fitting a rectangle with the geometry's aspect ratio to the padding bounds

    const geometryScale = Math.min(paddingBounds.width / bounds.width, paddingBounds.height / bounds.height);
    const geometryBounds = new Bounds(0, 0, bounds.width * geometryScale, bounds.height * geometryScale).centeredAt(paddingBounds.midX, paddingBounds.midY);

    // Find the transform that converts the geometry bounds in world coordinates to the geometry bounds in canvas coordinates

    const transform = boundsTransform(bounds, geometryBounds);

    // Adjust the transform to align tiles with pixels

    const adjustedTransform = pixelAlignedTransform(transform, tileLength, canvasBounds);

    return new this(canvasBounds, adjustedTransform, tileLength);
  }

  /** @internal */
  constructor(canvasBounds: Bounds, transform: SimpleTransform, tileLength: number) {
    this.canvasBounds = canvasBounds;
    this.transform = transform;
    this.tileLength = tileLength;

    // Tile placement info derived from transform and tileLength

    this.tileInfo = new TilePlacementInfo(transform, tileLength);

    // Background bounds: center the world bounds on the canvas and trim y < 0 and y > 1.

    const worldBounds = this.transform.convertBounds(new Bounds(0, 0, 1, 1));
    const centeredWorldBounds = worldBounds.centeredAt(this.canvasBounds.midX, worldBounds.midY);

    this.backgroundBounds = new Bounds(
      this.canvasBounds.minX,
      Math.max(this.canvasBounds.minY, centeredWorldBounds.minY),
      this.canvasBounds.maxX,
      Math.min(this.canvasBounds.maxY, centeredWorldBounds.maxY)
    );

    // Tile range covering the background bounds.

    this.tileRange = new TileRange(this.transform, this.backgroundBounds, this.tileInfo.zoomLevel);
  }

  /** @internal */
  get zoom() {
    return this.tileInfo.zoom;
  }

  /** @internal */
  get tileIds() {
    return this.tileRange.tileIds;
  }

  /** @internal */
  async overzoomedTileIds(source: TileSource) {
    const { maxZoom } = await source.getMetadata();

    return this.tileRange.overzoomedTileIds(maxZoom);
  }

  /** @internal */
  tileBounds(tileId: TileIdentifier) {
    return this.tileInfo.tileBounds(tileId);
  }
}
