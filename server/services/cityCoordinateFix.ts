/**
 * City Coordinate Auto-Fix Service
 * 
 * MB.MD v9.9.3: Self-healing service that runs on server startup
 * to fix cities with missing or NULL coordinates.
 * 
 * This ensures production database has valid coordinates for all cities
 * by using OpenStreetMap Nominatim geocoding.
 */

import { db } from '../db';
import { cities } from '@shared/schema';
import { eq, isNull, or } from 'drizzle-orm';
import { geocodingService } from "./GeocodingService";

interface CityWithMissingCoords {
  id: number;
  name: string;
  country: string | null;
  slug: string;
}

// Rate limit delay between geocoding requests (Nominatim policy: 1 req/sec)
const GEOCODE_DELAY_MS = 1100;

/**
 * Sleep helper for rate limiting
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Initialize city coordinate fixes on server startup
 * Runs once to ensure all cities have valid coordinates
 */
export async function initCityCoordinateFix(): Promise<void> {
  console.log('🌍 [CityCoordinateFix] Checking cities with missing coordinates...');
  
  try {
    // Find all cities with NULL coordinates (latitude/longitude are numeric types)
    const citiesWithMissingCoords = await db
      .select({
        id: cities.id,
        name: cities.name,
        country: cities.country,
        slug: cities.slug,
      })
      .from(cities)
      .where(
        or(
          isNull(cities.latitude),
          isNull(cities.longitude)
        )
      )
      .limit(50); // Process up to 50 cities per startup to avoid long delays
    
    if (citiesWithMissingCoords.length === 0) {
      console.log('🌍 [CityCoordinateFix] ✅ All cities have valid coordinates');
      return;
    }
    
    console.log(`🌍 [CityCoordinateFix] Found ${citiesWithMissingCoords.length} cities with missing coordinates`);
    
    let fixedCount = 0;
    let failedCount = 0;
    
    for (const city of citiesWithMissingCoords) {
      try {
        // Use the existing geocoding service (OpenStreetMap Nominatim)
        const searchQuery = city.country 
          ? `${city.name}, ${city.country}`
          : city.name;
        
        console.log(`   📍 Geocoding: ${searchQuery}...`);
        
        const geoResult = await geocodingService.geocodeAddress(null, city.name, city.country);
        
        if (geoResult && geoResult.lat && geoResult.lng) {
          // Update the city with the geocoded coordinates
          await db
            .update(cities)
            .set({
              latitude: geoResult.lat.toString(),
              longitude: geoResult.lng.toString()
            })
            .where(eq(cities.id, city.id));
          
          console.log(`   ✅ Fixed: ${city.name} → (${geoResult.lat}, ${geoResult.lng})`);
          fixedCount++;
        } else {
          console.log(`   ⚠️ Could not geocode: ${city.name}`);
          failedCount++;
        }
        
        // Rate limit to respect Nominatim's 1 request/second policy
        await sleep(GEOCODE_DELAY_MS);
        
      } catch (error: any) {
        console.error(`   ❌ Error geocoding ${city.name}: ${error.message}`);
        failedCount++;
        // Continue with next city
        await sleep(GEOCODE_DELAY_MS);
      }
    }
    
    // Summary
    console.log(`🌍 [CityCoordinateFix] Completed: ${fixedCount} fixed, ${failedCount} failed`);
    
    // Check if there are more cities to fix on next restart
    const remainingCities = await db
      .select({ id: cities.id })
      .from(cities)
      .where(
        or(
          isNull(cities.latitude),
          isNull(cities.longitude)
        )
      );
    
    if (remainingCities.length > 0) {
      console.log(`🌍 [CityCoordinateFix] ${remainingCities.length} cities still need coordinates (will fix on next restart)`);
    }
    
  } catch (error) {
    console.error('❌ [CityCoordinateFix] Error fixing city coordinates:', error);
  }
}
