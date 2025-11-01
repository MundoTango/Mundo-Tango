/**
 * A10: ENGAGEMENT PREDICTION ALGORITHM
 * Predicts potential engagement for posts before publishing
 */

interface PostFeatures {
  content: string;
  hasImage: boolean;
  hasVideo: boolean;
  hashtags: number;
  mentions: number;
  length: number;
  timeOfDay: number;
  dayOfWeek: number;
}

interface EngagementPrediction {
  predictedLikes: number;
  predictedComments: number;
  predictedShares: number;
  predictedReach: number;
  confidence: number;
  recommendations: string[];
}

export class EngagementPredictionAlgorithm {
  async predictEngagement(
    post: PostFeatures,
    userHistory: any[]
  ): Promise<EngagementPrediction> {
    const baselineMetrics = this.calculateBaseline(userHistory);
    const featureBoost = this.calculateFeatureBoost(post);
    const timingBoost = this.calculateTimingBoost(post.timeOfDay, post.dayOfWeek);

    const multiplier = featureBoost * timingBoost;

    return {
      predictedLikes: Math.round(baselineMetrics.avgLikes * multiplier),
      predictedComments: Math.round(baselineMetrics.avgComments * multiplier),
      predictedShares: Math.round(baselineMetrics.avgShares * multiplier),
      predictedReach: Math.round(baselineMetrics.avgReach * multiplier),
      confidence: this.calculateConfidence(userHistory.length),
      recommendations: this.generateRecommendations(post, multiplier),
    };
  }

  private calculateBaseline(userHistory: any[]): any {
    if (userHistory.length === 0) {
      return {
        avgLikes: 10,
        avgComments: 2,
        avgShares: 1,
        avgReach: 50,
      };
    }

    const recent = userHistory.slice(-20);

    return {
      avgLikes: this.average(recent.map(p => p.likes || 0)),
      avgComments: this.average(recent.map(p => p.comments || 0)),
      avgShares: this.average(recent.map(p => p.shares || 0)),
      avgReach: this.average(recent.map(p => p.reach || 0)),
    };
  }

  private calculateFeatureBoost(post: PostFeatures): number {
    let boost = 1.0;

    // Media boost
    if (post.hasImage) boost *= 1.5;
    if (post.hasVideo) boost *= 2.0;

    // Hashtag boost (optimal 3-5)
    if (post.hashtags >= 3 && post.hashtags <= 5) {
      boost *= 1.3;
    } else if (post.hashtags > 5) {
      boost *= 0.9; // Too many hashtags reduces engagement
    }

    // Mentions boost
    if (post.mentions > 0) {
      boost *= (1 + (post.mentions * 0.1)); // 10% boost per mention
    }

    // Length boost (optimal 100-300 chars)
    if (post.length >= 100 && post.length <= 300) {
      boost *= 1.2;
    } else if (post.length > 500) {
      boost *= 0.8; // Very long posts get less engagement
    }

    return boost;
  }

  private calculateTimingBoost(hour: number, dayOfWeek: number): number {
    let boost = 1.0;

    // Best posting hours (12-2pm, 7-9pm)
    if ((hour >= 12 && hour <= 14) || (hour >= 19 && hour <= 21)) {
      boost *= 1.4;
    } else if (hour >= 2 && hour <= 6) {
      boost *= 0.5; // Late night/early morning penalty
    }

    // Weekday vs weekend
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      boost *= 1.2; // Weekend bonus
    }

    return boost;
  }

  private calculateConfidence(historyLength: number): number {
    if (historyLength === 0) return 0.3;
    if (historyLength < 10) return 0.5;
    if (historyLength < 50) return 0.7;
    return 0.9;
  }

  private generateRecommendations(post: PostFeatures, multiplier: number): string[] {
    const recommendations: string[] = [];

    if (!post.hasImage && !post.hasVideo) {
      recommendations.push("Add an image or video to increase engagement by 50-100%");
    }

    if (post.hashtags === 0) {
      recommendations.push("Add 3-5 relevant hashtags to improve discoverability");
    } else if (post.hashtags > 5) {
      recommendations.push("Reduce hashtags to 3-5 for optimal engagement");
    }

    if (post.length < 50) {
      recommendations.push("Add more context (aim for 100-300 characters)");
    } else if (post.length > 500) {
      recommendations.push("Consider shortening your post for better engagement");
    }

    const hour = post.timeOfDay;
    if (hour >= 2 && hour <= 6) {
      recommendations.push("Consider posting during peak hours (12-2pm or 7-9pm)");
    }

    if (multiplier < 1.0) {
      recommendations.push("Current post may underperform. Consider the recommendations above.");
    } else if (multiplier > 1.5) {
      recommendations.push("Great! This post is optimized for high engagement.");
    }

    return recommendations;
  }

  private average(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    return numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
  }
}

export const engagementPrediction = new EngagementPredictionAlgorithm();
