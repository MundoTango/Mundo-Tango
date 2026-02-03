/**
 * RECURRING EVENT DETECTOR
 * Detects and creates event series from recurring events
 * MB.MD Pattern: Handle recurring events as series
 */

import { db } from '@shared/db';
import { eventSeries, events } from '@shared/schema';
import { eq } from 'drizzle-orm';

export interface RecurringEventPattern {
  title: string;
  dayOfWeek?: number; // 0-6 (Sunday-Saturday)
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly';
  startDate: Date;
  endDate?: Date;
  venue?: string;
  city?: string;
}

export class RecurringEventDetector {
  /**
   * Detect if event title indicates recurrence
   */
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

  /**
   * Detect recurrence pattern from title
   */
  static detectPattern(title: string): RecurringEventPattern | null {
    const patterns: Array<[RegExp, () => RecurringEventPattern | null]> = [
      // "Milonga de los Domingos" / "Milonga de los Lunes"
      [/Milonga (?:de los?|del) (\w+)/i, (match) => {
        const dayNames: Record<string, number> = {
          'lunes': 1, 'martes': 2, 'miércoles': 3, 'jueves': 4, 'viernes': 5, 'sábado': 6, 'domingo': 0,
          'monday': 1, 'tuesday': 2, 'wednesday': 3, 'thursday': 4, 'friday': 5, 'saturday': 6, 'sunday': 0
        };
        const day = dayNames[match[1].toLowerCase()];
        if (day !== undefined) {
          return {
            title,
            dayOfWeek: day,
            frequency: 'weekly',
            startDate: new Date()
          };
        }
        return null;
      }],
      // "Every Friday" / "Every Monday"
      [/Every (\w+)|Cada (\w+)/i, (match) => {
        const dayNames: Record<string, number> = {
          'monday': 1, 'tuesday': 2, 'wednesday': 3, 'thursday': 4, 'friday': 5, 'saturday': 6, 'sunday': 0,
          'lunes': 1, 'martes': 2, 'miércoles': 3, 'jueves': 4, 'viernes': 5, 'sábado': 6, 'domingo': 0
        };
        const dayName = (match[1] || match[2]).toLowerCase();
        const day = dayNames[dayName];
        if (day !== undefined) {
          return {
            title,
            dayOfWeek: day,
            frequency: 'weekly',
            startDate: new Date()
          };
        }
        return null;
      }]
    ];

    for (const [regex, handler] of patterns) {
      const match = title.match(regex);
      if (match) {
        const pattern = handler(match);
        if (pattern) return pattern;
      }
    }

    return null;
  }

  /**
   * Create event series from recurring pattern
   */
  static async createSeriesFromPattern(
    pattern: RecurringEventPattern,
    groupId: number | null,
    baseEventData: any
  ): Promise<number | null> {
    try {
      const result = await db.insert(eventSeries).values({
        title: pattern.title,
        description: baseEventData.description,
        groupId,
        frequency: pattern.frequency,
        dayOfWeek: pattern.dayOfWeek,
        startDate: pattern.startDate,
        endDate: pattern.endDate || new Date(pattern.startDate.getTime() + 365 * 24 * 60 * 60 * 1000), // 1 year default
        venue: pattern.venue,
        status: 'active'
      }).returning();

      return result[0]?.id || null;
    } catch (error) {
      console.error('[RecurringEventDetector] Failed to create series:', error);
      return null;
    }
  }
}
