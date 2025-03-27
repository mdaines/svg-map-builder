import { type GeomType } from "./constants.js";
import { type Point } from "./point.js";

export interface Feature {
  id: unknown,
  type: GeomType,
  properties: Record<string, unknown>,
  geometry: Point[][]
}
