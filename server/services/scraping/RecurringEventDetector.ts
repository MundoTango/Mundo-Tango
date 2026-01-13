/**
 * RECURRING EVENT DETECTOR
 * Detects and creates event series from recurring events
 * Generates placeholder events for future occurrences (90-day horizon)
 * MB.MD Pattern: Handle recurring events as series
 */

import { db } from '@shared/db';
import { eventSeries, events, groups } from '@shared/schema';
import { eq, and, ilike, gte, sql } from 'drizzle-orm';

export interface RecurringEventPattern {
  title: string;
  dayOfWeek?: number; // 0-6 (Sunday-Saturday)
  frequency: 'weekly' | 'biweekly' | 'monthly' | 'yearly';
  startDate: Date;
  endDate?: Date;
  venue?: string;
  city?: string;
  country?: string;
}

interface PlaceholderEvent {
  title: string;
  description: string;
  startDate: Date;
  endDate?: Date;
  city: string;
  country: string;
  venue?: string;
  seriesId: number;
  groupId?: number;
  isPlaceholder: boolean;
}

export class RecurringEventDetector {
  private static PLACEHOLDER_HORIZON_DAYS = 90;

  static isRecurring(title: string, venue?: string): boolean {
    const text = `${title} ${venue || ''}`.toLowerCase();
    const recurringKeywords = [
      'every', 'weekly', 'daily', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
      'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo',
      'cada', 'todas las', 'todos los', 'semanal', 'diario',
      'milonga de los', 'milonga del', 'milonga en', 'milonga cada'
    ];
    return recurringKeywords.some(kw => text.includes(kw));
  }

  static detectPattern(title: string): RecurringEventPattern | null {
    const dayNames: Record<string, number> = {
      'lunes': 1, 'martes': 2, 'miércoles': 3, 'jueves': 4, 'viernes': 5, 'sábado': 6, 'domingo': 0,
      'monday': 1, 'tuesday': 2, 'wednesday': 3, 'thursday': 4, 'friday': 5, 'saturday': 6, 'sunday': 0
    };

    const patterns: Array<{ regex: RegExp; extractor: (match: RegExpMatchArray) => number | undefined }> = [
      { regex: /Milonga (?:de los?|del) (\w+)/i, extractor: (m) => dayNames[m[1].toLowerCase()] },
      { regex: /Every (\w+)/i, extractor: (m) => dayNames[m[1].toLowerCase()] },
      { regex: /Cada (\w+)/i, extractor: (m) => dayNames[m[1].toLowerCase()] },
      { regex: /(\w+) Milonga/i, extractor: (m) => dayNames[m[1].toLowerCase()] },
      { regex: /(\w+) Night Milonga/i, extractor: (m) => dayNames[m[1].toLowerCase()] },
    ];

    for (const { regex, extractor } of patterns) {
      const match = title.match(regex);
      if (match) {
        const dayOfWeek = extractor(match);
        if (dayOfWeek !== undefined) {
          return {
            title,
            dayOfWeek,
            frequency: 'weekly',
            startDate: new Date()
          };
        }
      }
    }

    return null;
  }

