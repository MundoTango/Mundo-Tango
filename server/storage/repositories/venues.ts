/**
 * Venue Repository
 * Handles all venue-related database operations  
 * MB.MD God Command #6: NEVER change ID column types
 */

import { eq, and } from 'drizzle-orm';
import { venues, type SelectVenue, type InsertVenue } from '@db/schema';
import type { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import { db as defaultDb } from '../core/connection';

export class VenueRepository {
  constructor(private db: NeonHttpDatabase = defaultDb) {}

  async createVenue(venue: InsertVenue): Promise<SelectVenue> {
    const result = await this.db.insert(venues).values(venue).returning();
    return result[0];
  }

  async getVenueById(id: number): Promise<SelectVenue | undefined> {
    const result = await this.db
      .select()
      .from(venues)
      .where(eq(venues.id, id))
      .limit(1);
    return result[0];
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
