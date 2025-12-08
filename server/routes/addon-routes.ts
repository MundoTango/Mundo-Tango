import { Router, type Response } from "express";
import Stripe from "stripe";
import { db } from "@shared/db";
import { billingAddons, users } from "@shared/schema";
import { eq, and } from "drizzle-orm";
import { authenticateToken, AuthRequest } from "../middleware/auth";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-11-20.acacia",
});

const router = Router();

const AVAILABLE_ADDONS = {
  travel_planner: {
    id: 'travel_planner',
    name: 'Travel Planner',
    description: 'AI-powered travel planning for tango events worldwide',
    priceInCents: 999,
    billingInterval: 'monthly',
    features: [
      'Personalized trip recommendations',
      'Event calendar integration',
      'Flight & hotel suggestions',
      'Local milonga finder',
    ],
  },
  storage: {
    id: 'storage',
    name: 'Extra Storage',
    description: 'Additional storage for photos, videos, and media',
    priceInCents: 499,
    billingInterval: 'monthly',
    features: [
      '50GB additional storage',
      'High-resolution photo uploads',
      'Video hosting',
      'Portfolio gallery',
    ],
  },
  analytics: {
    id: 'analytics',
    name: 'Advanced Analytics',
    description: 'Deep insights into your tango journey and community engagement',
    priceInCents: 799,
    billingInterval: 'monthly',
    features: [
      'Event attendance trends',
      'Network growth metrics',
      'Skill progression tracking',
      'Community influence score',
    ],
  },
  branding: {
    id: 'branding',
    name: 'Custom Branding',
    description: 'Personalize your profile and events with custom branding',
    priceInCents: 1499,
    billingInterval: 'monthly',
    features: [
      'Custom profile themes',
      'Branded event pages',
      'Custom URL slug',
      'Remove platform branding',
    ],
  },
};

router.get("/", (req, res: Response) => {
  res.json({ 
    addons: Object.values(AVAILABLE_ADDONS),
    success: true,
  });
});

router.get("/user", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    
    const userAddons = await db
      .select()
      .from(billingAddons)
      .where(
        and(
          eq(billingAddons.userId, userId),
          eq(billingAddons.status, "active")
        )
      );

    const enrichedAddons = userAddons.map(addon => ({
      ...addon,
      details: AVAILABLE_ADDONS[addon.addonType as keyof typeof AVAILABLE_ADDONS],
    }));

    res.json({ 
      addons: enrichedAddons,
      success: true,
    });
  } catch (error: any) {
    console.error('Error fetching user addons:', error);
    res.status(500).json({ 
      message: "Error fetching user addons: " + error.message,
      success: false,
    });
  }
});

router.post("/subscribe", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { addonType } = req.body;

    if (!addonType || !AVAILABLE_ADDONS[addonType as keyof typeof AVAILABLE_ADDONS]) {
      return res.status(400).json({ 
        message: "Invalid addon type",
        success: false,
      });
    }

    const addonConfig = AVAILABLE_ADDONS[addonType as keyof typeof AVAILABLE_ADDONS];

    const existing = await db
      .select()
      .from(billingAddons)
      .where(
        and(
          eq(billingAddons.userId, userId),
          eq(billingAddons.addonType, addonType),
          eq(billingAddons.status, "active")
        )
      )
      .limit(1);

    if (existing.length > 0) {
      return res.status(400).json({ 
        message: "You already have this addon active",
        success: false,
      });
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    let stripeSubscriptionItemId: string | null = null;

    if (user?.stripeCustomerId && user?.stripeSubscriptionId) {
      try {
        const subscriptionItem = await stripe.subscriptionItems.create({
          subscription: user.stripeSubscriptionId,
          price_data: {
            currency: 'usd',
            product_data: {
              name: addonConfig.name,
              metadata: { addonType },
            },
            unit_amount: addonConfig.priceInCents,
            recurring: { interval: 'month' },
          },
          quantity: 1,
        });
        stripeSubscriptionItemId = subscriptionItem.id;
      } catch (stripeError: any) {
        console.warn('Could not add to Stripe subscription:', stripeError.message);
      }
    }

    const [newAddon] = await db
      .insert(billingAddons)
      .values({
        userId,
        addonType,
        status: "active",
        billingInterval: addonConfig.billingInterval,
        priceInCents: addonConfig.priceInCents,
        stripeSubscriptionItemId,
        metadata: { subscribedAt: new Date().toISOString() },
      })
      .returning();

    res.json({ 
      addon: {
        ...newAddon,
        details: addonConfig,
      },
      success: true,
      message: `Successfully subscribed to ${addonConfig.name}`,
    });
  } catch (error: any) {
    console.error('Error subscribing to addon:', error);
    res.status(500).json({ 
      message: "Error subscribing to addon: " + error.message,
      success: false,
    });
  }
});

router.delete("/:addonId", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const addonId = parseInt(req.params.addonId, 10);

    if (isNaN(addonId)) {
      return res.status(400).json({ 
        message: "Invalid addon ID",
        success: false,
      });
    }

    const [addon] = await db
      .select()
      .from(billingAddons)
      .where(
        and(
          eq(billingAddons.id, addonId),
          eq(billingAddons.userId, userId)
        )
      )
      .limit(1);

    if (!addon) {
      return res.status(404).json({ 
        message: "Addon not found",
        success: false,
      });
    }

    if (addon.status === "cancelled") {
      return res.status(400).json({ 
        message: "Addon is already cancelled",
        success: false,
      });
    }

    if (addon.stripeSubscriptionItemId) {
      try {
        await stripe.subscriptionItems.del(addon.stripeSubscriptionItemId);
      } catch (stripeError: any) {
        console.warn('Could not remove from Stripe subscription:', stripeError.message);
      }
    }

    const [updatedAddon] = await db
      .update(billingAddons)
      .set({
        status: "cancelled",
        cancelledAt: new Date(),
      })
      .where(eq(billingAddons.id, addonId))
      .returning();

    res.json({ 
      addon: updatedAddon,
      success: true,
      message: "Addon cancelled successfully",
    });
  } catch (error: any) {
    console.error('Error cancelling addon:', error);
    res.status(500).json({ 
      message: "Error cancelling addon: " + error.message,
      success: false,
    });
  }
});

export default router;
