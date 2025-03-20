import { Bounds } from "./bounds.js";
import { type Point } from "./point.js";

function projectX(lon: number): number {
  return lon / 360 + 0.5;
}

function projectY(lat: number): number {
  if (lat < -85.05) {
    lat = -85.05;
  }

  if (lat > 85.05) {
    lat = 85.05;
  }

  const rad = lat * Math.PI / 180;
  return (1 - (Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI)) / 2;
}

export function convertCoordinate(lon: number, lat: number): Point {
  return {
    x: projectX(lon),
    y: projectY(lat)
  };
}

export function convertBounds(minLon: number, minLat: number, maxLon: number, maxLat: number): Bounds {
  return new Bounds(
    projectX(minLon),
    projectY(maxLat),
    projectX(maxLon),
    projectY(minLat)
  );
}
