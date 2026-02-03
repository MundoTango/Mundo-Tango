/**
 * RECREATE ALL CITIES SCRIPT
 * MB.MD Pattern: Bulk city creation from cityImageMap with geocoding
 * 
 * This script:
 * 1. Creates city groups for all cities in our curated list
 * 2. Geocodes each city for proper coordinates
 * 3. Follows CITY_PAGE.md design spec
 */

import { db } from '@shared/db';
import { groups } from '@shared/schema';
import { eq, and, ilike } from 'drizzle-orm';

const CURATED_CITIES: Array<{ city: string; country: string }> = [
  // South America
  { city: "Buenos Aires", country: "Argentina" },
  { city: "Rio de Janeiro", country: "Brazil" },
  { city: "São Paulo", country: "Brazil" },
  { city: "Montevideo", country: "Uruguay" },
  { city: "Bogotá", country: "Colombia" },
  { city: "Lima", country: "Peru" },
  { city: "Santiago", country: "Chile" },
  { city: "Medellín", country: "Colombia" },
  { city: "Puerto Iguazú", country: "Argentina" },
  
  // Europe - Western
  { city: "Paris", country: "France" },
  { city: "London", country: "United Kingdom" },
  { city: "Amsterdam", country: "Netherlands" },
  { city: "Copenhagen", country: "Denmark" },
  
  // Europe - Southern
  { city: "Barcelona", country: "Spain" },
  { city: "Madrid", country: "Spain" },
  { city: "Lisbon", country: "Portugal" },
  { city: "Porto", country: "Portugal" },
  { city: "Rome", country: "Italy" },
  { city: "Venice", country: "Italy" },
  { city: "Florence", country: "Italy" },
  { city: "Milan", country: "Italy" },
  { city: "Valencia", country: "Spain" },
  { city: "Seville", country: "Spain" },
  
  // Europe - Central/Eastern
  { city: "Berlin", country: "Germany" },
  { city: "Vienna", country: "Austria" },
  { city: "Prague", country: "Czech Republic" },
  { city: "Budapest", country: "Hungary" },
  { city: "Warsaw", country: "Poland" },
  { city: "Kraków", country: "Poland" },
  { city: "Bucharest", country: "Romania" },
  { city: "Moscow", country: "Russia" },
  
  // Europe - Germany
  { city: "Munich", country: "Germany" },
  { city: "Hamburg", country: "Germany" },
  { city: "Frankfurt", country: "Germany" },
  { city: "Cologne", country: "Germany" },
  { city: "Karlsruhe", country: "Germany" },
  { city: "Heidelberg", country: "Germany" },
  { city: "Düsseldorf", country: "Germany" },
  { city: "Dresden", country: "Germany" },
  { city: "Bremen", country: "Germany" },
  { city: "Saarbrücken", country: "Germany" },
  { city: "Aschaffenburg", country: "Germany" },
  { city: "Ludwigshafen", country: "Germany" },
  { city: "Wuppertal", country: "Germany" },
  
  // Mediterranean/Middle East
  { city: "Istanbul", country: "Turkey" },
  { city: "Athens", country: "Greece" },
  { city: "Tel Aviv", country: "Israel" },
  { city: "Antalya", country: "Turkey" },
  { city: "Beirut", country: "Lebanon" },
  
  // North America
  { city: "New York", country: "United States" },
  { city: "Los Angeles", country: "United States" },
  { city: "San Francisco", country: "United States" },
  { city: "Chicago", country: "United States" },
  { city: "Miami", country: "United States" },
  { city: "Toronto", country: "Canada" },
  { city: "Mexico City", country: "Mexico" },
  { city: "Cancún", country: "Mexico" },
  { city: "Austin", country: "United States" },
  { city: "Boston", country: "United States" },
  { city: "Portland", country: "United States" },
  { city: "Seattle", country: "United States" },
  { city: "San Diego", country: "United States" },
  { city: "Denver", country: "United States" },
  { city: "San Jose", country: "United States" },
  { city: "Vancouver", country: "Canada" },
  { city: "Victoria", country: "Canada" },
  
  // Asia
  { city: "Tokyo", country: "Japan" },
  { city: "Bangkok", country: "Thailand" },
  { city: "Singapore", country: "Singapore" },
  { city: "Hong Kong", country: "China" },
  { city: "Seoul", country: "South Korea" },
  { city: "Shanghai", country: "China" },
  { city: "Dubai", country: "United Arab Emirates" },
  { city: "Taipei", country: "Taiwan" },
  { city: "Kuala Lumpur", country: "Malaysia" },
  { city: "Da Nang", country: "Vietnam" },
  { city: "Ho Chi Minh City", country: "Vietnam" },
  { city: "Beijing", country: "China" },
  { city: "Busan", country: "South Korea" },
  { city: "Manila", country: "Philippines" },
  
  // Oceania
  { city: "Sydney", country: "Australia" },
  { city: "Melbourne", country: "Australia" },
  { city: "Brisbane", country: "Australia" },
  { city: "Perth", country: "Australia" },
  
  // Nordic/Baltic
  { city: "Riga", country: "Latvia" },
  { city: "Helsinki", country: "Finland" },
  { city: "Stockholm", country: "Sweden" },
  { city: "Oslo", country: "Norway" },
  { city: "Tallinn", country: "Estonia" },
  { city: "Vilnius", country: "Lithuania" },
  { city: "Gothenburg", country: "Sweden" },
  { city: "Malmö", country: "Sweden" },
  
  // Balkans/Eastern Europe
  { city: "Belgrade", country: "Serbia" },
  { city: "Ljubljana", country: "Slovenia" },
  { city: "Sarajevo", country: "Bosnia and Herzegovina" },
  { city: "Timișoara", country: "Romania" },
  { city: "Tbilisi", country: "Georgia" },
  { city: "Thessaloniki", country: "Greece" },
  { city: "Wrocław", country: "Poland" },
  { city: "Łódź", country: "Poland" },
  { city: "Poznań", country: "Poland" },
  { city: "Kyiv", country: "Ukraine" },
  { city: "Cluj-Napoca", country: "Romania" },
  { city: "Brașov", country: "Romania" },
  
  // Spain Additional
  { city: "Bilbao", country: "Spain" },
  { city: "Pamplona", country: "Spain" },
  { city: "Murcia", country: "Spain" },
  { city: "Santiago de Compostela", country: "Spain" },
  { city: "Alicante", country: "Spain" },
  { city: "Málaga", country: "Spain" },
  { city: "Girona", country: "Spain" },
  { city: "Santander", country: "Spain" },
  { city: "Zaragoza", country: "Spain" },
  { city: "Granada", country: "Spain" },
  { city: "Tenerife", country: "Spain" },
  { city: "Las Palmas", country: "Spain" },
  { city: "Benidorm", country: "Spain" },
  
  // Italy Additional
  { city: "Turin", country: "Italy" },
  { city: "Catania", country: "Italy" },
  { city: "Palermo", country: "Italy" },
  { city: "Naples", country: "Italy" },
  { city: "Siena", country: "Italy" },
  { city: "Trieste", country: "Italy" },
  { city: "Ravenna", country: "Italy" },
  { city: "Cagliari", country: "Italy" },
  { city: "Bari", country: "Italy" },
  { city: "Bologna", country: "Italy" },
  { city: "Genoa", country: "Italy" },
  { city: "Verona", country: "Italy" },
  { city: "Rimini", country: "Italy" },
  
  // France Additional
  { city: "Toulouse", country: "France" },
  { city: "Biarritz", country: "France" },
  { city: "Montpellier", country: "France" },
  { city: "Perpignan", country: "France" },
  { city: "Tours", country: "France" },
  
  // Switzerland
  { city: "Zürich", country: "Switzerland" },
  { city: "Geneva", country: "Switzerland" },
  { city: "Lausanne", country: "Switzerland" },
  { city: "Basel", country: "Switzerland" },
  { city: "Salzburg", country: "Austria" },
  
  // Greece Additional
  { city: "Rhodes", country: "Greece" },
  { city: "Crete", country: "Greece" },
  { city: "Chania", country: "Greece" },
  { city: "Patras", country: "Greece" },
  
  // Netherlands
  { city: "Utrecht", country: "Netherlands" },
  { city: "Leiden", country: "Netherlands" },
  
  // Croatia
  { city: "Split", country: "Croatia" },
  { city: "Dubrovnik", country: "Croatia" },
  { city: "Opatija", country: "Croatia" },
  
  // Czechia
  { city: "Brno", country: "Czech Republic" },
  
  // Ireland
  { city: "Dublin", country: "Ireland" },
  
  // Cyprus
  { city: "Limassol", country: "Cyprus" },
  
  // Indonesia
  { city: "Ubud", country: "Indonesia" },
  
  // India
  { city: "Auroville", country: "India" },
  
  // Poland Additional
  { city: "Sopot", country: "Poland" },
  { city: "Zakopane", country: "Poland" },
  { city: "Olsztyn", country: "Poland" },
  { city: "Kielce", country: "Poland" },
  
  // Portugal Additional
  { city: "Oeiras", country: "Portugal" },
  { city: "Portimão", country: "Portugal" },
  
  // Hungary Additional  
  { city: "Székesfehérvár", country: "Hungary" },
  { city: "Siófok", country: "Hungary" },
  
  // Turkey Additional
  { city: "Kuşadası", country: "Turkey" },
  { city: "Nevşehir", country: "Turkey" },
  { city: "Mudanya", country: "Turkey" },
  
  // Kazakhstan
  { city: "Astana", country: "Kazakhstan" },
  
  // Denmark Additional
  { city: "Svendborg", country: "Denmark" },
  
  // Latvia Additional
  { city: "Liepāja", country: "Latvia" },
  
  // Serbia Additional
  { city: "Kraljevo", country: "Serbia" },
  
  // Montenegro
  { city: "Kolašin", country: "Montenegro" },
];

