import { db } from "@shared/db";
import { marketplaceProducts, productPurchases, marketplaceAnalytics } from "@shared/schema";
import { eq, and, gte, lte, desc, sql, avg, count } from "drizzle-orm";

interface PricingRecommendation {
  currentPrice: number;
  recommendedPrice: number;
  priceChange: number;
  priceChangePercent: number;
  reasoning: string[];
  confidence: number;
  expectedImpact: {
    salesIncrease: number;
    revenueChange: number;
  };
  competitorAnalysis: {
    marketAverage: number;
    yourPosition: 'below' | 'at' | 'above';
    competitorCount: number;
  };
  demandAnalysis: {
    salesVelocity: number;
    trendDirection: 'increasing' | 'stable' | 'decreasing';
  };
}

interface PriceOptimizationOptions {
  productId: number;
  considerCompetitors?: boolean;
  considerDemand?: boolean;
  considerInventory?: boolean;
  considerSeasonality?: boolean;
  targetMargin?: number;
}

export class DynamicPricingAgent {
  private static readonly PLATFORM_FEE_RATE = 0.125;
  private static readonly MIN_MARGIN = 0.15;
  private static readonly PRICE_ELASTICITY = 1.5;

  static async optimizePrice(options: PriceOptimizationOptions): Promise<PricingRecommendation> {
    const product = await db
      .select()
      .from(marketplaceProducts)
      .where(eq(marketplaceProducts.id, options.productId))
      .limit(1);

    if (!product.length) {
      throw new Error('Product not found');
    }

    const currentPrice = parseFloat(product[0].price);
    const reasoning: string[] = [];
    let recommendedPrice = currentPrice;
    let confidence = 50;

    const competitorAnalysis = options.considerCompetitors !== false
      ? await this.analyzeCompetitorPricing(product[0])
      : null;

    const demandAnalysis = options.considerDemand !== false
      ? await this.analyzeDemand(options.productId)
      : null;

    const inventoryFactor = options.considerInventory !== false
      ? await this.getInventoryPricingFactor(product[0])
      : 1;

    const seasonalityFactor = options.considerSeasonality !== false
      ? await this.getSeasonalityFactor(product[0])
      : 1;

    if (competitorAnalysis) {
      const marketPrice = competitorAnalysis.marketAverage;
      
      if (currentPrice > marketPrice * 1.2) {
        recommendedPrice = Math.min(recommendedPrice, marketPrice * 1.1);
        reasoning.push(`Pricing above market average by ${((currentPrice / marketPrice - 1) * 100).toFixed(1)}% - recommend lowering to stay competitive`);
        confidence += 15;
      } else if (currentPrice < marketPrice * 0.8) {
        recommendedPrice = Math.max(recommendedPrice, marketPrice * 0.9);
        reasoning.push(`Pricing significantly below market - opportunity to increase margins`);
        confidence += 10;
      }
    }

    if (demandAnalysis) {
      if (demandAnalysis.trendDirection === 'increasing' && demandAnalysis.salesVelocity > 5) {
        recommendedPrice *= 1.05;
        reasoning.push(`High demand detected - sales velocity of ${demandAnalysis.salesVelocity} units/day supports price increase`);
        confidence += 20;
      } else if (demandAnalysis.trendDirection === 'decreasing') {
        recommendedPrice *= 0.95;
        reasoning.push(`Declining demand - strategic price reduction recommended to stimulate sales`);
        confidence += 15;
      }
    }

    if (inventoryFactor !== 1) {
      recommendedPrice *= inventoryFactor;
      if (inventoryFactor < 1) {
        reasoning.push(`Overstock situation - temporary discount to accelerate inventory turnover`);
        confidence += 10;
      } else {
        reasoning.push(`Limited inventory - premium pricing justified`);
        confidence += 10;
      }
    }

    if (seasonalityFactor !== 1) {
      recommendedPrice *= seasonalityFactor;
      if (seasonalityFactor > 1) {
        reasoning.push(`Peak season pricing - increased demand supports higher price point`);
        confidence += 10;
      } else {
        reasoning.push(`Off-season adjustment - lower price to maintain sales volume`);
        confidence += 5;
      }
    }

    const targetMargin = options.targetMargin || this.MIN_MARGIN;
    const minPrice = currentPrice * (1 + targetMargin) / (1 - this.PLATFORM_FEE_RATE);
    if (recommendedPrice < minPrice) {
      recommendedPrice = minPrice;
      reasoning.push(`Price floor applied to maintain ${(targetMargin * 100).toFixed(0)}% margin after platform fees`);
    }

    recommendedPrice = Math.round(recommendedPrice * 100) / 100;

    const priceChange = recommendedPrice - currentPrice;
    const priceChangePercent = (priceChange / currentPrice) * 100;

    const expectedSalesImpact = this.estimateSalesImpact(
      priceChangePercent,
      demandAnalysis?.salesVelocity || 1
    );

    return {
      currentPrice,
      recommendedPrice,
      priceChange,
      priceChangePercent,
      reasoning,
      confidence: Math.min(confidence, 95),
      expectedImpact: {
        salesIncrease: expectedSalesImpact.salesChange,
        revenueChange: expectedSalesImpact.revenueChange
      },
      competitorAnalysis: competitorAnalysis || {
        marketAverage: currentPrice,
        yourPosition: 'at',
        competitorCount: 0
      },
      demandAnalysis: demandAnalysis || {
        salesVelocity: 0,
        trendDirection: 'stable'
      }
    };
  }

