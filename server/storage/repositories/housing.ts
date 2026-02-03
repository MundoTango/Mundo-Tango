/**
 * Housing Repository
 * Handles housing listings, bookings, reviews, and favorites database operations
 * MB.MD God Command #6: NEVER change ID column types
 * MB.MD God Command #2: Separation of concerns - extracted from storage.ts
 */

import { eq, and, desc, ilike, or } from 'drizzle-orm';
import { db as defaultDb } from '../core/connection';
import type { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import {
  housingListings,
  housingBookings,
  housingReviews,
  housingFavorites,
} from '@shared/schema';

// Infer types from tables
type SelectHousingListing = typeof housingListings.$inferSelect;
type InsertHousingListing = typeof housingListings.$inferInsert;
type SelectHousingBooking = typeof housingBookings.$inferSelect;
type InsertHousingBooking = typeof housingBookings.$inferInsert;
type SelectHousingReview = typeof housingReviews.$inferSelect;
type InsertHousingReview = typeof housingReviews.$inferInsert;
type SelectHousingFavorite = typeof housingFavorites.$inferSelect;
type InsertHousingFavorite = typeof housingFavorites.$inferInsert;

// ==============================
// Custom Error Classes
// ==============================

export class HousingRepositoryError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'HousingRepositoryError';
  }
}

export class HousingValidationError extends HousingRepositoryError {
  constructor(message: string, details?: unknown) {
    super(message, 'VALIDATION_ERROR', details);
    this.name = 'HousingValidationError';
  }
}

export class HousingDatabaseError extends HousingRepositoryError {
  constructor(message: string, cause?: unknown) {
    super(message, 'DATABASE_ERROR', cause);
    this.name = 'HousingDatabaseError';
  }
}

// ==============================
// Validation Helpers
// ==============================

const validateId = (id: number, fieldName: string = 'id'): void => {
  if (!Number.isInteger(id) || id <= 0) {
    throw new HousingValidationError(`Invalid ${fieldName}: ${id}. Must be a positive integer.`);
  }
};

const validateListingInput = (data: InsertHousingListing): void => {
  validateId(data.hostId, 'hostId');
  if (!data.title || data.title.trim().length === 0) {
    throw new HousingValidationError('Listing title is required');
  }
  if (!data.city || data.city.trim().length === 0) {
    throw new HousingValidationError('City is required');
  }
  if (!data.country || data.country.trim().length === 0) {
    throw new HousingValidationError('Country is required');
  }
  if (data.pricePerNight !== undefined && data.pricePerNight < 0) {
    throw new HousingValidationError('Price per night must be non-negative');
  }
};

const validateBookingInput = (data: InsertHousingBooking): void => {
  validateId(data.listingId, 'listingId');
  validateId(data.guestId, 'guestId');
  if (!data.checkInDate || !data.checkOutDate) {
    throw new HousingValidationError('Check-in and check-out dates are required');
  }
  if (new Date(data.checkInDate) >= new Date(data.checkOutDate)) {
    throw new HousingValidationError('Check-out date must be after check-in date');
  }
  if (data.guests !== undefined && data.guests < 1) {
    throw new HousingValidationError('Number of guests must be at least 1');
  }
};

// ==============================
// Housing Repository
// ==============================

export class HousingRepository {
  private db: NeonHttpDatabase<Record<string, never>>;

  constructor(database?: NeonHttpDatabase<Record<string, never>>) {
    this.db = database || defaultDb;
  }

  // ==============================
  // Listings
  // ==============================

  async getListing(id: number): Promise<SelectHousingListing | null> {
    validateId(id);
    try {
      const result = await this.db.select().from(housingListings).where(eq(housingListings.id, id)).limit(1);
      return result[0] || null;
    } catch (error) {
      throw new HousingDatabaseError('Failed to get listing', error);
    }
  }

  async getListingsByHost(hostId: number): Promise<SelectHousingListing[]> {
    validateId(hostId, 'hostId');
    try {
      return await this.db
        .select()
        .from(housingListings)
        .where(eq(housingListings.hostId, hostId))
        .orderBy(desc(housingListings.createdAt));
    } catch (error) {
      throw new HousingDatabaseError('Failed to get host listings', error);
    }
  }

  async getListingsByCity(city: string, limit: number = 50): Promise<SelectHousingListing[]> {
    if (!city || city.trim().length === 0) {
      throw new HousingValidationError('City is required for search');
    }
    try {
      return await this.db
        .select()
        .from(housingListings)
        .where(and(
          ilike(housingListings.city, `%${city}%`),
          eq(housingListings.status, 'active')
        ))
        .orderBy(desc(housingListings.createdAt))
        .limit(limit);
    } catch (error) {
      throw new HousingDatabaseError('Failed to search listings by city', error);
    }
  }

  async createListing(data: InsertHousingListing): Promise<SelectHousingListing> {
    validateListingInput(data);
    try {
      const [result] = await this.db.insert(housingListings).values(data).returning();
      return result;
    } catch (error) {
      throw new HousingDatabaseError('Failed to create listing', error);
    }
  }

