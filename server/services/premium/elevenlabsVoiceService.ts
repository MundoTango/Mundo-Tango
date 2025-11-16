import axios from 'axios';
import { db } from '../../db';
import { userTelemetry } from '../../../shared/schema';
import OpenAI from 'openai';

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_BASE_URL = 'https://api.elevenlabs.io/v1';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

interface Voice {
  voice_id: string;
  name: string;
  category: string;
}

interface TTSResponse {
  audio: Buffer;
  characterCount: number;
}

/**
 * ElevenLabs Voice Service
 * Provides high-quality text-to-speech and voice cloning
 * Cost: $22/month base + ~$0.30 per 1000 characters
 */
export class ElevenLabsVoiceService {
  private apiKey: string;
  private openai?: OpenAI;

  constructor() {
    if (!ELEVENLABS_API_KEY) {
      console.warn('[ElevenLabs] API key not found, will use OpenAI TTS fallback');
    }
    this.apiKey = ELEVENLABS_API_KEY || '';

    // Initialize OpenAI for fallback
    if (OPENAI_API_KEY) {
      this.openai = new OpenAI({ apiKey: OPENAI_API_KEY });
    }
  }

  /**
   * Get user's custom voice ID or fallback to default
   */
  async getUserVoiceId(userId: number, defaultVoiceId?: string): Promise<string> {
    try {
      const { users } = await import('../../../shared/schema');
      const { eq } = await import('drizzle-orm');
      
      const [user] = await db.select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (user?.customVoiceId) {
        console.log(`[ElevenLabs] Using custom voice for user ${userId}: ${user.customVoiceId}`);
        return user.customVoiceId;
      }
    } catch (error) {
      console.warn('[ElevenLabs] Failed to fetch custom voice, using default:', error);
    }

    return defaultVoiceId || '21m00Tcm4TlvDq8ikWAM'; // Rachel voice as default
  }

  /**
   * Convert text to speech using ElevenLabs
   * Automatically uses custom voice if user has one
   * Falls back to OpenAI TTS if ElevenLabs fails
   * @param text - Text to convert to speech
   * @param voiceId - ElevenLabs voice ID (optional, will use custom voice if available)
   * @param userId - User ID for cost tracking
   * @returns Audio URL and character count
   */
  async textToSpeech(
    text: string,
    voiceId: string = '21m00Tcm4TlvDq8ikWAM', // Rachel voice
    userId: number
  ): Promise<{ audioUrl: string; characterCount: number }> {
    // Get user's custom voice if they have one
    const actualVoiceId = await this.getUserVoiceId(userId, voiceId);

    // Try ElevenLabs first
    if (this.apiKey) {
      try {
        return await this.elevenLabsTTS(text, actualVoiceId, userId);
      } catch (error) {
        console.error('[ElevenLabs] TTS failed, falling back to OpenAI:', error);
      }
    }

    // Fallback to OpenAI TTS
    return await this.openAITTSFallback(text, userId);
  }

  /**
   * ElevenLabs TTS implementation
   */
  private async elevenLabsTTS(
    text: string,
    voiceId: string,
    userId: number
  ): Promise<{ audioUrl: string; characterCount: number }> {
    try {
      console.log('[ElevenLabs] Converting text to speech...');

      const response = await axios.post(
        `${ELEVENLABS_BASE_URL}/text-to-speech/${voiceId}`,
        {
          text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75
          }
        },
        {
          headers: {
            'xi-api-key': this.apiKey,
            'Content-Type': 'application/json'
          },
          responseType: 'arraybuffer'
        }
      );

      const characterCount = text.length;
      const cost = (characterCount / 1000) * 0.30;

      // Track usage
      await this.trackUsage(userId, 'tts', cost);

      // In production, save to cloud storage (Cloudinary/S3)
      // For now, return a base64 data URL
      const audioBase64 = Buffer.from(response.data).toString('base64');
      const audioUrl = `data:audio/mpeg;base64,${audioBase64}`;

      console.log(`[ElevenLabs] TTS successful (${characterCount} chars, $${cost.toFixed(4)})`);

      return {
        audioUrl,
        characterCount
      };
    } catch (error: any) {
      console.error('[ElevenLabs] TTS error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * OpenAI TTS fallback (much cheaper: ~$0.015 per 1000 characters)
   */
  private async openAITTSFallback(
    text: string,
    userId: number
  ): Promise<{ audioUrl: string; characterCount: number }> {
    if (!this.openai) {
      throw new Error('OpenAI API key not configured for fallback TTS');
    }

    try {
      console.log('[OpenAI] Using TTS fallback...');

      const mp3 = await this.openai.audio.speech.create({
        model: 'tts-1',
        voice: 'alloy',
        input: text
      });

      const buffer = Buffer.from(await mp3.arrayBuffer());
      const characterCount = text.length;
      const cost = (characterCount / 1000) * 0.015;

      // Track usage
      await this.trackUsage(userId, 'tts_fallback', cost);

      const audioBase64 = buffer.toString('base64');
      const audioUrl = `data:audio/mpeg;base64,${audioBase64}`;

      console.log(`[OpenAI] TTS fallback successful (${characterCount} chars, $${cost.toFixed(4)})`);

      return {
        audioUrl,
        characterCount
      };
    } catch (error: any) {
      console.error('[OpenAI] TTS fallback error:', error.message);
      throw new Error(`All TTS services failed: ${error.message}`);
    }
  }

  /**
   * Get available voices from ElevenLabs
   */
  async getAvailableVoices(): Promise<Voice[]> {
    if (!this.apiKey) {
      throw new Error('ElevenLabs API key not configured');
    }

    try {
      const response = await axios.get(
        `${ELEVENLABS_BASE_URL}/voices`,
        {
          headers: {
            'xi-api-key': this.apiKey
          }
        }
      );

      return response.data.voices;
    } catch (error: any) {
      console.error('[ElevenLabs] Error fetching voices:', error.response?.data || error.message);
      throw new Error(`Failed to fetch voices: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Clone a voice from audio samples
   * @param audioSamples - Array of audio file URLs
   * @param name - Name for the cloned voice
   * @param userId - User ID for tracking
   */
  async cloneVoice(
    audioSamples: string[],
    name: string,
    userId: number
  ): Promise<{ voiceId: string }> {
    if (!this.apiKey) {
      throw new Error('ElevenLabs API key not configured');
    }

    try {
      console.log('[ElevenLabs] Cloning voice...');

      // Note: Voice cloning requires audio files to be uploaded
      // This is a simplified implementation - in production, handle file uploads
      const response = await axios.post(
        `${ELEVENLABS_BASE_URL}/voices/add`,
        {
          name,
          description: `Cloned voice for ${name}`,
          files: audioSamples
        },
        {
          headers: {
            'xi-api-key': this.apiKey,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      // Track voice cloning (one-time cost)
      await this.trackUsage(userId, 'voice_clone', 0);

      console.log(`[ElevenLabs] Voice cloned: ${response.data.voice_id}`);

      return {
        voiceId: response.data.voice_id
      };
    } catch (error: any) {
      console.error('[ElevenLabs] Voice cloning error:', error.response?.data || error.message);
      throw new Error(`Failed to clone voice: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Track usage in userTelemetry
   */
  private async trackUsage(userId: number, eventType: string, cost: number): Promise<void> {
    try {
      await db.insert(userTelemetry).values({
        userId,
        eventType: `premium_${eventType}`,
        metadata: {
          service: 'elevenlabs',
          cost,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('[ElevenLabs] Error tracking usage:', error);
    }
  }
}

export const elevenlabsVoiceService = new ElevenLabsVoiceService();
