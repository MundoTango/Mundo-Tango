/**
 * ElevenLabs Service
 * High-level service for managing voice clones with database integration
 * 
 * Features:
 * - Voice clone creation and management
 * - Database persistence for clones
 * - User default voice management
 * - Preview generation
 */

import { db } from '@shared/db';
import { voiceClones, users } from '@shared/schema';
import { eq, and, desc } from 'drizzle-orm';
import { voiceCloningService } from './mrBlue/VoiceCloningService';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);
const mkdir = promisify(fs.mkdir);

interface CloneVoiceRequest {
  name: string;
  description?: string;
  audioFiles: string[]; // Base64 encoded audio or file paths
  language?: string;
}

interface CloneVoiceResponse {
  success: boolean;
  voiceId?: string;
  voiceCloneId?: number;
  error?: string;
}

interface ListVoiceClonesResponse {
  success: boolean;
  clones?: Array<{
    id: number;
    voiceId: string;
    name: string;
    description?: string;
    status: string;
    isDefault: boolean;
    audioSampleCount: number;
    language: string;
    usageCount: number;
    lastUsedAt?: Date;
    createdAt: Date;
  }>;
  error?: string;
}

interface DeleteVoiceCloneResponse {
  success: boolean;
  error?: string;
}

interface SetDefaultVoiceResponse {
  success: boolean;
  error?: string;
}

interface GeneratePreviewRequest {
  voiceId: string;
  text: string;
  language?: string;
}

interface GeneratePreviewResponse {
  success: boolean;
  audio?: Buffer;
  error?: string;
}

class ElevenLabsService {
  private tempDir = path.join(process.cwd(), 'attached_assets', 'voice_temp');

  constructor() {
    // Ensure temp directory exists
    mkdir(this.tempDir, { recursive: true }).catch(console.error);
  }

  /**
   * Create a new voice clone
   * - Processes audio files
   * - Creates voice on ElevenLabs
   * - Saves to database
   */
  async cloneVoice(
    userId: number,
    request: CloneVoiceRequest
  ): Promise<CloneVoiceResponse> {
    try {
      console.log(`[ElevenLabsService] Creating voice clone for user ${userId}: ${request.name}`);

      // Validate audio files
      if (!request.audioFiles || request.audioFiles.length === 0) {
        return {
          success: false,
          error: 'At least one audio file is required',
        };
      }

      if (request.audioFiles.length > 25) {
        return {
          success: false,
          error: 'Maximum 25 audio files allowed',
        };
      }

      // Process audio files (convert base64 to file paths if needed)
      const audioFilePaths: string[] = [];
      
      for (let i = 0; i < request.audioFiles.length; i++) {
        const audioData = request.audioFiles[i];
        
        // Check if it's a file path or base64 data
        if (audioData.startsWith('data:audio')) {
          // Base64 encoded audio
          const base64Data = audioData.split(',')[1];
          const buffer = Buffer.from(base64Data, 'base64');
          
          // Determine file extension from MIME type
          const mimeType = audioData.split(';')[0].split(':')[1];
          const extension = mimeType.split('/')[1]; // e.g., 'mpeg', 'wav'
          
          const filename = `clone_${userId}_${Date.now()}_${i}.${extension}`;
          const filepath = path.join(this.tempDir, filename);
          
          await writeFile(filepath, buffer);
          audioFilePaths.push(filepath);
        } else if (fs.existsSync(audioData)) {
          // Already a file path
          audioFilePaths.push(audioData);
        } else {
          console.warn(`[ElevenLabsService] Invalid audio data at index ${i}, skipping`);
        }
      }

      if (audioFilePaths.length === 0) {
        return {
          success: false,
          error: 'No valid audio files could be processed',
        };
      }

      console.log(`[ElevenLabsService] Processed ${audioFilePaths.length} audio files`);

      // Create voice clone on ElevenLabs using the private method from VoiceCloningService
      // We need to use the voiceCloningService directly
      const formData = require('form-data');
      const FormData = formData;
      const form = new FormData();
      
      form.append('name', request.name);
      if (request.description) {
        form.append('description', request.description);
      }
      
      // Add labels for tracking
      form.append('labels', JSON.stringify({
        user_id: userId.toString(),
        created_by: 'mr_blue',
        created_at: new Date().toISOString(),
      }));

      // Add audio files to form
      for (const filepath of audioFilePaths) {
        const fileStream = fs.createReadStream(filepath);
        const filename = path.basename(filepath);
        form.append('files', fileStream, filename);
      }

      // Call ElevenLabs API directly
      const apiKey = process.env.ELEVENLABS_API_KEY;
      if (!apiKey) {
        throw new Error('ELEVENLABS_API_KEY not configured');
      }

      const response = await fetch('https://api.elevenlabs.io/v1/voices/add', {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          ...form.getHeaders()
        },
        body: form as any
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('[ElevenLabsService] ElevenLabs API error:', error);
        throw new Error(`ElevenLabs API error: ${JSON.stringify(error)}`);
      }

      const data = await response.json();
      const elevenLabsVoiceId = data.voice_id;

      console.log(`[ElevenLabsService] Voice created on ElevenLabs: ${elevenLabsVoiceId}`);

      // Save to database
      const [voiceClone] = await db.insert(voiceClones).values({
        userId,
        voiceId: elevenLabsVoiceId,
        name: request.name,
        description: request.description,
        status: 'active',
        isDefault: false, // New clones are not default by default
        audioSampleCount: audioFilePaths.length,
        language: request.language || 'en',
        modelId: 'eleven_multilingual_v2',
        usageCount: 0,
        elevenLabsData: data,
      }).returning();

      console.log(`[ElevenLabsService] Voice clone saved to database: ID ${voiceClone.id}`);

      // Clean up temporary files
      try {
        for (const filepath of audioFilePaths) {
          if (filepath.includes(this.tempDir)) {
            await unlink(filepath);
          }
        }
        console.log('[ElevenLabsService] Cleaned up temporary files');
      } catch (error) {
        console.warn('[ElevenLabsService] Failed to clean up some files:', error);
      }

      return {
        success: true,
        voiceId: elevenLabsVoiceId,
        voiceCloneId: voiceClone.id,
      };
    } catch (error: any) {
      console.error('[ElevenLabsService] Clone voice error:', error);
      return {
        success: false,
        error: error.message || 'Failed to create voice clone',
      };
    }
  }

