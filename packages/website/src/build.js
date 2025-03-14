import { readFileSync, writeFileSync } from "node:fs";
import { JSDOM } from "jsdom";
import serialize from "w3c-xmlserializer";
import { PMTiles } from "pmtiles";
import { buildMapImage } from "./map.js";
import { Layout, GeoJSONSource, NodeFileArchiveSource } from "@mdaines/svg-map-builder";

const basemapUrl = new URL("../data/basemap.pmtiles", import.meta.url);
const basemapArchive = new PMTiles(new NodeFileArchiveSource(basemapUrl));

const routeUrl = new URL("../data/tokaido.geojson", import.meta.url);
const routeData = readFileSync(routeUrl);
const routeSource = new GeoJSONSource(JSON.parse(routeData));

const layout = Layout.box({
  bounds: routeSource.bounds,
  width: 640,
  height: 480,
  padding: 64
});

const mapImage = buildMapImage(layout, basemapArchive, routeSource);

const document = new JSDOM().window.document;
const svg = await mapImage.render(document);
const svgText = serialize(svg);

const mapUrl = new URL("../site/map.svg", import.meta.url);
writeFileSync(mapUrl, svgText);
