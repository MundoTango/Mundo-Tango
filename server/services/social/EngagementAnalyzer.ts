import { storage } from '../../storage';
import { RateLimitedAIOrchestrator } from '../ai/integration/rate-limited-orchestrator';

export interface EngagementMetrics {
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  totalClicks: number;
  totalReach: number;
  totalImpressions: number;
  engagementRate: number;
  averageEngagement: number;
}

export interface ContentPerformance {
  topPosts: Array<{
    postId: number;
    content: string;
    engagement: number;
    engagementRate: number;
    platform: string;
    publishedAt: Date;
  }>;
  contentTypeBreakdown: Record<string, {
    count: number;
    avgEngagement: number;
  }>;
  bestPerformingHashtags: Array<{
    hashtag: string;
    usage: number;
    avgEngagement: number;
    trendScore: number;
  }>;
  platformPerformance: Record<string, {
    totalPosts: number;
    avgEngagement: number;
    engagementRate: number;
    bestTime: string;
  }>;
}

export interface TrendAnalysis {
  viralPosts: Array<{
    postId: number;
    content: string;
    viralityScore: number;
    growthRate: number;
  }>;
  emergingHashtags: string[];
  competitorInsights?: {
    benchmarkEngagement: number;
    yourPerformance: number;
    gap: number;
  };
  recommendations: string[];
}

export interface AudienceInsights {
  demographics?: {
    ageGroups: Record<string, number>;
    locations: Record<string, number>;
    interests: string[];
  };
  behaviorPatterns: {
    mostActiveHours: number[];
    mostActiveDays: number[];
    preferredContentTypes: string[];
  };
  growthMetrics: {
    followerGrowth: number;
    engagementGrowth: number;
    reachGrowth: number;
  };
}

export class EngagementAnalyzer {
  private orchestrator: RateLimitedAIOrchestrator;

  constructor() {
    this.orchestrator = new RateLimitedAIOrchestrator();
  }

  async analyzeEngagement(userId: number, dateRange?: { start: Date; end: Date }): Promise<EngagementMetrics> {
    const posts = await this.getPostsInRange(userId, dateRange);

    let totalLikes = 0;
    let totalComments = 0;
    let totalShares = 0;
    let totalClicks = 0;
    let totalReach = 0;
    let totalImpressions = 0;

    posts.forEach(post => {
      const engagement = post.engagement as any;
      if (engagement) {
        totalLikes += engagement.likes || 0;
        totalComments += engagement.comments || 0;
        totalShares += engagement.shares || 0;
        totalClicks += engagement.clicks || 0;
        totalReach += engagement.reach || 0;
        totalImpressions += engagement.impressions || 0;
      }
    });

    const engagementRate = totalImpressions > 0
      ? ((totalLikes + totalComments + totalShares) / totalImpressions) * 100
      : 0;

    const averageEngagement = posts.length > 0
      ? (totalLikes + totalComments + totalShares) / posts.length
      : 0;

    return {
      totalLikes,
      totalComments,
      totalShares,
      totalClicks,
      totalReach,
      totalImpressions,
      engagementRate,
      averageEngagement,
    };
  }

  async analyzeContentPerformance(userId: number, limit: number = 30): Promise<ContentPerformance> {
    const posts = await this.getPostsInRange(userId);

    const postsWithScores = posts
      .filter(p => p.engagement && p.publishedAt)
      .map(post => {
        const engagement = post.engagement as any;
        const score = (engagement.likes || 0) + 
                     (engagement.comments || 0) * 2 + 
                     (engagement.shares || 0) * 3;
        const reach = engagement.reach || 1;
        const engagementRate = (score / reach) * 100;

        return {
          postId: post.id,
          content: post.content.substring(0, 100),
          engagement: score,
          engagementRate,
          platform: (post.platforms || [])[0] || 'unknown',
          publishedAt: new Date(post.publishedAt!),
        };
      })
      .sort((a, b) => b.engagement - a.engagement)
      .slice(0, limit);

    const hashtags = this.extractHashtags(posts);
    const bestPerformingHashtags = this.analyzeHashtagPerformance(hashtags, posts);

    const contentTypeBreakdown = this.analyzeContentTypes(posts);
    const platformPerformance = this.analyzePlatformPerformance(posts);

    return {
      topPosts: postsWithScores,
      contentTypeBreakdown,
      bestPerformingHashtags,
      platformPerformance,
    };
  }

  async detectTrends(userId: number): Promise<TrendAnalysis> {
    const posts = await this.getPostsInRange(userId, {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      end: new Date(),
    });

    const viralPosts = this.detectViralContent(posts);
    const emergingHashtags = await this.detectEmergingHashtags(posts);
    const recommendations = await this.generateRecommendations(userId, posts);

    return {
      viralPosts,
      emergingHashtags,
      recommendations,
    };
  }

