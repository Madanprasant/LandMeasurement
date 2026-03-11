import * as turf from '@turf/turf';

// Constants for area conversion
const SQM_TO_SQFT = 10.7639;
const SQM_TO_CENTS = 0.0247105;
const SQM_TO_ACRES = 0.000247105;

/**
 * Calculate the distances between sequential points and total area if they form a polygon
 * @param {Array} points Array of {lat, lng} objects 
 * @returns {Object} { areaSqMeters, areaSqFt, areaCents, areaAcres, perimeters }
 */
export function calculateLandMetrics(points) {
  if (!points || points.length < 2) {
    return {
      areaSqMeters: 0,
      areaSqFt: 0,
      areaCents: 0,
      areaAcres: 0,
      perimeters: []
    };
  }

  // Calculate side lengths
  const perimeters = [];
  for (let i = 0; i < points.length; i++) {
    const p1 = points[i];
    // If we have >=3 points, we close the shape and calculate distance from last to first
    const p2 = (i === points.length - 1 && points.length > 2) ? points[0] : points[i + 1];
    
    if (p2) {
      const point1 = turf.point([p1.lng, p1.lat]);
      const point2 = turf.point([p2.lng, p2.lat]);
      const distance = turf.distance(point1, point2, { units: 'meters' });
      perimeters.push({
        segment: `Side ${i + 1}`,
        meters: distance,
        feet: distance * 3.28084
      });
    }
  }

  // Calculate area if polygon is valid (>= 3 points)
  let areaSqMeters = 0;
  if (points.length >= 3) {
    // Turf expects coordinates as [longitude, latitude]
    // First and last point must be identical to form a closed ring
    const coordinates = points.map(p => [p.lng, p.lat]);
    coordinates.push([points[0].lng, points[0].lat]); // close the polygon

    const polygon = turf.polygon([coordinates]);
    areaSqMeters = turf.area(polygon); // area in square meters
  }

  return {
    areaSqMeters,
    areaSqFt: areaSqMeters * SQM_TO_SQFT,
    areaCents: areaSqMeters * SQM_TO_CENTS,
    areaAcres: areaSqMeters * SQM_TO_ACRES,
    perimeters
  };
}
