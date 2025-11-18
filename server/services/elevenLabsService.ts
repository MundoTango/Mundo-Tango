/**
 * ElevenLabs Service
 * Clean wrapper for voice cloning and TTS functionality
 * Production-ready with rate limiting, error handling, and quality validation
 * 
 * This service wraps the VoiceCloningService for API endpoint compatibility
 */

import { db } from '../db';
import { voiceClones, users } from '@shared/schema';
import { eq, and, desc } from 'drizzle-orm';
import { 
  voiceCloningService,
  SUPPORTED_LANGUAGES,
  type VoiceCloneRequest,
  type VoiceGenerationOptions,
  type VoiceModel 
} from './mrBlue/VoiceCloningService';

export interface CloneVoiceRequest {
  name: string;
  description?: string;
  audioFiles?: string[]; // URLs or paths
  language?: string;
}

export interface VoicePreviewRequest {
  voiceId: string;
  text: string;
  language?: string;
}

export class ElevenLabsService {
  /**
   * Create voice clone from audio files
   * Implements rate limiting and quality validation
   */
  async cloneVoice(
    userId: number,
    request: CloneVoiceRequest
  ): Promise<{ success: boolean; voiceId?: string; voiceCloneId?: number; error?: string }> {
    try {
      // Validate inputs
      if (!request.name || request.name.trim().length === 0) {
        return { success: false, error: 'Voice name is required' };
      }

      if (!request.audioFiles || request.audioFiles.length === 0) {
        return { success: false, error: 'At least one audio file is required' };
      }

      if (request.audioFiles.length > 25) {
        return { success: false, error: 'Maximum 25 audio files allowed' };
      }

      // Check rate limits (God Level quota)
      const { godLevelQuotas } = await import('@shared/schema');
      const [quota] = await db
        .select()
        .from(godLevelQuotas)
        .where(eq(godLevelQuotas.userId, userId))
        .limit(1);

      if (quota) {
        if (quota.voiceQuotaUsed >= quota.voiceQuotaLimit) {
          return { 
            success: false, 
            error: `Voice quota exceeded. Limit: ${quota.voiceQuotaLimit} per month. Resets on ${quota.quotaResetDate.toLocaleDateString()}` 
          };
        }
      }

      console.log(`[ElevenLabs] Starting voice clone for user ${userId}: ${request.name}`);

      // Create voice clone using VoiceCloningService
      const voiceId = await voiceCloningService.cloneUserVoice({
        userId,
        voiceName: request.name,
        audioUrls: request.audioFiles,
        description: request.description,
      });

      // Get voice details from ElevenLabs
      const voiceDetails = await voiceCloningService.getVoice(voiceId);

      // Save to database
      const [voiceClone] = await db.insert(voiceClones).values({
        userId,
        voiceId,
        name: request.name,
        description: request.description,
        status: 'active',
        isDefault: false,
        audioSampleCount: request.audioFiles.length,
        language: request.language || 'en',
        modelId: 'eleven_multilingual_v2',
        elevenLabsData: voiceDetails.voice as any,
        lastUsedAt: new Date(),
      }).returning();

      // Update quota if exists
      if (quota) {
        await db
          .update(godLevelQuotas)
          .set({ 
            voiceQuotaUsed: quota.voiceQuotaUsed + 1,
            updatedAt: new Date(),
          })
          .where(eq(godLevelQuotas.userId, userId));
      }

      console.log(`[ElevenLabs] ✅ Voice clone created successfully: ${voiceId}`);

      return {
        success: true,
        voiceId,
        voiceCloneId: voiceClone.id,
      };
    } catch (error: any) {
      console.error('[ElevenLabs] Clone voice error:', error);
      return {
        success: false,
        error: error.message || 'Failed to clone voice',
      };
    }
  }

