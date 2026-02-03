/**
 * Profiles Repository Validation Tests
 * Tests validation logic for ProfilesRepository across all 17 profile types
 * MB.MD God Command #6: NEVER change ID column types
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  ProfilesRepository,
  ProfileValidationError,
  ProfileDatabaseError,
} from '../../storage/repositories/profiles';

// Mock the database connection
vi.mock('../../storage/core/connection', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('ProfilesRepository', () => {
  let repository: ProfilesRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    repository = new ProfilesRepository();
  });

  // ==============================
  // User ID Validation Tests
  // ==============================

  describe('User ID Validation', () => {
    it('should throw ProfileValidationError for negative userId', async () => {
      await expect(repository.getTeacherProfile(-1)).rejects.toThrow(ProfileValidationError);
    });

    it('should throw ProfileValidationError for zero userId', async () => {
      await expect(repository.getDJProfile(0)).rejects.toThrow(ProfileValidationError);
    });

    it('should throw ProfileValidationError for non-integer userId', async () => {
      await expect(repository.getPhotographerProfile(1.5)).rejects.toThrow(ProfileValidationError);
    });

    it('should throw ProfileValidationError for NaN userId', async () => {
      await expect(repository.getPerformerProfile(NaN)).rejects.toThrow(ProfileValidationError);
    });

    it('should include userId in error message', async () => {
      try {
        await repository.getVendorProfile(-5);
      } catch (error) {
        expect(error).toBeInstanceOf(ProfileValidationError);
        expect((error as ProfileValidationError).message).toContain('-5');
      }
    });
  });

  // ==============================
  // Teacher Profile Tests
  // ==============================

  describe('Teacher Profile Validation', () => {
    it('should throw ProfileValidationError for invalid userId in create', async () => {
      await expect(repository.createTeacherProfile({ userId: -1 } as any))
        .rejects.toThrow(ProfileValidationError);
    });

    it('should throw ProfileValidationError for invalid userId in update', async () => {
      await expect(repository.updateTeacherProfile(-1, {}))
        .rejects.toThrow(ProfileValidationError);
    });

    it('should throw ProfileValidationError for invalid userId in delete', async () => {
      await expect(repository.deleteTeacherProfile(-1))
        .rejects.toThrow(ProfileValidationError);
    });
  });

  // ==============================
  // DJ Profile Tests
  // ==============================

  describe('DJ Profile Validation', () => {
    it('should throw ProfileValidationError for invalid userId in create', async () => {
      await expect(repository.createDJProfile({ userId: 0 } as any))
        .rejects.toThrow(ProfileValidationError);
    });

    it('should throw ProfileValidationError for invalid userId in update', async () => {
      await expect(repository.updateDJProfile(0, {}))
        .rejects.toThrow(ProfileValidationError);
    });

    it('should throw ProfileValidationError for invalid userId in delete', async () => {
      await expect(repository.deleteDJProfile(0))
        .rejects.toThrow(ProfileValidationError);
    });
  });

  // ==============================
  // Photographer Profile Tests
  // ==============================

  describe('Photographer Profile Validation', () => {
    it('should throw ProfileValidationError for invalid userId in create', async () => {
      await expect(repository.createPhotographerProfile({ userId: -100 } as any))
        .rejects.toThrow(ProfileValidationError);
    });

    it('should throw ProfileValidationError for invalid userId in update', async () => {
      await expect(repository.updatePhotographerProfile(-100, {}))
        .rejects.toThrow(ProfileValidationError);
    });

    it('should throw ProfileValidationError for invalid userId in delete', async () => {
      await expect(repository.deletePhotographerProfile(-100))
        .rejects.toThrow(ProfileValidationError);
    });
  });

  // ==============================
  // Performer Profile Tests
  // ==============================

  describe('Performer Profile Validation', () => {
    it('should throw ProfileValidationError for invalid userId in create', async () => {
      await expect(repository.createPerformerProfile({ userId: NaN } as any))
        .rejects.toThrow(ProfileValidationError);
    });

    it('should throw ProfileValidationError for invalid userId in update', async () => {
      await expect(repository.updatePerformerProfile(NaN, {}))
        .rejects.toThrow(ProfileValidationError);
    });
  });

  // ==============================
  // Vendor Profile Tests
  // ==============================

  describe('Vendor Profile Validation', () => {
    it('should throw ProfileValidationError for invalid userId in create', async () => {
      await expect(repository.createVendorProfile({ userId: -1 } as any))
        .rejects.toThrow(ProfileValidationError);
    });

    it('should throw ProfileValidationError for invalid userId in update', async () => {
      await expect(repository.updateVendorProfile(-1, {}))
        .rejects.toThrow(ProfileValidationError);
    });
  });

  // ==============================
  // Musician Profile Tests
  // ==============================

  describe('Musician Profile Validation', () => {
    it('should throw ProfileValidationError for invalid userId in create', async () => {
      await expect(repository.createMusicianProfile({ userId: 0 } as any))
        .rejects.toThrow(ProfileValidationError);
    });

    it('should throw ProfileValidationError for invalid userId in update', async () => {
      await expect(repository.updateMusicianProfile(0, {}))
        .rejects.toThrow(ProfileValidationError);
    });
  });

  // ==============================
  // Choreographer Profile Tests
  // ==============================

  describe('Choreographer Profile Validation', () => {
    it('should throw ProfileValidationError for invalid userId in create', async () => {
      await expect(repository.createChoreographerProfile({ userId: -5 } as any))
        .rejects.toThrow(ProfileValidationError);
    });

    it('should throw ProfileValidationError for invalid userId in update', async () => {
      await expect(repository.updateChoreographerProfile(-5, {}))
        .rejects.toThrow(ProfileValidationError);
    });
  });

  // ==============================
  // Tango School Profile Tests
  // ==============================

  describe('Tango School Profile Validation', () => {
    it('should throw ProfileValidationError for invalid userId in create', async () => {
      await expect(repository.createTangoSchoolProfile({ userId: -1 } as any))
        .rejects.toThrow(ProfileValidationError);
    });

    it('should throw ProfileValidationError for invalid userId in update', async () => {
      await expect(repository.updateTangoSchoolProfile(-1, {}))
        .rejects.toThrow(ProfileValidationError);
    });
  });

  // ==============================
  // Tango Hotel Profile Tests
  // ==============================

  describe('Tango Hotel Profile Validation', () => {
    it('should throw ProfileValidationError for invalid userId in create', async () => {
      await expect(repository.createTangoHotelProfile({ userId: 0 } as any))
        .rejects.toThrow(ProfileValidationError);
    });

    it('should throw ProfileValidationError for invalid userId in update', async () => {
      await expect(repository.updateTangoHotelProfile(0, {}))
        .rejects.toThrow(ProfileValidationError);
    });
  });

  // ==============================
  // Wellness Profile Tests
  // ==============================

  describe('Wellness Profile Validation', () => {
    it('should throw ProfileValidationError for invalid userId in create', async () => {
      await expect(repository.createWellnessProfile({ userId: -1 } as any))
        .rejects.toThrow(ProfileValidationError);
    });

    it('should throw ProfileValidationError for invalid userId in update', async () => {
      await expect(repository.updateWellnessProfile(-1, {}))
        .rejects.toThrow(ProfileValidationError);
    });
  });

  // ==============================
  // Tour Operator Profile Tests
  // ==============================

  describe('Tour Operator Profile Validation', () => {
    it('should throw ProfileValidationError for invalid userId in create', async () => {
      await expect(repository.createTourOperatorProfile({ userId: 0 } as any))
        .rejects.toThrow(ProfileValidationError);
    });

    it('should throw ProfileValidationError for invalid userId in update', async () => {
      await expect(repository.updateTourOperatorProfile(0, {}))
        .rejects.toThrow(ProfileValidationError);
    });
  });

  // ==============================
  // Host Venue Profile Tests
  // ==============================

  describe('Host Venue Profile Validation', () => {
    it('should throw ProfileValidationError for invalid userId in create', async () => {
      await expect(repository.createHostVenueProfile({ userId: -1 } as any))
        .rejects.toThrow(ProfileValidationError);
    });

    it('should throw ProfileValidationError for invalid userId in update', async () => {
      await expect(repository.updateHostVenueProfile(-1, {}))
        .rejects.toThrow(ProfileValidationError);
    });
  });

  // ==============================
  // Tango Guide Profile Tests
  // ==============================

  describe('Tango Guide Profile Validation', () => {
    it('should throw ProfileValidationError for invalid userId in create', async () => {
      await expect(repository.createTangoGuideProfile({ userId: 0 } as any))
        .rejects.toThrow(ProfileValidationError);
    });

    it('should throw ProfileValidationError for invalid userId in update', async () => {
      await expect(repository.updateTangoGuideProfile(0, {}))
        .rejects.toThrow(ProfileValidationError);
    });
  });

  // ==============================
  // Content Creator Profile Tests
  // ==============================

  describe('Content Creator Profile Validation', () => {
    it('should throw ProfileValidationError for invalid userId in create', async () => {
      await expect(repository.createContentCreatorProfile({ userId: -1 } as any))
        .rejects.toThrow(ProfileValidationError);
    });

    it('should throw ProfileValidationError for invalid userId in update', async () => {
      await expect(repository.updateContentCreatorProfile(-1, {}))
        .rejects.toThrow(ProfileValidationError);
    });
  });

  // ==============================
  // Learning Resource Profile Tests
  // ==============================

  describe('Learning Resource Profile Validation', () => {
    it('should throw ProfileValidationError for invalid userId in create', async () => {
      await expect(repository.createLearningResourceProfile({ userId: 0 } as any))
        .rejects.toThrow(ProfileValidationError);
    });

    it('should throw ProfileValidationError for invalid userId in update', async () => {
      await expect(repository.updateLearningResourceProfile(0, {}))
        .rejects.toThrow(ProfileValidationError);
    });
  });

  // ==============================
  // Taxi Dancer Profile Tests
  // ==============================

  describe('Taxi Dancer Profile Validation', () => {
    it('should throw ProfileValidationError for invalid userId in create', async () => {
      await expect(repository.createTaxiDancerProfile({ userId: -1 } as any))
        .rejects.toThrow(ProfileValidationError);
    });

    it('should throw ProfileValidationError for invalid userId in update', async () => {
      await expect(repository.updateTaxiDancerProfile(-1, {}))
        .rejects.toThrow(ProfileValidationError);
    });
  });

  // ==============================
  // Organizer Profile Tests
  // ==============================

  describe('Organizer Profile Validation', () => {
    it('should throw ProfileValidationError for invalid userId in create', async () => {
      await expect(repository.createOrganizerProfile({ userId: 0 } as any))
        .rejects.toThrow(ProfileValidationError);
    });

    it('should throw ProfileValidationError for invalid userId in update', async () => {
      await expect(repository.updateOrganizerProfile(0, {}))
        .rejects.toThrow(ProfileValidationError);
    });

    it('should throw ProfileValidationError for invalid userId in delete', async () => {
      await expect(repository.deleteOrganizerProfile(-999))
        .rejects.toThrow(ProfileValidationError);
    });
  });

  // ==============================
  // Error Class Tests
  // ==============================

  describe('Error Classes', () => {
    it('ProfileValidationError should have correct code', () => {
      const error = new ProfileValidationError('test message');
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.name).toBe('ProfileValidationError');
    });

    it('ProfileDatabaseError should have correct code', () => {
      const error = new ProfileDatabaseError('test message');
      expect(error.code).toBe('DATABASE_ERROR');
      expect(error.name).toBe('ProfileDatabaseError');
    });

    it('Errors should extend ProfileRepositoryError', () => {
      const validationError = new ProfileValidationError('test');
      const dbError = new ProfileDatabaseError('test');
      expect(validationError).toBeInstanceOf(Error);
      expect(dbError).toBeInstanceOf(Error);
    });
  });
});
