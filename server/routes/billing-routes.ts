import { Router, type Request, Response } from "express";
import Stripe from "stripe";
import { db } from "@shared/db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import { authenticateToken, AuthRequest } from "../middleware/auth";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-11-20.acacia",
});

const router = Router();

// Subscription plan definitions
const SUBSCRIPTION_PLANS = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    interval: 'month',
    features: [
      'Community features',
      'Basic event browsing',
      'Profile creation',
      'Up to 5 event RSVPs per month',
    ],
  },
  basic: {
    id: 'basic',
    name: 'Basic',
    price: 9.99,
    interval: 'month',
    stripePriceId: process.env.STRIPE_PRICE_BASIC_MONTHLY,
    features: [
      'Unlimited event RSVPs',
      'Basic matching algorithm',
      'Event creation (up to 5/month)',
      'Group participation',
      'Direct messaging',
    ],
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 29.99,
    interval: 'month',
    stripePriceId: process.env.STRIPE_PRICE_PRO_MONTHLY,
    features: [
      'Everything in Basic',
      'Advanced matching algorithm',
      'Analytics dashboard',
      'Priority support',
      'Unlimited event creation',
      'Custom profile badges',
      'Early access to features',
    ],
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    price: 99.99,
    interval: 'month',
    stripePriceId: process.env.STRIPE_PRICE_PREMIUM_MONTHLY,
    features: [
      'Everything in Pro',
      'AI Assistant (Mr. Blue)',
      'Unlimited everything',
      'Dedicated account manager',
      'Custom branding options',
      'API access',
      'White-label options',
      'Priority event placement',
    ],
  },
};

// GET /api/billing/plans - List available plans
router.get("/plans", (req: Request, res: Response) => {
  res.json({ plans: Object.values(SUBSCRIPTION_PLANS) });
});

// GET /api/billing/subscription - Get current subscription
router.get("/subscription", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let subscriptionData = null;

    if (user.stripeSubscriptionId) {
      try {
        const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
        subscriptionData = {
          id: subscription.id,
          status: subscription.status,
          currentPeriodEnd: subscription.current_period_end,
          currentPeriodStart: subscription.current_period_start,
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          tier: user.subscriptionTier || 'free',
        };
      } catch (error) {
        console.error('Error fetching Stripe subscription:', error);
      }
    }

    res.json({
      subscription: subscriptionData,
      tier: user.subscriptionTier || 'free',
      status: user.subscriptionStatus || 'active',
    });
  } catch (error: any) {
    console.error('Error fetching subscription:', error);
    res.status(500).json({ message: "Error fetching subscription: " + error.message });
  }
});

// POST /api/billing/create-subscription - Create new subscription
router.post("/create-subscription", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { planId, paymentMethodId } = req.body;

    if (!planId || !SUBSCRIPTION_PLANS[planId as keyof typeof SUBSCRIPTION_PLANS]) {
      return res.status(400).json({ message: "Invalid plan ID" });
    }

    const plan = SUBSCRIPTION_PLANS[planId as keyof typeof SUBSCRIPTION_PLANS];

    if (planId === 'free') {
      await db.update(users)
        .set({
          subscriptionTier: 'free',
          subscriptionStatus: 'active',
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));

      return res.json({ success: true, tier: 'free' });
    }

    if (!plan.stripePriceId) {
      return res.status(400).json({ message: "Price ID not configured for this plan" });
    }

    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let customerId = user.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: {
          userId: userId.toString(),
        },
      });
      customerId = customer.id;

      await db.update(users)
        .set({ stripeCustomerId: customerId, updatedAt: new Date() })
        .where(eq(users.id, userId));
    }

    if (paymentMethodId) {
      await stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId,
      });

      await stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });
    }

    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: plan.stripePriceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
    });

    await db.update(users)
      .set({
        stripeSubscriptionId: subscription.id,
        subscriptionTier: planId,
        subscriptionStatus: subscription.status,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    const latestInvoice = subscription.latest_invoice as Stripe.Invoice;
    const paymentIntent = latestInvoice?.payment_intent as Stripe.PaymentIntent;

    res.json({
      subscriptionId: subscription.id,
      clientSecret: paymentIntent?.client_secret,
      status: subscription.status,
    });
  } catch (error: any) {
    console.error('Error creating subscription:', error);
    res.status(500).json({ message: "Error creating subscription: " + error.message });
  }
});

// POST /api/billing/update-subscription - Update subscription (upgrade/downgrade)
router.post("/update-subscription", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { planId } = req.body;

    if (!planId || !SUBSCRIPTION_PLANS[planId as keyof typeof SUBSCRIPTION_PLANS]) {
      return res.status(400).json({ message: "Invalid plan ID" });
    }

    const plan = SUBSCRIPTION_PLANS[planId as keyof typeof SUBSCRIPTION_PLANS];
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (planId === 'free') {
      if (user.stripeSubscriptionId) {
        await stripe.subscriptions.cancel(user.stripeSubscriptionId);
      }

      await db.update(users)
        .set({
          subscriptionTier: 'free',
          subscriptionStatus: 'active',
          stripeSubscriptionId: null,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));

      return res.json({ success: true, tier: 'free' });
    }

    if (!user.stripeSubscriptionId) {
      return res.status(400).json({ message: "No active subscription found" });
    }

    if (!plan.stripePriceId) {
      return res.status(400).json({ message: "Price ID not configured for this plan" });
    }

    const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
    
    const updatedSubscription = await stripe.subscriptions.update(user.stripeSubscriptionId, {
      items: [{
        id: subscription.items.data[0].id,
        price: plan.stripePriceId,
      }],
      proration_behavior: 'create_prorations',
    });

    await db.update(users)
      .set({
        subscriptionTier: planId,
        subscriptionStatus: updatedSubscription.status,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    res.json({
      subscription: updatedSubscription,
      tier: planId,
    });
  } catch (error: any) {
    console.error('Error updating subscription:', error);
    res.status(500).json({ message: "Error updating subscription: " + error.message });
  }
});

