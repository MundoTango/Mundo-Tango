/**
 * Cities Repository
 * Handles city, city websites, city members, and location history database operations
 * MB.MD God Command #6: NEVER change ID column types
 * MB.MD God Command #2: Separation of concerns - extracted from storage.ts
 */

import { eq, and, ilike, desc } from 'drizzle-orm';
import { db as defaultDb } from '../core/connection';
import type { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import {
  cities,
  cityWebsites,
  cityMembers,
  userLocationHistory,
} from '@shared/schema';

// Infer types from tables
type SelectCity = typeof cities.$inferSelect;
type InsertCity = typeof cities.$inferInsert;
type SelectCityWebsite = typeof cityWebsites.$inferSelect;
type InsertCityWebsite = typeof cityWebsites.$inferInsert;
type SelectCityMember = typeof cityMembers.$inferSelect;
type InsertCityMember = typeof cityMembers.$inferInsert;
type SelectUserLocationHistory = typeof userLocationHistory.$inferSelect;
type InsertUserLocationHistory = typeof userLocationHistory.$inferInsert;

// ==============================
// Custom Error Classes
// ==============================

export class CitiesRepositoryError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'CitiesRepositoryError';
  }
}

export class CitiesValidationError extends CitiesRepositoryError {
  constructor(message: string, details?: unknown) {
    super(message, 'VALIDATION_ERROR', details);
    this.name = 'CitiesValidationError';
  }
}

export class CitiesDatabaseError extends CitiesRepositoryError {
  constructor(message: string, cause?: unknown) {
    super(message, 'DATABASE_ERROR', cause);
    this.name = 'CitiesDatabaseError';
  }
}

// ==============================
// Validation Helpers
// ==============================

const validateId = (id: number, fieldName: string = 'id'): void => {
  if (!Number.isInteger(id) || id <= 0) {
    throw new CitiesValidationError(`Invalid ${fieldName}: ${id}. Must be a positive integer.`);
  }
};

const validateCityInput = (data: InsertCity): void => {
  if (!data.name || data.name.trim().length === 0) {
    throw new CitiesValidationError('City name is required');
  }
  if (!data.country || data.country.trim().length === 0) {
    throw new CitiesValidationError('Country is required');
  }
};

// ==============================
// Cities Repository
// ==============================

export class CitiesRepository {
  private db: NeonHttpDatabase<Record<string, never>>;

  constructor(database?: NeonHttpDatabase<Record<string, never>>) {
    this.db = database || defaultDb;
  }

  // ==============================
  // Cities
  // ==============================

  async getCity(id: number): Promise<SelectCity | null> {
    validateId(id);
    try {
      const result = await this.db.select().from(cities).where(eq(cities.id, id)).limit(1);
      return result[0] || null;
    } catch (error) {
      throw new CitiesDatabaseError('Failed to get city', error);
    }
  }

  async getCityBySlug(slug: string): Promise<SelectCity | null> {
    if (!slug || slug.trim().length === 0) {
      throw new CitiesValidationError('Slug is required');
    }
    try {
      const result = await this.db.select().from(cities).where(eq(cities.slug, slug)).limit(1);
      return result[0] || null;
    } catch (error) {
      throw new CitiesDatabaseError('Failed to get city by slug', error);
    }
  }

  async searchCities(query: string, limit: number = 20): Promise<SelectCity[]> {
    if (!query || query.trim().length === 0) {
      throw new CitiesValidationError('Search query is required');
    }
    try {
      return await this.db
        .select()
        .from(cities)
        .where(ilike(cities.name, `%${query}%`))
        .limit(limit);
    } catch (error) {
      throw new CitiesDatabaseError('Failed to search cities', error);
    }
  }

  async createCity(data: InsertCity): Promise<SelectCity> {
    validateCityInput(data);
    try {
      const [result] = await this.db.insert(cities).values(data).returning();
      return result;
    } catch (error) {
      throw new CitiesDatabaseError('Failed to create city', error);
    }
  }

