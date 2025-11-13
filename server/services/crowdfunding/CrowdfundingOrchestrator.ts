import { campaignPredictorAgent } from './CampaignPredictor';
import { campaignOptimizerAgent } from './CampaignOptimizer';
import { donorEngagementAgent } from './DonorEngagement';
import { fraudDetectionAgent } from './FraudDetection';
import type { SuccessPrediction } from './CampaignPredictor';
import type { OptimizationAnalysis } from './CampaignOptimizer';
import type { DonorEngagementPlan } from './DonorEngagement';
import type { FraudAnalysis } from './FraudDetection';

export interface CampaignInsights {
  campaignId: number;
  timestamp: Date;
  successPrediction: SuccessPrediction;
  optimization: OptimizationAnalysis;
  donorEngagement: DonorEngagementPlan;
  fraudAnalysis: FraudAnalysis;
  overallRecommendation: string;
  priorityActions: Array<{
    action: string;
    priority: 'critical' | 'high' | 'medium' | 'low';
    impact: string;
  }>;
}

export class CrowdfundingOrchestrator {
  async generateComprehensiveInsights(campaignId: number): Promise<CampaignInsights> {
    console.log(`[Orchestrator] Generating comprehensive insights for campaign ${campaignId}`);

    const [
      successPrediction,
      optimization,
      donorEngagement,
      fraudAnalysis
    ] = await Promise.all([
      campaignPredictorAgent.predictCampaignSuccess(campaignId),
      campaignOptimizerAgent.optimizeCampaign(campaignId),
      donorEngagementAgent.analyzeAndEngageDonors(campaignId),
      fraudDetectionAgent.analyzeCampaignFraud(campaignId),
    ]);

    const priorityActions = this.determinePriorityActions({
      successPrediction,
      optimization,
      donorEngagement,
      fraudAnalysis,
    });

    const overallRecommendation = this.generateOverallRecommendation({
      successPrediction,
      optimization,
      fraudAnalysis,
      priorityActions,
    });

    return {
      campaignId,
      timestamp: new Date(),
      successPrediction,
      optimization,
      donorEngagement,
      fraudAnalysis,
      overallRecommendation,
      priorityActions,
    };
  }

  async predictSuccess(campaignId: number): Promise<SuccessPrediction> {
    console.log(`[Orchestrator] Running success prediction for campaign ${campaignId}`);
    return await campaignPredictorAgent.predictCampaignSuccess(campaignId);
  }

  async optimizeCampaign(campaignId: number): Promise<OptimizationAnalysis> {
    console.log(`[Orchestrator] Running optimization analysis for campaign ${campaignId}`);
    return await campaignOptimizerAgent.optimizeCampaign(campaignId);
  }

  async engageDonors(campaignId: number): Promise<DonorEngagementPlan> {
    console.log(`[Orchestrator] Running donor engagement analysis for campaign ${campaignId}`);
    return await donorEngagementAgent.analyzeAndEngageDonors(campaignId);
  }

  async checkFraud(campaignId: number): Promise<FraudAnalysis> {
    console.log(`[Orchestrator] Running fraud detection for campaign ${campaignId}`);
    return await fraudDetectionAgent.analyzeCampaignFraud(campaignId);
  }

  async generateThankYouMessage(
    campaignId: number,
    donorName: string,
    amount: number
  ): Promise<string> {
    console.log(`[Orchestrator] Generating thank-you message for ${donorName} ($${amount})`);
    return await donorEngagementAgent.generatePersonalizedThankYou(
      campaignId,
      donorName,
      amount
    );
  }

  private determinePriorityActions(insights: {
    successPrediction: SuccessPrediction;
    optimization: OptimizationAnalysis;
    donorEngagement: DonorEngagementPlan;
    fraudAnalysis: FraudAnalysis;
  }): Array<{ action: string; priority: 'critical' | 'high' | 'medium' | 'low'; impact: string }> {
    const actions: Array<{ action: string; priority: 'critical' | 'high' | 'medium' | 'low'; impact: string }> = [];

    if (insights.fraudAnalysis.riskScore >= 70) {
      actions.push({
        action: 'Address fraud concerns immediately',
        priority: 'critical',
        impact: 'Campaign may be suspended if issues not resolved',
      });
    }

    if (insights.successPrediction.successProbability < 30) {
      actions.push({
        action: 'Major campaign improvements needed',
        priority: 'critical',
        impact: 'Low success probability - immediate action required',
      });
    }

    if (insights.optimization.titleAnalysis.score < 50) {
      actions.push({
        action: 'Improve campaign title with emotional keywords',
        priority: 'high',
        impact: 'Better title can increase success probability by 15-20%',
      });
    }

    if (insights.optimization.storyAnalysis.score < 60) {
      actions.push({
        action: 'Expand and improve campaign story',
        priority: 'high',
        impact: 'Story quality is the #1 success factor (50% impact)',
      });
    }

    if (insights.optimization.rewardTierOptimization.score < 50) {
      actions.push({
        action: 'Add or improve reward tiers',
        priority: 'high',
        impact: 'Campaigns with 3-5 reward tiers raise 2x more',
      });
    }

    if (!insights.optimization.imageAnalysis.hasImage) {
      actions.push({
        action: 'Add a high-quality campaign image',
        priority: 'high',
        impact: 'Campaigns with images raise 3x more on average',
      });
    }

    if (insights.optimization.updateStrategy.score < 60) {
      actions.push({
        action: 'Increase update frequency to 2-3 per week',
        priority: 'medium',
        impact: 'Regular updates keep donors engaged and attract new backers',
      });
    }

    if (insights.donorEngagement.segments.lapsed.donorCount > 0) {
      actions.push({
        action: `Re-engage ${insights.donorEngagement.segments.lapsed.donorCount} lapsed donors`,
        priority: 'medium',
        impact: 'Previous donors are 5x more likely to donate again',
      });
    }

    if (insights.donorEngagement.segments.whales.donorCount > 0) {
      actions.push({
        action: `Send personalized thanks to ${insights.donorEngagement.segments.whales.donorCount} major donors`,
        priority: 'high',
        impact: 'Major donors drive 60% of total funding',
      });
    }

    if (insights.successPrediction.successFactors.goalAmount < 60) {
      actions.push({
        action: `Consider adjusting goal amount to $${insights.successPrediction.recommendations.optimalGoalAmount}`,
        priority: 'medium',
        impact: 'Optimal goal amounts ($500-$5000) have 2x success rate',
      });
    }

    actions.sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    return actions.slice(0, 10);
  }

