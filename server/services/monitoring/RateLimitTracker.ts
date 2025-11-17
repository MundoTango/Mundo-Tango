/**
 * Rate Limit Tracker - Real-time rate limit monitoring
 * Tracks API usage across all social media platforms
 * PHASE 0A: Recursive Monitoring System
 */

import { db } from '../../db';
import { monitoringAlerts } from '@shared/schema';

export type Platform = 
  | 'facebook' 
  | 'instagram' 
  | 'twitter' 
  | 'tiktok' 
  | 'linkedin' 
  | 'youtube' 
  | 'whatsapp';

export type ActivityLevel = 
  | 'IDLE'      // 0 calls/hour → Daily monitoring
  | 'LOW'       // 1-10 calls/hour → Hourly monitoring
  | 'MEDIUM'    // 11-50 calls/hour → Every 5 min
  | 'HIGH'      // 51-150 calls/hour → Every 1 min
  | 'CRITICAL'; // >150 calls/hour → Every 10 sec

export interface RateLimitData {
  platform: Platform;
  callCount: number;
  totalTime: number;
  totalCputime: number;
  callsPerHour: number;
  percentUsed: number;
  timestamp: Date;
  headers?: Record<string, any>;
}

export interface RateLimitThresholds {
  throttleAt: number;  // 75%
  pauseAt: number;     // 90%
  stopAt: number;      // 100%
}

export interface ActivityMetrics {
  callsLastHour: number;
  level: ActivityLevel;
  recommendedInterval: string; // e.g., "daily", "hourly", "5min", "1min", "10sec"
  nextCheckTime: Date;
}

export class RateLimitTracker {
  private static readonly THRESHOLDS: RateLimitThresholds = {
    throttleAt: 75,
    pauseAt: 90,
    stopAt: 100,
  };

  // In-memory tracking (should be Redis in production)
  private static platformCalls: Map<Platform, number[]> = new Map();

  /**
   * Parse X-App-Usage header from Facebook/Instagram API responses
   */
  static parseFacebookHeaders(headers: Record<string, any>): RateLimitData | null {
    const usageHeader = headers['x-app-usage'];
    if (!usageHeader) return null;

    try {
      const usage = JSON.parse(usageHeader);
      const callsPerHour = this.getCallsLastHour('facebook');
      
      return {
        platform: 'facebook',
        callCount: usage.call_count || 0,
        totalTime: usage.total_time || 0,
        totalCputime: usage.total_cputime || 0,
        callsPerHour,
        percentUsed: usage.call_count || 0,
        timestamp: new Date(),
        headers: usage,
      };
    } catch (error) {
      console.error('[RateLimitTracker] Failed to parse Facebook headers:', error);
      return null;
    }
  }

  /**
   * Track API call for any platform
   */
  static trackCall(platform: Platform): void {
    const now = Date.now();
    const calls = this.platformCalls.get(platform) || [];
    
    calls.push(now);
    
    // Clean up calls older than 1 hour
    const oneHourAgo = now - (60 * 60 * 1000);
    const filtered = calls.filter(ts => ts > oneHourAgo);
    
    this.platformCalls.set(platform, filtered);
  }

  /**
   * Get number of calls in last hour for a platform
   */
  static getCallsLastHour(platform: Platform): number {
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);
    const calls = this.platformCalls.get(platform) || [];
    
