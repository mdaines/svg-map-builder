export function camelToDashed(name) {
  return name.replace(/[A-Z]/g, "-$&").toLowerCase();
}

export function evaluateEntry(data, value) {
  if (typeof value === "function") {
    return value(data);
  } else {
    return value;
  }
}

export function evaluateAttributes(data, ...objects) {
  return objects.reduce((map, object) => {
    const evaluatedObject = evaluateEntry(data, object);

    if (typeof evaluatedObject !== "undefined") {
      for (const [name, value] of Object.entries(evaluatedObject)) {
        const evaluatedValue = evaluateEntry(data, value);

        if (typeof evaluatedValue !== "undefined") {
          map.set(camelToDashed(name), String(evaluatedValue));
        }
      }
    }

    return map;
  }, new Map());
}

export class AttributeData {
  #feature;
  #layout;

  get = function(name, fallback) {
    if (typeof this.properties !== "undefined" && Object.hasOwn(this.properties, name)) {
      return this.properties[name];
    }

    return fallback;
  }.bind(this);

  has = function(name) {
    if (typeof this.properties !== "undefined") {
      return Object.hasOwn(this.properties, name);
    } else {
      return false;
    }
  }.bind(this);

  constructor(feature, layout) {
    this.#feature = feature;
    this.#layout = layout;
  }

  get id() {
    if (typeof this.#feature !== "undefined") {
      return this.#feature.id;
    }
  }

  get type() {
    if (typeof this.#feature !== "undefined") {
      return this.#feature.type;
    }
  }

  get properties() {
    if (typeof this.#feature !== "undefined") {
      return this.#feature.properties;
    }
  }

  get zoom() {
    return this.#layout.zoom;
  }
}
