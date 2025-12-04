/**
 * BATCH GEOCODE EVENTS AND CITY GROUPS
 * 
 * This script:
 * 1. Queries events WHERE latitude IS NULL
 * 2. Calls geocoding service for each
 * 3. Updates events with coordinates
 * 4. Also geocodes city groups missing coordinates
 * 5. Logs progress and errors
 * 
 * Usage: npx tsx server/scripts/batchGeocodeEvents.ts
 */

import { db } from "../db";
import { events, groups } from "@shared/schema";
import { isNull, eq, and, or } from "drizzle-orm";
import { geocodingService } from "../services/GeocodingService";

interface BatchResult {
  type: "event" | "group";
  id: number;
  name: string;
  success: boolean;
  lat?: number;
  lng?: number;
  error?: string;
}

async function geocodeEvents(): Promise<BatchResult[]> {
  console.log("\n=== GEOCODING EVENTS ===\n");
  
  const results: BatchResult[] = [];
  
  // Query events with missing latitude
  const eventsToGeocode = await db.query.events.findMany({
    where: or(isNull(events.latitude), eq(events.latitude, "")),
    columns: {
      id: true,
      title: true,
      address: true,
      venue: true,
      venueName: true,
      location: true,
      city: true,
      country: true,
    },
  });

  console.log(`Found ${eventsToGeocode.length} events without coordinates\n`);

  for (let i = 0; i < eventsToGeocode.length; i++) {
    const event = eventsToGeocode[i];
    const progress = `[${i + 1}/${eventsToGeocode.length}]`;
    
    console.log(`${progress} Processing event #${event.id}: "${event.title}"`);
    
    try {
      // Build the best address we can from available fields
      const addressParts = [
        event.address,
        event.venue,
        event.venueName,
        event.location,
      ].filter(Boolean);
      
      const address = addressParts.length > 0 ? addressParts[0] : null;
      
      if (!event.city && !address) {
        console.log(`  → Skipping: No city or address available`);
        results.push({
          type: "event",
          id: event.id,
          name: event.title,
          success: false,
          error: "No city or address available",
        });
        continue;
      }

      // Try geocoding with venue/address first, fall back to city
      let result = null;
      
      if (address) {
        result = await geocodingService.geocodeAddress(
          address as string,
          event.city,
          event.country
        );
      }
      
      if (!result && event.city) {
        console.log(`  → Falling back to city-level geocoding`);
        result = await geocodingService.geocodeCity(
          event.city,
          event.country || undefined
        );
      }

      if (result) {
        // Update the event with coordinates
        await db.update(events)
          .set({
            latitude: result.lat.toString(),
            longitude: result.lng.toString(),
            updatedAt: new Date(),
          })
          .where(eq(events.id, event.id));

        console.log(`  ✓ Geocoded: (${result.lat.toFixed(6)}, ${result.lng.toFixed(6)})`);
        
        results.push({
          type: "event",
          id: event.id,
          name: event.title,
          success: true,
          lat: result.lat,
          lng: result.lng,
        });
      } else {
        console.log(`  ✗ Could not geocode`);
        results.push({
          type: "event",
          id: event.id,
          name: event.title,
          success: false,
          error: "Geocoding returned no results",
        });
      }
    } catch (error: any) {
      console.error(`  ✗ Error: ${error.message}`);
      results.push({
        type: "event",
        id: event.id,
        name: event.title,
        success: false,
        error: error.message,
      });
    }
  }

  return results;
}

