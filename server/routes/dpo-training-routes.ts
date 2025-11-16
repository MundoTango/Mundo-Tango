/**
 * DPO Training & AI Learning Systems API Routes
 * 
 * Endpoints:
 * - POST /api/ai/dpo/train - Trigger DPO training cycle
 * - POST /api/ai/dpo/feedback - Record user feedback on routing decision
 * - GET /api/ai/dpo/stats - Get DPO training statistics
 * - GET /api/ai/curriculum/level/:userId - Get user's curriculum level
 * - POST /api/ai/curriculum/adjust - Adjust difficulty based on task result
 * - GET /api/ai/curriculum/stats/:userId - Get curriculum statistics
 * - POST /api/ai/gepa/run-cycle - Trigger GEPA evolution cycle
 * - GET /api/ai/gepa/experiments - Get running experiments
 * - POST /api/ai/gepa/select-best - Select best strategy from A/B tests
 * - GET /api/ai/limi/golden-examples - Get curated golden examples
 * - POST /api/ai/limi/auto-curate - Auto-curate from recent decisions
 * - GET /api/ai/limi/diversity - Get diversity report
 * - GET /api/ai/learning/stats - Complete learning system dashboard
 * 
 * Security: Admin-only access for training/evolution endpoints
 */

import type { Express, Request, Response } from 'express';
import { z } from 'zod';
import { DPOTrainer } from '../services/ai/DPOTrainer';
import { CurriculumManager } from '../services/ai/CurriculumManager';
import { GEPAEvolver } from '../services/ai/GEPAEvolver';
import { LIMICurator } from '../services/ai/LIMICurator';
import { db } from '../db';
import { routingDecisions } from '@shared/schema';
import { eq } from 'drizzle-orm';

// ============================================================================
// ZOD SCHEMAS
// ============================================================================

const FeedbackSchema = z.object({
  routingDecisionId: z.number().int().positive(),
  feedback: z.enum(['thumbs_up', 'thumbs_down', 'neutral']),
  comment: z.string().optional(),
});

const AdjustDifficultySchema = z.object({
  userId: z.number().int().positive(),
  result: z.enum(['success', 'failure']),
});

const AutoCurateSchema = z.object({
  limit: z.number().int().positive().max(100).optional().default(50),
});

// ============================================================================
// MIDDLEWARE
// ============================================================================

/**
 * Require admin access for sensitive endpoints
 */
function requireAdmin(req: Request, res: Response, next: Function) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: User not authenticated',
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Forbidden: Admin access required',
    });
  }

  next();
}

// ============================================================================
// DPO TRAINING ROUTES
// ============================================================================

/**
 * POST /api/ai/dpo/train
 * Trigger DPO training cycle (admin only)
 */
async function handleDPOTrain(req: Request, res: Response) {
  try {
    console.log('[DPO Routes] Triggering DPO training cycle...');

    const result = await DPOTrainer.trainFromFeedback();

    res.json({
      success: true,
      data: {
        accuracy: result.accuracy,
        pairsTrained: result.pairsTrained,
        message: `Training complete: ${(result.accuracy * 100).toFixed(2)}% accuracy on ${result.pairsTrained} pairs`,
      },
    });
  } catch (error: any) {
    console.error('[DPO Routes] ❌ Training failed:', error);
    res.status(500).json({
      success: false,
      error: 'DPO training failed',
      message: error.message,
    });
  }
}

/**
 * POST /api/ai/dpo/feedback
 * Record user feedback on routing decision
 */
async function handleDPOFeedback(req: Request, res: Response) {
  try {
    const body = FeedbackSchema.parse(req.body);

    await DPOTrainer.recordFeedback(
      body.routingDecisionId,
      body.feedback,
      body.comment
    );

    res.json({
      success: true,
      message: 'Feedback recorded successfully',
    });
  } catch (error: any) {
    console.error('[DPO Routes] ❌ Feedback recording failed:', error);

    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid request body',
        details: error.errors,
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to record feedback',
      message: error.message,
    });
  }
}

/**
 * GET /api/ai/dpo/stats
 * Get DPO training statistics
 */
async function handleDPOStats(req: Request, res: Response) {
  try {
    const stats = await DPOTrainer.getStats();

    res.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    console.error('[DPO Routes] ❌ Failed to get stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get DPO stats',
      message: error.message,
    });
  }
}

