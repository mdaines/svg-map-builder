import { GeomType } from "./constants.js";
import { type Feature } from "./feature.js";
import { type Bounds } from "./bounds.js";
import { type Point } from "./point.js";

// This is a modified version of the clip() function in geojson-vt.

// ISC License
//
// Copyright (c) 2015, Mapbox
//
// Permission to use, copy, modify, and/or distribute this software for any purpose
// with or without fee is hereby granted, provided that the above copyright notice
// and this permission notice appear in all copies.
//
// THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
// REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND
// FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
// INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS
// OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER
// TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF
// THIS SOFTWARE.

export function clipGeometry(feature: Feature, bounds: Bounds): Point[][] {
  if (feature.type === GeomType.POINT) {
    const newX: Point[] = [];
    const newY: Point[] = [];

    clipPoints(feature.geometry[0], newX, bounds.minX, bounds.maxX, 0);
    clipPoints(newX, newY, bounds.minY, bounds.maxY, 1);

    return [newY];
  } else if (feature.type === GeomType.LINESTRING) {
    const newX: Point[][] = [];
    const newY: Point[][] = [];

    clipLines(feature.geometry, newX, bounds.minX, bounds.maxX, 0, false);
    clipLines(newX, newY, bounds.minY, bounds.maxY, 1, false);

    return newY;
  } else if (feature.type === GeomType.POLYGON) {
    const newX: Point[][] = [];
    const newY: Point[][] = [];

    clipLines(feature.geometry, newX, bounds.minX, bounds.maxX, 0, true);
    clipLines(newX, newY, bounds.minY, bounds.maxY, 1, true);

    return newY;
  } else {
    return feature.geometry;
  }
}

function clipPoints(geom: Point[], newGeom: Point[], k1: number, k2: number, axis: number) {
    for (let i = 0; i < geom.length; i += 1) {
        const a = axis === 0 ? geom[i].x : geom[i].y;

        if (a >= k1 && a <= k2) {
            addPoint(newGeom, geom[i].x, geom[i].y);
        }
    }
}

function clipLine(geom: Point[], newGeom: Point[][], k1: number, k2: number, axis: number, isPolygon: boolean) {

    let slice: Point[] = [];
    const intersect = axis === 0 ? intersectX : intersectY;
    let t;

    for (let i = 0; i < geom.length - 1; i += 1) {
        const ax = geom[i].x;
        const ay = geom[i].y;
        const bx = geom[i + 1].x;
        const by = geom[i + 1].y;
        const a = axis === 0 ? ax : ay;
        const b = axis === 0 ? bx : by;
        let exited = false;

        if (a < k1) {
            // ---|-->  | (line enters the clip region from the left)
            if (b > k1) {
                t = intersect(slice, ax, ay, bx, by, k1);
            }
        } else if (a > k2) {
            // |  <--|--- (line enters the clip region from the right)
            if (b < k2) {
                t = intersect(slice, ax, ay, bx, by, k2);
            }
        } else {
            addPoint(slice, ax, ay);
        }
        if (b < k1 && a >= k1) {
            // <--|---  | or <--|-----|--- (line exits the clip region on the left)
            t = intersect(slice, ax, ay, bx, by, k1);
            exited = true;
        }
        if (b > k2 && a <= k2) {
            // |  ---|--> or ---|-----|--> (line exits the clip region on the right)
            t = intersect(slice, ax, ay, bx, by, k2);
            exited = true;
        }

        if (!isPolygon && exited) {
            newGeom.push(slice);
            slice = [];
        }
    }

    // add the last point
    let last = geom.length - 1;
    const ax = geom[last].x;
    const ay = geom[last].y;
    const a = axis === 0 ? ax : ay;
    if (a >= k1 && a <= k2) addPoint(slice, ax, ay);

    // close the polygon if its endpoints are not the same after clipping
    last = slice.length - 1;
    if (isPolygon && last >= 1 && (slice[last].x !== slice[0].x || slice[last].y !== slice[0].x)) {
        addPoint(slice, slice[0].x, slice[0].y);
    }

    // add the final slice
    if (slice.length) {
        newGeom.push(slice);
    }
}

function clipLines(geom: Point[][], newGeom: Point[][], k1: number, k2: number, axis: number, isPolygon: boolean) {
    for (const line of geom) {
        clipLine(line, newGeom, k1, k2, axis, isPolygon);
    }
}

function addPoint(out: Point[], x: number, y: number) {
    out.push({
      x: Math.round(x),
      y: Math.round(y)
    });
}

function intersectX(out: Point[], ax: number, ay: number, bx: number, by: number, x: number) {
    const t = (x - ax) / (bx - ax);
    addPoint(out, x, ay + (by - ay) * t);
    return t;
}

function intersectY(out: Point[], ax: number, ay: number, bx: number, by: number, y: number) {
    const t = (y - ay) / (by - ay);
    addPoint(out, ax + (bx - ax) * t, y);
    return t;
}
