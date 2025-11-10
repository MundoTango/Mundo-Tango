import { Router, type Request, type Response } from "express";
import { db } from "@shared/db";
import { subscriptions, pricingTiers, users } from "@shared/schema";
import { authenticateToken, AuthRequest } from "../middleware/auth";
import { eq, and, desc } from "drizzle-orm";

const router = Router();

// ============================================================================
// SUBSCRIPTION ROUTES
// ============================================================================

// GET /api/subscriptions/me - Get current user's subscription (auth required)
router.get("/me", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;

    const result = await db
      .select({
        subscription: subscriptions,
        tier: pricingTiers
      })
      .from(subscriptions)
      .leftJoin(pricingTiers, eq(subscriptions.tierId, pricingTiers.id))
      .where(eq(subscriptions.userId, userId))
      .orderBy(desc(subscriptions.createdAt))
      .limit(1);

    if (result.length === 0) {
      return res.json(null);
    }

    res.json(result[0]);
  } catch (error) {
    console.error("[Subscription] Error fetching user subscription:", error);
    res.status(500).json({ message: "Failed to fetch subscription" });
  }
});

// GET /api/subscriptions/tiers - Get all pricing tiers
router.get("/tiers", async (req: Request, res: Response) => {
  try {
    const tiers = await db
      .select()
      .from(pricingTiers)
      .where(eq(pricingTiers.isActive, true))
      .orderBy(pricingTiers.price);

    res.json(tiers);
  } catch (error) {
    console.error("[Subscription] Error fetching pricing tiers:", error);
    res.status(500).json({ message: "Failed to fetch pricing tiers" });
  }
});

// POST /api/subscriptions - Create new subscription (auth required)
router.post("/", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const {
      tierId,
      billingInterval,
      stripeSubscriptionId,
      stripeCustomerId,
      amount,
      currentPeriodStart,
      currentPeriodEnd
    } = req.body;

    if (!tierId || !billingInterval || !amount || !currentPeriodStart || !currentPeriodEnd) {
      return res.status(400).json({ 
        message: "Tier, billing interval, amount, and period dates are required" 
      });
    }

    // Cancel any existing active subscriptions
    await db
      .update(subscriptions)
      .set({ 
        status: "cancelled",
        cancelledAt: new Date()
      })
      .where(and(
        eq(subscriptions.userId, userId),
        eq(subscriptions.status, "active")
      ));

    const [subscription] = await db
      .insert(subscriptions)
      .values({
        userId,
        tierId,
        billingInterval,
        stripeSubscriptionId,
        stripeCustomerId,
        amount,
        currentPeriodStart: new Date(currentPeriodStart),
        currentPeriodEnd: new Date(currentPeriodEnd),
        status: "active"
      })
      .returning();

    res.status(201).json(subscription);
  } catch (error) {
    console.error("[Subscription] Error creating subscription:", error);
    res.status(500).json({ message: "Failed to create subscription" });
  }
});

// PATCH /api/subscriptions/:id - Update subscription (auth required)
router.patch("/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    // Check ownership
    const existing = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return res.status(404).json({ message: "Subscription not found" });
    }

    if (existing[0].userId !== userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const [updated] = await db
      .update(subscriptions)
      .set({
        ...req.body,
        updatedAt: new Date()
      })
      .where(eq(subscriptions.id, parseInt(id)))
      .returning();

    res.json(updated);
  } catch (error) {
    console.error("[Subscription] Error updating subscription:", error);
    res.status(500).json({ message: "Failed to update subscription" });
  }
});

// POST /api/subscriptions/:id/cancel - Cancel subscription (auth required)
router.post("/:id/cancel", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    const { cancelAt } = req.body;

    // Check ownership
    const existing = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return res.status(404).json({ message: "Subscription not found" });
    }

    if (existing[0].userId !== userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const [cancelled] = await db
      .update(subscriptions)
      .set({ 
        status: "cancelled",
        cancelledAt: new Date(),
        cancelAt: cancelAt ? new Date(cancelAt) : null
      })
      .where(eq(subscriptions.id, parseInt(id)))
      .returning();

    res.json(cancelled);
  } catch (error) {
    console.error("[Subscription] Error cancelling subscription:", error);
    res.status(500).json({ message: "Failed to cancel subscription" });
  }
});

// POST /api/subscriptions/:id/reactivate - Reactivate cancelled subscription (auth required)
router.post("/:id/reactivate", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    // Check ownership
    const existing = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return res.status(404).json({ message: "Subscription not found" });
    }

    if (existing[0].userId !== userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (existing[0].status !== "cancelled") {
      return res.status(400).json({ message: "Subscription is not cancelled" });
    }

    const [reactivated] = await db
      .update(subscriptions)
      .set({ 
        status: "active",
        cancelledAt: null,
        cancelAt: null
      })
      .where(eq(subscriptions.id, parseInt(id)))
      .returning();

    res.json(reactivated);
  } catch (error) {
    console.error("[Subscription] Error reactivating subscription:", error);
    res.status(500).json({ message: "Failed to reactivate subscription" });
  }
});

// GET /api/subscriptions/history - Get user's subscription history (auth required)
router.get("/history", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;

    const history = await db
      .select({
        subscription: subscriptions,
        tier: pricingTiers
      })
      .from(subscriptions)
      .leftJoin(pricingTiers, eq(subscriptions.tierId, pricingTiers.id))
      .where(eq(subscriptions.userId, userId))
      .orderBy(desc(subscriptions.createdAt));

    res.json(history);
  } catch (error) {
    console.error("[Subscription] Error fetching subscription history:", error);
    res.status(500).json({ message: "Failed to fetch subscription history" });
  }
});

export default router;