async function geocodeCity(city: string, country: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const { geocodingService } = await import('../services/domains/location/GeocodingService');
    return await geocodingService.geocodeCity(city, country);
  } catch (error) {
    console.warn(`[Geocode] Failed for ${city}, ${country}:`, error);
    return null;
  }
}

async function createCityGroup(city: string, country: string): Promise<boolean> {
  try {
    // Check if already exists
    const [existing] = await db
      .select({ id: groups.id })
      .from(groups)
      .where(and(
        eq(groups.type, 'city'),
        ilike(groups.city, city)
      ))
      .limit(1);

    if (existing) {
      console.log(`[Skip] ${city} already exists`);
      return false;
    }

    // Generate slug
    const slug = city.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      + '-tango';

    // Geocode
    const coords = await geocodeCity(city, country);
    const latitude = coords ? String(coords.lat) : null;
    const longitude = coords ? String(coords.lng) : null;

    // Create city group
    await db.insert(groups).values({
      name: `${city} Tango Community`,
      slug,
      city,
      country,
      type: 'city',
      visibility: 'public',
      description: `Discover tango in ${city} in ${country}. Whether you're a local or visiting, explore upcoming events and connect with fellow dancers who share your passion for Argentine tango.`,
      latitude,
      longitude,
      isActive: true,
    });

    console.log(`[Created] ${city}, ${country} (${latitude || 'no coords'})`);
    return true;
  } catch (error: any) {
    console.error(`[Error] ${city}:`, error.message);
    return false;
  }
}

async function main() {
  console.log('========================================');
  console.log('RECREATE ALL CITIES - MB.MD Pattern');
  console.log('========================================\n');
  
  let created = 0;
  let skipped = 0;
  let failed = 0;
  
  for (const { city, country } of CURATED_CITIES) {
    const result = await createCityGroup(city, country);
    if (result) {
      created++;
    } else {
      skipped++;
    }
    
    // Rate limit for geocoding API
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n========================================');
  console.log(`COMPLETE: ${created} created, ${skipped} skipped, ${failed} failed`);
  console.log('========================================');
  
  // Verify count
  const [count] = await db
    .select({ count: groups.id })
    .from(groups)
    .where(eq(groups.type, 'city'));
  
  console.log(`\nTotal city groups in database: ${count?.count || 0}`);
}

main().catch(console.error);
