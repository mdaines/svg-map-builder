import { readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { GeoJSONSource } from "../lib/geojson-source.js";

export function fixturePath(filename) {
  return path.join(import.meta.dirname, "data", filename);
}

export function getFixture(filename) {
  return JSON.parse(readFileSync(fixturePath(filename)));
}

export function getGeoJSONSource(filename, options) {
  return new GeoJSONSource(getFixture(filename), options);
}
