/**
 * Skills Repository Tests
 * Validates error handling and input validation for Skills operations
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  SkillsRepository,
  SkillsValidationError,
  SkillsDatabaseError,
  SkillsRepositoryError,
} from '../../storage/repositories/skills';

describe('SkillsRepository', () => {
  let repository: SkillsRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    repository = new SkillsRepository();
  });

  describe('Skill ID Validation', () => {
    const invalidIds = [0, -1, 1.5, NaN, Infinity, -Infinity];

    invalidIds.forEach((id) => {
      it(`should reject invalid id: ${id} for getSkill`, async () => {
        await expect(repository.getSkill(id)).rejects.toThrow(SkillsValidationError);
      });

      it(`should reject invalid id: ${id} for updateSkill`, async () => {
        await expect(repository.updateSkill(id, {})).rejects.toThrow(SkillsValidationError);
      });

      it(`should reject invalid id: ${id} for deleteSkill`, async () => {
        await expect(repository.deleteSkill(id)).rejects.toThrow(SkillsValidationError);
      });
    });
  });

  describe('User Skill ID Validation', () => {
    const invalidIds = [0, -1, 1.5, NaN];

    invalidIds.forEach((id) => {
      it(`should reject invalid userId: ${id} for getUserSkills`, async () => {
        await expect(repository.getUserSkills(id)).rejects.toThrow(SkillsValidationError);
      });

      it(`should reject invalid userId: ${id} for createSkill`, async () => {
        await expect(
          repository.createSkill({ userId: id, skillName: 'Dancing' })
        ).rejects.toThrow(SkillsValidationError);
      });
    });
  });

  describe('Skill Input Validation', () => {
    it('should reject empty skillName', async () => {
      await expect(
        repository.createSkill({ userId: 1, skillName: '' })
      ).rejects.toThrow(SkillsValidationError);
    });

    it('should reject whitespace-only skillName', async () => {
      await expect(
        repository.createSkill({ userId: 1, skillName: '   ' })
      ).rejects.toThrow(SkillsValidationError);
    });

    it('should reject skillName over 100 characters', async () => {
      await expect(
        repository.createSkill({ userId: 1, skillName: 'a'.repeat(101) })
      ).rejects.toThrow(SkillsValidationError);
    });

    it('should reject invalid skill level', async () => {
      await expect(
        repository.createSkill({ userId: 1, skillName: 'Dancing', level: 'invalid' })
      ).rejects.toThrow(SkillsValidationError);
    });
  });

  describe('Endorsement Validation', () => {
    const invalidIds = [0, -1, 1.5, NaN];

    invalidIds.forEach((id) => {
      it(`should reject invalid id: ${id} for getEndorsement`, async () => {
        await expect(repository.getEndorsement(id)).rejects.toThrow(SkillsValidationError);
      });

      it(`should reject invalid skillId: ${id} for getSkillEndorsements`, async () => {
        await expect(repository.getSkillEndorsements(id)).rejects.toThrow(SkillsValidationError);
      });

      it(`should reject invalid skillId: ${id} for createEndorsement`, async () => {
        await expect(
          repository.createEndorsement({ skillId: id, endorserId: 1 })
        ).rejects.toThrow(SkillsValidationError);
      });

      it(`should reject invalid endorserId: ${id} for createEndorsement`, async () => {
        await expect(
          repository.createEndorsement({ skillId: 1, endorserId: id })
        ).rejects.toThrow(SkillsValidationError);
      });

      it(`should reject invalid id: ${id} for deleteEndorsement`, async () => {
        await expect(repository.deleteEndorsement(id)).rejects.toThrow(SkillsValidationError);
      });
    });
  });

  describe('Remove Endorsement Validation', () => {
    const invalidIds = [0, -1, 1.5, NaN];

    invalidIds.forEach((id) => {
      it(`should reject invalid skillId: ${id} for removeEndorsement`, async () => {
        await expect(repository.removeEndorsement(id, 1)).rejects.toThrow(SkillsValidationError);
      });

      it(`should reject invalid endorserId: ${id} for removeEndorsement`, async () => {
        await expect(repository.removeEndorsement(1, id)).rejects.toThrow(SkillsValidationError);
      });
    });
  });

  describe('Error Classes', () => {
    it('SkillsValidationError should have correct code', () => {
      const error = new SkillsValidationError('test message');
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.name).toBe('SkillsValidationError');
      expect(error).toBeInstanceOf(SkillsRepositoryError);
    });

    it('SkillsDatabaseError should have correct code', () => {
      const error = new SkillsDatabaseError('test message');
      expect(error.code).toBe('DATABASE_ERROR');
      expect(error.name).toBe('SkillsDatabaseError');
      expect(error).toBeInstanceOf(SkillsRepositoryError);
    });

    it('Errors should preserve details', () => {
      const details = { field: 'skillId', value: -1 };
      const error = new SkillsValidationError('test', details);
      expect(error.details).toEqual(details);
    });
  });
});
