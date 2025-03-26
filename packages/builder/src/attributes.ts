import { type Feature } from "./feature.js";
import { type Layout } from "./layout.js";
import { type GeomType } from "./constants.js";

export class FeatureData {
  #feature: Feature;
  #layout: Layout;

  get = function(this: FeatureData, name: string, fallback: any) {
    if (Object.hasOwn(this.properties, name)) {
      return this.properties[name];
    }

    return fallback;
  }.bind(this);

  has = function(this: FeatureData, name: string) {
    return Object.hasOwn(this.properties, name);
  }.bind(this);

  constructor(feature: Feature, layout: Layout) {
    this.#feature = feature;
    this.#layout = layout;
  }

  get id(): any {
    return this.#feature.id;
  }

  get type(): GeomType {
    return this.#feature.type;
  }

  get properties(): Record<string, any> {
    return this.#feature.properties;
  }

  get zoom(): number {
    return this.#layout.zoom;
  }
}

export class LayerData {
  #layout: Layout;

  constructor(layout: Layout) {
    this.#layout = layout;
  }

  get zoom(): number {
    return this.#layout.zoom;
  }
}

export type AttributeValue = string | number | boolean | null | undefined

export type DataOption<Data, Value> = ((data: Data) => Value) | Value

export type Attributes<Data> =
  Record<string, DataOption<Data, AttributeValue>> |
  DataOption<Data, Record<string, AttributeValue>>

export type FeatureOption<Value> = DataOption<FeatureData, Value>

export type LayerOption<Value> = DataOption<LayerData, Value>

export type FeatureAttributes = Attributes<FeatureData>

export type LayerAttributes = Attributes<LayerData>

export function camelToDashed(name: string): string {
  return name.replace(/[A-Z]/g, "-$&").toLowerCase();
}

export function evaluateOption<Data, Value>(data: Data, entry: DataOption<Data, Value>): Value {
  if (entry instanceof Function) {
    return entry(data);
  } else {
    return entry;
  }
}

export function evaluateAttributes<Data>(data: Data, attrs: Attributes<Data> | undefined): Map<string, string> {
  const map = new Map();

  if (attrs instanceof Function) {
    const evaluatedAttrs = attrs(data);

    if (typeof evaluatedAttrs !== "undefined") {
      for (const [name, value] of Object.entries(evaluatedAttrs)) {
        if (typeof value !== "undefined") {
          map.set(camelToDashed(name), String(value));
        }
      }
    }
  } else if (typeof attrs !== "undefined") {
    for (const [name, value] of Object.entries(attrs)) {
      const evaluatedOption = evaluateOption(data, value);

      if (typeof evaluatedOption !== "undefined") {
        map.set(camelToDashed(name), String(evaluatedOption));
      }
    }
  }

  return map;
}