  async updateCity(id: number, data: Partial<SelectCity>): Promise<SelectCity | null> {
    validateId(id);
    try {
      const [result] = await this.db
        .update(cities)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(cities.id, id))
        .returning();
      return result || null;
    } catch (error) {
      throw new CitiesDatabaseError('Failed to update city', error);
    }
  }

  async deleteCity(id: number): Promise<void> {
    validateId(id);
    try {
      await this.db.delete(cities).where(eq(cities.id, id));
    } catch (error) {
      throw new CitiesDatabaseError('Failed to delete city', error);
    }
  }

  // ==============================
  // City Websites
  // ==============================

  async getCityWebsites(cityId: number): Promise<SelectCityWebsite[]> {
    validateId(cityId, 'cityId');
    try {
      return await this.db
        .select()
        .from(cityWebsites)
        .where(eq(cityWebsites.cityId, cityId));
    } catch (error) {
      throw new CitiesDatabaseError('Failed to get city websites', error);
    }
  }

  async createCityWebsite(data: InsertCityWebsite): Promise<SelectCityWebsite> {
    validateId(data.cityId, 'cityId');
    if (!data.url || data.url.trim().length === 0) {
      throw new CitiesValidationError('URL is required');
    }
    try {
      const [result] = await this.db.insert(cityWebsites).values(data).returning();
      return result;
    } catch (error) {
      throw new CitiesDatabaseError('Failed to create city website', error);
    }
  }

  async deleteCityWebsite(id: number): Promise<void> {
    validateId(id);
    try {
      await this.db.delete(cityWebsites).where(eq(cityWebsites.id, id));
    } catch (error) {
      throw new CitiesDatabaseError('Failed to delete city website', error);
    }
  }

  // ==============================
  // City Members
  // ==============================

  async getCityMembers(cityId: number): Promise<SelectCityMember[]> {
    validateId(cityId, 'cityId');
    try {
      return await this.db
        .select()
        .from(cityMembers)
        .where(eq(cityMembers.cityId, cityId));
    } catch (error) {
      throw new CitiesDatabaseError('Failed to get city members', error);
    }
  }

  async getUserCities(userId: number): Promise<SelectCityMember[]> {
    validateId(userId, 'userId');
    try {
      return await this.db
        .select()
        .from(cityMembers)
        .where(eq(cityMembers.userId, userId));
    } catch (error) {
      throw new CitiesDatabaseError('Failed to get user cities', error);
    }
  }

  async addCityMember(data: InsertCityMember): Promise<SelectCityMember> {
    validateId(data.cityId, 'cityId');
    validateId(data.userId, 'userId');
    try {
      const [result] = await this.db.insert(cityMembers).values(data).returning();
      return result;
    } catch (error) {
      throw new CitiesDatabaseError('Failed to add city member', error);
    }
  }

  async removeCityMember(cityId: number, userId: number): Promise<void> {
    validateId(cityId, 'cityId');
    validateId(userId, 'userId');
    try {
      await this.db
        .delete(cityMembers)
        .where(and(
          eq(cityMembers.cityId, cityId),
          eq(cityMembers.userId, userId)
        ));
    } catch (error) {
      throw new CitiesDatabaseError('Failed to remove city member', error);
    }
  }

  // ==============================
  // User Location History
  // ==============================

  async getUserLocationHistory(userId: number, limit: number = 20): Promise<SelectUserLocationHistory[]> {
    validateId(userId, 'userId');
    try {
      return await this.db
        .select()
        .from(userLocationHistory)
        .where(eq(userLocationHistory.userId, userId))
        .orderBy(desc(userLocationHistory.createdAt))
        .limit(limit);
    } catch (error) {
      throw new CitiesDatabaseError('Failed to get user location history', error);
    }
  }

  async logLocationVisit(data: InsertUserLocationHistory): Promise<SelectUserLocationHistory> {
    validateId(data.userId, 'userId');
    validateId(data.cityId, 'cityId');
    try {
      const [result] = await this.db.insert(userLocationHistory).values(data).returning();
      return result;
    } catch (error) {
      throw new CitiesDatabaseError('Failed to log location visit', error);
    }
  }
}

// Export singleton instance
export const citiesRepository = new CitiesRepository();
