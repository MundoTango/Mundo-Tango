/**
 * WebhookDispatcher.ts
 * 
 * Multi-Gateway Webhook Handler for MundoTango
 * Routes and validates webhooks from Stripe, Adyen, Wise
 * 
 * MB.MD Pattern 49: International Payments Architecture
 */

import Stripe from 'stripe';
import crypto from 'crypto';

export interface WebhookEvent {
  id: string;
  type: string;
  gateway: 'stripe' | 'adyen' | 'wise';
  data: any;
  timestamp: Date;
  signature: string;
  isValid: boolean;
}

interface WebhookHandler {
  eventType: string;
  handler: (event: WebhookEvent) => Promise<void>;
}

export class WebhookDispatcher {
  private handlers: Map<string, WebhookHandler[]> = new Map();
  private stripe: Stripe | null;
  private stripeWebhookSecret: string | undefined;
  private adyenHmacKey: string | undefined;
  private wiseWebhookSecret: string | undefined;

  constructor() {
    const stripeKey = process.env.STRIPE_SECRET_KEY || process.env.TESTING_STRIPE_SECRET_KEY;
    this.stripe = stripeKey ? new Stripe(stripeKey, { apiVersion: '2025-10-29.clover' }) : null;
    this.stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    this.adyenHmacKey = process.env.ADYEN_HMAC_KEY;
    this.wiseWebhookSecret = process.env.WISE_WEBHOOK_SECRET;
  }

  registerHandler(eventType: string, handler: (event: WebhookEvent) => Promise<void>): void {
    const existing = this.handlers.get(eventType) || [];
    existing.push({ eventType, handler });
    this.handlers.set(eventType, existing);
  }

  async processStripeWebhook(payload: Buffer, signature: string): Promise<WebhookEvent> {
    if (!this.stripe || !this.stripeWebhookSecret) {
      throw new Error('Stripe webhook not configured');
    }

    try {
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        this.stripeWebhookSecret
      );

      const webhookEvent: WebhookEvent = {
        id: event.id,
        type: event.type,
        gateway: 'stripe',
        data: event.data.object,
        timestamp: new Date(event.created * 1000),
        signature,
        isValid: true
      };

      await this.dispatch(webhookEvent);
      return webhookEvent;
    } catch (error) {
      console.error('[WebhookDispatcher] Stripe webhook validation failed:', error);
      throw error;
    }
  }

  async processAdyenWebhook(payload: any, hmacSignature: string): Promise<WebhookEvent> {
    if (!this.adyenHmacKey) {
      throw new Error('Adyen webhook not configured');
    }

    const isValid = this.validateAdyenHmac(payload, hmacSignature);
    
    if (!isValid) {
      throw new Error('Adyen HMAC validation failed');
    }

    const webhookEvent: WebhookEvent = {
      id: payload.pspReference || crypto.randomUUID(),
      type: payload.eventCode,
      gateway: 'adyen',
      data: payload,
      timestamp: new Date(),
      signature: hmacSignature,
      isValid: true
    };

    await this.dispatch(webhookEvent);
    return webhookEvent;
  }

  private validateAdyenHmac(payload: any, signature: string): boolean {
    if (!this.adyenHmacKey) return false;
    
    const hmac = crypto.createHmac('sha256', Buffer.from(this.adyenHmacKey, 'hex'));
    const signedPayload = [
      payload.pspReference,
      payload.originalReference,
      payload.merchantAccountCode,
      payload.merchantReference,
      payload.amount?.value,
      payload.amount?.currency,
      payload.eventCode,
      payload.success
    ].join(':');
    
    hmac.update(signedPayload);
    const calculatedHmac = hmac.digest('base64');
    
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(calculatedHmac)
    );
  }

  async processWiseWebhook(payload: any, signature: string): Promise<WebhookEvent> {
    if (!this.wiseWebhookSecret) {
      throw new Error('Wise webhook not configured');
    }

    const isValid = this.validateWiseSignature(payload, signature);
    
    if (!isValid) {
      throw new Error('Wise signature validation failed');
    }

    const webhookEvent: WebhookEvent = {
      id: payload.data?.resource?.id || crypto.randomUUID(),
      type: payload.event_type,
      gateway: 'wise',
      data: payload.data,
      timestamp: new Date(payload.occurred_at),
      signature,
      isValid: true
    };

    await this.dispatch(webhookEvent);
    return webhookEvent;
  }

  private validateWiseSignature(payload: any, signature: string): boolean {
    if (!this.wiseWebhookSecret) return false;
    
    const hmac = crypto.createHmac('sha256', this.wiseWebhookSecret);
    hmac.update(JSON.stringify(payload));
    const calculatedSignature = hmac.digest('hex');
    
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(calculatedSignature)
    );
  }

  private async dispatch(event: WebhookEvent): Promise<void> {
    const handlers = this.handlers.get(event.type) || [];
    const wildcardHandlers = this.handlers.get('*') || [];
    
    const allHandlers = [...handlers, ...wildcardHandlers];
    
    console.log(`[WebhookDispatcher] Dispatching ${event.gateway}:${event.type} to ${allHandlers.length} handlers`);
    
    for (const { handler } of allHandlers) {
      try {
        await handler(event);
      } catch (error) {
        console.error(`[WebhookDispatcher] Handler error for ${event.type}:`, error);
      }
    }
  }

  getEventTypes(): string[] {
    return [
      'payment_intent.succeeded',
      'payment_intent.payment_failed',
      'customer.subscription.created',
      'customer.subscription.updated',
      'customer.subscription.deleted',
      'invoice.paid',
      'invoice.payment_failed',
      'charge.refunded',
      'AUTHORISATION',
      'CAPTURE',
      'REFUND',
      'CANCEL_OR_REFUND',
      'transfers#state-change',
      'transfers#active-cases'
    ];
  }
}

export const webhookDispatcher = new WebhookDispatcher();
