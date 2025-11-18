import axios from 'axios';
import { db } from '../db';
import { didVideos, type InsertDIDVideo, type DIDVideo, voiceClones } from '@shared/schema';
import { eq, desc } from 'drizzle-orm';
import { uploadImage } from '../utils/cloudinary';

/**
 * D-ID Talking Avatar Service
 * Production-ready talking head video generation with full feature set:
 * - Avatar upload & presets
 * - SSML support for emotions
 * - D-ID + ElevenLabs voice integration
 * - Polling with progress tracking
 * - Cloudinary storage
 */

const D_ID_API_KEY = process.env.D_ID_API_KEY;
const D_ID_BASE_URL = 'https://api.d-id.com';

// D-ID Voice presets
export const DID_VOICE_PRESETS = [
  { id: 'en-US-JennyNeural', name: 'Jenny (US Female)', provider: 'microsoft' },
  { id: 'en-US-GuyNeural', name: 'Guy (US Male)', provider: 'microsoft' },
  { id: 'en-GB-SoniaNeural', name: 'Sonia (UK Female)', provider: 'microsoft' },
  { id: 'en-GB-RyanNeural', name: 'Ryan (UK Male)', provider: 'microsoft' },
  { id: 'en-AU-NatashaNeural', name: 'Natasha (AU Female)', provider: 'microsoft' },
  { id: 'en-AU-WilliamNeural', name: 'William (AU Male)', provider: 'microsoft' },
  { id: 'es-ES-ElviraNeural', name: 'Elvira (ES Female)', provider: 'microsoft' },
  { id: 'fr-FR-DeniseNeural', name: 'Denise (FR Female)', provider: 'microsoft' },
];

// Default Mr. Blue avatar presets
export const MRBLUE_AVATAR_PRESETS = [
  {
    id: 'mrblue-professional',
    name: 'Mr. Blue Professional',
    url: 'https://res.cloudinary.com/mundotango/image/upload/v1/avatars/mrblue-professional.jpg',
  },
  {
    id: 'mrblue-friendly',
    name: 'Mr. Blue Friendly',
    url: 'https://res.cloudinary.com/mundotango/image/upload/v1/avatars/mrblue-friendly.jpg',
  },
  {
    id: 'mrblue-casual',
    name: 'Mr. Blue Casual',
    url: 'https://res.cloudinary.com/mundotango/image/upload/v1/avatars/mrblue-casual.jpg',
  },
];

interface DIDTalkResponse {
  id: string;
  status: 'created' | 'started' | 'done' | 'error';
  result_url?: string;
  created_at?: string;
  error?: {
    kind: string;
    description: string;
  };
}

interface VideoGenerationOptions {
  avatarUrl: string;
  avatarPreset?: string;
  script: string;
  voice: string;
  voiceProvider?: 'microsoft' | 'elevenlabs';
  elevenLabsVoiceId?: string;
  useSSML?: boolean;
}

export class DIDService {
  private apiKey: string;

  constructor() {
    if (!D_ID_API_KEY) {
      throw new Error('D_ID_API_KEY environment variable is required');
    }
    this.apiKey = D_ID_API_KEY;
  }

