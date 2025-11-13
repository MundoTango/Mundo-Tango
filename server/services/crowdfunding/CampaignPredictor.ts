import { db } from "@shared/db";
import { 
  fundingCampaigns, 
  campaignDonations,
  campaignUpdates,
  campaignRewards 
} from "@shared/schema";
import { eq, desc, gte, sql, and, count, avg, sum } from "drizzle-orm";
import { OpenAIService } from "../ai/OpenAIService";

export interface SuccessPrediction {
  campaignId: number;
  successProbability: number;
  fundingPrediction: {
    expectedAmount: number;
    expectedPercentage: number;
    timeline: {
      daysToReach25: number;
      daysToReach50: number;
      daysToReach75: number;
      daysToReach100: number;
    };
  };
  successFactors: {
    titleQuality: number;
    storyQuality: number;
    imageQuality: number;
    rewardTiers: number;
    updateFrequency: number;
    goalAmount: number;
    duration: number;
    category: number;
  };
  recommendations: {
    optimalGoalAmount: number;
    optimalDuration: number;
    suggestedImprovements: string[];
  };
  comparisons: {
    categoryAverage: number;
    similarCampaigns: number;
    topPerformers: number;
  };
}

export class CampaignPredictorAgent {
  async predictCampaignSuccess(campaignId: number): Promise<SuccessPrediction> {
    const campaign = await db.query.fundingCampaigns.findFirst({
      where: eq(fundingCampaigns.id, campaignId),
      with: {
        donations: true,
        updates: true,
        rewards: true,
      }
    });

    if (!campaign) {
      throw new Error(`Campaign ${campaignId} not found`);
    }

    const historicalData = await this.getHistoricalData(campaign.category);
    const successFactors = await this.analyzeSuccessFactors(campaign);
    const successProbability = this.calculateSuccessProbability(successFactors, historicalData);
    const fundingPrediction = this.predictFundingTimeline(campaign, successProbability, historicalData);
    const recommendations = await this.generateRecommendations(campaign, successFactors, historicalData);
    const comparisons = this.generateComparisons(campaign, historicalData);

    return {
      campaignId,
      successProbability,
      fundingPrediction,
      successFactors,
      recommendations,
      comparisons
    };
  }

  private async getHistoricalData(category: string | null) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const categoryStats = await db
      .select({
        totalCampaigns: count(),
        avgGoalAmount: avg(fundingCampaigns.goalAmount),
        avgCurrentAmount: avg(fundingCampaigns.currentAmount),
        successfulCampaigns: sql<number>`COUNT(CASE WHEN ${fundingCampaigns.currentAmount} >= ${fundingCampaigns.goalAmount} THEN 1 END)`,
      })
      .from(fundingCampaigns)
      .where(
        and(
          category ? eq(fundingCampaigns.category, category) : sql`1=1`,
          gte(fundingCampaigns.createdAt, thirtyDaysAgo)
        )
      )
      .then(rows => rows[0]);

