import { storage } from '../../storage';
import { eq, and, gte, lte, desc, sql } from 'drizzle-orm';
import { crossPlatformAnalytics } from '@shared/schema';

export interface OptimalTimingRequest {
  userId: number;
  platform: string;
  timezone?: string;
  eventDate?: Date;
  contentType?: string;
}

export interface OptimalTimingResult {
  recommendedTime: Date;
  confidence: number;
  reasoning: string;
  alternativeTimes: Date[];
  platformPeakWindows: {
    start: string;
    end: string;
    engagementScore: number;
  }[];
  userHistoricalBestTimes?: {
    hour: number;
    dayOfWeek: number;
    avgEngagement: number;
  }[];
}

export interface EngagementPattern {
  hour: number;
  dayOfWeek: number;
  avgLikes: number;
  avgComments: number;
  avgShares: number;
  totalPosts: number;
}

export class PostingTimeOptimizer {
  private static readonly PLATFORM_PEAK_TIMES = {
    instagram: [
      { start: '09:00', end: '11:00', score: 0.9 },
      { start: '19:00', end: '21:00', score: 0.95 },
    ],
    facebook: [
      { start: '13:00', end: '16:00', score: 0.85 },
    ],
    linkedin: [
      { start: '08:00', end: '10:00', score: 0.9 },
      { start: '12:00', end: '14:00', score: 0.85 },
    ],
    twitter: [
      { start: '09:00', end: '11:00', score: 0.85 },
      { start: '18:00', end: '21:00', score: 0.9 },
    ],
    x: [
      { start: '09:00', end: '11:00', score: 0.85 },
      { start: '18:00', end: '21:00', score: 0.9 },
    ],
  };

  async optimizePostingTime(request: OptimalTimingRequest): Promise<OptimalTimingResult> {
    const { userId, platform, timezone = 'UTC', eventDate, contentType } = request;

    const userPatterns = await this.analyzeUserEngagementPatterns(userId, platform);
    
    const platformPeaks = this.getPlatformPeakTimes(platform);
    
    const recommendedTime = this.calculateOptimalTime({
      userPatterns,
      platformPeaks,
      timezone,
      eventDate,
      contentType,
    });

    const alternativeTimes = this.generateAlternativeTimes(recommendedTime, platformPeaks, 3);

    const confidence = this.calculateConfidence(userPatterns, platformPeaks);

    const reasoning = this.generateReasoning({
      hasUserData: userPatterns.length > 0,
      platform,
      recommendedTime,
      eventDate,
    });

    return {
      recommendedTime,
      confidence,
      reasoning,
      alternativeTimes,
      platformPeakWindows: platformPeaks.map(p => ({
        start: p.start,
        end: p.end,
        engagementScore: p.score,
      })),
      userHistoricalBestTimes: userPatterns.slice(0, 5).map(p => ({
        hour: p.hour,
        dayOfWeek: p.dayOfWeek,
        avgEngagement: (p.avgLikes + p.avgComments * 2 + p.avgShares * 3) / p.totalPosts,
      })),
    };
  }

