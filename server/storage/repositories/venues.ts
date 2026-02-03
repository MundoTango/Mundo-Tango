/**
 * Venue Repository
 * Handles all venue-related database operations  
 * MB.MD God Command #6: NEVER change ID column types
 */

import { eq, and } from 'drizzle-orm';
import { venues, type SelectVenue, type InsertVenue } from '@shared/schema';
import type { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import { db as defaultDb } from '../core/connection';

// ==============================
// Error Classes
// ==============================

export class VenueRepositoryError extends Error {
  constructor(message: string, public code: string, public details?: unknown) {
    super(message);
    this.name = 'VenueRepositoryError';
  }
}

export class VenueValidationError extends VenueRepositoryError {
  constructor(message: string, details?: unknown) {
    super(message, 'VALIDATION_ERROR', details);
    this.name = 'VenueValidationError';
  }
}

export class VenueDatabaseError extends VenueRepositoryError {
  constructor(message: string, details?: unknown) {
    super(message, 'DATABASE_ERROR', details);
    this.name = 'VenueDatabaseError';
  }
}

// ==============================
// Validation Helpers
// ==============================

const validateId = (id: number, fieldName: string = 'ID'): void => {
  if (!Number.isFinite(id) || !Number.isInteger(id) || id <= 0) {
    throw new VenueValidationError(`Invalid ${fieldName}: ${id}. Must be a positive integer.`);
  }
};

const validateVenueInput = (venue: InsertVenue): void => {
  if (!venue.name || typeof venue.name !== 'string' || venue.name.trim().length === 0) {
    throw new VenueValidationError('Venue name is required and must be a non-empty string.');
  }
  
  if (!venue.address || typeof venue.address !== 'string' || venue.address.trim().length === 0) {
    throw new VenueValidationError('Venue address is required and must be a non-empty string.');
  }
  
  if (!venue.city || typeof venue.city !== 'string' || venue.city.trim().length === 0) {
    throw new VenueValidationError('Venue city is required and must be a non-empty string.');
  }
  
  if (!venue.country || typeof venue.country !== 'string' || venue.country.trim().length === 0) {
    throw new VenueValidationError('Venue country is required and must be a non-empty string.');
  }
};

export class VenueRepository {
  constructor(private db: NeonHttpDatabase = defaultDb) {}

  async createVenue(venue: InsertVenue): Promise<SelectVenue> {
    validateVenueInput(venue);
    try {
      const result = await this.db.insert(venues).values(venue).returning();
      return result[0];
    } catch (error) {
      throw new VenueDatabaseError('Failed to create venue', error);
    }
  }

  async getVenueById(id: number): Promise<SelectVenue | undefined> {
    validateId(id);
    try {
      const result = await this.db
        .select()
        .from(venues)
        .where(eq(venues.id, id))
        .limit(1);
      return result[0];
    } catch (error) {
      throw new VenueDatabaseError('Failed to get venue by ID', error);
    }
  }

  async getVenues(params: {
    city?: string;
    verified?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<SelectVenue[]> {
    const conditions = [];
    if (params.city) {
      conditions.push(eq(venues.city, params.city));
    }
    if (params.verified !== undefined) {
      conditions.push(eq(venues.verified, params.verified));
    }

    return await this.db
      .select()
      .from(venues)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .limit(params.limit || 10)
      .offset(params.offset || 0);
  }

  async updateVenue(id: number, data: Partial<SelectVenue>): Promise<SelectVenue | undefined> {
    const result = await this.db
      .update(venues)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(venues.id, id))
      .returning();
    return result[0];
  }

  async deleteVenue(id: number): Promise<void> {
    await this.db.delete(venues).where(eq(venues.id, id));
  }
}

// Export singleton instance
export const venueRepository = new VenueRepository();