  /**
   * List all voice clones for a user
   */
  async listUserVoiceClones(userId: number): Promise<ListVoiceClonesResponse> {
    try {
      console.log(`[ElevenLabsService] Listing voice clones for user ${userId}`);

      const clones = await db
        .select()
        .from(voiceClones)
        .where(and(
          eq(voiceClones.userId, userId),
          eq(voiceClones.status, 'active')
        ))
        .orderBy(desc(voiceClones.createdAt));

      console.log(`[ElevenLabsService] Found ${clones.length} voice clones`);

      return {
        success: true,
        clones: clones.map(clone => ({
          id: clone.id,
          voiceId: clone.voiceId,
          name: clone.name,
          description: clone.description || undefined,
          status: clone.status,
          isDefault: clone.isDefault,
          audioSampleCount: clone.audioSampleCount || 0,
          language: clone.language,
          usageCount: clone.usageCount || 0,
          lastUsedAt: clone.lastUsedAt || undefined,
          createdAt: clone.createdAt,
        })),
      };
    } catch (error: any) {
      console.error('[ElevenLabsService] List clones error:', error);
      return {
        success: false,
        error: error.message || 'Failed to list voice clones',
      };
    }
  }

  /**
   * Delete a voice clone
   * - Verifies ownership
   * - Deletes from ElevenLabs
   * - Marks as deleted in database
   */
  async deleteVoiceClone(
    userId: number,
    cloneId: number
  ): Promise<DeleteVoiceCloneResponse> {
    try {
      console.log(`[ElevenLabsService] Deleting voice clone ${cloneId} for user ${userId}`);

      // Get the voice clone
      const [clone] = await db
        .select()
        .from(voiceClones)
        .where(and(
          eq(voiceClones.id, cloneId),
          eq(voiceClones.userId, userId)
        ))
        .limit(1);

      if (!clone) {
        return {
          success: false,
          error: 'Voice clone not found or access denied',
        };
      }

      // Delete from ElevenLabs
      const deleteResult = await voiceCloningService.deleteVoice(clone.voiceId);
      
      if (!deleteResult.success) {
        console.warn('[ElevenLabsService] Failed to delete from ElevenLabs, continuing with DB deletion');
      }

      // Mark as deleted in database (soft delete)
      await db
        .update(voiceClones)
        .set({ 
          status: 'deleted',
          updatedAt: new Date(),
        })
        .where(eq(voiceClones.id, cloneId));

      // If this was the default voice, update user's customVoiceId
      if (clone.isDefault) {
        await db
          .update(users)
          .set({ customVoiceId: null })
          .where(eq(users.id, userId));
      }

      console.log(`[ElevenLabsService] Voice clone ${cloneId} deleted successfully`);

      return {
        success: true,
      };
    } catch (error: any) {
      console.error('[ElevenLabsService] Delete clone error:', error);
      return {
        success: false,
        error: error.message || 'Failed to delete voice clone',
      };
    }
  }

