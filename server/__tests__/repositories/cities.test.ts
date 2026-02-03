/**
 * Cities Repository Tests
 * Validates error handling and input validation for Cities operations
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  CitiesRepository,
  CitiesValidationError,
  CitiesDatabaseError,
  CitiesRepositoryError,
} from '../../storage/repositories/cities';

describe('CitiesRepository', () => {
  let repository: CitiesRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    repository = new CitiesRepository();
  });

  describe('City ID Validation', () => {
    const invalidIds = [0, -1, 1.5, NaN, Infinity, -Infinity];

    invalidIds.forEach((id) => {
      it(`should reject invalid id: ${id} for getCity`, async () => {
        await expect(repository.getCity(id)).rejects.toThrow(CitiesValidationError);
      });

      it(`should reject invalid id: ${id} for updateCity`, async () => {
        await expect(repository.updateCity(id, {})).rejects.toThrow(CitiesValidationError);
      });

      it(`should reject invalid id: ${id} for deleteCity`, async () => {
        await expect(repository.deleteCity(id)).rejects.toThrow(CitiesValidationError);
      });
    });
  });

  describe('City Slug Validation', () => {
    it('should reject empty slug for getCityBySlug', async () => {
      await expect(repository.getCityBySlug('')).rejects.toThrow(CitiesValidationError);
    });

    it('should reject whitespace-only slug for getCityBySlug', async () => {
      await expect(repository.getCityBySlug('   ')).rejects.toThrow(CitiesValidationError);
    });
  });

  describe('City Search Validation', () => {
    it('should reject empty query for searchCities', async () => {
      await expect(repository.searchCities('')).rejects.toThrow(CitiesValidationError);
    });

    it('should reject whitespace-only query for searchCities', async () => {
      await expect(repository.searchCities('   ')).rejects.toThrow(CitiesValidationError);
    });
  });

  describe('City Input Validation', () => {
    it('should reject empty name', async () => {
      await expect(
        repository.createCity({ name: '', country: 'Argentina' } as any)
      ).rejects.toThrow(CitiesValidationError);
    });

    it('should reject whitespace-only name', async () => {
      await expect(
        repository.createCity({ name: '   ', country: 'Argentina' } as any)
      ).rejects.toThrow(CitiesValidationError);
    });

    it('should reject empty country', async () => {
      await expect(
        repository.createCity({ name: 'Buenos Aires', country: '' } as any)
      ).rejects.toThrow(CitiesValidationError);
    });

    it('should reject whitespace-only country', async () => {
      await expect(
        repository.createCity({ name: 'Buenos Aires', country: '   ' } as any)
      ).rejects.toThrow(CitiesValidationError);
    });
  });

  describe('City Website Validation', () => {
    const invalidIds = [0, -1, 1.5, NaN];

    invalidIds.forEach((id) => {
      it(`should reject invalid cityId: ${id} for getCityWebsites`, async () => {
        await expect(repository.getCityWebsites(id)).rejects.toThrow(CitiesValidationError);
      });

      it(`should reject invalid cityId: ${id} for createCityWebsite`, async () => {
        await expect(
          repository.createCityWebsite({ cityId: id, url: 'https://example.com' } as any)
        ).rejects.toThrow(CitiesValidationError);
      });

      it(`should reject invalid id: ${id} for deleteCityWebsite`, async () => {
        await expect(repository.deleteCityWebsite(id)).rejects.toThrow(CitiesValidationError);
      });
    });

    it('should reject empty URL for createCityWebsite', async () => {
      await expect(
        repository.createCityWebsite({ cityId: 1, url: '' } as any)
      ).rejects.toThrow(CitiesValidationError);
    });
  });

  describe('City Member Validation', () => {
    const invalidIds = [0, -1, 1.5, NaN];

    invalidIds.forEach((id) => {
      it(`should reject invalid cityId: ${id} for getCityMembers`, async () => {
        await expect(repository.getCityMembers(id)).rejects.toThrow(CitiesValidationError);
      });

      it(`should reject invalid userId: ${id} for getUserCities`, async () => {
        await expect(repository.getUserCities(id)).rejects.toThrow(CitiesValidationError);
      });

      it(`should reject invalid cityId: ${id} for addCityMember`, async () => {
        await expect(
          repository.addCityMember({ cityId: id, userId: 1 })
        ).rejects.toThrow(CitiesValidationError);
      });

      it(`should reject invalid userId: ${id} for addCityMember`, async () => {
        await expect(
          repository.addCityMember({ cityId: 1, userId: id })
        ).rejects.toThrow(CitiesValidationError);
      });
    });
  });

  describe('Remove City Member Validation', () => {
    const invalidIds = [0, -1, 1.5, NaN];

    invalidIds.forEach((id) => {
      it(`should reject invalid cityId: ${id} for removeCityMember`, async () => {
        await expect(repository.removeCityMember(id, 1)).rejects.toThrow(CitiesValidationError);
      });

      it(`should reject invalid userId: ${id} for removeCityMember`, async () => {
        await expect(repository.removeCityMember(1, id)).rejects.toThrow(CitiesValidationError);
      });
    });
  });

  describe('Location History Validation', () => {
    const invalidIds = [0, -1, 1.5, NaN];

    invalidIds.forEach((id) => {
      it(`should reject invalid userId: ${id} for getUserLocationHistory`, async () => {
        await expect(repository.getUserLocationHistory(id)).rejects.toThrow(CitiesValidationError);
      });

      it(`should reject invalid userId: ${id} for logLocationVisit`, async () => {
        await expect(
          repository.logLocationVisit({ userId: id, cityId: 1 })
        ).rejects.toThrow(CitiesValidationError);
      });

      it(`should reject invalid cityId: ${id} for logLocationVisit`, async () => {
        await expect(
          repository.logLocationVisit({ userId: 1, cityId: id })
        ).rejects.toThrow(CitiesValidationError);
      });
    });
  });

  describe('Error Classes', () => {
    it('CitiesValidationError should have correct code', () => {
      const error = new CitiesValidationError('test message');
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.name).toBe('CitiesValidationError');
      expect(error).toBeInstanceOf(CitiesRepositoryError);
    });

    it('CitiesDatabaseError should have correct code', () => {
      const error = new CitiesDatabaseError('test message');
      expect(error.code).toBe('DATABASE_ERROR');
      expect(error.name).toBe('CitiesDatabaseError');
      expect(error).toBeInstanceOf(CitiesRepositoryError);
    });

    it('Errors should preserve details', () => {
      const details = { field: 'cityId', value: -1 };
      const error = new CitiesValidationError('test', details);
      expect(error.details).toEqual(details);
    });
  });
});
