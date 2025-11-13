import { db } from "@shared/db";
import { productPurchases, marketplaceProducts, users, productReviews } from "@shared/schema";
import { eq, and, gte, desc, sql, count } from "drizzle-orm";
import Stripe from "stripe";

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-11-20.acacia"
}) : null;

interface FraudCheckResult {
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  flags: string[];
  recommendations: string[];
  shouldBlock: boolean;
  details: {
    velocityScore: number;
    behaviorScore: number;
    paymentScore: number;
    ipScore: number;
  };
}

interface TransactionData {
  userId: number;
  productId: number;
  amount: number;
  ipAddress?: string;
  stripePaymentId?: string;
}

export class FraudDetectionAgent {
  private static readonly VELOCITY_THRESHOLD = 5;
  private static readonly VELOCITY_WINDOW_HOURS = 24;
  private static readonly NEW_ACCOUNT_DAYS = 7;
  private static readonly HIGH_RISK_THRESHOLD = 70;
  private static readonly MEDIUM_RISK_THRESHOLD = 40;

  static async analyzePurchase(transaction: TransactionData): Promise<FraudCheckResult> {
    const flags: string[] = [];
    const recommendations: string[] = [];
    
    const velocityScore = await this.checkTransactionVelocity(transaction.userId);
    const behaviorScore = await this.checkUserBehavior(transaction.userId);
    const paymentScore = await this.checkPaymentAnomaly(transaction);
    const ipScore = await this.checkIPAddress(transaction.ipAddress);

    const riskScore = this.calculateRiskScore({
      velocityScore,
      behaviorScore,
      paymentScore,
      ipScore
    });

    if (velocityScore > 70) {
      flags.push('Unusual purchase velocity detected');
      recommendations.push('Implement purchase cooldown period');
    }

    if (behaviorScore > 70) {
      flags.push('Suspicious user behavior pattern');
      recommendations.push('Require additional verification');
    }

    if (paymentScore > 70) {
      flags.push('Payment anomaly detected');
      recommendations.push('Hold funds for extended verification');
    }

    if (ipScore > 70) {
      flags.push('High-risk IP address detected');
      recommendations.push('Require email or SMS verification');
    }

    const riskLevel = this.determineRiskLevel(riskScore);
    const shouldBlock = riskScore >= this.HIGH_RISK_THRESHOLD;

    if (stripe && transaction.stripePaymentId) {
      await this.checkStripeRadar(transaction.stripePaymentId, flags, recommendations);
    }

    return {
      riskScore,
      riskLevel,
      flags,
      recommendations,
      shouldBlock,
      details: {
        velocityScore,
        behaviorScore,
        paymentScore,
        ipScore
      }
    };
  }

  private static async checkTransactionVelocity(userId: number): Promise<number> {
    const windowStart = new Date(Date.now() - this.VELOCITY_WINDOW_HOURS * 60 * 60 * 1000);
    
    const recentPurchases = await db
      .select({ count: count() })
      .from(productPurchases)
      .where(
        and(
          eq(productPurchases.buyerUserId, userId),
          gte(productPurchases.purchasedAt, windowStart)
        )
      );

    const purchaseCount = recentPurchases[0]?.count || 0;
    
    if (purchaseCount === 0) return 0;
    if (purchaseCount >= this.VELOCITY_THRESHOLD * 2) return 100;
    if (purchaseCount >= this.VELOCITY_THRESHOLD) return 70;
    if (purchaseCount >= this.VELOCITY_THRESHOLD / 2) return 40;
    return 20;
  }

  private static async checkUserBehavior(userId: number): Promise<number> {
    let score = 0;

    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user.length) return 100;

    const userData = user[0];
    const accountAge = Date.now() - new Date(userData.createdAt!).getTime();
    const accountAgeDays = accountAge / (1000 * 60 * 60 * 24);

    if (accountAgeDays < this.NEW_ACCOUNT_DAYS) {
      score += 30;
    }

    const totalPurchases = await db
      .select({ count: count() })
      .from(productPurchases)
      .where(eq(productPurchases.buyerUserId, userId));
    
    const purchaseCount = totalPurchases[0]?.count || 0;

    if (accountAgeDays < 1 && purchaseCount > 3) {
      score += 40;
    }

    if (!userData.isVerified) {
      score += 20;
    }

