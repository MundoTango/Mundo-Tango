/**
 * PROFILE LINKING SERVICE
 * MB.MD Implementation - Pattern: Found People Matching
 * December 21, 2025
 * 
 * Links scraped DJ/teacher/organizer names to user profiles.
 * Uses fuzzy matching with role and city context.
 */

import { db } from '@shared/db';
import { events, users } from '@shared/schema';
import { eq, sql, ilike, or, and } from 'drizzle-orm';

interface MatchCandidate {
  userId: number;
  displayName: string;
  username: string;
  tangoRoles: string[] | null;
  city: string | null;
  score: number;
}

interface LinkResult {
  eventId: number;
  role: 'organizer' | 'dj' | 'teacher' | 'performer';
  nameText: string;
  linkedUserIds: number[];
  unlinkedNames: string[];
}

export class ProfileLinkingService {
  /**
   * Extract individual names from text field
   * Handles patterns like "DJ Pablo", "Carlos & Sofia", "with Maria Garcia"
   */
  static extractNames(text: string): string[] {
    if (!text || text.trim() === '') return [];

    // Remove common prefixes
    const cleaned = text
      .replace(/^(hosted by|organized by|presented by|dj|music by|workshop with|class by|with)\s*/gi, '')
      .replace(/\s+(dj|presents|presents:)\s*/gi, ', ')
      .trim();

    // Split by common delimiters
    const names = cleaned
      .split(/[,&\n]/)
      .map(n => n.trim())
      .filter(n => n.length > 2 && n.length < 60)
      .map(n => n.replace(/^DJ\s+/i, '').trim());

    return [...new Set(names)];
  }

  /**
   * Calculate match score between name and user
   */
  static calculateMatchScore(name: string, user: MatchCandidate, role: string, eventCity: string | null): number {
    let score = 0;
    const nameLower = name.toLowerCase().trim();
    const displayLower = (user.displayName || '').toLowerCase().trim();
    const usernameLower = (user.username || '').toLowerCase().trim();

    // Exact display name match
    if (displayLower === nameLower) {
      score += 1.0;
    }
    // Exact username match
    else if (usernameLower === nameLower.replace(/\s+/g, '')) {
      score += 0.9;
    }
    // Display name contains full name
    else if (displayLower.includes(nameLower) || nameLower.includes(displayLower)) {
      score += 0.8;
    }
    // First name match
    else {
      const nameFirst = nameLower.split(' ')[0];
      const displayFirst = displayLower.split(' ')[0];
      if (nameFirst === displayFirst && nameFirst.length > 2) {
        score += 0.5;
      }
    }

    // Role bonus
    if (user.tangoRoles && user.tangoRoles.includes(role)) {
      score += 0.2;
    }

    // City bonus
    if (eventCity && user.city && user.city.toLowerCase().includes(eventCity.toLowerCase())) {
      score += 0.1;
    }

    return Math.min(score, 1.3); // Cap at 1.3 for perfect match with bonuses
  }

  /**
   * Find matching user profiles for a name
   */
  static async findCandidates(name: string, role: string, eventCity: string | null): Promise<MatchCandidate[]> {
    if (!name || name.length < 3) return [];

    // Search for users with similar names
    const candidates = await db.select({
      id: users.id,
      displayName: users.displayName,
      username: users.username,
      tangoRoles: users.tangoRoles,
      city: users.city,
    }).from(users).where(
      or(
        ilike(users.displayName, `%${name}%`),
        ilike(users.username, `%${name.replace(/\s+/g, '')}%`)
      )
    ).limit(10);

    // Score each candidate
    const scored: MatchCandidate[] = candidates.map(u => ({
      userId: u.id,
      displayName: u.displayName || '',
      username: u.username || '',
      tangoRoles: u.tangoRoles,
      city: u.city,
      score: this.calculateMatchScore(name, {
        userId: u.id,
        displayName: u.displayName || '',
        username: u.username || '',
        tangoRoles: u.tangoRoles,
        city: u.city,
        score: 0,
      }, role, eventCity),
    }));

    // Sort by score descending
    return scored.sort((a, b) => b.score - a.score);
  }

