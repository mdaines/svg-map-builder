import { readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { GeoJSONSource } from "../src/geojson-source.js";

export function fixturePath(filename) {
  return path.join(import.meta.dirname, "data", filename);
}

export function getFixture(filename) {
  return JSON.parse(readFileSync(fixturePath(filename)));
}

export function getGeoJSONSource(filename, options) {
  return new GeoJSONSource(getFixture(filename), options);
}

export class NodeFileSource {
  constructor(filePath) {
    this.filePath = filePath;
  }

  getKey() {
    return this.filePath;
  }

  async getBytes(offset, length) {
    if (!this.buffer) {
      this.buffer = await readFile(this.filePath);
    }

    const data = this.buffer.buffer.slice(offset, offset + length);

    return { data };
  }
}
