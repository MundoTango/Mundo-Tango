import { Router, type Request, type Response } from "express";
import express from "express";
import { webhookDispatcher } from "../services/WebhookDispatcher";

const router = Router();

// POST /api/webhooks/stripe - Handle Stripe webhooks (raw body required)
router.post(
  "/stripe",
  express.raw({ type: "application/json" }),
  async (req: Request, res: Response) => {
    try {
      const sig = req.headers["stripe-signature"];
      
      if (!sig) {
        return res.status(400).json({ message: "Missing stripe-signature header" });
      }

      // Process webhook through dispatcher
      const event = await webhookDispatcher.processStripeWebhook(
        req.body,
        sig as string
      );

      console.log(`[Webhook] Processed Stripe event: ${event.type}`);
      res.json({ received: true, eventId: event.id });
    } catch (error: any) {
      console.error("[Webhook] Stripe webhook error:", error);
      res.status(400).json({ message: error.message || "Webhook processing failed" });
    }
  }
);

export default router;