  async getAudienceInsights(userId: number): Promise<AudienceInsights> {
    const posts = await this.getPostsInRange(userId);

    const behaviorPatterns = this.analyzeBehaviorPatterns(posts);
    const growthMetrics = await this.calculateGrowthMetrics(userId);

    return {
      behaviorPatterns,
      growthMetrics,
    };
  }

  private async getPostsInRange(userId: number, dateRange?: { start: Date; end: Date }) {
    const allPosts = await storage.getSocialPosts(userId);
    
    if (!dateRange) {
      return allPosts.filter(p => p.publishedAt);
    }

    return allPosts.filter(p => {
      if (!p.publishedAt) return false;
      const publishedAt = new Date(p.publishedAt);
      return publishedAt >= dateRange.start && publishedAt <= dateRange.end;
    });
  }

  private extractHashtags(posts: any[]): Map<string, number[]> {
    const hashtagMap = new Map<string, number[]>();

    posts.forEach(post => {
      const hashtags = post.content.match(/#\w+/g) || [];
      const engagement = post.engagement as any;
      const score = engagement ? (engagement.likes || 0) + (engagement.comments || 0) * 2 + (engagement.shares || 0) * 3 : 0;

      hashtags.forEach((tag: string) => {
        const normalized = tag.toLowerCase();
        if (!hashtagMap.has(normalized)) {
          hashtagMap.set(normalized, []);
        }
        hashtagMap.get(normalized)!.push(score);
      });
    });

    return hashtagMap;
  }

  private analyzeHashtagPerformance(
    hashtags: Map<string, number[]>,
    posts: any[]
  ): Array<{ hashtag: string; usage: number; avgEngagement: number; trendScore: number }> {
    const results: Array<{ hashtag: string; usage: number; avgEngagement: number; trendScore: number }> = [];

    hashtags.forEach((scores, hashtag) => {
      const usage = scores.length;
      const avgEngagement = scores.reduce((sum, score) => sum + score, 0) / usage;
      const trendScore = usage * avgEngagement;

      results.push({
        hashtag,
        usage,
        avgEngagement,
        trendScore,
      });
    });

    return results.sort((a, b) => b.trendScore - a.trendScore).slice(0, 20);
  }

  private analyzeContentTypes(posts: any[]): Record<string, { count: number; avgEngagement: number }> {
    const types: Record<string, { total: number; count: number }> = {};

    posts.forEach(post => {
      const hasImage = post.mediaUrls && post.mediaUrls.length > 0;
      const hasVideo = post.content.includes('video') || post.content.includes('watch');
      const type = hasVideo ? 'video' : hasImage ? 'image' : 'text';

      if (!types[type]) {
        types[type] = { total: 0, count: 0 };
      }

      const engagement = post.engagement as any;
      const score = engagement ? (engagement.likes || 0) + (engagement.comments || 0) * 2 + (engagement.shares || 0) * 3 : 0;

      types[type].total += score;
      types[type].count++;
    });

    const result: Record<string, { count: number; avgEngagement: number }> = {};
    Object.keys(types).forEach(type => {
      result[type] = {
        count: types[type].count,
        avgEngagement: types[type].count > 0 ? types[type].total / types[type].count : 0,
      };
    });

    return result;
  }

  private analyzePlatformPerformance(posts: any[]): Record<string, { totalPosts: number; avgEngagement: number; engagementRate: number; bestTime: string }> {
    const platforms: Record<string, { totalEngagement: number; totalPosts: number; hours: Map<number, number> }> = {};

    posts.forEach(post => {
      (post.platforms || []).forEach((platform: string) => {
        if (!platforms[platform]) {
          platforms[platform] = { totalEngagement: 0, totalPosts: 0, hours: new Map() };
        }

        const engagement = post.engagement as any;
        const score = engagement ? (engagement.likes || 0) + (engagement.comments || 0) * 2 + (engagement.shares || 0) * 3 : 0;

        platforms[platform].totalEngagement += score;
        platforms[platform].totalPosts++;

        if (post.publishedAt) {
          const hour = new Date(post.publishedAt).getHours();
          const currentCount = platforms[platform].hours.get(hour) || 0;
          platforms[platform].hours.set(hour, currentCount + score);
        }
      });
    });

    const result: Record<string, { totalPosts: number; avgEngagement: number; engagementRate: number; bestTime: string }> = {};
    
    Object.keys(platforms).forEach(platform => {
      const data = platforms[platform];
      const avgEngagement = data.totalPosts > 0 ? data.totalEngagement / data.totalPosts : 0;

      let bestHour = 0;
      let bestScore = 0;
      data.hours.forEach((score, hour) => {
        if (score > bestScore) {
          bestScore = score;
          bestHour = hour;
        }
      });

      result[platform] = {
        totalPosts: data.totalPosts,
        avgEngagement,
        engagementRate: avgEngagement > 0 ? (avgEngagement / 100) * 100 : 0,
        bestTime: `${bestHour}:00`,
      };
    });

    return result;
  }

  private detectViralContent(posts: any[]): Array<{ postId: number; content: string; viralityScore: number; growthRate: number }> {
    return posts
      .filter(p => p.engagement)
      .map(post => {
        const engagement = post.engagement as any;
        const score = (engagement.likes || 0) + (engagement.comments || 0) * 2 + (engagement.shares || 0) * 3;
        const reach = engagement.reach || 1;
        const viralityScore = (score / reach) * 100;
        const growthRate = engagement.shares ? (engagement.shares / reach) * 100 : 0;

        return {
          postId: post.id,
          content: post.content.substring(0, 100),
          viralityScore,
          growthRate,
        };
      })
      .filter(p => p.viralityScore > 10)
      .sort((a, b) => b.viralityScore - a.viralityScore)
      .slice(0, 10);
  }

  private async detectEmergingHashtags(posts: any[]): Promise<string[]> {
    const recentPosts = posts.filter(p => {
      if (!p.publishedAt) return false;
      const publishedAt = new Date(p.publishedAt);
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return publishedAt >= sevenDaysAgo;
    });

    const hashtags = this.extractHashtags(recentPosts);
    const trending: string[] = [];

    hashtags.forEach((scores, hashtag) => {
      if (scores.length >= 2) {
        const avgEngagement = scores.reduce((sum, score) => sum + score, 0) / scores.length;
        if (avgEngagement > 50) {
          trending.push(hashtag);
        }
      }
    });

    return trending.slice(0, 10);
  }

  private async generateRecommendations(userId: number, posts: any[]): Promise<string[]> {
    const performance = await this.analyzeContentPerformance(userId);
    const recommendations: string[] = [];

    if (performance.topPosts.length > 0) {
      const bestPlatform = Object.entries(performance.platformPerformance)
        .sort(([, a], [, b]) => b.avgEngagement - a.avgEngagement)[0];
      
      if (bestPlatform) {
        recommendations.push(`Focus more on ${bestPlatform[0]} - it's your best performing platform with ${bestPlatform[1].avgEngagement.toFixed(1)} avg engagement`);
      }
    }

    const bestContentType = Object.entries(performance.contentTypeBreakdown)
      .sort(([, a], [, b]) => b.avgEngagement - a.avgEngagement)[0];
    
    if (bestContentType) {
      recommendations.push(`${bestContentType[0]} content performs best - create more of this type`);
    }

    if (performance.bestPerformingHashtags.length > 0) {
      const topHashtag = performance.bestPerformingHashtags[0];
      recommendations.push(`Use ${topHashtag.hashtag} more often - it has high engagement (${topHashtag.avgEngagement.toFixed(1)} avg)`);
    }

    return recommendations;
  }

  private analyzeBehaviorPatterns(posts: any[]): {
    mostActiveHours: number[];
    mostActiveDays: number[];
    preferredContentTypes: string[];
  } {
    const hours: Map<number, number> = new Map();
    const days: Map<number, number> = new Map();
    const types: Map<string, number> = new Map();

    posts.forEach(post => {
      if (post.publishedAt) {
        const publishedAt = new Date(post.publishedAt);
        const hour = publishedAt.getHours();
        const day = publishedAt.getDay();

        hours.set(hour, (hours.get(hour) || 0) + 1);
        days.set(day, (days.get(day) || 0) + 1);
      }

      const hasImage = post.mediaUrls && post.mediaUrls.length > 0;
      const type = hasImage ? 'image' : 'text';
      types.set(type, (types.get(type) || 0) + 1);
    });

    const mostActiveHours = Array.from(hours.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([hour]) => hour);

    const mostActiveDays = Array.from(days.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([day]) => day);

    const preferredContentTypes = Array.from(types.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([type]) => type);

    return {
      mostActiveHours,
      mostActiveDays,
      preferredContentTypes,
    };
  }

  private async calculateGrowthMetrics(userId: number): Promise<{
    followerGrowth: number;
    engagementGrowth: number;
    reachGrowth: number;
  }> {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const recentMetrics = await this.analyzeEngagement(userId, { start: thirtyDaysAgo, end: now });
    const previousMetrics = await this.analyzeEngagement(userId, { start: sixtyDaysAgo, end: thirtyDaysAgo });

    const followerGrowth = 0;
    const engagementGrowth = previousMetrics.averageEngagement > 0
      ? ((recentMetrics.averageEngagement - previousMetrics.averageEngagement) / previousMetrics.averageEngagement) * 100
      : 0;
    const reachGrowth = previousMetrics.totalReach > 0
      ? ((recentMetrics.totalReach - previousMetrics.totalReach) / previousMetrics.totalReach) * 100
      : 0;

    return {
      followerGrowth,
      engagementGrowth,
      reachGrowth,
    };
  }
}

export const engagementAnalyzer = new EngagementAnalyzer();
