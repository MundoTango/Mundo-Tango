/**
 * SEED SAMPLE EVENTS FOR TESTING
 * MB.MD Pattern: Create realistic sample events for major cities
 */

import { db } from '@shared/db';
import { events, groups, users } from '@shared/schema';
import { eq, and, ilike } from 'drizzle-orm';

const SAMPLE_EVENTS = [
  // Buenos Aires
  { city: "Buenos Aires", country: "Argentina", title: "La Viruta Milonga", venue: "La Viruta", eventType: "milonga", daysFromNow: 1 },
  { city: "Buenos Aires", country: "Argentina", title: "Salon Canning Milonga", venue: "Salon Canning", eventType: "milonga", daysFromNow: 2 },
  { city: "Buenos Aires", country: "Argentina", title: "El Beso Milonga", venue: "El Beso", eventType: "milonga", daysFromNow: 3 },
  { city: "Buenos Aires", country: "Argentina", title: "Práctica Popular", venue: "Club Atlético Fernández Fierro", eventType: "practica", daysFromNow: 1 },
  { city: "Buenos Aires", country: "Argentina", title: "Tango Workshop with Sebastian Achaval", venue: "DNI Tango", eventType: "workshop", daysFromNow: 5 },
  
  // Berlin
  { city: "Berlin", country: "Germany", title: "Clärchens Ballhaus Milonga", venue: "Clärchens Ballhaus", eventType: "milonga", daysFromNow: 1 },
  { city: "Berlin", country: "Germany", title: "Tango Kurse Berlin", venue: "Tango Berlin Studio", eventType: "class", daysFromNow: 2 },
  { city: "Berlin", country: "Germany", title: "Kreuzberg Practica", venue: "TAK Theater", eventType: "practica", daysFromNow: 3 },
  
  // Miami
  { city: "Miami", country: "United States", title: "Diego's Milonga", venue: "Tanda Social Club", eventType: "milonga", daysFromNow: 1 },
  { city: "Miami", country: "United States", title: "South Beach Tango Night", venue: "South Beach Community Center", eventType: "milonga", daysFromNow: 4 },
  { city: "Miami", country: "United States", title: "Beginner Tango Class", venue: "Miami Dance Studio", eventType: "class", daysFromNow: 2 },
  
  // Athens
  { city: "Athens", country: "Greece", title: "Milonga del Centro", venue: "Athens Tango School", eventType: "milonga", daysFromNow: 1 },
  { city: "Athens", country: "Greece", title: "Plaka Practica", venue: "Plaka Dance Hall", eventType: "practica", daysFromNow: 3 },
  
  // London
  { city: "London", country: "United Kingdom", title: "Corrientes Milonga", venue: "Corrientes London", eventType: "milonga", daysFromNow: 2 },
  { city: "London", country: "United Kingdom", title: "Negracha Milonga", venue: "Negracha Club", eventType: "milonga", daysFromNow: 5 },
  
  // Barcelona
  { city: "Barcelona", country: "Spain", title: "Milonga del Mar", venue: "La Confiteria", eventType: "milonga", daysFromNow: 1 },
  { city: "Barcelona", country: "Spain", title: "Tango Fundamentals", venue: "Tango Barcelona Academy", eventType: "class", daysFromNow: 3 },
  
  // Paris
  { city: "Paris", country: "France", title: "La Milonga du Trocadéro", venue: "Trocadéro Dance Hall", eventType: "milonga", daysFromNow: 2 },
  { city: "Paris", country: "France", title: "Bal Tango Montmartre", venue: "Bal du moulin rouge", eventType: "milonga", daysFromNow: 4 },
  
  // New York
  { city: "New York", country: "United States", title: "Triangulo Milonga", venue: "Triangulo NYC", eventType: "milonga", daysFromNow: 1 },
  { city: "New York", country: "United States", title: "All Night Milonga", venue: "DanceSport NYC", eventType: "milonga", daysFromNow: 6 },
  
  // Tokyo
  { city: "Tokyo", country: "Japan", title: "Milonga Tokyo", venue: "Tokyo Tango Club", eventType: "milonga", daysFromNow: 2 },
  
  // Istanbul
  { city: "Istanbul", country: "Turkey", title: "Taksim Milonga", venue: "Tango Istanbul", eventType: "milonga", daysFromNow: 1 },
  { city: "Istanbul", country: "Turkey", title: "Bosphorus Tango Night", venue: "Bosphorus Dance Center", eventType: "milonga", daysFromNow: 4 },
  
  // Sydney
  { city: "Sydney", country: "Australia", title: "Sydney Tango Milonga", venue: "Sydney Tango Academy", eventType: "milonga", daysFromNow: 3 },
  
  // Montevideo
  { city: "Montevideo", country: "Uruguay", title: "Milonga Joventango", venue: "Joventango", eventType: "milonga", daysFromNow: 2 },
];

