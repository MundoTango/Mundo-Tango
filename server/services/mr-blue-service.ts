import { lumaService } from './luma-service';
import axios from 'axios';

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_VOICE_ID = process.env.MR_BLUE_VOICE_ID || 'pNInz6obpgDQGcFmaJgB'; // Adam voice

interface MrBlueConfig {
  personality: string;
  voiceId: string;
  videoModel: 'ray-2-flash' | 'ray-2';
  enableVideo: boolean;
  enableVoice: boolean;
}

interface MrBlueResponse {
  text: string;
  audioUrl?: string;
  videoUrl?: string;
  status: 'processing' | 'ready';
}

class MrBlueService {
  private config: MrBlueConfig;

  constructor() {
    this.config = {
      personality: 'Mr Blue is a friendly, knowledgeable tango expert and AI assistant for the MundoTango community. He provides helpful advice about tango dancing, music, events, and connections.',
      voiceId: ELEVENLABS_VOICE_ID,
      videoModel: 'ray-2-flash',
      enableVideo: true,
      enableVoice: true,
    };
  }

  async chat(userMessage: string, options?: { includeVideo?: boolean; includeVoice?: boolean }): Promise<MrBlueResponse> {
    try {
      // Generate text response (placeholder - integrate with your AI model)
      const responseText = await this.generateResponse(userMessage);

      const response: MrBlueResponse = {
        text: responseText,
        status: 'processing',
      };

      // Generate voice if enabled
      if (options?.includeVoice !== false && this.config.enableVoice) {
        const audioUrl = await this.generateVoice(responseText);
        response.audioUrl = audioUrl;
      }

      // Generate video if enabled
      if (options?.includeVideo && this.config.enableVideo) {
        const videoUrl = await this.generateVideo(responseText);
        response.videoUrl = videoUrl;
      }

      response.status = 'ready';
      return response;
    } catch (error: any) {
      console.error('Mr Blue chat error:', error);
      throw new Error(`Mr Blue error: ${error.message}`);
    }
  }

  private async generateResponse(userMessage: string): Promise<string> {
    // TODO: Integrate with OpenAI/Claude or your AI model
    // For now, return a simple response
    const responses = [
      `Hello! I'm Mr Blue, your tango assistant. You said: "${userMessage}". How can I help you with tango today?`,
      `That's interesting! Let me share some tango insights about what you mentioned.`,
      `Great question! In the world of tango, ${userMessage.toLowerCase()} is important to understand.`,
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  private async generateVoice(text: string): Promise<string> {
    if (!ELEVENLABS_API_KEY) {
      console.warn('ElevenLabs API key not configured');
      return '';
    }

    try {
      const response = await axios.post(
        `https://api.elevenlabs.io/v1/text-to-speech/${this.config.voiceId}`,
        {
          text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        },
        {
          headers: {
            'xi-api-key': ELEVENLABS_API_KEY,
            'Content-Type': 'application/json',
          },
          responseType: 'arraybuffer',
        }
      );

      // TODO: Save audio to storage and return URL
      // For now, return base64 encoded audio
      const base64Audio = Buffer.from(response.data).toString('base64');
      return `data:audio/mpeg;base64,${base64Audio}`;
    } catch (error: any) {
      console.error('ElevenLabs error:', error.response?.data || error.message);
      throw error;
    }
  }

  private async generateVideo(text: string): Promise<string> {
    try {
      const prompt = `A friendly male tango expert named Mr Blue speaking to camera, professional setting, warm lighting`;
      const result = await lumaService.generateTextToVideo(prompt, {
        model: this.config.videoModel,
        resolution: '720p',
      });

      // Poll for completion
      const completed = await lumaService.waitForCompletion(result.id, 120000, 5000);
      return completed.video?.url || '';
    } catch (error: any) {
      console.error('Video generation error:', error);
      throw error;
    }
  }

  async generateAvatar(prompt: string): Promise<{ videoUrl: string; generationId: string }> {
    const result = await lumaService.generateTextToVideo(
      `Mr Blue, a friendly tango expert avatar: ${prompt}`,
      { model: this.config.videoModel, resolution: '720p' }
    );

    return {
      generationId: result.id,
      videoUrl: '', // Will be available after polling
    };
  }
}

export const mrBlueService = new MrBlueService();
