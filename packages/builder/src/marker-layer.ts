import { GeomType } from "./constants.js";
import { Bounds } from "./bounds.js";
import { evaluateOption, evaluateAttributes, LayerData, FeatureData } from "./attributes.js";
import { type LayerOption, type FeatureOption, type FeatureAttributes, type LayerAttributes } from "./attributes.js";
import { type Layer } from "./layer.js";
import { type Icon } from "./icon.js";
import { type TileSource } from "./tile-source.js";
import { type Layout } from "./layout.js";
import { type Point } from "./point.js";

class Marker {
  featureSortKey: number | undefined;
  featureData: FeatureData;
  point: Point;
  positionKey: number;

  constructor(featureSortKey: number | undefined, featureData: FeatureData, point: Point, positionKey: number) {
    this.featureSortKey = featureSortKey;
    this.featureData = featureData;
    this.point = point;
    this.positionKey = positionKey;
  }
}

async function collectMarkers(layout: Layout, source: TileSource, filter?: (data: FeatureData) => boolean, sortKey?: (data: FeatureData) => number | undefined): Promise<Marker[]> {
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

      const featureData = new FeatureData(feature, layout);

      if (typeof filter !== "undefined" && !filter(featureData)) {
        continue;
      }

      let featureSortKey;

      if (typeof sortKey !== "undefined") {
        featureSortKey = sortKey(featureData);
      }

      for (const geometry of feature.geometry) {
        const point = {
          x: tileBounds.x + (geometry[0].x / tile.extent) * tileBounds.width,
          y: tileBounds.y + (geometry[0].y / tile.extent) * tileBounds.height
        };

        if (layout.backgroundBounds.contains(point)) {
          const positionKey = point.y * layout.backgroundBounds.width + point.x;

          markers.push(new Marker(featureSortKey, featureData, point, positionKey));
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

export type MarkerLayerIconOptions = {
  id?: FeatureOption<string | undefined>,
  attributes?: FeatureAttributes
}

export type MarkerLayerTextOptions = {
  content?: FeatureOption<string | undefined>,
  attributes?: FeatureAttributes
}

export class MarkerLayer implements Layer {
  source: TileSource;
  visible: LayerOption<boolean>;
  filter: ((data: FeatureData) => boolean) | undefined;
  sortKey: ((data: FeatureData) => number | undefined) | undefined;
  attributes: FeatureAttributes | undefined;
  icon: MarkerLayerIconOptions | undefined;
  text: MarkerLayerTextOptions | undefined;

  constructor(
    source: TileSource,
    options?: {
      visible?: LayerOption<boolean>,
      filter?: (data: FeatureData) => boolean,
      sortKey?: (data: FeatureData) => number | undefined,
      attributes?: FeatureAttributes,
      icon?: MarkerLayerIconOptions,
      text?: MarkerLayerTextOptions
    }
  ) {
    this.source = source;
    this.visible = options?.visible ?? true;
    this.filter = options?.filter;
    this.sortKey = options?.sortKey;
    this.attributes = options?.attributes;
    this.icon = options?.icon;
    this.text = options?.text;
  }

  /** @internal */
  async render({ document, layout, icons }: {
    document: Document,
    layout: Layout,
    icons: Record<string, Icon>
  }): Promise<Node | undefined> {
    const layerData = new LayerData(layout);

    if (evaluateOption(layerData, this.visible) == false) {
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

      for (const [name, value] of evaluateAttributes(marker.featureData, this.attributes)) {
        markerGroup.setAttribute(name, value);
      }

      if (typeof this.icon !== "undefined") {
        let iconId;

        if (typeof this.icon.id === "function") {
          iconId = this.icon.id(marker.featureData);
        } else if (typeof this.icon.id !== "undefined") {
          iconId = this.icon.id;
        }

        if (typeof iconId !== "undefined") {
          const icon = icons[iconId];

          if (typeof icon !== "undefined") {
            const iconUse = document.createElementNS("http://www.w3.org/2000/svg", "use");
            iconUse.setAttribute("href", `#${iconId}`);
            iconUse.setAttribute("x", String(Math.round(marker.point.x - icon.width * 0.5)));
            iconUse.setAttribute("y", String(Math.round(marker.point.y - icon.height * 0.5)));

            for (const [name, value] of evaluateAttributes(marker.featureData, this.icon.attributes)) {
              iconUse.setAttribute(name, value);
            }

            markerGroup.appendChild(iconUse);
          }
        }
      }

      if (typeof this.text !== "undefined") {
        let textContent;

        if (typeof this.text.content === "function") {
          textContent = this.text.content(marker.featureData);
        } else if (typeof this.text.content !== "undefined") {
          textContent = this.text.content;
        }

        if (typeof textContent !== "undefined") {
          const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
          text.setAttribute("x", String(Math.round(marker.point.x)));
          text.setAttribute("y", String(Math.round(marker.point.y)));

          const textNode = document.createTextNode(textContent);
          text.appendChild(textNode);

          for (const [name, value] of evaluateAttributes(marker.featureData, this.text.attributes)) {
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
