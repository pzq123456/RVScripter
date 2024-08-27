/**
 * @see https://learn.microsoft.com/en-us/bingmaps/articles/bing-maps-tile-system
 */

const EarthRadius = 6378137;
const MinLatitude = -85.05112878;
const MaxLatitude = 85.05112878;
const MinLongitude = -180;
const MaxLongitude = 180;

/**
 * Clips a number to the specified minimum and maximum values.
 */
function Clip(n, minValue, maxValue) {
    return Math.min(Math.max(n, minValue), maxValue);
}

/**
 * Determines the map width and height (in pixels) at a specified level of detail.
 */
function MapSize(levelOfDetail) {
    return 256 << levelOfDetail;
}

/**
 * Determines the ground resolution (in meters per pixel) at a specified latitude and level of detail.
 */
function GroundResolution(latitude, levelOfDetail) {
    latitude = Clip(latitude, MinLatitude, MaxLatitude);
    return Math.cos(latitude * Math.PI / 180) * 2 * Math.PI * EarthRadius / MapSize(levelOfDetail);
}


/**
 * Determines the ground resolution (in degrees per pixel) at a specified latitude and level of detail.
 */
export function GroundResolutionInDegrees(latitude, levelOfDetail) {
    latitude = Clip(latitude, MinLatitude, MaxLatitude);
    
    // Original meters per pixel resolution
    var metersPerPixel = Math.cos(latitude * Math.PI / 180) * 2 * Math.PI * EarthRadius / MapSize(levelOfDetail);
    
    // Convert to degrees per pixel
    var metersPerDegree = 111320 * Math.cos(latitude * Math.PI / 180);
    return metersPerPixel / metersPerDegree;
}


/**
 * Determines the map scale at a specified latitude, level of detail, and screen resolution.
 * @param {number} latitude Latitude (in degrees) at which to measure the map scale.
 * @param {number} levelOfDetail Level of detail, from 1 (lowest detail) to 23 (highest detail).
 * @param {number} screenDpi Resolution of the screen, in dots per inch.
 * @returns The map scale, expressed as the denominator N of the ratio 1 : N.
 */
function MapScale(latitude, levelOfDetail, screenDpi) {
    return GroundResolution(latitude, levelOfDetail) * screenDpi / 0.0254;
}

/**
 * Converts a point from latitude/longitude WGS-84 coordinates (in degrees) into pixel XY coordinates at a specified level of detail.
 * @param {number} latitude Latitude of the point, in degrees.
 * @param {number} longitude Longitude of the point, in degrees.
 * @param {number} levelOfDetail Level of detail, from 1 (lowest detail) to 23 (highest detail).
 * @returns The pixel XY coordinates.
 */
export function LatLongToPixelXY(latitude, longitude, levelOfDetail) {
    latitude = Clip(latitude, MinLatitude, MaxLatitude);
    longitude = Clip(longitude, MinLongitude, MaxLongitude);

    let x = (longitude + 180) / 360;
    let sinLatitude = Math.sin(latitude * Math.PI / 180);
    let y = 0.5 - Math.log((1 + sinLatitude) / (1 - sinLatitude)) / (4 * Math.PI);

    let mapSize = MapSize(levelOfDetail);
    return [
        Clip(x * mapSize + 0.5, 0, mapSize - 1),
        Clip(y * mapSize + 0.5, 0, mapSize - 1)
    ];
}

/**
 * Converts a pixel from pixel XY coordinates at a specified level of detail into latitude/longitude WGS-84 coordinates (in degrees).
 * @param {number} pixelX X coordinate of the point, in pixels.
 * @param {number} pixelY Y coordinates of the point, in pixels.
 * @param {number} levelOfDetail Level of detail, from 1 (lowest detail) to 23 (highest detail).
 * @returns The latitude and longitude in degrees.
 */
export function PixelXYToLatLong(pixelX, pixelY, levelOfDetail) {
    let mapSize = MapSize(levelOfDetail);
    let x = (Clip(pixelX, 0, mapSize - 1) / mapSize) - 0.5;
    let y = 0.5 - (Clip(pixelY, 0, mapSize - 1) / mapSize);

    let latitude = 90 - 360 * Math.atan(Math.exp(-y * 2 * Math.PI)) / Math.PI;
    let longitude = 360 * x;
    return [latitude, longitude];
    // return [0,0]
}

/*
* Converts pixel XY coordinates into tile XY coordinates of the tile containing the specified pixel.
*/
function PixelXYToTileXY(pixelX, pixelY) {
    return [pixelX / 256, pixelY / 256];
}

function TileXYToPixelXY(tileX, tileY) {
    return [tileX * 256, tileY * 256];
}

/**
 * Converts tile XY coordinates into a QuadKey at a specified level of detail.
 * @param {number} tileX Tile X coordinate.
 * @param {number} tileY Tile Y coordinate.
 * @param {number} levelOfDetail Level of detail, from 1 (lowest detail) to 23 (highest detail).
 * @returns A string containing the QuadKey.
 * @see https://docs.microsoft.com/en-us/bingmaps/articles/bing-maps-tile-system
 */
function TileXYToQuadKey(tileX, tileY, levelOfDetail) {
    let quadKey = "";
    for (let i = levelOfDetail; i > 0; i--) {
        let digit = '0';
        let mask = 1 << (i - 1);
        if ((tileX & mask) !== 0) {
            digit++;
        }
        if ((tileY & mask) !== 0) {
            digit++;
            digit++;
        }
        quadKey += digit;
    }
    return quadKey;
}

function QuadKeyToTileXY(quadKey) {
    let tileX = 0;
    let tileY = 0;
    let levelOfDetail = quadKey.length;
    for (let i = levelOfDetail; i > 0; i--) {
        let mask = 1 << (i - 1);
        switch (quadKey[levelOfDetail - i]) {
            case '0':
                break;
            case '1':
                tileX |= mask;
                break;
            case '2':
                tileY |= mask;
                break;
            case '3':
                tileX |= mask;
                tileY |= mask;
                break;
            default:
                throw new Error("Invalid QuadKey digit sequence.");
        }
    }
    return [tileX, tileY];
}