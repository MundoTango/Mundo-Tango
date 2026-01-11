/**
 * RECURRING EVENT DETECTOR
 * Detects and creates event series from recurring events
 * MB.MD Pattern: Handle recurring events as series
 */

import { db } from '@shared/db';
import { eventSeries, events } from '@shared/schema';
import { eq, and, sql, desc } from 'drizzle-orm';

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
   * MB.MD: Fixed to match actual event_series schema columns
   */
  static async createSeriesFromPattern(
    pattern: RecurringEventPattern,
    groupId: number | null,
    baseEventData: any
  ): Promise<number | null> {
    try {
      // Check if series with this name already exists in the same city
      const existing = await db
        .select({ id: eventSeries.id })
        .from(eventSeries)
        .where(eq(eventSeries.name, pattern.title))
        .limit(1);
      
      if (existing.length > 0) {
        console.log(`[RecurringEventDetector] Series "${pattern.title}" already exists, returning existing ID ${existing[0].id}`);
        return existing[0].id;
      }
      
      // Generate slug from title
      const slug = pattern.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      
      // Map pattern.frequency to recurrenceType enum values  
      const recurrenceType = pattern.frequency as 'weekly' | 'monthly' | 'yearly';
      
      const result = await db.insert(eventSeries).values({
        name: pattern.title, // Schema uses 'name' not 'title'
        slug: `${slug}-${Date.now()}`, // Unique slug
        description: baseEventData.description || null,
        recurrenceType: recurrenceType,
        recurrenceDay: pattern.dayOfWeek,
        city: pattern.city || baseEventData.city || null,
        country: baseEventData.country || null,
        isActive: true, // Schema uses 'isActive' not 'status'
      }).returning({ id: eventSeries.id });

      console.log(`[RecurringEventDetector] Created series "${pattern.title}" with ID ${result[0]?.id}`);
      return result[0]?.id || null;
    } catch (error: any) {
      console.error('[RecurringEventDetector] Failed to create series:', error.message);
      return null;
    }
  }
  
  /**
   * Generate future events from existing series
   * MB.MD: Fills gaps like Jan 19-31 with recurring milongas
   */
  static async generateFutureEvents(seriesId: number, weeksAhead: number = 8): Promise<number> {
    try {
      const [series] = await db
        .select()
        .from(eventSeries)
        .where(eq(eventSeries.id, seriesId))
        .limit(1);
      
      if (!series || !series.isActive) {
        return 0;
      }
      
      // Get the most recent event from this series to use as template
      const [templateEvent] = await db
        .select()
        .from(events)
        .where(eq(events.seriesId, seriesId))
        .orderBy(desc(events.startDate))
        .limit(1);
      
      if (!templateEvent) {
        console.log(`[RecurringEventDetector] No template event found for series ${seriesId}`);
        return 0;
      }
      
      // Generate dates for the next N weeks
      const today = new Date();
      const generatedDates: Date[] = [];
      
      for (let week = 0; week < weeksAhead; week++) {
        const date = new Date(today);
        date.setDate(date.getDate() + (week * 7));
        
        // Adjust to the correct day of week
        if (series.recurrenceDay !== null) {
          const currentDay = date.getDay();
          const daysUntilTarget = (series.recurrenceDay - currentDay + 7) % 7;
          date.setDate(date.getDate() + daysUntilTarget);
        }
        
        // Skip dates in the past
        if (date > today) {
          generatedDates.push(date);
        }
      }
      
      let created = 0;
      for (const eventDate of generatedDates) {
        // Check if event already exists for this date
        const dateStr = eventDate.toISOString().split('T')[0];
        const existing = await db
          .select({ id: events.id })
          .from(events)
          .where(
            and(
              eq(events.seriesId, seriesId),
              sql`DATE(${events.startDate}) = ${dateStr}`
            )
          )
          .limit(1);
        
        if (existing.length === 0) {
          // Create new event based on template
          const newStartDate = new Date(eventDate);
          if (templateEvent.startDate) {
            const templateTime = new Date(templateEvent.startDate);
            newStartDate.setHours(templateTime.getHours(), templateTime.getMinutes());
          }
          
          await db.insert(events).values({
            title: templateEvent.title,
            description: templateEvent.description,
            startDate: newStartDate,
            endDate: templateEvent.endDate ? new Date(newStartDate.getTime() + 
              (new Date(templateEvent.endDate).getTime() - new Date(templateEvent.startDate!).getTime())) : null,
            city: templateEvent.city,
            country: templateEvent.country,
            venue: templateEvent.venue,
            address: templateEvent.address,
            userId: templateEvent.userId,
            groupId: templateEvent.groupId,
            seriesId: seriesId,
            eventType: templateEvent.eventType,
            latitude: templateEvent.latitude,
            longitude: templateEvent.longitude,
          });
          created++;
        }
      }
      
      console.log(`[RecurringEventDetector] Generated ${created} future events for series ${seriesId}`);
      return created;
    } catch (error: any) {
      console.error(`[RecurringEventDetector] Failed to generate future events:`, error.message);
      return 0;
    }
  }
}
