/**
 * AI Arbitrage API Routes
 * 
 * Endpoints:
 * - POST /api/ai/smart-query - Intelligent routing with cascade execution
 * - POST /api/ai/feedback - Submit user feedback for DPO training
 * - GET /api/ai/cost-stats - Get cost dashboard and analytics
 */

import type { Express, Request, Response } from 'express';
import { z } from 'zod';
import { queryWithArbitrage } from '../services/ai/UnifiedAIOrchestrator';
import { CostTracker } from '../services/ai/CostTracker';
import { db } from '../db';
import { routingDecisions } from '@shared/schema';
import { eq } from 'drizzle-orm';

// ============================================================================
// ZOD SCHEMAS
// ============================================================================

const SmartQuerySchema = z.object({
  query: z.string().min(1, 'Query is required'),
  context: z.string().optional(),
  systemPrompt: z.string().optional(),
  temperature: z.number().min(0).max(2).optional().default(0.7),
  maxTokens: z.number().int().positive().optional().default(1000),
  userTier: z.enum(['free', 'basic', 'pro', 'enterprise']).optional(),
});

const FeedbackSchema = z.object({
  routingDecisionId: z.number().int().positive(),
  feedback: z.enum(['thumbs_up', 'thumbs_down', 'neutral']),
  comment: z.string().optional(),
});

const CostStatsQuerySchema = z.object({
  period: z.enum(['daily', 'monthly']).optional().default('monthly'),
  date: z.string().optional(), // YYYY-MM-DD or YYYY-MM
});

// ============================================================================
// ROUTE HANDLERS
// ============================================================================

/**
 * POST /api/ai/smart-query
 * Execute AI query with intelligent routing and cascade execution
 */
async function handleSmartQuery(req: Request, res: Response) {
  try {
    // Validate request body
    const body = SmartQuerySchema.parse(req.body);
    
    // Get userId from authenticated session
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: User not authenticated',
      });
    }

    console.log(`[AI Arbitrage] Smart query request from user ${userId}: "${body.query.slice(0, 100)}..."`);

    // Execute query with arbitrage
    const result = await queryWithArbitrage({
      query: body.query,
      context: body.context,
      userId,
      systemPrompt: body.systemPrompt,
      temperature: body.temperature,
      maxTokens: body.maxTokens,
      userTier: body.userTier,
    });

    console.log(
      `[AI Arbitrage] ✅ Query complete: Tier ${result.tierUsed} | ` +
      `${result.platform}/${result.model} | $${result.cost.toFixed(6)} | ${result.latency}ms`
    );

    res.json({
      success: true,
      data: {
        content: result.content,
        tier: result.tierUsed,
        platform: result.platform,
        model: result.model,
        confidence: result.confidence,
        cost: result.cost,
        latency: result.latency,
        escalated: result.escalated,
        escalationReason: result.escalationReason,
        classification: result.classification,
        budgetStatus: result.budgetStatus,
        routingDecisionId: result.routingDecisionId,
      },
    });
  } catch (error: any) {
    console.error('[AI Arbitrage] ❌ Smart query failed:', error);
    
    // Zod validation error
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid request body',
        details: error.errors,
      });
    }

    // Budget exceeded
    if (error.message?.includes('Budget exceeded')) {
      return res.status(429).json({
        success: false,
        error: 'Budget exceeded',
        message: error.message,
      });
    }

    // Generic error
    res.status(500).json({
      success: false,
      error: 'Smart query failed',
      message: error.message,
    });
  }
}

/**
 * POST /api/ai/feedback
 * Submit user feedback for routing decision (DPO training data)
 */
async function handleFeedback(req: Request, res: Response) {
  try {
    // Validate request body
    const body = FeedbackSchema.parse(req.body);
    
    // Get userId from authenticated session
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: User not authenticated',
      });
    }

    console.log(`[AI Arbitrage] Feedback from user ${userId} for decision ${body.routingDecisionId}: ${body.feedback}`);

    // Update routing decision with feedback
    const updated = await db
      .update(routingDecisions)
      .set({
        userFeedback: body.feedback,
        feedbackComment: body.comment || null,
      })
      .where(eq(routingDecisions.id, body.routingDecisionId))
      .returning();

    if (updated.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Routing decision not found',
      });
    }

    console.log(`[AI Arbitrage] ✅ Feedback recorded for decision ${body.routingDecisionId}`);

    res.json({
      success: true,
      message: 'Feedback recorded successfully',
    });
  } catch (error: any) {
    console.error('[AI Arbitrage] ❌ Feedback submission failed:', error);
    
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid request body',
        details: error.errors,
      });
    }

    res.status(500).json({
      success: false,
      error: 'Feedback submission failed',
      message: error.message,
    });
  }
}

/**
 * GET /api/ai/cost-stats
 * Get cost dashboard and analytics
 */
async function handleCostStats(req: Request, res: Response) {
  try {
    // Validate query params
    const query = CostStatsQuerySchema.parse(req.query);
    
    // Get userId from authenticated session
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: User not authenticated',
      });
    }

    console.log(`[AI Arbitrage] Cost stats request from user ${userId}: ${query.period}`);

    // Get budget status
    const budgetStatus = await CostTracker.checkBudget(userId);

    // Generate cost report
    const costReport = await CostTracker.generateReport(userId, query.period, query.date);

    console.log(`[AI Arbitrage] ✅ Cost stats retrieved for user ${userId}`);

    res.json({
      success: true,
      data: {
        budget: {
          tier: budgetStatus.tier,
          monthlyLimit: budgetStatus.monthlyLimit,
          currentSpend: budgetStatus.currentSpend,
          remaining: budgetStatus.remaining,
          percentageUsed: budgetStatus.percentageUsed,
          isOverBudget: budgetStatus.isOverBudget,
          isNearingLimit: budgetStatus.isNearingLimit,
          alertMessage: budgetStatus.alertMessage,
        },
        report: {
          period: costReport.period,
          totalSpend: costReport.totalSpend,
          requestCount: costReport.requestCount,
          totalTokens: costReport.totalTokens,
          avgCostPerRequest: costReport.avgCostPerRequest,
          topPlatforms: costReport.topPlatforms,
          topModels: costReport.topModels,
        },
      },
    });
  } catch (error: any) {
    console.error('[AI Arbitrage] ❌ Cost stats failed:', error);
    
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid query parameters',
        details: error.errors,
      });
    }

    res.status(500).json({
      success: false,
      error: 'Cost stats retrieval failed',
      message: error.message,
    });
  }
}

// ============================================================================
// ROUTE REGISTRATION
// ============================================================================

export function registerAIArbitrageRoutes(app: Express) {
  // Smart query endpoint
  app.post('/api/ai/smart-query', handleSmartQuery);

  // Feedback endpoint
  app.post('/api/ai/feedback', handleFeedback);

  // Cost stats endpoint
  app.get('/api/ai/cost-stats', handleCostStats);

  console.log('[AI Arbitrage] ✅ Routes registered: /api/ai/smart-query, /api/ai/feedback, /api/ai/cost-stats');
}