  /**
   * Set a voice clone as the user's default voice
   */
  async setDefaultVoice(
    userId: number,
    cloneId: number
  ): Promise<SetDefaultVoiceResponse> {
    try {
      console.log(`[ElevenLabsService] Setting default voice ${cloneId} for user ${userId}`);

      // Verify the clone exists and belongs to the user
      const [clone] = await db
        .select()
        .from(voiceClones)
        .where(and(
          eq(voiceClones.id, cloneId),
          eq(voiceClones.userId, userId),
          eq(voiceClones.status, 'active')
        ))
        .limit(1);

      if (!clone) {
        return {
          success: false,
          error: 'Voice clone not found or access denied',
        };
      }

      // Start a transaction to update both tables atomically
      await db.transaction(async (tx) => {
        // Unset all other default voices for this user
        await tx
          .update(voiceClones)
          .set({ isDefault: false })
          .where(and(
            eq(voiceClones.userId, userId),
            eq(voiceClones.isDefault, true)
          ));

        // Set this clone as default
        await tx
          .update(voiceClones)
          .set({ 
            isDefault: true,
            updatedAt: new Date(),
          })
          .where(eq(voiceClones.id, cloneId));

        // Update user's customVoiceId
        await tx
          .update(users)
          .set({ customVoiceId: clone.voiceId })
          .where(eq(users.id, userId));
      });

      console.log(`[ElevenLabsService] Set voice ${cloneId} as default for user ${userId}`);

      return {
        success: true,
      };
    } catch (error: any) {
      console.error('[ElevenLabsService] Set default voice error:', error);
      return {
        success: false,
        error: error.message || 'Failed to set default voice',
      };
    }
  }

  /**
   * Generate a preview of a voice clone
   */
  async generatePreview(request: GeneratePreviewRequest): Promise<GeneratePreviewResponse> {
    try {
      console.log(`[ElevenLabsService] Generating preview for voice ${request.voiceId}`);

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
          error: result.error || 'Failed to generate preview',
        };
      }

      return {
        success: true,
        audio: result.audio,
      };
    } catch (error: any) {
      console.error('[ElevenLabsService] Generate preview error:', error);
      return {
        success: false,
        error: error.message || 'Failed to generate preview',
      };
    }
  }

  /**
   * Track voice usage
   * Increment usage count and update last used timestamp
   */
  async trackVoiceUsage(voiceId: string): Promise<void> {
    try {
      const [clone] = await db
        .select()
        .from(voiceClones)
        .where(eq(voiceClones.voiceId, voiceId))
        .limit(1);

      if (clone) {
        await db
          .update(voiceClones)
          .set({
            usageCount: (clone.usageCount || 0) + 1,
            lastUsedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(voiceClones.id, clone.id));

        console.log(`[ElevenLabsService] Tracked usage for voice ${voiceId}`);
      }
    } catch (error) {
      console.error('[ElevenLabsService] Track usage error:', error);
      // Don't throw - this is non-critical
    }
  }

  /**
   * Get user's default voice ID
   */
  async getUserDefaultVoice(userId: number): Promise<string | null> {
    try {
      const [clone] = await db
        .select()
        .from(voiceClones)
        .where(and(
          eq(voiceClones.userId, userId),
          eq(voiceClones.isDefault, true),
          eq(voiceClones.status, 'active')
        ))
        .limit(1);

      return clone?.voiceId || null;
    } catch (error) {
      console.error('[ElevenLabsService] Get default voice error:', error);
      return null;
    }
  }
}

// Export singleton instance
export const elevenLabsService = new ElevenLabsService();
