import { type TileIdentifier } from "./tile-identifier.js";
import { type Tile } from "./tile.js";

export interface TileSource {
  getMetadata(): Promise<{ maxZoom: number }>,
  getTile(tileId: TileIdentifier): Promise<Tile | undefined>
}