// POST /api/billing/cancel-subscription - Cancel subscription
router.post("/cancel-subscription", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { immediate } = req.body;

    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);

    if (!user || !user.stripeSubscriptionId) {
      return res.status(404).json({ message: "No active subscription found" });
    }

    if (immediate) {
      await stripe.subscriptions.cancel(user.stripeSubscriptionId);
      
      await db.update(users)
        .set({
          subscriptionTier: 'free',
          subscriptionStatus: 'canceled',
          stripeSubscriptionId: null,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));
    } else {
      const subscription = await stripe.subscriptions.update(user.stripeSubscriptionId, {
        cancel_at_period_end: true,
      });

      await db.update(users)
        .set({
          subscriptionStatus: 'canceling',
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));
    }

    res.json({ success: true, immediate });
  } catch (error: any) {
    console.error('Error canceling subscription:', error);
    res.status(500).json({ message: "Error canceling subscription: " + error.message });
  }
});

// GET /api/billing/customer-portal - Get Stripe Customer Portal URL
router.get("/customer-portal", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);

    if (!user || !user.stripeCustomerId) {
      return res.status(404).json({ message: "No Stripe customer found" });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${process.env.REPLIT_DEV_DOMAIN || 'http://localhost:5000'}/settings/billing`,
    });

    res.json({ url: session.url });
  } catch (error: any) {
    console.error('Error creating customer portal session:', error);
    res.status(500).json({ message: "Error creating customer portal session: " + error.message });
  }
});

// GET /api/billing/invoices - List all invoices
router.get("/invoices", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);

    if (!user || !user.stripeCustomerId) {
      return res.json({ invoices: [] });
    }

    const invoices = await stripe.invoices.list({
      customer: user.stripeCustomerId,
      limit: 100,
    });

    res.json({
      invoices: invoices.data.map(invoice => ({
        id: invoice.id,
        amount: invoice.amount_paid,
        currency: invoice.currency,
        status: invoice.status,
        date: invoice.created,
        pdfUrl: invoice.invoice_pdf,
        hostedUrl: invoice.hosted_invoice_url,
        number: invoice.number,
      })),
    });
  } catch (error: any) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ message: "Error fetching invoices: " + error.message });
  }
});

// GET /api/billing/payment-methods - List payment methods
router.get("/payment-methods", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);

    if (!user || !user.stripeCustomerId) {
      return res.json({ paymentMethods: [] });
    }

    const paymentMethods = await stripe.paymentMethods.list({
      customer: user.stripeCustomerId,
      type: 'card',
    });

    const customer = await stripe.customers.retrieve(user.stripeCustomerId);
    const defaultPaymentMethodId = (customer as Stripe.Customer).invoice_settings?.default_payment_method;

    res.json({
      paymentMethods: paymentMethods.data.map(pm => ({
        id: pm.id,
        brand: pm.card?.brand,
        last4: pm.card?.last4,
        expMonth: pm.card?.exp_month,
        expYear: pm.card?.exp_year,
        isDefault: pm.id === defaultPaymentMethodId,
      })),
    });
  } catch (error: any) {
    console.error('Error fetching payment methods:', error);
    res.status(500).json({ message: "Error fetching payment methods: " + error.message });
  }
});

// POST /api/billing/payment-methods - Add payment method
router.post("/payment-methods", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { paymentMethodId } = req.body;

    if (!paymentMethodId) {
      return res.status(400).json({ message: "Payment method ID is required" });
    }

    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let customerId = user.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: {
          userId: userId.toString(),
        },
      });
      customerId = customer.id;

      await db.update(users)
        .set({ stripeCustomerId: customerId, updatedAt: new Date() })
        .where(eq(users.id, userId));
    }

    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });

    res.json({ success: true });
  } catch (error: any) {
    console.error('Error adding payment method:', error);
    res.status(500).json({ message: "Error adding payment method: " + error.message });
  }
});

// DELETE /api/billing/payment-methods/:id - Delete payment method
router.delete("/payment-methods/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await stripe.paymentMethods.detach(id);

    res.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting payment method:', error);
    res.status(500).json({ message: "Error deleting payment method: " + error.message });
  }
});

// POST /api/billing/set-default-payment - Set default payment method
router.post("/set-default-payment", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { paymentMethodId } = req.body;

    if (!paymentMethodId) {
      return res.status(400).json({ message: "Payment method ID is required" });
    }

    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);

    if (!user || !user.stripeCustomerId) {
      return res.status(404).json({ message: "No Stripe customer found" });
    }

    await stripe.customers.update(user.stripeCustomerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    res.json({ success: true });
  } catch (error: any) {
    console.error('Error setting default payment method:', error);
    res.status(500).json({ message: "Error setting default payment method: " + error.message });
  }
});

export default router;
