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
  frequency: 'weekly' | 'monthly' | 'yearly'; // Must match recurrenceTypeEnum in schema
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
   * Day name mapping for pattern detection
   */
  private static readonly dayNames: Record<string, number> = {
    'monday': 1, 'tuesday': 2, 'wednesday': 3, 'thursday': 4, 'friday': 5, 'saturday': 6, 'sunday': 0,
    'lunes': 1, 'martes': 2, 'miércoles': 3, 'miercoles': 3, 'jueves': 4, 'viernes': 5, 'sábado': 6, 'sabado': 6, 'domingo': 0,
    'mon': 1, 'tue': 2, 'wed': 3, 'thu': 4, 'fri': 5, 'sat': 6, 'sun': 0
  };

  /**
   * Detect recurrence pattern from title with expanded patterns
   */
  static detectPattern(title: string, eventDate?: Date): RecurringEventPattern | null {
    // Pattern 1: "Milonga de los [day]" / "Milonga del [day]"
    const milongaDePattern = title.match(/Milonga (?:de los?|del) (\w+)/i);
    if (milongaDePattern) {
      const day = this.dayNames[milongaDePattern[1].toLowerCase()];
      if (day !== undefined) {
        return { title, dayOfWeek: day, frequency: 'weekly', startDate: eventDate || new Date() };
      }
    }
    
    // Pattern 2: "Every [day]" / "Cada [day]"
    const everyPattern = title.match(/(?:Every|Cada)\s+(\w+)/i);
    if (everyPattern) {
      const day = this.dayNames[everyPattern[1].toLowerCase()];
      if (day !== undefined) {
        return { title, dayOfWeek: day, frequency: 'weekly', startDate: eventDate || new Date() };
      }
    }
    
    // Pattern 3: "[Day] Milonga" / "[Day] Night Milonga" / "[Day] Practica"
    const dayFirstPattern = title.match(/^(monday|tuesday|wednesday|thursday|friday|saturday|sunday|lunes|martes|miércoles|miercoles|jueves|viernes|sábado|sabado|domingo)\s+(?:night\s+)?(?:milonga|practica|práctica)/i);
    if (dayFirstPattern) {
      const day = this.dayNames[dayFirstPattern[1].toLowerCase()];
      if (day !== undefined) {
        return { title, dayOfWeek: day, frequency: 'weekly', startDate: eventDate || new Date() };
      }
    }
    
    // Pattern 4: "Milonga [Day]" / "Practica [Day]"
    const milongaDayPattern = title.match(/(?:milonga|practica|práctica)\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday|lunes|martes|miércoles|miercoles|jueves|viernes|sábado|sabado|domingo)/i);
    if (milongaDayPattern) {
      const day = this.dayNames[milongaDayPattern[1].toLowerCase()];
      if (day !== undefined) {
        return { title, dayOfWeek: day, frequency: 'weekly', startDate: eventDate || new Date() };
      }
    }
    
    // Pattern 5: Generic "Milonga" or "Practica" - use event date to determine day
    if (eventDate && /(?:milonga|practica|práctica)/i.test(title)) {
      const dayOfWeek = eventDate.getDay();
      return { title, dayOfWeek, frequency: 'weekly', startDate: eventDate };
    }
    
    // Pattern 6: Weekly/Semanal keyword
    if (/\b(?:weekly|semanal)\b/i.test(title)) {
      const dayOfWeek = eventDate ? eventDate.getDay() : undefined;
      return { title, dayOfWeek, frequency: 'weekly', startDate: eventDate || new Date() };
    }
    
    // Pattern 7: Monthly patterns
    if (/\b(?:monthly|mensual|first|second|third|fourth|last)\s+(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i.test(title)) {
      const dayMatch = title.match(/(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i);
      const day = dayMatch ? this.dayNames[dayMatch[0].toLowerCase()] : (eventDate?.getDay());
      return { title, dayOfWeek: day, frequency: 'monthly', startDate: eventDate || new Date() };
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
      // Map pattern.frequency to recurrenceType enum values
      const recurrenceType = pattern.frequency; // 'daily' | 'weekly' | 'biweekly' | 'monthly' maps directly
      
      const result = await db.insert(eventSeries).values({
        title: pattern.title,
        description: baseEventData.description,
        groupId,
        recurrenceType: recurrenceType as any, // Schema uses recurrenceType, not frequency
        recurrenceDay: pattern.dayOfWeek, // Schema uses recurrenceDay, not dayOfWeek
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
