import { Router } from "express";
import { z } from "zod";
import {
  createEncryptedHealthGoal,
  getDecryptedHealthGoals,
  createEncryptedHealthMetric,
  getDecryptedHealthMetrics,
} from "../db/encrypted";

const router = Router();

// ============================================================================
// HEALTH GOALS
// ============================================================================

// Create a new health goal
router.post("/api/health/goals", async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const schema = z.object({
      goalType: z.string(),
      title: z.string(),
      description: z.string().optional(),
      status: z.string().optional(),
      targetDate: z.string().optional(),
      sensitiveData: z.object({
        targetWeight: z.number().optional(),
        currentWeight: z.number().optional(),
        bmi: z.number().optional(),
        bodyFat: z.number().optional(),
        measurements: z.record(z.number()).optional(),
        notes: z.string().optional(),
      }),
    });

    const data = schema.parse(req.body);
    
    const goal = await createEncryptedHealthGoal({
      userId: user.id,
      goalType: data.goalType,
      title: data.title,
      description: data.description,
      status: data.status,
      targetDate: data.targetDate ? new Date(data.targetDate) : null,
      sensitiveData: data.sensitiveData,
    });

    res.json(goal);
  } catch (error: any) {
    console.error("Error creating health goal:", error);
    res.status(400).json({ error: error.message });
  }
});

// Get all health goals for the authenticated user
router.get("/api/health/goals", async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const goals = await getDecryptedHealthGoals(user.id);
    res.json(goals);
  } catch (error: any) {
    console.error("Error fetching health goals:", error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// HEALTH METRICS
// ============================================================================

// Create a new health metric
router.post("/api/health/metrics", async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const schema = z.object({
      date: z.string(),
      metricType: z.string(),
      sensitiveData: z.object({
        value: z.number(),
        unit: z.string(),
        notes: z.string().optional(),
        additionalData: z.record(z.any()).optional(),
      }),
    });

    const data = schema.parse(req.body);
    
    const metric = await createEncryptedHealthMetric({
      userId: user.id,
      date: new Date(data.date),
      metricType: data.metricType,
      sensitiveData: data.sensitiveData,
    });

    res.json(metric);
  } catch (error: any) {
    console.error("Error creating health metric:", error);
    res.status(400).json({ error: error.message });
  }
});

// Get health metrics for the authenticated user
router.get("/api/health/metrics", async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { metricType, startDate, endDate } = req.query;

    const filters: any = {};
    if (metricType) filters.metricType = metricType as string;
    if (startDate) filters.startDate = new Date(startDate as string);
    if (endDate) filters.endDate = new Date(endDate as string);

    const metrics = await getDecryptedHealthMetrics(user.id, filters);
    res.json(metrics);
  } catch (error: any) {
    console.error("Error fetching health metrics:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