  private async analyzeUserEngagementPatterns(userId: number, platform: string): Promise<EngagementPattern[]> {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const posts = await storage.getSocialPosts(userId);
      
      const patterns: Map<string, EngagementPattern> = new Map();

      posts.filter(p => 
        p.platforms?.includes(platform) &&
        p.publishedAt &&
        new Date(p.publishedAt) >= thirtyDaysAgo &&
        p.engagement
      ).forEach(post => {
        const publishedAt = new Date(post.publishedAt!);
        const hour = publishedAt.getHours();
        const dayOfWeek = publishedAt.getDay();
        const key = `${hour}-${dayOfWeek}`;

        const engagement = post.engagement as any;
        const likes = engagement?.likes || 0;
        const comments = engagement?.comments || 0;
        const shares = engagement?.shares || 0;

        if (!patterns.has(key)) {
          patterns.set(key, {
            hour,
            dayOfWeek,
            avgLikes: 0,
            avgComments: 0,
            avgShares: 0,
            totalPosts: 0,
          });
        }

        const pattern = patterns.get(key)!;
        pattern.avgLikes = (pattern.avgLikes * pattern.totalPosts + likes) / (pattern.totalPosts + 1);
        pattern.avgComments = (pattern.avgComments * pattern.totalPosts + comments) / (pattern.totalPosts + 1);
        pattern.avgShares = (pattern.avgShares * pattern.totalPosts + shares) / (pattern.totalPosts + 1);
        pattern.totalPosts++;
      });

      return Array.from(patterns.values())
        .filter(p => p.totalPosts >= 2)
        .sort((a, b) => {
          const scoreA = a.avgLikes + a.avgComments * 2 + a.avgShares * 3;
          const scoreB = b.avgLikes + b.avgComments * 2 + b.avgShares * 3;
          return scoreB - scoreA;
        });
    } catch (error) {
      console.error('[PostingTimeOptimizer] Failed to analyze user patterns:', error);
      return [];
    }
  }

  private getPlatformPeakTimes(platform: string): { start: string; end: string; score: number }[] {
    const normalizedPlatform = platform.toLowerCase();
    return PostingTimeOptimizer.PLATFORM_PEAK_TIMES[normalizedPlatform as keyof typeof PostingTimeOptimizer.PLATFORM_PEAK_TIMES] || [];
  }

  private calculateOptimalTime(options: {
    userPatterns: EngagementPattern[];
    platformPeaks: { start: string; end: string; score: number }[];
    timezone: string;
    eventDate?: Date;
    contentType?: string;
  }): Date {
    const { userPatterns, platformPeaks, timezone, eventDate } = options;

    if (eventDate) {
      const eventTime = new Date(eventDate);
      const oneDayBefore = new Date(eventTime);
      oneDayBefore.setDate(eventTime.getDate() - 1);
      oneDayBefore.setHours(18, 0, 0, 0);
      return oneDayBefore;
    }

    if (userPatterns.length > 0) {
      const bestPattern = userPatterns[0];
      const nextDate = this.getNextDateForDayOfWeek(bestPattern.dayOfWeek);
      nextDate.setHours(bestPattern.hour, 0, 0, 0);
      return nextDate;
    }

    if (platformPeaks.length > 0) {
      const bestPeak = platformPeaks.reduce((a, b) => a.score > b.score ? a : b);
      const [hour] = bestPeak.start.split(':').map(Number);
      const nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + 1);
      nextDate.setHours(hour, 0, 0, 0);
      return nextDate;
    }

    const defaultTime = new Date();
    defaultTime.setDate(defaultTime.getDate() + 1);
    defaultTime.setHours(10, 0, 0, 0);
    return defaultTime;
  }

  private generateAlternativeTimes(
    primaryTime: Date,
    platformPeaks: { start: string; end: string; score: number }[],
    count: number
  ): Date[] {
    const alternatives: Date[] = [];
    
    for (const peak of platformPeaks.slice(0, count)) {
      const [hour, minute] = peak.start.split(':').map(Number);
      const altTime = new Date(primaryTime);
      altTime.setHours(hour, minute || 0, 0, 0);
      
      if (Math.abs(altTime.getTime() - primaryTime.getTime()) > 3600000) {
        alternatives.push(altTime);
      }
    }

    while (alternatives.length < count) {
      const offset = (alternatives.length + 1) * 3;
      const altTime = new Date(primaryTime);
      altTime.setHours(altTime.getHours() + offset);
      alternatives.push(altTime);
    }

    return alternatives.slice(0, count);
  }

  private calculateConfidence(
    userPatterns: EngagementPattern[],
    platformPeaks: { start: string; end: string; score: number }[]
  ): number {
    let confidence = 0.5;

    if (userPatterns.length >= 10) {
      confidence += 0.3;
    } else if (userPatterns.length >= 5) {
      confidence += 0.2;
    } else if (userPatterns.length > 0) {
      confidence += 0.1;
    }

    if (platformPeaks.length > 0) {
      confidence += 0.2;
    }

    return Math.min(confidence, 0.95);
  }

  private generateReasoning(options: {
    hasUserData: boolean;
    platform: string;
    recommendedTime: Date;
    eventDate?: Date;
  }): string {
    const { hasUserData, platform, recommendedTime, eventDate } = options;
    const dayOfWeek = recommendedTime.toLocaleDateString('en-US', { weekday: 'long' });
    const timeStr = recommendedTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    if (eventDate) {
      return `Recommended time is 1 day before your event to maximize pre-event engagement and visibility.`;
    }

    if (hasUserData) {
      return `Based on your historical ${platform} engagement data, ${dayOfWeek} at ${timeStr} is when your audience is most active and responsive.`;
    }

    return `Based on ${platform} platform trends, ${dayOfWeek} at ${timeStr} is during peak engagement hours when users are most active.`;
  }

  private getNextDateForDayOfWeek(targetDay: number): Date {
    const today = new Date();
    const currentDay = today.getDay();
    const daysUntilTarget = (targetDay - currentDay + 7) % 7 || 7;
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + daysUntilTarget);
    return targetDate;
  }

  async getBatchOptimalTimes(
    userId: number,
    platforms: string[],
    postCount: number = 7
  ): Promise<Map<string, OptimalTimingResult[]>> {
    const results = new Map<string, OptimalTimingResult[]>();

    for (const platform of platforms) {
      const platformResults: OptimalTimingResult[] = [];
      
      for (let i = 0; i < postCount; i++) {
        const result = await this.optimizePostingTime({
          userId,
          platform,
        });
        
        result.recommendedTime.setDate(result.recommendedTime.getDate() + i);
        platformResults.push(result);
      }
      
      results.set(platform, platformResults);
    }

    return results;
  }
}

export const postingTimeOptimizer = new PostingTimeOptimizer();
