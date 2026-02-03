/**
 * PARTICIPANT PROFILE HELPER
 * Shared helper for scrapers to attach participant profiles to scraped events
 * 
 * Usage: Call attachParticipantProfiles() after building event data, before db.insert()
 */

import { extractParticipantDetails } from "./participant-extraction";

export interface ScrapedEventInput {
  title: string;
  description?: string;
  organizer?: string;
}

export interface ParticipantProfileData {
  organizerText: string | null;
  djText: string | null;
  teacherText: string | null;
  performerText: string | null;
  participantProfiles: Array<{
    name: string;
    role: string;
    profileId?: number;
    userId?: number;
    confidence: number;
  }>;
}

/**
 * Extract participants from event data and return enriched fields
 * Call this before inserting a scraped event to attach profile data
 */
export async function attachParticipantProfiles(
  event: ScrapedEventInput
): Promise<ParticipantProfileData> {
  try {
    const extraction = await extractParticipants(
      event.title,
      event.description || null,
      event.organizer || null
    );

    const participantProfiles = extraction.participants.map(p => ({
      name: p.name,
      role: p.role,
      profileId: p.matchedProfileId,
      userId: p.matchedUserId,
      confidence: p.confidence
    }));

    console.log(`[ParticipantHelper] Extracted ${participantProfiles.length} participants from "${event.title.slice(0, 50)}..."`);

    return {
      organizerText: extraction.organizerText,
      djText: extraction.djText,
      teacherText: extraction.teacherText,
      performerText: extraction.performerText,
      participantProfiles
    };
  } catch (error) {
    console.error(`[ParticipantHelper] Error extracting participants:`, error);
    return {
      organizerText: null,
      djText: null,
      teacherText: null,
      performerText: null,
      participantProfiles: []
    };
  }
}

/**
 * Batch process multiple events for efficiency
 */
export async function attachParticipantProfilesBatch(
  events: ScrapedEventInput[]
): Promise<ParticipantProfileData[]> {
  const results: ParticipantProfileData[] = [];
  
  for (const event of events) {
    const profileData = await attachParticipantProfiles(event);
    results.push(profileData);
  }
  
  return results;
}
