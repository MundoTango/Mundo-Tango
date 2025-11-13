import { db } from "@shared/db";
import { marketplaceProducts, productPurchases, users, productReviews } from "@shared/schema";
import { eq, and, desc, sql, inArray, ne, gte } from "drizzle-orm";

interface ProductRecommendation {
  productId: number;
  score: number;
  reason: string;
  product: typeof marketplaceProducts.$inferSelect;
}

interface RecommendationOptions {
  userId?: number;
  productId?: number;
  category?: string;
  limit?: number;
  excludeOwned?: boolean;
}

export class RecommendationEngine {
  static async getPersonalizedRecommendations(
    userId: number,
    options: RecommendationOptions = {}
  ): Promise<ProductRecommendation[]> {
    const limit = options.limit || 10;

    const collaborativeRecs = await this.collaborativeFiltering(userId, limit);
    const contentRecs = await this.contentBasedFiltering(userId, limit);
    const trendingRecs = await this.getTrendingProducts(limit);

    const combined = this.combineRecommendations([
      { recommendations: collaborativeRecs, weight: 0.4 },
      { recommendations: contentRecs, weight: 0.4 },
      { recommendations: trendingRecs, weight: 0.2 }
    ], limit);

    if (options.excludeOwned) {
      const ownedProductIds = await this.getUserOwnedProducts(userId);
      return combined.filter(rec => !ownedProductIds.includes(rec.productId));
    }

    return combined;
  }

  private static async collaborativeFiltering(
    userId: number,
    limit: number
  ): Promise<ProductRecommendation[]> {
    const userPurchases = await db
      .select({ productId: productPurchases.productId })
      .from(productPurchases)
      .where(eq(productPurchases.buyerUserId, userId));

    const purchasedProductIds = userPurchases.map(p => p.productId);

    if (purchasedProductIds.length === 0) {
      return this.getColdStartRecommendations(limit);
    }

    const similarUsers = await db
      .select({
        buyerUserId: productPurchases.buyerUserId,
        count: sql<number>`count(*)`.as('count')
      })
      .from(productPurchases)
      .where(
        and(
          inArray(productPurchases.productId, purchasedProductIds),
          ne(productPurchases.buyerUserId, userId)
        )
      )
      .groupBy(productPurchases.buyerUserId)
      .orderBy(desc(sql`count(*)`))
      .limit(20);

    const similarUserIds = similarUsers.map(u => u.buyerUserId);

    if (similarUserIds.length === 0) {
      return [];
    }

    const recommendedPurchases = await db
      .select({
        productId: productPurchases.productId,
        count: sql<number>`count(*)`.as('count')
      })
      .from(productPurchases)
      .where(
        and(
          inArray(productPurchases.buyerUserId, similarUserIds),
          sql`${productPurchases.productId} NOT IN (${sql.join(purchasedProductIds.map(id => sql`${id}`), sql`, `)})`
        )
      )
      .groupBy(productPurchases.productId)
      .orderBy(desc(sql`count(*)`))
      .limit(limit);

    const productIds = recommendedPurchases.map(p => p.productId);
    
    if (productIds.length === 0) {
      return [];
    }

    const products = await db
      .select()
      .from(marketplaceProducts)
      .where(
        and(
          inArray(marketplaceProducts.id, productIds),
          eq(marketplaceProducts.status, 'published')
        )
      );

    const productMap = new Map(products.map(p => [p.id, p]));

    return recommendedPurchases
      .map((rec, index) => {
        const product = productMap.get(rec.productId);
        if (!product) return null;

        return {
          productId: rec.productId,
          score: 100 - (index * 5),
          reason: `${rec.count} similar users purchased this`,
          product
        };
      })
      .filter((rec): rec is ProductRecommendation => rec !== null);
  }