// ============================================================================
// CURRICULUM LEARNING ROUTES
// ============================================================================

/**
 * GET /api/ai/curriculum/level/:userId
 * Get user's current curriculum level
 */
async function handleGetCurriculumLevel(req: Request, res: Response) {
  try {
    const userId = parseInt(req.params.userId);

    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid userId parameter',
      });
    }

    const level = await CurriculumManager.getCurrentLevel(userId);
    const config = CurriculumManager.getLevelConfig(level.level as any);

    res.json({
      success: true,
      data: {
        level: level.level,
        successRate: parseFloat(level.successRate),
        taskCount: level.taskCount,
        consecutiveSuccesses: level.consecutiveSuccesses,
        consecutiveFailures: level.consecutiveFailures,
        config,
      },
    });
  } catch (error: any) {
    console.error('[Curriculum Routes] ❌ Failed to get level:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get curriculum level',
      message: error.message,
    });
  }
}

/**
 * POST /api/ai/curriculum/adjust
 * Adjust difficulty based on task result
 */
async function handleAdjustDifficulty(req: Request, res: Response) {
  try {
    const body = AdjustDifficultySchema.parse(req.body);

    const result = await CurriculumManager.adjustDifficulty(
      body.userId,
      body.result
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('[Curriculum Routes] ❌ Failed to adjust difficulty:', error);

    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid request body',
        details: error.errors,
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to adjust difficulty',
      message: error.message,
    });
  }
}

/**
 * GET /api/ai/curriculum/stats/:userId
 * Get curriculum statistics for user
 */
async function handleGetCurriculumStats(req: Request, res: Response) {
  try {
    const userId = parseInt(req.params.userId);

    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid userId parameter',
      });
    }

    const stats = await CurriculumManager.getStats(userId);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    console.error('[Curriculum Routes] ❌ Failed to get stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get curriculum stats',
      message: error.message,
    });
  }
}

// ============================================================================
// GEPA EVOLUTION ROUTES
// ============================================================================

/**
 * POST /api/ai/gepa/run-cycle
 * Trigger GEPA evolution cycle (admin only)
 */
async function handleGEPARunCycle(req: Request, res: Response) {
  try {
    console.log('[GEPA Routes] Triggering evolution cycle...');

    const result = await GEPAEvolver.runEvolutionCycle();

    res.json({
      success: true,
      data: {
        analysis: result.analysis,
        proposals: result.proposals,
        experiments: result.experiments,
        message: `Evolution cycle complete: ${result.proposals.length} proposals, ${result.experiments.length} experiments created`,
      },
    });
  } catch (error: any) {
    console.error('[GEPA Routes] ❌ Evolution cycle failed:', error);
    res.status(500).json({
      success: false,
      error: 'GEPA evolution cycle failed',
      message: error.message,
    });
  }
}

/**
 * GET /api/ai/gepa/experiments
 * Get running experiments
 */
async function handleGetGEPAExperiments(req: Request, res: Response) {
  try {
    const { gepaExperiments } = await import('@shared/schema');
    const { desc } = await import('drizzle-orm');

    const experiments = await db
      .select()
      .from(gepaExperiments)
      .orderBy(desc(gepaExperiments.startedAt))
      .limit(50);

    res.json({
      success: true,
      data: experiments,
    });
  } catch (error: any) {
    console.error('[GEPA Routes] ❌ Failed to get experiments:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get experiments',
      message: error.message,
    });
  }
}

/**
 * POST /api/ai/gepa/select-best
 * Select best strategy from A/B tests (admin only)
 */
async function handleGEPASelectBest(req: Request, res: Response) {
  try {
    console.log('[GEPA Routes] Selecting best strategy from A/B tests...');

    const result = await GEPAEvolver.selectBestStrategy();

    if (!result) {
      return res.json({
        success: true,
        data: null,
        message: 'No running experiments found',
      });
    }

    res.json({
      success: true,
      data: result,
      message: `Best strategy selected: ${result.winner} (confidence: ${(result.confidenceLevel * 100).toFixed(0)}%)`,
    });
  } catch (error: any) {
    console.error('[GEPA Routes] ❌ Failed to select best strategy:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to select best strategy',
      message: error.message,
    });
  }
}

// ============================================================================
// LIMI CURATION ROUTES
// ============================================================================

/**
 * GET /api/ai/limi/golden-examples
 * Get curated golden examples
 */
