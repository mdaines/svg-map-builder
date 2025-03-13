import { GeomType, BackgroundLayer, PathLayer, MarkerLayer, VectorTileSource, Icon, MapImage } from "@mdaines/svg-map-builder";

const icons = {
  circle: new Icon({
    content: ({ document }) => {
      const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      circle.setAttribute("r", 3);
      circle.setAttribute("cx", 4);
      circle.setAttribute("cy", 4);

      return circle;
    },
    width: 8,
    height: 8
  })
};

function buildLayers(basemapArchive, routeSource, options) {
  return [
    new BackgroundLayer({
      attributes: {
        fill: "#e2dfda"
      }
    }),

    new PathLayer({
      visible: options.visibleLayers["landcover"],
      source: new VectorTileSource(basemapArchive, "landcover"),
      attributes: {
        fill: ({ get }) => {
          switch (get("kind")) {
          case "grassland":
            return "rgba(210, 239, 207, 1)";
          case "barren":
            return "rgba(255, 243, 215, 1)";
          case "urban_area":
            return "rgba(230, 230, 230, 1)";
          case "farmland":
            return "rgba(216, 239, 210, 1)";
          case "glacier":
            return "rgba(255, 255, 255, 1)";
          case "scrub":
            return "rgba(234, 239, 210, 1)";
          default:
            return "rgba(196, 231, 210, 1)";
          }
        }
      }
    }),

    new PathLayer({
      visible: options.visibleLayers["water"],
      source: new VectorTileSource(basemapArchive, "water"),
      filter: ({ type }) => type === GeomType.POLYGON,
      attributes: {
        fill: "#80deea"
      }
    }),

    new PathLayer({
      visible: options.visibleLayers["roads"],
      source: new VectorTileSource(basemapArchive, "roads"),
      attributes: {
        fill: "none",
        stroke: "#ffffff",
        strokeWidth: ({ get }) => get("kind") == "highway" ? 0.5 : 0.25,
        vectorEffect: "non-scaling-stroke"
      }
    }),

    new PathLayer({
      visible: options.visibleLayers["boundaries"],
      source: new VectorTileSource(basemapArchive, "boundaries"),
      filter: ({ get }) => get("kind_detail") <= 2,
      attributes: {
        fill: "none",
        stroke: "#adadad",
        strokeWidth: 0.7,
        strokeDasharray: ({ zoom }) => zoom > 4 ? "2 1" : "2",
        vectorEffect: "non-scaling-stroke"
      }
    }),

    new PathLayer({
      visible: options.visibleLayers["boundaries"],
      source: new VectorTileSource(basemapArchive, "boundaries"),
      filter: ({ get }) => get("kind_detail") > 2,
      attributes: {
        fill: "none",
        stroke: "#adadad",
        strokeWidth: 0.4,
        strokeDasharray: "2 1",
        vectorEffect: "non-scaling-stroke"
      }
    }),

    new PathLayer({
      visible: options.visibleLayers["route"],
      source: routeSource,
      filter: ({ type }) => type === GeomType.LINESTRING,
      attributes: {
        fill: "none",
        stroke: "black",
        strokeWidth: "1",
        strokeLinejoin: "round",
        strokeLinecap: "round",
        vectorEffect: "non-scaling-stroke",
        strokeDasharray: ({ get }) => get("mode") == "ferry" ? "2 2" : undefined
      }
    }),

    new MarkerLayer({
      visible: options.visibleLayers["places"],
      source: new VectorTileSource(basemapArchive, "places"),
      filter: ({ get }) => get("kind") == "locality",
      attributes: {
        dataOverlap: ""
      },
      icon: {
        id: "circle",
        attributes: {
          fill: "#fff",
          stroke: "#000",
          strokeWidth: "1",
        }
      },
      text: {
        content: ({ id, get }) => get("name:en"),
        attributes: {
          fontFamily: "helvetica, sans-serif",
          fontSize: ({ get }) => get("population_rank") < 12 ? "11": "14",
          textAnchor: "middle",
          fill: "#000",
          stroke: "#fff",
          strokeWidth: "2",
          paintOrder: "stroke fill",
          transform: "translate(0, -8)"
        }
      }
    })
  ];
}

export function buildMapImage(layout, basemapArchive, routeSource, options) {
  return new MapImage({
    layout,
    icons,
    layers: buildLayers(basemapArchive, routeSource, options)
  })
}
