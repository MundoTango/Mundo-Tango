/**
 * MB.MD Participant Re-Processing Script
 * 
 * Re-processes all 273 existing events to extract participants (organizers, DJs, 
 * teachers, performers) from event descriptions and titles.
 * 
 * This fills the event_participants table for the Tango Resume feature.
 * 
 * Protocol: Replit AI → Mr. Blue → AGENT_REPROCESS_1
 * 
 * Usage: npx tsx server/scripts/reprocessParticipants.ts
 */

import { db } from '@shared/db';
import { events, scrapedProfiles } from '@shared/schema';
import { eventParticipants } from '@shared/eventRolesSchemas';
import { eq, sql, ilike, and, isNull } from 'drizzle-orm';
import { extractParticipants, createScrapedProfile, type ExtractedParticipant } from '../services/participant-extraction';

interface EventForProcessing {
  id: number;
  title: string;
  description: string | null;
  organizerText: string | null;
  djText: string | null;
  teacherText: string | null;
  performerText: string | null;
  city: string | null;
}

// Valid roles in the enum
const validRoles = ['organizer', 'co_organizer', 'dj', 'teacher', 'performer', 'photographer', 'volunteer', 'host', 'sponsor', 'attendee'] as const;
type ValidRole = typeof validRoles[number];

/**
 * Create event participants from extracted data
 */
async function createEventParticipants(
  eventId: number, 
  participants: ExtractedParticipant[]
): Promise<number> {
  let created = 0;
  
  for (const participant of participants) {
    try {
      // Create or get scraped profile
      let profileId: number | undefined;
      if (!participant.matchedUserId) {
        profileId = await createScrapedProfile(
          participant.name,
          participant.role,
          null,
          participant.socialLinks
        );
      }
      
      // Map role to valid event role enum value
      const roleMap: Record<string, ValidRole> = {
        'organizer': 'organizer',
        'co_organizer': 'co_organizer',
        'dj': 'dj',
        'teacher': 'teacher',
        'performer': 'performer',
        'photographer': 'photographer',
        'host': 'host',
        'assistant_teacher': 'teacher',
        'special_guest': 'performer',
        'volunteer': 'volunteer'
      };
      
      const eventRole: ValidRole = roleMap[participant.role] || 'attendee';
      
      // Check if participant already exists for this event by name
      const existing = await db
        .select()
        .from(eventParticipants)
        .where(
          and(
            eq(eventParticipants.eventId, eventId),
            ilike(eventParticipants.displayName, participant.name)
          )
        )
        .limit(1);
      
      if (existing.length === 0) {
        await db.insert(eventParticipants).values({
          eventId,
          userId: participant.matchedUserId || null,
          scrapedProfileId: profileId || null,
          role: eventRole,
          displayName: participant.name,
          status: 'confirmed',
          notes: participant.sourceText,
          isPubliclyListed: true,
          displayOrder: participant.role === 'organizer' ? 0 : 10
        });
        created++;
      }
    } catch (error) {
      console.error(`[MB.MD] Error creating participant ${participant.name}:`, error);
    }
  }
  
  return created;
}

async function main() {
  console.log('\n' + '='.repeat(80));
  console.log('[MB.MD] PARTICIPANT RE-PROCESSING SCRIPT');
  console.log('='.repeat(80) + '\n');
  
  // Get count before
  const countBefore = await db.select({ count: sql`count(*)` }).from(eventParticipants);
  console.log(`[MB.MD] Current event_participants count: ${countBefore[0]?.count || 0}`);
  
  // Get all published events
  const allEvents = await db.query.events.findMany({
    where: eq(events.status, 'published'),
    columns: {
      id: true,
      title: true,
      description: true,
      organizerText: true,
      djText: true,
      teacherText: true,
      performerText: true,
      city: true
    }
  }) as EventForProcessing[];
  
  console.log(`[MB.MD] Found ${allEvents.length} published events to process`);
  
  if (allEvents.length === 0) {
    console.log('[MB.MD] No events to process');
    return;
  }
  
  let totalParticipants = 0;
  let eventsWithParticipants = 0;
  let errors = 0;
  
  // Track participant stats
  const roleStats: Record<string, number> = {
    organizer: 0,
    co_organizer: 0,
    dj: 0,
    teacher: 0,
    performer: 0,
    host: 0,
    other: 0
  };
  
  for (const event of allEvents) {
    try {
      // Use existing text fields if available, otherwise extract from description
      const organizerSource = event.organizerText || null;
      
      // Extract participants from description
      const extraction = await extractParticipants(
        event.title,
        event.description,
        organizerSource
      );
      
      if (extraction.participants.length > 0) {
        const created = await createEventParticipants(event.id, extraction.participants);
        
        if (created > 0) {
          totalParticipants += created;
          eventsWithParticipants++;
          
          // Update role stats
          for (const p of extraction.participants) {
            if (roleStats[p.role] !== undefined) {
              roleStats[p.role]++;
            } else {
              roleStats.other++;
            }
          }
          
          console.log(`[MB.MD] ✓ ${event.title.substring(0, 40)}... → ${created} participants`);
        }
      }
      
      // Also update the text fields on the event if not set
      if (!event.organizerText && extraction.organizerText) {
        await db.update(events)
          .set({
            organizerText: extraction.organizerText,
            djText: extraction.djText,
            teacherText: extraction.teacherText,
            performerText: extraction.performerText,
            musicStyle: extraction.extractedMetadata.musicStyle,
            dressCode: extraction.extractedMetadata.dressCode
          })
          .where(eq(events.id, event.id));
      }
      
      // Progress indicator
      if ((eventsWithParticipants + errors) % 50 === 0 && eventsWithParticipants > 0) {
        console.log(`[MB.MD] Progress: Processed ${eventsWithParticipants} events with participants`);
      }
    } catch (error) {
      console.error(`[MB.MD] ✗ Error processing event ${event.id}: ${event.title}`, error);
      errors++;
    }
  }
  
  // Get count after
  const countAfter = await db.select({ count: sql`count(*)` }).from(eventParticipants);
  
  console.log('\n' + '='.repeat(80));
  console.log('[MB.MD] PARTICIPANT RE-PROCESSING COMPLETE');
  console.log('='.repeat(80));
  console.log(`📊 Events processed:         ${allEvents.length}`);
  console.log(`📊 Events with participants: ${eventsWithParticipants}`);
  console.log(`📊 Total participants added: ${totalParticipants}`);
  console.log(`📊 Before count:             ${countBefore[0]?.count || 0}`);
  console.log(`📊 After count:              ${countAfter[0]?.count || 0}`);
  console.log(`❌ Errors:                   ${errors}`);
  console.log('\n📈 Role Breakdown:');
  Object.entries(roleStats).forEach(([role, count]) => {
    if (count > 0) {
      console.log(`   ${role.padEnd(15)} ${count}`);
    }
  });
  console.log('\n[MB.MD] Tango Resume feature can now display participant roles!');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('[MB.MD] Fatal error:', error);
    process.exit(1);
  });
