/**
 * Mr Blue Voice Cloning Service
 * ElevenLabs integration for voice cloning and multilingual TTS
 * 
 * Features:
 * - Voice cloning from audio URLs (YouTube, podcasts)
 * - Multi-language support (17 languages)
 * - Text-to-speech with cloned voice
 * - Real-time audio streaming
 * - Voice model management
 */

import FormData from 'form-data';
import fs from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { promises as fsPromises } from 'fs';
import { db } from '@shared/db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';

const execAsync = promisify(exec);
const isElevenLabsConfigured = Boolean(process.env.ELEVENLABS_API_KEY);

// Supported languages for ElevenLabs multilingual v2 model
export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'pl', name: 'Polish' },
  { code: 'tr', name: 'Turkish' },
  { code: 'ru', name: 'Russian' },
  { code: 'nl', name: 'Dutch' },
  { code: 'cs', name: 'Czech' },
  { code: 'ar', name: 'Arabic' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'hi', name: 'Hindi' },
  { code: 'id', name: 'Indonesian' },
] as const;

export type LanguageCode = typeof SUPPORTED_LANGUAGES[number]['code'];

export interface VoiceCloneRequest {
  audioUrls: string[];
  voiceName: string;
  userId: number;
  description?: string;
}

export interface VoiceGenerationOptions {
  model_id?: 'eleven_multilingual_v2' | 'eleven_monolingual_v1' | 'eleven_turbo_v2';
  language?: LanguageCode;
  voice_settings?: {
    stability?: number;
    similarity_boost?: number;
    style?: number;
    use_speaker_boost?: boolean;
  };
}

export interface VoiceModel {
  voice_id: string;
  name: string;
  category: string;
  description?: string;
  labels?: Record<string, string>;
  samples?: Array<{
    sample_id: string;
    file_name: string;
    mime_type: string;
    size_bytes: number;
  }>;
}

export class VoiceCloningService {
  private apiKey = process.env.ELEVENLABS_API_KEY;
  private baseUrl = 'https://api.elevenlabs.io/v1';
  private outputDir = path.join(process.cwd(), 'attached_assets', 'voice_samples');

  constructor() {
    // Ensure output directory exists
    fsPromises.mkdir(this.outputDir, { recursive: true }).catch(console.error);
  }

  /**
   * Download audio from YouTube using yt-dlp
   */
  async downloadAudioFromYouTube(url: string, outputPath: string): Promise<string> {
    const command = `yt-dlp -x --audio-format mp3 --audio-quality 0 -o "${outputPath}" "${url}"`;
    
    try {
      console.log(`[VoiceClone] Downloading YouTube audio: ${url}`);
      await execAsync(command);
      console.log(`[VoiceClone] Downloaded to: ${outputPath}`);
      return outputPath;
    } catch (error) {
      console.error('[VoiceClone] Failed to download YouTube:', url, error);
      throw new Error(`Failed to download audio from ${url}`);
    }
  }