  /**
   * Generate talking head video
   */
  async generateVideo(
    userId: number,
    options: VideoGenerationOptions
  ): Promise<DIDVideo> {
    console.log(`[D-ID] Generating video for user ${userId}`);

    // Prepare voice configuration
    const voiceConfig = await this.prepareVoiceConfig(
      options.voice,
      options.voiceProvider,
      options.elevenLabsVoiceId
    );

    // Prepare script (with SSML support if enabled)
    const scriptInput = options.useSSML
      ? { type: 'ssml' as const, ssml: options.script }
      : { type: 'text' as const, input: options.script };

    // Create D-ID talk request
    const response = await axios.post<DIDTalkResponse>(
      `${D_ID_BASE_URL}/talks`,
      {
        script: {
          ...scriptInput,
          provider: voiceConfig,
        },
        source_url: options.avatarUrl,
        config: {
          fluent: true,
          pad_audio: 0,
          stitch: true,
          result_format: 'mp4',
        },
      },
      {
        headers: {
          Authorization: `Basic ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const didVideoId = response.data.id;

    // Create database record
    const [video] = await db
      .insert(didVideos)
      .values({
        userId,
        didVideoId,
        avatarUrl: options.avatarUrl,
        avatarPreset: options.avatarPreset,
        script: options.script,
        voice: options.voice,
        voiceProvider: options.voiceProvider || 'd-id',
        elevenLabsVoiceId: options.elevenLabsVoiceId,
        status: 'pending',
        estimatedCost: '0.10',
      })
      .returning();

    console.log(`[D-ID] Video generation started: ${didVideoId}`);
    return video;
  }

  /**
   * Prepare voice configuration for D-ID API
   */
  private async prepareVoiceConfig(
    voice: string,
    voiceProvider?: 'microsoft' | 'elevenlabs',
    elevenLabsVoiceId?: string
  ): Promise<any> {
    if (voiceProvider === 'elevenlabs' && elevenLabsVoiceId) {
      // Use ElevenLabs voice
      return {
        type: 'elevenlabs',
        voice_id: elevenLabsVoiceId,
      };
    }

    // Use Microsoft Azure TTS (D-ID default)
    return {
      type: 'microsoft',
      voice_id: voice,
    };
  }

  /**
   * Check video generation status from D-ID
   */
  async checkDIDStatus(didVideoId: string): Promise<DIDTalkResponse> {
    const response = await axios.get<DIDTalkResponse>(
      `${D_ID_BASE_URL}/talks/${didVideoId}`,
      {
        headers: {
          Authorization: `Basic ${this.apiKey}`,
        },
      }
    );

    return response.data;
  }

  /**
   * Poll and complete video generation
   * Downloads from D-ID, uploads to Cloudinary, updates database
   */
  async completeVideoGeneration(didVideoId: string): Promise<DIDVideo> {
    console.log(`[D-ID] Completing video generation: ${didVideoId}`);

    // Get current status from D-ID
    const status = await this.checkDIDStatus(didVideoId);

    // Update status in database
    if (status.status === 'error') {
      await db
        .update(didVideos)
        .set({
          status: 'failed',
          failureReason: status.error?.description || 'Unknown error',
        })
        .where(eq(didVideos.didVideoId, didVideoId));

      throw new Error(`Video generation failed: ${status.error?.description}`);
    }

    if (status.status !== 'done' || !status.result_url) {
      // Update status but don't complete yet
      await db
        .update(didVideos)
        .set({
          status: status.status === 'started' ? 'processing' : 'pending',
        })
        .where(eq(didVideos.didVideoId, didVideoId));

      const [video] = await db
        .select()
        .from(didVideos)
        .where(eq(didVideos.didVideoId, didVideoId));
      return video;
    }

    // Video is complete! Download and upload to Cloudinary
    const videoBuffer = await this.downloadVideoBuffer(status.result_url);
    const cloudinaryResult = await this.uploadToCloudinary(
      videoBuffer,
      didVideoId
    );

    // Update database with final URLs and metadata
    await db
      .update(didVideos)
      .set({
        status: 'completed',
        videoUrl: status.result_url,
        cloudinaryUrl: cloudinaryResult.url,
        cloudinaryPublicId: cloudinaryResult.publicId,
        completedAt: new Date(),
      })
      .where(eq(didVideos.didVideoId, didVideoId));

    console.log(`[D-ID] Video generation complete and saved to Cloudinary`);

    const [video] = await db
      .select()
      .from(didVideos)
      .where(eq(didVideos.didVideoId, didVideoId));
    return video;
  }

  /**
   * Download video buffer from D-ID URL
   */
  private async downloadVideoBuffer(videoUrl: string): Promise<Buffer> {
    console.log('[D-ID] Downloading video from D-ID...');
    const response = await axios.get(videoUrl, {
      responseType: 'arraybuffer',
    });

    return Buffer.from(response.data);
  }

  /**
   * Upload video to Cloudinary
   */
  private async uploadToCloudinary(
    videoBuffer: Buffer,
    didVideoId: string
  ): Promise<{ url: string; publicId: string }> {
    console.log('[D-ID] Uploading video to Cloudinary...');

    return new Promise((resolve, reject) => {
      const cloudinary = require('cloudinary').v2;

      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'did_videos',
          resource_type: 'video',
          public_id: `video_${didVideoId}`,
          format: 'mp4',
        },
        (error: any, result: any) => {
          if (error) {
            console.error('[Cloudinary] Upload error:', error);
            reject(new Error(`Failed to upload video: ${error.message}`));
          } else if (result) {
            resolve({
              url: result.secure_url,
              publicId: result.public_id,
            });
          }
        }
      );

      uploadStream.end(videoBuffer);
    });
  }

  /**
   * Get user's video history
   */
  async getUserVideos(userId: number, limit: number = 20): Promise<DIDVideo[]> {
    return db
      .select()
      .from(didVideos)
      .where(eq(didVideos.userId, userId))
      .orderBy(desc(didVideos.createdAt))
      .limit(limit);
  }

  /**
   * Get single video by D-ID video ID
   */
  async getVideoByDIDId(didVideoId: string): Promise<DIDVideo | undefined> {
    const [video] = await db
      .select()
      .from(didVideos)
      .where(eq(didVideos.didVideoId, didVideoId));
    return video;
  }

  /**
   * Upload custom avatar image to Cloudinary
   */
  async uploadAvatar(
    imageBuffer: Buffer,
    userId: number,
    filename: string
  ): Promise<string> {
    console.log(`[D-ID] Uploading custom avatar for user ${userId}`);

    const result = await uploadImage(imageBuffer, {
      folder: `avatars/user_${userId}`,
      public_id: `avatar_${filename}`,
    });

    return result.secure_url;
  }

  /**
   * Get available voices (D-ID + user's ElevenLabs voices)
   */
  async getAvailableVoices(
    userId: number
  ): Promise<{
    did: typeof DID_VOICE_PRESETS;
    elevenlabs: Array<{ id: string; name: string }>;
  }> {
    // Get user's ElevenLabs voice clones
    const userVoices = await db
      .select()
      .from(voiceClones)
      .where(eq(voiceClones.userId, userId));

    return {
      did: DID_VOICE_PRESETS,
      elevenlabs: userVoices.map((v) => ({
        id: v.voiceId,
        name: v.name,
      })),
    };
  }

  /**
   * Delete video from D-ID (cleanup after 24 hours)
   */
  async deleteVideoFromDID(didVideoId: string): Promise<void> {
    try {
      await axios.delete(`${D_ID_BASE_URL}/talks/${didVideoId}`, {
        headers: {
          Authorization: `Basic ${this.apiKey}`,
        },
      });

      console.log(`[D-ID] Video deleted from D-ID: ${didVideoId}`);
    } catch (error: any) {
      console.error('[D-ID] Error deleting video:', error.response?.data || error.message);
    }
  }

  /**
   * Delete video from Cloudinary (cleanup)
   */
  async deleteFromCloudinary(publicId: string): Promise<void> {
    const cloudinary = require('cloudinary').v2;
    await cloudinary.uploader.destroy(publicId, { resource_type: 'video' });
    console.log(`[D-ID] Deleted video from Cloudinary: ${publicId}`);
  }

  /**
   * Validate SSML script
   */
  validateSSML(ssml: string): { valid: boolean; error?: string } {
    // Basic SSML validation
    const hasOpeningTag = ssml.includes('<speak>');
    const hasClosingTag = ssml.includes('</speak>');

    if (!hasOpeningTag || !hasClosingTag) {
      return {
        valid: false,
        error: 'SSML must be wrapped in <speak> tags',
      };
    }

    return { valid: true };
  }
}

export const didService = new DIDService();
