import { db } from './server/db/index.js';
import { events, users, eventRsvps } from './shared/schema.js';
import { eq, and, sql } from 'drizzle-orm';

console.log('🔍 Testing exact API query...\n');

try {
  // Replicate the exact query from event-routes.ts
  const status = 'published';
  const conditions = [eq(events.status, status)];
  
  const result = await db
    .select({
      id: events.id,
      title: events.title,
      description: events.description,
      startDate: events.startDate,
      endDate: events.endDate,
      location: events.location,
      address: events.address,
      city: events.city,
      country: events.country,
      status: events.status,
      visibility: events.visibility,
      userId: events.userId,
      _count: sql<number>`(
        SELECT COUNT(*)::int
        FROM ${eventRsvps}
        WHERE ${eventRsvps.eventId} = ${events.id}
        AND ${eventRsvps.status} = 'going'
      )`.as('attendee_count')
    })
    .from(events)
    .leftJoin(users, eq(events.userId, users.id))
    .where(and(...conditions))
    .limit(10);

  console.log(`✅ Query successful! Found ${result.length} events`);
  if (result.length > 0) {
    console.log('\n📋 First event:');
    console.log(JSON.stringify(result[0], null, 2));
  }
  
  process.exit(0);
} catch (error) {
  console.error('❌ Query failed:', error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
}
