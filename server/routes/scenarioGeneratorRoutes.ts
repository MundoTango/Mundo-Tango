/**
 * MB.MD v9.9.4 - Scenario Generator API Routes
 * Endpoints for generating comprehensive test scenarios
 */

import { Router, Response } from "express";
import { scenarioGenerator } from "../services/scenarioGenerator";
import { authenticateToken, AuthRequest } from "../middleware/auth";
import { requireMinimumRole } from "../middleware/tierEnforcement";

const router = Router();

const requireAdmin = requireMinimumRole(4);

/**
 * POST /api/scenarios/generate-all
 * Generate all comprehensive test scenarios (admin only)
 */
router.post("/generate-all", authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const count = await scenarioGenerator.generateAllScenarios(userId);
    res.json({ 
      success: true, 
      message: `Generated ${count} test scenarios`,
      count 
    });
  } catch (error: any) {
    console.error("Error generating scenarios:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/scenarios/domains
 * Get all domain categories and their scenarios
 */
router.get("/domains", async (req, res: Response) => {
  try {
    const domains = scenarioGenerator.getAllDomains();
    const summary = domains.map(d => ({
      name: d.name,
      priority: d.priority,
      scenarioCount: d.scenarios.length,
      scenarios: d.scenarios.map(s => ({
        title: s.title,
        difficulty: s.difficulty,
        estimatedMinutes: s.estimatedMinutes
      }))
    }));
    res.json(summary);
  } catch (error: any) {
    console.error("Error fetching domains:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/scenarios/coverage
 * Get testing coverage statistics
 */
router.get("/coverage", async (req, res: Response) => {
  try {
    const domains = scenarioGenerator.getAllDomains();
    const totalScenarios = domains.reduce((sum, d) => sum + d.scenarios.length, 0);
    
    const coverage = {
      totalDomains: domains.length,
      totalScenarios,
      byPriority: {
        'P0-CRITICAL': domains.filter(d => d.priority === 'P0-CRITICAL').reduce((s, d) => s + d.scenarios.length, 0),
        'P1-HIGH': domains.filter(d => d.priority === 'P1-HIGH').reduce((s, d) => s + d.scenarios.length, 0),
        'P2-MEDIUM': domains.filter(d => d.priority === 'P2-MEDIUM').reduce((s, d) => s + d.scenarios.length, 0),
        'P3-LOW': domains.filter(d => d.priority === 'P3-LOW').reduce((s, d) => s + d.scenarios.length, 0),
      },
      byDifficulty: {
        easy: domains.flatMap(d => d.scenarios).filter(s => s.difficulty === 'easy').length,
        medium: domains.flatMap(d => d.scenarios).filter(s => s.difficulty === 'medium').length,
        hard: domains.flatMap(d => d.scenarios).filter(s => s.difficulty === 'hard').length,
      },
      estimatedTotalMinutes: domains.flatMap(d => d.scenarios).reduce((s, sc) => s + (sc.estimatedMinutes || 0), 0)
    };
    
    res.json(coverage);
  } catch (error: any) {
    console.error("Error fetching coverage:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
