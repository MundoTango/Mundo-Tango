import { Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import { crowdfundingOrchestrator } from '../services/crowdfunding/CrowdfundingOrchestrator';
import { db } from '@shared/db';
import { crowdfundingCampaigns } from '@shared/schema';
import { eq, and, gte, sql } from 'drizzle-orm';

const connection = new IORedis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  maxRetriesPerRequest: null,
});

export interface CrowdfundingJobData {
  type: 'predict-success' | 'optimize-campaign' | 'engage-donors' | 'detect-fraud' | 'comprehensive-analysis' | 'new-campaign-check' | 'new-donation-process';
  campaignId: number;
  donorName?: string;
  donationAmount?: number;
  currentAmount?: number;
  goalAmount?: number;
}

export const crowdfundingAgentWorker = new Worker<CrowdfundingJobData>(
  'crowdfunding-agents',
  async (job: Job<CrowdfundingJobData>) => {
    console.log(`[CrowdfundingWorker] Processing job ${job.id}: ${job.data.type}`);

    try {
      switch (job.data.type) {
        case 'predict-success':
          return await handlePredictSuccess(job);
        
        case 'optimize-campaign':
          return await handleOptimizeCampaign(job);
        
        case 'engage-donors':
          return await handleEngageDonors(job);
        
        case 'detect-fraud':
          return await handleDetectFraud(job);
        
        case 'comprehensive-analysis':
          return await handleComprehensiveAnalysis(job);
        
        case 'new-campaign-check':
          return await handleNewCampaignCheck(job);
        
        case 'new-donation-process':
          return await handleNewDonation(job);
        
        default:
          throw new Error(`Unknown job type: ${job.data.type}`);
      }
    } catch (error: any) {
      console.error(`[CrowdfundingWorker] Error processing job ${job.id}:`, error);
      throw error;
    }
  },
  {
    connection,
    concurrency: 5,
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 50 },
  }
);

async function handlePredictSuccess(job: Job<CrowdfundingJobData>) {
  const { campaignId } = job.data;
  
  await job.updateProgress(10);
  console.log(`[CrowdfundingWorker] Predicting success for campaign ${campaignId}`);

  const prediction = await crowdfundingOrchestrator.predictSuccess(campaignId);
  
  await job.updateProgress(100);
  console.log(`[CrowdfundingWorker] Success prediction complete: ${prediction.successProbability}%`);

  return {
    success: true,
    prediction,
  };
}

async function handleOptimizeCampaign(job: Job<CrowdfundingJobData>) {
  const { campaignId } = job.data;
  
  await job.updateProgress(10);
  console.log(`[CrowdfundingWorker] Optimizing campaign ${campaignId}`);

  const optimization = await crowdfundingOrchestrator.optimizeCampaign(campaignId);
  
  await job.updateProgress(100);
  console.log(`[CrowdfundingWorker] Optimization complete: score ${optimization.overallScore}/100`);

  return {
    success: true,
    optimization,
  };
}

async function handleEngageDonors(job: Job<CrowdfundingJobData>) {
  const { campaignId } = job.data;
  
  await job.updateProgress(10);
  console.log(`[CrowdfundingWorker] Analyzing donor engagement for campaign ${campaignId}`);

  const engagement = await crowdfundingOrchestrator.engageDonors(campaignId);
  
  await job.updateProgress(100);
  console.log(`[CrowdfundingWorker] Donor engagement analysis complete`);

  return {
    success: true,
    engagement,
  };
}

async function handleDetectFraud(job: Job<CrowdfundingJobData>) {
  const { campaignId } = job.data;
  
  await job.updateProgress(10);
  console.log(`[CrowdfundingWorker] Running fraud detection for campaign ${campaignId}`);

  const fraudAnalysis = await crowdfundingOrchestrator.checkFraud(campaignId);
  
  await job.updateProgress(100);
  console.log(`[CrowdfundingWorker] Fraud detection complete: risk score ${fraudAnalysis.riskScore}/100`);

  if (fraudAnalysis.riskScore >= 90) {
    console.warn(`[CrowdfundingWorker] CRITICAL FRAUD ALERT for campaign ${campaignId}`);
  } else if (fraudAnalysis.riskScore >= 70) {
    console.warn(`[CrowdfundingWorker] HIGH FRAUD RISK for campaign ${campaignId}`);
  }

  return {
    success: true,
    fraudAnalysis,
  };
}

