/**
 * Security Repository Tests
 * Validates error handling and input validation for Auth/Security operations
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  SecurityRepository,
  SecurityValidationError,
  SecurityDatabaseError,
  SecurityRepositoryError,
} from '../../storage/repositories/security';

describe('SecurityRepository', () => {
  let repository: SecurityRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    repository = new SecurityRepository();
  });

  describe('Token Validation', () => {
    it('should reject empty token for getRefreshToken', async () => {
      await expect(repository.getRefreshToken('')).rejects.toThrow(SecurityValidationError);
    });

    it('should reject whitespace-only token for getRefreshToken', async () => {
      await expect(repository.getRefreshToken('   ')).rejects.toThrow(SecurityValidationError);
    });

    it('should reject empty token for deleteRefreshToken', async () => {
      await expect(repository.deleteRefreshToken('')).rejects.toThrow(SecurityValidationError);
    });

    it('should reject empty token for getEmailVerificationToken', async () => {
      await expect(repository.getEmailVerificationToken('')).rejects.toThrow(SecurityValidationError);
    });

    it('should reject empty token for deleteEmailVerificationToken', async () => {
      await expect(repository.deleteEmailVerificationToken('')).rejects.toThrow(SecurityValidationError);
    });

    it('should reject empty token for getPasswordResetToken', async () => {
      await expect(repository.getPasswordResetToken('')).rejects.toThrow(SecurityValidationError);
    });

    it('should reject empty token for deletePasswordResetToken', async () => {
      await expect(repository.deletePasswordResetToken('')).rejects.toThrow(SecurityValidationError);
    });
  });

  describe('User ID Validation for Tokens', () => {
    const invalidIds = [0, -1, 1.5, NaN];

    invalidIds.forEach((id) => {
      it(`should reject invalid userId: ${id} for deleteUserRefreshTokens`, async () => {
        await expect(repository.deleteUserRefreshTokens(id)).rejects.toThrow(SecurityValidationError);
      });

      it(`should reject invalid userId: ${id} for deleteUserPasswordResetTokens`, async () => {
        await expect(repository.deleteUserPasswordResetTokens(id)).rejects.toThrow(SecurityValidationError);
      });

      it(`should reject invalid userId: ${id} for createRefreshToken`, async () => {
        await expect(
          repository.createRefreshToken({ userId: id, token: 'test-token', expiresAt: new Date() })
        ).rejects.toThrow(SecurityValidationError);
      });

      it(`should reject invalid userId: ${id} for createEmailVerificationToken`, async () => {
        await expect(
          repository.createEmailVerificationToken({ userId: id, token: 'test-token', expiresAt: new Date() })
        ).rejects.toThrow(SecurityValidationError);
      });

      it(`should reject invalid userId: ${id} for createPasswordResetToken`, async () => {
        await expect(
          repository.createPasswordResetToken({ userId: id, token: 'test-token', expiresAt: new Date() })
        ).rejects.toThrow(SecurityValidationError);
      });
    });
  });

  describe('Token Content Validation', () => {
    it('should reject empty token for createRefreshToken', async () => {
      await expect(
        repository.createRefreshToken({ userId: 1, token: '', expiresAt: new Date() })
      ).rejects.toThrow(SecurityValidationError);
    });

    it('should reject empty token for createEmailVerificationToken', async () => {
      await expect(
        repository.createEmailVerificationToken({ userId: 1, token: '', expiresAt: new Date() })
      ).rejects.toThrow(SecurityValidationError);
    });

    it('should reject empty token for createPasswordResetToken', async () => {
      await expect(
        repository.createPasswordResetToken({ userId: 1, token: '', expiresAt: new Date() })
      ).rejects.toThrow(SecurityValidationError);
    });
  });

  describe('Two-Factor Secret Validation', () => {
    const invalidIds = [0, -1, 1.5, NaN];

    invalidIds.forEach((id) => {
      it(`should reject invalid userId: ${id} for getTwoFactorSecret`, async () => {
        await expect(repository.getTwoFactorSecret(id)).rejects.toThrow(SecurityValidationError);
      });

      it(`should reject invalid userId: ${id} for createTwoFactorSecret`, async () => {
        await expect(
          repository.createTwoFactorSecret({ userId: id } as any)
        ).rejects.toThrow(SecurityValidationError);
      });

      it(`should reject invalid userId: ${id} for deleteTwoFactorSecret`, async () => {
        await expect(repository.deleteTwoFactorSecret(id)).rejects.toThrow(SecurityValidationError);
      });
    });
  });

  describe('Security Audit Log Validation', () => {
    const invalidIds = [0, -1, 1.5];

    invalidIds.forEach((id) => {
      it(`should reject invalid userId: ${id} for getUserSecurityLogs`, async () => {
        await expect(repository.getUserSecurityLogs(id)).rejects.toThrow(SecurityValidationError);
      });
    });
  });

  describe('Error Classes', () => {
    it('SecurityValidationError should have correct code', () => {
      const error = new SecurityValidationError('test message');
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.name).toBe('SecurityValidationError');
      expect(error).toBeInstanceOf(SecurityRepositoryError);
    });

    it('SecurityDatabaseError should have correct code', () => {
      const error = new SecurityDatabaseError('test message');
      expect(error.code).toBe('DATABASE_ERROR');
      expect(error.name).toBe('SecurityDatabaseError');
      expect(error).toBeInstanceOf(SecurityRepositoryError);
    });

    it('Errors should preserve details', () => {
      const details = { field: 'userId', value: -1 };
      const error = new SecurityValidationError('test', details);
      expect(error.details).toEqual(details);
    });
  });
});
