/**
 * WebhookHandlers.ts
 * 
 * Registers all Stripe webhook event handlers
 * MB.MD Pattern 49: International Payments Architecture
 */

import { db } from "@shared/db";
import { sql } from "drizzle-orm";
import { webhookDispatcher, type WebhookEvent } from "./WebhookDispatcher";

// Register all webhook handlers
export function registerWebhookHandlers() {
  // Handle subscription created
  webhookDispatcher.registerHandler("customer.subscription.created", async (event: WebhookEvent) => {
    const subscription = event.data;
    const userId = subscription.metadata?.userId || subscription.client_reference_id;

    if (!userId) {
      console.error("[Webhook] No userId found in subscription.created event");
      return;
    }

    // Determine plan ID from price ID
    const priceId = subscription.items.data[0]?.price.id;
    const tierResult = await db.execute(sql`
      SELECT name FROM pricing_tiers 
      WHERE stripe_monthly_price_id = ${priceId} OR stripe_annual_price_id = ${priceId}
      LIMIT 1
    `);

    const planId = tierResult.rows.length > 0 ? (tierResult.rows[0] as any).name : "pro";

    await db.execute(sql`
      INSERT INTO subscriptions (
        user_id,
        plan_id,
        status,
        current_period_start,
        current_period_end,
        cancel_at_period_end,
        payment_provider,
        provider_subscription_id,
        stripe_customer_id,
        stripe_subscription_id,
        metadata,
        created_at,
        updated_at
      ) VALUES (
        ${userId},
        ${planId},
        ${subscription.status},
        ${new Date(subscription.current_period_start * 1000)},
        ${new Date(subscription.current_period_end * 1000)},
        ${subscription.cancel_at_period_end || false},
        'stripe',
        ${subscription.id},
        ${subscription.customer},
        ${subscription.id},
        ${JSON.stringify(subscription.metadata || {})},
        NOW(),
        NOW()
      )
      ON CONFLICT (user_id, provider_subscription_id) DO UPDATE SET
        status = ${subscription.status},
        current_period_start = ${new Date(subscription.current_period_start * 1000)},
        current_period_end = ${new Date(subscription.current_period_end * 1000)},
        cancel_at_period_end = ${subscription.cancel_at_period_end || false},
        updated_at = NOW()
    `);

    console.log(`[Webhook] Created/updated subscription for user ${userId}`);
  });

  // Handle subscription updated
  webhookDispatcher.registerHandler("customer.subscription.updated", async (event: WebhookEvent) => {
    const subscription = event.data;

    await db.execute(sql`
      UPDATE subscriptions
      SET 
        status = ${subscription.status},
        current_period_start = ${new Date(subscription.current_period_start * 1000)},
        current_period_end = ${new Date(subscription.current_period_end * 1000)},
        cancel_at_period_end = ${subscription.cancel_at_period_end || false},
        updated_at = NOW()
      WHERE stripe_subscription_id = ${subscription.id}
    `);

    console.log(`[Webhook] Updated subscription ${subscription.id}`);
  });

  // Handle subscription deleted/cancelled
  webhookDispatcher.registerHandler("customer.subscription.deleted", async (event: WebhookEvent) => {
    const subscription = event.data;

    await db.execute(sql`
      UPDATE subscriptions
      SET 
        status = 'cancelled',
        cancel_at_period_end = true,
        updated_at = NOW()
      WHERE stripe_subscription_id = ${subscription.id}
    `);

    console.log(`[Webhook] Cancelled subscription ${subscription.id}`);
  });

  // Handle successful payment
  webhookDispatcher.registerHandler("invoice.paid", async (event: WebhookEvent) => {
    const invoice = event.data;
    const subscriptionId = invoice.subscription;

    if (subscriptionId) {
      await db.execute(sql`
        UPDATE subscriptions
        SET 
          status = 'active',
          updated_at = NOW()
        WHERE stripe_subscription_id = ${subscriptionId}
      `);

      console.log(`[Webhook] Payment successful for subscription ${subscriptionId}`);
    }
  });

  // Handle failed payment
  webhookDispatcher.registerHandler("invoice.payment_failed", async (event: WebhookEvent) => {
    const invoice = event.data;
    const subscriptionId = invoice.subscription;

    if (subscriptionId) {
      await db.execute(sql`
        UPDATE subscriptions
        SET 
          status = 'past_due',
          updated_at = NOW()
        WHERE stripe_subscription_id = ${subscriptionId}
      `);

      console.log(`[Webhook] Payment failed for subscription ${subscriptionId}`);
    }
  });

  console.log("[Webhook] All handlers registered successfully");
}
