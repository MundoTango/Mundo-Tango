import { Router } from "express";
import { z } from "zod";
import {
  createEncryptedBudgetEntry,
  getDecryptedBudgetEntries,
  createEncryptedBudgetCategory,
  getDecryptedBudgetCategories,
} from "../db/encrypted";

const router = Router();

// ============================================================================
// BUDGET ENTRIES
// ============================================================================

// Create a new budget entry
router.post("/api/budget/entries", async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const schema = z.object({
      categoryId: z.number().optional(),
      entryType: z.enum(["income", "expense"]),
      date: z.string(),
      merchant: z.string().optional(),
      sensitiveData: z.object({
        amount: z.number(),
        currency: z.string().optional(),
        description: z.string(),
        notes: z.string().optional(),
      }),
    });

    const data = schema.parse(req.body);
    
    const entry = await createEncryptedBudgetEntry({
      userId: user.id,
      categoryId: data.categoryId,
      entryType: data.entryType,
      date: new Date(data.date),
      merchant: data.merchant,
      sensitiveData: data.sensitiveData,
    });

    res.json(entry);
  } catch (error: any) {
    console.error("Error creating budget entry:", error);
    res.status(400).json({ error: error.message });
  }
});

// Get all budget entries for the authenticated user
router.get("/api/budget/entries", async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { startDate, endDate, categoryId, entryType } = req.query;

    const filters: any = {};
    if (startDate) filters.startDate = new Date(startDate as string);
    if (endDate) filters.endDate = new Date(endDate as string);
    if (categoryId) filters.categoryId = parseInt(categoryId as string);
    if (entryType) filters.entryType = entryType as string;

    const entries = await getDecryptedBudgetEntries(user.id, filters);
    res.json(entries);
  } catch (error: any) {
    console.error("Error fetching budget entries:", error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// BUDGET CATEGORIES
// ============================================================================

// Create a new budget category
router.post("/api/budget/categories", async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const schema = z.object({
      name: z.string(),
      color: z.string().optional(),
      icon: z.string().optional(),
      sensitiveData: z.object({
        monthlyLimit: z.number().optional(),
        yearlyTarget: z.number().optional(),
        notes: z.string().optional(),
      }).optional(),
    });

    const data = schema.parse(req.body);
    
    const category = await createEncryptedBudgetCategory({
      userId: user.id,
      name: data.name,
      color: data.color,
      icon: data.icon,
      sensitiveData: data.sensitiveData,
    });

    res.json(category);
  } catch (error: any) {
    console.error("Error creating budget category:", error);
    res.status(400).json({ error: error.message });
  }
});

// Get all budget categories for the authenticated user
router.get("/api/budget/categories", async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const categories = await getDecryptedBudgetCategories(user.id);
    res.json(categories);
  } catch (error: any) {
    console.error("Error fetching budget categories:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