async function handleComprehensiveAnalysis(job: Job<CrowdfundingJobData>) {
  const { campaignId } = job.data;
  
  await job.updateProgress(10);
  console.log(`[CrowdfundingWorker] Generating comprehensive insights for campaign ${campaignId}`);

  const insights = await crowdfundingOrchestrator.generateComprehensiveInsights(campaignId);
  
  await job.updateProgress(100);
  console.log(`[CrowdfundingWorker] Comprehensive analysis complete for campaign ${campaignId}`);

  return {
    success: true,
    insights,
  };
}

async function handleNewCampaignCheck(job: Job<CrowdfundingJobData>) {
  const { campaignId } = job.data;
  
  await job.updateProgress(10);
  console.log(`[CrowdfundingWorker] Checking new campaign ${campaignId}`);

  const result = await crowdfundingOrchestrator.handleNewCampaign(campaignId);
  
  await job.updateProgress(100);
  console.log(`[CrowdfundingWorker] New campaign check complete: ${result.approved ? 'APPROVED' : 'REJECTED/REVIEW'}`);

  if (!result.approved) {
    await db
      .update(crowdfundingCampaigns)
      .set({ status: 'pending_review' })
      .where(eq(crowdfundingCampaigns.id, campaignId));
  }

  return {
    success: true,
    ...result,
  };
}

async function handleNewDonation(job: Job<CrowdfundingJobData>) {
  const { campaignId, donorName, donationAmount, currentAmount, goalAmount } = job.data;
  
  if (!donorName || !donationAmount || currentAmount === undefined || !goalAmount) {
    throw new Error('Missing required donation data');
  }

  await job.updateProgress(10);
  console.log(`[CrowdfundingWorker] Processing donation: ${donorName} donated $${donationAmount}`);

  const result = await crowdfundingOrchestrator.handleNewDonation(
    campaignId,
    donorName,
    donationAmount,
    currentAmount,
    goalAmount
  );
  
  await job.updateProgress(100);
  console.log(`[CrowdfundingWorker] Donation processed for campaign ${campaignId}`);

  if (result.milestoneReached) {
    console.log(`[CrowdfundingWorker] 🎉 MILESTONE REACHED: ${result.milestoneReached.percentage}% funded!`);
  }

  return {
    success: true,
    ...result,
  };
}

crowdfundingAgentWorker.on('completed', (job: Job) => {
  console.log(`[CrowdfundingWorker] ✅ Job ${job.id} completed successfully`);
});

crowdfundingAgentWorker.on('failed', (job: Job | undefined, err: Error) => {
  console.error(`[CrowdfundingWorker] ❌ Job ${job?.id} failed:`, err.message);
});

crowdfundingAgentWorker.on('error', (err: Error) => {
  console.error('[CrowdfundingWorker] Worker error:', err);
});

console.log('🚀 Crowdfunding Agent Worker started successfully');

export async function scheduleDailyTasks() {
  console.log('[CrowdfundingWorker] Scheduling daily automated tasks...');

  const activeCampaigns = await db.query.crowdfundingCampaigns.findMany({
    where: and(
      eq(crowdfundingCampaigns.status, 'active'),
      gte(crowdfundingCampaigns.endDate, new Date())
    ),
  });

  console.log(`[CrowdfundingWorker] Found ${activeCampaigns.length} active campaigns`);

  for (const campaign of activeCampaigns) {
    const daysSinceLaunch = Math.floor(
      (Date.now() - new Date(campaign.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceLaunch % 7 === 0) {
      console.log(`[CrowdfundingWorker] Scheduling comprehensive analysis for campaign ${campaign.id}`);
    }
  }
}

export { connection as redisConnection };
