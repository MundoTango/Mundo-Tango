/**
 * A12: COMMUNITY GROWTH DETECTION ALGORITHM
 * Tracks and predicts community growth patterns
 */

interface GrowthMetrics {
  newMembers: number;
  activeMembers: number;
  engagementRate: number;
  retentionRate: number;
  growthRate: number;
}

interface GrowthPrediction {
  trend: 'accelerating' | 'growing' | 'stable' | 'declining';
  predictedMembers: number;
  healthScore: number;
  recommendations: string[];
}

export class CommunityGrowthAlgorithm {
  async analyzeGrowth(
    communityId: number,
    currentMetrics: GrowthMetrics,
    historicalData: GrowthMetrics[]
  ): Promise<GrowthPrediction> {
    const trend = this.detectTrend(currentMetrics, historicalData);
    const predicted = this.predictFutureGrowth(historicalData);
    const health = this.calculateHealthScore(currentMetrics);
    const recommendations = this.generateRecommendations(currentMetrics, trend);

    return {
      trend,
      predictedMembers: predicted,
      healthScore: health,
      recommendations,
    };
  }

  private detectTrend(current: GrowthMetrics, history: GrowthMetrics[]): GrowthPrediction['trend'] {
    if (history.length < 2) return 'stable';

    const recent = history.slice(-3);
    const growthRates = recent.map(m => m.growthRate);
    const avgGrowth = growthRates.reduce((sum, r) => sum + r, 0) / growthRates.length;

    if (current.growthRate > avgGrowth * 1.5) return 'accelerating';
    if (current.growthRate > 0.05) return 'growing';
    if (current.growthRate > -0.05) return 'stable';
    return 'declining';
  }

  private predictFutureGrowth(history: GrowthMetrics[]): number {
    if (history.length === 0) return 0;

    const recent = history.slice(-6);
    const avgGrowthRate = recent.reduce((sum, m) => sum + m.growthRate, 0) / recent.length;
    const currentMembers = history[history.length - 1].activeMembers;

    return Math.round(currentMembers * (1 + avgGrowthRate));
  }

  private calculateHealthScore(metrics: GrowthMetrics): number {
    return (
      (metrics.engagementRate * 0.4) +
      (metrics.retentionRate * 0.3) +
      (Math.min(metrics.growthRate * 10, 1) * 0.2) +
      (Math.min(metrics.activeMembers / 100, 1) * 0.1)
    );
  }

  private generateRecommendations(metrics: GrowthMetrics, trend: string): string[] {
    const recs: string[] = [];

    if (metrics.engagementRate < 0.3) {
      recs.push("Increase engagement with weekly challenges or featured content");
    }

    if (metrics.retentionRate < 0.6) {
      recs.push("Focus on new member onboarding and mentorship programs");
    }

    if (trend === 'declining') {
      recs.push("Launch a re-engagement campaign for inactive members");
    }

    if (metrics.growthRate < 0.05 && trend !== 'accelerating') {
      recs.push("Promote community with local events and social media");
    }

    return recs;
  }
}

export const communityGrowth = new CommunityGrowthAlgorithm();
