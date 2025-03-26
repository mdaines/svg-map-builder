import assert from "node:assert/strict";
import { GeomType } from "../lib/constants.js";
import { evaluateAttributes, FeatureData, LayerData } from "../lib/attributes.js";

describe("evaluateAttributes", function() {
  it("object literal", function() {
    const attributes = {
      fill: "lightblue",
      stroke: "green",
      strokeWidth: 2,
      strokeDasharray: [4, 4]
    };

    assert.deepStrictEqual(Array.from(evaluateAttributes({}, attributes)), [
      ["fill", "lightblue"],
      ["stroke", "green"],
      ["stroke-width", "2"],
      ["stroke-dasharray", "4,4"]
    ]);
  });

  it("attribute value callback", function() {
    const attributes = {
      fill: ({ depth }) => depth == 1 ? "lightblue" : "blue",
    };

    assert.deepStrictEqual(Array.from(evaluateAttributes({ depth: 1 }, attributes)), [["fill", "lightblue"]]);
    assert.deepStrictEqual(Array.from(evaluateAttributes({ depth: 2 }, attributes)), [["fill", "blue"]]);
  });

  it("undefined value", function() {
    assert.deepStrictEqual(Array.from(evaluateAttributes({}, { fill: "blue", stroke: () => undefined })), [["fill", "blue"]]);
    assert.deepStrictEqual(Array.from(evaluateAttributes({}, { fill: "blue", stroke: undefined })), [["fill", "blue"]]);
  });

  it("callback", function() {
    const attributes = ({ depth }) => {
      return {
        strokeWidth: 2,
        fill: depth == 1 ? "lightblue" : "blue"
      };
    };

    assert.deepStrictEqual(Array.from(evaluateAttributes({ depth: 1 }, attributes)), [
      ["stroke-width", "2"],
      ["fill", "lightblue"]
    ]);
    assert.deepStrictEqual(Array.from(evaluateAttributes({ depth: 2 }, attributes)), [
      ["stroke-width", "2"],
      ["fill", "blue"]
    ]);
  });

  it("undefined object", function() {
    assert.deepStrictEqual(Array.from(evaluateAttributes({}, undefined)), []);
    assert.deepStrictEqual(Array.from(evaluateAttributes({}, () => undefined)), []);
  });
});

describe("FeatureData", function() {
  describe("feature and layout", function() {
    function makeFeatureData() {
      const feature = {
        id: 123,
        type: GeomType.POINT,
        properties: {
          natural: "water",
          depth: 1
        }
      };

      const layout = {
        zoom: 2
      };

      return new FeatureData(feature, layout);
    }

    it("id", function() {
      const data = makeFeatureData();

      assert.strictEqual(data.id, 123);
    });

    it("type", function() {
      const data = makeFeatureData();

      assert.strictEqual(data.type, GeomType.POINT);
    });

    it("properties", function() {
      const data = makeFeatureData();

      assert.deepStrictEqual(data.properties, {
        natural: "water",
        depth: 1
      });
    });

    describe("get", function() {
      it("returns the value of a property", function() {
        const data = makeFeatureData();

        assert.strictEqual(data.get("natural"), "water");
      });

      it("returns undefined if there is no property with the name", function() {
        const data = makeFeatureData();

        assert.strictEqual(data.get("something"), undefined);
      });

      it("returns a fallback value if there is no property with the name", function() {
        const data = makeFeatureData();

        assert.strictEqual(data.get("something", 456), 456);
      });

      it("can be used with destructuring assignment", function() {
        const data = makeFeatureData();

        const { get } = data;

        assert.strictEqual(get("natural"), "water");
      });
    });

    describe("has", function() {
      it("returns true if there is a property with the name", function() {
        const data = makeFeatureData();

        assert.strictEqual(data.has("natural"), true);
      });

      it("returns false if there is no property with the name", function() {
        const data = makeFeatureData();

        assert.strictEqual(data.has("something"), false);
      });

      it("can be used with destructuring assignment", function() {
        const data = makeFeatureData();

        const { has } = data;

        assert.strictEqual(has("natural"), true);
      });
    });

    describe("zoom", function() {
      it("returns the value of the layout's zoom property", function() {
        const data = makeFeatureData();

        assert.strictEqual(data.zoom, 2);
      });

      it("can be used with destructuring assignment", function() {
        const data = makeFeatureData();

        const { zoom } = data;

        assert.strictEqual(zoom, 2);
      });
    });
  });
});

describe("LayerData", function() {
  function makeLayerData() {
    const layout = {
      zoom: 2
    };

    return new LayerData(layout);
  }

  it("getters", function() {
    const data = makeLayerData();

    assert.strictEqual(data.zoom, 2);
  });
});
