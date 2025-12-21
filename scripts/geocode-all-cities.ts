/**
 * BULK CITY GEOCODING SCRIPT
 * Geocodes all city groups with NULL coordinates using Nominatim API
 * 
 * Usage: npx tsx scripts/geocode-all-cities.ts
 * 
 * Rate limited to 1 request/second to comply with Nominatim usage policy.
 * Total runtime: ~4 minutes for 200 cities.
 */

import { db } from '../shared/db';
import { groups } from '../shared/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { geocodingService } from '../server/services/GeocodingService';

async function geocodeAllCities() {
  console.log('\n=== BULK CITY GEOCODING ===\n');
  
  // Find all city groups with NULL coordinates
  const citiesWithoutCoords = await db
    .select({
      id: groups.id,
      city: groups.city,
      country: groups.country,
      name: groups.name
    })
    .from(groups)
    .where(and(
      eq(groups.type, 'city'),
      isNull(groups.latitude)
    ));

  console.log(`Found ${citiesWithoutCoords.length} cities without coordinates\n`);

  if (citiesWithoutCoords.length === 0) {
    console.log('All cities already have coordinates!');
    process.exit(0);
  }

  let geocoded = 0;
  let failed = 0;
  const startTime = Date.now();

  for (let i = 0; i < citiesWithoutCoords.length; i++) {
    const cityGroup = citiesWithoutCoords[i];
    const cityName = cityGroup.city || cityGroup.name?.replace(' Tango Community', '');
    const country = cityGroup.country;

    if (!cityName) {
      console.log(`[${i + 1}/${citiesWithoutCoords.length}] ✗ ${cityGroup.name} - No city name`);
      failed++;
      continue;
    }

    try {
      const result = await geocodingService.geocodeCity(cityName, country || undefined);

      if (result) {
        // Update the city group with coordinates
        await db.update(groups)
          .set({
            latitude: String(result.lat),
            longitude: String(result.lng),
            updatedAt: new Date()
          })
          .where(eq(groups.id, cityGroup.id));

        geocoded++;
        console.log(`[${i + 1}/${citiesWithoutCoords.length}] ✓ ${cityName}, ${country} → (${result.lat.toFixed(4)}, ${result.lng.toFixed(4)})`);
      } else {
        failed++;
        console.log(`[${i + 1}/${citiesWithoutCoords.length}] ✗ ${cityName}, ${country} → No result`);
      }
    } catch (error: any) {
      failed++;
      console.log(`[${i + 1}/${citiesWithoutCoords.length}] ✗ ${cityName}, ${country} → Error: ${error.message}`);
    }
  }

  const duration = Math.round((Date.now() - startTime) / 1000);
  
  console.log('\n=== GEOCODING COMPLETE ===');
  console.log(`Total:     ${citiesWithoutCoords.length} cities`);
  console.log(`Geocoded:  ${geocoded}`);
  console.log(`Failed:    ${failed}`);
  console.log(`Duration:  ${Math.floor(duration / 60)}m ${duration % 60}s`);
  console.log(`Success:   ${Math.round((geocoded / citiesWithoutCoords.length) * 100)}%\n`);

  process.exit(0);
}

geocodeAllCities().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
