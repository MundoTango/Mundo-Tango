import { Router, type Request, Response } from "express";
import { learningCoordinator } from "../services/mrBlue/learningCoordinator";
import { errorAnalysisAgent } from "../services/mrBlue/errorAnalysisAgent";
import { solutionSuggesterAgent } from "../services/mrBlue/solutionSuggesterAgent";
import { db } from "@db";
import { sessionBugsFound } from "@shared/schema";
import { eq } from "drizzle-orm";

const router = Router();

// ============================================================================
// LEARNING COORDINATOR ROUTES
// ============================================================================

/**
 * POST /api/learning/coordinator/analyze
 * Analyze user feedback from any pathway
 */
router.post("/coordinator/analyze", async (req: Request, res: Response) => {
  try {
    const { userId, feedback } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    if (!feedback) {
      return res.status(400).json({
        success: false,
        message: "feedback is required",
      });
    }

    await learningCoordinator.analyzeFeedback(userId, feedback);

    res.json({
      success: true,
      message: "Feedback analyzed and stored",
    });
  } catch (error: any) {
    console.error('[Learning Intelligence] Analyze error:', error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to analyze feedback",
    });
  }
});

/**
 * GET /api/learning/coordinator/report/:userId
 * Generate comprehensive learning report
 */
router.get("/coordinator/report/:userId", async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);

    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid userId",
      });
    }

    const report = await learningCoordinator.generateReport(userId);

    res.json({
      success: true,
      report,
    });
  } catch (error: any) {
    console.error('[Learning Intelligence] Report error:', error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to generate report",
    });
  }
});

/**
 * GET /api/learning/coordinator/synthesize
 * Synthesize learnings across all pathways
 */
router.get("/coordinator/synthesize", async (req: Request, res: Response) => {
  try {
    const insights = await learningCoordinator.synthesizeLearnings();

    res.json({
      success: true,
      insights,
      totalInsights: insights.length,
      criticalInsights: insights.filter(i => i.severity === 'critical').length,
    });
  } catch (error: any) {
    console.error('[Learning Intelligence] Synthesize error:', error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to synthesize learnings",
    });
  }
});

/**
 * GET /api/learning/coordinator/improvements
 * Get prioritized list of improvements
 */
router.get("/coordinator/improvements", async (req: Request, res: Response) => {
  try {
    const improvements = await learningCoordinator.prioritizeImprovements();

    res.json({
      success: true,
      improvements,
    });
  } catch (error: any) {
    console.error('[Learning Intelligence] Improvements error:', error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to prioritize improvements",
    });
  }
});

// ============================================================================
// ERROR ANALYSIS ROUTES
// ============================================================================

/**
 * POST /api/learning/errors/analyze/:bugId
 * Analyze and categorize a bug
 */
router.post("/errors/analyze/:bugId", async (req: Request, res: Response) => {
  try {
    const bugId = parseInt(req.params.bugId);

    if (isNaN(bugId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid bugId",
      });
    }

    // Get bug from database
    const [bug] = await db
      .select()
      .from(sessionBugsFound)
      .where(eq(sessionBugsFound.id, bugId));

    if (!bug) {
      return res.status(404).json({
        success: false,
        message: "Bug not found",
      });
    }

    // Categorize and find similar bugs
    const [category, similarBugs] = await Promise.all([
      errorAnalysisAgent.categorizeBug(bug),
      errorAnalysisAgent.findSimilarBugs(bugId),
    ]);

    res.json({
      success: true,
      bug,
      category,
      similarBugs,
    });
  } catch (error: any) {
    console.error('[Learning Intelligence] Error analysis error:', error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to analyze error",
    });
  }
});

/**
 * POST /api/learning/errors/predict-severity
 * Predict severity of a bug description
 */
router.post("/errors/predict-severity", async (req: Request, res: Response) => {
  try {
    const { description } = req.body;

    if (!description) {
      return res.status(400).json({
        success: false,
        message: "description is required",
      });
    }

    const severity = await errorAnalysisAgent.predictSeverity(description);

    res.json({
      success: true,
      severity,
    });
  } catch (error: any) {
    console.error('[Learning Intelligence] Predict severity error:', error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to predict severity",
    });
  }
});

/**
 * GET /api/learning/errors/statistics
 * Get bug statistics and trends
 */
router.get("/errors/statistics", async (req: Request, res: Response) => {
  try {
    const statistics = await errorAnalysisAgent.getBugStatistics();

    res.json({
      success: true,
      statistics,
    });
  } catch (error: any) {
    console.error('[Learning Intelligence] Statistics error:', error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get statistics",
    });
  }
});

/**
 * POST /api/learning/errors/patterns
 * Analyze patterns across multiple bugs
 */
