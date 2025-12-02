/**
 * Mr Blue API Client Service
 * Handles communication with Mr Blue backend APIs (Luma Video Generation)
 * Implements Pattern 46: Validation and retry logic
 */

// TypeScript Interfaces
export interface TextToVideoRequest {
  prompt: string;
  aspectRatio?: '16:9' | '9:16' | '4:3' | '3:4' | '21:9' | '9:21';
  duration?: number;
}

export interface ImageToVideoRequest {
  prompt: string;
  imageUrl: string;
  startFrame?: string;
  endFrame?: string;
}

export interface LumaHealthResponse {
  service: string;
  status: 'healthy' | 'degraded' | 'down';
  apiConfigured: boolean;
  endpoints: string[];
}

export interface VideoGenerationResponse {
  success: boolean;
  generationId?: string;
  videoUrl?: string;
  status?: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
  retryAttempt?: number;
}

// API Client Class
class MrBlueApiClient {
  private baseUrl: string;
  private maxRetries: number = 3;
  
  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || '/api/mrblue';
  }

  async checkHealth(): Promise<LumaHealthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/luma/health`);
      if (!response.ok) throw new Error(`Health check failed: ${response.statusText}`);
      return await response.json();
    } catch (error) {
      return { service: 'luma', status: 'down', apiConfigured: false, endpoints: [] };
    }
  }

  async generateTextToVideo(request: TextToVideoRequest, attemptNumber: number = 1): Promise<VideoGenerationResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/luma/text-to-video`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        if (attemptNumber < this.maxRetries) {
          await new Promise(r => setTimeout(r, 1000 * attemptNumber));
          return this.generateTextToVideo(request, attemptNumber + 1);
        }
        throw new Error(`Failed: ${response.statusText}`);
      }

      return { success: true, ...await response.json(), retryAttempt: attemptNumber };
    } catch (error) {
      if (attemptNumber < this.maxRetries) return this.generateTextToVideo(request, attemptNumber + 1);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error', retryAttempt: attemptNumber };
    }
  }

  async generateImageToVideo(request: ImageToVideoRequest, attemptNumber: number = 1): Promise<VideoGenerationResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/luma/image-to-video`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        if (attemptNumber < this.maxRetries) {
          await new Promise(r => setTimeout(r, 1000 * attemptNumber));
          return this.generateImageToVideo(request, attemptNumber + 1);
        }
        throw new Error(`Failed: ${response.statusText}`);
      }

      return { success: true, ...await response.json(), retryAttempt: attemptNumber };
    } catch (error) {
      if (attemptNumber < this.maxRetries) return this.generateImageToVideo(request, attemptNumber + 1);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error', retryAttempt: attemptNumber };
    }
  }
}

export const mrBlueApi = new MrBlueApiClient();
export default mrBlueApi;
