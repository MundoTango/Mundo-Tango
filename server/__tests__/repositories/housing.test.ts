/**
 * Housing Repository Tests
 * Validates error handling and input validation for Housing operations
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  HousingRepository,
  HousingValidationError,
  HousingDatabaseError,
  HousingRepositoryError,
} from '../../storage/repositories/housing';

describe('HousingRepository', () => {
  let repository: HousingRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    repository = new HousingRepository();
  });

  describe('Listing ID Validation', () => {
    const invalidIds = [0, -1, 1.5, NaN, Infinity, -Infinity];

    invalidIds.forEach((id) => {
      it(`should reject invalid id: ${id} for getListing`, async () => {
        await expect(repository.getListing(id)).rejects.toThrow(HousingValidationError);
      });

      it(`should reject invalid id: ${id} for updateListing`, async () => {
        await expect(repository.updateListing(id, {})).rejects.toThrow(HousingValidationError);
      });

      it(`should reject invalid id: ${id} for deleteListing`, async () => {
        await expect(repository.deleteListing(id)).rejects.toThrow(HousingValidationError);
      });
    });
  });

  describe('Host ID Validation', () => {
    const invalidIds = [0, -1, 1.5, NaN];

    invalidIds.forEach((id) => {
      it(`should reject invalid hostId: ${id} for getListingsByHost`, async () => {
        await expect(repository.getListingsByHost(id)).rejects.toThrow(HousingValidationError);
      });

      it(`should reject invalid hostId: ${id} for createListing`, async () => {
        await expect(
          repository.createListing({ hostId: id, title: 'Test', city: 'BA', country: 'AR' } as any)
        ).rejects.toThrow(HousingValidationError);
      });
    });
  });

  describe('Listing Input Validation', () => {
    it('should reject empty title', async () => {
      await expect(
        repository.createListing({ hostId: 1, title: '', city: 'Buenos Aires', country: 'AR' } as any)
      ).rejects.toThrow(HousingValidationError);
    });

    it('should reject empty city', async () => {
      await expect(
        repository.createListing({ hostId: 1, title: 'Test', city: '', country: 'AR' } as any)
      ).rejects.toThrow(HousingValidationError);
    });

    it('should reject empty country', async () => {
      await expect(
        repository.createListing({ hostId: 1, title: 'Test', city: 'Buenos Aires', country: '' } as any)
      ).rejects.toThrow(HousingValidationError);
    });

    it('should reject negative pricePerNight', async () => {
      await expect(
        repository.createListing({ hostId: 1, title: 'Test', city: 'BA', country: 'AR', pricePerNight: -10 } as any)
      ).rejects.toThrow(HousingValidationError);
    });
  });

  describe('Booking Validation', () => {
    const invalidIds = [0, -1, 1.5, NaN];

    invalidIds.forEach((id) => {
      it(`should reject invalid id: ${id} for getBooking`, async () => {
        await expect(repository.getBooking(id)).rejects.toThrow(HousingValidationError);
      });

      it(`should reject invalid guestId: ${id} for getGuestBookings`, async () => {
        await expect(repository.getGuestBookings(id)).rejects.toThrow(HousingValidationError);
      });

      it(`should reject invalid listingId: ${id} for getListingBookings`, async () => {
        await expect(repository.getListingBookings(id)).rejects.toThrow(HousingValidationError);
      });
    });

    it('should reject check-out before check-in', async () => {
      await expect(
        repository.createBooking({
          listingId: 1,
          guestId: 1,
          checkInDate: new Date('2025-02-10'),
          checkOutDate: new Date('2025-02-05'),
          guests: 2,
        } as any)
      ).rejects.toThrow(HousingValidationError);
    });

    it('should reject guests less than 1', async () => {
      await expect(
        repository.createBooking({
          listingId: 1,
          guestId: 1,
          checkInDate: new Date('2025-02-05'),
          checkOutDate: new Date('2025-02-10'),
          guests: 0,
        } as any)
      ).rejects.toThrow(HousingValidationError);
    });
  });

  describe('Booking Status Validation', () => {
    it('should reject invalid status', async () => {
      await expect(
        repository.updateBookingStatus(1, 'invalid_status')
      ).rejects.toThrow(HousingValidationError);
    });
  });

  describe('Review Validation', () => {
    const invalidIds = [0, -1, 1.5, NaN];

    invalidIds.forEach((id) => {
      it(`should reject invalid id: ${id} for getReview`, async () => {
        await expect(repository.getReview(id)).rejects.toThrow(HousingValidationError);
      });

      it(`should reject invalid listingId: ${id} for getListingReviews`, async () => {
        await expect(repository.getListingReviews(id)).rejects.toThrow(HousingValidationError);
      });
    });

    it('should reject rating below 1', async () => {
      await expect(
        repository.createReview({ listingId: 1, reviewerId: 1, rating: 0 } as any)
      ).rejects.toThrow(HousingValidationError);
    });

    it('should reject rating above 5', async () => {
      await expect(
        repository.createReview({ listingId: 1, reviewerId: 1, rating: 6 } as any)
      ).rejects.toThrow(HousingValidationError);
    });
  });

  describe('Favorites Validation', () => {
    const invalidIds = [0, -1, 1.5, NaN];

    invalidIds.forEach((id) => {
      it(`should reject invalid userId: ${id} for getUserFavorites`, async () => {
        await expect(repository.getUserFavorites(id)).rejects.toThrow(HousingValidationError);
      });

      it(`should reject invalid userId: ${id} for addFavorite`, async () => {
        await expect(repository.addFavorite(id, 1)).rejects.toThrow(HousingValidationError);
      });

      it(`should reject invalid listingId: ${id} for addFavorite`, async () => {
        await expect(repository.addFavorite(1, id)).rejects.toThrow(HousingValidationError);
      });
    });
  });

  describe('City Search Validation', () => {
    it('should reject empty city', async () => {
      await expect(repository.getListingsByCity('')).rejects.toThrow(HousingValidationError);
    });

    it('should reject whitespace-only city', async () => {
      await expect(repository.getListingsByCity('   ')).rejects.toThrow(HousingValidationError);
    });
  });

  describe('Error Classes', () => {
    it('HousingValidationError should have correct code', () => {
      const error = new HousingValidationError('test message');
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.name).toBe('HousingValidationError');
      expect(error).toBeInstanceOf(HousingRepositoryError);
    });

    it('HousingDatabaseError should have correct code', () => {
      const error = new HousingDatabaseError('test message');
      expect(error.code).toBe('DATABASE_ERROR');
      expect(error.name).toBe('HousingDatabaseError');
      expect(error).toBeInstanceOf(HousingRepositoryError);
    });

    it('Errors should preserve details', () => {
      const details = { field: 'hostId', value: -1 };
      const error = new HousingValidationError('test', details);
      expect(error.details).toEqual(details);
    });
  });
});
