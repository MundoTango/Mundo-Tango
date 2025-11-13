import { db } from "@shared/db";
import { marketplaceProducts, productPurchases, productReviews, marketplaceAnalytics, users } from "@shared/schema";
import { eq, and, desc, sql, gte, count, sum, avg } from "drizzle-orm";
import { ReviewAnalyzerAgent } from "./ReviewAnalyzer";

interface SellerPerformance {
  sellerId: number;
  period: string;
  metrics: {
    totalRevenue: number;
    totalSales: number;
    averageOrderValue: number;
    productCount: number;
    averageRating: number;
    reviewCount: number;
    conversionRate: number;
  };
  topProducts: Array<{
    productId: number;
    title: string;
    revenue: number;
    sales: number;
    rating: number;
  }>;
  trends: {
    revenueGrowth: number;
    salesGrowth: number;
    customerSatisfactionTrend: 'improving' | 'stable' | 'declining';
  };
  recommendations: string[];
}

interface ListingQualityScore {
  productId: number;
  productTitle: string;
  overallScore: number;
  scores: {
    titleQuality: number;
    descriptionQuality: number;
    imageQuality: number;
    pricingCompetitiveness: number;
    categoryAccuracy: number;
  };
  issues: string[];
  improvements: string[];
}

interface RevenueForecas {
  sellerId: number;
  nextMonthRevenue: number;
  nextQuarterRevenue: number;
  confidence: number;
  assumptions: string[];
  riskFactors: string[];
}

export class SellerSupportAgent {
  static async getSellerPerformance(
    sellerId: number,
    period: 'day' | 'week' | 'month' | 'quarter' = 'month'
  ): Promise<SellerPerformance> {
    const periodDays = {
      day: 1,
      week: 7,
      month: 30,
      quarter: 90
    };

    const startDate = new Date(Date.now() - periodDays[period] * 24 * 60 * 60 * 1000);
    const previousStartDate = new Date(startDate.getTime() - periodDays[period] * 24 * 60 * 60 * 1000);

    const products = await db
      .select()
      .from(marketplaceProducts)
      .where(eq(marketplaceProducts.creatorUserId, sellerId));

    const productIds = products.map(p => p.id);

    if (productIds.length === 0) {
      return this.getEmptyPerformance(sellerId, period);
    }

    const currentPeriodPurchases = await db
      .select({
        revenue: sum(productPurchases.amount),
        sales: count(),
        averageValue: avg(productPurchases.amount)
      })
      .from(productPurchases)
      .where(
        and(
          sql`${productPurchases.productId} IN (${sql.join(productIds.map(id => sql`${id}`), sql`, `)})`,
          gte(productPurchases.purchasedAt, startDate)
        )
      );

    const previousPeriodPurchases = await db
      .select({
        revenue: sum(productPurchases.amount),
        sales: count()
      })
      .from(productPurchases)
      .where(
        and(
          sql`${productPurchases.productId} IN (${sql.join(productIds.map(id => sql`${id}`), sql`, `)})`,
          gte(productPurchases.purchasedAt, previousStartDate),
          sql`${productPurchases.purchasedAt} < ${startDate}`
        )
      );

    const currentRevenue = parseFloat(currentPeriodPurchases[0]?.revenue || '0');
    const currentSales = currentPeriodPurchases[0]?.sales || 0;
    const averageOrderValue = parseFloat(currentPeriodPurchases[0]?.averageValue || '0');

    const previousRevenue = parseFloat(previousPeriodPurchases[0]?.revenue || '0');
    const previousSales = previousPeriodPurchases[0]?.sales || 0;

    const revenueGrowth = previousRevenue > 0 
      ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 
      : 0;
    const salesGrowth = previousSales > 0 
      ? ((currentSales - previousSales) / previousSales) * 100 
      : 0;

    const reviews = await db
      .select({
        avgRating: avg(productReviews.rating),
        count: count()
      })
      .from(productReviews)
      .where(
        sql`${productReviews.productId} IN (${sql.join(productIds.map(id => sql`${id}`), sql`, `)})`
      );

    const averageRating = parseFloat(reviews[0]?.avgRating || '0');
    const reviewCount = reviews[0]?.count || 0;

    const topProducts = await this.getTopProducts(sellerId, startDate, 5);

    const conversionRate = await this.calculateConversionRate(productIds);

    const recommendations = this.generateRecommendations({
      revenueGrowth,
      salesGrowth,
      averageRating,
      conversionRate,
      productCount: products.length
    });

    const customerSatisfactionTrend = await this.analyzeCustomerSatisfactionTrend(
      productIds,
      startDate
    );

    return {
      sellerId,
      period,
      metrics: {
        totalRevenue: currentRevenue,
        totalSales: currentSales,
        averageOrderValue,
        productCount: products.length,
        averageRating,
        reviewCount,
        conversionRate
      },
      topProducts,
      trends: {
        revenueGrowth,
        salesGrowth,
        customerSatisfactionTrend
      },
      recommendations
    };
  }

