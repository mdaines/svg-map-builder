import { PMTiles, FetchSource } from "pmtiles";
import RBush from "rbush";
import { Layout, GeoJSONSource } from "@mdaines/svg-map-builder";
import { buildMapImage } from "./map.js";

const basemapUrl = new URL("../data/basemap.pmtiles", import.meta.url);

const basemapArchive = new PMTiles(new FetchSource(basemapUrl));

const routeUrl = new URL("../data/tokaido.geojson", import.meta.url);

let routeSource;

async function loadRouteSource() {
  if (routeSource) {
    return;
  }

  const response = await fetch(routeUrl);

  if (!response.ok) {
    throw new Error("Couldn't fetch route source data");
  }

  routeSource = new GeoJSONSource(await response.json());
}

function getOptions() {
  const options = {};

  document.querySelectorAll("#options input").forEach(input => {
    const path = input.name.split(".");

    if (path.length < 1) {
      return;
    }

    let obj = options;

    while (path.length > 1) {
      const prop = path.shift();

      if (!Object.hasOwn(obj, prop)) {
        obj[prop] = {};
      }

      obj = obj[prop];
    }

    obj[path[0]] = input.checked;
  });

  return options;
}

function removeOverlap(svg, showDebugRects) {
  const overlapList = new RBush();

  svg.querySelectorAll("[data-overlap]").forEach(element => {
    const boundingBoxes = [];

    for (const child of element.children) {
      const rect = child.getBoundingClientRect();

      boundingBoxes.push({ minX: rect.left, minY: rect.top, maxX: rect.right, maxY: rect.bottom });
    }

    const rectElements = [];

    for (const bbox of boundingBoxes) {
      const svgRect = svg.getBoundingClientRect();
      const rectElement = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      rectElement.setAttribute("x", bbox.minX - svgRect.x);
      rectElement.setAttribute("y", bbox.minY - svgRect.y);
      rectElement.setAttribute("width", bbox.maxX - bbox.minX);
      rectElement.setAttribute("height", bbox.maxY - bbox.minY);
      rectElement.setAttribute("fill", "none");
      rectElement.setAttribute("stroke", "green");

      if (showDebugRects) {
        rectElements.push(rectElement);
        svg.appendChild(rectElement);
      }
    }

    if (boundingBoxes.find(bbox => overlapList.collides(bbox))) {
      element.style.display = "none";

      for (const rectElement of rectElements) {
        rectElement.setAttribute("stroke", "red");
      }
    } else {
      element.style.display = "initial";

      overlapList.load(boundingBoxes);

      for (const rectElement of rectElements) {
        rectElement.setAttribute("stroke", "blue");
      }
    }
  });
}

async function render() {
  await loadRouteSource();

  const options = getOptions();

  const layout = Layout.box({
    bounds: routeSource.bounds,
    width: 640,
    height: 480,
    padding: 66
  });

  const mapImage = buildMapImage(layout, basemapArchive, routeSource, options);

  const svg = await mapImage.render(document);

  document.querySelector("#image").innerHTML = "";
  document.querySelector("#image").appendChild(svg);

  if (options.markers.removeOverlap) {
    removeOverlap(svg, options.markers.showDebugRects);
  }
}

document.querySelector("#options").addEventListener("input", function() {
  render();
});

render();
