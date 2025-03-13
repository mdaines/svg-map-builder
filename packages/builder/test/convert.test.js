import assert from "node:assert/strict";
import { convertCoordinate, convertBounds } from "../src/convert.js";
import { Bounds } from "../src/bounds.js";

describe("convertCoordinate", function() {
  it("returns the expected result", function() {
    const point = convertCoordinate(10, 40);

    assert.deepStrictEqual(point, {
      x: 0.5277777777777778,
      y: 0.3785791577410809
    });
  });
});

describe("convertBounds", function() {
  it("returns the expected result", function() {
    const bounds = convertBounds(0, 0, 10, 40);

    assert.deepStrictEqual(bounds, new Bounds(
      0.5,
      0.3785791577410809,
      0.5277777777777778,
      0.5
    ));
  });
});
