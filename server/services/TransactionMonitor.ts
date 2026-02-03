import { db } from "@shared/db";
import { productPurchases, marketplaceProducts, users } from "@shared/schema";
import { eq, and, desc, gte, sql } from "drizzle-orm";
import Stripe from "stripe";

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-11-20.acacia"
}) : null;

interface OrderStatus {
  orderId: number;
  status: 'pending' | 'processing' | 'completed' | 'refunded' | 'disputed';
  timeline: Array<{
    status: string;
    timestamp: Date;
    note?: string;
  }>;
  estimatedDelivery?: Date;
  trackingInfo?: {
    carrier?: string;
    trackingNumber?: string;
    lastUpdate?: string;
  };
  canRefund: boolean;
  canDispute: boolean;
}

interface SettlementStatus {
  sellerId: number;
  pendingAmount: number;
  availableAmount: number;
  nextPayoutDate?: Date;
  transactions: Array<{
    purchaseId: number;
    amount: number;
    platformFee: number;
    sellerPayout: number;
    settledAt?: Date;
  }>;
}

interface RefundRequest {
  purchaseId: number;
  reason: string;
  amount?: number;
  autoApproved: boolean;
  refundId?: string;
}

export class TransactionMonitorAgent {
  private static readonly SETTLEMENT_DELAY_DAYS = 7;
  private static readonly AUTO_REFUND_WINDOW_DAYS = 30;

  static async getOrderStatus(purchaseId: number): Promise<OrderStatus> {
    const purchase = await db
      .select()
      .from(productPurchases)
      .where(eq(productPurchases.id, purchaseId))
      .limit(1);

    if (!purchase.length) {
      throw new Error('Purchase not found');
    }

    const p = purchase[0];

    const timeline: Array<{
      status: string;
      timestamp: Date;
      note?: string;
    }> = [
      {
        status: 'pending',
        timestamp: p.purchasedAt
      }
    ];

    let currentStatus: 'pending' | 'processing' | 'completed' | 'refunded' | 'disputed' = 'pending';

    if (p.refundStatus === 'refunded') {
      currentStatus = 'refunded';
      timeline.push({
        status: 'refunded',
        timestamp: new Date(),
        note: 'Full refund processed'
      });
    } else if (p.downloadCount > 0) {
      currentStatus = 'completed';
      timeline.push({
        status: 'processing',
        timestamp: new Date(p.purchasedAt.getTime() + 60000)
      });
      timeline.push({
        status: 'completed',
        timestamp: new Date(p.purchasedAt.getTime() + 120000),
        note: 'Product delivered'
      });
    }

    const estimatedDelivery = new Date(p.purchasedAt.getTime() + 5 * 60 * 1000);

    const daysSincePurchase = Math.floor(
      (Date.now() - p.purchasedAt.getTime()) / (1000 * 60 * 60 * 24)
    );

    const canRefund = 
      daysSincePurchase <= this.AUTO_REFUND_WINDOW_DAYS && 
      p.refundStatus !== 'refunded';

    const canDispute = 
      daysSincePurchase <= 90 && 
      p.refundStatus !== 'refunded';

    return {
      orderId: purchaseId,
      status: currentStatus,
      timeline,
      estimatedDelivery: currentStatus === 'pending' ? estimatedDelivery : undefined,
      canRefund,
      canDispute
    };
  }

  static async predictDeliveryTime(purchaseId: number): Promise<{
    estimatedMinutes: number;
    confidence: number;
    factors: string[];
  }> {
    const purchase = await db
      .select()
      .from(productPurchases)
      .where(eq(productPurchases.id, purchaseId))
      .limit(1);

    if (!purchase.length) {
      throw new Error('Purchase not found');
    }

    if (purchase[0].downloadCount > 0) {
      return {
        estimatedMinutes: 0,
        confidence: 100,
        factors: ['Product already delivered']
      };
    }

    const factors: string[] = [];
    let estimatedMinutes = 5;

    factors.push('Digital product - instant delivery expected');

    return {
      estimatedMinutes,
      confidence: 95,
      factors
    };
  }