  private static async getTopProducts(
    sellerId: number,
    startDate: Date,
    limit: number
  ): Promise<Array<{
    productId: number;
    title: string;
    revenue: number;
    sales: number;
    rating: number;
  }>> {
    const products = await db
      .select()
      .from(marketplaceProducts)
      .where(eq(marketplaceProducts.creatorUserId, sellerId))
      .orderBy(desc(marketplaceProducts.revenue))
      .limit(limit);

    const result = await Promise.all(
      products.map(async product => {
        const purchases = await db
          .select({
            revenue: sum(productPurchases.amount),
            sales: count()
          })
          .from(productPurchases)
          .where(
            and(
              eq(productPurchases.productId, product.id),
              gte(productPurchases.purchasedAt, startDate)
            )
          );

        return {
          productId: product.id,
          title: product.title,
          revenue: parseFloat(purchases[0]?.revenue || '0'),
          sales: purchases[0]?.sales || 0,
          rating: parseFloat(product.rating || '0')
        };
      })
    );

    return result.sort((a, b) => b.revenue - a.revenue);
  }

  private static async calculateConversionRate(productIds: number[]): Promise<number> {
    if (productIds.length === 0) return 0;

    return 0.05;
  }

  private static generateRecommendations(metrics: {
    revenueGrowth: number;
    salesGrowth: number;
    averageRating: number;
    conversionRate: number;
    productCount: number;
  }): string[] {
    const recommendations: string[] = [];

    if (metrics.revenueGrowth < 0) {
      recommendations.push('Revenue declining - consider promotional campaigns or pricing adjustments');
    } else if (metrics.revenueGrowth > 20) {
      recommendations.push('Strong revenue growth - consider expanding product line');
    }

    if (metrics.salesGrowth < -10) {
      recommendations.push('Sales volume dropping - review product positioning and marketing');
    }

    if (metrics.averageRating < 4.0) {
      recommendations.push('Below-average ratings - focus on product quality and customer service');
    } else if (metrics.averageRating >= 4.5) {
      recommendations.push('Excellent ratings - leverage in marketing materials');
    }

    if (metrics.conversionRate < 0.02) {
      recommendations.push('Low conversion rate - improve product images and descriptions');
    }

    if (metrics.productCount < 5) {
      recommendations.push('Limited product catalog - diversify offerings to increase revenue');
    }

    return recommendations;
  }

