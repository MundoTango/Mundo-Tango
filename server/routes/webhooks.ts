// Webhook Handlers - Deployment + Stripe Payment Processing
// Created: October 31, 2025
// Updated: November 12, 2025 - Added Stripe webhook handler

import { Router, Request, Response } from "express";
import { storage } from "../storage";
import Stripe from "stripe";

const router = Router();

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-10-29.clover",
});

// Stripe Webhook Handler - PRODUCTION CRITICAL
// Handles payment events from Stripe to activate subscriptions
router.post("/stripe", async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'];

  if (!sig) {
    console.error('[Stripe Webhook] No signature header found');
    return res.status(400).send('No signature');
  }

  let event: Stripe.Event;

  try {
    // Verify webhook signature for security
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('[Stripe Webhook] STRIPE_WEBHOOK_SECRET not configured');
      return res.status(500).send('Webhook secret not configured');
    }

    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      webhookSecret
    );
  } catch (err: any) {
    console.error(`[Stripe Webhook] Signature verification failed:`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  console.log(`[Stripe Webhook] Received event: ${event.type}`);

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log(`[Stripe] Checkout completed for session: ${session.id}`);
        
        // Get customer and subscription details
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;
        
        if (subscriptionId) {
          // Retrieve full subscription details
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          
          // Get price to determine plan tier
          const priceId = subscription.items.data[0]?.price.id;
          
          // Map price ID to plan tier
          let planTier = 'free';
          if (priceId === process.env.STRIPE_PRICE_PREMIUM || priceId === process.env.VITE_STRIPE_PRICE_PREMIUM) {
            planTier = 'premium';
          } else if (priceId === process.env.STRIPE_PRICE_PROFESSIONAL || priceId === process.env.VITE_STRIPE_PRICE_PROFESSIONAL) {
            planTier = 'professional';
          }
          
          // Find user by Stripe customer ID and update subscription
          const user = await storage.getUserByStripeCustomerId(customerId);
          
          if (user) {
            await storage.updateUserSubscription(user.id, {
              stripeSubscriptionId: subscriptionId,
              stripeCustomerId: customerId,
              plan: planTier,
              status: 'active',
              currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            });
            console.log(`[Stripe] Activated ${planTier} subscription for user ${user.id}`);
          } else {
            console.warn(`[Stripe] No user found for customer ${customerId}`);
          }
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log(`[Stripe] Subscription updated: ${subscription.id}`);
        
        const customerId = subscription.customer as string;
        const user = await storage.getUserByStripeCustomerId(customerId);
        
        if (user) {
          await storage.updateUserSubscription(user.id, {
            status: subscription.status as 'active' | 'canceled' | 'past_due',
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          });
          console.log(`[Stripe] Updated subscription status to ${subscription.status} for user ${user.id}`);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log(`[Stripe] Subscription canceled: ${subscription.id}`);
        
        const customerId = subscription.customer as string;
        const user = await storage.getUserByStripeCustomerId(customerId);
        
        if (user) {
          await storage.updateUserSubscription(user.id, {
            status: 'canceled',
            plan: 'free',
          });
          console.log(`[Stripe] Downgraded user ${user.id} to free plan`);
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        console.log(`[Stripe] Payment succeeded for invoice: ${invoice.id}`);
        // Payment successful - subscription remains active
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        console.log(`[Stripe] Payment failed for invoice: ${invoice.id}`);
        
        const customerId = invoice.customer as string;
        const user = await storage.getUserByStripeCustomerId(customerId);
        
        if (user) {
          await storage.updateUserSubscription(user.id, {
            status: 'past_due',
          });
          console.log(`[Stripe] Marked subscription as past_due for user ${user.id}`);
        }
        break;
      }

      default:
        console.log(`[Stripe] Unhandled event type: ${event.type}`);
    }

    // Return 200 to acknowledge receipt
    res.json({ received: true });
  } catch (error) {
    console.error('[Stripe Webhook] Processing error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Vercel Webhook Handler
// Receives deployment status updates from Vercel
router.post("/vercel", async (req: Request, res: Response) => {
  try {
    const { type, payload } = req.body;

    // Verify webhook signature (if configured)
    const signature = req.headers['x-vercel-signature'] as string;
    // TODO: Verify signature using VERCEL_WEBHOOK_SECRET
    
    if (type === 'deployment.created' || type === 'deployment.succeeded' || type === 'deployment.failed' || type === 'deployment.canceled') {
      const { id, url, state, meta } = payload;
      
      // Find our deployment record by Vercel deployment ID
      // Note: This requires adding a method to find deployment by vercelDeploymentId
      // For now, using a simple approach - find by commit SHA
      const commitSha = meta?.gitCommitSha;
      if (!commitSha) {
        console.log('Vercel webhook: No commit SHA in payload');
        return res.status(200).json({ received: true });
      }

      // Update deployment status
      let status: string;
      switch (state) {
        case 'READY':
          status = 'success';
          break;
        case 'ERROR':
          status = 'failed';
          break;
        case 'BUILDING':
          status = 'building';
          break;
        case 'QUEUED':
          status = 'pending';
          break;
        case 'CANCELED':
          status = 'cancelled';
          break;
        default:
          status = 'deploying';
      }

      // Log the webhook for debugging
      console.log(`Vercel webhook: ${type}, state: ${state}, commit: ${commitSha}, id: ${id}`);
      
      // Find deployment by Vercel deployment ID using indexed query
      const deployment = await storage.getDeploymentByVercelId(id);
      
      if (deployment) {
        await storage.updateDeployment(deployment.id, {
          status,
          vercelUrl: url,
          vercelDeploymentId: id,
          completedAt: status === 'success' || status === 'failed' ? new Date() : undefined,
        });
        console.log(`Updated deployment ${deployment.id} to status: ${status}`);
      } else {
        console.log(`No deployment found for Vercel ID: ${id}`);
      }
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Vercel webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Railway Webhook Handler
// Receives deployment status updates from Railway
router.post("/railway", async (req: Request, res: Response) => {
  try {
    const { type, data } = req.body;

    // Verify webhook signature (if configured)
    const signature = req.headers['x-railway-signature'] as string;
    // TODO: Verify signature using RAILWAY_WEBHOOK_SECRET

    if (type === 'DEPLOYMENT_STATUS_CHANGED') {
      const { id, status: railwayStatus, projectId, environmentId } = data;

      // Map Railway status to our status
      let status: string;
      switch (railwayStatus) {
        case 'SUCCESS':
          status = 'success';
          break;
        case 'FAILED':
        case 'CRASHED':
          status = 'failed';
          break;
        case 'BUILDING':
          status = 'building';
          break;
        case 'DEPLOYING':
          status = 'deploying';
          break;
        case 'REMOVING':
          status = 'cancelled';
          break;
        default:
          status = 'pending';
      }

      console.log(`Railway webhook: ${type}, status: ${railwayStatus}, deployment: ${id}`);

      // Find deployment by Railway deployment ID using indexed query
      const deployment = await storage.getDeploymentByRailwayId(id);
      
      if (deployment) {
        await storage.updateDeployment(deployment.id, {
          status,
          railwayDeploymentId: id,
          completedAt: status === 'success' || status === 'failed' ? new Date() : undefined,
        });
        console.log(`Updated deployment ${deployment.id} to status: ${status}`);
      } else {
        console.log(`No deployment found for Railway ID: ${id}`);
      }
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Railway webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Health check endpoint
router.get("/health", (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Webhook handlers are running' });
});

export default router;
