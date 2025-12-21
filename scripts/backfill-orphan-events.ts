import { db } from '@shared/db';
import { events, groups } from '@shared/schema';
import { eq, and, isNull, ilike, sql } from 'drizzle-orm';

async function resolveCityGroupId(city: string | null, country: string | null): Promise<number | null> {
  if (!city) return null;
  
  const placeholders = ['unknown', 'tba', 'various', 'online', 'virtual', 'tbd', 'n/a'];
  if (placeholders.includes(city.toLowerCase().trim())) {
    return null;
  }

  try {
    const [exactMatch] = await db
      .select({ id: groups.id })
      .from(groups)
      .where(and(
        eq(groups.type, 'city'),
        ilike(groups.city, city)
      ))
      .limit(1);

    if (exactMatch) return exactMatch.id;

    const [nameMatch] = await db
      .select({ id: groups.id })
      .from(groups)
      .where(and(
        eq(groups.type, 'city'),
        ilike(groups.name, `%${city}%`)
      ))
      .limit(1);

    return nameMatch?.id || null;
  } catch (error) {
    console.warn(`Failed to resolve group for ${city}:`, error);
    return null;
  }
}

async function backfillOrphanEvents() {
  console.log('Starting orphan event backfill...');

  const orphanEvents = await db
    .select({ 
      id: events.id, 
      title: events.title,
      city: events.city, 
      country: events.country 
    })
    .from(events)
    .where(and(
      isNull(events.groupId),
      sql`${events.city} IS NOT NULL`,
      sql`${events.city} != ''`
    ));

  console.log(`Found ${orphanEvents.length} orphan events`);

  let updated = 0;
  let skipped = 0;

  for (const event of orphanEvents) {
    const groupId = await resolveCityGroupId(event.city, event.country);
    
    if (groupId) {
      await db
        .update(events)
        .set({ groupId })
        .where(eq(events.id, event.id));
      
      updated++;
      if (updated % 50 === 0) {
        console.log(`Progress: ${updated} events updated...`);
      }
    } else {
      skipped++;
    }
  }

  console.log(`Backfill complete: ${updated} updated, ${skipped} skipped`);
  process.exit(0);
}

backfillOrphanEvents().catch(console.error);
