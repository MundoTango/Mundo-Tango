import { Router, Response } from "express";
import { RevenueShareService } from "../services/RevenueShareService";
import { authenticateToken, AuthRequest } from "../middleware/auth";
import { z } from "zod";

const router = Router();

/**
 * Get user's revenue shares
 * GET /api/revenue/shares
 */
router.get("/shares", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const { status, transactionType, limit } = req.query;

    const shares = await RevenueShareService.getUserRevenueShares(req.user.id, {
      status: status as string | undefined,
      transactionType: transactionType as string | undefined,
      limit: limit ? parseInt(limit as string) : undefined,
    });

    res.json(shares);
  } catch (error) {
    console.error("Get revenue shares error:", error);
    res.status(500).json({ error: "Failed to fetch revenue shares" });
  }
});

/**
 * Get revenue summary for user
 * GET /api/revenue/summary
 */
router.get("/summary", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const { startDate, endDate } = req.query;

    const dateRange = startDate && endDate ? {
      start: new Date(startDate as string),
      end: new Date(endDate as string),
    } : undefined;

    const summary = await RevenueShareService.getRevenueSummary(req.user.id, dateRange);

    res.json(summary);
  } catch (error) {
    console.error("Get revenue summary error:", error);
    res.status(500).json({ error: "Failed to fetch revenue summary" });
  }
});

/**
 * Get pending payouts for user
 * GET /api/revenue/pending
 */
router.get("/pending", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const pending = await RevenueShareService.processPendingPayouts(req.user.id);

    res.json(pending);
  } catch (error) {
    console.error("Get pending payouts error:", error);
    res.status(500).json({ error: "Failed to fetch pending payouts" });
  }
});

/**
 * Create revenue share (internal use)
 * POST /api/revenue/shares
 */
router.post("/shares", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const schema = z.object({
      transactionType: z.enum(["housing", "event_ticket", "workshop", "marketplace"]),
      transactionId: z.number().int().positive(),
      role: z.string(),
      totalAmount: z.number().int().positive(),
      currency: z.string().length(3).optional(),
    });

    const data = schema.parse(req.body);

    const revenueShare = await RevenueShareService.createRevenueShare({
      userId: req.user.id,
      ...data,
    });

    res.status(201).json(revenueShare);
  } catch (error) {
    console.error("Create revenue share error:", error);
    res.status(500).json({ error: "Failed to create revenue share" });
  }
});

export default router;
