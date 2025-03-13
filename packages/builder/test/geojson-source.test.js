import assert from "node:assert/strict";
import { GeoJSONSource } from "../src/geojson-source.js";
import { Bounds } from "../src/bounds.js";
import { GeomType } from "../src/constants.js";
import { Layout } from "../src/layout.js";
import { getFixture } from "./helpers.js";

describe("GeoJSONSource", function() {
  describe("getMetadata", function() {
    it("returns metadata", async function() {
      const source = new GeoJSONSource(getFixture("point.geojson"), { maxZoom: 5 });
      const metadata = await source.getMetadata();

      assert.strictEqual(metadata.maxZoom, 5);
    });
  });

  describe("bounds", function() {
    it("bounds in world coordinates", function() {
      const source = new GeoJSONSource(getFixture("polygon.geojson"));

      assert.deepStrictEqual(source.bounds, new Bounds(
        0.5,
        0.3785791577410809,
        0.5277777777777778,
        0.5
      ));
    });
  });

  describe("getTile", function() {
    it("returns a tile", async function() {
      const source = new GeoJSONSource(getFixture("point.geojson"));

      const tile = await source.getTile([0, 0, 0]);

      assert.ok(tile.features);
      assert.ok(tile.extent);
      assert.ok(Array.from(tile.features).find(f => f.properties.name == "Nihonbashi"));
    });

    it("returns undefined if no tile exists", async function() {
      const source = new GeoJSONSource(getFixture("point.geojson"));

      assert.strictEqual(await source.getTile([0, 0, -1]), undefined);
    });
  });

  describe("feature", function() {
    it("correctly wraps the feature's id, type, and properties", async function() {
      const source = new GeoJSONSource(getFixture("point.geojson"));

      const tile = await source.getTile([0, 0, 0]);

      const feature = Array.from(tile.features).find(f => f.properties.name == "Nihonbashi");

      assert.strictEqual(feature.id, "nihonbashi");
      assert.strictEqual(feature.type, GeomType.POINT);
      assert.deepStrictEqual(feature.properties, {
        "priority": 0,
        "name": "Nihonbashi"
      });
      assert.deepStrictEqual(feature.geometry, [[{ x: 3638, y: 1613 }]]);
    });
  });
});
