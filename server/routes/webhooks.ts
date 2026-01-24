// Webhook Handlers - Deployment + Stripe Payment Processing
// Created: October 31, 2025
// Updated: November 12, 2025 - Added Stripe webhook handler

import { Router, Request, Response } from "express";
import { storage, userRepository } from "../storage";
import Stripe from "stripe";
import crypto from "crypto";

// Verify Vercel webhook signature using HMAC-SHA1
function verifyVercelSignature(payload: string, signature: string, secret: string): boolean {
  const expectedSignature = crypto
    .createHmac('sha1', secret)
    .update(payload)
    .digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

// Verify Railway webhook signature using HMAC-SHA256
function verifyRailwaySignature(payload: string, signature: string, secret: string): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(`sha256=${expectedSignature}`)
  );
}

const router = Router();

// Initialize Stripe (optional for development)
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2025-10-29.clover" })
  : null;

if (!stripe) console.warn('[Stripe] Not configured - webhooks disabled');

// Stripe Webhook Handler - PRODUCTION CRITICAL
// Handles payment events from Stripe to activate subscriptions
router.post("/stripe", async (req: Request, res: Response) => {
  if (!stripe) return res.status(200).send('Stripe not configured');

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
            // Access current_period_end - using type assertion for SDK compatibility
            const periodEnd = (subscription as any).current_period_end || subscription.currentPeriodEnd;
            await userRepository.updateUserSubscription(user.id, {
              stripeSubscriptionId: subscriptionId,
              stripeCustomerId: customerId,
              plan: planTier,
              status: 'active',
              currentPeriodEnd: new Date(periodEnd * 1000),
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
          // Access current_period_end - using type assertion for SDK compatibility
          const periodEnd = (subscription as any).current_period_end || subscription.currentPeriodEnd;
          await userRepository.updateUserSubscription(user.id, {
            status: subscription.status as 'active' | 'canceled' | 'past_due',
            currentPeriodEnd: new Date(periodEnd * 1000),
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
          await userRepository.updateUserSubscription(user.id, {
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
          await userRepository.updateUserSubscription(user.id, {
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

    // Verify webhook signature
    const signature = req.headers['x-vercel-signature'] as string;
    const webhookSecret = process.env.VERCEL_WEBHOOK_SECRET;

    if (webhookSecret) {
      if (!signature) {
        console.error('[Vercel Webhook] No signature header found');
        return res.status(401).json({ error: 'Missing signature' });
      }

      const rawBody = JSON.stringify(req.body);
      if (!verifyVercelSignature(rawBody, signature, webhookSecret)) {
        console.error('[Vercel Webhook] Signature verification failed');
        return res.status(401).json({ error: 'Invalid signature' });
      }
    } else if (process.env.NODE_ENV === 'production') {
      console.warn('[Vercel Webhook] VERCEL_WEBHOOK_SECRET not configured in production');
    }
    
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

    // Verify webhook signature
    const signature = req.headers['x-railway-signature'] as string;
    const webhookSecret = process.env.RAILWAY_WEBHOOK_SECRET;

    if (webhookSecret) {
      if (!signature) {
        console.error('[Railway Webhook] No signature header found');
        return res.status(401).json({ error: 'Missing signature' });
      }

      const rawBody = JSON.stringify(req.body);
      if (!verifyRailwaySignature(rawBody, signature, webhookSecret)) {
        console.error('[Railway Webhook] Signature verification failed');
        return res.status(401).json({ error: 'Invalid signature' });
      }
    } else if (process.env.NODE_ENV === 'production') {
      console.warn('[Railway Webhook] RAILWAY_WEBHOOK_SECRET not configured in production');
    }

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

// Facebook Messenger Webhook Handler
// Receives messages from Facebook Messenger to capture PSIDs
router.get("/facebook", (req: Request, res: Response) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  
  const VERIFY_TOKEN = process.env.FACEBOOK_VERIFY_TOKEN || 'MUNDO_TANGO_VERIFY_TOKEN';
  
  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('✅ [Facebook Webhook] Verified!');
    res.status(200).send(challenge);
  } else {
    console.error('❌ [Facebook Webhook] Verification failed');
    res.sendStatus(403);
  }
});

router.post("/facebook", (req: Request, res: Response) => {
  const body = req.body;
  
  if (body.object === 'page') {
    body.entry?.forEach((entry: any) => {
      const webhookEvent = entry.messaging?.[0];
      
      if (webhookEvent?.message) {
        const senderPSID = webhookEvent.sender.id;
        const messageText = webhookEvent.message.text;
        
        console.log('\n🎉 [Facebook Webhook] MESSAGE RECEIVED!');
        console.log('═══════════════════════════════════════════');
        console.log('Sender PSID:', senderPSID);
        console.log('Message:', messageText);
        console.log('═══════════════════════════════════════════\n');
        console.log('✅ TO SEND INVITATION, RUN:');
        console.log(`npx tsx scripts/send-invitation-direct.ts ${process.env.FACEBOOK_PAGE_ACCESS_TOKEN?.substring(0, 20)}... ${senderPSID}`);
        console.log('');
      }
    });
    
    res.status(200).send('EVENT_RECEIVED');
  } else {
    res.sendStatus(404);
  }
});

// Health check endpoint
router.get("/health", (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Webhook handlers are running' });
});

export default router;
