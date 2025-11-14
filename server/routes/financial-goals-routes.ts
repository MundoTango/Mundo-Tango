import { Router } from "express";
import { z } from "zod";
import {
  createEncryptedFinancialGoal,
  getDecryptedFinancialGoals,
  getDecryptedFinancialGoalById,
  updateEncryptedFinancialGoal,
} from "../db/encrypted";
import { insertFinancialGoalSchema } from "@shared/schema";

const router = Router();

// Create a new financial goal
router.post("/api/financial-goals", async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Validate request body
    const schema = z.object({
      goalType: z.string(),
      title: z.string(),
      description: z.string().optional(),
      status: z.string().optional(),
      targetDate: z.string().optional(),
      sensitiveData: z.object({
        targetAmount: z.number(),
        currentAmount: z.number(),
        currency: z.string().optional(),
        notes: z.string().optional(),
        milestones: z.array(z.any()).optional(),
      }),
    });

    const data = schema.parse(req.body);
    
    const goal = await createEncryptedFinancialGoal({
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
    console.error("Error creating financial goal:", error);
    res.status(400).json({ error: error.message });
  }
});

// Get all financial goals for the authenticated user
router.get("/api/financial-goals", async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const goals = await getDecryptedFinancialGoals(user.id);
    res.json(goals);
  } catch (error: any) {
    console.error("Error fetching financial goals:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get a specific financial goal
router.get("/api/financial-goals/:id", async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const id = parseInt(req.params.id);
    const goal = await getDecryptedFinancialGoalById(id, user.id);
    
    if (!goal) {
      return res.status(404).json({ error: "Goal not found" });
    }

    res.json(goal);
  } catch (error: any) {
    console.error("Error fetching financial goal:", error);
    res.status(500).json({ error: error.message });
  }
});

// Update a financial goal
router.patch("/api/financial-goals/:id", async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const id = parseInt(req.params.id);
    const updates = req.body;

    const updatedGoal = await updateEncryptedFinancialGoal(id, user.id, updates);
    
    if (!updatedGoal) {
      return res.status(404).json({ error: "Goal not found" });
    }

    res.json(updatedGoal);
  } catch (error: any) {
    console.error("Error updating financial goal:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
