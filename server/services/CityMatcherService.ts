/**
 * CITY MATCHER SERVICE
 * MB.MD Implementation
 * 
 * Matches event locations to existing city groups in the database.
 * Uses fuzzy matching and geocoding to handle address variations.
 * 
 * Flow:
 * 1. Parse location string to extract city name
 * 2. Fuzzy match against existing city groups
 * 3. If no match, use geocoding to find coordinates
 * 4. Match coordinates to nearest city group
 * 5. Return groupId or null if genuinely new city
 */

import { db } from '@shared/db';
import { groups } from '@shared/schema';
import { geocodingService } from './GeocodingService';
import { sql } from 'drizzle-orm';

export interface CityMatch {
  groupId: number;
  cityName: string;
  confidence: number;
  method: 'exact' | 'fuzzy' | 'geocoded';
}

export interface ParsedLocation {
  venueName?: string;
  address?: string;
  city?: string;
  country?: string;
}

class CityMatcherService {
  private cityGroupCache: Map<string, CityMatch> = new Map();

  /**
   * Parse a location string into components
   * Handles formats like:
   * - "Venue Name, City, Country"
   * - "Address, City"
   * - "City, Country"
   */
  parseLocation(locationString: string): ParsedLocation {
    if (!locationString) return {};

    const parts = locationString.split(',').map(p => p.trim());
    
    if (parts.length === 1) {
      return { city: parts[0] };
    } else if (parts.length === 2) {
      return { 
        address: parts[0],
        city: parts[1] 
      };
    } else if (parts.length >= 3) {
      // Assume: Venue, City, Country OR Address, City, Country
      return {
        venueName: parts[0],
        city: parts[parts.length - 2],
        country: parts[parts.length - 1]
      };
    }

    return {};
  }

  /**
   * Calculate string similarity using Levenshtein distance
   */
  private calculateSimilarity(str1: string, str2: string): number {
    const s1 = str1.toLowerCase();
    const s2 = str2.toLowerCase();
    
    if (s1 === s2) return 1.0;
    
    const longer = s1.length > s2.length ? s1 : s2;
    const shorter = s1.length > s2.length ? s2 : s1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = this.levenshteinDistance(s1, s2);
    return (longer.length - editDistance) / longer.length;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  /**
   * Find existing city group by name with fuzzy matching
   */
  async findCityGroup(cityName: string): Promise<CityMatch | null> {
    if (!cityName) return null;

    // Check cache
    const cacheKey = cityName.toLowerCase().trim();
    if (this.cityGroupCache.has(cacheKey)) {
      return this.cityGroupCache.get(cacheKey)!;
    }

    // Fetch all city groups
    const allGroups = await db.query.groups.findMany({
      where: sql`${groups.type} = 'city'`,
      columns: {
        id: true,
        name: true,
        city: true,
      }
    });

    // Try exact match first
    const exactMatch = allGroups.find(
      g => g.city?.toLowerCase() === cacheKey || g.name.toLowerCase() === cacheKey
    );

    if (exactMatch) {
      const match: CityMatch = {
        groupId: exactMatch.id,
        cityName: exactMatch.city || exactMatch.name,
        confidence: 1.0,
        method: 'exact'
      };
      this.cityGroupCache.set(cacheKey, match);
      return match;
    }

    // Fuzzy matching
    let bestMatch: CityMatch | null = null;
    let bestScore = 0;

    for (const group of allGroups) {
      const cityToMatch = group.city || group.name;
      const similarity = this.calculateSimilarity(cityName, cityToMatch);

      if (similarity > 0.8 && similarity > bestScore) {
        bestScore = similarity;
        bestMatch = {
          groupId: group.id,
          cityName: cityToMatch,
          confidence: similarity,
          method: 'fuzzy'
        };
      }
    }

    if (bestMatch) {
      this.cityGroupCache.set(cacheKey, bestMatch);
      console.log(`[CityMatcher] Fuzzy matched "${cityName}" to "${bestMatch.cityName}" (${bestMatch.confidence.toFixed(2)})`);
      return bestMatch;
    }

    return null;
  }

  /**
   * Match event location to existing city group
   * Returns groupId if found, null if new city
   */
  async matchEventLocation(locationString: string): Promise<number | null> {
    if (!locationString) return null;

    console.log(`[CityMatcher] Matching location: "${locationString}"`);

    // Step 1: Parse location
    const parsed = this.parseLocation(locationString);
    
    if (!parsed.city) {
      console.log('[CityMatcher] No city found in location');
      return null;
    }

    // Step 2: Try to find existing city group
    const cityMatch = await this.findCityGroup(parsed.city);
    
    if (cityMatch && cityMatch.confidence >= 0.85) {
      console.log(`[CityMatcher] Matched to city group ${cityMatch.groupId}: ${cityMatch.cityName}`);
      return cityMatch.groupId;
    }

    // Step 3: Use geocoding as fallback
    console.log(`[CityMatcher] No direct match, trying geocoding...`);
    const geoResult = await geocodingService.geocodeCity(parsed.city, parsed.country);
    
    if (geoResult) {
      // Find nearest city group by coordinates
      const nearestCity = await this.findNearestCityGroup(geoResult.lat, geoResult.lng);
      if (nearestCity) {
        console.log(`[CityMatcher] Geocoded and matched to ${nearestCity.cityName}`);
        return nearestCity.groupId;
      }
    }

    // Step 4: No match found - this is genuinely a new city
    console.log(`[CityMatcher] No match found for "${parsed.city}" - new city detected`);
    return null;
  }

  /**
   * Find nearest city group by coordinates (within 50km radius)
   */
  private async findNearestCityGroup(lat: number, lng: number): Promise<CityMatch | null> {
    const allGroups = await db.query.groups.findMany({
      where: sql`${groups.type} = 'city' AND ${groups.latitude} IS NOT NULL`,
      columns: {
        id: true,
        name: true,
        city: true,
        latitude: true,
        longitude: true,
      }
    });

    let nearestGroup: CityMatch | null = null;
    let minDistance = 50; // 50km threshold

    for (const group of allGroups) {
      if (!group.latitude || !group.longitude) continue;

      const distance = this.calculateDistance(
        lat, lng,
        group.latitude, group.longitude
      );

      if (distance < minDistance) {
        minDistance = distance;
        nearestGroup = {
          groupId: group.id,
          cityName: group.city || group.name,
          confidence: 1 - (distance / 50), // Confidence decreases with distance
          method: 'geocoded'
        };
      }
    }

    return nearestGroup;
  }

  /**
   * Calculate distance between two coordinates in kilometers
   * Uses Haversine formula
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Clear cache (for testing)
   */
  clearCache(): void {
    this.cityGroupCache.clear();
    console.log('[CityMatcher] Cache cleared');
  }
}

export const cityMatcherService = new CityMatcherService();
