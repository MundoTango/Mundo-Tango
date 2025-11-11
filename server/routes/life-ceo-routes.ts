/**
 * LIFE CEO ROUTES
 * API endpoints for 16 Life CEO agents (P66-P81)
 * Goals, Tasks, Recommendations, Domains
 */

import { Router } from "express";
import { authenticateToken } from "../middleware/auth";
import { storage } from "../storage";
import { insertLifeCeoGoalSchema, insertLifeCeoTaskSchema } from "@shared/schema";
import { lifeCeoAgents } from "../services/lifeCeoAgents";
import { lifeCeoOrchestrator } from "../services/lifeCeoOrchestrator";

const router = Router();

/**
 * GET /api/life-ceo/goals
 * Get all goals for current user
 */
router.get("/goals", authenticateToken, async (req, res) => {
  try {
    const userId = req.user!.id;
    const goals = await storage.getLifeCeoGoalsByUser(userId);
    res.json(goals);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/life-ceo/goals
 * Create a new goal
 */
router.post("/goals", authenticateToken, async (req, res) => {
  try {
    const userId = req.user!.id;
    const data = insertLifeCeoGoalSchema.parse({ ...req.body, userId });
    const goal = await storage.createLifeCeoGoal(data);
    res.status(201).json(goal);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * PUT /api/life-ceo/goals/:id
 * Update a goal
 */
router.put("/goals/:id", authenticateToken, async (req, res) => {
  try {
    const goalId = parseInt(req.params.id);
    const goal = await storage.updateLifeCeoGoal(goalId, req.body);
    
    if (!goal) {
      return res.status(404).json({ error: "Goal not found" });
    }
    
    res.json(goal);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /api/life-ceo/tasks
 * Get all tasks for current user
 */
router.get("/tasks", authenticateToken, async (req, res) => {
  try {
    const userId = req.user!.id;
    const tasks = await storage.getLifeCeoTasksByUser(userId);
    res.json(tasks);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/life-ceo/tasks
 * Create a new task
 */
router.post("/tasks", authenticateToken, async (req, res) => {
  try {
    const userId = req.user!.id;
    const data = insertLifeCeoTaskSchema.parse({ ...req.body, userId });
    const task = await storage.createLifeCeoTask(data);
    res.status(201).json(task);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * PUT /api/life-ceo/tasks/:id
 * Update a task
 */
router.put("/tasks/:id", authenticateToken, async (req, res) => {
  try {
    const taskId = parseInt(req.params.id);
    const task = await storage.updateLifeCeoTask(taskId, req.body);
    
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }
    
    res.json(task);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /api/life-ceo/recommendations
 * Get recommendations for current user
 */
router.get("/recommendations", authenticateToken, async (req, res) => {
  try {
    const userId = req.user!.id;
    const recommendations = await storage.getLifeCeoRecommendationsByUser(userId);
    res.json(recommendations);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/life-ceo/domains
 * Get all Life CEO domains
 */
router.get("/domains", authenticateToken, async (req, res) => {
  try {
    const domains = await storage.getAllLifeCeoDomains();
    res.json(domains);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// LIFE CEO AI AGENTS (16 specialized agents)
// ============================================================================

/**
 * GET /api/life-ceo/agents
 * Get all available Life CEO agents
 */
router.get("/agents", authenticateToken, async (req, res) => {
  try {
    const agents = lifeCeoAgents.getAllAgents();
    res.json(agents);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/life-ceo/agents/:agentId
 * Get specific agent details
 */
router.get("/agents/:agentId", authenticateToken, async (req, res) => {
  try {
    const agent = lifeCeoAgents.getAgent(req.params.agentId);
    
    if (!agent) {
      return res.status(404).json({ error: "Agent not found" });
    }
    
    res.json(agent);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/life-ceo/agents/:agentId/chat
 * Chat with a specific Life CEO agent
 */
router.post("/agents/:agentId/chat", authenticateToken, async (req, res) => {
  try {
    const userId = req.user!.id;
    const { agentId } = req.params;
    const { message, conversationHistory } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const response = await lifeCeoAgents.chat(
      userId,
      agentId,
      message,
      conversationHistory || []
    );

    res.json({ response });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/life-ceo/agents/:agentId/recommend
 * Get personalized recommendation from an agent
 */
router.post("/agents/:agentId/recommend", authenticateToken, async (req, res) => {
  try {
    const userId = req.user!.id;
    const { agentId } = req.params;
    const { context } = req.body;

    const recommendation = await lifeCeoAgents.getRecommendation(
      userId,
      agentId,
      context
    );

    res.json({ recommendation });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/life-ceo/coordinate
 * Use Life CEO Coordinator to orchestrate multiple agents
 */
router.post("/coordinate", authenticateToken, async (req, res) => {
  try {
    const userId = req.user!.id;
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({ error: "Question is required" });
    }

    const result = await lifeCeoAgents.coordinateAgents(userId, question);

    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/life-ceo/route
 * Intelligently route user query to best agent(s)
 */
router.post("/route", authenticateToken, async (req, res) => {
  try {
    const userId = req.user!.id;
    const { query, multi_agent } = req.body;

    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }

    const routing = await lifeCeoOrchestrator.routeToAgent(
      userId,
      query,
      multi_agent || false
    );

    res.json(routing);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/life-ceo/multi-agent
 * Execute multi-agent collaboration
 */
router.post("/multi-agent", authenticateToken, async (req, res) => {
  try {
    const userId = req.user!.id;
    const { query, agent_ids } = req.body;

    if (!query || !agent_ids || !Array.isArray(agent_ids)) {
      return res.status(400).json({ 
        error: "Query and agent_ids array are required" 
      });
    }

    const result = await lifeCeoOrchestrator.executeMultiAgent(
      userId,
      query,
      agent_ids
    );

    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/life-ceo/insights/daily
 * Get daily personalized insights from all agents
 */
router.get("/insights/daily", authenticateToken, async (req, res) => {
  try {
    const userId = req.user!.id;

    const insights = await lifeCeoOrchestrator.getDailyInsights(userId);

    res.json(insights);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
