import { type Feature } from "./feature.js";
import { type Layout } from "./layout.js";
import { type GeomType } from "./constants.js";

export type AttributeEntry<Value> = ((data: AttributeData) => Value) | Value;

export type Attributes =
  ((data: AttributeData) => Record<string, any> | undefined) |
  Record<string, AttributeEntry<any>>

export function camelToDashed(name: string): string {
  return name.replace(/[A-Z]/g, "-$&").toLowerCase();
}

export function evaluateEntry<Value>(data: AttributeData, entry: AttributeEntry<Value>): Value {
  if (entry instanceof Function) {
    return entry(data);
  } else {
    return entry;
  }
}

export function evaluateAttributes(data: AttributeData, attrs: Attributes): Map<string, string> {
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
      const evaluatedEntry = evaluateEntry(data, value);

      if (typeof evaluatedEntry !== "undefined") {
        map.set(camelToDashed(name), String(evaluatedEntry));
      }
    }
  }

  return map;
}

export class AttributeData {
  #feature: Feature | undefined;
  #layout: Layout;

  get = function(this: AttributeData, name: string, fallback: any) {
    if (typeof this.properties !== "undefined" && Object.hasOwn(this.properties, name)) {
      return this.properties[name];
    }

    return fallback;
  }.bind(this);

  has = function(this: AttributeData, name: string) {
    if (typeof this.properties !== "undefined") {
      return Object.hasOwn(this.properties, name);
    } else {
      return false;
    }
  }.bind(this);

  constructor(feature: Feature | undefined, layout: Layout) {
    this.#feature = feature;
    this.#layout = layout;
  }

  get id(): any {
    if (typeof this.#feature !== "undefined") {
      return this.#feature.id;
    }
  }

  get type(): GeomType | undefined {
    if (typeof this.#feature !== "undefined") {
      return this.#feature.type;
    }
  }

  get properties(): Record<string, any> | undefined {
    if (typeof this.#feature !== "undefined") {
      return this.#feature.properties;
    }
  }

  get zoom(): number {
    return this.#layout.zoom;
  }
}
