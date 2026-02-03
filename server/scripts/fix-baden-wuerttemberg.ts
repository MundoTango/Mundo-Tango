/**
 * Fix Baden-Württemberg Events - Extract actual cities from titles
 * 
 * The Rhein-Neckar Tango source stores events with "Baden-Württemberg" as city
 * but the actual city is mentioned in the title (e.g., "Milonga in Heidelberg")
 * 
 * Usage: npx dotenv -e .env -- tsx server/scripts/fix-baden-wuerttemberg.ts
 */

import { db } from '@shared/db';
import { events } from '@shared/schema';
import { eq, sql } from 'drizzle-orm';

// German cities in Baden-Württemberg region
const BADEN_WUERTTEMBERG_CITIES = [
  'Heidelberg',
  'Mannheim',
  'Stuttgart',
  'Karlsruhe',
  'Freiburg',
  'Ulm',
  'Heilbronn',
  'Pforzheim',
  'Reutlingen',
  'Tübingen',
  'Konstanz',
  'Ludwigsburg',
  'Esslingen',
  'Schwetzingen',
  'Weinheim',
  'Wiesloch',
  'Neckarau',
  'Kirchheim',
  'Leimen',
  'Schriesheim',
  'Ladenburg',
  'Sandhausen',
  'Eppelheim',
  'Dossenheim',
  'Hirschberg',
  'Heddesheim',
  'Sinsheim',
  'Schwäbisch Gmünd',
  'Lörrach',
  'Baden-Baden',
  'Offenburg',
  'Rastatt',
  'Bruchsal',
  'Waiblingen',
  'Göppingen',
  'Aalen',
  'Sindelfingen',
  'Böblingen',
  'Balingen',
  'Villingen-Schwenningen',
  'Rottweil',
  'Tuttlingen',
  'Friedrichshafen',
  'Ravensburg',
];

function extractCity(title: string): string | null {
  const normalizedTitle = title.toLowerCase();
  
  for (const city of BADEN_WUERTTEMBERG_CITIES) {
    if (normalizedTitle.includes(city.toLowerCase())) {
      return city;
    }
  }
  
  // Check for variations like "in Mannheim Neckarau"
  const inPattern = /\bin\s+([A-ZÄÖÜ][a-zäöüß]+(?:\s+[A-ZÄÖÜ][a-zäöüß]+)?)/g;
  const match = inPattern.exec(title);
  if (match) {
    const potentialCity = match[1];
    for (const city of BADEN_WUERTTEMBERG_CITIES) {
      if (potentialCity.includes(city) || city.includes(potentialCity)) {
        return city;
      }
    }
  }
  
  return null;
}

async function main() {
  console.log('='.repeat(60));
  console.log('FIX BADEN-WÜRTTEMBERG EVENTS');
  console.log('='.repeat(60));
  
  // Get all Baden-Württemberg events
  const bwEvents = await db.execute(sql`
    SELECT id, title, city 
    FROM events 
    WHERE city = 'Baden-Württemberg'
  `);
  
  console.log(`Found ${bwEvents.rows?.length} events in Baden-Württemberg`);
  
  let updated = 0;
  let notFound = 0;
  const cityCounts: Record<string, number> = {};
  
  for (const event of bwEvents.rows || []) {
    const e = event as { id: number; title: string; city: string };
    const extractedCity = extractCity(e.title);
    
    if (extractedCity) {
      cityCounts[extractedCity] = (cityCounts[extractedCity] || 0) + 1;
      
      // Update the event
      await db.update(events)
        .set({ city: extractedCity })
        .where(eq(events.id, e.id));
      
      updated++;
    } else {
      notFound++;
      // Log events we couldn't fix (sample)
      if (notFound <= 10) {
        console.log(`  Could not extract city: "${e.title}"`);
      }
    }
  }
  
  console.log('\n📊 Results:');
  console.log(`  Updated: ${updated}`);
  console.log(`  Could not fix: ${notFound}`);
  
  console.log('\n🏙️ Cities extracted:');
  Object.entries(cityCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([city, count]) => console.log(`  ${city}: ${count}`));
  
  // Set remaining to "Mannheim" as default (main city in Rhein-Neckar region)
  if (notFound > 0) {
    console.log(`\n⚠️ Setting remaining ${notFound} events to "Mannheim" as default`);
    await db.execute(sql`
      UPDATE events SET city = 'Mannheim' WHERE city = 'Baden-Württemberg'
    `);
  }
  
  console.log('\n✅ Done!');
  process.exit(0);
}

main().catch(console.error);