  /**
   * Download audio from podcast URL
   */
  async downloadAudioFromPodcast(url: string, outputPath: string): Promise<string> {
    try {
      console.log(`[VoiceClone] Downloading podcast audio: ${url}`);
      const response = await fetch(url);
      
      // Check if it's an HTML page (like Podbean) that needs parsing
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('text/html')) {
        const html = await response.text();
        
        // Extract MP3 URL from HTML
        const mp3Match = html.match(/https:\/\/[^"']+\.mp3/);
        if (!mp3Match) {
          throw new Error('Could not find audio URL in podcast page');
        }
        
        const audioUrl = mp3Match[0];
        console.log(`[VoiceClone] Found audio URL: ${audioUrl}`);
        const audioResponse = await fetch(audioUrl);
        const buffer = await audioResponse.arrayBuffer();
        await fsPromises.writeFile(outputPath, Buffer.from(buffer));
      } else {
        // Direct audio file
        const buffer = await response.arrayBuffer();
        await fsPromises.writeFile(outputPath, Buffer.from(buffer));
      }
      
      console.log(`[VoiceClone] Downloaded to: ${outputPath}`);
      return outputPath;
    } catch (error) {
      console.error('[VoiceClone] Failed to download podcast:', url, error);
      throw new Error(`Failed to download podcast from ${url}`);
    }
  }

  /**
   * Extract voice sample from audio file using ffmpeg
   * Extracts a clean section suitable for voice cloning
   */
  async extractVoiceSample(
    audioPath: string, 
    startTime: number = 30, 
    duration: number = 120
  ): Promise<string> {
    const outputPath = audioPath.replace('.mp3', '_sample.mp3');
    const command = `ffmpeg -i "${audioPath}" -ss ${startTime} -t ${duration} -q:a 0 "${outputPath}" -y`;
    
    try {
      console.log(`[VoiceClone] Extracting sample from ${audioPath} (${startTime}s-${startTime+duration}s)`);
      await execAsync(command);
      console.log(`[VoiceClone] Extracted sample to: ${outputPath}`);
      return outputPath;
    } catch (error) {
      console.error('[VoiceClone] Failed to extract sample:', error);
      throw new Error('Failed to extract voice sample');
    }
  }

  /**
   * Clone user voice from audio URLs
   * Downloads, processes, and submits to ElevenLabs
   */
  async cloneUserVoice(request: VoiceCloneRequest): Promise<string> {
    if (!isElevenLabsConfigured) {
      throw new Error('ELEVENLABS_API_KEY not configured');
    }

    console.log(`[VoiceClone] Starting voice cloning for user ${request.userId}...`);
    console.log(`[VoiceClone] Processing ${request.audioUrls.length} audio URLs`);
    
    const downloadedFiles: string[] = [];
    
    // Download all audio sources
    for (let index = 0; index < request.audioUrls.length; index++) {
      const url = request.audioUrls[index];
      const filename = `audio_${request.userId}_${Date.now()}_${index}.mp3`;
      const outputPath = path.join(this.outputDir, filename);
      
      try {
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
          await this.downloadAudioFromYouTube(url, outputPath);
        } else if (url.includes('podbean.com') || url.endsWith('.mp3') || url.endsWith('.wav')) {
          await this.downloadAudioFromPodcast(url, outputPath);
        } else {
          console.warn('[VoiceClone] Unknown URL type, attempting direct download:', url);
          await this.downloadAudioFromPodcast(url, outputPath);
        }
        
        downloadedFiles.push(outputPath);
      } catch (error) {
        console.error(`[VoiceClone] Failed to download URL ${index + 1}:`, url, error);
        // Continue with other files
      }
    }
    
    if (downloadedFiles.length === 0) {
      throw new Error('Failed to download any audio files');
    }
    
    console.log(`[VoiceClone] Successfully downloaded ${downloadedFiles.length} audio files`);
    
    // Extract clean voice samples (skip first 30s to avoid intros, take 2 minutes)
    const sampleFiles = await Promise.all(
      downloadedFiles.map(file => this.extractVoiceSample(file, 30, 120))
    );
    
    console.log(`[VoiceClone] Extracted ${sampleFiles.length} voice samples`);
    
    // Submit to ElevenLabs for voice cloning
    const result = await this.createVoiceClone(request.voiceName, sampleFiles, {
      description: request.description || `Cloned voice for ${request.voiceName}`,
      labels: {
        user_id: request.userId.toString(),
        created_by: 'mr_blue',
        created_at: new Date().toISOString(),
      }
    });
    
    if (!result.success || !result.voiceId) {
      throw new Error(`Voice cloning failed: ${result.error}`);
    }
    
    console.log(`[VoiceClone] ✅ Successfully cloned voice! Voice ID: ${result.voiceId}`);
    
    // Save voice ID to user profile
    await db.update(users)
      .set({ customVoiceId: result.voiceId })
      .where(eq(users.id, request.userId));
    
    console.log(`[VoiceClone] Updated user ${request.userId} profile with voice ID`);
    
    // Clean up temporary files
    try {
      for (const file of [...downloadedFiles, ...sampleFiles]) {
        await fsPromises.unlink(file);
      }
      console.log('[VoiceClone] Cleaned up temporary files');
    } catch (error) {
      console.warn('[VoiceClone] Failed to clean up some files:', error);
    }
    
    return result.voiceId;
  }

