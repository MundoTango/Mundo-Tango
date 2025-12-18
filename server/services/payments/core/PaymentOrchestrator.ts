/**
 * PaymentOrchestrator.ts
 * 
 * Multi-Gateway Payment Orchestration Engine for MundoTango
 * Supports Stripe, Adyen, Wise, and regional payment processors
 * 
 * MB.MD Pattern 49: International Payments Architecture
 * Phase 1: Core orchestration with Stripe (USD)
 * Phase 2: EU expansion with Adyen
 * Phase 3: Global expansion (APAC, LATAM, Africa)
 * Phase 4: Multi-currency + localization
 */

import Stripe from 'stripe';
import { db } from '@shared/db';
import { eq } from 'drizzle-orm';

// Payment gateway types
export enum PaymentGateway {
  STRIPE = 'stripe',
  ADYEN = 'adyen',
  WISE = 'wise',
  MERCADOPAGO = 'mercadopago',
  ALIPAY = 'alipay',
  MPESA = 'mpesa'
}

// Payment method types
export enum PaymentMethod {
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  BANK_TRANSFER = 'bank_transfer',
  E_WALLET = 'e_wallet',
  LOCAL_PAYMENT = 'local_payment'
}

// Payment status
export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded'
}

interface PaymentRequest {
  userId: number;
  amount: number;
  currency: string;
  tierId: number;
  billingInterval: 'monthly' | 'annual';
  paymentMethod?: PaymentMethod;
  gateway?: PaymentGateway;
  metadata?: Record<string, any>;
  idempotencyKey?: string;
}

interface PaymentResult {
  success: boolean;
  transactionId?: string;
  gateway: PaymentGateway;
  status: PaymentStatus;
  message?: string;
  checkoutUrl?: string;
  error?: string;
}

export class PaymentOrchestrator {
  private stripe: Stripe | null;
  
  constructor() {
    const stripeKey = process.env.STRIPE_SECRET_KEY || process.env.TESTING_STRIPE_SECRET_KEY;
    this.stripe = stripeKey ? new Stripe(stripeKey, { apiVersion: '2025-10-29.clover' }) : null;
  }

  /**
   * Route payment to optimal gateway based on:
   * - User location/currency
   * - Payment method
   * - Gateway availability
   * - Cost optimization
   */
  async processPayment(request: PaymentRequest): Promise<PaymentResult> {
    // Generate idempotency key if not provided
    const idempotencyKey = request.idempotencyKey || this.generateIdempotencyKey(request);
    
    // Check for duplicate transaction
    const existingTransaction = await this.checkDuplicateTransaction(idempotencyKey);
    if (existingTransaction) {
      return {
        success: true,
        transactionId: existingTransaction.id.toString(),
        gateway: existingTransaction.gateway as PaymentGateway,
        status: existingTransaction.status as PaymentStatus,
        message: 'Duplicate transaction prevented'
      };
    }

    // Select optimal gateway
    const gateway = request.gateway || await this.selectGateway(request);
    
    try {
      let result: PaymentResult;
      
      switch (gateway) {
        case PaymentGateway.STRIPE:
          result = await this.processStripePayment(request, idempotencyKey);
          break;
        case PaymentGateway.ADYEN:
          result = await this.processAdyenPayment(request, idempotencyKey);
          break;
        case PaymentGateway.WISE:
          result = await this.processWisePayment(request, idempotencyKey);
          break;
        default:
          throw new Error(`Gateway ${gateway} not implemented`);
      }
      
      // Record transaction in database
      await this.recordTransaction({
        ...request,
        gateway,
        result,
        idempotencyKey
      });
      
      return result;
    } catch (error: any) {
      console.error(`Payment processing error (${gateway}):`, error);
      return {
        success: false,
        gateway,
        status: PaymentStatus.FAILED,
        error: error.message
      };
    }
  }

