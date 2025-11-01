/**
 * LIFE CEO ROUTES
 * API endpoints for 16 Life CEO agents (P66-P81)
 * Goals, Tasks, Recommendations, Domains
 */

import { Router } from "express";
import { authenticateToken } from "../middleware/auth";
import { storage } from "../storage";
import { insertLifeCeoGoalSchema, insertLifeCeoTaskSchema } from "@shared/schema";

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

export default router;