    return calls.filter(ts => ts > oneHourAgo).length;
  }

  /**
   * Determine activity level based on calls per hour
   */
  static getActivityLevel(callsPerHour: number): ActivityLevel {
    if (callsPerHour === 0) return 'IDLE';
    if (callsPerHour <= 10) return 'LOW';
    if (callsPerHour <= 50) return 'MEDIUM';
    if (callsPerHour <= 150) return 'HIGH';
    return 'CRITICAL';
  }

  /**
   * Get recommended monitoring interval for activity level
   */
  static getRecommendedInterval(level: ActivityLevel): string {
    switch (level) {
      case 'IDLE': return 'daily';
      case 'LOW': return 'hourly';
      case 'MEDIUM': return '5min';
      case 'HIGH': return '1min';
      case 'CRITICAL': return '10sec';
      default: return 'hourly';
    }
  }

  /**
   * Calculate next check time based on activity level
   */
  static getNextCheckTime(level: ActivityLevel): Date {
    const now = new Date();
    
    switch (level) {
      case 'IDLE':
        return new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours
      case 'LOW':
        return new Date(now.getTime() + 60 * 60 * 1000); // 1 hour
      case 'MEDIUM':
        return new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes
      case 'HIGH':
        return new Date(now.getTime() + 60 * 1000); // 1 minute
      case 'CRITICAL':
        return new Date(now.getTime() + 10 * 1000); // 10 seconds
      default:
        return new Date(now.getTime() + 60 * 60 * 1000); // 1 hour
    }
  }

  /**
   * Get activity metrics for a platform
   */
  static getActivityMetrics(platform: Platform): ActivityMetrics {
    const callsLastHour = this.getCallsLastHour(platform);
    const level = this.getActivityLevel(callsLastHour);
    const recommendedInterval = this.getRecommendedInterval(level);
    const nextCheckTime = this.getNextCheckTime(level);

    return {
      callsLastHour,
      level,
      recommendedInterval,
      nextCheckTime,
    };
  }

  /**
   * Check if action is needed based on rate limit percentage
   */
  static async checkThresholds(
    platform: Platform,
    percentUsed: number,
    details?: Record<string, any>
  ): Promise<'normal' | 'throttle' | 'pause' | 'stop'> {
    if (percentUsed >= this.THRESHOLDS.stopAt) {
      await this.createAlert(platform, 'critical', 'STOP', percentUsed, details);
      return 'stop';
    }

    if (percentUsed >= this.THRESHOLDS.pauseAt) {
      await this.createAlert(platform, 'critical', 'PAUSE', percentUsed, details);
      return 'pause';
    }

    if (percentUsed >= this.THRESHOLDS.throttleAt) {
      await this.createAlert(platform, 'warning', 'THROTTLE', percentUsed, details);
      return 'throttle';
    }

    return 'normal';
  }

  /**
   * Create monitoring alert in database
   */
  private static async createAlert(
    platform: Platform,
    severity: 'info' | 'warning' | 'critical',
    action: 'THROTTLE' | 'PAUSE' | 'STOP',
    percentUsed: number,
    details?: Record<string, any>
  ): Promise<void> {
    try {
      await db.insert(monitoringAlerts).values({
        platform,
        alertType: 'rate_limit',
        severity,
        status: 'new',
        message: `Rate limit ${action} triggered at ${percentUsed}% usage`,
        details: details || {},
        rateLimitPercentage: percentUsed,
        actionTaken: action.toLowerCase(),
        notifiedUsers: [1], // Scott's user ID - update as needed
      });

      console.log(`[RateLimitTracker] ${severity.toUpperCase()} Alert created: ${platform} at ${percentUsed}% - ${action}`);
    } catch (error) {
      console.error('[RateLimitTracker] Failed to create alert:', error);
    }
  }

  /**
   * Process rate limit data and determine action
   */
  static async processRateLimit(data: RateLimitData): Promise<string> {
    const action = await this.checkThresholds(data.platform, data.percentUsed, {
      callCount: data.callCount,
      totalTime: data.totalTime,
      callsPerHour: data.callsPerHour,
      timestamp: data.timestamp.toISOString(),
    });

    const metrics = this.getActivityMetrics(data.platform);

    console.log(`[RateLimitTracker] ${data.platform.toUpperCase()}:`, {
      percentUsed: `${data.percentUsed}%`,
      callsPerHour: data.callsPerHour,
      activityLevel: metrics.level,
      recommendedInterval: metrics.recommendedInterval,
      action,
    });

    return action;
  }

  /**
   * Get all platform statuses
   */
  static getAllPlatformStatuses(): Record<Platform, ActivityMetrics> {
    const platforms: Platform[] = [
      'facebook',
      'instagram',
      'twitter',
      'tiktok',
      'linkedin',
      'youtube',
      'whatsapp',
    ];

    const statuses: Record<string, ActivityMetrics> = {};
    
    for (const platform of platforms) {
      statuses[platform] = this.getActivityMetrics(platform);
    }

    return statuses as Record<Platform, ActivityMetrics>;
  }

  /**
   * Reset tracking for a platform (for testing)
   */
  static resetPlatform(platform: Platform): void {
    this.platformCalls.delete(platform);
    console.log(`[RateLimitTracker] Reset tracking for ${platform}`);
  }

  /**
   * Get current thresholds
   */
  static getThresholds(): RateLimitThresholds {
    return { ...this.THRESHOLDS };
  }
}