async function handleGetGoldenExamples(req: Request, res: Response) {
  try {
    const examples = await LIMICurator.getTrainingDataset();
    const progress = await LIMICurator.getProgress();

    res.json({
      success: true,
      data: {
        examples,
        progress,
      },
    });
  } catch (error: any) {
    console.error('[LIMI Routes] ❌ Failed to get golden examples:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get golden examples',
      message: error.message,
    });
  }
}

/**
 * POST /api/ai/limi/auto-curate
 * Auto-curate golden examples from recent decisions (admin only)
 */
async function handleAutoCurate(req: Request, res: Response) {
  try {
    const body = AutoCurateSchema.parse(req.body);

    console.log(`[LIMI Routes] Auto-curating from ${body.limit} recent decisions...`);

    const examples = await LIMICurator.autoCurate(body.limit);

    res.json({
      success: true,
      data: {
        examples,
        count: examples.length,
        message: `Auto-curated ${examples.length} golden examples`,
      },
    });
  } catch (error: any) {
    console.error('[LIMI Routes] ❌ Auto-curation failed:', error);

    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid request body',
        details: error.errors,
      });
    }

    res.status(500).json({
      success: false,
      error: 'Auto-curation failed',
      message: error.message,
    });
  }
}

/**
 * GET /api/ai/limi/diversity
 * Get diversity report
 */
async function handleGetDiversity(req: Request, res: Response) {
  try {
    const report = await LIMICurator.getDiversityReport();

    res.json({
      success: true,
      data: report,
    });
  } catch (error: any) {
    console.error('[LIMI Routes] ❌ Failed to get diversity report:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get diversity report',
      message: error.message,
    });
  }
}

// ============================================================================
// LEARNING SYSTEM DASHBOARD
// ============================================================================

/**
 * GET /api/ai/learning/stats
 * Complete learning system health dashboard
 */
async function handleGetLearningStats(req: Request, res: Response) {
  try {
    console.log('[Learning Routes] Fetching complete learning system stats...');

    // Fetch all stats in parallel
    const [dpoStats, limiProgress, limiDiversity] = await Promise.all([
      DPOTrainer.getStats(),
      LIMICurator.getProgress(),
      LIMICurator.getDiversityReport(),
    ]);

    res.json({
      success: true,
      data: {
        dpo: dpoStats,
        limi: {
          progress: limiProgress,
          diversity: limiDiversity,
        },
        summary: {
          dpoAccuracy: (dpoStats.accuracy * 100).toFixed(2) + '%',
          trainingPairs: dpoStats.trainingPairs,
          goldenExamples: `${limiProgress.current}/${limiProgress.target}`,
          coverage: `${limiDiversity.coverage.toFixed(0)}%`,
        },
      },
    });
  } catch (error: any) {
    console.error('[Learning Routes] ❌ Failed to get learning stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get learning stats',
      message: error.message,
    });
  }
}

// ============================================================================
// ROUTE REGISTRATION
// ============================================================================

export function registerDPOTrainingRoutes(app: Express) {
  console.log('[DPO Routes] Registering AI learning routes...');

  // DPO Training
  app.post('/api/ai/dpo/train', requireAdmin, handleDPOTrain);
  app.post('/api/ai/dpo/feedback', handleDPOFeedback);
  app.get('/api/ai/dpo/stats', handleDPOStats);

  // Curriculum Learning
  app.get('/api/ai/curriculum/level/:userId', handleGetCurriculumLevel);
  app.post('/api/ai/curriculum/adjust', handleAdjustDifficulty);
  app.get('/api/ai/curriculum/stats/:userId', handleGetCurriculumStats);

  // GEPA Evolution
  app.post('/api/ai/gepa/run-cycle', requireAdmin, handleGEPARunCycle);
  app.get('/api/ai/gepa/experiments', handleGetGEPAExperiments);
  app.post('/api/ai/gepa/select-best', requireAdmin, handleGEPASelectBest);

  // LIMI Curation
  app.get('/api/ai/limi/golden-examples', handleGetGoldenExamples);
  app.post('/api/ai/limi/auto-curate', requireAdmin, handleAutoCurate);
  app.get('/api/ai/limi/diversity', handleGetDiversity);

  // Dashboard
  app.get('/api/ai/learning/stats', handleGetLearningStats);

  console.log('[DPO Routes] ✅ AI learning routes registered');
}
