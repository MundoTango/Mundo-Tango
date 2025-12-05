/**
 * SOCIAL MEDIA PLATFORM ADAPTERS
 * MB.MD v9.9.3 - Multi-Platform Publishing
 * 
 * Adapters for: TikTok, YouTube Shorts, Instagram Reels, Facebook
 */

import axios from 'axios';

// ============================================================================
// TYPES
// ============================================================================

export interface PublishRequest {
  videoUrl: string;
  caption: string;
  hashtags: string[];
  scheduledFor?: Date;
  userId: number;
}

export interface PublishResult {
  success: boolean;
  postId?: string;
  postUrl?: string;
  error?: string;
}

export interface OAuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
}

// ============================================================================
// BASE ADAPTER
// ============================================================================

export abstract class SocialMediaAdapter {
  protected name: string;
  protected rateLimitPerMinute: number;
  protected lastRequestTime: number = 0;
  protected requestCount: number = 0;

  constructor(name: string, rateLimitPerMinute: number) {
    this.name = name;
    this.rateLimitPerMinute = rateLimitPerMinute;
  }

  protected async checkRateLimit(): Promise<void> {
    const now = Date.now();
    const minuteAgo = now - 60000;

    if (this.lastRequestTime < minuteAgo) {
      this.requestCount = 0;
    }

    if (this.requestCount >= this.rateLimitPerMinute) {
      const waitTime = 60000 - (now - this.lastRequestTime);
      console.log(`[${this.name}] Rate limited, waiting ${waitTime}ms`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      this.requestCount = 0;
    }

    this.lastRequestTime = now;
    this.requestCount++;
  }

  abstract publish(request: PublishRequest, tokens: OAuthTokens): Promise<PublishResult>;
  abstract refreshTokens(refreshToken: string): Promise<OAuthTokens>;
  abstract getAuthUrl(redirectUri: string): string;
}

// ============================================================================
// TIKTOK ADAPTER
// ============================================================================

export class TikTokAdapter extends SocialMediaAdapter {
  private clientKey: string;
  private clientSecret: string;

  constructor() {
    super('TikTok', 30); // 30 requests per minute
    this.clientKey = process.env.TIKTOK_CLIENT_KEY || '';
    this.clientSecret = process.env.TIKTOK_CLIENT_SECRET || '';
  }

  getAuthUrl(redirectUri: string): string {
    const scope = 'user.info.basic,video.upload,video.publish';
    return `https://www.tiktok.com/v2/auth/authorize/?client_key=${this.clientKey}&scope=${scope}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}`;
  }

  async refreshTokens(refreshToken: string): Promise<OAuthTokens> {
    try {
      const response = await axios.post('https://open.tiktokapis.com/v2/oauth/token/', {
        client_key: this.clientKey,
        client_secret: this.clientSecret,
        grant_type: 'refresh_token',
        refresh_token: refreshToken
      });

      return {
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token,
        expiresAt: new Date(Date.now() + response.data.expires_in * 1000)
      };
    } catch (error: any) {
      console.error('[TikTok] Token refresh failed:', error);
      throw error;
    }
  }

  async publish(request: PublishRequest, tokens: OAuthTokens): Promise<PublishResult> {
    await this.checkRateLimit();

    try {
      // Step 1: Initialize video upload
      const initResponse = await axios.post(
        'https://open.tiktokapis.com/v2/post/publish/video/init/',
        {
          post_info: {
            title: request.caption,
            privacy_level: 'PUBLIC_TO_EVERYONE',
            disable_duet: false,
            disable_comment: false,
            disable_stitch: false
          },
          source_info: {
            source: 'PULL_FROM_URL',
            video_url: request.videoUrl
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${tokens.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const publishId = initResponse.data.data?.publish_id;

      // Step 2: Check publish status
      let status = 'PROCESSING';
      let attempts = 0;
      
      while (status === 'PROCESSING' && attempts < 30) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        const statusResponse = await axios.post(
          'https://open.tiktokapis.com/v2/post/publish/status/fetch/',
          { publish_id: publishId },
          {
            headers: {
              'Authorization': `Bearer ${tokens.accessToken}`,
              'Content-Type': 'application/json'
            }
          }
        );

        status = statusResponse.data.data?.status;
        attempts++;
      }

      if (status === 'PUBLISH_COMPLETE') {
        return {
          success: true,
          postId: publishId,
          postUrl: `https://www.tiktok.com/@user/video/${publishId}`
        };
      }

      return { success: false, error: `Upload failed with status: ${status}` };
    } catch (error: any) {
      console.error('[TikTok] Publish failed:', error);
      return { success: false, error: error.message };
    }
  }
}

// ============================================================================
// YOUTUBE SHORTS ADAPTER
// ============================================================================

export class YouTubeShortsAdapter extends SocialMediaAdapter {
  private clientId: string;
  private clientSecret: string;

  constructor() {
    super('YouTube', 6); // 6 uploads per minute (conservative)
    this.clientId = process.env.YOUTUBE_CLIENT_ID || '';
    this.clientSecret = process.env.YOUTUBE_CLIENT_SECRET || '';
  }

  getAuthUrl(redirectUri: string): string {
    const scope = 'https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube';
    return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${this.clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}&access_type=offline`;
  }

  async refreshTokens(refreshToken: string): Promise<OAuthTokens> {
    try {
      const response = await axios.post('https://oauth2.googleapis.com/token', {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token'
      });

      return {
        accessToken: response.data.access_token,
        refreshToken: refreshToken, // YouTube doesn't return new refresh token
        expiresAt: new Date(Date.now() + response.data.expires_in * 1000)
      };
    } catch (error: any) {
      console.error('[YouTube] Token refresh failed:', error);
      throw error;
    }
  }

  async publish(request: PublishRequest, tokens: OAuthTokens): Promise<PublishResult> {
    await this.checkRateLimit();

    try {
      // Download video to buffer first
      const videoResponse = await axios.get(request.videoUrl, { responseType: 'arraybuffer' });
      const videoBuffer = Buffer.from(videoResponse.data);

      // YouTube requires resumable upload for videos
      // Step 1: Start resumable upload
      const initResponse = await axios.post(
        'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status',
        {
          snippet: {
            title: request.caption.substring(0, 100),
            description: `${request.caption}\n\n${request.hashtags.join(' ')}`,
            tags: request.hashtags.map(h => h.replace('#', '')),
            categoryId: '10' // Music category for tango
          },
          status: {
            privacyStatus: 'public',
            selfDeclaredMadeForKids: false,
            madeForKids: false
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${tokens.accessToken}`,
            'Content-Type': 'application/json',
            'X-Upload-Content-Type': 'video/mp4',
            'X-Upload-Content-Length': videoBuffer.length
          }
        }
      );

      const uploadUrl = initResponse.headers.location;

      // Step 2: Upload video content
      const uploadResponse = await axios.put(uploadUrl, videoBuffer, {
        headers: {
          'Authorization': `Bearer ${tokens.accessToken}`,
          'Content-Type': 'video/mp4',
          'Content-Length': videoBuffer.length
        }
      });

      const videoId = uploadResponse.data?.id;

      return {
        success: true,
        postId: videoId,
        postUrl: `https://youtube.com/shorts/${videoId}`
      };
    } catch (error: any) {
      console.error('[YouTube] Publish failed:', error);
      return { success: false, error: error.message };
    }
  }
}

