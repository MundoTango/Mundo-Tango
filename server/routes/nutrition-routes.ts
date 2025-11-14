import { Router } from "express";
import { z } from "zod";
import {
  createEncryptedNutritionLog,
  getDecryptedNutritionLogs,
  createEncryptedFitnessActivity,
  getDecryptedFitnessActivities,
} from "../db/encrypted";

const router = Router();

// ============================================================================
// NUTRITION LOGS
// ============================================================================

// Create a new nutrition log
router.post("/api/nutrition/logs", async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const schema = z.object({
      date: z.string(),
      mealType: z.enum(["breakfast", "lunch", "dinner", "snack"]),
      foodName: z.string(),
      sensitiveData: z.object({
        calories: z.number(),
        protein: z.number().optional(),
        carbs: z.number().optional(),
        fat: z.number().optional(),
        fiber: z.number().optional(),
        sugar: z.number().optional(),
        notes: z.string().optional(),
      }),
    });

    const data = schema.parse(req.body);
    
    const log = await createEncryptedNutritionLog({
      userId: user.id,
      date: new Date(data.date),
      mealType: data.mealType,
      foodName: data.foodName,
      sensitiveData: data.sensitiveData,
    });

    res.json(log);
  } catch (error: any) {
    console.error("Error creating nutrition log:", error);
    res.status(400).json({ error: error.message });
  }
});

// Get nutrition logs for the authenticated user
router.get("/api/nutrition/logs", async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { startDate, endDate, mealType } = req.query;

    const filters: any = {};
    if (mealType) filters.mealType = mealType as string;
    if (startDate) filters.startDate = new Date(startDate as string);
    if (endDate) filters.endDate = new Date(endDate as string);

    const logs = await getDecryptedNutritionLogs(user.id, filters);
    res.json(logs);
  } catch (error: any) {
    console.error("Error fetching nutrition logs:", error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// FITNESS ACTIVITIES
// ============================================================================

// Create a new fitness activity
router.post("/api/fitness/activities", async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const schema = z.object({
      date: z.string(),
      activityType: z.string(),
      duration: z.number().optional(),
      sensitiveData: z.object({
        distance: z.number().optional(),
        pace: z.number().optional(),
        heartRate: z.number().optional(),
        calories: z.number().optional(),
        notes: z.string().optional(),
        route: z.any().optional(),
      }),
    });

    const data = schema.parse(req.body);
    
    const activity = await createEncryptedFitnessActivity({
      userId: user.id,
      date: new Date(data.date),
      activityType: data.activityType,
      duration: data.duration,
      sensitiveData: data.sensitiveData,
    });

    res.json(activity);
  } catch (error: any) {
    console.error("Error creating fitness activity:", error);
    res.status(400).json({ error: error.message });
  }
});

// Get fitness activities for the authenticated user
router.get("/api/fitness/activities", async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { startDate, endDate, activityType } = req.query;

    const filters: any = {};
    if (activityType) filters.activityType = activityType as string;
    if (startDate) filters.startDate = new Date(startDate as string);
    if (endDate) filters.endDate = new Date(endDate as string);

    const activities = await getDecryptedFitnessActivities(user.id, filters);
    res.json(activities);
  } catch (error: any) {
    console.error("Error fetching fitness activities:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
