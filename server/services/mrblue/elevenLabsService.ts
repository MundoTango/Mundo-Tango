import fetch from 'node-fetch';

/**
 * ElevenLabs Service for Text-to-Speech and Speech-to-Text
 * Implements audio conversation capabilities using ElevenLabs API
 */
export class ElevenLabsService {
  private apiKey: string;
  private voiceId: string;
  private baseUrl = 'https://api.elevenlabs.io/v1';

  constructor() {
    this.apiKey = process.env.ELEVENLABS_API_KEY || '';
    this.voiceId = process.env.ELEVENLABS_VOICE_ID || 'Adam'; // Default to Adam voice
    
    if (!this.apiKey) {
      console.warn('ELEVENLABS_API_KEY not configured');
    }
  }

  /**
   * Convert text to speech using ElevenLabs
   * @param text Text to convert to speech
   * @param voiceSettings Optional voice settings
   * @returns Audio URL or buffer
   */
  async textToSpeech(
    text: string,
    voiceSettings?: {
      stability?: number;
      similarity_boost?: number;
      style?: number;
      use_speaker_boost?: boolean;
    }
  ): Promise<{ url: string; buffer: Buffer }> {
    try {
      const response = await fetch(
        `${this.baseUrl}/text-to-speech/${this.voiceId}`,
        {
          method: 'POST',
          headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': this.apiKey,
          },
          body: JSON.stringify({
            text,
            model_id: 'eleven_turbo_v2', // Fastest model for real-time
            voice_settings: voiceSettings || {
              stability: 0.5,
              similarity_boost: 0.75,
              style: 0.0,
              use_speaker_boost: true,
            },
          }),
        }
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`ElevenLabs TTS failed: ${error}`);
      }

      const buffer = Buffer.from(await response.arrayBuffer());
      
      // In production, you would upload to S3 or similar
      // For now, return base64 data URL
      const base64Audio = buffer.toString('base64');
      const dataUrl = `data:audio/mpeg;base64,${base64Audio}`;

      return {
        url: dataUrl,
        buffer,
      };
    } catch (error: any) {
      console.error('Text-to-Speech error:', error);
      throw new Error(`Failed to convert text to speech: ${error.message}`);
    }
  }

  /**
   * Transcribe audio to text using ElevenLabs Speech-to-Text
   * Falls back to Groq Whisper if ElevenLabs doesn't support STT yet
   * @param audioBuffer Audio file buffer
   * @returns Transcribed text
   */
  async transcribeAudio(audioBuffer: Buffer): Promise<string> {
    try {
      // ElevenLabs doesn't have native STT yet, so use Groq Whisper
      return await this.transcribeWithGroq(audioBuffer);
    } catch (error: any) {
      console.error('Audio transcription error:', error);
      throw new Error(`Failed to transcribe audio: ${error.message}`);
    }
  }

  /**
   * Use Groq's Whisper model for transcription (cheaper and faster)
   */
  private async transcribeWithGroq(audioBuffer: Buffer): Promise<string> {
    const groqApiKey = process.env.GROQ_API_KEY;
    
    if (!groqApiKey) {
      throw new Error('GROQ_API_KEY not configured for transcription');
    }

    try {
      const FormData = (await import('form-data')).default;
      const form = new FormData();
      form.append('file', audioBuffer, {
        filename: 'audio.webm',
        contentType: 'audio/webm',
      });
      form.append('model', 'whisper-large-v3');
      form.append('temperature', '0');
      form.append('response_format', 'json');
      form.append('language', 'en');

      const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${groqApiKey}`,
          ...form.getHeaders(),
        },
        body: form,
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Groq transcription failed: ${error}`);
      }

      const data: any = await response.json();
      return data.text || '';
    } catch (error: any) {
      console.error('Groq transcription error:', error);
      throw new Error(`Transcription failed: ${error.message}`);
    }
  }

  /**
   * Get available voices from ElevenLabs
   */
  async getVoices(): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/voices`, {
        method: 'GET',
        headers: {
          'xi-api-key': this.apiKey,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch voices');
      }

      const data: any = await response.json();
      return data.voices || [];
    } catch (error: any) {
      console.error('Get voices error:', error);
      return [];
    }
  }

  /**
   * Set the voice ID to use for TTS
   */
  setVoiceId(voiceId: string) {
    this.voiceId = voiceId;
  }

  /**
   * Get current voice ID
   */
  getVoiceId(): string {
    return this.voiceId;
  }

  /**
   * Stream text-to-speech for real-time playback
   * Returns streaming response for immediate audio playback
   */
  async streamTextToSpeech(text: string): Promise<NodeJS.ReadableStream> {
    try {
      const response = await fetch(
        `${this.baseUrl}/text-to-speech/${this.voiceId}/stream`,
        {
          method: 'POST',
          headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': this.apiKey,
          },
          body: JSON.stringify({
            text,
            model_id: 'eleven_turbo_v2',
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to stream TTS');
      }

      return response.body as unknown as NodeJS.ReadableStream;
    } catch (error: any) {
      console.error('Stream TTS error:', error);
      throw new Error(`Failed to stream text-to-speech: ${error.message}`);
    }
  }
}