  /**
   * PHASE 1: Stripe payment processing (USD, cards)
   */
  private async processStripePayment(
    request: PaymentRequest,
    idempotencyKey: string
  ): Promise<PaymentResult> {
    if (!this.stripe) {
      throw new Error('Stripe not configured');
    }

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [{
        price_data: {
          currency: request.currency.toLowerCase(),
          product_data: {
            name: `MundoTango ${request.billingInterval} subscription`
          },
          recurring: {
            interval: request.billingInterval === 'annual' ? 'year' : 'month'
          },
          unit_amount: request.amount
        },
        quantity: 1
      }],
      success_url: `${process.env.BASE_URL}/upgrade/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.BASE_URL}/upgrade/cancelled`,
      client_reference_id: request.userId.toString(),
      metadata: {
        userId: request.userId.toString(),
        tierId: request.tierId.toString(),
        billingInterval: request.billingInterval,
        idempotencyKey,
        ...request.metadata
      }
    }, {
      idempotencyKey
    });

    return {
      success: true,
      transactionId: session.id,
      gateway: PaymentGateway.STRIPE,
      status: PaymentStatus.PENDING,
      checkoutUrl: session.url || undefined,
      message: 'Stripe checkout session created'
    };
  }

  /**
   * PHASE 2: Adyen payment processing (EU, multiple methods)
   * TODO: Implement when Adyen merchant account is ready
   */
  private async processAdyenPayment(
    request: PaymentRequest,
    idempotencyKey: string
  ): Promise<PaymentResult> {
    throw new Error('Adyen integration not yet implemented (Phase 2)');
  }

  /**
   * PHASE 3: Wise payment processing (B2B international transfers)
   * TODO: Implement when Wise business account is ready
   */
  private async processWisePayment(
    request: PaymentRequest,
    idempotencyKey: string
  ): Promise<PaymentResult> {
    throw new Error('Wise integration not yet implemented (Phase 3)');
  }

  /**
   * Check if any payment gateway is configured
   */
  isConfigured(): boolean {
    return this.stripe !== null;
  }

  /**
   * Select optimal payment gateway based on rules
   */
  private async selectGateway(request: PaymentRequest): Promise<PaymentGateway> {
    // Phase 1: Default to Stripe
    // Phase 2+: Smart routing based on:
    // - Currency (EUR -> Adyen, USD -> Stripe)
    // - User location (detected via IP/profile)
    // - Payment method (bank transfer -> Wise)
    // - Transaction size (large B2B -> Wise)
    
    const currency = request.currency.toUpperCase();
    
    // Future routing logic (Phase 2+)
    if (currency === 'EUR' || currency === 'GBP') {
      // return PaymentGateway.ADYEN; // Phase 2
    }
    
    if (request.amount > 100000) { // Large transactions
      // return PaymentGateway.WISE; // Phase 3
    }
    
    // Safety: Check if Stripe is available before routing to it
    if (!this.stripe) {
      throw new Error('No payment gateway configured. Please set STRIPE_SECRET_KEY environment variable.');
    }
    
    // Default: Stripe
    return PaymentGateway.STRIPE;
  }

  /**
   * Generate idempotency key for duplicate prevention
   */
  private generateIdempotencyKey(request: PaymentRequest): string {
    const timestamp = Date.now();
    const data = `${request.userId}-${request.tierId}-${request.amount}-${timestamp}`;
    // In production, use crypto.createHash('sha256').update(data).digest('hex')
    return Buffer.from(data).toString('base64');
  }

  /**
   * Check for duplicate transaction
   */
  private async checkDuplicateTransaction(idempotencyKey: string): Promise<any | null> {
    // TODO: Query payment_transactions table
    // const [transaction] = await db.select()
    //   .from(paymentTransactions)
    //   .where(eq(paymentTransactions.idempotencyKey, idempotencyKey))
    //   .limit(1);
    // return transaction || null;
    return null; // Placeholder
  }

  /**
   * Record transaction in database
   */
  private async recordTransaction(data: any): Promise<void> {
    // TODO: Insert into payment_transactions table
    console.log('Recording transaction:', data);
  }
}
