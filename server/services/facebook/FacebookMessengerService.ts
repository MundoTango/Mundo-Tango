/**
 * Facebook Messenger Service
 * Handles sending messages via Facebook Graph API
 * Based on Part 10 specifications
 */

import axios from 'axios';

export interface FacebookSendParams {
  recipientId?: string;
  recipientEmail?: string;
  message: string;
}

export interface FacebookSendResult {
  success: boolean;
  messageId?: string;
  recipientId?: string;
  error?: string;
  timestamp: Date;
}

export interface RateLimitStatus {
  invitesUsedToday: number;
  dailyLimit: number;
  invitesUsedThisHour: number;
  hourlyLimit: number;
  canSend: boolean;
  resetTime: Date;
}

export class FacebookMessengerService {
  private static readonly GRAPH_API_URL = 'https://graph.facebook.com/v18.0';
  private static readonly accessToken = process.env.FACEBOOK_ACCESS_TOKEN || '';

  // Rate limiting (Phase 1: Scott only)
  private static readonly DAILY_LIMIT = 5;
  private static readonly HOURLY_LIMIT = 1;

  // In-memory rate limit tracking (should be moved to database for production)
  private static invitesSentToday: Map<number, number[]> = new Map();

  /**
   * Send message via Facebook Messenger
   */
  static async sendMessage(params: FacebookSendParams): Promise<FacebookSendResult> {
    const { recipientId, recipientEmail, message } = params;

    if (!this.accessToken) {
      return {
        success: false,
        error: 'Facebook access token not configured',
        timestamp: new Date()
      };
    }

    if (!recipientId && !recipientEmail) {
      return {
        success: false,
        error: 'Either recipientId or recipientEmail must be provided',
        timestamp: new Date()
      };
    }

    try {
      // Determine recipient
      let finalRecipientId = recipientId;
      if (!finalRecipientId && recipientEmail) {
        // In production, you'd look up PSID from email via Facebook API
        // For now, we'll simulate this
        console.log(`[Facebook] Looking up PSID for email: ${recipientEmail}`);
        // This would require additional Facebook API calls or database lookup
      }

      if (!finalRecipientId) {
        return {
          success: false,
          error: 'Could not determine Facebook recipient ID',
          timestamp: new Date()
        };
      }

      // Send message via Graph API
      const response = await axios.post(
        `${this.GRAPH_API_URL}/me/messages`,
        {
          recipient: { id: finalRecipientId },
          message: { text: message }
        },
        {
          params: {
            access_token: this.accessToken
          },
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        messageId: response.data.message_id,
        recipientId: response.data.recipient_id,
        timestamp: new Date()
      };
    } catch (error: any) {
      console.error('[Facebook] Failed to send message:', error);
      
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message,
        timestamp: new Date()
      };
    }
  }

  /**
   * Check rate limit status for a user
   */
  static getRateLimitStatus(userId: number): RateLimitStatus {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const hourStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours());

    // Get user's sent timestamps
    const sentTimestamps = this.invitesSentToday.get(userId) || [];

    // Filter to today and this hour
    const sentToday = sentTimestamps.filter(ts => ts >= todayStart.getTime());
    const sentThisHour = sentTimestamps.filter(ts => ts >= hourStart.getTime());

    const invitesUsedToday = sentToday.length;
    const invitesUsedThisHour = sentThisHour.length;

    const canSend = 
      invitesUsedToday < this.DAILY_LIMIT && 
      invitesUsedThisHour < this.HOURLY_LIMIT;

    // Calculate reset time (next day at midnight)
    const resetTime = new Date(todayStart);
    resetTime.setDate(resetTime.getDate() + 1);

    return {
      invitesUsedToday,
      dailyLimit: this.DAILY_LIMIT,
      invitesUsedThisHour,
      hourlyLimit: this.HOURLY_LIMIT,
      canSend,
      resetTime
    };
  }

  /**
   * Track sent invite for rate limiting
   */
  static trackSentInvite(userId: number): void {
    const now = Date.now();
    const userSent = this.invitesSentToday.get(userId) || [];
    
    // Add current timestamp
    userSent.push(now);

    // Clean up old entries (older than 24 hours)
    const oneDayAgo = now - (24 * 60 * 60 * 1000);
    const filtered = userSent.filter(ts => ts > oneDayAgo);

    this.invitesSentToday.set(userId, filtered);
  }

  /**
   * Verify Facebook API connection
   */
  static async verifyConnection(): Promise<boolean> {
    if (!this.accessToken) {
      console.error('[Facebook] Access token not configured');
      return false;
    }

    try {
      const response = await axios.get(
        `${this.GRAPH_API_URL}/me`,
        {
          params: {
            access_token: this.accessToken,
            fields: 'id,name'
          }
        }
      );

      console.log('[Facebook] Connection verified:', response.data);
      return true;
    } catch (error: any) {
      console.error('[Facebook] Connection verification failed:', error.response?.data || error.message);
      return false;
    }
  }

  /**
   * Get Facebook Page/App info
   */
  static async getPageInfo(): Promise<any> {
    try {
      const response = await axios.get(
        `${this.GRAPH_API_URL}/me`,
        {
          params: {
            access_token: this.accessToken,
            fields: 'id,name,email'
          }
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('[Facebook] Failed to get page info:', error);
      throw new Error(error.response?.data?.error?.message || error.message);
    }
  }
}
