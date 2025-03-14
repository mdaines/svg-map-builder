import { writeFileSync } from "node:fs";
import { JSDOM } from "jsdom";
import serialize from "w3c-xmlserializer";
import { render } from "./map.js";

const document = new JSDOM().window.document;
const svg = await render(document);
const svgText = serialize(svg);

const mapUrl = new URL("../map.svg", import.meta.url);
writeFileSync(mapUrl, svgText);