async function geocodeCityGroups(): Promise<BatchResult[]> {
  console.log("\n=== GEOCODING CITY GROUPS ===\n");
  
  const results: BatchResult[] = [];
  
  // Query city groups with missing latitude
  const groupsToGeocode = await db.query.groups.findMany({
    where: and(
      eq(groups.type, "city"),
      isNull(groups.latitude)
    ),
    columns: {
      id: true,
      name: true,
      city: true,
      country: true,
    },
  });

  console.log(`Found ${groupsToGeocode.length} city groups without coordinates\n`);

  for (let i = 0; i < groupsToGeocode.length; i++) {
    const group = groupsToGeocode[i];
    const progress = `[${i + 1}/${groupsToGeocode.length}]`;
    
    console.log(`${progress} Processing group #${group.id}: "${group.name}"`);
    
    try {
      // Use city field or extract from name
      const city = group.city || group.name;
      
      if (!city) {
        console.log(`  → Skipping: No city available`);
        results.push({
          type: "group",
          id: group.id,
          name: group.name,
          success: false,
          error: "No city available",
        });
        continue;
      }

      const result = await geocodingService.geocodeCity(
        city,
        group.country || undefined
      );

      if (result) {
        // Update the group with coordinates (numeric type)
        await db.update(groups)
          .set({
            latitude: result.lat.toFixed(7),
            longitude: result.lng.toFixed(7),
            updatedAt: new Date(),
          })
          .where(eq(groups.id, group.id));

        console.log(`  ✓ Geocoded: (${result.lat.toFixed(6)}, ${result.lng.toFixed(6)})`);
        
        results.push({
          type: "group",
          id: group.id,
          name: group.name,
          success: true,
          lat: result.lat,
          lng: result.lng,
        });
      } else {
        console.log(`  ✗ Could not geocode`);
        results.push({
          type: "group",
          id: group.id,
          name: group.name,
          success: false,
          error: "Geocoding returned no results",
        });
      }
    } catch (error: any) {
      console.error(`  ✗ Error: ${error.message}`);
      results.push({
        type: "group",
        id: group.id,
        name: group.name,
        success: false,
        error: error.message,
      });
    }
  }

  return results;
}

async function printSummary(eventResults: BatchResult[], groupResults: BatchResult[]) {
  console.log("\n" + "=".repeat(60));
  console.log("BATCH GEOCODING SUMMARY");
  console.log("=".repeat(60) + "\n");

  // Events summary
  const eventSuccess = eventResults.filter(r => r.success).length;
  const eventFailed = eventResults.filter(r => !r.success).length;
  console.log("EVENTS:");
  console.log(`  Total processed: ${eventResults.length}`);
  console.log(`  Successful:      ${eventSuccess}`);
  console.log(`  Failed:          ${eventFailed}`);

  // Groups summary
  const groupSuccess = groupResults.filter(r => r.success).length;
  const groupFailed = groupResults.filter(r => !r.success).length;
  console.log("\nCITY GROUPS:");
  console.log(`  Total processed: ${groupResults.length}`);
  console.log(`  Successful:      ${groupSuccess}`);
  console.log(`  Failed:          ${groupFailed}`);

  // Cache stats
  const cacheStats = geocodingService.getCacheStats();
  console.log("\nCACHE STATISTICS:");
  console.log(`  Entries:         ${cacheStats.size}`);
  console.log(`  Valid entries:   ${cacheStats.validEntries}`);

  // Print failed items if any
  const allFailed = [...eventResults, ...groupResults].filter(r => !r.success);
  if (allFailed.length > 0) {
    console.log("\nFAILED ITEMS:");
    for (const item of allFailed) {
      console.log(`  - [${item.type}] #${item.id} "${item.name}": ${item.error}`);
    }
  }

  console.log("\n" + "=".repeat(60) + "\n");
}

async function main() {
  console.log("\n" + "=".repeat(60));
  console.log("BATCH GEOCODING SCRIPT");
  console.log("Using OpenStreetMap Nominatim API");
  console.log("Rate limited to 1 request/second");
  console.log("=".repeat(60));

  const startTime = Date.now();

  try {
    // Geocode events
    const eventResults = await geocodeEvents();
    
    // Geocode city groups
    const groupResults = await geocodeCityGroups();
    
    // Print summary
    await printSummary(eventResults, groupResults);

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`Total execution time: ${duration} seconds`);
    console.log("Done!\n");
    
  } catch (error) {
    console.error("\nFATAL ERROR:", error);
    process.exit(1);
  }
}

// Run if called directly
main().catch(console.error);

export { geocodeEvents, geocodeCityGroups };
