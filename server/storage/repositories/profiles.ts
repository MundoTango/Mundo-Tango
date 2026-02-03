/**
 * Profiles Repository
 * Handles all professional profile-related database operations for 17 profile types
 * MB.MD God Command #6: NEVER change ID column types
 * MB.MD God Command #2: Separation of concerns - extracted from storage.ts
 */

import { eq } from 'drizzle-orm';
import { db as defaultDb } from '../core/connection';
import type { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import {
  // Profile tables
  teacherProfiles,
  djProfiles,
  photographerProfiles,
  performerProfiles,
  vendorProfiles,
  musicianProfiles,
  choreographerProfiles,
  tangoSchoolProfiles,
  tangoHotelProfiles,
  wellnessProfiles,
  tourOperatorProfiles,
  hostVenueProfiles,
  tangoGuideProfiles,
  contentCreatorProfiles,
  learningResourceProfiles,
  taxiDancerProfiles,
  organizerProfiles,
  // Types
  type SelectTeacherProfile,
  type InsertTeacherProfile,
  type SelectDJProfile,
  type InsertDJProfile,
  type SelectPhotographerProfile,
  type InsertPhotographerProfile,
  type SelectPerformerProfile,
  type InsertPerformerProfile,
  type SelectVendorProfile,
  type InsertVendorProfile,
  type SelectMusicianProfile,
  type InsertMusicianProfile,
  type SelectChoreographerProfile,
  type InsertChoreographerProfile,
  type SelectTangoSchoolProfile,
  type InsertTangoSchoolProfile,
  type SelectTangoHotelProfile,
  type InsertTangoHotelProfile,
  type SelectWellnessProfile,
  type InsertWellnessProfile,
  type SelectTourOperatorProfile,
  type InsertTourOperatorProfile,
  type SelectHostVenueProfile,
  type InsertHostVenueProfile,
  type SelectTangoGuideProfile,
  type InsertTangoGuideProfile,
  type SelectContentCreatorProfile,
  type InsertContentCreatorProfile,
  type SelectLearningResourceProfile,
  type InsertLearningResourceProfile,
  type SelectTaxiDancerProfile,
  type InsertTaxiDancerProfile,
  type SelectOrganizerProfile,
  type InsertOrganizerProfile,
} from '@shared/schema';

// ==============================
// Custom Error Classes
// ==============================

export class ProfileRepositoryError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ProfileRepositoryError';
  }
}

export class ProfileValidationError extends ProfileRepositoryError {
  constructor(message: string, details?: unknown) {
    super(message, 'VALIDATION_ERROR', details);
    this.name = 'ProfileValidationError';
  }
}

export class ProfileDatabaseError extends ProfileRepositoryError {
  constructor(message: string, cause?: unknown) {
    super(message, 'DATABASE_ERROR', cause);
    this.name = 'ProfileDatabaseError';
  }
}

// ==============================
// Validation Helpers
// ==============================

const validateUserId = (userId: number): void => {
  if (!Number.isInteger(userId) || userId <= 0) {
    throw new ProfileValidationError(`Invalid userId: ${userId}. Must be a positive integer.`);
  }
};

const VALID_PROFILE_TYPES = [
  'teacher', 'dj', 'photographer', 'performer', 'vendor',
  'musician', 'choreographer', 'tangoSchool', 'tangoHotel',
  'wellness', 'tourOperator', 'hostVenue', 'tangoGuide',
  'contentCreator', 'learningResource', 'taxiDancer', 'organizer'
] as const;

type ProfileType = typeof VALID_PROFILE_TYPES[number];

const validateProfileType = (type: string): ProfileType => {
  if (!VALID_PROFILE_TYPES.includes(type as ProfileType)) {
    throw new ProfileValidationError(
      `Invalid profile type: ${type}. Must be one of: ${VALID_PROFILE_TYPES.join(', ')}`
    );
  }
  return type as ProfileType;
};

// ==============================
// Profiles Repository
// ==============================

export class ProfilesRepository {
  private db: NeonHttpDatabase<Record<string, never>>;

  constructor(database?: NeonHttpDatabase<Record<string, never>>) {
    this.db = database || defaultDb;
  }

  // ==============================
  // Teacher Profiles
  // ==============================

