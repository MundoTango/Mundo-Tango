import axios from 'axios';
import { db } from '../../db';
import { userTelemetry } from '../../../shared/schema';

const D_ID_API_KEY = process.env.D_ID_API_KEY;
const D_ID_BASE_URL = 'https://api.d-id.com';

interface VideoCreationResponse {
  id: string;
  status: 'created' | 'processing' | 'done' | 'error';
  result_url?: string;
}

interface VideoStatusResponse {
  id: string;
  status: 'processing' | 'done' | 'error';
  result_url?: string;
  error?: string;
}

/**
 * D-ID Video Avatar Service
 * Creates talking avatar videos from text scripts
 * Cost: $35/month base + ~$0.10 per video
 */
export class DIDVideoService {
  private apiKey: string;

  constructor() {
    if (!D_ID_API_KEY) {
      throw new Error('D_ID_API_KEY environment variable is required');
    }
    this.apiKey = D_ID_API_KEY;
  }

  /**
   * Create a talking avatar video from script text
   * @param scriptText - The text for the avatar to speak
   * @param avatarImageUrl - URL to avatar image (Scott's photo or default)
   * @param userId - User ID for cost tracking
   * @returns Video ID and initial status
   */
  async createTalkingAvatar(
    scriptText: string,
    avatarImageUrl: string,
    userId: number
  ): Promise<{ videoId: string; videoUrl?: string }> {
    try {
      console.log('[DID] Creating talking avatar video...');

      const response = await axios.post<VideoCreationResponse>(
        `${D_ID_BASE_URL}/talks`,
        {
          script: {
            type: 'text',
            input: scriptText,
            provider: {
              type: 'microsoft',
              voice_id: 'en-US-JennyNeural'
            }
          },
          source_url: avatarImageUrl,
          config: {
            fluent: true,
            pad_audio: 0,
            stitch: true
          }
        },
        {
          headers: {
            'Authorization': `Basic ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const videoId = response.data.id;

      // Track usage and cost
      await this.trackUsage(userId, 'video_creation', 0.10);

      console.log(`[DID] Video created successfully: ${videoId}`);
      
      return {
        videoId,
        videoUrl: response.data.result_url
      };
    } catch (error: any) {
      console.error('[DID] Error creating video:', error.response?.data || error.message);
      throw new Error(`Failed to create D-ID video: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Check the status of a video generation
   * @param videoId - The video ID to check
   * @returns Current status and video URL if ready
   */
  async getVideoStatus(videoId: string): Promise<{
    status: 'processing' | 'done' | 'error';
    videoUrl?: string;
    error?: string;
  }> {
    try {
      const response = await axios.get<VideoStatusResponse>(
        `${D_ID_BASE_URL}/talks/${videoId}`,
        {
          headers: {
            'Authorization': `Basic ${this.apiKey}`
          }
        }
      );

      return {
        status: response.data.status,
        videoUrl: response.data.result_url,
        error: response.data.error
      };
    } catch (error: any) {
      console.error('[DID] Error checking video status:', error.response?.data || error.message);
      throw new Error(`Failed to check video status: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Delete a video (cleanup after 24 hours)
   * @param videoId - The video ID to delete
   */
  async deleteVideo(videoId: string): Promise<void> {
    try {
      await axios.delete(
        `${D_ID_BASE_URL}/talks/${videoId}`,
        {
          headers: {
            'Authorization': `Basic ${this.apiKey}`
          }
        }
      );

      console.log(`[DID] Video deleted: ${videoId}`);
    } catch (error: any) {
      console.error('[DID] Error deleting video:', error.response?.data || error.message);
      // Don't throw - deletion failures are not critical
    }
  }

  /**
   * Track usage in userTelemetry for cost monitoring
   */
  private async trackUsage(userId: number, eventType: string, cost: number): Promise<void> {
    try {
      await db.insert(userTelemetry).values({
        userId,
        eventType: `premium_${eventType}`,
        metadata: {
          service: 'd-id',
          cost,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('[DID] Error tracking usage:', error);
      // Don't throw - tracking failures shouldn't break the main flow
    }
  }
}

export const didVideoService = new DIDVideoService();
