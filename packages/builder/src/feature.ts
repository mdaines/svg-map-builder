import { type GeomType } from "./constants.js";
import { type Point } from "./point.js";

export interface Feature {
  id: any,
  type: GeomType,
  properties: Record<string, any>,
  geometry: Point[][]
}
