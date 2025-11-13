import { RateLimitedAIOrchestrator } from '../ai/integration/rate-limited-orchestrator';
import { storage } from '../../storage';
import { engagementAnalyzer } from './EngagementAnalyzer';

export interface CampaignStrategy {
  objective: string;
  targetAudience: {
    demographics: string[];
    interests: string[];
    behaviors: string[];
  };
  contentPillars: string[];
  postingSchedule: {
    frequency: string;
    bestTimes: string[];
    platforms: string[];
  };
  kpis: {
    metric: string;
    target: number;
    current?: number;
  }[];
  budget?: {
    total: number;
    platformAllocation: Record<string, number>;
  };
  timeline: {
    startDate: Date;
    endDate: Date;
    milestones: Array<{
      date: Date;
      goal: string;
    }>;
  };
}

export interface ABTestRecommendation {
  testName: string;
  hypothesis: string;
  variants: Array<{
    name: string;
    description: string;
    implementation: string;
  }>;
  successMetric: string;
  sampleSize: number;
  duration: string;
  expectedImpact: string;
}

export interface CrisisAlert {
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: 'negative_sentiment' | 'engagement_drop' | 'competitor_surge' | 'brand_mention';
  description: string;
  affectedPlatforms: string[];
  detectedAt: Date;
  recommendedActions: string[];
  relatedPosts?: number[];
}

export interface GrowthOpportunity {
  type: 'content_gap' | 'platform_expansion' | 'collaboration' | 'trending_topic' | 'audience_segment';
  title: string;
  description: string;
  potentialReach: number;
  effort: 'low' | 'medium' | 'high';
  priority: number;
  actionItems: string[];
}

export interface ROIAnalysis {
  totalInvestment: number;
  revenue: number;
  roi: number;
  roiPercentage: number;
  platformBreakdown: Record<string, {
    investment: number;
    revenue: number;
    roi: number;
  }>;
  recommendations: string[];
}

export class MarketingAssistant {
  private orchestrator: RateLimitedAIOrchestrator;

  constructor() {
    this.orchestrator = new RateLimitedAIOrchestrator();
  }

  async generateCampaignStrategy(
    userId: number,
    objective: string,
    platforms: string[],
    budget?: number,
    duration?: number
  ): Promise<CampaignStrategy> {
    const userPerformance = await engagementAnalyzer.analyzeContentPerformance(userId);
    const audienceInsights = await engagementAnalyzer.getAudienceInsights(userId);

    const prompt = `Generate a comprehensive social media campaign strategy for:
    
    OBJECTIVE: ${objective}
    PLATFORMS: ${platforms.join(', ')}
    ${budget ? `BUDGET: $${budget}` : ''}
    ${duration ? `DURATION: ${duration} days` : ''}
    
    CURRENT PERFORMANCE:
    - Top performing content types: ${Object.keys(userPerformance.contentTypeBreakdown).join(', ')}
    - Best platform: ${Object.keys(userPerformance.platformPerformance)[0] || 'unknown'}
    - Best posting times: ${audienceInsights.behaviorPatterns.mostActiveHours.join(', ')}
    
    Provide a detailed campaign strategy in JSON format with:
    1. Target audience (demographics, interests, behaviors)
    2. Content pillars (3-5 key themes)
    3. Posting schedule (frequency, best times, platform mix)
    4. KPIs (measurable goals)
    5. Budget allocation (if budget provided)
    6. Timeline with milestones`;

    const response = await this.orchestrator.queryWithRateLimit(
      'anthropic',
      'claude-3-5-sonnet-20241022',
      {
        prompt,
        systemPrompt: 'You are an expert social media marketing strategist specializing in campaign planning and execution.',
        temperature: 0.7,
        maxTokens: 2000,
      }
    );

    const strategy = this.parseStrategyResponse(response.content, objective, platforms, budget, duration);

    await storage.createAIGeneratedContent({
      agentId: 124,
      contentType: 'campaign_strategy',
      content: JSON.stringify(strategy),
      aiModel: response.model,
      prompt,
      approvalStatus: 'pending',
      metadata: {
        objective,
        platforms,
        budget,
        duration,
      },
    });

    return strategy;
  }