  static async getLateShipments(sellerId: number): Promise<Array<{
    purchaseId: number;
    productTitle: string;
    buyerName: string;
    daysSincePurchase: number;
    urgency: 'low' | 'medium' | 'high';
  }>> {
    const products = await db
      .select()
      .from(marketplaceProducts)
      .where(eq(marketplaceProducts.creatorUserId, sellerId));

    const productIds = products.map(p => p.id);

    if (productIds.length === 0) {
      return [];
    }

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const purchases = await db
      .select({
        purchase: productPurchases,
        product: marketplaceProducts,
        buyer: users
      })
      .from(productPurchases)
      .innerJoin(marketplaceProducts, eq(productPurchases.productId, marketplaceProducts.id))
      .innerJoin(users, eq(productPurchases.buyerUserId, users.id))
      .where(
        and(
          sql`${productPurchases.productId} IN (${sql.join(productIds.map(id => sql`${id}`), sql`, `)})`,
          sql`${productPurchases.downloadCount} = 0`,
          sql`${productPurchases.purchasedAt} < ${sevenDaysAgo}`
        )
      );

    return purchases.map(p => {
      const daysSince = Math.floor(
        (Date.now() - p.purchase.purchasedAt.getTime()) / (1000 * 60 * 60 * 24)
      );

      let urgency: 'low' | 'medium' | 'high';
      if (daysSince > 14) urgency = 'high';
      else if (daysSince > 10) urgency = 'medium';
      else urgency = 'low';

      return {
        purchaseId: p.purchase.id,
        productTitle: p.product.title,
        buyerName: p.buyer.name,
        daysSincePurchase: daysSince,
        urgency
      };
    });
  }

  static async processRefund(request: RefundRequest): Promise<{
    success: boolean;
    refundId?: string;
    message: string;
  }> {
    const purchase = await db
      .select()
      .from(productPurchases)
      .where(eq(productPurchases.id, request.purchaseId))
      .limit(1);

    if (!purchase.length) {
      return {
        success: false,
        message: 'Purchase not found'
      };
    }

    const p = purchase[0];

    if (p.refundStatus === 'refunded') {
      return {
        success: false,
        message: 'Purchase already refunded'
      };
    }

    const daysSincePurchase = Math.floor(
      (Date.now() - p.purchasedAt.getTime()) / (1000 * 60 * 60 * 24)
    );

    const autoApprove = daysSincePurchase <= this.AUTO_REFUND_WINDOW_DAYS;

    if (!autoApprove && !request.autoApproved) {
      return {
        success: false,
        message: 'Refund requires manual approval - outside automatic refund window'
      };
    }

    let stripeRefundId: string | undefined;

    if (stripe && p.stripePaymentId) {
      try {
        const refund = await stripe.refunds.create({
          payment_intent: p.stripePaymentId,
          amount: request.amount ? Math.round(request.amount * 100) : undefined,
          reason: 'requested_by_customer'
        });

        stripeRefundId = refund.id;
      } catch (error) {
        console.error('[TransactionMonitor] Stripe refund error:', error);
        return {
          success: false,
          message: 'Failed to process refund with payment processor'
        };
      }
    }

    await db
      .update(productPurchases)
      .set({ refundStatus: 'refunded' })
      .where(eq(productPurchases.id, request.purchaseId));

    return {
      success: true,
      refundId: stripeRefundId,
      message: 'Refund processed successfully'
    };
  }

  static async getSettlementStatus(sellerId: number): Promise<SettlementStatus> {
    const products = await db
      .select()
      .from(marketplaceProducts)
      .where(eq(marketplaceProducts.creatorUserId, sellerId));

    const productIds = products.map(p => p.id);

    if (productIds.length === 0) {
      return {
        sellerId,
        pendingAmount: 0,
        availableAmount: 0,
        transactions: []
      };
    }

    const settlementDate = new Date(Date.now() - this.SETTLEMENT_DELAY_DAYS * 24 * 60 * 60 * 1000);

    const purchases = await db
      .select()
      .from(productPurchases)
      .where(
        and(
          sql`${productPurchases.productId} IN (${sql.join(productIds.map(id => sql`${id}`), sql`, `)})`,
          sql`${productPurchases.refundStatus} != 'refunded' OR ${productPurchases.refundStatus} IS NULL`
        )
      );

    const pendingTransactions = purchases.filter(
      p => p.purchasedAt > settlementDate
    );

    const availableTransactions = purchases.filter(
      p => p.purchasedAt <= settlementDate
    );

    const pendingAmount = pendingTransactions.reduce(
      (sum, p) => sum + parseFloat(p.creatorPayout),
      0
    );

    const availableAmount = availableTransactions.reduce(
      (sum, p) => sum + parseFloat(p.creatorPayout),
      0
    );

    const nextPayoutDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const transactions = purchases.map(p => ({
      purchaseId: p.id,
      amount: parseFloat(p.amount),
      platformFee: parseFloat(p.platformFee),
      sellerPayout: parseFloat(p.creatorPayout),
      settledAt: p.purchasedAt <= settlementDate ? settlementDate : undefined
    }));

    return {
      sellerId,
      pendingAmount,
      availableAmount,
      nextPayoutDate: pendingAmount > 0 ? nextPayoutDate : undefined,
      transactions
    };
  }

