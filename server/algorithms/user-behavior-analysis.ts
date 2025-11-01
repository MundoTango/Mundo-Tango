/**
 * A22: USER BEHAVIOR ANALYSIS ALGORITHM
 * Analyzes user behavior patterns for insights and personalization
 */

interface BehaviorProfile {
  activityLevel: 'very_active' | 'active' | 'moderate' | 'low';
  primaryInterests: string[];
  peakHours: number[];
  engagementStyle: 'creator' | 'curator' | 'consumer';
  socialConnectivity: number;
  retentionRisk: number;
}

export class UserBehaviorAnalysisAlgorithm {
  async analyzeUser(userId: number, history: any[]): Promise<BehaviorProfile> {
    const activityLevel = this.assessActivityLevel(history);
    const interests = this.extractInterests(history);
    const peakHours = this.identifyPeakHours(history);
    const engagementStyle = this.classifyEngagementStyle(history);
    const socialConnectivity = this.measureConnectivity(history);
    const retentionRisk = this.calculateRetentionRisk(history);

    return {
      activityLevel,
      primaryInterests: interests,
      peakHours,
      engagementStyle,
      socialConnectivity,
      retentionRisk,
    };
  }

  private assessActivityLevel(history: any[]): BehaviorProfile['activityLevel'] {
    const recentMonth = history.filter(h => 
      new Date(h.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    );

    if (recentMonth.length > 100) return 'very_active';
    if (recentMonth.length > 50) return 'active';
    if (recentMonth.length > 20) return 'moderate';
    return 'low';
  }

  private extractInterests(history: any[]): string[] {
    const tagCounts = new Map<string, number>();
    
    history.forEach(item => {
      if (item.tags) {
        item.tags.forEach((tag: string) => {
          tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
        });
      }
    });

    return Array.from(tagCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag]) => tag);
  }

  private identifyPeakHours(history: any[]): number[] {
    const hourCounts = new Array(24).fill(0);
    
    history.forEach(item => {
      const hour = new Date(item.createdAt).getHours();
      hourCounts[hour]++;
    });

    const maxCount = Math.max(...hourCounts);
    return hourCounts
      .map((count, hour) => ({ hour, count }))
      .filter(h => h.count > maxCount * 0.6)
      .map(h => h.hour);
  }

  private classifyEngagementStyle(history: any[]): BehaviorProfile['engagementStyle'] {
    const posts = history.filter(h => h.type === 'post').length;
    const shares = history.filter(h => h.type === 'share').length;
    const likes = history.filter(h => h.type === 'like').length;

    if (posts > shares && posts > likes) return 'creator';
    if (shares > posts && shares > likes) return 'curator';
    return 'consumer';
  }

  private measureConnectivity(history: any[]): number {
    const uniqueInteractions = new Set(history.map(h => h.targetUserId)).size;
    return Math.min(uniqueInteractions / 50, 1);
  }

  private calculateRetentionRisk(history: any[]): number {
    const lastActivity = history[history.length - 1];
    if (!lastActivity) return 1;

    const daysSinceActivity = (Date.now() - new Date(lastActivity.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysSinceActivity > 30) return 0.9;
    if (daysSinceActivity > 14) return 0.6;
    if (daysSinceActivity > 7) return 0.3;
    return 0.1;
  }
}

export const userBehaviorAnalysis = new UserBehaviorAnalysisAlgorithm();
