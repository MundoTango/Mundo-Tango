/**
 * AI Guardrails API Routes (APPENDIX Q - BATCH 28)
 * Demonstrates integration of 7-layer guardrail system with API endpoints
 * 
 * @module AIGuardrailRoutes
 * @description Example API endpoints using guardrail middleware
 * 
 * Key Endpoints:
 * - POST /api/guardrails/validate - Pre-execution validation
 * - POST /api/guardrails/code/review - Code review with hallucination detection
 * - POST /api/guardrails/schema/update - Breaking change prevention
 * - POST /api/guardrails/feature/verify - Requirement verification
 * - GET /api/guardrails/violations - Get recent violations
 * - GET /api/guardrails/monitoring/alerts - Get monitoring alerts
 * - POST /api/guardrails/learn/{violationId} - Pattern learning from violations
 * 
 * @author ESA Intelligence Network
 * @version 1.0.0
 * @since 2025-01-12
 */

import { Router, type Request, type Response } from "express";
import { aiGuardrails } from "../services/quality/aiGuardrails";
import {
  preExecutionValidation,
  enforceCodeReview,
  detectHallucinations,
  preventBreakingChanges,
  verifyRequirements,
  fullGuardrailValidation,
} from "../middleware/aiGuardrailsMiddleware";
import { db } from "../../shared/db";
import { aiGuardrailViolations } from "../../shared/schema";
import { desc, eq } from "drizzle-orm";
import { logInfo, logError } from "../middleware/logger";

const router = Router();

/**
 * POST /api/guardrails/validate
 * Layer 1: Pre-execution validation
 * Validates requirements before AI starts coding
 * 
 * Body:
 * - requirement: string
 * - agentId: string
 * - feature?: string
 * - dependencies?: string[]
 */