  private static async contentBasedFiltering(
    userId: number,
    limit: number
  ): Promise<ProductRecommendation[]> {
    const userPurchases = await db
      .select({ 
        productId: productPurchases.productId 
      })
      .from(productPurchases)
      .where(eq(productPurchases.buyerUserId, userId))
      .limit(10);

    if (userPurchases.length === 0) {
      return [];
    }

    const purchasedProducts = await db
      .select()
      .from(marketplaceProducts)
      .where(
        inArray(
          marketplaceProducts.id, 
          userPurchases.map(p => p.productId)
        )
      );

    const categories = [...new Set(purchasedProducts.map(p => p.category))];
    const tags = [
      ...new Set(
        purchasedProducts.flatMap(p => p.tags || [])
      )
    ];

    const purchasedProductIds = userPurchases.map(p => p.productId);

    let similarProducts = await db
      .select()
      .from(marketplaceProducts)
      .where(
        and(
          sql`${marketplaceProducts.category} IN (${sql.join(categories.map(c => sql`${c}`), sql`, `)})`,
          eq(marketplaceProducts.status, 'published'),
          sql`${marketplaceProducts.id} NOT IN (${sql.join(purchasedProductIds.map(id => sql`${id}`), sql`, `)})`
        )
      )
      .limit(limit * 2);

    const scoredProducts = similarProducts.map(product => {
      let score = 50;

      if (categories.includes(product.category)) {
        score += 30;
      }

      const productTags = product.tags || [];
      const matchingTags = productTags.filter(tag => tags.includes(tag));
      score += matchingTags.length * 10;

      const avgRating = product.rating ? parseFloat(product.rating) : 0;
      score += avgRating * 4;

      return {
        productId: product.id,
        score: Math.min(score, 100),
        reason: `Similar to your previous purchases in ${product.category}`,
        product
      };
    });

    return scoredProducts
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  private static async getTrendingProducts(limit: number): Promise<ProductRecommendation[]> {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const trendingPurchases = await db
      .select({
        productId: productPurchases.productId,
        count: sql<number>`count(*)`.as('purchase_count')
      })
      .from(productPurchases)
      .where(gte(productPurchases.purchasedAt, sevenDaysAgo))
      .groupBy(productPurchases.productId)
      .orderBy(desc(sql`count(*)`))
      .limit(limit);

    const productIds = trendingPurchases.map(p => p.productId);

    if (productIds.length === 0) {
      return [];
    }

    const products = await db
      .select()
      .from(marketplaceProducts)
      .where(
        and(
          inArray(marketplaceProducts.id, productIds),
          eq(marketplaceProducts.status, 'published')
        )
      );

    const productMap = new Map(products.map(p => [p.id, p]));

    return trendingPurchases
      .map((trend, index) => {
        const product = productMap.get(trend.productId);
        if (!product) return null;

        return {
          productId: trend.productId,
          score: 95 - (index * 3),
          reason: `Trending - ${trend.count} purchases this week`,
          product
        };
      })
      .filter((rec): rec is ProductRecommendation => rec !== null);
  }

  static async getSimilarProducts(
    productId: number,
    limit: number = 6
  ): Promise<ProductRecommendation[]> {
    const product = await db
      .select()
      .from(marketplaceProducts)
      .where(eq(marketplaceProducts.id, productId))
      .limit(1);

    if (!product.length) {
      return [];
    }

    const sourceProduct = product[0];

    const similarProducts = await db
      .select()
      .from(marketplaceProducts)
      .where(
        and(
          eq(marketplaceProducts.category, sourceProduct.category),
          eq(marketplaceProducts.status, 'published'),
          ne(marketplaceProducts.id, productId)
        )
      )
      .limit(limit * 2);

    const scored = similarProducts.map(p => {
      let score = 50;

      const sourceTags = sourceProduct.tags || [];
      const productTags = p.tags || [];
      const matchingTags = productTags.filter(tag => sourceTags.includes(tag));
      score += matchingTags.length * 15;

      const priceDiff = Math.abs(
        parseFloat(p.price) - parseFloat(sourceProduct.price)
      );
      const avgPrice = (parseFloat(p.price) + parseFloat(sourceProduct.price)) / 2;
      const priceSimiliarity = 1 - Math.min(priceDiff / avgPrice, 1);
      score += priceSimiliarity * 20;

      if (p.difficulty === sourceProduct.difficulty) {
        score += 15;
      }

      const rating = p.rating ? parseFloat(p.rating) : 0;
      score += rating * 4;

      return {
        productId: p.id,
        score: Math.min(score, 100),
        reason: `Similar ${p.category} product`,
        product: p
      };
    });

    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  static async getBundleSuggestions(
    productId: number
  ): Promise<ProductRecommendation[]> {
    const frequentlyBoughtTogether = await db
      .select({
        productId: productPurchases.productId,
        count: sql<number>`count(*)`.as('count')
      })
      .from(productPurchases)
      .where(
        sql`${productPurchases.buyerUserId} IN (
          SELECT buyer_user_id FROM ${productPurchases}
          WHERE product_id = ${productId}
        ) AND ${productPurchases.productId} != ${productId}`
      )
      .groupBy(productPurchases.productId)
      .orderBy(desc(sql`count(*)`))
      .limit(5);

    const productIds = frequentlyBoughtTogether.map(p => p.productId);

    if (productIds.length === 0) {
      return [];
    }

    const products = await db
      .select()
      .from(marketplaceProducts)
      .where(
        and(
          inArray(marketplaceProducts.id, productIds),
          eq(marketplaceProducts.status, 'published')
        )
      );

    const productMap = new Map(products.map(p => [p.id, p]));

    return frequentlyBoughtTogether
      .map((item, index) => {
        const product = productMap.get(item.productId);
        if (!product) return null;

        return {
          productId: item.productId,
          score: 100 - (index * 10),
          reason: `Frequently bought together (${item.count} times)`,
          product
        };
      })
      .filter((rec): rec is ProductRecommendation => rec !== null);
  }

  private static async getColdStartRecommendations(
    limit: number
  ): Promise<ProductRecommendation[]> {
    const popularProducts = await db
      .select()
      .from(marketplaceProducts)
      .where(eq(marketplaceProducts.status, 'published'))
      .orderBy(desc(marketplaceProducts.totalSales))
      .limit(limit);

    return popularProducts.map((product, index) => ({
      productId: product.id,
      score: 90 - (index * 5),
      reason: `Popular choice - ${product.totalSales} sales`,
      product
    }));
  }

  private static combineRecommendations(
    sources: Array<{
      recommendations: ProductRecommendation[];
      weight: number;
    }>,
    limit: number
  ): ProductRecommendation[] {
    const scoreMap = new Map<number, {
      totalScore: number;
      product: typeof marketplaceProducts.$inferSelect;
      reasons: string[];
    }>();

    for (const source of sources) {
      for (const rec of source.recommendations) {
        const existing = scoreMap.get(rec.productId);
        const weightedScore = rec.score * source.weight;

        if (existing) {
          existing.totalScore += weightedScore;
          existing.reasons.push(rec.reason);
        } else {
          scoreMap.set(rec.productId, {
            totalScore: weightedScore,
            product: rec.product,
            reasons: [rec.reason]
          });
        }
      }
    }

    const combined = Array.from(scoreMap.entries())
      .map(([productId, data]) => ({
        productId,
        score: data.totalScore,
        reason: data.reasons[0],
        product: data.product
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return combined;
  }

  private static async getUserOwnedProducts(userId: number): Promise<number[]> {
    const purchases = await db
      .select({ productId: productPurchases.productId })
      .from(productPurchases)
      .where(eq(productPurchases.buyerUserId, userId));

    return purchases.map(p => p.productId);
  }
}
