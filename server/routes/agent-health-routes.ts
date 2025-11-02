/**
 * BLOCKER 8: Agent Validation Protocol - API Routes
 * Health checks and validation for 134 ESA agents
 */

import { Router, type Response } from "express";
import { authenticateToken, type AuthRequest, requireRoleLevel } from "../middleware/auth";
import { AgentValidationService } from "../services/AgentValidationService";

const router = Router();

/**
 * GET /api/agents/health
 * Get health status for all agents
 */
router.get("/health", authenticateToken, requireRoleLevel(7), async (req: AuthRequest, res: Response) => {
  try {
    const healthStatuses = await AgentValidationService.getAllAgentHealth();
    res.json(healthStatuses);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/agents/:agentCode/health
 * Get health status for a specific agent
 */
router.get("/:agentCode/health", authenticateToken, requireRoleLevel(7), async (req: AuthRequest, res: Response) => {
  try {
    const { agentCode } = req.params;
    const health = await AgentValidationService.runHealthCheck(agentCode);
    res.json(health);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/agents/:agentCode/validate
 * Run validation check on a specific agent
 */
router.post("/:agentCode/validate", authenticateToken, requireRoleLevel(7), async (req: AuthRequest, res: Response) => {
  try {
    const { agentCode } = req.params;
    const { checkType } = req.body;

    if (!['availability', 'performance', 'integration', 'fallback'].includes(checkType)) {
      return res.status(400).json({ error: 'Invalid check type' });
    }

    const result = await AgentValidationService.runValidationCheck(checkType, agentCode);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/agents/health/batch
 * Run health checks on all agents (batch operation)
 */
router.post("/health/batch", authenticateToken, requireRoleLevel(7), async (req: AuthRequest, res: Response) => {
  try {
    const results = await AgentValidationService.runBatchHealthChecks();
    res.json({
      total: results.length,
      healthy: results.filter(r => r.status === 'healthy').length,
      degraded: results.filter(r => r.status === 'degraded').length,
      failing: results.filter(r => r.status === 'failing').length,
      offline: results.filter(r => r.status === 'offline').length,
      results,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/agents/validation/history
 * Get validation check history (all agents or specific agent)
 */
router.get("/validation/history", authenticateToken, requireRoleLevel(7), async (req: AuthRequest, res: Response) => {
  try {
    const { agentCode, limit } = req.query;
    const limitNum = limit ? parseInt(limit as string) : 50;
    
    const history = await AgentValidationService.getValidationHistory(
      agentCode as string | undefined,
      limitNum
    );
    
    res.json(history);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