  /**
   * Create voice clone on ElevenLabs
   */
  private async createVoiceClone(
    name: string, 
    audioFiles: string[],
    options?: {
      description?: string;
      labels?: Record<string, string>;
    }
  ): Promise<{ success: boolean; voiceId?: string; error?: any }> {
    if (!isElevenLabsConfigured) {
      throw new Error('ELEVENLABS_API_KEY not configured');
    }

    try {
      const formData = new FormData();
      formData.append('name', name);
      
      if (options?.description) {
        formData.append('description', options.description);
      }
      
      if (options?.labels) {
        formData.append('labels', JSON.stringify(options.labels));
      }

      // Add audio files
      for (const filePath of audioFiles) {
        const fileStream = fs.createReadStream(filePath);
        const fileName = path.basename(filePath);
        formData.append('files', fileStream, fileName);
      }

      const response = await fetch(`${this.baseUrl}/voices/add`, {
        method: 'POST',
        headers: {
          'xi-api-key': this.apiKey!,
          ...formData.getHeaders()
        },
        body: formData as any
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('[VoiceClone] ElevenLabs API error:', error);
        throw new Error(`ElevenLabs API error: ${JSON.stringify(error)}`);
      }

      const data = await response.json();
      console.log('[VoiceClone] ✅ Voice cloned on ElevenLabs:', data.voice_id);
      return { success: true, voiceId: data.voice_id };
    } catch (error) {
      console.error('[VoiceClone] ❌ Voice cloning error:', error);
      return { success: false, error };
    }
  }

  /**
   * Generate speech from text using cloned voice
   * Supports 17 languages with multilingual model
   */
  async generateSpeech(
    voiceId: string, 
    text: string,
    options?: VoiceGenerationOptions
  ): Promise<{ success: boolean; audio?: Buffer; error?: any }> {
    if (!isElevenLabsConfigured) {
      throw new Error('ELEVENLABS_API_KEY not configured');
    }

    try {
      const modelId = options?.model_id || 'eleven_multilingual_v2';
      
      console.log(`[VoiceClone] Generating speech with voice ${voiceId}, model: ${modelId}`);
      
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
            model_id: modelId,
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
        console.error('[VoiceClone] Speech generation error:', error);
        throw new Error(`ElevenLabs API error: ${JSON.stringify(error)}`);
      }

      const audioBuffer = Buffer.from(await response.arrayBuffer());
      console.log(`[VoiceClone] ✅ Speech generated: ${audioBuffer.length} bytes`);
      return { success: true, audio: audioBuffer };
    } catch (error) {
      console.error('[VoiceClone] ❌ Speech generation error:', error);
      return { success: false, error };
    }
  }

  /**
   * Generate speech with streaming for real-time playback
   */
  async generateSpeechStream(
    voiceId: string,
    text: string,
    options?: VoiceGenerationOptions
  ): Promise<{ success: boolean; stream?: ReadableStream; error?: any }> {
    if (!isElevenLabsConfigured) {
      throw new Error('ELEVENLABS_API_KEY not configured');
    }

    try {
      const modelId = options?.model_id || 'eleven_multilingual_v2';
      
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
            model_id: modelId,
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

      console.log('[VoiceClone] ✅ Streaming speech started');
      return { success: true, stream: response.body! };
    } catch (error) {
      console.error('[VoiceClone] ❌ Stream error:', error);
      return { success: false, error };
    }
  }

  /**
   * List all available voices (both custom and premade)
   */
  async listVoices(): Promise<{ 
    success: boolean; 
    voices?: VoiceModel[];
    error?: any 
  }> {
    if (!isElevenLabsConfigured) {
      console.warn('[VoiceClone] ELEVENLABS_API_KEY not configured');
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
      console.log(`[VoiceClone] Found ${data.voices.length} voices`);
      return { success: true, voices: data.voices };
    } catch (error) {
      console.error('[VoiceClone] ❌ List voices error:', error);
      return { success: false, error };
    }
  }

  /**
   * Get detailed voice information
   */
  async getVoice(voiceId: string): Promise<{ 
    success: boolean; 
    voice?: VoiceModel;
    error?: any 
  }> {
    if (!isElevenLabsConfigured) {
      throw new Error('ELEVENLABS_API_KEY not configured');
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
      console.log('[VoiceClone] Voice details retrieved:', voiceId);
      return { success: true, voice: data };
    } catch (error) {
      console.error('[VoiceClone] ❌ Get voice error:', error);
      return { success: false, error };
    }
  }

  /**
   * Delete a voice model
   */
  async deleteVoice(voiceId: string): Promise<{ success: boolean; error?: any }> {
    if (!isElevenLabsConfigured) {
      throw new Error('ELEVENLABS_API_KEY not configured');
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

      console.log('[VoiceClone] ✅ Voice deleted:', voiceId);
      return { success: true };
    } catch (error) {
      console.error('[VoiceClone] ❌ Delete error:', error);
      return { success: false, error };
    }
  }

  /**
   * Get user's custom voice ID from database
   */
  async getUserVoiceId(userId: number): Promise<string | null> {
    try {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      return user?.customVoiceId || null;
    } catch (error) {
      console.error('[VoiceClone] Error fetching user voice:', error);
      return null;
    }
  }

  /**
   * Check if ElevenLabs is configured
   */
  static isConfigured(): boolean {
    return isElevenLabsConfigured;
  }

  /**
   * Get supported languages
   */
  static getSupportedLanguages() {
    return SUPPORTED_LANGUAGES;
  }
}

// Export singleton instance
export const voiceCloningService = new VoiceCloningService();