  async getTeacherProfile(userId: number): Promise<SelectTeacherProfile | null> {
    validateUserId(userId);
    try {
      const result = await this.db.select().from(teacherProfiles).where(eq(teacherProfiles.userId, userId)).limit(1);
      return result[0] || null;
    } catch (error) {
      throw new ProfileDatabaseError('Failed to get teacher profile', error);
    }
  }

  async createTeacherProfile(data: InsertTeacherProfile): Promise<SelectTeacherProfile> {
    validateUserId(data.userId);
    try {
      const [result] = await this.db.insert(teacherProfiles).values(data).returning();
      return result;
    } catch (error) {
      throw new ProfileDatabaseError('Failed to create teacher profile', error);
    }
  }

  async updateTeacherProfile(userId: number, data: Partial<SelectTeacherProfile>): Promise<SelectTeacherProfile | null> {
    validateUserId(userId);
    try {
      const [result] = await this.db
        .update(teacherProfiles)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(teacherProfiles.userId, userId))
        .returning();
      return result || null;
    } catch (error) {
      throw new ProfileDatabaseError('Failed to update teacher profile', error);
    }
  }

  async deleteTeacherProfile(userId: number): Promise<void> {
    validateUserId(userId);
    try {
      await this.db.delete(teacherProfiles).where(eq(teacherProfiles.userId, userId));
    } catch (error) {
      throw new ProfileDatabaseError('Failed to delete teacher profile', error);
    }
  }

  // ==============================
  // DJ Profiles
  // ==============================

  async getDJProfile(userId: number): Promise<SelectDJProfile | null> {
    validateUserId(userId);
    try {
      const result = await this.db.select().from(djProfiles).where(eq(djProfiles.userId, userId)).limit(1);
      return result[0] || null;
    } catch (error) {
      throw new ProfileDatabaseError('Failed to get DJ profile', error);
    }
  }

  async createDJProfile(data: InsertDJProfile): Promise<SelectDJProfile> {
    validateUserId(data.userId);
    try {
      const [result] = await this.db.insert(djProfiles).values(data).returning();
      return result;
    } catch (error) {
      throw new ProfileDatabaseError('Failed to create DJ profile', error);
    }
  }

  async updateDJProfile(userId: number, data: Partial<SelectDJProfile>): Promise<SelectDJProfile | null> {
    validateUserId(userId);
    try {
      const [result] = await this.db
        .update(djProfiles)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(djProfiles.userId, userId))
        .returning();
      return result || null;
    } catch (error) {
      throw new ProfileDatabaseError('Failed to update DJ profile', error);
    }
  }

  async deleteDJProfile(userId: number): Promise<void> {
    validateUserId(userId);
    try {
      await this.db.delete(djProfiles).where(eq(djProfiles.userId, userId));
    } catch (error) {
      throw new ProfileDatabaseError('Failed to delete DJ profile', error);
    }
  }

  // ==============================
  // Photographer Profiles
  // ==============================

  async getPhotographerProfile(userId: number): Promise<SelectPhotographerProfile | null> {
    validateUserId(userId);
    try {
      const result = await this.db.select().from(photographerProfiles).where(eq(photographerProfiles.userId, userId)).limit(1);
      return result[0] || null;
    } catch (error) {
      throw new ProfileDatabaseError('Failed to get photographer profile', error);
    }
  }

  async createPhotographerProfile(data: InsertPhotographerProfile): Promise<SelectPhotographerProfile> {
    validateUserId(data.userId);
    try {
      const [result] = await this.db.insert(photographerProfiles).values(data).returning();
      return result;
    } catch (error) {
      throw new ProfileDatabaseError('Failed to create photographer profile', error);
    }
  }

  async updatePhotographerProfile(userId: number, data: Partial<SelectPhotographerProfile>): Promise<SelectPhotographerProfile | null> {
    validateUserId(userId);
    try {
      const [result] = await this.db
        .update(photographerProfiles)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(photographerProfiles.userId, userId))
        .returning();
      return result || null;
    } catch (error) {
      throw new ProfileDatabaseError('Failed to update photographer profile', error);
    }
  }

  async deletePhotographerProfile(userId: number): Promise<void> {
    validateUserId(userId);
    try {
      await this.db.delete(photographerProfiles).where(eq(photographerProfiles.userId, userId));
    } catch (error) {
      throw new ProfileDatabaseError('Failed to delete photographer profile', error);
    }
  }

  // ==============================
  // Performer Profiles
  // ==============================

  async getPerformerProfile(userId: number): Promise<SelectPerformerProfile | null> {
    validateUserId(userId);
    try {
      const result = await this.db.select().from(performerProfiles).where(eq(performerProfiles.userId, userId)).limit(1);
      return result[0] || null;
    } catch (error) {
      throw new ProfileDatabaseError('Failed to get performer profile', error);
    }
  }

  async createPerformerProfile(data: InsertPerformerProfile): Promise<SelectPerformerProfile> {
    validateUserId(data.userId);
    try {
      const [result] = await this.db.insert(performerProfiles).values(data).returning();
      return result;
    } catch (error) {
      throw new ProfileDatabaseError('Failed to create performer profile', error);
    }
  }

  async updatePerformerProfile(userId: number, data: Partial<SelectPerformerProfile>): Promise<SelectPerformerProfile | null> {
    validateUserId(userId);
    try {
      const [result] = await this.db
        .update(performerProfiles)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(performerProfiles.userId, userId))
        .returning();
      return result || null;
    } catch (error) {
      throw new ProfileDatabaseError('Failed to update performer profile', error);
    }
  }

  async deletePerformerProfile(userId: number): Promise<void> {
    validateUserId(userId);
    try {
      await this.db.delete(performerProfiles).where(eq(performerProfiles.userId, userId));
    } catch (error) {
      throw new ProfileDatabaseError('Failed to delete performer profile', error);
    }
  }

  // ==============================
  // Vendor Profiles
  // ==============================

  async getVendorProfile(userId: number): Promise<SelectVendorProfile | null> {
    validateUserId(userId);
    try {
      const result = await this.db.select().from(vendorProfiles).where(eq(vendorProfiles.userId, userId)).limit(1);
      return result[0] || null;
    } catch (error) {
      throw new ProfileDatabaseError('Failed to get vendor profile', error);
    }
  }

  async createVendorProfile(data: InsertVendorProfile): Promise<SelectVendorProfile> {
    validateUserId(data.userId);
    try {
      const [result] = await this.db.insert(vendorProfiles).values(data).returning();
      return result;
    } catch (error) {
      throw new ProfileDatabaseError('Failed to create vendor profile', error);
    }
  }

  async updateVendorProfile(userId: number, data: Partial<SelectVendorProfile>): Promise<SelectVendorProfile | null> {
    validateUserId(userId);
    try {
      const [result] = await this.db
        .update(vendorProfiles)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(vendorProfiles.userId, userId))
        .returning();
      return result || null;
    } catch (error) {
      throw new ProfileDatabaseError('Failed to update vendor profile', error);
    }
  }

  async deleteVendorProfile(userId: number): Promise<void> {
    validateUserId(userId);
    try {
      await this.db.delete(vendorProfiles).where(eq(vendorProfiles.userId, userId));
    } catch (error) {
      throw new ProfileDatabaseError('Failed to delete vendor profile', error);
    }
  }

  // ==============================
  // Musician Profiles
  // ==============================

  async getMusicianProfile(userId: number): Promise<SelectMusicianProfile | null> {
    validateUserId(userId);
    try {
      const result = await this.db.select().from(musicianProfiles).where(eq(musicianProfiles.userId, userId)).limit(1);
      return result[0] || null;
    } catch (error) {
      throw new ProfileDatabaseError('Failed to get musician profile', error);
    }
  }

  async createMusicianProfile(data: InsertMusicianProfile): Promise<SelectMusicianProfile> {
    validateUserId(data.userId);
    try {
      const [result] = await this.db.insert(musicianProfiles).values(data).returning();
      return result;
    } catch (error) {
      throw new ProfileDatabaseError('Failed to create musician profile', error);
    }
  }

  async updateMusicianProfile(userId: number, data: Partial<SelectMusicianProfile>): Promise<SelectMusicianProfile | null> {
    validateUserId(userId);
    try {
      const [result] = await this.db
        .update(musicianProfiles)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(musicianProfiles.userId, userId))
        .returning();
      return result || null;
    } catch (error) {
      throw new ProfileDatabaseError('Failed to update musician profile', error);
    }
  }

  async deleteMusicianProfile(userId: number): Promise<void> {
    validateUserId(userId);
    try {
      await this.db.delete(musicianProfiles).where(eq(musicianProfiles.userId, userId));
    } catch (error) {
      throw new ProfileDatabaseError('Failed to delete musician profile', error);
    }
  }

  // ==============================
  // Choreographer Profiles
  // ==============================

  async getChoreographerProfile(userId: number): Promise<SelectChoreographerProfile | null> {
    validateUserId(userId);
    try {
      const result = await this.db.select().from(choreographerProfiles).where(eq(choreographerProfiles.userId, userId)).limit(1);
      return result[0] || null;
    } catch (error) {
      throw new ProfileDatabaseError('Failed to get choreographer profile', error);
    }
  }

  async createChoreographerProfile(data: InsertChoreographerProfile): Promise<SelectChoreographerProfile> {
    validateUserId(data.userId);
    try {
      const [result] = await this.db.insert(choreographerProfiles).values(data).returning();
      return result;
    } catch (error) {
      throw new ProfileDatabaseError('Failed to create choreographer profile', error);
    }
  }

  async updateChoreographerProfile(userId: number, data: Partial<SelectChoreographerProfile>): Promise<SelectChoreographerProfile | null> {
    validateUserId(userId);
    try {
      const [result] = await this.db
        .update(choreographerProfiles)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(choreographerProfiles.userId, userId))
        .returning();
      return result || null;
    } catch (error) {
      throw new ProfileDatabaseError('Failed to update choreographer profile', error);
    }
  }

  async deleteChoreographerProfile(userId: number): Promise<void> {
    validateUserId(userId);
    try {
      await this.db.delete(choreographerProfiles).where(eq(choreographerProfiles.userId, userId));
    } catch (error) {
      throw new ProfileDatabaseError('Failed to delete choreographer profile', error);
    }
  }

  // ==============================
  // Tango School Profiles
  // ==============================

  async getTangoSchoolProfile(userId: number): Promise<SelectTangoSchoolProfile | null> {
    validateUserId(userId);
    try {
      const result = await this.db.select().from(tangoSchoolProfiles).where(eq(tangoSchoolProfiles.userId, userId)).limit(1);
      return result[0] || null;
    } catch (error) {
      throw new ProfileDatabaseError('Failed to get tango school profile', error);
    }
  }

  async createTangoSchoolProfile(data: InsertTangoSchoolProfile): Promise<SelectTangoSchoolProfile> {
    validateUserId(data.userId);
    try {
      const [result] = await this.db.insert(tangoSchoolProfiles).values(data).returning();
      return result;
    } catch (error) {
      throw new ProfileDatabaseError('Failed to create tango school profile', error);
    }
  }

  async updateTangoSchoolProfile(userId: number, data: Partial<SelectTangoSchoolProfile>): Promise<SelectTangoSchoolProfile | null> {
    validateUserId(userId);
    try {
      const [result] = await this.db
        .update(tangoSchoolProfiles)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(tangoSchoolProfiles.userId, userId))
        .returning();
      return result || null;
    } catch (error) {
      throw new ProfileDatabaseError('Failed to update tango school profile', error);
    }
  }

  async deleteTangoSchoolProfile(userId: number): Promise<void> {
    validateUserId(userId);
    try {
      await this.db.delete(tangoSchoolProfiles).where(eq(tangoSchoolProfiles.userId, userId));
    } catch (error) {
      throw new ProfileDatabaseError('Failed to delete tango school profile', error);
    }
  }

  // ==============================
  // Tango Hotel Profiles
  // ==============================

  async getTangoHotelProfile(userId: number): Promise<SelectTangoHotelProfile | null> {
    validateUserId(userId);
    try {
      const result = await this.db.select().from(tangoHotelProfiles).where(eq(tangoHotelProfiles.userId, userId)).limit(1);
      return result[0] || null;
    } catch (error) {
      throw new ProfileDatabaseError('Failed to get tango hotel profile', error);
    }
  }

  async createTangoHotelProfile(data: InsertTangoHotelProfile): Promise<SelectTangoHotelProfile> {
    validateUserId(data.userId);
    try {
      const [result] = await this.db.insert(tangoHotelProfiles).values(data).returning();
      return result;
    } catch (error) {
      throw new ProfileDatabaseError('Failed to create tango hotel profile', error);
    }
  }

  async updateTangoHotelProfile(userId: number, data: Partial<SelectTangoHotelProfile>): Promise<SelectTangoHotelProfile | null> {
    validateUserId(userId);
    try {
      const [result] = await this.db
        .update(tangoHotelProfiles)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(tangoHotelProfiles.userId, userId))
        .returning();
      return result || null;
    } catch (error) {
      throw new ProfileDatabaseError('Failed to update tango hotel profile', error);
    }
  }

  async deleteTangoHotelProfile(userId: number): Promise<void> {
    validateUserId(userId);
    try {
      await this.db.delete(tangoHotelProfiles).where(eq(tangoHotelProfiles.userId, userId));
    } catch (error) {
      throw new ProfileDatabaseError('Failed to delete tango hotel profile', error);
    }
  }

  // ==============================
  // Wellness Profiles
  // ==============================

  async getWellnessProfile(userId: number): Promise<SelectWellnessProfile | null> {
    validateUserId(userId);
    try {
      const result = await this.db.select().from(wellnessProfiles).where(eq(wellnessProfiles.userId, userId)).limit(1);
      return result[0] || null;
    } catch (error) {
      throw new ProfileDatabaseError('Failed to get wellness profile', error);
    }
  }

  async createWellnessProfile(data: InsertWellnessProfile): Promise<SelectWellnessProfile> {
    validateUserId(data.userId);
    try {
      const [result] = await this.db.insert(wellnessProfiles).values(data).returning();
      return result;
    } catch (error) {
      throw new ProfileDatabaseError('Failed to create wellness profile', error);
    }
  }

  async updateWellnessProfile(userId: number, data: Partial<SelectWellnessProfile>): Promise<SelectWellnessProfile | null> {
    validateUserId(userId);
    try {
      const [result] = await this.db
        .update(wellnessProfiles)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(wellnessProfiles.userId, userId))
        .returning();
      return result || null;
    } catch (error) {
      throw new ProfileDatabaseError('Failed to update wellness profile', error);
    }
  }

  async deleteWellnessProfile(userId: number): Promise<void> {
    validateUserId(userId);
    try {
      await this.db.delete(wellnessProfiles).where(eq(wellnessProfiles.userId, userId));
    } catch (error) {
      throw new ProfileDatabaseError('Failed to delete wellness profile', error);
    }
  }

  // ==============================
  // Tour Operator Profiles
  // ==============================

  async getTourOperatorProfile(userId: number): Promise<SelectTourOperatorProfile | null> {
    validateUserId(userId);
    try {
      const result = await this.db.select().from(tourOperatorProfiles).where(eq(tourOperatorProfiles.userId, userId)).limit(1);
      return result[0] || null;
    } catch (error) {
      throw new ProfileDatabaseError('Failed to get tour operator profile', error);
    }
  }

  async createTourOperatorProfile(data: InsertTourOperatorProfile): Promise<SelectTourOperatorProfile> {
    validateUserId(data.userId);
    try {
      const [result] = await this.db.insert(tourOperatorProfiles).values(data).returning();
      return result;
    } catch (error) {
      throw new ProfileDatabaseError('Failed to create tour operator profile', error);
    }
  }

  async updateTourOperatorProfile(userId: number, data: Partial<SelectTourOperatorProfile>): Promise<SelectTourOperatorProfile | null> {
    validateUserId(userId);
    try {
      const [result] = await this.db
        .update(tourOperatorProfiles)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(tourOperatorProfiles.userId, userId))
        .returning();
      return result || null;
    } catch (error) {
      throw new ProfileDatabaseError('Failed to update tour operator profile', error);
    }
  }

  async deleteTourOperatorProfile(userId: number): Promise<void> {
    validateUserId(userId);
    try {
      await this.db.delete(tourOperatorProfiles).where(eq(tourOperatorProfiles.userId, userId));
    } catch (error) {
      throw new ProfileDatabaseError('Failed to delete tour operator profile', error);
    }
  }

  // ==============================
  // Host Venue Profiles
  // ==============================

  async getHostVenueProfile(userId: number): Promise<SelectHostVenueProfile | null> {
    validateUserId(userId);
    try {
      const result = await this.db.select().from(hostVenueProfiles).where(eq(hostVenueProfiles.userId, userId)).limit(1);
      return result[0] || null;
    } catch (error) {
      throw new ProfileDatabaseError('Failed to get host venue profile', error);
    }
  }

  async createHostVenueProfile(data: InsertHostVenueProfile): Promise<SelectHostVenueProfile> {
    validateUserId(data.userId);
    try {
      const [result] = await this.db.insert(hostVenueProfiles).values(data).returning();
      return result;
    } catch (error) {
      throw new ProfileDatabaseError('Failed to create host venue profile', error);
    }
  }

  async updateHostVenueProfile(userId: number, data: Partial<SelectHostVenueProfile>): Promise<SelectHostVenueProfile | null> {
    validateUserId(userId);
    try {
      const [result] = await this.db
        .update(hostVenueProfiles)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(hostVenueProfiles.userId, userId))
        .returning();
      return result || null;
    } catch (error) {
      throw new ProfileDatabaseError('Failed to update host venue profile', error);
    }
  }

  async deleteHostVenueProfile(userId: number): Promise<void> {
    validateUserId(userId);
    try {
      await this.db.delete(hostVenueProfiles).where(eq(hostVenueProfiles.userId, userId));
    } catch (error) {
      throw new ProfileDatabaseError('Failed to delete host venue profile', error);
    }
  }

  // ==============================
  // Tango Guide Profiles
  // ==============================

  async getTangoGuideProfile(userId: number): Promise<SelectTangoGuideProfile | null> {
    validateUserId(userId);
    try {
      const result = await this.db.select().from(tangoGuideProfiles).where(eq(tangoGuideProfiles.userId, userId)).limit(1);
      return result[0] || null;
    } catch (error) {
      throw new ProfileDatabaseError('Failed to get tango guide profile', error);
    }
  }

  async createTangoGuideProfile(data: InsertTangoGuideProfile): Promise<SelectTangoGuideProfile> {
    validateUserId(data.userId);
    try {
      const [result] = await this.db.insert(tangoGuideProfiles).values(data).returning();
      return result;
    } catch (error) {
      throw new ProfileDatabaseError('Failed to create tango guide profile', error);
    }
  }

  async updateTangoGuideProfile(userId: number, data: Partial<SelectTangoGuideProfile>): Promise<SelectTangoGuideProfile | null> {
    validateUserId(userId);
    try {
      const [result] = await this.db
        .update(tangoGuideProfiles)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(tangoGuideProfiles.userId, userId))
        .returning();
      return result || null;
    } catch (error) {
      throw new ProfileDatabaseError('Failed to update tango guide profile', error);
    }
  }

  async deleteTangoGuideProfile(userId: number): Promise<void> {
    validateUserId(userId);
    try {
      await this.db.delete(tangoGuideProfiles).where(eq(tangoGuideProfiles.userId, userId));
    } catch (error) {
      throw new ProfileDatabaseError('Failed to delete tango guide profile', error);
    }
  }

  // ==============================
  // Content Creator Profiles
  // ==============================

  async getContentCreatorProfile(userId: number): Promise<SelectContentCreatorProfile | null> {
    validateUserId(userId);
    try {
      const result = await this.db.select().from(contentCreatorProfiles).where(eq(contentCreatorProfiles.userId, userId)).limit(1);
      return result[0] || null;
    } catch (error) {
      throw new ProfileDatabaseError('Failed to get content creator profile', error);
    }
  }

  async createContentCreatorProfile(data: InsertContentCreatorProfile): Promise<SelectContentCreatorProfile> {
    validateUserId(data.userId);
    try {
      const [result] = await this.db.insert(contentCreatorProfiles).values(data).returning();
      return result;
    } catch (error) {
      throw new ProfileDatabaseError('Failed to create content creator profile', error);
    }
  }

  async updateContentCreatorProfile(userId: number, data: Partial<SelectContentCreatorProfile>): Promise<SelectContentCreatorProfile | null> {
    validateUserId(userId);
    try {
      const [result] = await this.db
        .update(contentCreatorProfiles)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(contentCreatorProfiles.userId, userId))
        .returning();
      return result || null;
    } catch (error) {
      throw new ProfileDatabaseError('Failed to update content creator profile', error);
    }
  }

  async deleteContentCreatorProfile(userId: number): Promise<void> {
    validateUserId(userId);
    try {
      await this.db.delete(contentCreatorProfiles).where(eq(contentCreatorProfiles.userId, userId));
    } catch (error) {
      throw new ProfileDatabaseError('Failed to delete content creator profile', error);
    }
  }

  // ==============================
  // Learning Resource Profiles
  // ==============================

  async getLearningResourceProfile(userId: number): Promise<SelectLearningResourceProfile | null> {
    validateUserId(userId);
    try {
      const result = await this.db.select().from(learningResourceProfiles).where(eq(learningResourceProfiles.userId, userId)).limit(1);
      return result[0] || null;
    } catch (error) {
      throw new ProfileDatabaseError('Failed to get learning resource profile', error);
    }
  }

  async createLearningResourceProfile(data: InsertLearningResourceProfile): Promise<SelectLearningResourceProfile> {
    validateUserId(data.userId);
    try {
      const [result] = await this.db.insert(learningResourceProfiles).values(data).returning();
      return result;
    } catch (error) {
      throw new ProfileDatabaseError('Failed to create learning resource profile', error);
    }
  }

  async updateLearningResourceProfile(userId: number, data: Partial<SelectLearningResourceProfile>): Promise<SelectLearningResourceProfile | null> {
    validateUserId(userId);
    try {
      const [result] = await this.db
        .update(learningResourceProfiles)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(learningResourceProfiles.userId, userId))
        .returning();
      return result || null;
    } catch (error) {
      throw new ProfileDatabaseError('Failed to update learning resource profile', error);
    }
  }

  async deleteLearningResourceProfile(userId: number): Promise<void> {
    validateUserId(userId);
    try {
      await this.db.delete(learningResourceProfiles).where(eq(learningResourceProfiles.userId, userId));
    } catch (error) {
      throw new ProfileDatabaseError('Failed to delete learning resource profile', error);
    }
  }

  // ==============================
  // Taxi Dancer Profiles
  // ==============================

  async getTaxiDancerProfile(userId: number): Promise<SelectTaxiDancerProfile | null> {
    validateUserId(userId);
    try {
      const result = await this.db.select().from(taxiDancerProfiles).where(eq(taxiDancerProfiles.userId, userId)).limit(1);
      return result[0] || null;
    } catch (error) {
      throw new ProfileDatabaseError('Failed to get taxi dancer profile', error);
    }
  }

  async createTaxiDancerProfile(data: InsertTaxiDancerProfile): Promise<SelectTaxiDancerProfile> {
    validateUserId(data.userId);
    try {
      const [result] = await this.db.insert(taxiDancerProfiles).values(data).returning();
      return result;
    } catch (error) {
      throw new ProfileDatabaseError('Failed to create taxi dancer profile', error);
    }
  }

  async updateTaxiDancerProfile(userId: number, data: Partial<SelectTaxiDancerProfile>): Promise<SelectTaxiDancerProfile | null> {
    validateUserId(userId);
    try {
      const [result] = await this.db
        .update(taxiDancerProfiles)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(taxiDancerProfiles.userId, userId))
        .returning();
      return result || null;
    } catch (error) {
      throw new ProfileDatabaseError('Failed to update taxi dancer profile', error);
    }
  }

  async deleteTaxiDancerProfile(userId: number): Promise<void> {
    validateUserId(userId);
    try {
      await this.db.delete(taxiDancerProfiles).where(eq(taxiDancerProfiles.userId, userId));
    } catch (error) {
      throw new ProfileDatabaseError('Failed to delete taxi dancer profile', error);
    }
  }

  // ==============================
  // Organizer Profiles
  // ==============================

  async getOrganizerProfile(userId: number): Promise<SelectOrganizerProfile | null> {
    validateUserId(userId);
    try {
      const result = await this.db.select().from(organizerProfiles).where(eq(organizerProfiles.userId, userId)).limit(1);
      return result[0] || null;
    } catch (error) {
      throw new ProfileDatabaseError('Failed to get organizer profile', error);
    }
  }

  async createOrganizerProfile(data: InsertOrganizerProfile): Promise<SelectOrganizerProfile> {
    validateUserId(data.userId);
    try {
      const [result] = await this.db.insert(organizerProfiles).values(data).returning();
      return result;
    } catch (error) {
      throw new ProfileDatabaseError('Failed to create organizer profile', error);
    }
  }

  async updateOrganizerProfile(userId: number, data: Partial<SelectOrganizerProfile>): Promise<SelectOrganizerProfile | null> {
    validateUserId(userId);
    try {
      const [result] = await this.db
        .update(organizerProfiles)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(organizerProfiles.userId, userId))
        .returning();
      return result || null;
    } catch (error) {
      throw new ProfileDatabaseError('Failed to update organizer profile', error);
    }
  }

  async deleteOrganizerProfile(userId: number): Promise<void> {
    validateUserId(userId);
    try {
      await this.db.delete(organizerProfiles).where(eq(organizerProfiles.userId, userId));
    } catch (error) {
      throw new ProfileDatabaseError('Failed to delete organizer profile', error);
    }
  }
}

// Export singleton instance
export const profilesRepository = new ProfilesRepository();
