/**
 * A5: CONTENT RECOMMENDATION ALGORITHM
 * Recommends posts based on user interests, engagement history, and social graph
 */

interface UserProfile {
  id: number;
  interests: string[];
  recentEngagements: number[];
  followingIds: number[];
}

interface RecommendationScore {
  postId: number;
  score: number;
  reasons: string[];
}

export class ContentRecommendationAlgorithm {
  async recommendPosts(
    userId: number,
    userProfile: UserProfile,
    candidatePosts: any[],
    limit: number = 20
  ): Promise<RecommendationScore[]> {
    const scored = candidatePosts.map(post => ({
      postId: post.id,
      score: this.calculateRecommendationScore(post, userProfile),
      reasons: this.generateReasons(post, userProfile),
    }));

    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  private calculateRecommendationScore(post: any, profile: UserProfile): number {
    let score = 0;

    // Interest alignment (40%)
    score += this.calculateInterestScore(post, profile.interests) * 0.4;

    // Social proximity (30%)
    score += this.calculateSocialScore(post, profile.followingIds) * 0.3;

    // Engagement potential (20%)
    score += this.calculateEngagementScore(post) * 0.2;

    // Recency (10%)
    score += this.calculateRecencyScore(post) * 0.1;

    return score;
  }

  private calculateInterestScore(post: any, interests: string[]): number {
    if (!post.tags || !interests.length) return 0.3;

    const postTags = post.tags || [];
    const matches = postTags.filter((tag: string) =>
      interests.some(interest => tag.toLowerCase().includes(interest.toLowerCase()))
    );

    return Math.min(matches.length / interests.length, 1);
  }

  private calculateSocialScore(post: any, followingIds: number[]): number {
    if (followingIds.includes(post.userId)) return 1;
    
    // Check if post is from friend of friend (would need graph traversal in production)
    return 0.3;
  }

  private calculateEngagementScore(post: any): number {
    const likes = post.likes || 0;
    const comments = post.comments || 0;
    const shares = post.shares || 0;

    // Weighted engagement score
    const engagement = (likes * 1) + (comments * 2) + (shares * 3);
    
    // Normalize to 0-1 range (assuming max engagement of 1000)
    return Math.min(engagement / 1000, 1);
  }

  private calculateRecencyScore(post: any): number {
    const now = Date.now();
    const postTime = new Date(post.createdAt).getTime();
    const hoursSincePost = (now - postTime) / (1000 * 60 * 60);

    // Decay factor: newer posts score higher
    if (hoursSincePost < 1) return 1;
    if (hoursSincePost < 6) return 0.8;
    if (hoursSincePost < 24) return 0.5;
    if (hoursSincePost < 72) return 0.3;
    return 0.1;
  }

  private generateReasons(post: any, profile: UserProfile): string[] {
    const reasons: string[] = [];

    if (profile.followingIds.includes(post.userId)) {
      reasons.push("From someone you follow");
    }

    if (post.tags && profile.interests.some((i: string) => 
      post.tags.some((t: string) => t.toLowerCase().includes(i.toLowerCase()))
    )) {
      reasons.push("Matches your interests");
    }

    if ((post.likes || 0) > 50) {
      reasons.push("Popular with community");
    }

    const hoursSincePost = (Date.now() - new Date(post.createdAt).getTime()) / (1000 * 60 * 60);
    if (hoursSincePost < 6) {
      reasons.push("Recent activity");
    }

    return reasons;
  }
}

export const contentRecommendation = new ContentRecommendationAlgorithm();
