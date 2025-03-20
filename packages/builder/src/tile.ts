import { type Feature } from "./feature.js";

export interface Tile {
  extent: number,
  features: Iterable<Feature>
}
