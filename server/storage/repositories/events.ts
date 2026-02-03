/**
 * Event Repository
 * Handles all event-related database operations
 * MB.MD God Command #6: NEVER change ID column types
 */

import { eq, and, gte, lte, ilike, or, desc } from 'drizzle-orm';
import {
  events,
  eventRsvps,
  eventPhotos,
  eventComments,
  eventReminders,
  type SelectEvent,
  type InsertEvent,
  type SelectEventRsvp,
  type InsertEventRsvp,
  type SelectEventPhoto,
  type InsertEventPhoto,
  type SelectEventComment,
  type InsertEventComment,
  type SelectEventReminder,
  type InsertEventReminder,
} from '@shared/schema';
import type { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import { db as defaultDb } from '../core/connection';

// ==============================
// Error Classes
// ==============================

export class EventRepositoryError extends Error {
  constructor(message: string, public code: string, public details?: unknown) {
    super(message);
    this.name = 'EventRepositoryError';
  }
}

export class EventValidationError extends EventRepositoryError {
  constructor(message: string, details?: unknown) {
    super(message, 'VALIDATION_ERROR', details);
    this.name = 'EventValidationError';
  }
}

export class EventDatabaseError extends EventRepositoryError {
  constructor(message: string, details?: unknown) {
    super(message, 'DATABASE_ERROR', details);
    this.name = 'EventDatabaseError';
  }
}

// ==============================
// Validation Helpers
// ==============================

const validateId = (id: number, fieldName: string = 'ID'): void => {
  if (!Number.isFinite(id) || !Number.isInteger(id) || id <= 0) {
    throw new EventValidationError(`Invalid ${fieldName}: ${id}. Must be a positive integer.`);
  }
};

const validateEventInput = (event: InsertEvent): void => {
  if (!event.title || typeof event.title !== 'string' || event.title.trim().length === 0) {
    throw new EventValidationError('Event title is required and must be a non-empty string.');
  }
  
  if (!event.userId || !Number.isInteger(event.userId) || event.userId <= 0) {
    throw new EventValidationError('userId is required and must be a positive integer.');
  }
  
  const validEventTypes = ['milonga', 'practica', 'class', 'workshop', 'festival', 'show', 'other'];
  if (event.eventType && !validEventTypes.includes(event.eventType)) {
    throw new EventValidationError(`Invalid eventType: ${event.eventType}. Must be one of: ${validEventTypes.join(', ')}`);
  }
};

export class EventRepository {
  constructor(private db: NeonHttpDatabase = defaultDb) {}

  // ==============================
  // Event CRUD Operations
  // ==============================

  async createEvent(event: InsertEvent): Promise<SelectEvent> {
    validateEventInput(event);
    try {
      const result = await this.db.insert(events).values(event).returning();
      return result[0];
    } catch (error) {
      throw new EventDatabaseError('Failed to create event', error);
    }
  }

  async getEventById(id: number): Promise<SelectEvent | undefined> {
    validateId(id);
    try {
      const result = await this.db
        .select()
        .from(events)
        .where(eq(events.id, id))
        .limit(1);
      return result[0];
    } catch (error) {
      throw new EventDatabaseError('Failed to get event by ID', error);
    }
  }

  async getEvents(params: {
    city?: string;
    eventType?: string;
    startDate?: Date;
    endDate?: Date;
    search?: string;
    groupId?: number;
    limit?: number;
    offset?: number;
  }): Promise<SelectEvent[]> {
    const conditions = [];

    if (params.city) {
      conditions.push(eq(events.city, params.city));
    }
    if (params.eventType) {
      conditions.push(eq(events.eventType, params.eventType));
    }
    if (params.startDate) {
      conditions.push(gte(events.date, params.startDate));
    }
    if (params.endDate) {
      conditions.push(lte(events.date, params.endDate));
    }
    if (params.search) {
      conditions.push(
        or(
          ilike(events.name, `%${params.search}%`),
          ilike(events.description, `%${params.search}%`)
        )
      );
    }
    if (params.groupId) {
      conditions.push(eq(events.groupId, params.groupId));
    }

    return await this.db
      .select()
      .from(events)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .limit(params.limit || 20)
      .offset(params.offset || 0);
  }

  async updateEvent(id: number, data: Partial<SelectEvent>): Promise<SelectEvent | undefined> {
    const result = await this.db
      .update(events)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(events.id, id))
      .returning();
    return result[0];
  }

  async deleteEvent(id: number): Promise<void> {
    await this.db.delete(events).where(eq(events.id, id));
  }

  // ==============================
  // Event RSVPs
  // ==============================

  async createEventRsvp(rsvp: InsertEventRsvp): Promise<SelectEventRsvp | undefined> {
    try {
      const result = await this.db.insert(eventRsvps).values(rsvp).returning();
      return result[0];
    } catch (error) {
      // Handle duplicate RSVP
      return undefined;
    }
  }

  async getEventRsvps(eventId: number): Promise<SelectEventRsvp[]> {
    return await this.db
      .select()
      .from(eventRsvps)
      .where(eq(eventRsvps.eventId, eventId));
  }

  async getUserEventRsvp(eventId: number, userId: number): Promise<SelectEventRsvp | undefined> {
    const result = await this.db
      .select()
      .from(eventRsvps)
      .where(and(eq(eventRsvps.eventId, eventId), eq(eventRsvps.userId, userId)))
      .limit(1);
    return result[0];
  }

  async updateEventRsvp(
    eventId: number,
    userId: number,
    status: string
  ): Promise<SelectEventRsvp | undefined> {
    const result = await this.db
      .update(eventRsvps)
      .set({ status, updatedAt: new Date() })
      .where(and(eq(eventRsvps.eventId, eventId), eq(eventRsvps.userId, userId)))
      .returning();
    return result[0];
  }

  async deleteEventRsvp(eventId: number, userId: number): Promise<void> {
    await this.db
      .delete(eventRsvps)
      .where(and(eq(eventRsvps.eventId, eventId), eq(eventRsvps.userId, userId)));
  }

  async getEventWaitlist(eventId: number): Promise<SelectEventRsvp[]> {
    return await this.db
      .select()
      .from(eventRsvps)
      .where(and(eq(eventRsvps.eventId, eventId), eq(eventRsvps.status, 'waitlist')));
  }

  // ==============================
  // Event Photos
  // ==============================

  async createEventPhoto(photo: InsertEventPhoto): Promise<SelectEventPhoto> {
    const result = await this.db.insert(eventPhotos).values(photo).returning();
    return result[0];
  }

  async getEventPhotos(eventId: number): Promise<SelectEventPhoto[]> {
    return await this.db
      .select()
      .from(eventPhotos)
      .where(eq(eventPhotos.eventId, eventId));
  }

  async getEventPhotoById(id: number): Promise<SelectEventPhoto | undefined> {
    const result = await this.db
      .select()
      .from(eventPhotos)
      .where(eq(eventPhotos.id, id))
      .limit(1);
    return result[0];
  }

  async deleteEventPhoto(id: number): Promise<void> {
    await this.db.delete(eventPhotos).where(eq(eventPhotos.id, id));
  }

  // ==============================
  // Event Comments
  // ==============================

  async createEventComment(comment: InsertEventComment): Promise<SelectEventComment> {
    const result = await this.db.insert(eventComments).values(comment).returning();
    return result[0];
  }

  async getEventComments(eventId: number): Promise<SelectEventComment[]> {
    return await this.db
      .select()
      .from(eventComments)
      .where(eq(eventComments.eventId, eventId))
      .orderBy(desc(eventComments.createdAt));
  }

  async updateEventComment(id: number, content: string): Promise<SelectEventComment | undefined> {
    const result = await this.db
      .update(eventComments)
      .set({ content, updatedAt: new Date() })
      .where(eq(eventComments.id, id))
      .returning();
    return result[0];
  }

  async deleteEventComment(id: number): Promise<void> {
    await this.db.delete(eventComments).where(eq(eventComments.id, id));
  }

  // ==============================
  // Event Reminders
  // ==============================

  async createEventReminder(reminder: InsertEventReminder): Promise<SelectEventReminder> {
    const result = await this.db.insert(eventReminders).values(reminder).returning();
    return result[0];
  }

  async getEventReminders(rsvpId: number): Promise<SelectEventReminder[]> {
    return await this.db
      .select()
      .from(eventReminders)
      .where(eq(eventReminders.rsvpId, rsvpId));
  }

  async deleteEventReminder(id: number): Promise<void> {
    await this.db.delete(eventReminders).where(eq(eventReminders.id, id));
  }
}

// Export singleton instance
export const eventRepository = new EventRepository();
