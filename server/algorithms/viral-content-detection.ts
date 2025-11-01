/**
 * A11: VIRAL CONTENT DETECTION ALGORITHM
 * Identifies content with viral potential based on early engagement signals
 */

interface ViralSignals {
  shareVelocity: number;
  commentVelocity: number;
  uniqueEngagers: number;
  crossCommunitySpread: number;
  earlyEngagement: number;
}

interface ViralPrediction {
  isViral: boolean;
  viralityScore: number;
  signals: ViralSignals;
  predictedReach: number;
  timeToViral: number; // hours
}

export class ViralContentDetectionAlgorithm {
  async detectViral(postId: number, engagementHistory: any[]): Promise<ViralPrediction> {
    const signals = this.calculateSignals(engagementHistory);
    const score = this.calculateViralityScore(signals);
    const isViral = score > 0.7;

    return {
      isViral,
      viralityScore: score,
      signals,
      predictedReach: this.predictReach(score, engagementHistory.length),
      timeToViral: this.estimateTimeToViral(signals),
    };
  }

  private calculateSignals(engagement: any[]): ViralSignals {
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);
    const recentEngagement = engagement.filter(e => 
      new Date(e.createdAt).getTime() > oneHourAgo
    );

    const shares = recentEngagement.filter(e => e.type === 'share');
    const comments = recentEngagement.filter(e => e.type === 'comment');
    const uniqueUsers = new Set(engagement.map(e => e.userId)).size;
    const communities = new Set(engagement.map(e => e.userCommunity)).size;

    return {
      shareVelocity: shares.length,
      commentVelocity: comments.length,
      uniqueEngagers: uniqueUsers,
      crossCommunitySpread: communities,
      earlyEngagement: engagement.length < 100 ? engagement.length / 10 : 10,
    };
  }

  private calculateViralityScore(signals: ViralSignals): number {
    return (
      Math.min(signals.shareVelocity / 20, 1) * 0.4 +
      Math.min(signals.commentVelocity / 30, 1) * 0.2 +
      Math.min(signals.uniqueEngagers / 50, 1) * 0.2 +
      Math.min(signals.crossCommunitySpread / 5, 1) * 0.15 +
      Math.min(signals.earlyEngagement / 10, 1) * 0.05
    );
  }

  private predictReach(score: number, currentEngagement: number): number {
    const baseMultiplier = score > 0.8 ? 100 : score > 0.6 ? 50 : 20;
    return Math.round(currentEngagement * baseMultiplier);
  }

  private estimateTimeToViral(signals: ViralSignals): number {
    if (signals.shareVelocity > 15) return 2;
    if (signals.shareVelocity > 10) return 4;
    if (signals.shareVelocity > 5) return 8;
    return 24;
  }
}

export const viralContentDetection = new ViralContentDetectionAlgorithm();