router.post("/api/guardrails/validate", preExecutionValidation, async (req: Request, res: Response) => {
  try {
    const guardrailResults = (req as Request & { guardrailResults?: Record<string, unknown> }).guardrailResults;
    
    res.json({
      success: true,
      message: "Pre-execution validation passed",
      results: guardrailResults?.preExecution,
    });
  } catch (error) {
    logError(error as Error, { context: "Pre-execution validation endpoint" });
    res.status(500).json({
      error: "Validation failed",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * POST /api/guardrails/code/review
 * Layer 2 + Layer 3: Multi-AI code review + Hallucination detection
 * Reviews code for quality, patterns, and hallucinations
 * 
 * Body:
 * - code: string
 * - requirements?: string
 * - affectedFiles?: string[]
 * - agentId?: string
 * - feature?: string
 * - fileType?: 'typescript' | 'javascript' | 'tsx' | 'jsx' | 'json'
 */
router.post(
  "/api/guardrails/code/review",
  enforceCodeReview,
  detectHallucinations,
  async (req: Request, res: Response) => {
    try {
      const guardrailResults = (req as Request & { guardrailResults?: Record<string, unknown> }).guardrailResults;

      res.json({
        success: true,
        message: "Code review and hallucination detection passed",
        results: {
          codeReview: guardrailResults?.codeReview,
          hallucination: guardrailResults?.hallucination,
        },
      });
    } catch (error) {
      logError(error as Error, { context: "Code review endpoint" });
      res.status(500).json({
        error: "Code review failed",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
);

/**
 * POST /api/guardrails/schema/update
 * Layer 4: Breaking change prevention
 * Analyzes schema/API changes for breaking changes
 * 
 * Body:
 * - beforeCode?: string
 * - afterCode: string
 * - filePath: string
 * - migration?: { required: boolean, plan: string }
 */
router.post("/api/guardrails/schema/update", preventBreakingChanges, async (req: Request, res: Response) => {
  try {
    const guardrailResults = (req as Request & { guardrailResults?: Record<string, unknown> }).guardrailResults;

    res.json({
      success: true,
      message: "Breaking change analysis passed",
      results: guardrailResults?.breakingChange,
    });
  } catch (error) {
    logError(error as Error, { context: "Schema update endpoint" });
    res.status(500).json({
      error: "Schema update failed",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * POST /api/guardrails/feature/verify
 * Layer 5: Requirement verification
 * Verifies implementation matches requirements
 * 
 * Body:
 * - requirement: string
 * - implementation: string
 * - feature: string
 * - verificationCriteria?: string[]
 */
router.post("/api/guardrails/feature/verify", verifyRequirements, async (req: Request, res: Response) => {
  try {
    const guardrailResults = (req as Request & { guardrailResults?: Record<string, unknown> }).guardrailResults;

    res.json({
      success: true,
      message: "Requirement verification passed",
      results: guardrailResults?.requirementVerification,
    });
  } catch (error) {
    logError(error as Error, { context: "Feature verification endpoint" });
    res.status(500).json({
      error: "Feature verification failed",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * POST /api/guardrails/full-check
 * Combined: All applicable guardrail layers
 * Runs comprehensive validation with all guardrails
 * 
 * Query params:
 * - layers: comma-separated list of layers to run
 * 
 * Body: Depends on layers selected
 */
router.post(
  "/api/guardrails/full-check",
  fullGuardrailValidation(['preExecution', 'codeReview', 'hallucination']),
  async (req: Request, res: Response) => {
    try {
      const guardrailResults = (req as Request & { guardrailResults?: Record<string, unknown> }).guardrailResults;

      res.json({
        success: true,
        message: "All guardrail checks passed",
        results: guardrailResults,
      });
    } catch (error) {
      logError(error as Error, { context: "Full guardrail check endpoint" });
      res.status(500).json({
        error: "Guardrail check failed",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
);

/**
 * GET /api/guardrails/violations
 * Get recent guardrail violations
 * 
 * Query params:
 * - limit?: number (default: 20)
 * - layer?: string (filter by guardrail layer)
 * - severity?: string (filter by severity)
 */
router.get("/api/guardrails/violations", async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const layer = req.query.layer as string;
    const severity = req.query.severity as string;

    let query = db.select().from(aiGuardrailViolations);

    if (layer) {
      query = query.where(eq(aiGuardrailViolations.guardrailLayer, layer)) as typeof query;
    }

    if (severity) {
      query = query.where(eq(aiGuardrailViolations.severity, severity)) as typeof query;
    }

    const violations = await query.orderBy(desc(aiGuardrailViolations.detectedAt)).limit(limit);

    res.json({
      success: true,
      count: violations.length,
      violations,
    });
  } catch (error) {
    logError(error as Error, { context: "Get violations endpoint" });
    res.status(500).json({
      error: "Failed to fetch violations",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * GET /api/guardrails/monitoring/alerts
 * Layer 6: Get continuous monitoring alerts
 */
router.get("/api/guardrails/monitoring/alerts", async (req: Request, res: Response) => {
  try {
    const alerts = await aiGuardrails.layer6_continuousMonitoring();

    res.json({
      success: true,
      alertCount: alerts.length,
      alerts,
    });
  } catch (error) {
    logError(error as Error, { context: "Monitoring alerts endpoint" });
    res.status(500).json({
      error: "Failed to fetch monitoring alerts",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * POST /api/guardrails/learn/:violationId
 * Layer 7: Pattern learning from violation
 * 
 * Path params:
 * - violationId: number
 */
router.post("/api/guardrails/learn/:violationId", async (req: Request, res: Response) => {
  try {
    const violationId = parseInt(req.params.violationId);

    if (isNaN(violationId)) {
      res.status(400).json({ error: "Invalid violation ID" });
      return;
    }

    const learning = await aiGuardrails.layer7_patternLearning(violationId);

    res.json({
      success: true,
      patternExtracted: learning.patternExtracted,
      learning,
    });
  } catch (error) {
    logError(error as Error, { context: "Pattern learning endpoint" });
    res.status(500).json({
      error: "Pattern learning failed",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * GET /api/guardrails/stats
 * Get guardrail statistics
 */
router.get("/api/guardrails/stats", async (req: Request, res: Response) => {
  try {
    const [totalViolations] = await db
      .select()
      .from(aiGuardrailViolations);

    const violationsByLayer = await db
      .select()
      .from(aiGuardrailViolations);

    // Group by layer
    const layerCounts: Record<string, number> = {};
    const severityCounts: Record<string, number> = {};

    for (const v of violationsByLayer) {
      layerCounts[v.guardrailLayer] = (layerCounts[v.guardrailLayer] || 0) + 1;
      severityCounts[v.severity] = (severityCounts[v.severity] || 0) + 1;
    }

    res.json({
      success: true,
      stats: {
        totalViolations: violationsByLayer.length,
        byLayer: layerCounts,
        bySeverity: severityCounts,
      },
    });
  } catch (error) {
    logError(error as Error, { context: "Guardrail stats endpoint" });
    res.status(500).json({
      error: "Failed to fetch stats",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;