  private parseStrategyResponse(
    content: string,
    objective: string,
    platforms: string[],
    budget?: number,
    duration?: number
  ): CampaignStrategy {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return this.validateStrategy(parsed);
      }
    } catch (error) {
      console.error('[MarketingAssistant] Failed to parse strategy:', error);
    }

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + (duration || 30));

    return {
      objective,
      targetAudience: {
        demographics: ['Adults 25-54', 'Urban areas', 'Tango enthusiasts'],
        interests: ['Dance', 'Social events', 'Culture', 'Arts'],
        behaviors: ['Attends dance events', 'Active on social media', 'Shares cultural content'],
      },
      contentPillars: ['Educational content', 'Event promotion', 'Community stories', 'Behind-the-scenes'],
      postingSchedule: {
        frequency: '5-7 posts per week',
        bestTimes: ['9:00 AM', '7:00 PM'],
        platforms,
      },
      kpis: [
        { metric: 'Engagement Rate', target: 5.0 },
        { metric: 'Reach', target: 10000 },
        { metric: 'Followers Growth', target: 500 },
      ],
      budget: budget ? {
        total: budget,
        platformAllocation: this.allocateBudget(budget, platforms),
      } : undefined,
      timeline: {
        startDate,
        endDate,
        milestones: [
          { date: new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000), goal: 'First week baseline' },
          { date: new Date(startDate.getTime() + 14 * 24 * 60 * 60 * 1000), goal: 'Mid-campaign review' },
          { date: endDate, goal: 'Campaign completion' },
        ],
      },
    };
  }

  private validateStrategy(parsed: any): CampaignStrategy {
    return {
      objective: parsed.objective || 'Increase engagement',
      targetAudience: parsed.targetAudience || {
        demographics: [],
        interests: [],
        behaviors: [],
      },
      contentPillars: parsed.contentPillars || [],
      postingSchedule: parsed.postingSchedule || {
        frequency: 'daily',
        bestTimes: [],
        platforms: [],
      },
      kpis: parsed.kpis || [],
      budget: parsed.budget,
      timeline: parsed.timeline || {
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        milestones: [],
      },
    };
  }

  private allocateBudget(totalBudget: number, platforms: string[]): Record<string, number> {
    const allocation: Record<string, number> = {};
    const perPlatform = totalBudget / platforms.length;

    platforms.forEach(platform => {
      allocation[platform] = perPlatform;
    });

    return allocation;
  }

  async recommendABTests(userId: number, focus?: string): Promise<ABTestRecommendation[]> {
    const performance = await engagementAnalyzer.analyzeContentPerformance(userId);

    const recommendations: ABTestRecommendation[] = [
      {
        testName: 'Posting Time Optimization',
        hypothesis: 'Posts published during peak engagement hours will receive 30% more engagement',
        variants: [
          {
            name: 'Morning posts (9-11 AM)',
            description: 'Post during morning hours when users are starting their day',
            implementation: 'Schedule posts between 9:00 AM - 11:00 AM',
          },
          {
            name: 'Evening posts (7-9 PM)',
            description: 'Post during evening hours when users are more relaxed',
            implementation: 'Schedule posts between 7:00 PM - 9:00 PM',
          },
        ],
        successMetric: 'Engagement rate (likes + comments + shares)',
        sampleSize: 20,
        duration: '2 weeks',
        expectedImpact: '+30% engagement',
      },
      {
        testName: 'Content Format Comparison',
        hypothesis: 'Video content generates higher engagement than static images',
        variants: [
          {
            name: 'Short-form video (15-30 sec)',
            description: 'Quick, engaging video clips',
            implementation: 'Create 15-30 second video clips',
          },
          {
            name: 'Static image + carousel',
            description: 'Multiple images in carousel format',
            implementation: 'Create 3-5 image carousels',
          },
        ],
        successMetric: 'Total engagement and watch time',
        sampleSize: 16,
        duration: '2 weeks',
        expectedImpact: '+40% engagement',
      },
    ];

    if (focus === 'hashtags') {
      recommendations.push({
        testName: 'Hashtag Strategy',
        hypothesis: 'Using 5-7 niche hashtags outperforms 10+ popular hashtags',
        variants: [
          {
            name: '5-7 niche hashtags',
            description: 'Focused, targeted hashtags',
            implementation: 'Use 5-7 niche-specific hashtags per post',
          },
          {
            name: '10+ popular hashtags',
            description: 'Broad reach hashtags',
            implementation: 'Use 10-15 popular hashtags per post',
          },
        ],
        successMetric: 'Reach and engagement rate',
        sampleSize: 20,
        duration: '3 weeks',
        expectedImpact: '+25% reach',
      });
    }

    return recommendations;
  }

  async detectCrisis(userId: number): Promise<CrisisAlert[]> {
    const alerts: CrisisAlert[] = [];
    const recentMetrics = await engagementAnalyzer.analyzeEngagement(userId, {
      start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      end: new Date(),
    });

    const previousMetrics = await engagementAnalyzer.analyzeEngagement(userId, {
      start: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      end: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    });

    if (previousMetrics.averageEngagement > 0) {
      const dropPercentage = ((previousMetrics.averageEngagement - recentMetrics.averageEngagement) / previousMetrics.averageEngagement) * 100;

      if (dropPercentage > 30) {
        alerts.push({
          severity: 'high',
          type: 'engagement_drop',
          description: `Engagement has dropped by ${dropPercentage.toFixed(1)}% in the last 7 days`,
          affectedPlatforms: ['instagram', 'facebook', 'twitter'],
          detectedAt: new Date(),
          recommendedActions: [
            'Review recent content for quality issues',
            'Analyze posting times - may need adjustment',
            'Increase posting frequency',
            'Engage more with audience comments',
          ],
        });
      }
    }

    return alerts;
  }

  async identifyGrowthOpportunities(userId: number): Promise<GrowthOpportunity[]> {
    const opportunities: GrowthOpportunity[] = [];
    const performance = await engagementAnalyzer.analyzeContentPerformance(userId);
    const trends = await engagementAnalyzer.detectTrends(userId);

    const underperformingPlatforms = Object.entries(performance.platformPerformance)
      .filter(([, data]) => data.avgEngagement < 50)
      .map(([platform]) => platform);

    if (underperformingPlatforms.length > 0) {
      opportunities.push({
        type: 'platform_expansion',
        title: `Improve ${underperformingPlatforms[0]} presence`,
        description: `${underperformingPlatforms[0]} shows low engagement. Dedicated content strategy could unlock growth.`,
        potentialReach: 5000,
        effort: 'medium',
        priority: 8,
        actionItems: [
          `Research ${underperformingPlatforms[0]}-specific content best practices`,
          'Create platform-optimized content',
          'Engage with similar accounts',
          'Run targeted campaigns',
        ],
      });
    }

    if (trends.emergingHashtags.length > 0) {
      opportunities.push({
        type: 'trending_topic',
        title: 'Capitalize on emerging hashtags',
        description: `Trending hashtags like ${trends.emergingHashtags.slice(0, 3).join(', ')} offer growth potential`,
        potentialReach: 10000,
        effort: 'low',
        priority: 9,
        actionItems: [
          'Create content around trending hashtags',
          'Post during peak engagement times',
          'Collaborate with other creators using these hashtags',
        ],
      });
    }

    opportunities.push({
      type: 'collaboration',
      title: 'Influencer partnerships',
      description: 'Partner with tango influencers to expand reach',
      potentialReach: 15000,
      effort: 'high',
      priority: 7,
      actionItems: [
        'Identify relevant micro-influencers (5K-50K followers)',
        'Reach out with collaboration proposals',
        'Co-create content',
        'Track collaboration performance',
      ],
    });

    return opportunities.sort((a, b) => b.priority - a.priority);
  }

  async calculateROI(userId: number, campaignId?: number): Promise<ROIAnalysis> {
    const posts = campaignId
      ? await storage.getSocialPosts(userId)
      : await storage.getSocialPosts(userId);

    const totalInvestment = 1000;
    const revenue = 0;

    const roi = revenue - totalInvestment;
    const roiPercentage = totalInvestment > 0 ? (roi / totalInvestment) * 100 : 0;

    const platformBreakdown: Record<string, { investment: number; revenue: number; roi: number }> = {};

    ['instagram', 'facebook', 'linkedin', 'twitter'].forEach(platform => {
      const investment = 250;
      const platformRevenue = 0;
      const platformROI = platformRevenue - investment;

      platformBreakdown[platform] = {
        investment,
        revenue: platformRevenue,
        roi: platformROI,
      };
    });

    const recommendations: string[] = [];

    if (roiPercentage < 0) {
      recommendations.push('Current campaign is not profitable - consider adjusting strategy');
      recommendations.push('Focus budget on best-performing platforms');
    } else if (roiPercentage < 100) {
      recommendations.push('ROI is positive but could be improved');
      recommendations.push('Optimize ad targeting and content quality');
    } else {
      recommendations.push('Excellent ROI - consider scaling successful campaigns');
    }

    return {
      totalInvestment,
      revenue,
      roi,
      roiPercentage,
      platformBreakdown,
      recommendations,
    };
  }
}

export const marketingAssistant = new MarketingAssistant();