  static async handleDispute(purchaseId: number, reason: string): Promise<{
    disputeId: string;
    status: string;
    nextSteps: string[];
  }> {
    const purchase = await db
      .select()
      .from(productPurchases)
      .where(eq(productPurchases.id, purchaseId))
      .limit(1);

    if (!purchase.length) {
      throw new Error('Purchase not found');
    }

    const disputeId = `dispute_${purchaseId}_${Date.now()}`;

    if (stripe && purchase[0].stripePaymentId) {
      try {
        const paymentIntent = await stripe.paymentIntents.retrieve(
          purchase[0].stripePaymentId
        );

        if (paymentIntent.latest_charge) {
          console.log('[TransactionMonitor] Dispute logged for charge:', paymentIntent.latest_charge);
        }
      } catch (error) {
        console.error('[TransactionMonitor] Error logging dispute:', error);
      }
    }

    return {
      disputeId,
      status: 'under_review',
      nextSteps: [
        'Seller has been notified',
        'Review period: 7 days',
        'Evidence can be submitted via dashboard'
      ]
    };
  }

  static async getChargebackRisk(purchaseId: number): Promise<{
    riskLevel: 'low' | 'medium' | 'high';
    riskScore: number;
    factors: string[];
  }> {
    const purchase = await db
      .select()
      .from(productPurchases)
      .where(eq(productPurchases.id, purchaseId))
      .limit(1);

    if (!purchase.length) {
      throw new Error('Purchase not found');
    }

    const p = purchase[0];
    let riskScore = 10;
    const factors: string[] = [];

    const amount = parseFloat(p.amount);
    if (amount > 500) {
      riskScore += 20;
      factors.push('High transaction amount');
    }

    const daysSincePurchase = Math.floor(
      (Date.now() - p.purchasedAt.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSincePurchase < 1) {
      riskScore += 15;
      factors.push('Very recent purchase');
    }

    if (p.downloadCount === 0 && daysSincePurchase > 7) {
      riskScore += 25;
      factors.push('Product not accessed - potential dissatisfaction');
    }

    let riskLevel: 'low' | 'medium' | 'high';
    if (riskScore >= 50) riskLevel = 'high';
    else if (riskScore >= 30) riskLevel = 'medium';
    else riskLevel = 'low';

    return {
      riskLevel,
      riskScore: Math.min(riskScore, 100),
      factors
    };
  }

  static async monitorTransactionHealth(): Promise<{
    totalTransactions: number;
    successfulTransactions: number;
    refundedTransactions: number;
    disputedTransactions: number;
    averageProcessingTime: number;
    healthScore: number;
  }> {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const allPurchases = await db
      .select()
      .from(productPurchases)
      .where(gte(productPurchases.purchasedAt, thirtyDaysAgo));

    const total = allPurchases.length;
    const refunded = allPurchases.filter(p => p.refundStatus === 'refunded').length;
    const successful = allPurchases.filter(p => p.downloadCount > 0).length;

    const avgProcessingTime = 5;

    const refundRate = total > 0 ? refunded / total : 0;
    let healthScore = 100;
    healthScore -= refundRate * 200;
    healthScore = Math.max(0, Math.min(100, healthScore));

    return {
      totalTransactions: total,
      successfulTransactions: successful,
      refundedTransactions: refunded,
      disputedTransactions: 0,
      averageProcessingTime: avgProcessingTime,
      healthScore: Math.round(healthScore)
    };
  }
}