    return Math.min(score, 100);
  }

  private static async checkPaymentAnomaly(transaction: TransactionData): Promise<number> {
    let score = 0;

    const userPurchases = await db
      .select()
      .from(productPurchases)
      .where(eq(productPurchases.buyerUserId, transaction.userId))
      .orderBy(desc(productPurchases.purchasedAt))
      .limit(10);

    if (userPurchases.length > 0) {
      const amounts = userPurchases.map(p => parseFloat(p.amount));
      const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;
      
      if (transaction.amount > avgAmount * 5) {
        score += 50;
      }
    }

    if (transaction.amount > 1000) {
      score += 30;
    }

    const refundedPurchases = userPurchases.filter(p => p.refundStatus === 'refunded');
    const refundRate = userPurchases.length > 0 
      ? refundedPurchases.length / userPurchases.length 
      : 0;

    if (refundRate > 0.5) {
      score += 40;
    }

    return Math.min(score, 100);
  }

  private static async checkIPAddress(ipAddress?: string): Promise<number> {
    if (!ipAddress) return 50;

    const suspiciousPatterns = [
      /^10\./,
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
      /^192\.168\./,
      /^127\./
    ];

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(ipAddress)) {
        return 30;
      }
    }

    return 10;
  }

  private static calculateRiskScore(scores: {
    velocityScore: number;
    behaviorScore: number;
    paymentScore: number;
    ipScore: number;
  }): number {
    const weights = {
      velocity: 0.3,
      behavior: 0.3,
      payment: 0.25,
      ip: 0.15
    };

    return Math.round(
      scores.velocityScore * weights.velocity +
      scores.behaviorScore * weights.behavior +
      scores.paymentScore * weights.payment +
      scores.ipScore * weights.ip
    );
  }

  private static determineRiskLevel(score: number): 'low' | 'medium' | 'high' {
    if (score >= this.HIGH_RISK_THRESHOLD) return 'high';
    if (score >= this.MEDIUM_RISK_THRESHOLD) return 'medium';
    return 'low';
  }

  private static async checkStripeRadar(
    paymentId: string,
    flags: string[],
    recommendations: string[]
  ): Promise<void> {
    if (!stripe) return;

    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentId);
      
      if (paymentIntent.charges && paymentIntent.charges.data.length > 0) {
        const charge = paymentIntent.charges.data[0];
        const outcome = charge.outcome;

        if (outcome?.risk_level === 'elevated' || outcome?.risk_level === 'highest') {
          flags.push(`Stripe Radar: ${outcome.risk_level} risk`);
          recommendations.push('Consider additional identity verification');
        }

        if (outcome?.seller_message) {
          flags.push(`Stripe: ${outcome.seller_message}`);
        }
      }
    } catch (error) {
      console.error('[FraudDetection] Error checking Stripe Radar:', error);
    }
  }

  static async checkSellerBehavior(sellerId: number): Promise<{
    isSuspicious: boolean;
    flags: string[];
    score: number;
  }> {
    const flags: string[] = [];
    let score = 0;

    const products = await db
      .select()
      .from(marketplaceProducts)
      .where(eq(marketplaceProducts.creatorUserId, sellerId));

    if (products.length === 0) {
      return { isSuspicious: false, flags: [], score: 0 };
    }

    for (const product of products) {
      const reviews = await db
        .select()
        .from(productReviews)
        .where(eq(productReviews.productId, product.id));

      if (reviews.length > 10) {
        const ratings = reviews.map(r => r.rating);
        const avgRating = ratings.reduce((a, b) => a + b, 0) / ratings.length;

        const allFiveStars = ratings.every(r => r === 5);
        if (allFiveStars && reviews.length > 5) {
          flags.push(`Product "${product.title}" has suspiciously uniform ratings`);
          score += 30;
        }

        const reviewTexts = reviews.map(r => r.review || '');
        const shortReviews = reviewTexts.filter(t => t.length < 20);
        if (shortReviews.length / reviews.length > 0.7) {
          flags.push(`Product "${product.title}" has many short/generic reviews`);
          score += 20;
        }
      }

      const priceValue = parseFloat(product.price);
      const similarProducts = await db
        .select()
        .from(marketplaceProducts)
        .where(
          and(
            eq(marketplaceProducts.category, product.category),
            sql`${marketplaceProducts.id} != ${product.id}`
          )
        )
        .limit(20);

      if (similarProducts.length > 0) {
        const avgPrice = similarProducts.reduce(
          (sum, p) => sum + parseFloat(p.price), 
          0
        ) / similarProducts.length;

        if (priceValue < avgPrice * 0.3) {
          flags.push(`Product "${product.title}" priced suspiciously low`);
          score += 25;
        } else if (priceValue > avgPrice * 3) {
          flags.push(`Product "${product.title}" priced suspiciously high`);
          score += 15;
        }
      }
    }

    return {
      isSuspicious: score >= 40,
      flags,
      score: Math.min(score, 100)
    };
  }
}
