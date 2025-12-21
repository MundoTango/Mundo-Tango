/**
 * City Migration Script - CITY_PAGE.md Compliance
 * 
 * MB.MD v9.9.3 Pattern: Research → Plan → Build → Test → Fix → Document
 * 
 * Purpose: Ensure all cities with events have proper city groups following
 * the Buenos Aires template as specified in CITY_PAGE.md
 * 
 * Tasks:
 * 1. Find cities with events but no matching group
 * 2. Create city groups with full CITY_PAGE.md compliance
 * 3. Geocode coordinates using OpenStreetMap Nominatim
 * 4. Update event counts for all city groups
 */

import { db } from "../db";
import { groups, events } from "@shared/schema";
import { eq, sql, isNotNull, and } from "drizzle-orm";

// Utility: Convert city name to slug
function toCitySlug(cityName: string): string {
  return cityName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    + '-tango';
}

// Utility: Generate CITY_PAGE.md compliant description
function generateDescription(city: string, country: string): string {
  return `Discover tango in ${city} in ${country}. Whether you're a local or visiting, explore upcoming events and connect with fellow dancers who share your passion for Argentine tango.`;
}

// Geocode using OpenStreetMap Nominatim (free, no API key needed)
async function geocodeCity(city: string, country: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const query = encodeURIComponent(`${city}, ${country}`);
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`,
      {
        headers: {
          'User-Agent': 'MundoTango/1.0 (tango community platform)'
        }
      }
    );
    
    if (!response.ok) {
      console.warn(`Geocoding failed for ${city}, ${country}: ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
      };
    }
    return null;
  } catch (error) {
    console.warn(`Geocoding error for ${city}, ${country}:`, error);
    return null;
  }
}

