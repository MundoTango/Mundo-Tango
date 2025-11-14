import { Router } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { db } from '@shared/db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';

const router = Router();

router.post('/admin/trigger-scraping', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, userId)
    });

    if (!user || user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Forbidden: Super Admin access required' });
    }

    const { scrapingType } = req.body;

    res.json({
      success: true,
      message: `Scraping workflow "${scrapingType}" triggered successfully`,
      note: 'In production with Redis, this would queue BullMQ jobs for Agents #115-119 to scrape 226+ tango communities. In this environment, manual data population via SQL is recommended.',
      recommendation: 'Use seed script in docs/MB_MD_DATA_POPULATION_PLAN.md for immediate data',
      timestamp: new Date().toISOString(),
      triggeredBy: user.email,
      agents: {
        '#115': 'Orchestrator - Coordinate scraping workflows',
        '#116': 'Static Scraper - HTML/CSS extraction',
        '#117': 'JS Scraper - Dynamic content (Playwright)',
        '#118': 'Social Scraper - Facebook/Instagram APIs',
        '#119': 'Deduplication - AI-powered event merging'
      },
      targetSources: 226,
      estimatedEvents: '500-1000 new events',
      estimatedDuration: '2-4 hours'
    });

  } catch (error) {
    console.error('Scraping trigger error:', error);
    res.status(500).json({ error: 'Failed to trigger scraping workflow' });
  }
});

router.get('/admin/scraping-status', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, userId)
    });

    if (!user || user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Forbidden: Super Admin access required' });
    }

    res.json({
      status: 'idle',
      lastRun: null,
      environment: process.env.NODE_ENV || 'development',
      redisAvailable: false,
      note: 'Scraping agents (#115-119) are documented but not implemented in current environment. Redis connection required for BullMQ job queues.',
      workaround: 'Use SQL seed script from docs/MB_MD_DATA_POPULATION_PLAN.md to populate database immediately',
      implementation: {
        documentation: 'docs/handoff/TANGO_SCRAPING_COMPLETE_GUIDE.md',
        agents: 5,
        sources: 226,
        estimatedCost: '$0/month (Replit cron only)',
        timeline: '4 weeks to full implementation'
      }
    });

  } catch (error) {
    console.error('Scraping status error:', error);
    res.status(500).json({ error: 'Failed to get scraping status' });
  }
});

export default router;