  private generateOverallRecommendation(data: {
    successPrediction: SuccessPrediction;
    optimization: OptimizationAnalysis;
    fraudAnalysis: FraudAnalysis;
    priorityActions: any[];
  }): string {
    const { successPrediction, optimization, fraudAnalysis, priorityActions } = data;

    if (fraudAnalysis.riskScore >= 90) {
      return `⚠️ CRITICAL: This campaign has severe fraud indicators (risk score: ${fraudAnalysis.riskScore}/100). It should not be approved until all concerns are addressed. ${fraudAnalysis.reasoning}`;
    }

    if (fraudAnalysis.riskScore >= 70) {
      return `⚠️ WARNING: This campaign shows high fraud risk (score: ${fraudAnalysis.riskScore}/100). Manual review required before proceeding. Address the following: ${fraudAnalysis.flags.map(f => f.description).join(', ')}.`;
    }

    const probability = successPrediction.successProbability;
    const overallScore = optimization.overallScore;
    const criticalActions = priorityActions.filter(a => a.priority === 'critical').length;
    const highActions = priorityActions.filter(a => a.priority === 'high').length;

    if (probability >= 80 && overallScore >= 80) {
      return `✅ EXCELLENT: This campaign is well-optimized with a ${probability}% success probability. Continue with regular updates and donor engagement. ${highActions > 0 ? `Consider implementing ${highActions} high-priority improvements for even better results.` : ''}`;
    }

    if (probability >= 60 && overallScore >= 70) {
      return `✓ GOOD: This campaign has a solid ${probability}% success probability. Focus on these ${highActions} high-priority actions to maximize funding: ${priorityActions.slice(0, 3).map(a => a.action).join('; ')}.`;
    }

    if (probability >= 40 && overallScore >= 50) {
      return `⚠ MODERATE: This campaign has a ${probability}% success probability. Significant improvements needed. Priority: ${priorityActions.slice(0, 3).map(a => a.action).join('; ')}. Making these changes could increase success probability by 20-30%.`;
    }

    return `🚨 LOW SUCCESS PROBABILITY: Only ${probability}% chance of success. This campaign needs major improvements. ${criticalActions > 0 ? `${criticalActions} critical issues must be addressed immediately.` : ''} Focus on: ${priorityActions.slice(0, 5).map(a => a.action).join('; ')}. Consider revising before launch.`;
  }

  async handleNewCampaign(campaignId: number): Promise<{
    approved: boolean;
    reason: string;
    insights?: CampaignInsights;
  }> {
    console.log(`[Orchestrator] Analyzing new campaign ${campaignId}`);

    const fraudAnalysis = await this.checkFraud(campaignId);

    if (fraudAnalysis.recommendation === 'reject') {
      return {
        approved: false,
        reason: `Campaign rejected due to fraud concerns: ${fraudAnalysis.reasoning}`,
      };
    }

    if (fraudAnalysis.recommendation === 'flag') {
      return {
        approved: false,
        reason: `Campaign flagged for manual review: ${fraudAnalysis.reasoning}`,
      };
    }

    const insights = await this.generateComprehensiveInsights(campaignId);

    if (fraudAnalysis.recommendation === 'review' || insights.successPrediction.successProbability < 20) {
      return {
        approved: false,
        reason: 'Campaign requires review before approval',
        insights,
      };
    }

    return {
      approved: true,
      reason: 'Campaign approved - all checks passed',
      insights,
    };
  }

  async handleNewDonation(
    campaignId: number,
    donorName: string,
    amount: number,
    currentAmount: number,
    goalAmount: number
  ): Promise<{
    thankYouMessage: string;
    milestoneReached?: {
      percentage: number;
      message: string;
    };
  }> {
    console.log(`[Orchestrator] Processing donation: ${donorName} donated $${amount} to campaign ${campaignId}`);

    const thankYouMessage = await this.generateThankYouMessage(campaignId, donorName, amount);

    const previousPercentage = Math.floor(((currentAmount - amount) / goalAmount) * 100);
    const newPercentage = Math.floor((currentAmount / goalAmount) * 100);

    const milestones = [25, 50, 75, 100];
    const reachedMilestone = milestones.find(m => previousPercentage < m && newPercentage >= m);

    if (reachedMilestone) {
      const engagement = await this.engageDonors(campaignId);
      const milestoneKey = `percent${reachedMilestone}` as keyof typeof engagement.milestoneMessages;
      
      return {
        thankYouMessage,
        milestoneReached: {
          percentage: reachedMilestone,
          message: engagement.milestoneMessages[milestoneKey],
        },
      };
    }

    return { thankYouMessage };
  }
}

export const crowdfundingOrchestrator = new CrowdfundingOrchestrator();