async function getOrCreateBotUser(): Promise<number> {
  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.username, 'scraper_bot'))
    .limit(1);
    
  if (existing) return existing.id;
  
  const [created] = await db
    .insert(users)
    .values({
      username: 'scraper_bot',
      email: 'scraper@mundotango.app',
      name: 'Mundo Tango Events Bot',
      password: 'disabled',
      role: 'system',
      isVerified: true,
    })
    .returning({ id: users.id });
    
  return created.id;
}

async function getCityGroupId(city: string): Promise<number | null> {
  const [group] = await db
    .select({ id: groups.id })
    .from(groups)
    .where(and(
      eq(groups.type, 'city'),
      ilike(groups.city, city)
    ))
    .limit(1);
    
  return group?.id || null;
}

async function main() {
  console.log('========================================');
  console.log('SEED SAMPLE EVENTS');
  console.log('========================================\n');
  
  const userId = await getOrCreateBotUser();
  console.log(`Using bot user ID: ${userId}\n`);
  
  let created = 0;
  let skipped = 0;
  
  for (const event of SAMPLE_EVENTS) {
    const groupId = await getCityGroupId(event.city);
    
    if (!groupId) {
      console.log(`[Skip] No city group for ${event.city}`);
      skipped++;
      continue;
    }
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + event.daysFromNow);
    startDate.setHours(21, 0, 0, 0); // 9 PM
    
    const endDate = new Date(startDate);
    endDate.setHours(startDate.getHours() + 4); // 4 hour event
    
    const slug = event.title.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      + '-' + Math.floor(Math.random() * 10000);
    
    try {
      await db.insert(events).values({
        title: event.title,
        slug,
        description: `Join us for ${event.title} at ${event.venue}. A wonderful tango experience in ${event.city}.`,
        eventType: event.eventType,
        category: event.eventType === 'milonga' ? 'milongas' : event.eventType === 'practica' ? 'practicas' : 'classes',
        startDate,
        endDate,
        venue: event.venue,
        city: event.city,
        country: event.country,
        userId,
        groupId,
        visibility: 'public',
        status: 'published',
      });
      
      console.log(`[Created] ${event.title} in ${event.city}`);
      created++;
    } catch (error: any) {
      console.error(`[Error] ${event.title}: ${error.message}`);
      skipped++;
    }
  }
  
  console.log(`\n========================================`);
  console.log(`COMPLETE: ${created} created, ${skipped} skipped`);
  console.log(`========================================`);
  
  // Show final counts
  const eventCount = await db.select({ count: events.id }).from(events);
  console.log(`\nTotal events in database: ${eventCount.length > 0 ? 'checking...' : 0}`);
  
  // Show cities with events
  const citiesWithEvents = await db.execute(`
    SELECT g.city, g.country, COUNT(e.id) as event_count
    FROM groups g
    JOIN events e ON e.group_id = g.id
    WHERE g.type = 'city'
    GROUP BY g.city, g.country
    ORDER BY event_count DESC
    LIMIT 15
  `);
  
  console.log('\nCities with events:');
  for (const row of citiesWithEvents.rows as any[]) {
    console.log(`  ${row.city}, ${row.country}: ${row.event_count} events`);
  }
}

main().catch(console.error);
