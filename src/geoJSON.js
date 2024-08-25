export function parseGeoJSONOptimized(geojson) {
    const parsedData = {
        points: [],
        lines: [],
        polygons: [],
        multiPoints: [],
        multiLines: [],
        multiPolygons: []
    };

    // 批量处理
    geojson.features.forEach(feature => {
        const { type, coordinates } = feature.geometry;
        const properties = feature.properties;
        
        const targetArray = parsedData[getArrayName(type)];
        targetArray.push({ coordinates, properties });
    });

    return parsedData;
}

async function loadGeoJSONData(url) {
    try {
        const response = await fetch(url);
        const geojsonData = await response.json();
        return geojsonData;
    } catch (error) {
        console.error("Error loading GeoJSON data:", error);
        return null;
    }
}

export async function processGeoJSONData(url) {
    const geojsonData = await loadGeoJSONData(url);
    if (geojsonData) {
        const parsedResult = parseGeoJSONOptimized(geojsonData);
        return parsedResult;
    }
    return null;
}


// 辅助函数，根据几何类型返回对应的数组名称
function getArrayName(geometryType) {
    switch (geometryType) {
        case "Point": return "points";
        case "LineString": return "lines";
        case "Polygon": return "polygons";
        case "MultiPoint": return "multiPoints";
        case "MultiLineString": return "multiLines";
        case "MultiPolygon": return "multiPolygons";
        default: return null;
    }
}