router.post("/errors/patterns", async (req: Request, res: Response) => {
  try {
    const { bugIds } = req.body;

    if (!bugIds || !Array.isArray(bugIds)) {
      return res.status(400).json({
        success: false,
        message: "bugIds array is required",
      });
    }

    // Get bugs from database
    const bugs = await db
      .select()
      .from(sessionBugsFound);

    const filteredBugs = bugIds.length > 0 
      ? bugs.filter((b: any) => bugIds.includes(b.id))
      : bugs;

    const patterns = await errorAnalysisAgent.analyzeBugPatterns(filteredBugs);

    res.json({
      success: true,
      patterns,
    });
  } catch (error: any) {
    console.error('[Learning Intelligence] Patterns error:', error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to analyze patterns",
    });
  }
});

// ============================================================================
// SOLUTION SUGGESTER ROUTES
// ============================================================================

/**
 * POST /api/learning/solutions/suggest/:bugId
 * Get AI-generated fix suggestion for a bug
 */
router.post("/solutions/suggest/:bugId", async (req: Request, res: Response) => {
  try {
    const bugId = parseInt(req.params.bugId);

    if (isNaN(bugId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid bugId",
      });
    }

    const suggestion = await solutionSuggesterAgent.suggestFix(bugId);

    res.json({
      success: true,
      suggestion,
    });
  } catch (error: any) {
    console.error('[Learning Intelligence] Suggest fix error:', error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to suggest fix",
    });
  }
});

/**
 * POST /api/learning/solutions/test-case/:bugId
 * Generate Playwright test case for a bug
 */
router.post("/solutions/test-case/:bugId", async (req: Request, res: Response) => {
  try {
    const bugId = parseInt(req.params.bugId);

    if (isNaN(bugId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid bugId",
      });
    }

    const [bug] = await db
      .select()
      .from(sessionBugsFound)
      .where(eq(sessionBugsFound.id, bugId));

    if (!bug) {
      return res.status(404).json({
        success: false,
        message: "Bug not found",
      });
    }

    const testCase = await solutionSuggesterAgent.generateTestCase(bug);

    res.json({
      success: true,
      testCase,
    });
  } catch (error: any) {
    console.error('[Learning Intelligence] Test case error:', error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to generate test case",
    });
  }
});

/**
 * POST /api/learning/solutions/estimate/:bugId
 * Estimate effort to fix a bug
 */
router.post("/solutions/estimate/:bugId", async (req: Request, res: Response) => {
  try {
    const bugId = parseInt(req.params.bugId);

    if (isNaN(bugId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid bugId",
      });
    }

    const estimate = await solutionSuggesterAgent.estimateEffort(bugId);

    res.json({
      success: true,
      estimate,
    });
  } catch (error: any) {
    console.error('[Learning Intelligence] Estimate error:', error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to estimate effort",
    });
  }
});

/**
 * POST /api/learning/solutions/alternatives/:bugId
 * Generate alternative fix approaches
 */
router.post("/solutions/alternatives/:bugId", async (req: Request, res: Response) => {
  try {
    const bugId = parseInt(req.params.bugId);

    if (isNaN(bugId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid bugId",
      });
    }

    const alternatives = await solutionSuggesterAgent.generateAlternativeFixes(bugId);

    res.json({
      success: true,
      alternatives,
    });
  } catch (error: any) {
    console.error('[Learning Intelligence] Alternatives error:', error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to generate alternatives",
    });
  }
});

/**
 * POST /api/learning/solutions/validate/:bugId
 * Validate a proposed fix
 */
router.post("/solutions/validate/:bugId", async (req: Request, res: Response) => {
  try {
    const bugId = parseInt(req.params.bugId);
    const { proposedFix } = req.body;

    if (isNaN(bugId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid bugId",
      });
    }

    if (!proposedFix) {
      return res.status(400).json({
        success: false,
        message: "proposedFix is required",
      });
    }

    const validation = await solutionSuggesterAgent.validateFix(bugId, proposedFix);

    res.json({
      success: true,
      validation,
    });
  } catch (error: any) {
    console.error('[Learning Intelligence] Validate error:', error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to validate fix",
    });
  }
});

// ============================================================================
// PATHWAY STATUS ROUTES
// ============================================================================

/**
 * GET /api/learning/pathways/status
 * Get status of all 10 learning pathways
 */
router.get("/pathways/status", async (req: Request, res: Response) => {
  try {
    const status = await learningCoordinator.getPathwayStatus();

    res.json({
      success: true,
      pathways: status,
      totalPathways: status.length,
      activePathways: status.filter(p => p.status === 'active').length,
    });
  } catch (error: any) {
    console.error('[Learning Intelligence] Pathways status error:', error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get pathways status",
    });
  }
});

export default router;
