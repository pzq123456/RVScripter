/*
 * Spherical Mercator projection — the most common projection for online maps,
 * used by almost all free and commercial tile providers. Assumes that Earth is
 * a sphere. Used by the `EPSG:3857` CRS.
 */

const A = 6378137.0;
const MAXEXTENT = 20037508.342789244;
const MAXLAT = 85.05112877980659;

/**
 * Convert lon/lat values to 900913 x/y.
 * - EPSG:3857 = EPSG:900913 (@link https://epsg.io/900913)
 * @param {Array} lonlat `[lon, lat]` array of geographic coordinates.
 * @returns {Array} `[x, y]` array of geographic coordinates.
 */
export function project(lonlat){
    let d = Math.PI / 180,
        max = MAXLAT,
        lat = Math.max(Math.min(max, lonlat[1]), -max),
        sin = Math.sin(lat * d);

    let x = A * lonlat[0] * d;
    let y = A * Math.log((1 + sin) / (1 - sin)) / 2;
    // see: https://en.wikipedia.org/wiki/Mercator_projection

    if (y > MAXEXTENT) y = MAXEXTENT;
    if (y < -MAXEXTENT) y = -MAXEXTENT;
    if (x > MAXEXTENT) x = MAXEXTENT;
    if (x < -MAXEXTENT) x = -MAXEXTENT;

    return [x, y];
}

/**
 * Convert 900913 x/y values to lon/lat.
 * - EPSG:3857 = EPSG:900913 (@link https://epsg.io/900913)
 * @param {Array} point `[x, y]` array of geographic coordinates.
 * @returns {Array} `[lon, lat]` array of geographic coordinates.
 */
export function unproject(point) {
    let d = 180 / Math.PI;
    return [point[0] * d / A, (2 * Math.atan(Math.exp(point[1] / A)) - Math.PI / 2) * d];
}