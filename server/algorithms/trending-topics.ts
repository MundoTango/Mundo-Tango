/**
 * A8: TRENDING TOPICS DETECTION ALGORITHM
 * Identifies trending hashtags and topics based on velocity and engagement
 */

interface TopicMetrics {
  topic: string;
  mentions: number;
  velocity: number; // mentions per hour
  engagement: number;
  participants: number;
}

interface TrendingTopic {
  topic: string;
  score: number;
  metrics: TopicMetrics;
  trend: 'rising' | 'stable' | 'declining';
}

export class TrendingTopicsAlgorithm {
  private topicHistory: Map<string, TopicMetrics[]> = new Map();

  async detectTrendingTopics(
    recentPosts: any[],
    timeWindowHours: number = 24
  ): Promise<TrendingTopic[]> {
    const topics = this.extractTopics(recentPosts);
    const metrics = this.calculateMetrics(topics, recentPosts, timeWindowHours);
    const trending = this.scoreTrending(metrics);

    return trending
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  }

  private extractTopics(posts: any[]): Map<string, any[]> {
    const topicMap = new Map<string, any[]>();

    posts.forEach(post => {
      const hashtags = this.extractHashtags(post.content || '');
      
      hashtags.forEach(tag => {
        if (!topicMap.has(tag)) {
          topicMap.set(tag, []);
        }
        topicMap.get(tag)!.push(post);
      });
    });

    return topicMap;
  }

  private extractHashtags(content: string): string[] {
    const hashtagPattern = /#[\w]+/g;
    const matches = content.match(hashtagPattern) || [];
    return matches.map(tag => tag.toLowerCase());
  }

  private calculateMetrics(
    topics: Map<string, any[]>,
    allPosts: any[],
    timeWindowHours: number
  ): Map<string, TopicMetrics> {
    const metrics = new Map<string, TopicMetrics>();
    const now = Date.now();
    const windowMs = timeWindowHours * 60 * 60 * 1000;

    topics.forEach((posts, topic) => {
      const recentPosts = posts.filter(p => 
        now - new Date(p.createdAt).getTime() < windowMs
      );

      const uniqueUsers = new Set(recentPosts.map(p => p.userId));
      const totalEngagement = recentPosts.reduce((sum, p) => 
        sum + (p.likes || 0) + (p.comments || 0) + (p.shares || 0), 0
      );

      const velocity = recentPosts.length / timeWindowHours;

      metrics.set(topic, {
        topic,
        mentions: recentPosts.length,
        velocity,
        engagement: totalEngagement,
        participants: uniqueUsers.size,
      });
    });

    return metrics;
  }

  private scoreTrending(metrics: Map<string, TopicMetrics>): TrendingTopic[] {
    const trending: TrendingTopic[] = [];

    metrics.forEach((current, topic) => {
      const previous = this.getHistoricalMetrics(topic);
      const trend = this.detectTrend(current, previous);
      
      const score = this.calculateTrendScore(current, trend);

      trending.push({
        topic,
        score,
        metrics: current,
        trend,
      });

      // Update history
      this.updateHistory(topic, current);
    });

    return trending;
  }

  private calculateTrendScore(metrics: TopicMetrics, trend: 'rising' | 'stable' | 'declining'): number {
    let score = 0;

    // Velocity score (40%)
    score += Math.min(metrics.velocity / 10, 1) * 0.4;

    // Engagement score (30%)
    score += Math.min(metrics.engagement / 100, 1) * 0.3;

    // Participants score (20%)
    score += Math.min(metrics.participants / 50, 1) * 0.2;

    // Trend bonus (10%)
    if (trend === 'rising') {
      score += 0.1;
    } else if (trend === 'declining') {
      score *= 0.5;
    }

    return score;
  }

  private getHistoricalMetrics(topic: string): TopicMetrics | null {
    const history = this.topicHistory.get(topic);
    return history && history.length > 0 ? history[history.length - 1] : null;
  }

  private detectTrend(current: TopicMetrics, previous: TopicMetrics | null): 'rising' | 'stable' | 'declining' {
    if (!previous) return 'rising';

    const velocityChange = (current.velocity - previous.velocity) / previous.velocity;

    if (velocityChange > 0.5) return 'rising';
    if (velocityChange < -0.3) return 'declining';
    return 'stable';
  }

  private updateHistory(topic: string, metrics: TopicMetrics): void {
    if (!this.topicHistory.has(topic)) {
      this.topicHistory.set(topic, []);
    }

    const history = this.topicHistory.get(topic)!;
    history.push(metrics);

    // Keep only last 10 data points
    if (history.length > 10) {
      history.shift();
    }
  }
}

export const trendingTopics = new TrendingTopicsAlgorithm();
