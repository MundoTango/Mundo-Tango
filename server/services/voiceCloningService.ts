/**
 * ElevenLabs Voice Cloning Service
 * Clones user voice for God Level marketing features
 * 
 * Pricing: Creator plan $22/month (100K characters/month)
 * Revenue: $4,950/month (50 God Level users × $99)
 * Combined with D-ID: 99.2% profit margin
 */

import FormData from 'form-data';
import fs from 'fs';

const isElevenLabsConfigured = Boolean(process.env.ELEVENLABS_API_KEY);

export class VoiceCloningService {
  private apiKey = process.env.ELEVENLABS_API_KEY;
  private baseUrl = 'https://api.elevenlabs.io/v1';

  /**
   * Clone voice from audio samples
   * @param name Voice name (e.g., "Scott's Voice")
   * @param audioFiles Array of audio file paths (1-5 minutes total)
   */
  async cloneVoice(
    name: string, 
    audioFiles: string[]
  ): Promise<{ success: boolean; voiceId?: string; error?: any }> {
    if (!isElevenLabsConfigured) {
      console.warn('⚠️ ELEVENLABS_API_KEY not configured - voice cloning blocked');
      throw new Error('ElevenLabs not configured - ELEVENLABS_API_KEY missing');
    }

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('labels', JSON.stringify({ 
        use_case: 'god_level_marketing',
        created_by: 'mundo_tango'
      }));

      // Add audio files
      for (const filePath of audioFiles) {
        const fileStream = fs.createReadStream(filePath);
        formData.append('files', fileStream);
      }

      const response = await fetch(`${this.baseUrl}/voices/add`, {
        method: 'POST',
        headers: {
          'xi-api-key': this.apiKey!,
          ...formData.getHeaders()
        },
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`ElevenLabs API error: ${JSON.stringify(error)}`);
      }

      const data = await response.json();
      console.log('✅ ElevenLabs voice cloned:', data.voice_id);
      return { success: true, voiceId: data.voice_id };
    } catch (error) {
      console.error('❌ ElevenLabs voice cloning error:', error);
      return { success: false, error };
    }
  }

  /**
   * Generate speech from text
   */
  async generateSpeech(
    voiceId: string, 
    text: string,
    options?: {
      model_id?: string;
      voice_settings?: {
        stability?: number;
        similarity_boost?: number;
        style?: number;
        use_speaker_boost?: boolean;
      }
    }
  ): Promise<{ success: boolean; audio?: Buffer; error?: any }> {
    if (!isElevenLabsConfigured) {
      console.warn('⚠️ ELEVENLABS_API_KEY not configured - speech generation blocked');
      throw new Error('ElevenLabs not configured');
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/text-to-speech/${voiceId}`,
        {
          method: 'POST',
          headers: {
            'xi-api-key': this.apiKey!,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            text,
            model_id: options?.model_id || 'eleven_multilingual_v2',
            voice_settings: {
              stability: options?.voice_settings?.stability ?? 0.5,
              similarity_boost: options?.voice_settings?.similarity_boost ?? 0.75,
              style: options?.voice_settings?.style ?? 0,
              use_speaker_boost: options?.voice_settings?.use_speaker_boost ?? true
            }
          })
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`ElevenLabs API error: ${JSON.stringify(error)}`);
      }

      const audioBuffer = Buffer.from(await response.arrayBuffer());
      console.log(`✅ ElevenLabs speech generated: ${audioBuffer.length} bytes`);
      return { success: true, audio: audioBuffer };
    } catch (error) {
      console.error('❌ ElevenLabs speech generation error:', error);
      return { success: false, error };
    }
  }

  /**
   * Generate speech with streaming response
   */
  async generateSpeechStream(
    voiceId: string,
    text: string
  ): Promise<{ success: boolean; stream?: NodeJS.ReadableStream; error?: any }> {
    if (!isElevenLabsConfigured) {
      throw new Error('ElevenLabs not configured');
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/text-to-speech/${voiceId}/stream`,
        {
          method: 'POST',
          headers: {
            'xi-api-key': this.apiKey!,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            text,
            model_id: 'eleven_multilingual_v2',
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75
            }
          })
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`ElevenLabs API error: ${JSON.stringify(error)}`);
      }

      console.log('✅ ElevenLabs streaming speech started');
      return { success: true, stream: response.body as any };
    } catch (error) {
      console.error('❌ ElevenLabs stream error:', error);
      return { success: false, error };
    }
  }

  /**
   * List available voices
   */
  async listVoices(): Promise<{ 
    success: boolean; 
    voices?: Array<{ voice_id: string; name: string; }>;
    error?: any 
  }> {
    if (!isElevenLabsConfigured) {
      console.warn('⚠️ ELEVENLABS_API_KEY not configured');
      return { success: false, voices: [], error: 'Not configured' };
    }

    try {
      const response = await fetch(`${this.baseUrl}/voices`, {
        headers: {
          'xi-api-key': this.apiKey!
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`ElevenLabs API error: ${JSON.stringify(error)}`);
      }

      const data = await response.json();
      console.log(`✅ ElevenLabs found ${data.voices.length} voices`);
      return { success: true, voices: data.voices };
    } catch (error) {
      console.error('❌ ElevenLabs list voices error:', error);
      return { success: false, error };
    }
  }

  /**
   * Get voice details
   */
  async getVoice(voiceId: string): Promise<{ 
    success: boolean; 
    voice?: any;
    error?: any 
  }> {
    if (!isElevenLabsConfigured) {
      throw new Error('ElevenLabs not configured');
    }

    try {
      const response = await fetch(`${this.baseUrl}/voices/${voiceId}`, {
        headers: {
          'xi-api-key': this.apiKey!
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`ElevenLabs API error: ${JSON.stringify(error)}`);
      }

      const data = await response.json();
      console.log('✅ ElevenLabs voice details:', voiceId);
      return { success: true, voice: data };
    } catch (error) {
      console.error('❌ ElevenLabs get voice error:', error);
      return { success: false, error };
    }
  }

  /**
   * Delete voice
   */
  async deleteVoice(voiceId: string): Promise<{ success: boolean; error?: any }> {
    if (!isElevenLabsConfigured) {
      throw new Error('ElevenLabs not configured');
    }

    try {
      const response = await fetch(`${this.baseUrl}/voices/${voiceId}`, {
        method: 'DELETE',
        headers: {
          'xi-api-key': this.apiKey!
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`ElevenLabs API error: ${JSON.stringify(error)}`);
      }

      console.log('✅ ElevenLabs voice deleted:', voiceId);
      return { success: true };
    } catch (error) {
      console.error('❌ ElevenLabs delete error:', error);
      return { success: false, error };
    }
  }

  /**
   * Get user subscription info
   */
  async getUserSubscription(): Promise<{
    success: boolean;
    subscription?: any;
    error?: any;
  }> {
    if (!isElevenLabsConfigured) {
      return { success: false, error: 'Not configured' };
    }

    try {
      const response = await fetch(`${this.baseUrl}/user/subscription`, {
        headers: {
          'xi-api-key': this.apiKey!
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`ElevenLabs API error: ${JSON.stringify(error)}`);
      }

      const data = await response.json();
      console.log('✅ ElevenLabs subscription:', data.tier);
      return { success: true, subscription: data };
    } catch (error) {
      console.error('❌ ElevenLabs subscription error:', error);
      return { success: false, error };
    }
  }

  /**
   * Check if ElevenLabs is configured
   */
  static isConfigured(): boolean {
    return isElevenLabsConfigured;
  }
}