    return {
      totalCampaigns: Number(categoryStats?.totalCampaigns || 0),
      avgGoalAmount: Number(categoryStats?.avgGoalAmount || 5000),
      avgCurrentAmount: Number(categoryStats?.avgCurrentAmount || 2000),
      successRate: categoryStats?.totalCampaigns 
        ? Number(categoryStats.successfulCampaigns || 0) / Number(categoryStats.totalCampaigns)
        : 0.35,
    };
  }

  private async analyzeSuccessFactors(campaign: any) {
    const titleScore = this.analyzeTitleQuality(campaign.title);
    const storyScore = await this.analyzeStoryQuality(campaign.story);
    const imageScore = campaign.imageUrl ? 85 : 40;
    const rewardScore = this.analyzeRewardTiers(campaign.rewards);
    const updateScore = this.analyzeUpdateFrequency(campaign.updates, campaign.createdAt);
    const goalScore = this.analyzeGoalAmount(campaign.goalAmount);
    const durationScore = this.analyzeDuration(campaign.createdAt, campaign.endDate);
    const categoryScore = this.analyzeCategoryPerformance(campaign.category);

    return {
      titleQuality: titleScore,
      storyQuality: storyScore,
      imageQuality: imageScore,
      rewardTiers: rewardScore,
      updateFrequency: updateScore,
      goalAmount: goalScore,
      duration: durationScore,
      category: categoryScore,
    };
  }

  private analyzeTitleQuality(title: string): number {
    let score = 50;

    const emotionalKeywords = ['help', 'support', 'save', 'dream', 'change', 'transform', 'inspire', 'create'];
    const actionVerbs = ['build', 'make', 'launch', 'start', 'grow', 'achieve'];
    
    const lowerTitle = title.toLowerCase();
    emotionalKeywords.forEach(keyword => {
      if (lowerTitle.includes(keyword)) score += 5;
    });
    actionVerbs.forEach(verb => {
      if (lowerTitle.includes(verb)) score += 5;
    });

    if (title.length >= 40 && title.length <= 80) score += 10;
    else if (title.length < 20) score -= 15;

    if (/[!?]/.test(title)) score += 5;

    return Math.min(100, Math.max(0, score));
  }

  private async analyzeStoryQuality(story: string): Promise<number> {
    let score = 50;

    if (story.length > 300) score += 15;
    if (story.length > 600) score += 10;
    if (story.length > 1000) score += 10;

    const paragraphs = story.split('\n\n').length;
    if (paragraphs >= 3) score += 10;

    const hasImpactStatement = /impact|change|help|difference/i.test(story);
    if (hasImpactStatement) score += 10;

    const hasProblem = /problem|challenge|need|struggle/i.test(story);
    const hasSolution = /solution|plan|will|goal/i.test(story);
    if (hasProblem && hasSolution) score += 15;

    return Math.min(100, Math.max(0, score));
  }

  private analyzeRewardTiers(rewards: any[]): number {
    if (!rewards || rewards.length === 0) return 30;

    let score = 50;

    if (rewards.length >= 3 && rewards.length <= 5) score += 25;
    else if (rewards.length >= 6 && rewards.length <= 8) score += 15;
    else if (rewards.length > 8) score -= 10;

    const hasLowTier = rewards.some(r => r.price <= 25);
    const hasMidTier = rewards.some(r => r.price >= 50 && r.price <= 100);
    const hasHighTier = rewards.some(r => r.price >= 150);

    if (hasLowTier) score += 5;
    if (hasMidTier) score += 10;
    if (hasHighTier) score += 5;

    const avgDescLength = rewards.reduce((sum, r) => sum + (r.description?.length || 0), 0) / rewards.length;
    if (avgDescLength > 100) score += 10;

    return Math.min(100, Math.max(0, score));
  }

  private analyzeUpdateFrequency(updates: any[], createdAt: Date): number {
    if (!updates || updates.length === 0) return 20;

    const daysSinceLaunch = Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSinceLaunch === 0) return 50;

    const updateFrequency = updates.length / (daysSinceLaunch / 7);

    let score = 50;
    if (updateFrequency >= 2 && updateFrequency <= 3) score = 100;
    else if (updateFrequency >= 1 && updateFrequency < 2) score = 75;
    else if (updateFrequency >= 0.5 && updateFrequency < 1) score = 60;
    else if (updateFrequency > 3) score = 70;
    else score = 40;

    return score;
  }

  private analyzeGoalAmount(goalAmount: number): number {
    if (goalAmount >= 500 && goalAmount <= 5000) return 100;
    if (goalAmount >= 5001 && goalAmount <= 10000) return 75;
    if (goalAmount >= 10001 && goalAmount <= 25000) return 50;
    if (goalAmount > 25000) return 30;
    if (goalAmount < 500) return 40;
    return 50;
  }

  private analyzeDuration(startDate: Date, endDate: Date | null): number {
    if (!endDate) return 50;

    const durationDays = Math.floor((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24));

    if (durationDays >= 30 && durationDays <= 60) return 100;
    if (durationDays >= 20 && durationDays < 30) return 80;
    if (durationDays >= 60 && durationDays <= 90) return 85;
    if (durationDays > 90) return 50;
    if (durationDays < 20) return 40;

    return 50;
  }

  private analyzeCategoryPerformance(category: string | null): number {
    const categoryScores: Record<string, number> = {
      'emergency': 85,
      'medical': 80,
      'education': 75,
      'community': 70,
      'creative': 65,
      'business': 60,
      'event': 70,
      'travel': 65,
      'equipment': 60,
    };

    return category && categoryScores[category.toLowerCase()] || 60;
  }

  private calculateSuccessProbability(factors: any, historicalData: any): number {
    const weights = {
      titleQuality: 0.10,
      storyQuality: 0.25,
      imageQuality: 0.15,
      rewardTiers: 0.15,
      updateFrequency: 0.10,
      goalAmount: 0.15,
      duration: 0.05,
      category: 0.05,
    };

    let weightedScore = 0;
    Object.entries(factors).forEach(([key, value]) => {
      weightedScore += (value as number) * (weights[key as keyof typeof weights] || 0);
    });

    const historicalAdjustment = historicalData.successRate * 0.2;
    const finalProbability = (weightedScore * 0.8) + (historicalAdjustment * 100);

    return Math.min(100, Math.max(0, Math.round(finalProbability * 100) / 100));
  }

  private predictFundingTimeline(campaign: any, probability: number, historicalData: any): any {
    const goalAmount = campaign.goalAmount || 5000;
    const currentAmount = campaign.currentAmount || 0;
    const expectedPercentage = probability;
    const expectedAmount = (goalAmount * expectedPercentage) / 100;

    const avgDaysToFund = 45;
    const probabilityFactor = probability / 100;

    return {
      expectedAmount: Math.round(expectedAmount),
      expectedPercentage: Math.round(expectedPercentage),
      timeline: {
        daysToReach25: Math.round(avgDaysToFund * 0.25 / probabilityFactor),
        daysToReach50: Math.round(avgDaysToFund * 0.50 / probabilityFactor),
        daysToReach75: Math.round(avgDaysToFund * 0.75 / probabilityFactor),
        daysToReach100: Math.round(avgDaysToFund / probabilityFactor),
      }
    };
  }

  private async generateRecommendations(campaign: any, factors: any, historicalData: any): Promise<any> {
    const improvements: string[] = [];

    if (factors.titleQuality < 70) {
      improvements.push("Improve your title with emotional keywords like 'help', 'support', or 'transform'");
    }

    if (factors.storyQuality < 70) {
      improvements.push("Expand your story to at least 600 words with clear problem, solution, and impact sections");
    }

    if (factors.imageQuality < 70) {
      improvements.push("Add a high-quality main image showing your project or cause");
    }

    if (factors.rewardTiers < 60) {
      improvements.push("Create 3-5 reward tiers at $25, $50, $100, and $250 price points");
    }

    if (factors.updateFrequency < 60) {
      improvements.push("Post 2-3 updates per week to keep donors engaged");
    }

    if (factors.goalAmount < 60) {
      improvements.push(`Consider adjusting your goal to the optimal range of $500-$5000 (current: $${campaign.goalAmount})`);
    }

    const optimalGoalAmount = campaign.goalAmount > 10000 
      ? Math.round(campaign.goalAmount * 0.6) 
      : Math.max(500, Math.min(5000, campaign.goalAmount));

    const optimalDuration = 45;

    return {
      optimalGoalAmount,
      optimalDuration,
      suggestedImprovements: improvements,
    };
  }

  private generateComparisons(campaign: any, historicalData: any): any {
    const categoryAverage = historicalData.successRate * 100;

    return {
      categoryAverage: Math.round(categoryAverage),
      similarCampaigns: historicalData.totalCampaigns,
      topPerformers: Math.round(historicalData.totalCampaigns * 0.1),
    };
  }
}

export const campaignPredictorAgent = new CampaignPredictorAgent();
