import axios from 'axios';

const LUMA_API_URL = 'https://api.lumalabs.ai/dream-machine/v1';
const LUMA_API_KEY = process.env.LUMA_API_KEY;

if (!LUMA_API_KEY) {
  console.warn('LUMA_API_KEY is not set in environment variables');
}

interface LumaGenerationParams {
  prompt: string;
  model?: 'ray-2-flash' | 'ray-2' | 'ray-1.6';
  resolution?: '540p' | '720p' | '1080p' | '4k';
  duration?: '5s';
  imageUrl?: string; // For image-to-video
}

interface LumaGenerationResponse {
  id: string;
  state: 'queued' | 'processing' | 'completed' | 'failed';
  video?: {
    url: string;
    width: number;
    height: number;
    duration: number;
  };
  failure_reason?: string;
}

export class LumaService {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || LUMA_API_KEY || '';
    this.baseUrl = LUMA_API_URL;
  }

  /**
   * Generate a video from text prompt
   */
  async generateTextToVideo(
    prompt: string,
    options: Partial<LumaGenerationParams> = {}
  ): Promise<LumaGenerationResponse> {
    if (!this.apiKey) {
      throw new Error('Luma API key is not configured');
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/generations`,
        {
          prompt,
          model: options.model || 'ray-2',
          resolution: options.resolution || '720p',
          duration: options.duration || '5s',
        },
        {
          headers: {
            'accept': 'application/json',
            'authorization': `Bearer ${this.apiKey}`,
            'content-type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Error generating text-to-video:', error.response?.data || error.message);
      throw new Error(`Luma API error: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Generate a video from an image and prompt
   */
  async generateImageToVideo(
    imageUrl: string,
    prompt: string,
    options: Partial<LumaGenerationParams> = {}
  ): Promise<LumaGenerationResponse> {
    if (!this.apiKey) {
      throw new Error('Luma API key is not configured');
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/generations`,
        {
          prompt,
          image_url: imageUrl,
          model: options.model || 'ray-2',
          resolution: options.resolution || '720p',
          duration: options.duration || '5s',
        },
        {
          headers: {
            'accept': 'application/json',
            'authorization': `Bearer ${this.apiKey}`,
            'content-type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Error generating image-to-video:', error.response?.data || error.message);
      throw new Error(`Luma API error: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Check the status of a generation
   */
  async getGenerationStatus(generationId: string): Promise<LumaGenerationResponse> {
    if (!this.apiKey) {
      throw new Error('Luma API key is not configured');
    }

    try {
      const response = await axios.get(
        `${this.baseUrl}/generations/${generationId}`,
        {
          headers: {
            'accept': 'application/json',
            'authorization': `Bearer ${this.apiKey}`,
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Error checking generation status:', error.response?.data || error.message);
      throw new Error(`Luma API error: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Poll for video generation completion
   */
  async waitForCompletion(
    generationId: string,
    maxWaitTime: number = 300000, // 5 minutes default
    pollInterval: number = 5000 // 5 seconds
  ): Promise<LumaGenerationResponse> {
    const startTime = Date.now();

    while (Date.now() - startTime < maxWaitTime) {
      const status = await this.getGenerationStatus(generationId);

      if (status.state === 'completed') {
        return status;
      }

      if (status.state === 'failed') {
        throw new Error(`Video generation failed: ${status.failure_reason}`);
      }

      // Wait before polling again
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }

    throw new Error('Video generation timed out');
  }
}

// Export a singleton instance
export const lumaService = new LumaService();