  static async createSeriesFromPattern(
    pattern: RecurringEventPattern,
    city: string,
    country: string,
    venueId?: number
  ): Promise<number | null> {
    try {
      const slug = pattern.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .substring(0, 100);

      const existing = await db
        .select({ id: eventSeries.id })
        .from(eventSeries)
        .where(
          and(
            ilike(eventSeries.name, pattern.title),
            ilike(eventSeries.city, city)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        console.log(`[RecurringEventDetector] Series already exists: ${pattern.title} in ${city}`);
        return existing[0].id;
      }

      const recurrenceType = pattern.frequency === 'yearly' ? 'yearly' : 
                             pattern.frequency === 'monthly' ? 'monthly' : 'weekly';

      const [newSeries] = await db.insert(eventSeries).values({
        name: pattern.title,
        slug: `${slug}-${Date.now()}`,
        description: `Recurring ${pattern.frequency} event: ${pattern.title}`,
        recurrenceType: recurrenceType as 'weekly' | 'monthly' | 'yearly',
        recurrenceDay: pattern.dayOfWeek,
        venueId: venueId || null,
        city,
        country,
        isActive: true,
        isClaimed: false,
      }).returning();

      console.log(`[RecurringEventDetector] Created series: ${pattern.title} (ID: ${newSeries.id})`);
      return newSeries.id;
    } catch (error) {
      console.error('[RecurringEventDetector] Failed to create series:', error);
      return null;
    }
  }

  static async generateFutureOccurrences(
    seriesId: number,
    horizonDays: number = this.PLACEHOLDER_HORIZON_DAYS
  ): Promise<{ created: number; skipped: number }> {
    const result = { created: 0, skipped: 0 };

    const series = await db
      .select()
      .from(eventSeries)
      .where(eq(eventSeries.id, seriesId))
      .limit(1);

    if (series.length === 0 || !series[0].isActive) {
      console.log(`[RecurringEventDetector] Series ${seriesId} not found or inactive`);
      return result;
    }

    const seriesData = series[0];
    const now = new Date();
    const horizon = new Date(now.getTime() + horizonDays * 24 * 60 * 60 * 1000);

    if (seriesData.recurrenceDay === null || seriesData.recurrenceDay === undefined) {
      console.log(`[RecurringEventDetector] Series ${seriesId} has no recurrence day set`);
      return result;
    }

    const group = seriesData.city ? await db
      .select({ id: groups.id })
      .from(groups)
      .where(
        and(
          eq(groups.type, 'city'),
          ilike(groups.city, seriesData.city)
        )
      )
      .limit(1) : [];

    const groupId = group.length > 0 ? group[0].id : null;

    const occurrences = this.calculateOccurrences(
      seriesData.recurrenceType || 'weekly',
      seriesData.recurrenceDay,
      now,
      horizon
    );

    console.log(`[RecurringEventDetector] Generating ${occurrences.length} placeholders for series "${seriesData.name}"`);

    for (const occurrenceDate of occurrences) {
      const startOfDay = new Date(occurrenceDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(occurrenceDate);
      endOfDay.setHours(23, 59, 59, 999);

      const existingInSeries = await db
        .select({ id: events.id })
        .from(events)
        .where(
          and(
            eq(events.seriesId, seriesId),
            sql`${events.startDate} >= ${startOfDay}`,
            sql`${events.startDate} <= ${endOfDay}`
          )
        )
        .limit(1);

      if (existingInSeries.length > 0) {
        result.skipped++;
        continue;
      }

      if (seriesData.city) {
        const existingRealEvent = await db
          .select({ id: events.id })
          .from(events)
          .where(
            and(
              ilike(events.title, seriesData.name),
              ilike(events.city, seriesData.city),
              eq(events.isPlaceholder, false),
              sql`${events.startDate} >= ${startOfDay}`,
              sql`${events.startDate} <= ${endOfDay}`
            )
          )
          .limit(1);

        if (existingRealEvent.length > 0) {
          result.skipped++;
          continue;
        }
      }

      const placeholderTitle = seriesData.name;
      const placeholderDescription = `${seriesData.name} - This is a recurring event. Check back closer to the date for confirmed details and registration.`;

      let venueInfo = null;
      if (seriesData.venueId) {
        const [venue] = await db
          .select({ name: sql<string>`name`, address: sql<string>`address` })
          .from(sql`venues`)
          .where(sql`id = ${seriesData.venueId}`)
          .limit(1);
        if (venue) {
          venueInfo = venue;
        }
      }

      try {
        await db.insert(events).values({
          title: placeholderTitle,
          slug: `${seriesData.slug}-${occurrenceDate.toISOString().split('T')[0]}`,
          description: placeholderDescription,
          eventType: 'milonga',
          userId: seriesData.organizerId || 1,
          startDate: occurrenceDate,
          venue: venueInfo?.name || undefined,
          address: venueInfo?.address || undefined,
          location: seriesData.city ? `${seriesData.city}, ${seriesData.country || ''}` : 'TBD',
          city: seriesData.city || undefined,
          country: seriesData.country || undefined,
          groupId,
          seriesId,
          isPlaceholder: true,
          isRecurring: true,
          visibility: 'public',
          status: 'approved',
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        result.created++;
      } catch (err) {
        console.error(`[RecurringEventDetector] Error creating placeholder:`, err);
      }
    }

    console.log(`[RecurringEventDetector] Created ${result.created} placeholders, skipped ${result.skipped} existing`);
    return result;
  }

  private static calculateOccurrences(
    recurrenceType: string,
    dayOfWeek: number,
    start: Date,
    end: Date
  ): Date[] {
    const occurrences: Date[] = [];
    const current = new Date(start);

    while (current.getDay() !== dayOfWeek) {
      current.setDate(current.getDate() + 1);
    }

    while (current <= end) {
      occurrences.push(new Date(current));

      switch (recurrenceType) {
        case 'weekly':
          current.setDate(current.getDate() + 7);
          break;
        case 'biweekly':
          current.setDate(current.getDate() + 14);
          break;
        case 'monthly':
          current.setMonth(current.getMonth() + 1);
          break;
        case 'yearly':
          current.setFullYear(current.getFullYear() + 1);
          break;
        default:
          current.setDate(current.getDate() + 7);
      }
    }

    return occurrences;
  }

  static async generatePlaceholdersForAllActiveSeries(): Promise<{ totalCreated: number; totalSkipped: number }> {
    console.log('[RecurringEventDetector] Generating placeholders for all active series...');
    
    const activeSeries = await db
      .select({ id: eventSeries.id, name: eventSeries.name })
      .from(eventSeries)
      .where(eq(eventSeries.isActive, true));

    let totalCreated = 0;
    let totalSkipped = 0;

    for (const series of activeSeries) {
      const result = await this.generateFutureOccurrences(series.id);
      totalCreated += result.created;
      totalSkipped += result.skipped;
    }

    console.log(`[RecurringEventDetector] Total: ${totalCreated} placeholders created, ${totalSkipped} skipped`);
    return { totalCreated, totalSkipped };
  }
}
