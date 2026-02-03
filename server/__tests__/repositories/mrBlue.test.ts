/**
 * Mr. Blue AI Repository Tests
 * Validates error handling and input validation for Mr. Blue AI operations
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  MrBlueRepository,
  MrBlueValidationError,
  MrBlueDatabaseError,
  MrBlueRepositoryError,
} from '../../storage/repositories/mrBlue';

describe('MrBlueRepository', () => {
  let repository: MrBlueRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    repository = new MrBlueRepository();
  });

  describe('Conversation ID Validation', () => {
    const invalidIds = [0, -1, 1.5, NaN, Infinity, -Infinity];

    invalidIds.forEach((id) => {
      it(`should reject invalid id: ${id} for getConversation`, async () => {
        await expect(repository.getConversation(id)).rejects.toThrow(MrBlueValidationError);
      });

      it(`should reject invalid id: ${id} for updateConversation`, async () => {
        await expect(repository.updateConversation(id, {})).rejects.toThrow(MrBlueValidationError);
      });

      it(`should reject invalid id: ${id} for deleteConversation`, async () => {
        await expect(repository.deleteConversation(id)).rejects.toThrow(MrBlueValidationError);
      });
    });
  });

  describe('User ID Validation for Conversations', () => {
    const invalidIds = [0, -1, 1.5, NaN];

    invalidIds.forEach((id) => {
      it(`should reject invalid userId: ${id} for getUserConversations`, async () => {
        await expect(repository.getUserConversations(id)).rejects.toThrow(MrBlueValidationError);
      });

      it(`should reject invalid userId: ${id} for createConversation`, async () => {
        await expect(
          repository.createConversation({ userId: id })
        ).rejects.toThrow(MrBlueValidationError);
      });
    });
  });

  describe('Conversation Input Validation', () => {
    it('should reject contextWindow less than 1', async () => {
      await expect(
        repository.createConversation({ userId: 1, contextWindow: 0 })
      ).rejects.toThrow(MrBlueValidationError);
    });

    it('should reject contextWindow greater than 100', async () => {
      await expect(
        repository.createConversation({ userId: 1, contextWindow: 101 })
      ).rejects.toThrow(MrBlueValidationError);
    });
  });

  describe('Message Validation', () => {
    const invalidIds = [0, -1, 1.5, NaN];

    invalidIds.forEach((id) => {
      it(`should reject invalid id: ${id} for getMessage`, async () => {
        await expect(repository.getMessage(id)).rejects.toThrow(MrBlueValidationError);
      });

      it(`should reject invalid conversationId: ${id} for getConversationMessages`, async () => {
        await expect(repository.getConversationMessages(id)).rejects.toThrow(MrBlueValidationError);
      });
    });

    it('should reject empty content', async () => {
      await expect(
        repository.createMessage({ conversationId: 1, userId: 1, role: 'user', content: '' })
      ).rejects.toThrow(MrBlueValidationError);
    });

    it('should reject whitespace-only content', async () => {
      await expect(
        repository.createMessage({ conversationId: 1, userId: 1, role: 'user', content: '   ' })
      ).rejects.toThrow(MrBlueValidationError);
    });

    it('should reject invalid role', async () => {
      await expect(
        repository.createMessage({ conversationId: 1, userId: 1, role: 'invalid' as any, content: 'test' })
      ).rejects.toThrow(MrBlueValidationError);
    });
  });

  describe('Workflow Actions Validation', () => {
    const invalidIds = [0, -1, 1.5, NaN];

    invalidIds.forEach((id) => {
      it(`should reject invalid userId: ${id} for getRecentWorkflowActions`, async () => {
        await expect(repository.getRecentWorkflowActions(id)).rejects.toThrow(MrBlueValidationError);
      });

      it(`should reject invalid userId: ${id} for logWorkflowAction`, async () => {
        await expect(
          repository.logWorkflowAction({ userId: id, actionType: 'test' } as any)
        ).rejects.toThrow(MrBlueValidationError);
      });
    });
  });

  describe('Error Classes', () => {
    it('MrBlueValidationError should have correct code', () => {
      const error = new MrBlueValidationError('test message');
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.name).toBe('MrBlueValidationError');
      expect(error).toBeInstanceOf(MrBlueRepositoryError);
    });

    it('MrBlueDatabaseError should have correct code', () => {
      const error = new MrBlueDatabaseError('test message');
      expect(error.code).toBe('DATABASE_ERROR');
      expect(error.name).toBe('MrBlueDatabaseError');
      expect(error).toBeInstanceOf(MrBlueRepositoryError);
    });

    it('Errors should preserve details', () => {
      const details = { field: 'userId', value: -1 };
      const error = new MrBlueValidationError('test', details);
      expect(error.details).toEqual(details);
    });
  });
});
