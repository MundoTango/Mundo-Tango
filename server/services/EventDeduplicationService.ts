import { db } from '../../database';

export interface EventMatch {
  eventId1: number;
  eventId2: number;
  matchType: 'title' | 'datetime_location' | 'url' | 'combined';
  confidence: number;
  evidence: any;
}

export interface EventMergeResult {
  primaryEventId: number;
  mergedEventId: number;
  success: boolean;
}

export class EventDeduplicationService {
  private readonly MATCH_THRESHOLDS = {
    title: 0.85,
    datetime_location: 0.90,
    url: 0.95,
    combined: 0.80,
  };

  /**
   * Find duplicate events across multiple sources
   */
  async findDuplicateEvents(eventId: number): Promise<EventMatch[]> {
    try {
      const event = await this.getEvent(eventId);
      if (!event) {
        return [];
      }

      const matches: EventMatch[] = [];

      // Check URL matches (highest confidence)
      if (event.url) {
        const urlMatches = await this.findByUrl(event.url, eventId);
        matches.push(
          ...urlMatches.map((m) => ({
            eventId1: eventId,
            eventId2: m.id,
            matchType: 'url' as const,
            confidence: 0.95,
            evidence: { url: event.url },
          }))
        );
      }

      // Check datetime + location matches
      if (event.start_datetime && event.city_id) {
        const dtLocMatches = await this.findByDatetimeLocation(
          event.start_datetime,
          event.city_id,
          eventId
        );
        matches.push(
          ...dtLocMatches.map((m) => ({
            eventId1: eventId,
            eventId2: m.id,
            matchType: 'datetime_location' as const,
            confidence: 0.90,
            evidence: {
              start_datetime: event.start_datetime,
              city_id: event.city_id,
            },
          }))
        );
      }

      // Check title similarity
      if (event.title) {
        const titleMatches = await this.findByTitleSimilarity(
          event.title,
          event.city_id,
          event.start_datetime,
          eventId
        );
        matches.push(
          ...titleMatches.map((m) => ({
            eventId1: eventId,
            eventId2: m.id,
            matchType: 'title' as const,
            confidence: this.calculateTitleConfidence(event.title, m.title),
            evidence: { title: event.title },
          }))
        );
      }

      // Filter by confidence thresholds and remove duplicates
      const filteredMatches = matches.filter(
        (m) => m.confidence >= this.MATCH_THRESHOLDS[m.matchType]
      );

      return this.deduplicateMatches(filteredMatches);
    } catch (error) {
      console.error('Error finding duplicate events:', error);
      throw error;
    }
  }

  /**
   * Merge two events into one
   */
  async mergeEvents(
    primaryEventId: number,
    mergeEventId: number,
    reason: string
  ): Promise<EventMergeResult> {
    try {
      await db.query('BEGIN');

      try {
        // Get event data before merge
        const mergeEvent = await this.getEvent(mergeEventId);

        // Transfer attendees
        await db.query(
          `
          UPDATE event_attendees
          SET event_id = $1
          WHERE event_id = $2
          ON CONFLICT (event_id, user_id) DO NOTHING
          `,
          [primaryEventId, mergeEventId]
        );

        // Transfer comments
        await db.query(
          'UPDATE event_comments SET event_id = $1 WHERE event_id = $2',
          [primaryEventId, mergeEventId]
        );

        // Store merge history
        await db.query(
          `
          INSERT INTO event_merge_history (primary_event_id, merged_event_id, merge_reason, merged_data)
          VALUES ($1, $2, $3, $4)
          `,
          [primaryEventId, mergeEventId, reason, JSON.stringify(mergeEvent)]
        );

        // Mark merged event as duplicate
        await db.query(
          `
          UPDATE events
          SET is_duplicate = true, merged_into_event_id = $1, updated_at = CURRENT_TIMESTAMP
          WHERE id = $2
          `,
          [primaryEventId, mergeEventId]
        );

        await db.query('COMMIT');

        console.log(`Successfully merged event ${mergeEventId} into ${primaryEventId}`);

        return {
          primaryEventId,
          mergedEventId: mergeEventId,
          success: true,
        };
      } catch (error) {
        await db.query('ROLLBACK');
        throw error;
      }
    } catch (error) {
      console.error('Error merging events:', error);
      return {
        primaryEventId,
        mergedEventId: mergeEventId,
        success: false,
      };
    }
  }

  /**
   * Batch process events to find and mark duplicates
   */
  async batchFindDuplicates(limit: number = 100): Promise<EventMatch[]> {
    try {
      const events = await db.query(
        `
        SELECT id FROM events
        WHERE is_duplicate = false
        ORDER BY created_at DESC
        LIMIT $1
        `,
        [limit]
      );

      const allMatches: EventMatch[] = [];

      for (const event of events.rows) {
        const matches = await this.findDuplicateEvents(event.id);
        allMatches.push(...matches);
      }

      return allMatches;
    } catch (error) {
      console.error('Error in batch duplicate finding:', error);
      throw error;
    }
  }

  // Private helper methods

  private async getEvent(id: number): Promise<any> {
    const result = await db.query(
      'SELECT * FROM events WHERE id = $1 AND is_duplicate = false',
      [id]
    );
    return result.rows[0];
  }

  private async findByUrl(url: string, excludeId: number): Promise<any[]> {
    const result = await db.query(
      `
      SELECT id, title FROM events
      WHERE url = $1 AND id != $2 AND is_duplicate = false
      `,
      [url, excludeId]
    );
    return result.rows;
  }

  private async findByDatetimeLocation(
    datetime: Date,
    cityId: number,
    excludeId: number
  ): Promise<any[]> {
    const result = await db.query(
      `
      SELECT id, title FROM events
      WHERE city_id = $1
        AND ABS(EXTRACT(EPOCH FROM (start_datetime - $2))) < 3600
        AND id != $3
        AND is_duplicate = false
      `,
      [cityId, datetime, excludeId]
    );
    return result.rows;
  }

  private async findByTitleSimilarity(
    title: string,
    cityId: number | null,
    datetime: Date,
    excludeId: number
  ): Promise<any[]> {
    // Find events with similar titles in same city around same time (within 7 days)
    const result = await db.query(
      `
      SELECT id, title FROM events
      WHERE city_id = $1
        AND ABS(EXTRACT(EPOCH FROM (start_datetime - $2))) < 604800
        AND id != $3
        AND is_duplicate = false
        AND similarity(title, $4) > 0.6
      ORDER BY similarity(title, $4) DESC
      LIMIT 10
      `,
      [cityId, datetime, excludeId, title]
    );
    return result.rows;
  }

  private calculateTitleConfidence(title1: string, title2: string): number {
    // Normalize titles
    const norm1 = this.normalizeTitle(title1);
    const norm2 = this.normalizeTitle(title2);

    // Calculate similarity
    const similarity = this.stringSimilarity(norm1, norm2);

    // Boost confidence for exact matches after normalization
    if (norm1 === norm2) {
      return 0.95;
    }

    return similarity;
  }

  private normalizeTitle(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private stringSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) return 1.0;

    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  private deduplicateMatches(matches: EventMatch[]): EventMatch[] {
    // Remove duplicate matches (same pair of events)
    const seen = new Set<string>();
    return matches.filter((match) => {
      const key = [match.eventId1, match.eventId2].sort().join('-');
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }
}
