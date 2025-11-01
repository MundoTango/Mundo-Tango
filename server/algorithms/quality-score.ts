/**
 * A24: QUALITY SCORE CALCULATION ALGORITHM
 * Calculates quality scores for posts, events, and users
 */

interface QualityScore {
  overall: number;
  components: {
    content: number;
    engagement: number;
    credibility: number;
    freshness: number;
  };
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
}

export class QualityScoreAlgorithm {
  async calculatePostQuality(post: any, author: any): Promise<QualityScore> {
    const content = this.scoreContent(post);
    const engagement = this.scoreEngagement(post);
    const credibility = this.scoreCredibility(author);
    const freshness = this.scoreFreshness(post);

    const overall = (
      content * 0.35 +
      engagement * 0.30 +
      credibility * 0.25 +
      freshness * 0.10
    );

    return {
      overall,
      components: { content, engagement, credibility, freshness },
      grade: this.assignGrade(overall),
    };
  }

  private scoreContent(post: any): number {
    let score = 0.5;

    // Length (optimal 100-500 chars)
    if (post.content.length >= 100 && post.content.length <= 500) {
      score += 0.2;
    }

    // Media presence
    if (post.imageUrl || post.videoUrl) {
      score += 0.2;
    }

    // Hashtags (optimal 3-5)
    const hashtags = (post.content.match(/#\w+/g) || []).length;
    if (hashtags >= 3 && hashtags <= 5) {
      score += 0.1;
    }

    return Math.min(score, 1);
  }

  private scoreEngagement(post: any): number {
    const likes = post.likes || 0;
    const comments = post.comments || 0;
    const shares = post.shares || 0;

    const engagement = (likes * 1) + (comments * 3) + (shares * 5);
    
    // Normalize to 0-1 (assuming max engagement of 500)
    return Math.min(engagement / 500, 1);
  }

  private scoreCredibility(author: any): number {
    let score = 0.3;

    // Verified status
    if (author.isVerified) score += 0.3;

    // Account age
    const accountAgeDays = (Date.now() - new Date(author.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    if (accountAgeDays > 365) score += 0.2;
    else if (accountAgeDays > 90) score += 0.1;

    // Follower count
    const followers = author.followersCount || 0;
    score += Math.min(followers / 1000, 0.2);

    return Math.min(score, 1);
  }

  private scoreFreshness(post: any): number {
    const hoursSincePost = (Date.now() - new Date(post.createdAt).getTime()) / (1000 * 60 * 60);

    if (hoursSincePost < 1) return 1.0;
    if (hoursSincePost < 6) return 0.9;
    if (hoursSincePost < 24) return 0.7;
    if (hoursSincePost < 72) return 0.5;
    if (hoursSincePost < 168) return 0.3;
    return 0.1;
  }

  private assignGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
    if (score >= 0.9) return 'A';
    if (score >= 0.7) return 'B';
    if (score >= 0.5) return 'C';
    if (score >= 0.3) return 'D';
    return 'F';
  }
}

export const qualityScore = new QualityScoreAlgorithm();
