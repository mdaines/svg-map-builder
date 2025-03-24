import { readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { GeoJSONTileSource } from "../lib/geojson-tile-source.js";

export function fixturePath(filename) {
  return path.join(import.meta.dirname, "data", filename);
}

export function getFixture(filename) {
  return JSON.parse(readFileSync(fixturePath(filename)));
}

export function getGeoJSONTileSource(filename, options) {
  return new GeoJSONTileSource(getFixture(filename), options);
}
