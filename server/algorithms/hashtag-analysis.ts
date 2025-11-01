/**
 * A9: HASHTAG ANALYSIS ALGORITHM
 * Analyzes hashtag performance and suggests optimal hashtags
 */

interface HashtagMetrics {
  hashtag: string;
  usage: number;
  avgEngagement: number;
  reach: number;
  trend: 'rising' | 'stable' | 'declining';
}

interface HashtagRecommendations {
  recommended: string[];
  reasoning: Map<string, string>;
  avoid: string[];
}

export class HashtagAnalysisAlgorithm {
  async analyzeHashtags(content: string, historicalData: any[]): Promise<HashtagRecommendations> {
    const currentHashtags = this.extractHashtags(content);
    const metrics = this.calculateHashtagMetrics(historicalData);
    const recommended = this.recommendHashtags(content, metrics);
    const avoid = this.identifyOverusedHashtags(currentHashtags, metrics);

    const reasoning = new Map<string, string>();
    recommended.forEach(tag => {
      const metric = metrics.find(m => m.hashtag === tag);
      if (metric) {
        reasoning.set(tag, `Avg engagement: ${metric.avgEngagement}, Trend: ${metric.trend}`);
      }
    });

    return { recommended, reasoning, avoid };
  }

  private extractHashtags(content: string): string[] {
    const hashtagPattern = /#[\w]+/g;
    const matches = content.match(hashtagPattern) || [];
    return matches.map(tag => tag.toLowerCase());
  }

  private calculateHashtagMetrics(data: any[]): HashtagMetrics[] {
    const tagMap = new Map<string, any[]>();

    data.forEach(item => {
      const tags = this.extractHashtags(item.content);
      tags.forEach(tag => {
        if (!tagMap.has(tag)) tagMap.set(tag, []);
        tagMap.get(tag)!.push(item);
      });
    });

    return Array.from(tagMap.entries()).map(([tag, items]) => ({
      hashtag: tag,
      usage: items.length,
      avgEngagement: items.reduce((sum, i) => sum + (i.likes || 0) + (i.comments || 0), 0) / items.length,
      reach: new Set(items.flatMap(i => i.viewers || [])).size,
      trend: 'stable' as const,
    }));
  }

  private recommendHashtags(content: string, metrics: HashtagMetrics[]): string[] {
    return metrics
      .filter(m => m.avgEngagement > 10)
      .sort((a, b) => b.avgEngagement - a.avgEngagement)
      .slice(0, 5)
      .map(m => m.hashtag);
  }

  private identifyOverusedHashtags(current: string[], metrics: HashtagMetrics[]): string[] {
    return current.filter(tag => {
      const metric = metrics.find(m => m.hashtag === tag);
      return metric && metric.avgEngagement < 5;
    });
  }
}

export const hashtagAnalysis = new HashtagAnalysisAlgorithm();
