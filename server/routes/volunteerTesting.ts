/**
 * VOLUNTEER TESTING SYSTEM ROUTES
 * Endpoints for volunteer test scenarios, results tracking, and leaderboards
 */

import { Router, Response } from "express";
import { testScenarioService } from "../services/volunteer/testScenarioService";
import { testResultsService } from "../services/volunteer/testResultsService";
import { volunteerService } from "../services/volunteer/volunteerService";
import { authenticateToken, AuthRequest } from "../middleware/auth";
import { requireMinimumRole } from "../middleware/tierEnforcement";
import { insertUiTestScenarioSchema, insertUiTestResultSchema } from "@shared/schema";

const router = Router();

// Admin access for scenario management
const requireAdmin = requireMinimumRole(4);

/**
 * POST /api/volunteer/register
 * Register current user as a volunteer tester
 */
router.post("/register", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const volunteerId = await volunteerService.registerVolunteer(userId);
    res.json({ volunteerId, success: true });
  } catch (error: any) {
    console.error("Error registering volunteer:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/volunteer/scenarios
 * List all active test scenarios
 */
router.get("/scenarios", async (_req, res: Response) => {
  try {
    const scenarios = await testScenarioService.listActiveScenarios();
    res.json(scenarios);
  } catch (error: any) {
    console.error("Error fetching scenarios:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/volunteer/scenarios
 * Create a new test scenario (admin only)
 */
router.post("/scenarios", authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const validatedData = insertUiTestScenarioSchema.parse({
      ...req.body,
      createdBy: userId
    });

    const scenarioId = await testScenarioService.createScenario(validatedData);
    res.json({ scenarioId, success: true });
  } catch (error: any) {
    console.error("Error creating scenario:", error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /api/volunteer/scenarios/:id
 * Get scenario details by ID
 */
router.get("/scenarios/:id", async (req, res: Response) => {
  try {
    const scenarioId = parseInt(req.params.id);
    const scenario = await testScenarioService.getScenarioById(scenarioId);
    res.json(scenario);
  } catch (error: any) {
    console.error("Error fetching scenario:", error);
    res.status(404).json({ error: error.message });
  }
});

/**
 * POST /api/volunteer/results
 * Submit test results for a session
 */
router.post("/results", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const validatedData = insertUiTestResultSchema.parse({
      ...req.body,
      userId
    });

    const resultId = await testResultsService.submitResult(validatedData);

    const sessionResult = await testResultsService.detectStuckPoints(validatedData.sessionId);
    await volunteerService.updateStats(userId, validatedData as any);

    res.json({ 
      resultId, 
      stuckPoints: sessionResult,
      success: true 
    });
  } catch (error: any) {
    console.error("Error submitting results:", error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /api/volunteer/results/:scenarioId
 * Get all results for a specific scenario
 */
router.get("/results/:scenarioId", authenticateToken, requireAdmin, async (req, res: Response) => {
  try {
    const scenarioId = parseInt(req.params.scenarioId);
    const results = await testResultsService.getResultsByScenario(scenarioId);
    
    const completionRate = await testResultsService.calculateCompletionRate(scenarioId);
    const avgDifficulty = await testResultsService.getAverageDifficultyRating(scenarioId);
    const feedback = await testResultsService.getFeedbackForScenario(scenarioId);

    res.json({
      results,
      stats: {
        completionRate,
        avgDifficulty,
        feedbackCount: feedback.length
      },
      feedback
    });
  } catch (error: any) {
    console.error("Error fetching scenario results:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/volunteer/leaderboard
 * Get top volunteer testers leaderboard
 */
router.get("/leaderboard", async (req, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const leaderboard = await volunteerService.getVolunteerLeaderboard(limit);
    res.json(leaderboard);
  } catch (error: any) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/volunteer/stats/:userId
 * Get stats for a specific volunteer
 */
router.get("/stats/:userId", async (req, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    const stats = await volunteerService.getVolunteerStats(userId);
    
    if (!stats) {
      return res.status(404).json({ error: "Volunteer stats not found" });
    }

    res.json(stats);
  } catch (error: any) {
    console.error("Error fetching volunteer stats:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/volunteer/assign
 * Assign a scenario to a volunteer
 */
router.post("/assign", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { scenarioId } = req.body;
    if (!scenarioId) {
      return res.status(400).json({ error: "Scenario ID required" });
    }

    const sessionId = await volunteerService.assignScenario(userId, scenarioId);
    res.json({ sessionId, success: true });
  } catch (error: any) {
    console.error("Error assigning scenario:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/volunteer/stuck-points/:sessionId
 * Detect stuck points for a specific session
 */
router.get("/stuck-points/:sessionId", authenticateToken, async (req, res: Response) => {
  try {
    const { sessionId } = req.params;
    const stuckPoints = await testResultsService.detectStuckPoints(sessionId);
    res.json({ stuckPoints });
  } catch (error: any) {
    console.error("Error detecting stuck points:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/volunteer/seed-scenarios
 * Seed default test scenarios (admin only, one-time)
 */
router.post("/seed-scenarios", authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    await testScenarioService.seedDefaultScenarios(userId);
    res.json({ success: true, message: "Default scenarios seeded successfully" });
  } catch (error: any) {
    console.error("Error seeding scenarios:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
