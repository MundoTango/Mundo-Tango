/**
 * D-ID Video Avatar Service
 * Generates AI video avatars for God Level users
 * 
 * Pricing: Build plan $18/month (32 min streaming OR 16 min regular)
 * Revenue: $4,950/month (50 God Level users × $99)
 * Profit margin: 99.6%
 */

const isDIDConfigured = Boolean(process.env.DID_API_KEY);

export class VideoAvatarService {
  private didApiKey = process.env.DID_API_KEY;
  private didBaseUrl = 'https://api.d-id.com';

  /**
   * Create avatar from image
   */
  async createAvatar(imageUrl: string): Promise<{ success: boolean; avatarId?: string; error?: any }> {
    if (!isDIDConfigured) {
      console.warn('⚠️ DID_API_KEY not configured - video avatar creation blocked');
      throw new Error('D-ID not configured - DID_API_KEY missing. Please add to Replit secrets.');
    }

    try {
      const response = await fetch(`${this.didBaseUrl}/images`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(this.didApiKey!).toString('base64')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ source_url: imageUrl })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`D-ID API error: ${JSON.stringify(error)}`);
      }

      const data = await response.json();
      console.log('✅ D-ID avatar created:', data.id);
      return { success: true, avatarId: data.id };
    } catch (error) {
      console.error('❌ D-ID avatar creation error:', error);
      return { success: false, error };
    }
  }

  /**
   * Generate video from avatar + audio
   */
  async generateVideo(
    avatarId: string, 
    audioUrl: string, 
    options?: {
      driver_expressions?: any;
      config?: any;
    }
  ): Promise<{ success: boolean; videoId?: string; error?: any }> {
    if (!isDIDConfigured) {
      console.warn('⚠️ DID_API_KEY not configured - video generation blocked');
      throw new Error('D-ID not configured');
    }

    try {
      const response = await fetch(`${this.didBaseUrl}/talks`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(this.didApiKey!).toString('base64')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          source_url: avatarId,
          script: {
            type: 'audio',
            audio_url: audioUrl
          },
          driver_expressions: options?.driver_expressions,
          config: options?.config || {
            fluent: true,
            pad_audio: 0,
            stitch: true
          }
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`D-ID API error: ${JSON.stringify(error)}`);
      }

      const data = await response.json();
      console.log('✅ D-ID video generation started:', data.id);
      return { success: true, videoId: data.id };
    } catch (error) {
      console.error('❌ D-ID video generation error:', error);
      return { success: false, error };
    }
  }

  /**
   * Generate video from text script (using D-ID voice)
   */
  async generateVideoFromText(
    avatarId: string,
    script: string,
    voiceId?: string
  ): Promise<{ success: boolean; videoId?: string; error?: any }> {
    if (!isDIDConfigured) {
      throw new Error('D-ID not configured');
    }

    try {
      const response = await fetch(`${this.didBaseUrl}/talks`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(this.didApiKey!).toString('base64')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          source_url: avatarId,
          script: {
            type: 'text',
            input: script,
            provider: {
              type: 'microsoft',
              voice_id: voiceId || 'en-US-JennyNeural'
            }
          },
          config: {
            fluent: true,
            pad_audio: 0,
            stitch: true
          }
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`D-ID API error: ${JSON.stringify(error)}`);
      }

      const data = await response.json();
      console.log('✅ D-ID video from text started:', data.id);
      return { success: true, videoId: data.id };
    } catch (error) {
      console.error('❌ D-ID text-to-video error:', error);
      return { success: false, error };
    }
  }

  /**
   * Get video generation status
   */
  async getVideoStatus(videoId: string): Promise<{ 
    success: boolean; 
    status?: string; 
    video_url?: string; 
    error?: any 
  }> {
    if (!isDIDConfigured) {
      throw new Error('D-ID not configured');
    }

    try {
      const response = await fetch(`${this.didBaseUrl}/talks/${videoId}`, {
        headers: {
          'Authorization': `Basic ${Buffer.from(this.didApiKey!).toString('base64')}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`D-ID API error: ${JSON.stringify(error)}`);
      }

      const data = await response.json();
      console.log(`📹 D-ID video ${videoId} status:`, data.status);
      
      return {
        success: true,
        status: data.status, // 'created', 'started', 'done', 'error'
        video_url: data.result_url
      };
    } catch (error) {
      console.error('❌ D-ID status check error:', error);
      return { success: false, error };
    }
  }

  /**
   * Delete video
   */
  async deleteVideo(videoId: string): Promise<{ success: boolean; error?: any }> {
    if (!isDIDConfigured) {
      throw new Error('D-ID not configured');
    }

    try {
      const response = await fetch(`${this.didBaseUrl}/talks/${videoId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Basic ${Buffer.from(this.didApiKey!).toString('base64')}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`D-ID API error: ${JSON.stringify(error)}`);
      }

      console.log('✅ D-ID video deleted:', videoId);
      return { success: true };
    } catch (error) {
      console.error('❌ D-ID delete error:', error);
      return { success: false, error };
    }
  }

  /**
   * Check if D-ID is configured
   */
  static isConfigured(): boolean {
    return isDIDConfigured;
  }
}