  async updateListing(id: number, data: Partial<SelectHousingListing>): Promise<SelectHousingListing | null> {
    validateId(id);
    try {
      const [result] = await this.db
        .update(housingListings)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(housingListings.id, id))
        .returning();
      return result || null;
    } catch (error) {
      throw new HousingDatabaseError('Failed to update listing', error);
    }
  }

  async deleteListing(id: number): Promise<void> {
    validateId(id);
    try {
      await this.db.delete(housingListings).where(eq(housingListings.id, id));
    } catch (error) {
      throw new HousingDatabaseError('Failed to delete listing', error);
    }
  }

  // ==============================
  // Bookings
  // ==============================

  async getBooking(id: number): Promise<SelectHousingBooking | null> {
    validateId(id);
    try {
      const result = await this.db.select().from(housingBookings).where(eq(housingBookings.id, id)).limit(1);
      return result[0] || null;
    } catch (error) {
      throw new HousingDatabaseError('Failed to get booking', error);
    }
  }

  async getGuestBookings(guestId: number): Promise<SelectHousingBooking[]> {
    validateId(guestId, 'guestId');
    try {
      return await this.db
        .select()
        .from(housingBookings)
        .where(eq(housingBookings.guestId, guestId))
        .orderBy(desc(housingBookings.checkInDate));
    } catch (error) {
      throw new HousingDatabaseError('Failed to get guest bookings', error);
    }
  }

  async getListingBookings(listingId: number): Promise<SelectHousingBooking[]> {
    validateId(listingId, 'listingId');
    try {
      return await this.db
        .select()
        .from(housingBookings)
        .where(eq(housingBookings.listingId, listingId))
        .orderBy(desc(housingBookings.checkInDate));
    } catch (error) {
      throw new HousingDatabaseError('Failed to get listing bookings', error);
    }
  }

  async createBooking(data: InsertHousingBooking): Promise<SelectHousingBooking> {
    validateBookingInput(data);
    try {
      const [result] = await this.db.insert(housingBookings).values(data).returning();
      return result;
    } catch (error) {
      throw new HousingDatabaseError('Failed to create booking', error);
    }
  }

  async updateBookingStatus(id: number, status: string): Promise<SelectHousingBooking | null> {
    validateId(id);
    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
    if (!validStatuses.includes(status)) {
      throw new HousingValidationError(`Invalid status: ${status}. Must be one of: ${validStatuses.join(', ')}`);
    }
    try {
      const [result] = await this.db
        .update(housingBookings)
        .set({ status })
        .where(eq(housingBookings.id, id))
        .returning();
      return result || null;
    } catch (error) {
      throw new HousingDatabaseError('Failed to update booking status', error);
    }
  }

  async deleteBooking(id: number): Promise<void> {
    validateId(id);
    try {
      await this.db.delete(housingBookings).where(eq(housingBookings.id, id));
    } catch (error) {
      throw new HousingDatabaseError('Failed to delete booking', error);
    }
  }

  // ==============================
  // Reviews
  // ==============================

  async getReview(id: number): Promise<SelectHousingReview | null> {
    validateId(id);
    try {
      const result = await this.db.select().from(housingReviews).where(eq(housingReviews.id, id)).limit(1);
      return result[0] || null;
    } catch (error) {
      throw new HousingDatabaseError('Failed to get review', error);
    }
  }

  async getListingReviews(listingId: number): Promise<SelectHousingReview[]> {
    validateId(listingId, 'listingId');
    try {
      return await this.db
        .select()
        .from(housingReviews)
        .where(eq(housingReviews.listingId, listingId))
        .orderBy(desc(housingReviews.createdAt));
    } catch (error) {
      throw new HousingDatabaseError('Failed to get listing reviews', error);
    }
  }

  async createReview(data: InsertHousingReview): Promise<SelectHousingReview> {
    validateId(data.listingId, 'listingId');
    validateId(data.reviewerId, 'reviewerId');
    if (data.rating < 1 || data.rating > 5) {
      throw new HousingValidationError('Rating must be between 1 and 5');
    }
    try {
      const [result] = await this.db.insert(housingReviews).values(data).returning();
      return result;
    } catch (error) {
      throw new HousingDatabaseError('Failed to create review', error);
    }
  }

  async deleteReview(id: number): Promise<void> {
    validateId(id);
    try {
      await this.db.delete(housingReviews).where(eq(housingReviews.id, id));
    } catch (error) {
      throw new HousingDatabaseError('Failed to delete review', error);
    }
  }

  // ==============================
  // Favorites
  // ==============================

  async getUserFavorites(userId: number): Promise<SelectHousingFavorite[]> {
    validateId(userId, 'userId');
    try {
      return await this.db
        .select()
        .from(housingFavorites)
        .where(eq(housingFavorites.userId, userId))
        .orderBy(desc(housingFavorites.createdAt));
    } catch (error) {
      throw new HousingDatabaseError('Failed to get user favorites', error);
    }
  }

  async addFavorite(userId: number, listingId: number): Promise<SelectHousingFavorite> {
    validateId(userId, 'userId');
    validateId(listingId, 'listingId');
    try {
      const [result] = await this.db.insert(housingFavorites).values({ userId, listingId }).returning();
      return result;
    } catch (error) {
      throw new HousingDatabaseError('Failed to add favorite', error);
    }
  }

  async removeFavorite(userId: number, listingId: number): Promise<void> {
    validateId(userId, 'userId');
    validateId(listingId, 'listingId');
    try {
      await this.db
        .delete(housingFavorites)
        .where(and(
          eq(housingFavorites.userId, userId),
          eq(housingFavorites.listingId, listingId)
        ));
    } catch (error) {
      throw new HousingDatabaseError('Failed to remove favorite', error);
    }
  }
}

// Export singleton instance
export const housingRepository = new HousingRepository();
