import { Router, Request, Response } from 'express';
import { crowdfundingOrchestrator } from '../services/crowdfunding/CrowdfundingOrchestrator';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { db } from '@shared/db';
import { fundingCampaigns } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import { z } from 'zod';

const router = Router();

// Only create Redis connection if REDIS_URL is configured
const connection = process.env.REDIS_URL ? new IORedis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
  enableOfflineQueue: false,
  lazyConnect: true,
  reconnectOnError: () => false,
}) : null;

// Suppress Redis errors for graceful degradation
if (connection) {
  connection.on('error', () => {
    // Silently ignore - queue will be disabled without Redis
  });
}

const crowdfundingQueue = connection ? new Queue('crowdfunding-agents', { connection }) : null;

const predictSuccessSchema = z.object({
  campaignId: z.number().positive(),
});

const optimizeCampaignSchema = z.object({
  campaignId: z.number().positive(),
});

const engageDonorsSchema = z.object({
  campaignId: z.number().positive(),
});

const fraudCheckSchema = z.object({
  campaignId: z.number().positive(),
});

const thankYouSchema = z.object({
  campaignId: z.number().positive(),
  donorName: z.string().min(1),
  amount: z.number().positive(),
});

router.post(
  '/predict-success',
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    try {
      const { campaignId } = predictSuccessSchema.parse(req.body);

      const campaign = await db.query.fundingCampaigns.findFirst({
        where: eq(fundingCampaigns.id, campaignId),
      });

      if (!campaign) {
        return res.status(404).json({ message: 'Campaign not found' });
      }

      if (campaign.userId !== req.user?.id) {
        return res.status(403).json({ message: 'Not authorized to access this campaign' });
      }

      console.log(`[API] Predicting success for campaign ${campaignId}`);
      const prediction = await crowdfundingOrchestrator.predictSuccess(campaignId);

      return res.json({
        success: true,
        data: prediction,
      });
    } catch (error: any) {
      console.error('[API] Error predicting campaign success:', error);
      return res.status(500).json({
        message: 'Failed to predict campaign success',
        error: error.message,
      });
    }
  }
);

router.post(
  '/optimize-campaign',
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    try {
      const { campaignId } = optimizeCampaignSchema.parse(req.body);

      const campaign = await db.query.fundingCampaigns.findFirst({
        where: eq(fundingCampaigns.id, campaignId),
      });

      if (!campaign) {
        return res.status(404).json({ message: 'Campaign not found' });
      }

      if (campaign.userId !== req.user?.id) {
        return res.status(403).json({ message: 'Not authorized to access this campaign' });
      }

      console.log(`[API] Optimizing campaign ${campaignId}`);
      const optimization = await crowdfundingOrchestrator.optimizeCampaign(campaignId);

      return res.json({
        success: true,
        data: optimization,
      });
    } catch (error: any) {
      console.error('[API] Error optimizing campaign:', error);
      return res.status(500).json({
        message: 'Failed to optimize campaign',
        error: error.message,
      });
    }
  }
);

router.post(
  '/engage-donors',
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    try {
      const { campaignId } = engageDonorsSchema.parse(req.body);

      const campaign = await db.query.fundingCampaigns.findFirst({
        where: eq(fundingCampaigns.id, campaignId),
      });

      if (!campaign) {
        return res.status(404).json({ message: 'Campaign not found' });
      }

      if (campaign.userId !== req.user?.id) {
        return res.status(403).json({ message: 'Not authorized to access this campaign' });
      }

      console.log(`[API] Analyzing donor engagement for campaign ${campaignId}`);
      const engagement = await crowdfundingOrchestrator.engageDonors(campaignId);

      return res.json({
        success: true,
        data: engagement,
      });
    } catch (error: any) {
      console.error('[API] Error analyzing donor engagement:', error);
      return res.status(500).json({
        message: 'Failed to analyze donor engagement',
        error: error.message,
      });
    }
  }
);

router.post(
  '/fraud-check',
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    try {
      const { campaignId } = fraudCheckSchema.parse(req.body);

      const campaign = await db.query.fundingCampaigns.findFirst({
        where: eq(fundingCampaigns.id, campaignId),
      });

      if (!campaign) {
        return res.status(404).json({ message: 'Campaign not found' });
      }

      if (campaign.userId !== req.user?.id && req.user?.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized to access this campaign' });
      }

      console.log(`[API] Running fraud check for campaign ${campaignId}`);
      const fraudAnalysis = await crowdfundingOrchestrator.checkFraud(campaignId);

      return res.json({
        success: true,
        data: fraudAnalysis,
      });
    } catch (error: any) {
      console.error('[API] Error checking campaign fraud:', error);
      return res.status(500).json({
        message: 'Failed to check campaign fraud',
        error: error.message,
      });
    }
  }
);

