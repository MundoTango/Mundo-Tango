import { Router, type Request, Response } from "express";
import { planTrackerService } from "../services/mrBlue/PlanTrackerService";
import { insertPlanProgressSchema } from "../../shared/schema";
import { z } from "zod";

const router = Router();

/**
 * GET /api/plan/roadmap
 * Get full roadmap structure with user's progress
 * 
 * Query params:
 * - userId: number (required) - User ID to get progress for
 */
router.get("/roadmap", async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.query.userId as string);

    if (!userId || isNaN(userId)) {
      return res.status(400).json({ error: "Valid userId is required" });
    }

    // Initialize progress if doesn't exist
    const existingProgress = await planTrackerService.getUserProgress(userId);
    if (existingProgress.length === 0) {
      await planTrackerService.initializeUserProgress(userId);
    }

    const roadmap = await planTrackerService.getRoadmap(userId);
    res.json(roadmap);
  } catch (error) {
    console.error("[Plan Routes] Error fetching roadmap:", error);
    res.status(500).json({ 
      error: "Failed to fetch roadmap",
      details: error instanceof Error ? error.message : "Unknown error" 
    });
  }
});

/**
 * GET /api/plan/progress/:userId
 * Get user's validation progress (all 47 pages)
 */
router.get("/progress/:userId", async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);

    if (!userId || isNaN(userId)) {
      return res.status(400).json({ error: "Valid userId is required" });
    }

    const progress = await planTrackerService.getUserProgress(userId);
    
    if (progress.length === 0) {
      await planTrackerService.initializeUserProgress(userId);
      const newProgress = await planTrackerService.getUserProgress(userId);
      return res.json(newProgress);
    }

    res.json(progress);
  } catch (error) {
    console.error("[Plan Routes] Error fetching progress:", error);
    res.status(500).json({ 
      error: "Failed to fetch progress",
      details: error instanceof Error ? error.message : "Unknown error" 
    });
  }
});

/**
 * POST /api/plan/validate-page
 * Mark a page as validated
 * 
 * Body:
 * - userId: number
 * - pageName: string
 * - notes?: string
 * - issuesFound?: number
 */
router.post("/validate-page", async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      userId: z.number(),
      pageName: z.string(),
      notes: z.string().optional(),
      issuesFound: z.number().optional(),
    });

    const { userId, pageName, notes, issuesFound } = schema.parse(req.body);

    const updated = await planTrackerService.validatePage(
      userId,
      pageName,
      notes,
      issuesFound
    );

    if (!updated) {
      return res.status(404).json({ error: "Page not found" });
    }

    // Return updated stats
    const stats = await planTrackerService.getStats(userId);

    res.json({ 
      page: updated,
      stats 
    });
  } catch (error) {
    console.error("[Plan Routes] Error validating page:", error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: "Validation failed", 
        details: error.errors 
      });
    }

    res.status(500).json({ 
      error: "Failed to validate page",
      details: error instanceof Error ? error.message : "Unknown error" 
    });
  }
});

/**
 * PUT /api/plan/update-page/:pageId
 * Update validation notes/status for a specific page
 * 
 * Body:
 * - status?: string
 * - notes?: string
 * - issuesFound?: number
 */
router.put("/update-page/:pageId", async (req: Request, res: Response) => {
  try {
    const pageId = parseInt(req.params.pageId);

    if (!pageId || isNaN(pageId)) {
      return res.status(400).json({ error: "Valid pageId is required" });
    }

    const schema = z.object({
      status: z.string().optional(),
      notes: z.string().optional(),
      issuesFound: z.number().optional(),
    });

    const data = schema.parse(req.body);

    const updated = await planTrackerService.updateProgressById(pageId, data);

    if (!updated) {
      return res.status(404).json({ error: "Page not found" });
    }

    res.json(updated);
  } catch (error) {
    console.error("[Plan Routes] Error updating page:", error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: "Validation failed", 
        details: error.errors 
      });
    }

    res.status(500).json({ 
      error: "Failed to update page",
      details: error instanceof Error ? error.message : "Unknown error" 
    });
  }
});

/**
 * GET /api/plan/stats
 * Get overall stats (47 total, X validated, Y%)
 * 
 * Query params:
 * - userId: number (required)
 */
router.get("/stats", async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.query.userId as string);

    if (!userId || isNaN(userId)) {
      return res.status(400).json({ error: "Valid userId is required" });
    }

    // Initialize progress if doesn't exist
    const existingProgress = await planTrackerService.getUserProgress(userId);
    if (existingProgress.length === 0) {
      await planTrackerService.initializeUserProgress(userId);
    }

    const stats = await planTrackerService.getStats(userId);
    res.json(stats);
  } catch (error) {
    console.error("[Plan Routes] Error fetching stats:", error);
    res.status(500).json({ 
      error: "Failed to fetch stats",
      details: error instanceof Error ? error.message : "Unknown error" 
    });
  }
});

/**
 * POST /api/plan/initialize/:userId
 * Manually initialize progress for a user
 */
router.post("/initialize/:userId", async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);

    if (!userId || isNaN(userId)) {
      return res.status(400).json({ error: "Valid userId is required" });
    }

    await planTrackerService.initializeUserProgress(userId);
    const progress = await planTrackerService.getUserProgress(userId);

    res.json({ 
      message: "Progress initialized",
      totalPages: progress.length,
      progress 
    });
  } catch (error) {
    console.error("[Plan Routes] Error initializing progress:", error);
    res.status(500).json({ 
      error: "Failed to initialize progress",
      details: error instanceof Error ? error.message : "Unknown error" 
    });
  }
});

export default router;
