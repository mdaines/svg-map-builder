import assert from "node:assert/strict";
import { PMTiles } from "pmtiles";
import { Bounds } from "../src/bounds.js";
import { VectorTileSource } from "../src/vector-tile-source.js";
import { NodeFileArchiveSource } from "../src/node-file-archive-source.js";
import { fixturePath } from "./helpers.js";

describe("VectorTileSource", function() {
  describe("getMetadata", function() {
    it("includes the maximum zoom level", async function() {
      const archive = new PMTiles(new NodeFileArchiveSource(fixturePath("polygon.pmtiles")));
      const source = new VectorTileSource(archive, "polygon");

      const metadata = await source.getMetadata();

      assert.deepStrictEqual(metadata.maxZoom, 5);
    });
  });

  describe("getTile", function() {
    it("returns the requested tile", async function() {
      const archive = new PMTiles(new NodeFileArchiveSource(fixturePath("polygon.pmtiles")));
      const source = new VectorTileSource(archive, "polygon");

      const tile = await source.getTile([0, 0, 0]);

      assert.ok(tile.features);
      assert.ok(tile.extent);
    });

    it("wrapped tile coordinates are not an error", async function() {
      const archive = new PMTiles(new NodeFileArchiveSource(fixturePath("polygon.pmtiles")));
      const source = new VectorTileSource(archive, "polygon");

      assert.ok(await source.getTile([0, 1, 0]));
      assert.ok(await source.getTile([0, -1, 0]));
    });
  });
});
