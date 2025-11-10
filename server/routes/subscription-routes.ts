import { Router, type Request, type Response } from "express";
import { db } from "@shared/db";
import { authenticateToken, AuthRequest } from "../middleware/auth";
import { sql } from "drizzle-orm";

const router = Router();

// ============================================================================
// SUBSCRIPTION ROUTES
// ============================================================================

// GET /api/subscriptions/me - Get current user's subscription (auth required)
router.get("/me", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;

    const result = await db.execute(sql`
      SELECT 
        s.id,
        s.user_id,
        s.plan_id,
        s.status,
        s.current_period_start,
        s.current_period_end,
        s.cancel_at_period_end,
        s.payment_provider,
        s.provider_subscription_id,
        s.metadata,
        s.created_at,
        s.updated_at,
        p.id as tier_id,
        p.name as tier_name,
        p.display_name as tier_display_name,
        p.description as tier_description,
        p.monthly_price,
        p.annual_price,
        p.features as tier_features
      FROM subscriptions s
      LEFT JOIN pricing_tiers p ON s.plan_id = p.name
      WHERE s.user_id = ${userId}
      ORDER BY s.created_at DESC
      LIMIT 1
    `);

    if (result.rows.length === 0) {
      return res.json(null);
    }

    const row: any = result.rows[0];
    const subscription = {
      subscription: {
        id: row.id,
        userId: row.user_id,
        planId: row.plan_id,
        status: row.status,
        currentPeriodStart: row.current_period_start,
        currentPeriodEnd: row.current_period_end,
        cancelAtPeriodEnd: row.cancel_at_period_end,
        paymentProvider: row.payment_provider,
        providerSubscriptionId: row.provider_subscription_id,
        metadata: row.metadata,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      },
      tier: row.tier_id ? {
        id: row.tier_id,
        name: row.tier_name,
        displayName: row.tier_display_name,
        description: row.tier_description,
        monthlyPrice: row.monthly_price,
        annualPrice: row.annual_price,
        features: row.tier_features
      } : null
    };

    res.json(subscription);
  } catch (error) {
    console.error("[Subscription] Error fetching user subscription:", error);
    res.status(500).json({ message: "Failed to fetch subscription" });
  }
});