  /**
   * List all voice clones for a user
   */
  async listUserVoiceClones(userId: number): Promise<{
    success: boolean;
    clones?: typeof voiceClones.$inferSelect[];
    error?: string;
  }> {
    try {
      const clones = await db
        .select()
        .from(voiceClones)
        .where(
          and(
            eq(voiceClones.userId, userId),
            eq(voiceClones.status, 'active')
          )
        )
        .orderBy(desc(voiceClones.createdAt));

      return {
        success: true,
        clones,
      };
    } catch (error: any) {
      console.error('[ElevenLabs] List clones error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Delete a voice clone
   */
  async deleteVoiceClone(userId: number, cloneId: number): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      // Get the clone
      const [clone] = await db
        .select()
        .from(voiceClones)
        .where(
          and(
            eq(voiceClones.id, cloneId),
            eq(voiceClones.userId, userId)
          )
        )
        .limit(1);

      if (!clone) {
        return { success: false, error: 'Voice clone not found' };
      }

      // Delete from ElevenLabs
      const result = await voiceCloningService.deleteVoice(clone.voiceId);
      if (!result.success) {
        console.warn('[ElevenLabs] Failed to delete from ElevenLabs, continuing with DB cleanup');
      }

      // Mark as deleted in database (soft delete)
      await db
        .update(voiceClones)
        .set({
          status: 'deleted',
          updatedAt: new Date(),
        })
        .where(eq(voiceClones.id, cloneId));

      // If this was the default voice, clear customVoiceId from user
      if (clone.isDefault) {
        await db
          .update(users)
          .set({ customVoiceId: null })
          .where(eq(users.id, userId));
      }

      console.log(`[ElevenLabs] ✅ Voice clone deleted: ${cloneId}`);

      return { success: true };
    } catch (error: any) {
      console.error('[ElevenLabs] Delete clone error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Set a voice clone as default for the user
   */
  async setDefaultVoice(userId: number, cloneId: number): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      // Get the clone
      const [clone] = await db
        .select()
        .from(voiceClones)
        .where(
          and(
            eq(voiceClones.id, cloneId),
            eq(voiceClones.userId, userId),
            eq(voiceClones.status, 'active')
          )
        )
        .limit(1);

      if (!clone) {
        return { success: false, error: 'Voice clone not found' };
      }

      // Unset all other defaults for this user
      await db
        .update(voiceClones)
        .set({
          isDefault: false,
          updatedAt: new Date(),
        })
        .where(eq(voiceClones.userId, userId));

      // Set this one as default
      await db
        .update(voiceClones)
        .set({
          isDefault: true,
          updatedAt: new Date(),
        })
        .where(eq(voiceClones.id, cloneId));

      // Update user's customVoiceId
      await db
        .update(users)
        .set({ customVoiceId: clone.voiceId })
        .where(eq(users.id, userId));

      console.log(`[ElevenLabs] ✅ Default voice set: ${cloneId} (${clone.voiceId})`);

      return { success: true };
    } catch (error: any) {
      console.error('[ElevenLabs] Set default error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Generate preview audio for a voice clone
   */
  async generatePreview(request: VoicePreviewRequest): Promise<{
    success: boolean;
    audio?: Buffer;
    error?: string;
  }> {
    try {
      const result = await voiceCloningService.generateSpeech(
        request.voiceId,
        request.text,
        {
          language: request.language as any,
          model_id: 'eleven_multilingual_v2',
        }
      );

      if (!result.success || !result.audio) {
        return {
          success: false,
          error: 'Failed to generate preview audio',
        };
      }

      // Update usage tracking
      const [currentClone] = await db
        .select()
        .from(voiceClones)
        .where(eq(voiceClones.voiceId, request.voiceId))
        .limit(1);

      if (currentClone) {
        await db
          .update(voiceClones)
          .set({
            usageCount: (currentClone.usageCount || 0) + 1,
            lastUsedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(voiceClones.voiceId, request.voiceId));
      }

      return {
        success: true,
        audio: result.audio,
      };
    } catch (error: any) {
      console.error('[ElevenLabs] Generate preview error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get user's default voice ID
   */
  async getDefaultVoiceId(userId: number): Promise<string | null> {
    try {
      const [clone] = await db
        .select()
        .from(voiceClones)
        .where(
          and(
            eq(voiceClones.userId, userId),
            eq(voiceClones.isDefault, true),
            eq(voiceClones.status, 'active')
          )
        )
        .limit(1);

      return clone?.voiceId || null;
    } catch (error) {
      console.error('[ElevenLabs] Get default voice error:', error);
      return null;
    }
  }

  /**
   * Get supported languages
   */
  getSupportedLanguages() {
    return SUPPORTED_LANGUAGES;
  }
}

// Export singleton instance
export const elevenLabsService = new ElevenLabsService();
