import { Bounds } from "./bounds.js";

function projectX(lon) {
  return lon / 360 + 0.5;
}

function projectY(lat) {
  if (lat < -85.05) {
    lat = -85.05;
  }

  if (lat > 85.05) {
    lat = 85.05;
  }

  const rad = lat * Math.PI / 180;
  return (1 - (Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI)) / 2;
}

export function convertCoordinate(lon, lat) {
  return {
    x: projectX(lon),
    y: projectY(lat)
  };
}

export function convertBounds(minLon, minLat, maxLon, maxLat) {
  return new Bounds(
    projectX(minLon),
    projectY(maxLat),
    projectX(maxLon),
    projectY(minLat)
  );
}