router.get(
  '/campaign-insights/:id',
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    try {
      const campaignId = parseInt(req.params.id);

      if (isNaN(campaignId)) {
        return res.status(400).json({ message: 'Invalid campaign ID' });
      }

      const campaign = await db.query.fundingCampaigns.findFirst({
        where: eq(fundingCampaigns.id, campaignId),
      });

      if (!campaign) {
        return res.status(404).json({ message: 'Campaign not found' });
      }

      if (campaign.userId !== req.user?.id && req.user?.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized to access this campaign' });
      }

      console.log(`[API] Generating comprehensive insights for campaign ${campaignId}`);
      const insights = await crowdfundingOrchestrator.generateComprehensiveInsights(campaignId);

      return res.json({
        success: true,
        data: insights,
      });
    } catch (error: any) {
      console.error('[API] Error generating campaign insights:', error);
      return res.status(500).json({
        message: 'Failed to generate campaign insights',
        error: error.message,
      });
    }
  }
);

router.get(
  '/donor-segments/:campaignId',
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    try {
      const campaignId = parseInt(req.params.campaignId);

      if (isNaN(campaignId)) {
        return res.status(400).json({ message: 'Invalid campaign ID' });
      }

      const campaign = await db.query.fundingCampaigns.findFirst({
        where: eq(fundingCampaigns.id, campaignId),
      });

      if (!campaign) {
        return res.status(404).json({ message: 'Campaign not found' });
      }

      if (campaign.userId !== req.user?.id) {
        return res.status(403).json({ message: 'Not authorized to access this campaign' });
      }

      console.log(`[API] Getting donor segments for campaign ${campaignId}`);
      const engagement = await crowdfundingOrchestrator.engageDonors(campaignId);

      return res.json({
        success: true,
        data: {
          segments: engagement.segments,
          totalDonors: Object.values(engagement.segments).reduce(
            (sum, segment) => sum + segment.donorCount,
            0
          ),
          totalAmount: Object.values(engagement.segments).reduce(
            (sum, segment) => sum + segment.totalAmount,
            0
          ),
        },
      });
    } catch (error: any) {
      console.error('[API] Error getting donor segments:', error);
      return res.status(500).json({
        message: 'Failed to get donor segments',
        error: error.message,
      });
    }
  }
);

router.post(
  '/generate-thank-you',
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    try {
      const { campaignId, donorName, amount } = thankYouSchema.parse(req.body);

      const campaign = await db.query.fundingCampaigns.findFirst({
        where: eq(fundingCampaigns.id, campaignId),
      });

      if (!campaign) {
        return res.status(404).json({ message: 'Campaign not found' });
      }

      if (campaign.userId !== req.user?.id) {
        return res.status(403).json({ message: 'Not authorized to access this campaign' });
      }

      console.log(`[API] Generating thank-you message for ${donorName} ($${amount})`);
      const message = await crowdfundingOrchestrator.generateThankYouMessage(
        campaignId,
        donorName,
        amount
      );

      return res.json({
        success: true,
        data: {
          message,
          donorName,
          amount,
        },
      });
    } catch (error: any) {
      console.error('[API] Error generating thank-you message:', error);
      return res.status(500).json({
        message: 'Failed to generate thank-you message',
        error: error.message,
      });
    }
  }
);

router.post(
  '/queue-analysis',
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    try {
      const { campaignId } = z.object({ campaignId: z.number() }).parse(req.body);

      const campaign = await db.query.fundingCampaigns.findFirst({
        where: eq(fundingCampaigns.id, campaignId),
      });

      if (!campaign) {
        return res.status(404).json({ message: 'Campaign not found' });
      }

      if (campaign.userId !== req.user?.id) {
        return res.status(403).json({ message: 'Not authorized to access this campaign' });
      }

      const job = await crowdfundingQueue.add(
        'comprehensive-analysis',
        {
          type: 'comprehensive-analysis',
          campaignId,
        },
        {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
        }
      );

      return res.json({
        success: true,
        message: 'Analysis queued successfully',
        jobId: job.id,
      });
    } catch (error: any) {
      console.error('[API] Error queuing analysis:', error);
      return res.status(500).json({
        message: 'Failed to queue analysis',
        error: error.message,
      });
    }
  }
);

export default router;
