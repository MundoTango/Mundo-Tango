/**
 * A30: INFLUENCER DETECTION ALGORITHM
 * Identifies influential users in the community
 */

interface InfluencerMetrics {
  followersCount: number;
  engagementRate: number;
  contentQuality: number;
  postFrequency: number;
  reach: number;
  viralPosts: number;
}

interface InfluencerScore {
  userId: number;
  score: number;
  tier: 'mega' | 'macro' | 'micro' | 'nano' | 'regular';
  strengths: string[];
  opportunities: string[];
}

export class InfluencerDetectionAlgorithm {
  async detectInfluencers(users: any[], posts: any[]): Promise<InfluencerScore[]> {
    return users
      .map(user => this.scoreInfluencer(user, posts.filter(p => p.userId === user.id)))
      .filter(score => score.score > 30)
      .sort((a, b) => b.score - a.score);
  }

  private scoreInfluencer(user: any, userPosts: any[]): InfluencerScore {
    const metrics = this.calculateMetrics(user, userPosts);
    const score = this.calculateInfluenceScore(metrics);
    const tier = this.classifyTier(metrics.followersCount, score);
    const strengths = this.identifyStrengths(metrics);
    const opportunities = this.identifyOpportunities(metrics);

    return {
      userId: user.id,
      score,
      tier,
      strengths,
      opportunities,
    };
  }

  private calculateMetrics(user: any, posts: any[]): InfluencerMetrics {
    const totalEngagement = posts.reduce((sum, p) => 
      sum + (p.likes || 0) + (p.comments || 0) + (p.shares || 0), 0
    );

    const engagementRate = posts.length > 0 
      ? totalEngagement / (posts.length * Math.max(user.followersCount, 1))
      : 0;

    const viralPosts = posts.filter(p => 
      (p.likes || 0) + (p.shares || 0) > 100
    ).length;

    return {
      followersCount: user.followersCount || 0,
      engagementRate,
      contentQuality: this.assessContentQuality(posts),
      postFrequency: posts.length / 30, // posts per day (assuming 30-day window)
      reach: user.followersCount * 0.3, // 30% average reach
      viralPosts,
    };
  }

  private calculateInfluenceScore(metrics: InfluencerMetrics): number {
    return (
      Math.min(metrics.followersCount / 1000, 30) * 0.3 +
      metrics.engagementRate * 100 * 0.25 +
      metrics.contentQuality * 0.2 +
      Math.min(metrics.postFrequency * 10, 15) * 0.15 +
      Math.min(metrics.viralPosts * 2, 10) * 0.1
    );
  }

  private assessContentQuality(posts: any[]): number {
    if (posts.length === 0) return 0;

    const withMedia = posts.filter(p => p.imageUrl || p.videoUrl).length;
    const avgLength = posts.reduce((sum, p) => sum + (p.content?.length || 0), 0) / posts.length;
    
    return (
      (withMedia / posts.length) * 0.5 +
      Math.min(avgLength / 500, 1) * 0.5
    );
  }

  private classifyTier(followers: number, score: number): InfluencerScore['tier'] {
    if (followers > 100000 || score > 80) return 'mega';
    if (followers > 10000 || score > 60) return 'macro';
    if (followers > 1000 || score > 40) return 'micro';
    if (followers > 100 || score > 30) return 'nano';
    return 'regular';
  }

  private identifyStrengths(metrics: InfluencerMetrics): string[] {
    const strengths: string[] = [];

    if (metrics.engagementRate > 0.05) strengths.push("High engagement rate");
    if (metrics.contentQuality > 0.7) strengths.push("Quality content");
    if (metrics.viralPosts > 3) strengths.push("Creates viral content");
    if (metrics.postFrequency > 1) strengths.push("Consistent posting");

    return strengths;
  }

  private identifyOpportunities(metrics: InfluencerMetrics): string[] {
    const opps: string[] = [];

    if (metrics.contentQuality < 0.5) opps.push("Improve content quality with media");
    if (metrics.postFrequency < 0.5) opps.push("Post more consistently");
    if (metrics.engagementRate < 0.03) opps.push("Increase audience engagement");

    return opps;
  }
}

export const influencerDetection = new InfluencerDetectionAlgorithm();
