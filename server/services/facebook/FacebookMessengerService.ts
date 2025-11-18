/**
 * Facebook Messenger Service
 * Handles sending messages via Facebook Graph API
 * Based on Part 10 specifications
 * PHASE 0A: Integrated with Recursive Monitoring System
 */

import axios from 'axios';
import { RateLimitTracker } from '../monitoring/RateLimitTracker';
import { SocialMediaPolicyMonitor } from '../monitoring/SocialMediaPolicyMonitor';
import { PolicyComplianceChecker } from '../monitoring/PolicyComplianceChecker';

export interface FacebookSendParams {
  recipientId?: string;
  recipientEmail?: string;
  message: string;
  pageAccessToken?: string; // NEW: Accept Page Access Token from OAuth flow
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
  private static readonly accessToken = 
    process.env.FACEBOOK_PAGE_ACCESS_TOKEN || 
    process.env.FACEBOOK_ACCESS_TOKEN || 
    '';

  // Rate limiting (Phase 1: Scott only)
  private static readonly DAILY_LIMIT = 5;
  private static readonly HOURLY_LIMIT = 1;

  // In-memory rate limit tracking (should be moved to database for production)
  private static invitesSentToday: Map<number, number[]> = new Map();
  
  // PHASE 0A: Monitoring integration flag
  private static monitoringEnabled = true;

  /**
   * Send message via Facebook Messenger
   */
  static async sendMessage(params: FacebookSendParams): Promise<FacebookSendResult> {
    const { recipientId, recipientEmail, message, pageAccessToken } = params;

    // Prioritize OAuth Page Access Token, fallback to env var for backward compatibility
    const accessToken = pageAccessToken || this.accessToken;

    if (!accessToken) {
      return {
        success: false,
        error: 'Facebook access token not configured. Please connect your Facebook account.',
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
            access_token: accessToken
          },
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      // PHASE 0A: Process response headers for rate limit monitoring
      if (this.monitoringEnabled && response.headers) {
        await this.processResponseHeaders(response.headers);
      }

      return {
        success: true,
        messageId: response.data.message_id,
        recipientId: response.data.recipient_id,
        timestamp: new Date()
      };
    } catch (error: any) {
      console.error('[Facebook] Failed to send message:', error);
      
      // PHASE 0A: Check for spam flags and rate limit errors
      if (this.monitoringEnabled) {
        await this.handleAPIError(error);
      }
      
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
   * PHASE 1: Validate Facebook token (P0 CRITICAL)
   * Uses /debug_token endpoint to verify token validity, expiration, scopes
   */
  static async validateToken(): Promise<{
    isValid: boolean;
    appId?: string;
    expiresAt?: Date;
    scopes?: string[];
    userId?: string;
    error?: string;
    details?: any;
  }> {
    if (!this.accessToken) {
      return {
        isValid: false,
        error: 'FACEBOOK_PAGE_ACCESS_TOKEN not configured in environment variables'
      };
    }

    try {
      // Use debug_token endpoint to validate
      const response = await axios.get(
        `${this.GRAPH_API_URL}/debug_token`,
        {
          params: {
            input_token: this.accessToken,
            access_token: this.accessToken
          }
        }
      );

      const data = response.data.data;

      // Check if token is valid
      if (!data.is_valid) {
        return {
          isValid: false,
          error: 'Token is marked as invalid by Facebook',
          details: data
        };
      }

      // Check expiration (0 = never expires, otherwise timestamp)
      let expiresAt: Date | undefined;
      if (data.expires_at && data.expires_at > 0) {
        expiresAt = new Date(data.expires_at * 1000);
        
        // Check if already expired
        if (expiresAt < new Date()) {
          return {
            isValid: false,
            error: `Token expired on ${expiresAt.toISOString()}`,
            expiresAt,
            details: data
          };
        }
      }

      console.log('[Facebook] Token validation SUCCESS:', {
        appId: data.app_id,
        userId: data.user_id,
        scopes: data.scopes,
        expiresAt: expiresAt ? expiresAt.toISOString() : 'Never',
        type: data.type
      });

      return {
        isValid: true,
        appId: data.app_id,
        expiresAt,
        scopes: data.scopes || [],
        userId: data.user_id,
        details: data
      };
    } catch (error: any) {
      console.error('[Facebook] Token validation FAILED:', error.response?.data || error.message);
      return {
        isValid: false,
        error: error.response?.data?.error?.message || error.message,
        details: error.response?.data
      };
    }
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
      
      // PHASE 0A: Process response headers
      if (this.monitoringEnabled && response.headers) {
        await this.processResponseHeaders(response.headers);
      }
      
      return true;
    } catch (error: any) {
      console.error('[Facebook] Connection verification failed:', error.response?.data || error.message);
      
      // PHASE 0A: Handle API error
      if (this.monitoringEnabled) {
        await this.handleAPIError(error);
      }
      
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

  /**
   * PHASE 0A: Process response headers for rate limit monitoring
   */
  private static async processResponseHeaders(headers: Record<string, any>): Promise<void> {
    try {
      // Track API call
      RateLimitTracker.trackCall('facebook');

      // Process rate limit headers
      await SocialMediaPolicyMonitor.processAPIResponse('facebook', headers);

      console.log('[Facebook] Rate limit monitoring processed');
    } catch (error) {
      console.error('[Facebook] Failed to process monitoring headers:', error);
    }
  }

  /**
   * PHASE 0A: Handle API errors including spam flags
   */
  private static async handleAPIError(error: any): Promise<void> {
    const errorCode = error.response?.data?.error?.code?.toString() || '';
    const errorMessage = error.response?.data?.error?.message || error.message;
    const errorSubcode = error.response?.data?.error?.error_subcode?.toString() || '';

    // Check for spam flags (#368, #551 subcode 1545041)
    if (errorCode === '368' || (errorCode === '551' && errorSubcode === '1545041')) {
      console.error('[Facebook] SPAM FLAG DETECTED!', { errorCode, errorSubcode, errorMessage });
      await SocialMediaPolicyMonitor.handleSpamFlag('facebook', errorCode, errorMessage);
      return;
    }

    // Check for rate limit errors (#4, #17, #613)
    if (['4', '17', '613'].includes(errorCode)) {
      console.warn('[Facebook] Rate limit error detected:', { errorCode, errorMessage });
      // Rate limit errors are already tracked via headers
      return;
    }

    // Log other errors
    console.error('[Facebook] API Error:', { errorCode, errorSubcode, errorMessage });
  }

  /**
   * PHASE 0A: Enable/disable monitoring integration
   */
  static setMonitoringEnabled(enabled: boolean): void {
    this.monitoringEnabled = enabled;
    console.log(`[Facebook] Monitoring ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * PHASE 0A: Get current monitoring status
   */
  static getMonitoringStatus(): {
    enabled: boolean;
    activityMetrics: any;
  } {
    const metrics = RateLimitTracker.getActivityMetrics('facebook');
    return {
      enabled: this.monitoringEnabled,
      activityMetrics: metrics,
    };
  }
}
