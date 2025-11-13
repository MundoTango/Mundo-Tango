/**
 * FINANCIAL AGENTS API ROUTES
 * Control endpoints for the 33-agent Financial Management System
 */

import { Router, Request, Response } from "express";
import { Queue } from "bullmq";
import { storage } from "../storage";
import { authenticateToken, type AuthRequest } from "../middleware/auth";
import { Agent105_MasterOrchestrator } from "../services/financial/AgentOrchestrator";
import { RateLimitedAIOrchestrator } from "../services/ai/integration/rate-limited-orchestrator";

const router = Router();

// Initialize queues
const financialAgentQueue = new Queue("financial-agents", {
  connection: {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379")
  }
});

// Initialize orchestrator for direct status queries
const aiOrchestrator = new RateLimitedAIOrchestrator();
const masterOrchestrator = new Agent105_MasterOrchestrator(aiOrchestrator);

/**
 * POST /api/financial/agents/start
 * Start the 33-agent system with 30-second monitoring
 */
router.post("/start", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    console.log(`[Financial Agents API] Starting agent system for user ${userId}`);

    // Add system start job to queue
    const job = await financialAgentQueue.add("system-start", { userId });

    // Set up recurring 30-second monitoring (repeatable job)
    await financialAgentQueue.add(
      "monitoring-cycle",
      {
        userId,
        portfolioValue: 10000 // Default starting value
      },
      {
        repeat: {
          every: 30000 // 30 seconds
        },
        jobId: `monitoring-${userId}` // Unique ID to prevent duplicates
      }
    );

    console.log(`[Financial Agents API] ✅ System started and monitoring scheduled`);

    res.json({
      success: true,
      message: "Financial Management AI Agent System started. 30-second monitoring active.",
      jobId: job.id,
      agentsActive: 33
    });
  } catch (error) {
    console.error("[Financial Agents API] Error starting system:", error);
    res.status(500).json({
      error: "Failed to start agent system",
      message: (error as Error).message
    });
  }
});

/**
 * POST /api/financial/agents/stop
 * Stop the agent system and monitoring
 */
router.post("/stop", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    console.log(`[Financial Agents API] Stopping agent system for user ${userId}`);

    // Remove repeatable monitoring job
    await financialAgentQueue.removeRepeatable("monitoring-cycle", {
      every: 30000
    });

    // Add system stop job
    const job = await financialAgentQueue.add("system-stop", { userId });

    console.log(`[Financial Agents API] ✅ System stopped`);

    res.json({
      success: true,
      message: "Financial Management AI Agent System stopped.",
      jobId: job.id
    });
  } catch (error) {
    console.error("[Financial Agents API] Error stopping system:", error);
    res.status(500).json({
      error: "Failed to stop agent system",
      message: (error as Error).message
    });
  }
});

/**
 * GET /api/financial/agents/status
 * Get status of all 33 agents
 */
router.get("/status", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    console.log(`[Financial Agents API] Getting agent status for user ${userId}`);

    // Get system status
    const systemStatus = masterOrchestrator.getSystemStatus();
    const agentStatus = masterOrchestrator.getAgentStatus();

    // Get database records
    const dbAgents = await storage.getAllFinancialAgents();

    // Get recent decisions
    const recentDecisions = await storage.getFinancialAIDecisionsByUserId(userId);
    const last24Hours = recentDecisions.filter(d => 
      d.createdAt && d.createdAt >= new Date(Date.now() - 24 * 60 * 60 * 1000)
    );

    res.json({
      success: true,
      system: systemStatus,
      agents: agentStatus,
      databaseAgents: dbAgents.length,
      decisionsLast24h: last24Hours.length,
      timestamp: new Date()
    });
  } catch (error) {
    console.error("[Financial Agents API] Error getting status:", error);
    res.status(500).json({
      error: "Failed to get agent status",
      message: (error as Error).message
    });
  }
});

/**
 * POST /api/financial/agents/:id/override
 * Override a specific agent's status
 */
router.post("/:id/override", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const agentId = parseInt(req.params.id);
    const { status } = req.body; // 'active' or 'inactive'

    if (!status || (status !== 'active' && status !== 'inactive')) {
      return res.status(400).json({
        error: "Invalid status. Must be 'active' or 'inactive'"
      });
    }

    console.log(`[Financial Agents API] Overriding agent ${agentId} to ${status}`);

    // Add override job to queue
    const job = await financialAgentQueue.add("agent-override", {
      userId,
      agentId,
      status
    });

    res.json({
      success: true,
      message: `Agent #${agentId} set to ${status}`,
      jobId: job.id
    });
  } catch (error) {
    console.error("[Financial Agents API] Error overriding agent:", error);
    res.status(500).json({
      error: "Failed to override agent",
      message: (error as Error).message
    });
  }
});