  /**
   * Link profiles for a single event
   */
  static async linkEventProfiles(eventId: number): Promise<LinkResult[]> {
    const event = await db.query.events.findFirst({
      where: eq(events.id, eventId),
    });

    if (!event) {
      throw new Error(`Event ${eventId} not found`);
    }

    const results: LinkResult[] = [];
    const roles: Array<{ field: keyof typeof event; profileField: string; role: 'organizer' | 'dj' | 'teacher' | 'performer' }> = [
      { field: 'organizerText', profileField: 'organizerProfiles', role: 'organizer' },
      { field: 'djText', profileField: 'djProfiles', role: 'dj' },
      { field: 'teacherText', profileField: 'teacherProfiles', role: 'teacher' },
      { field: 'performerText', profileField: 'performerProfiles', role: 'performer' },
    ];

    for (const { field, profileField, role } of roles) {
      const text = event[field] as string | null;
      if (!text) continue;

      const names = this.extractNames(text);
      const linkedUserIds: number[] = [];
      const unlinkedNames: string[] = [];

      for (const name of names) {
        const candidates = await this.findCandidates(name, role, event.city);
        
        // Auto-link if score >= 0.8
        const bestMatch = candidates[0];
        if (bestMatch && bestMatch.score >= 0.8) {
          linkedUserIds.push(bestMatch.userId);
          console.log(`[ProfileLinking] ✅ Linked "${name}" to user ${bestMatch.userId} (${bestMatch.displayName}) score=${bestMatch.score.toFixed(2)}`);
        } else {
          unlinkedNames.push(name);
          console.log(`[ProfileLinking] ⏳ No match for "${name}" (best score: ${bestMatch?.score.toFixed(2) || 'N/A'})`);
        }
      }

      // Update event with linked profiles (merge with existing, avoid duplicates)
      if (linkedUserIds.length > 0) {
        const existingProfiles = (event as any)[profileField] as number[] | null;
        const merged = [...new Set([...(existingProfiles || []), ...linkedUserIds])];
        
        const updateData: Record<string, any> = {};
        updateData[profileField] = merged;
        
        await db.update(events)
          .set(updateData)
          .where(eq(events.id, eventId));
      }

      results.push({
        eventId,
        role,
        nameText: text,
        linkedUserIds,
        unlinkedNames,
      });
    }

    return results;
  }

  /**
   * Batch link profiles for all events
   */
  static async batchLinkProfiles(options: { limit?: number; cityFilter?: string } = {}): Promise<{
    eventsProcessed: number;
    totalLinked: number;
    totalUnlinked: number;
  }> {
    console.log('[ProfileLinking] 🚀 Starting batch profile linking...');

    const limit = options.limit || 100;
    
    // Get events with unlinked text fields
    let query = db.select({
      id: events.id,
    }).from(events).where(
      and(
        or(
          sql`${events.organizerText} IS NOT NULL AND (${events.organizerProfiles} IS NULL OR array_length(${events.organizerProfiles}, 1) = 0)`,
          sql`${events.djText} IS NOT NULL AND (${events.djProfiles} IS NULL OR array_length(${events.djProfiles}, 1) = 0)`,
          sql`${events.teacherText} IS NOT NULL AND (${events.teacherProfiles} IS NULL OR array_length(${events.teacherProfiles}, 1) = 0)`,
        ),
        options.cityFilter ? ilike(events.city, `%${options.cityFilter}%`) : sql`1=1`
      )
    ).limit(limit);

    const eventsToProcess = await query;

    let totalLinked = 0;
    let totalUnlinked = 0;

    for (const event of eventsToProcess) {
      try {
        const results = await this.linkEventProfiles(event.id);
        for (const result of results) {
          totalLinked += result.linkedUserIds.length;
          totalUnlinked += result.unlinkedNames.length;
        }
      } catch (error) {
        console.error(`[ProfileLinking] ❌ Error linking event ${event.id}:`, error);
      }
    }

    console.log(`[ProfileLinking] ✅ Batch complete: ${eventsToProcess.length} events, ${totalLinked} linked, ${totalUnlinked} unlinked`);

    return {
      eventsProcessed: eventsToProcess.length,
      totalLinked,
      totalUnlinked,
    };
  }
}
