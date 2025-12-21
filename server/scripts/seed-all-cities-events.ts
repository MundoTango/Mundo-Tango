import { db } from '@shared/db';
import { events, groups, users } from '@shared/schema';
import { eq } from 'drizzle-orm';

// Event templates (will be distributed across cities)
const EVENT_TEMPLATES = [
  { title: "Milonga {city}", venue: "{city} Tango Hall", eventType: "milonga", daysFromNow: 1 },
  { title: "{city} Friday Night Dance", venue: "Main Tango Studio", eventType: "milonga", daysFromNow: 2 },
  { title: "Práctica {city}", venue: "{city} Community Center", eventType: "practica", daysFromNow: 3 },
  { title: "Tango Workshop", venue: "{city} Dance Academy", eventType: "workshop", daysFromNow: 4 },
  { title: "{city} Social Milonga", venue: "Local Dance Club", eventType: "milonga", daysFromNow: 5 },
  { title: "Beginner Tango Class", venue: "{city} Studio", eventType: "class", daysFromNow: 1 },
  { title: "Advanced Tango Workshop", venue: "{city} Academy", eventType: "workshop", daysFromNow: 6 },
  { title: "{city} Tango Night", venue: "Downtown Dance Hall", eventType: "milonga", daysFromNow: 3 },
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

async function main() {
  console.log('========================================');
  console.log('SEED EVENTS FOR ALL 170 CITIES');
  console.log('========================================\n');
  
  const userId = await getOrCreateBotUser();
  console.log(`Using bot user ID: ${userId}\n`);
  
  // Get all city groups
  const allCities = await db
    .select({ id: groups.id, city: groups.city, country: groups.country })
    .from(groups)
    .where(eq(groups.type, 'city'));
  
  console.log(`Found ${allCities.length} cities\n`);
  
  let created = 0;
  let skipped = 0;
  
  for (const cityGroup of allCities) {
    // Get 2-3 events per city from templates
    const numEvents = 2 + Math.floor(Math.random() * 2); // 2-3 events
    
    for (let i = 0; i < numEvents; i++) {
      const template = EVENT_TEMPLATES[i % EVENT_TEMPLATES.length];
      const title = template.title.replace('{city}', cityGroup.city);
      const venue = template.venue.replace('{city}', cityGroup.city);
      
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + template.daysFromNow + (i * 7));
      startDate.setHours(21, 0, 0, 0); // 9 PM
      
      const endDate = new Date(startDate);
      endDate.setHours(startDate.getHours() + 4); // 4 hour event
      
      const slug = title.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        + '-' + Math.floor(Math.random() * 10000);
      
      try {
        await db.insert(events).values({
          title,
          slug,
          description: `Join us for ${title} at ${venue}. A wonderful tango experience in ${cityGroup.city}, ${cityGroup.country}.`,
          eventType: template.eventType,
          category: template.eventType === 'milonga' ? 'milongas' : template.eventType === 'practica' ? 'practicas' : template.eventType === 'workshop' ? 'workshops' : 'classes',
          startDate,
          endDate,
          venue,
          city: cityGroup.city,
          country: cityGroup.country,
          userId,
          groupId: cityGroup.id,
          visibility: 'public',
          status: 'published',
        });
        
        created++;
      } catch (error: any) {
        skipped++;
      }
    }
  }
  
  console.log(`\n========================================`);
  console.log(`COMPLETE: ${created} events created, ${skipped} skipped`);
  console.log(`========================================`);
}

main().catch(console.error);