// Delay to respect Nominatim rate limits (1 req/sec)
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function migrateCitiesToGroups() {
  console.log('🚀 Starting City Migration to CITY_PAGE.md Compliance...\n');
  
  // Step 1: Find cities with events but no matching group
  console.log('📊 Step 1: Finding cities with events but no city group...');
  
  const citiesWithEvents = await db.select({
    city: events.city,
    country: events.country,
    eventCount: sql<number>`count(*)::int`,
  })
  .from(events)
  .where(isNotNull(events.city))
  .groupBy(events.city, events.country);
  
  console.log(`   Found ${citiesWithEvents.length} unique cities with events`);
  
  // Get existing city groups
  const existingGroups = await db.select({
    id: groups.id,
    city: groups.city,
    slug: groups.slug,
  })
  .from(groups)
  .where(eq(groups.type, 'city'));
  
  console.log(`   Found ${existingGroups.length} existing city groups`);
  
  // Find cities missing groups (case-insensitive match)
  const existingCitiesLower = new Set(
    existingGroups
      .filter(g => g.city)
      .map(g => g.city!.toLowerCase())
  );
  
  const missingCities = citiesWithEvents.filter(
    c => c.city && !existingCitiesLower.has(c.city.toLowerCase())
  );
  
  // Filter out invalid cities
  const validMissingCities = missingCities.filter(c => 
    c.city && 
    c.city !== 'Unknown' && 
    c.city.length > 2 &&
    c.country &&
    c.country.length < 100 // Filter out corrupted country data
  );
  
  console.log(`   ${validMissingCities.length} valid cities need groups created\n`);
  
  // Step 2: Create city groups for missing cities
  console.log('🏙️ Step 2: Creating city groups with CITY_PAGE.md compliance...');
  
  let created = 0;
  let failed = 0;
  
  for (const cityData of validMissingCities) {
    const { city, country, eventCount } = cityData;
    
    if (!city || !country) continue;
    
    try {
      // Check if slug already exists
      const slug = toCitySlug(city);
      const existingSlug = existingGroups.find(g => g.slug === slug);
      
      if (existingSlug) {
        console.log(`   ⚠️ Slug already exists: ${slug}, skipping ${city}`);
        continue;
      }
      
      // Geocode with rate limiting
      console.log(`   📍 Geocoding ${city}, ${country}...`);
      await delay(1100); // Respect Nominatim 1 req/sec limit
      
      const coords = await geocodeCity(city, country);
      
      if (!coords) {
        console.log(`   ⚠️ Could not geocode ${city}, ${country} - creating without coordinates`);
      }
      
      // Create city group following Buenos Aires template
      const newGroup = {
        name: `${city} Tango Community`,
        slug: slug,
        description: generateDescription(city, country),
        type: 'city' as const,
        city: city,
        country: country,
        latitude: coords ? coords.lat.toString() : null,
        longitude: coords ? coords.lng.toString() : null,
        visibility: 'public' as const,
        isPrivate: false,
        joinApproval: true,
        memberCount: 0,
        postCount: 0,
        eventCount: eventCount,
        allowEvents: true,
        allowPosts: true,
        allowDiscussions: true,
        whoCanPost: 'members' as const,
        language: 'en',
      };
      
      await db.insert(groups).values(newGroup);
      created++;
      console.log(`   ✅ Created: ${city} Tango Community (${eventCount} events)`);
      
    } catch (error) {
      failed++;
      console.error(`   ❌ Failed to create ${city}:`, error);
    }
  }
  
  console.log(`\n📊 Step 2 Complete: ${created} created, ${failed} failed\n`);
  
  // Step 3: Update event counts for ALL city groups
  console.log('📈 Step 3: Updating event counts for all city groups...');
  
  const allCityGroups = await db.select({
    id: groups.id,
    city: groups.city,
  })
  .from(groups)
  .where(and(
    eq(groups.type, 'city'),
    isNotNull(groups.city)
  ));
  
  let updated = 0;
  
  for (const group of allCityGroups) {
    if (!group.city) continue;
    
    // Count events for this city
    const cityEvents = await db.select({
      count: sql<number>`count(*)::int`,
    })
    .from(events)
    .where(sql`LOWER(${events.city}) = LOWER(${group.city})`);
    
    const eventCount = cityEvents[0]?.count || 0;
    
    // Update group event count
    await db.update(groups)
      .set({ eventCount, updatedAt: new Date() })
      .where(eq(groups.id, group.id));
    
    updated++;
  }
  
  console.log(`   ✅ Updated event counts for ${updated} city groups\n`);
  
  // Step 4: Enrich existing groups missing coordinates
  console.log('🌍 Step 4: Enriching groups missing coordinates...');
  
  const groupsMissingCoords = await db.select({
    id: groups.id,
    city: groups.city,
    country: groups.country,
  })
  .from(groups)
  .where(and(
    eq(groups.type, 'city'),
    isNotNull(groups.city),
    sql`(${groups.latitude} IS NULL OR ${groups.latitude} = '0')`
  ));
  
  console.log(`   Found ${groupsMissingCoords.length} groups missing coordinates`);
  
  let enriched = 0;
  
  for (const group of groupsMissingCoords.slice(0, 50)) { // Limit to 50 to avoid rate limits
    if (!group.city || !group.country) continue;
    
    await delay(1100);
    const coords = await geocodeCity(group.city, group.country);
    
    if (coords) {
      await db.update(groups)
        .set({ 
          latitude: coords.lat.toString(), 
          longitude: coords.lng.toString(),
          updatedAt: new Date()
        })
        .where(eq(groups.id, group.id));
      
      enriched++;
      console.log(`   📍 Enriched: ${group.city} (${coords.lat}, ${coords.lng})`);
    }
  }
  
  console.log(`   ✅ Enriched ${enriched} groups with coordinates\n`);
  
  // Final summary
  console.log('═══════════════════════════════════════════════════════');
  console.log('🎉 Migration Complete!');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`   ✅ ${created} new city groups created`);
  console.log(`   ✅ ${updated} groups updated with event counts`);
  console.log(`   ✅ ${enriched} groups enriched with coordinates`);
  console.log(`   ❌ ${failed} failures`);
  console.log('═══════════════════════════════════════════════════════');
}

// Run migration
migrateCitiesToGroups()
  .then(() => {
    console.log('\n✅ Migration script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  });