// ============================================================================
// INSTAGRAM REELS ADAPTER
// ============================================================================

export class InstagramReelsAdapter extends SocialMediaAdapter {
  private appId: string;
  private appSecret: string;

  constructor() {
    super('Instagram', 200); // 200 requests per hour
    this.appId = process.env.FACEBOOK_APP_ID || '';
    this.appSecret = process.env.FACEBOOK_APP_SECRET || '';
  }

  getAuthUrl(redirectUri: string): string {
    const scope = 'instagram_basic,instagram_content_publish';
    return `https://www.facebook.com/v18.0/dialog/oauth?client_id=${this.appId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&response_type=code`;
  }

  async refreshTokens(refreshToken: string): Promise<OAuthTokens> {
    try {
      const response = await axios.get(
        `https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${this.appId}&client_secret=${this.appSecret}&fb_exchange_token=${refreshToken}`
      );

      return {
        accessToken: response.data.access_token,
        refreshToken: response.data.access_token, // Long-lived token
        expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) // 60 days
      };
    } catch (error: any) {
      console.error('[Instagram] Token refresh failed:', error);
      throw error;
    }
  }

  async publish(request: PublishRequest, tokens: OAuthTokens): Promise<PublishResult> {
    await this.checkRateLimit();

    try {
      // Get Instagram Business Account ID
      const accountsResponse = await axios.get(
        `https://graph.facebook.com/v18.0/me/accounts?access_token=${tokens.accessToken}`
      );
      
      const pageId = accountsResponse.data.data?.[0]?.id;
      
      const igAccountResponse = await axios.get(
        `https://graph.facebook.com/v18.0/${pageId}?fields=instagram_business_account&access_token=${tokens.accessToken}`
      );
      
      const igAccountId = igAccountResponse.data.instagram_business_account?.id;

      if (!igAccountId) {
        return { success: false, error: 'No Instagram Business Account linked' };
      }

      // Step 1: Create media container
      const containerResponse = await axios.post(
        `https://graph.facebook.com/v18.0/${igAccountId}/media`,
        {
          media_type: 'REELS',
          video_url: request.videoUrl,
          caption: `${request.caption}\n\n${request.hashtags.join(' ')}`,
          share_to_feed: true
        },
        {
          headers: { 'Content-Type': 'application/json' },
          params: { access_token: tokens.accessToken }
        }
      );

      const containerId = containerResponse.data.id;

      // Step 2: Wait for processing
      let status = 'IN_PROGRESS';
      let attempts = 0;
      
      while (status === 'IN_PROGRESS' && attempts < 30) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        const statusResponse = await axios.get(
          `https://graph.facebook.com/v18.0/${containerId}?fields=status_code&access_token=${tokens.accessToken}`
        );

        status = statusResponse.data.status_code;
        attempts++;
      }

      if (status !== 'FINISHED') {
        return { success: false, error: `Processing failed with status: ${status}` };
      }

      // Step 3: Publish the media
      const publishResponse = await axios.post(
        `https://graph.facebook.com/v18.0/${igAccountId}/media_publish`,
        { creation_id: containerId },
        { params: { access_token: tokens.accessToken } }
      );

      const mediaId = publishResponse.data.id;

      return {
        success: true,
        postId: mediaId,
        postUrl: `https://www.instagram.com/reel/${mediaId}`
      };
    } catch (error: any) {
      console.error('[Instagram] Publish failed:', error);
      return { success: false, error: error.message };
    }
  }
}

// ============================================================================
// FACTORY
// ============================================================================

export function getSocialMediaAdapter(platform: string): SocialMediaAdapter | null {
  switch (platform.toLowerCase()) {
    case 'tiktok':
      return new TikTokAdapter();
    case 'youtube':
    case 'youtube_shorts':
      return new YouTubeShortsAdapter();
    case 'instagram':
    case 'instagram_reels':
      return new InstagramReelsAdapter();
    default:
      return null;
  }
}
