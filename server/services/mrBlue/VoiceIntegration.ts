/**
 * Voice Integration Service
 * Provides voice cloning integration for Mr Blue conversations
 * 
 * Features:
 * - Automatic voice selection (user's custom or default)
 * - TTS generation for chat messages
 * - Audio streaming for real-time conversations
 * - Video conference audio injection
 */

import { voiceCloningService } from './VoiceCloningService';
import type { VoiceGenerationOptions } from './VoiceCloningService';

export interface VoiceMessageOptions {
  userId: number;
  text: string;
  language?: string;
  streaming?: boolean;
  voiceSettings?: {
    stability?: number;
    similarityBoost?: number;
    style?: number;
    useSpeakerBoost?: boolean;
  };
}

class VoiceIntegrationService {
  /**
   * Generate speech for a chat message
   * Automatically uses user's custom voice if available
   */
  async generateChatMessage(options: VoiceMessageOptions): Promise<{
    success: boolean;
    audio?: Buffer;
    stream?: ReadableStream;
    voiceId: string;
    error?: any;
  }> {
    try {
      // Get user's voice ID (custom or default)
      let voiceId = await voiceCloningService.getUserVoiceId(options.userId);
      
      // If no custom voice, use a default professional voice
      if (!voiceId) {
        voiceId = '21m00Tcm4TlvDq8ikWAM'; // Rachel - professional female voice
        console.log(`[VoiceIntegration] Using default voice for user ${options.userId}`);
      } else {
        console.log(`[VoiceIntegration] Using custom voice ${voiceId} for user ${options.userId}`);
      }

      const generationOptions: VoiceGenerationOptions = {
        model_id: 'eleven_multilingual_v2',
        language: options.language as any,
        voice_settings: options.voiceSettings ? {
          stability: options.voiceSettings.stability,
          similarity_boost: options.voiceSettings.similarityBoost,
          style: options.voiceSettings.style,
          use_speaker_boost: options.voiceSettings.useSpeakerBoost,
        } : undefined,
      };

      // Generate streaming or regular audio
      if (options.streaming) {
        const result = await voiceCloningService.generateSpeechStream(
          voiceId,
          options.text,
          generationOptions
        );

        return {
          success: result.success,
          stream: result.stream,
          voiceId,
          error: result.error,
        };
      } else {
        const result = await voiceCloningService.generateSpeech(
          voiceId,
          options.text,
          generationOptions
        );

        return {
          success: result.success,
          audio: result.audio,
          voiceId,
          error: result.error,
        };
      }
    } catch (error: any) {
      console.error('[VoiceIntegration] Error generating speech:', error);
      return {
        success: false,
        voiceId: 'error',
        error,
      };
    }
  }

  /**
   * Generate audio for video conference
   * Returns audio stream suitable for Daily.co injection
   */
  async generateVideoConferenceAudio(options: VoiceMessageOptions): Promise<{
    success: boolean;
    audioUrl?: string;
    error?: any;
  }> {
    try {
      const result = await this.generateChatMessage({
        ...options,
        streaming: false, // Use non-streaming for video conference
      });

      if (!result.success || !result.audio) {
        throw new Error('Failed to generate audio');
      }

      // Convert to base64 data URL for easy transmission
      const audioBase64 = result.audio.toString('base64');
      const audioUrl = `data:audio/mpeg;base64,${audioBase64}`;

      return {
        success: true,
        audioUrl,
      };
    } catch (error: any) {
      console.error('[VoiceIntegration] Error generating video conference audio:', error);
      return {
        success: false,
        error,
      };
    }
  }

  /**
   * Check if user has a custom voice
   */
  async hasCustomVoice(userId: number): Promise<boolean> {
    const voiceId = await voiceCloningService.getUserVoiceId(userId);
    return voiceId !== null;
  }

  /**
   * Get voice info for a user
   */
  async getUserVoiceInfo(userId: number): Promise<{
    hasCustomVoice: boolean;
    voiceId: string | null;
    voiceName?: string;
  }> {
    const voiceId = await voiceCloningService.getUserVoiceId(userId);
    const hasCustomVoice = voiceId !== null;

    let voiceName: string | undefined;
    if (voiceId) {
      const result = await voiceCloningService.getVoice(voiceId);
      if (result.success && result.voice) {
        voiceName = result.voice.name;
      }
    }

    return {
      hasCustomVoice,
      voiceId,
      voiceName,
    };
  }

  /**
   * Generate audio for multiple messages in batch
   * Useful for conversation playback
   */
  async generateBatchMessages(
    messages: Array<{ userId: number; text: string; language?: string }>
  ): Promise<Array<{
    success: boolean;
    audio?: Buffer;
    error?: any;
  }>> {
    return Promise.all(
      messages.map(msg => this.generateChatMessage({
        ...msg,
        streaming: false,
      }))
    );
  }
}

// Export singleton instance
export const voiceIntegration = new VoiceIntegrationService();
