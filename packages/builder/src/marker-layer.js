import { GeomType } from "./constants.js";
import { Bounds } from "./bounds.js";
import { evaluateAttributes, evaluateEntry, AttributeData } from "./attributes.js";

class Marker {
  constructor(featureSortKey, attributeData, point, positionKey) {
    this.featureSortKey = featureSortKey;
    this.attributeData = attributeData;
    this.point = point;
    this.positionKey = positionKey;
  }
}

async function collectMarkers(layout, source, filter, sortKey) {
  const markers = [];

  for (const tileId of await layout.overzoomedTileIds(source)) {
    const tile = await source.getTile(tileId);

    if (typeof tile === "undefined") {
      continue;
    }

    const tileBounds = layout.tileBounds(tileId);

    for (const feature of tile.features) {
      if (feature.type != GeomType.POINT) {
        continue;
      }

      const attributeData = new AttributeData(feature, layout);

      if (typeof filter !== "undefined" && !filter(attributeData)) {
        continue;
      }

      let featureSortKey;

      if (typeof sortKey !== "undefined") {
        featureSortKey = sortKey(attributeData);
      }

      for (const geometry of feature.geometry) {
        const point = {
          x: tileBounds.x + (geometry[0].x / tile.extent) * tileBounds.width,
          y: tileBounds.y + (geometry[0].y / tile.extent) * tileBounds.height
        };

        if (layout.backgroundBounds.contains(point)) {
          const positionKey = point.y * layout.backgroundBounds.width + point.x;

          markers.push(new Marker(featureSortKey, attributeData, point, positionKey));
        }
      }
    }
  }

  if (typeof sortKey !== "undefined") {
    markers.sort((a, b) => {
      if (a.featureSortKey === undefined && b.featureSortKey === undefined) {
        return 0; // same
      } else if (a.featureSortKey === undefined) {
        return 1; // a lower than b
      } else if (b.featureSortKey === undefined) {
        return -1; // a higher than b
      } else {
        return a.featureSortKey - b.featureSortKey;
      }
    });
  }

  return markers;
}

export class MarkerLayer {
  constructor({ visible, source, filter, sortKey, attributes, icon, text }) {
    this.visible = visible;
    this.source = source;
    this.filter = filter;
    this.sortKey = sortKey;
    this.attributes = attributes;
    this.icon = icon;
    this.text = text;
  }

  async render({ document, layout, icons }) {
    const layerAttributeData = new AttributeData(undefined, layout);

    if (typeof this.visible !== "undefined" && !evaluateEntry(layerAttributeData, this.visible)) {
      return;
    }

    const fragment = document.createDocumentFragment();

    const seenPositions = new Set();

    for (const marker of await collectMarkers(layout, this.source, this.filter, this.sortKey)) {
      if (seenPositions.has(marker.positionKey)) {
        continue;
      }

      seenPositions.add(marker.positionKey);

      const markerGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");

      for (const [name, value] of evaluateAttributes(marker.attributeData, this.attributes)) {
        markerGroup.setAttribute(name, value);
      }

      if (typeof this.icon !== "undefined") {
        let iconId;

        if (typeof this.icon.id === "function") {
          iconId = this.icon.id(marker.attributeData);
        } else if (typeof this.icon.id !== "undefined") {
          iconId = this.icon.id;
        }

        const icon = icons[iconId];

        if (typeof icon !== "undefined") {
          const iconUse = document.createElementNS("http://www.w3.org/2000/svg", "use");
          iconUse.setAttribute("href", `#${iconId}`);
          iconUse.setAttribute("x", Math.round(marker.point.x - icon.width * 0.5));
          iconUse.setAttribute("y", Math.round(marker.point.y - icon.height * 0.5));

          for (const [name, value] of evaluateAttributes(marker.attributeData, this.icon.attributes)) {
            iconUse.setAttribute(name, value);
          }

          markerGroup.appendChild(iconUse);
        }
      }

      if (typeof this.text !== "undefined") {
        let textContent;

        if (typeof this.text.content === "function") {
          textContent = this.text.content(marker.attributeData);
        } else if (typeof this.text.content !== "undefined") {
          textContent = this.text.content;
        }

        if (typeof textContent !== "undefined") {
          const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
          text.setAttribute("x", Math.round(marker.point.x));
          text.setAttribute("y", Math.round(marker.point.y));

          const textNode = document.createTextNode(textContent);
          text.appendChild(textNode);

          for (const [name, value] of evaluateAttributes(marker.attributeData, this.text.attributes)) {
            text.setAttribute(name, value);
          }

          markerGroup.appendChild(text);
        }
      }

      fragment.appendChild(markerGroup);
    }

    return fragment;
  }
}