// GET /api/subscriptions/tiers - Get all pricing tiers
router.get("/tiers", async (req: Request, res: Response) => {
  try {
    const result = await db.execute(sql`
      SELECT 
        id,
        name,
        display_name,
        description,
        monthly_price,
        annual_price,
        stripe_monthly_price_id,
        stripe_annual_price_id,
        stripe_product_id,
        display_order,
        is_popular,
        is_visible,
        features,
        role_level,
        created_at,
        updated_at
      FROM pricing_tiers
      WHERE is_visible = true
      ORDER BY display_order, monthly_price
    `);

    const tiers = result.rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      displayName: row.display_name,
      description: row.description,
      monthlyPrice: row.monthly_price,
      annualPrice: row.annual_price,
      stripeMonthlyPriceId: row.stripe_monthly_price_id,
      stripeAnnualPriceId: row.stripe_annual_price_id,
      stripeProductId: row.stripe_product_id,
      displayOrder: row.display_order,
      isPopular: row.is_popular,
      isVisible: row.is_visible,
      features: row.features,
      roleLevel: row.role_level,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));

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
      planId,
      billingInterval,
      stripeSubscriptionId,
      currentPeriodStart,
      currentPeriodEnd
    } = req.body;

    if (!planId || !billingInterval || !currentPeriodStart || !currentPeriodEnd) {
      return res.status(400).json({ 
        message: "Plan ID, billing interval, and period dates are required" 
      });
    }

    // Cancel any existing active subscriptions
    await db.execute(sql`
      UPDATE subscriptions
      SET status = 'cancelled', updated_at = NOW()
      WHERE user_id = ${userId} AND status = 'active'
    `);

    // Insert new subscription
    const result = await db.execute(sql`
      INSERT INTO subscriptions (
        user_id,
        plan_id,
        status,
        current_period_start,
        current_period_end,
        cancel_at_period_end,
        payment_provider,
        provider_subscription_id,
        metadata,
        created_at,
        updated_at
      ) VALUES (
        ${userId},
        ${planId},
        'active',
        ${new Date(currentPeriodStart)},
        ${new Date(currentPeriodEnd)},
        false,
        ${stripeSubscriptionId ? 'stripe' : 'manual'},
        ${stripeSubscriptionId || `manual_${Date.now()}`},
        ${JSON.stringify({ billingInterval })},
        NOW(),
        NOW()
      )
      RETURNING *
    `);

    const row: any = result.rows[0];
    const subscription = {
      id: row.id,
      userId: row.user_id,
      planId: row.plan_id,
      status: row.status,
      currentPeriodStart: row.current_period_start,
      currentPeriodEnd: row.current_period_end,
      cancelAtPeriodEnd: row.cancel_at_period_end,
      paymentProvider: row.payment_provider,
      providerSubscriptionId: row.provider_subscription_id,
      metadata: row.metadata,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };

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
    const { planId, currentPeriodEnd, metadata } = req.body;

    // Check ownership
    const existingResult = await db.execute(sql`
      SELECT * FROM subscriptions WHERE id = ${parseInt(id)} LIMIT 1
    `);

    if (existingResult.rows.length === 0) {
      return res.status(404).json({ message: "Subscription not found" });
    }

    const existing: any = existingResult.rows[0];
    if (existing.user_id !== userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Update only the fields that are provided
    let result;
    if (planId !== undefined && currentPeriodEnd !== undefined) {
      result = await db.execute(sql`
        UPDATE subscriptions
        SET plan_id = ${planId},
            current_period_end = ${new Date(currentPeriodEnd)},
            updated_at = NOW()
        WHERE id = ${parseInt(id)}
        RETURNING *
      `);
    } else if (planId !== undefined) {
      result = await db.execute(sql`
        UPDATE subscriptions
        SET plan_id = ${planId},
            updated_at = NOW()
        WHERE id = ${parseInt(id)}
        RETURNING *
      `);
    } else if (currentPeriodEnd !== undefined) {
      result = await db.execute(sql`
        UPDATE subscriptions
        SET current_period_end = ${new Date(currentPeriodEnd)},
            updated_at = NOW()
        WHERE id = ${parseInt(id)}
        RETURNING *
      `);
    } else if (metadata !== undefined) {
      result = await db.execute(sql`
        UPDATE subscriptions
        SET metadata = ${JSON.stringify(metadata)},
            updated_at = NOW()
        WHERE id = ${parseInt(id)}
        RETURNING *
      `);
    } else {
      // No fields to update, just return the existing subscription
      result = existingResult;
    }

    const row: any = result.rows[0];
    const updated = {
      id: row.id,
      userId: row.user_id,
      planId: row.plan_id,
      status: row.status,
      currentPeriodStart: row.current_period_start,
      currentPeriodEnd: row.current_period_end,
      cancelAtPeriodEnd: row.cancel_at_period_end,
      paymentProvider: row.payment_provider,
      providerSubscriptionId: row.provider_subscription_id,
      metadata: row.metadata,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };

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
    const { cancelAtPeriodEnd } = req.body;

    // Check ownership
    const existingResult = await db.execute(sql`
      SELECT * FROM subscriptions WHERE id = ${parseInt(id)} LIMIT 1
    `);

    if (existingResult.rows.length === 0) {
      return res.status(404).json({ message: "Subscription not found" });
    }

    const existing: any = existingResult.rows[0];
    if (existing.user_id !== userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const result = await db.execute(sql`
      UPDATE subscriptions
      SET 
        status = 'cancelled',
        cancel_at_period_end = ${cancelAtPeriodEnd || false},
        updated_at = NOW()
      WHERE id = ${parseInt(id)}
      RETURNING *
    `);

    const row: any = result.rows[0];
    const cancelled = {
      id: row.id,
      userId: row.user_id,
      planId: row.plan_id,
      status: row.status,
      currentPeriodStart: row.current_period_start,
      currentPeriodEnd: row.current_period_end,
      cancelAtPeriodEnd: row.cancel_at_period_end,
      paymentProvider: row.payment_provider,
      providerSubscriptionId: row.provider_subscription_id,
      metadata: row.metadata,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };

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
    const existingResult = await db.execute(sql`
      SELECT * FROM subscriptions WHERE id = ${parseInt(id)} LIMIT 1
    `);

    if (existingResult.rows.length === 0) {
      return res.status(404).json({ message: "Subscription not found" });
    }

    const existing: any = existingResult.rows[0];
    if (existing.user_id !== userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (existing.status !== "cancelled") {
      return res.status(400).json({ message: "Subscription is not cancelled" });
    }

    const result = await db.execute(sql`
      UPDATE subscriptions
      SET 
        status = 'active',
        cancel_at_period_end = false,
        updated_at = NOW()
      WHERE id = ${parseInt(id)}
      RETURNING *
    `);

    const row: any = result.rows[0];
    const reactivated = {
      id: row.id,
      userId: row.user_id,
      planId: row.plan_id,
      status: row.status,
      currentPeriodStart: row.current_period_start,
      currentPeriodEnd: row.current_period_end,
      cancelAtPeriodEnd: row.cancel_at_period_end,
      paymentProvider: row.payment_provider,
      providerSubscriptionId: row.provider_subscription_id,
      metadata: row.metadata,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };

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

    const result = await db.execute(sql`
      SELECT 
        s.id,
        s.user_id,
        s.plan_id,
        s.status,
        s.current_period_start,
        s.current_period_end,
        s.cancel_at_period_end,
        s.payment_provider,
        s.provider_subscription_id,
        s.metadata,
        s.created_at,
        s.updated_at,
        p.id as tier_id,
        p.name as tier_name,
        p.display_name as tier_display_name,
        p.description as tier_description,
        p.monthly_price,
        p.annual_price,
        p.features as tier_features
      FROM subscriptions s
      LEFT JOIN pricing_tiers p ON s.plan_id = p.name
      WHERE s.user_id = ${userId}
      ORDER BY s.created_at DESC
    `);

    const history = result.rows.map((row: any) => ({
      subscription: {
        id: row.id,
        userId: row.user_id,
        planId: row.plan_id,
        status: row.status,
        currentPeriodStart: row.current_period_start,
        currentPeriodEnd: row.current_period_end,
        cancelAtPeriodEnd: row.cancel_at_period_end,
        paymentProvider: row.payment_provider,
        providerSubscriptionId: row.provider_subscription_id,
        metadata: row.metadata,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      },
      tier: row.tier_id ? {
        id: row.tier_id,
        name: row.tier_name,
        displayName: row.tier_display_name,
        description: row.tier_description,
        monthlyPrice: row.monthly_price,
        annualPrice: row.annual_price,
        features: row.tier_features
      } : null
    }));

    res.json(history);
  } catch (error) {
    console.error("[Subscription] Error fetching subscription history:", error);
    res.status(500).json({ message: "Failed to fetch subscription history" });
  }
});

export default router;