/**
 * GET /api/financial/agents/decisions
 * Get all AI decisions with optional filters
 */
router.get("/decisions", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { limit = 100, agentId, action, symbol } = req.query;

    console.log(`[Financial Agents API] Getting decisions for user ${userId}`);

    // Get decisions from database
    let decisions = await storage.getFinancialAIDecisionsByUserId(userId);

    // Apply filters
    if (agentId) {
      decisions = decisions.filter(d => d.agentId === parseInt(agentId as string));
    }

    if (action) {
      decisions = decisions.filter(d => d.action === action);
    }

    if (symbol) {
      decisions = decisions.filter(d => d.symbol === symbol);
    }

    // Limit results
    decisions = decisions.slice(0, parseInt(limit as string));

    // Group by agent for summary
    const byAgent = decisions.reduce((acc, d) => {
      const agentKey = d.agentId.toString();
      if (!acc[agentKey]) {
        acc[agentKey] = [];
      }
      acc[agentKey].push(d);
      return acc;
    }, {} as Record<string, any[]>);

    res.json({
      success: true,
      total: decisions.length,
      decisions,
      byAgent,
      timestamp: new Date()
    });
  } catch (error) {
    console.error("[Financial Agents API] Error getting decisions:", error);
    res.status(500).json({
      error: "Failed to get decisions",
      message: (error as Error).message
    });
  }
});

/**
 * GET /api/financial/agents/decisions/:id
 * Get a specific decision by ID with detailed reasoning
 */
router.get("/decisions/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const decisionId = parseInt(req.params.id);

    console.log(`[Financial Agents API] Getting decision ${decisionId}`);

    const decision = await storage.getFinancialAIDecisionById(decisionId);

    if (!decision) {
      return res.status(404).json({
        error: "Decision not found"
      });
    }

    // Verify ownership
    if (decision.userId !== userId) {
      return res.status(403).json({
        error: "Unauthorized"
      });
    }

    res.json({
      success: true,
      decision,
      timestamp: new Date()
    });
  } catch (error) {
    console.error("[Financial Agents API] Error getting decision:", error);
    res.status(500).json({
      error: "Failed to get decision",
      message: (error as Error).message
    });
  }
});

/**
 * GET /api/financial/agents/performance
 * Get aggregated performance metrics across all agents
 */
router.get("/performance", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    console.log(`[Financial Agents API] Getting performance metrics for user ${userId}`);

    // Get all decisions
    const decisions = await storage.getFinancialAIDecisionsByUserId(userId);
    
    // Calculate metrics
    const totalDecisions = decisions.length;
    const executedDecisions = decisions.filter(d => d.executedAt !== null);
    const profitableDecisions = decisions.filter(d => 
      d.profitLoss && parseFloat(d.profitLoss) > 0
    );

    const totalProfit = decisions.reduce((sum, d) => {
      if (d.profitLoss) {
        return sum + parseFloat(d.profitLoss);
      }
      return sum;
    }, 0);

    const winRate = executedDecisions.length > 0 
      ? profitableDecisions.length / executedDecisions.length 
      : 0;

    // Group by action
    const actionCounts = {
      buy: decisions.filter(d => d.action === 'buy').length,
      sell: decisions.filter(d => d.action === 'sell').length,
      hold: decisions.filter(d => d.action === 'hold').length
    };

    // Get most active agents
    const agentActivity = decisions.reduce((acc, d) => {
      const key = d.agentId.toString();
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostActiveAgent = Object.entries(agentActivity)
      .sort(([, a], [, b]) => b - a)[0];

    res.json({
      success: true,
      performance: {
        totalDecisions,
        executedDecisions: executedDecisions.length,
        profitableDecisions: profitableDecisions.length,
        totalProfit,
        winRate,
        actionCounts,
        mostActiveAgent: mostActiveAgent 
          ? { agentId: parseInt(mostActiveAgent[0]), decisions: mostActiveAgent[1] }
          : null
      },
      timestamp: new Date()
    });
  } catch (error) {
    console.error("[Financial Agents API] Error getting performance:", error);
    res.status(500).json({
      error: "Failed to get performance metrics",
      message: (error as Error).message
    });
  }
});

export default router;