  private static async analyzeCompetitorPricing(product: typeof marketplaceProducts.$inferSelect): Promise<{
    marketAverage: number;
    yourPosition: 'below' | 'at' | 'above';
    competitorCount: number;
  }> {
    const similarProducts = await db
      .select()
      .from(marketplaceProducts)
      .where(
        and(
          eq(marketplaceProducts.category, product.category),
          eq(marketplaceProducts.status, 'published'),
          sql`${marketplaceProducts.id} != ${product.id}`
        )
      )
      .limit(50);

    if (similarProducts.length === 0) {
      return {
        marketAverage: parseFloat(product.price),
        yourPosition: 'at',
        competitorCount: 0
      };
    }

    const prices = similarProducts.map(p => parseFloat(p.price));
    const marketAverage = prices.reduce((a, b) => a + b, 0) / prices.length;
    const currentPrice = parseFloat(product.price);

    let position: 'below' | 'at' | 'above';
    if (currentPrice < marketAverage * 0.95) position = 'below';
    else if (currentPrice > marketAverage * 1.05) position = 'above';
    else position = 'at';

    return {
      marketAverage,
      yourPosition: position,
      competitorCount: similarProducts.length
    };
  }

  private static async analyzeDemand(productId: number): Promise<{
    salesVelocity: number;
    trendDirection: 'increasing' | 'stable' | 'decreasing';
  }> {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const fifteenDaysAgo = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000);

    const recentSales = await db
      .select({ count: count() })
      .from(productPurchases)
      .where(
        and(
          eq(productPurchases.productId, productId),
          gte(productPurchases.purchasedAt, thirtyDaysAgo)
        )
      );

    const veryRecentSales = await db
      .select({ count: count() })
      .from(productPurchases)
      .where(
        and(
          eq(productPurchases.productId, productId),
          gte(productPurchases.purchasedAt, fifteenDaysAgo)
        )
      );

    const totalSales = recentSales[0]?.count || 0;
    const recentCount = veryRecentSales[0]?.count || 0;
    const olderCount = totalSales - recentCount;

    const salesVelocity = totalSales / 30;

    let trendDirection: 'increasing' | 'stable' | 'decreasing';
    if (recentCount > olderCount * 1.2) {
      trendDirection = 'increasing';
    } else if (recentCount < olderCount * 0.8) {
      trendDirection = 'decreasing';
    } else {
      trendDirection = 'stable';
    }

    return { salesVelocity, trendDirection };
  }

  private static async getInventoryPricingFactor(
    product: typeof marketplaceProducts.$inferSelect
  ): Promise<number> {
    return 1;
  }

  private static async getSeasonalityFactor(
    product: typeof marketplaceProducts.$inferSelect
  ): Promise<number> {
    const now = new Date();
    const month = now.getMonth();

    if (product.category === 'course' || product.category === 'tutorial') {
      if (month === 0 || month === 8) {
        return 1.1;
      }
    }

    if (month === 10 || month === 11) {
      return 1.05;
    }

    return 1;
  }

  private static estimateSalesImpact(
    priceChangePercent: number,
    currentVelocity: number
  ): {
    salesChange: number;
    revenueChange: number;
  } {
    const elasticity = this.PRICE_ELASTICITY;
    const salesChangePercent = -priceChangePercent * elasticity;
    
    const salesChange = (salesChangePercent / 100) * currentVelocity;
    const revenueChange = priceChangePercent + salesChangePercent;

    return {
      salesChange,
      revenueChange
    };
  }

  static async runABTest(productId: number, variantPrices: number[]): Promise<{
    testId: string;
    variants: Array<{
      price: number;
      assignedTo: string;
    }>;
    estimatedDuration: number;
  }> {
    const testId = `ab_${productId}_${Date.now()}`;
    
    return {
      testId,
      variants: variantPrices.map((price, index) => ({
        price,
        assignedTo: `variant_${String.fromCharCode(65 + index)}`
      })),
      estimatedDuration: 14
    };
  }

  static async getBulkPricingRecommendations(sellerId: number): Promise<Array<{
    productId: number;
    productTitle: string;
    recommendation: PricingRecommendation;
  }>> {
    const products = await db
      .select()
      .from(marketplaceProducts)
      .where(
        and(
          eq(marketplaceProducts.creatorUserId, sellerId),
          eq(marketplaceProducts.status, 'published')
        )
      )
      .limit(20);

    const recommendations = await Promise.all(
      products.map(async (product) => {
        const recommendation = await this.optimizePrice({
          productId: product.id,
          considerCompetitors: true,
          considerDemand: true
        });

        return {
          productId: product.id,
          productTitle: product.title,
          recommendation
        };
      })
    );

    return recommendations.filter(r => Math.abs(r.recommendation.priceChangePercent) > 2);
  }
}