  private static async analyzeCustomerSatisfactionTrend(
    productIds: number[],
    startDate: Date
  ): Promise<'improving' | 'stable' | 'declining'> {
    if (productIds.length === 0) return 'stable';

    const midpoint = new Date((Date.now() + startDate.getTime()) / 2);

    const recentReviews = await db
      .select({ avgRating: avg(productReviews.rating) })
      .from(productReviews)
      .where(
        and(
          sql`${productReviews.productId} IN (${sql.join(productIds.map(id => sql`${id}`), sql`, `)})`,
          gte(productReviews.createdAt, midpoint)
        )
      );

    const olderReviews = await db
      .select({ avgRating: avg(productReviews.rating) })
      .from(productReviews)
      .where(
        and(
          sql`${productReviews.productId} IN (${sql.join(productIds.map(id => sql`${id}`), sql`, `)})`,
          gte(productReviews.createdAt, startDate),
          sql`${productReviews.createdAt} < ${midpoint}`
        )
      );

    const recentAvg = parseFloat(recentReviews[0]?.avgRating || '0');
    const olderAvg = parseFloat(olderReviews[0]?.avgRating || '0');

    if (recentAvg > olderAvg + 0.3) return 'improving';
    if (recentAvg < olderAvg - 0.3) return 'declining';
    return 'stable';
  }

  static async scoreListingQuality(productId: number): Promise<ListingQualityScore> {
    const product = await db
      .select()
      .from(marketplaceProducts)
      .where(eq(marketplaceProducts.id, productId))
      .limit(1);

    if (!product.length) {
      throw new Error('Product not found');
    }

    const p = product[0];

    const scores = {
      titleQuality: this.scoreTitleQuality(p.title),
      descriptionQuality: this.scoreDescriptionQuality(p.description),
      imageQuality: this.scoreImageQuality(p.mediaUrls || []),
      pricingCompetitiveness: await this.scorePricingCompetitiveness(p),
      categoryAccuracy: this.scoreCategoryAccuracy(p)
    };

    const overallScore = Object.values(scores).reduce((sum, score) => sum + score, 0) / 5;

    const issues: string[] = [];
    const improvements: string[] = [];

    if (scores.titleQuality < 60) {
      issues.push('Title could be more descriptive');
      improvements.push('Add relevant keywords and make title more compelling');
    }

    if (scores.descriptionQuality < 60) {
      issues.push('Description lacks detail');
      improvements.push('Expand description with features, benefits, and usage instructions');
    }

    if (scores.imageQuality < 60) {
      issues.push('Insufficient or low-quality images');
      improvements.push('Add high-resolution product images (minimum 3 recommended)');
    }

    if (scores.pricingCompetitiveness < 60) {
      issues.push('Pricing not competitive');
      improvements.push('Review pricing against similar products');
    }

    return {
      productId,
      productTitle: p.title,
      overallScore,
      scores,
      issues,
      improvements
    };
  }

  private static scoreTitleQuality(title: string): number {
    let score = 50;

    if (title.length >= 20) score += 20;
    if (title.length >= 40) score += 10;
    if (title.length > 80) score -= 20;

    const hasNumbers = /\d/.test(title);
    if (hasNumbers) score += 10;

    const capitalizedWords = title.split(' ').filter(word => 
      word.length > 3 && word[0] === word[0].toUpperCase()
    );
    score += Math.min(capitalizedWords.length * 5, 20);

    return Math.min(score, 100);
  }

  private static scoreDescriptionQuality(description: string): number {
    let score = 50;

    if (description.length >= 100) score += 15;
    if (description.length >= 300) score += 20;
    if (description.length >= 500) score += 15;

    const hasBulletPoints = description.includes('•') || description.includes('-') || description.includes('*');
    if (hasBulletPoints) score += 10;

    const paragraphs = description.split('\n').filter(p => p.trim().length > 0);
    if (paragraphs.length >= 2) score += 10;

    return Math.min(score, 100);
  }

  private static scoreImageQuality(mediaUrls: string[]): number {
    let score = 0;

    if (mediaUrls.length === 0) return 0;
    if (mediaUrls.length >= 1) score += 40;
    if (mediaUrls.length >= 3) score += 30;
    if (mediaUrls.length >= 5) score += 20;
    if (mediaUrls.length > 10) score -= 10;

    return Math.min(score, 100);
  }

