/**
 * BACKFILL EVENT TEAM MEMBERS
 * 
 * Reprocesses all events to extract team members (organizers, DJs, teachers, performers)
 * from their titles and descriptions, populating the event_team_members table.
 * 
 * This ensures the Event Team section appears on all event detail pages.
 * 
 * Usage: npx tsx server/scripts/backfillEventTeamMembers.ts
 */

import { db } from '@shared/db';
import { events, eventTeamMembers, users } from '@shared/schema';
import { sql, eq, notInArray, and, isNotNull } from 'drizzle-orm';
import { extractParticipants } from '../services/participant-extraction';

interface BackfillStats {
  totalEvents: number;
  eventsWithoutTeam: number;
  eventsProcessed: number;
  teamMembersAdded: number;
  usersCreated: number;
  errors: number;
}

async function getOrCreateUser(
  name: string,
  role: string,
  city?: string,
  country?: string
): Promise<number | null> {
  try {
    // Check if user already exists with this name
    const [existingUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(sql`LOWER(${users.displayName}) = LOWER(${name})`)
      .limit(1);

    if (existingUser) {
      return existingUser.id;
    }

    // Create a new user for this participant
    const username = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_|_$/g, '')
      .slice(0, 50);

    const uniqueUsername = `${username}_${Date.now().toString(36)}`;

    const tangoRoleMap: Record<string, string> = {
      'organizer': 'organizer',
      'co_organizer': 'organizer',
      'dj': 'dj',
      'teacher': 'teacher',
      'performer': 'performer',
      'host': 'host'
    };

    const [newUser] = await db
      .insert(users)
      .values({
        username: uniqueUsername,
        displayName: name,
        tangoRole: tangoRoleMap[role] || 'dancer',
        city: city || null,
        country: country || null,
        bio: `Discovered from scraped event data as ${role}`,
        isDiscovered: true,
        profileCompleteness: 20,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning({ id: users.id });

    return newUser?.id || null;
  } catch (error: any) {
    // Handle duplicates gracefully
    if (error.code === '23505') {
      return null;
    }
    console.error(`[Backfill] Error creating user for ${name}:`, error.message);
    return null;
  }
}

async function processEvent(
  eventId: number,
  title: string,
  description: string | null,
  city?: string,
  country?: string,
  stats: BackfillStats
): Promise<void> {
  try {
    const extraction = await extractParticipants(title, description, null);

    if (extraction.participants.length === 0) {
      return;
    }

    console.log(`[Backfill] 👥 Event ${eventId}: Found ${extraction.participants.length} team members`);

    for (const participant of extraction.participants) {
      const roleMap: Record<string, 'organizer' | 'dj' | 'teacher' | 'performer' | 'host'> = {
        'organizer': 'organizer',
        'co_organizer': 'organizer',
        'dj': 'dj',
        'teacher': 'teacher',
        'performer': 'performer',
        'photographer': 'performer',
        'host': 'host'
      };

      const role = roleMap[participant.role] || 'performer';

      try {
        // Check if this team member already exists for this event
        const [existing] = await db
          .select({ id: eventTeamMembers.id })
          .from(eventTeamMembers)
          .where(and(
            eq(eventTeamMembers.eventId, eventId),
            sql`LOWER(${eventTeamMembers.displayName}) = LOWER(${participant.name})`
          ))
          .limit(1);

        if (existing) {
          continue; // Skip duplicates
        }

        // Get or create user
        let userId: number | null = null;
        if (participant.matchedUserId) {
          userId = participant.matchedUserId;
        } else {
          userId = await getOrCreateUser(participant.name, role, city, country);
          if (userId) {
            stats.usersCreated++;
          }
        }

        // Insert team member
        await db.insert(eventTeamMembers).values({
          eventId,
          role,
          displayName: participant.name,
          rawText: participant.sourceText,
          confidence: participant.confidence,
          source: 'backfill',
          userId: userId || undefined
        });

        stats.teamMembersAdded++;
        console.log(`[Backfill]   + ${participant.name} (${role})`);
      } catch (err: any) {
        if (err.code !== '23505') {
          console.error(`[Backfill] Error adding ${participant.name}:`, err.message);
          stats.errors++;
        }
      }
    }
  } catch (error) {
    console.error(`[Backfill] Error processing event ${eventId}:`, error);
    stats.errors++;
  }
}

export async function backfillAllEventTeamMembers(): Promise<BackfillStats> {
  console.log('[Backfill] 🚀 Starting backfill of event team members...');

  const stats: BackfillStats = {
    totalEvents: 0,
    eventsWithoutTeam: 0,
    eventsProcessed: 0,
    teamMembersAdded: 0,
    usersCreated: 0,
    errors: 0
  };

  // Get all events
  const allEvents = await db
    .select({
      id: events.id,
      title: events.title,
      description: events.description,
      city: events.city,
      country: events.country
    })
    .from(events)
    .where(eq(events.status, 'published'));

  stats.totalEvents = allEvents.length;
  console.log(`[Backfill] Found ${stats.totalEvents} published events`);

  // Get events that already have team members
  const eventsWithTeam = await db
    .select({ eventId: eventTeamMembers.eventId })
    .from(eventTeamMembers)
    .groupBy(eventTeamMembers.eventId);

  const eventsWithTeamIds = new Set(eventsWithTeam.map(e => e.eventId));

  // Filter to events without team members
  const eventsToProcess = allEvents.filter(e => !eventsWithTeamIds.has(e.id));
  stats.eventsWithoutTeam = eventsToProcess.length;

  console.log(`[Backfill] Found ${stats.eventsWithoutTeam} events without team members`);

  // Process each event
  for (const event of eventsToProcess) {
    await processEvent(
      event.id,
      event.title,
      event.description,
      event.city || undefined,
      event.country || undefined,
      stats
    );
    stats.eventsProcessed++;

    // Progress logging every 50 events
    if (stats.eventsProcessed % 50 === 0) {
      console.log(`[Backfill] Progress: ${stats.eventsProcessed}/${stats.eventsWithoutTeam} events processed`);
    }
  }

  console.log('[Backfill] ✅ Backfill complete!');
  console.log(`[Backfill] Stats: ${JSON.stringify(stats, null, 2)}`);

  return stats;
}

// Also backfill from scraped events that have explicit team data
export async function backfillFromScrapedEvents(): Promise<BackfillStats> {
  console.log('[Backfill] 🔄 Backfilling from scraped events with explicit team data...');

  const stats: BackfillStats = {
    totalEvents: 0,
    eventsWithoutTeam: 0,
    eventsProcessed: 0,
    teamMembersAdded: 0,
    usersCreated: 0,
    errors: 0
  };

  // Get scraped events with team data that have been ingested
  const scrapedWithTeam = await db.execute(sql`
    SELECT 
      se.id,
      se.title,
      se.description,
      se.organizer_text,
      se.dj_text,
      se.teacher_text,
      se.performer_text,
      se.city,
      se.country,
      e.id as event_id
    FROM scraped_events se
    JOIN events e ON e.title = se.title
    WHERE se.status = 'ingested'
    AND (
      se.organizer_text IS NOT NULL AND se.organizer_text != '' OR
      se.dj_text IS NOT NULL AND se.dj_text != '' OR
      se.teacher_text IS NOT NULL AND se.teacher_text != '' OR
      se.performer_text IS NOT NULL AND se.performer_text != ''
    )
    LIMIT 500
  `);

  const rows = scrapedWithTeam.rows || [];
  stats.totalEvents = rows.length;

  console.log(`[Backfill] Found ${stats.totalEvents} scraped events with explicit team data`);

  for (const row of rows) {
    const eventId = row.event_id as number;
    
    // Build combined description with all team data
    const parts: string[] = [];
    if (row.organizer_text) parts.push(`Organizers: ${row.organizer_text}`);
    if (row.dj_text) parts.push(`DJs: ${row.dj_text}`);
    if (row.teacher_text) parts.push(`Teachers: ${row.teacher_text}`);
    if (row.performer_text) parts.push(`Performers: ${row.performer_text}`);

    const enrichedDescription = [
      row.description || '',
      '\n\n--- Team ---\n',
      parts.join('\n')
    ].join('');

    await processEvent(
      eventId,
      row.title as string,
      enrichedDescription,
      row.city as string || undefined,
      row.country as string || undefined,
      stats
    );

    stats.eventsProcessed++;
  }

  console.log('[Backfill] ✅ Scraped events backfill complete!');
  console.log(`[Backfill] Stats: ${JSON.stringify(stats, null, 2)}`);

  return stats;
}

// Run both backfills
async function main() {
  try {
    console.log('[Backfill] ========================================');
    console.log('[Backfill] EVENT TEAM MEMBERS BACKFILL');
    console.log('[Backfill] ========================================\n');

    // First, backfill events that have no team members
    const stats1 = await backfillAllEventTeamMembers();

    console.log('\n');

    // Then, enrich from scraped events with explicit team data
    const stats2 = await backfillFromScrapedEvents();

    console.log('\n[Backfill] ========================================');
    console.log('[Backfill] FINAL SUMMARY');
    console.log('[Backfill] ========================================');
    console.log(`[Backfill] Events processed: ${stats1.eventsProcessed + stats2.eventsProcessed}`);
    console.log(`[Backfill] Team members added: ${stats1.teamMembersAdded + stats2.teamMembersAdded}`);
    console.log(`[Backfill] Users created: ${stats1.usersCreated + stats2.usersCreated}`);
    console.log(`[Backfill] Errors: ${stats1.errors + stats2.errors}`);

    process.exit(0);
  } catch (error) {
    console.error('[Backfill] Fatal error:', error);
    process.exit(1);
  }
}

// Run if executed directly
main();
