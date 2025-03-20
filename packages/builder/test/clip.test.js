import assert from "node:assert/strict";
import { GeomType } from "../lib/constants.js";
import { clipGeometry } from "../lib/clip.js";
import { Bounds } from "../lib/bounds.js";

describe("clipGeometry", function() {
  it("clips points", function() {
    const feature = {
      type: GeomType.POINT,
      geometry: [[{ x: 64, y: 64 }, { x: 192, y: 64 }, { x: 192, y: 192 }]]
    };

    assert.deepStrictEqual(
      clipGeometry(feature, new Bounds(0, 0, 256, 256)),
      [[{ x: 64, y: 64 }, { x: 192, y: 64 }, { x: 192, y: 192 }]]
    );

    assert.deepStrictEqual(
      clipGeometry(feature, new Bounds(-128, -128, 128, 128)),
      [[{ x: 64, y: 64 }]]
    );

    assert.deepStrictEqual(
      clipGeometry(feature, new Bounds(128, 128, 256, 256)),
      [[{ x: 192, y: 192 }]]
    );
  });

  it("clips lines", function() {
    const feature = {
      type: GeomType.LINESTRING,
      geometry: [
        [{ x: -64, y: 64 }, { x: 320, y: 64 }],
        [{ x: 128, y: 192 }, { x: 192, y: 128 }]
      ]
    };

    assert.deepStrictEqual(
      clipGeometry(feature, new Bounds(0, 0, 128, 128)),
      [
        [{ x: 0, y: 64 }, { x: 128, y: 64 }]
      ]
    );
  });
});
