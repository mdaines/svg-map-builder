import { readFileSync } from "node:fs";
import { PMTiles } from "pmtiles";
import { BackgroundLayer, GeomType, GeoJSONTileSource, Icon, Layout, MapImage, MarkerLayer, NodeFileArchiveSource, PathLayer, VectorTileSource } from "@mdaines/svg-map-builder";

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
  }),

  mountain: new Icon({
    content: ({ document }) => {
      const radius = 4;

      const positions = [1, 5, 9].map(a => [
        Number((Math.cos((a / 12) * 2 * Math.PI) * radius + radius).toFixed(2)),
        Number((Math.sin((a / 12) * 2 * Math.PI) * radius + radius).toFixed(2))
      ].join(",")).join(" ");

      const triangle = document.createElementNS("http://www.w3.org/2000/svg", "path");
      triangle.setAttribute("d", `M ${positions} z`);

      return triangle;
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
      source: new VectorTileSource(basemapArchive, "water"),
      filter: ({ type }) => type === GeomType.POLYGON,
      attributes: {
        fill: "#80deea"
      }
    }),

    new PathLayer({
      source: new VectorTileSource(basemapArchive, "roads"),
      attributes: {
        fill: "none",
        stroke: "#fff",
        strokeWidth: ({ get }) => get("kind") == "highway" ? 0.5 : 0.25,
        vectorEffect: "non-scaling-stroke"
      }
    }),

    new PathLayer({
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
      source: routeSource,
      icon: {
        id: ({ get }) => get("icon", "circle"),
        attributes: {
          fill: "#fff",
          stroke: "#000",
          strokeWidth: "1",
        }
      },
      text: {
        content: ({ get }) => get("name"),
        attributes: {
          fontFamily: "helvetica, sans-serif",
          fontSize: "14",
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

export function render(document) {
  const basemapUrl = new URL("../data/basemap.pmtiles", import.meta.url);
  const basemapArchive = new PMTiles(new NodeFileArchiveSource(basemapUrl));

  const routeUrl = new URL("../data/tokaido.geojson", import.meta.url);
  const routeData = readFileSync(routeUrl);
  const routeSource = new GeoJSONTileSource(JSON.parse(routeData));

  const layout = Layout.box({
    bounds: routeSource.bounds,
    width: 400,
    height: 300,
    padding: 40
  });

  const mapImage = new MapImage({
    layout,
    icons,
    layers: buildLayers(basemapArchive, routeSource)
  });

  return mapImage.render(document);
}