  private static async scorePricingCompetitiveness(
    product: typeof marketplaceProducts.$inferSelect
  ): Promise<number> {
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
      .limit(20);

    if (similarProducts.length === 0) return 70;

    const prices = similarProducts.map(p => parseFloat(p.price));
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
    const productPrice = parseFloat(product.price);

    const priceDiff = Math.abs(productPrice - avgPrice) / avgPrice;

    if (priceDiff < 0.1) return 100;
    if (priceDiff < 0.2) return 80;
    if (priceDiff < 0.4) return 60;
    return 40;
  }

  private static scoreCategoryAccuracy(
    product: typeof marketplaceProducts.$inferSelect
  ): number {
    if (!product.category) return 0;
    
    return 80;
  }

  static async forecastRevenue(sellerId: number): Promise<RevenueForecas> {
    const last90Days = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    
    const products = await db
      .select()
      .from(marketplaceProducts)
      .where(eq(marketplaceProducts.creatorUserId, sellerId));

    const productIds = products.map(p => p.id);

    if (productIds.length === 0) {
      return {
        sellerId,
        nextMonthRevenue: 0,
        nextQuarterRevenue: 0,
        confidence: 0,
        assumptions: ['No historical data available'],
        riskFactors: ['No products listed']
      };
    }

    const historicalData = await db
      .select({
        month: sql<string>`DATE_TRUNC('month', ${productPurchases.purchasedAt})`,
        revenue: sum(productPurchases.amount)
      })
      .from(productPurchases)
      .where(
        and(
          sql`${productPurchases.productId} IN (${sql.join(productIds.map(id => sql`${id}`), sql`, `)})`,
          gte(productPurchases.purchasedAt, last90Days)
        )
      )
      .groupBy(sql`DATE_TRUNC('month', ${productPurchases.purchasedAt})`)
      .orderBy(sql`DATE_TRUNC('month', ${productPurchases.purchasedAt})`);

    if (historicalData.length === 0) {
      return {
        sellerId,
        nextMonthRevenue: 0,
        nextQuarterRevenue: 0,
        confidence: 20,
        assumptions: ['Limited historical data'],
        riskFactors: ['No recent sales']
      };
    }

    const revenues = historicalData.map(d => parseFloat(d.revenue || '0'));
    const avgMonthlyRevenue = revenues.reduce((a, b) => a + b, 0) / revenues.length;

    let growthRate = 0;
    if (revenues.length >= 2) {
      const recentRevenue = revenues[revenues.length - 1];
      const olderRevenue = revenues[0];
      growthRate = (recentRevenue - olderRevenue) / olderRevenue;
    }

    const nextMonthRevenue = avgMonthlyRevenue * (1 + growthRate);
    const nextQuarterRevenue = nextMonthRevenue * 3;

    const confidence = Math.min(revenues.length * 20, 90);

    const assumptions = [
      `Based on ${revenues.length} months of historical data`,
      `Average monthly revenue: $${avgMonthlyRevenue.toFixed(2)}`,
      `Growth rate: ${(growthRate * 100).toFixed(1)}%`
    ];

    const riskFactors: string[] = [];
    if (growthRate < 0) {
      riskFactors.push('Negative growth trend');
    }
    if (revenues.length < 3) {
      riskFactors.push('Limited historical data');
    }
    if (products.filter(p => p.status === 'published').length < 3) {
      riskFactors.push('Limited product portfolio');
    }

    return {
      sellerId,
      nextMonthRevenue,
      nextQuarterRevenue,
      confidence,
      assumptions,
      riskFactors
    };
  }

  private static getEmptyPerformance(sellerId: number, period: string): SellerPerformance {
    return {
      sellerId,
      period,
      metrics: {
        totalRevenue: 0,
        totalSales: 0,
        averageOrderValue: 0,
        productCount: 0,
        averageRating: 0,
        reviewCount: 0,
        conversionRate: 0
      },
      topProducts: [],
      trends: {
        revenueGrowth: 0,
        salesGrowth: 0,
        customerSatisfactionTrend: 'stable'
      },
      recommendations: ['Start by creating your first product listing']
    };
  }
}
