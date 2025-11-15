import { Router } from 'express';
import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { contentGenerator } from '../services/social/ContentGenerator';
import { postingTimeOptimizer } from '../services/social/PostingTimeOptimizer';
import { engagementAnalyzer } from '../services/social/EngagementAnalyzer';
import { marketingAssistant } from '../services/social/MarketingAssistant';
import { socialMediaOrchestrator } from '../services/social/SocialMediaOrchestrator';
import type { SocialMediaJobData } from '../workers/socialMediaAgentWorker';

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

const socialMediaQueue = connection ? new Queue<SocialMediaJobData>('social-media-agents', { connection }) : null;

router.post('/generate-content', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { topic, imageUrl, platforms, tone, language, length, includeHashtags, includeEmojis } = req.body;

    const result = await contentGenerator.generateContent({
      userId,
      topic,
      imageUrl,
      platforms: platforms || ['instagram', 'facebook'],
      tone: tone || 'casual',
      language: language || 'en',
      length: length || 'medium',
      includeHashtags: includeHashtags !== false,
      includeEmojis: includeEmojis !== false,
    });

    res.json(result);
  } catch (error: any) {
    console.error('[SocialMediaAgents] Generate content error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate content' });
  }
});

router.post('/optimize-timing', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { platform, timezone, eventDate, contentType } = req.body;

    const result = await postingTimeOptimizer.optimizePostingTime({
      userId,
      platform: platform || 'instagram',
      timezone,
      eventDate: eventDate ? new Date(eventDate) : undefined,
      contentType,
    });

    res.json(result);
  } catch (error: any) {
    console.error('[SocialMediaAgents] Optimize timing error:', error);
    res.status(500).json({ error: error.message || 'Failed to optimize posting time' });
  }
});

router.post('/schedule-campaign', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { workflowType, data } = req.body;

    const result = await socialMediaOrchestrator.executeWorkflow({
      userId,
      workflowType: workflowType || 'full-campaign',
      data: data || {},
    });

    res.json(result);
  } catch (error: any) {
    console.error('[SocialMediaAgents] Schedule campaign error:', error);
    res.status(500).json({ error: error.message || 'Failed to schedule campaign' });
  }
});

router.get('/engagement', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { startDate, endDate, detailed } = req.query;

    const dateRange = startDate && endDate
      ? {
          start: new Date(startDate as string),
          end: new Date(endDate as string),
        }
      : undefined;

    const metrics = await engagementAnalyzer.analyzeEngagement(userId, dateRange);

    if (detailed === 'true') {
      const performance = await engagementAnalyzer.analyzeContentPerformance(userId, 30);
      const trends = await engagementAnalyzer.detectTrends(userId);
      const insights = await engagementAnalyzer.getAudienceInsights(userId);

      return res.json({
        metrics,
        performance,
        trends,
        insights,
      });
    }

    res.json(metrics);
  } catch (error: any) {
    console.error('[SocialMediaAgents] Get engagement error:', error);
    res.status(500).json({ error: error.message || 'Failed to retrieve engagement data' });
  }
});

router.post('/analyze-strategy', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { objective, platforms, budget, duration } = req.body;

    if (!objective || !platforms || !Array.isArray(platforms)) {
      return res.status(400).json({ error: 'Objective and platforms are required' });
    }

    const strategy = await marketingAssistant.generateCampaignStrategy(
      userId,
      objective,
      platforms,
      budget,
      duration
    );

    const opportunities = await marketingAssistant.identifyGrowthOpportunities(userId);
    const abTests = await marketingAssistant.recommendABTests(userId);
    const roi = await marketingAssistant.calculateROI(userId);

    res.json({
      strategy,
      opportunities: opportunities.slice(0, 5),
      abTests: abTests.slice(0, 3),
      roi,
    });
  } catch (error: any) {
    console.error('[SocialMediaAgents] Analyze strategy error:', error);
    res.status(500).json({ error: error.message || 'Failed to analyze strategy' });
  }
});

router.get('/status', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const status = await socialMediaOrchestrator.getSystemStatus();

    const queueMetrics = await socialMediaQueue.getJobCounts();

    res.json({
      ...status,
      queueMetrics: {
        waiting: queueMetrics.waiting,
        active: queueMetrics.active,
        completed: queueMetrics.completed,
        failed: queueMetrics.failed,
      },
      timestamp: new Date(),
    });
  } catch (error: any) {
    console.error('[SocialMediaAgents] Get status error:', error);
    res.status(500).json({ error: error.message || 'Failed to retrieve system status' });
  }
});

router.post('/publish-now', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    await socialMediaQueue.add('publish-scheduled', {
      jobType: 'publish-scheduled',
      userId,
    });

    res.json({ message: 'Publishing job queued' });
  } catch (error: any) {
    console.error('[SocialMediaAgents] Publish now error:', error);
    res.status(500).json({ error: error.message || 'Failed to queue publishing job' });
  }
});

router.post('/daily-report', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const report = await socialMediaOrchestrator.generateDailyReport(userId);

    res.json(report);
  } catch (error: any) {
    console.error('[SocialMediaAgents] Daily report error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate daily report' });
  }
});

router.get('/crisis-alerts', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const alerts = await marketingAssistant.detectCrisis(userId);

    res.json({ alerts });
  } catch (error: any) {
    console.error('[SocialMediaAgents] Crisis alerts error:', error);
    res.status(500).json({ error: error.message || 'Failed to detect crisis alerts' });
  }
});

router.get('/growth-opportunities', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const opportunities = await marketingAssistant.identifyGrowthOpportunities(userId);

    res.json({ opportunities });
  } catch (error: any) {
    console.error('[SocialMediaAgents] Growth opportunities error:', error);
    res.status(500).json({ error: error.message || 'Failed to identify growth opportunities' });
  }
});

export default router;
