/**
 * A26: Location Proximity Agent
 * 
 * Calculates geographic distances, filters by radius,
 * and ranks results by proximity
 */

export interface ProximityResult {
  id: number;
  distance: number; // in kilometers
  score: number; // 0-1 proximity score
}

export interface GeoLocation {
  latitude: number;
  longitude: number;
}

export interface GeoEntity extends GeoLocation {
  id: number;
  [key: string]: any;
}

/**
 * Calculate Haversine distance between two coordinates
 * Returns distance in kilometers
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return R * c;
}

/**
 * Calculate proximity score (0-1)
 * Score decreases with distance
 */
export function calculateProximityScore(
  distance: number,
  maxDistance: number = 100
): number {
  if (distance >= maxDistance) return 0;
  
  // Linear decay from 1.0 at 0km to 0 at maxDistance
  return 1 - (distance / maxDistance);
}

/**
 * Find entities within radius
 */
export function findWithinRadius<T extends GeoEntity>(
  center: GeoLocation,
  entities: T[],
  radiusKm: number
): Array<T & { distance: number }> {
  const results: Array<T & { distance: number }> = [];
  
  for (const entity of entities) {
    const distance = calculateHaversineDistance(
      center.latitude,
      center.longitude,
      entity.latitude,
      entity.longitude
    );
    
    if (distance <= radiusKm) {
      results.push({
        ...entity,
        distance
      });
    }
  }
  
  // Sort by distance ascending
  results.sort((a, b) => a.distance - b.distance);
  
  return results;
}

/**
 * Rank entities by proximity
 */
export function rankByProximity<T extends GeoEntity>(
  center: GeoLocation,
  entities: T[],
  options: {
    maxDistance?: number;
    limit?: number;
    includeScore?: boolean;
  } = {}
): ProximityResult[] {
  const {
    maxDistance = 100,
    limit = 50,
    includeScore = true
  } = options;
  
  const results: ProximityResult[] = [];
  
  for (const entity of entities) {
    const distance = calculateHaversineDistance(
      center.latitude,
      center.longitude,
      entity.latitude,
      entity.longitude
    );
    
    if (distance > maxDistance) continue;
    
    const score = includeScore 
      ? calculateProximityScore(distance, maxDistance)
      : 1.0;
    
    results.push({
      id: entity.id,
      distance,
      score
    });
  }
  
  // Sort by distance ascending
  results.sort((a, b) => a.distance - b.distance);
  
  // Apply limit
  return results.slice(0, limit);
}

/**
 * Find nearest entities
 */
export function findNearest<T extends GeoEntity>(
  center: GeoLocation,
  entities: T[],
  count: number = 5
): Array<T & { distance: number }> {
  const withDistances = entities.map(entity => ({
    ...entity,
    distance: calculateHaversineDistance(
      center.latitude,
      center.longitude,
      entity.latitude,
      entity.longitude
    )
  }));
  
  // Sort by distance ascending
  withDistances.sort((a, b) => a.distance - b.distance);
  
  return withDistances.slice(0, count);
}

/**
 * Group entities by distance ranges
 */
export function groupByDistanceRanges<T extends GeoEntity>(
  center: GeoLocation,
  entities: T[],
  ranges: number[] = [5, 10, 25, 50, 100]
): Map<string, Array<T & { distance: number }>> {
  const groups = new Map<string, Array<T & { distance: number }>>();
  
  // Initialize groups
  for (let i = 0; i < ranges.length; i++) {
    const min = i === 0 ? 0 : ranges[i - 1];
    const max = ranges[i];
    groups.set(`${min}-${max}km`, []);
  }
  groups.set(`${ranges[ranges.length - 1]}km+`, []);
  
  // Categorize entities
  for (const entity of entities) {
    const distance = calculateHaversineDistance(
      center.latitude,
      center.longitude,
      entity.latitude,
      entity.longitude
    );
    
    const entityWithDistance = { ...entity, distance };
    
    let added = false;
    for (let i = 0; i < ranges.length; i++) {
      const min = i === 0 ? 0 : ranges[i - 1];
      const max = ranges[i];
      
      if (distance >= min && distance < max) {
        const key = `${min}-${max}km`;
        groups.get(key)!.push(entityWithDistance);
        added = true;
        break;
      }
    }
    
    if (!added) {
      groups.get(`${ranges[ranges.length - 1]}km+`)!.push(entityWithDistance);
    }
  }
  
  return groups;
}

/**
 * Calculate bounding box for radius search
 * Useful for database queries
 */
export function getBoundingBox(
  center: GeoLocation,
  radiusKm: number
): {
  minLat: number;
  maxLat: number;
  minLon: number;
  maxLon: number;
} {
  const R = 6371; // Earth's radius in km
  const lat = center.latitude * Math.PI / 180;
  const lon = center.longitude * Math.PI / 180;
  
  // Calculate latitude offset
  const latOffset = (radiusKm / R) * (180 / Math.PI);
  
  // Calculate longitude offset (adjusted for latitude)
  const lonOffset = (radiusKm / R) * (180 / Math.PI) / Math.cos(lat);
  
  return {
    minLat: center.latitude - latOffset,
    maxLat: center.latitude + latOffset,
    minLon: center.longitude - lonOffset,
    maxLon: center.longitude + lonOffset
  };
}
