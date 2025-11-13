import { db } from "@shared/db";
import { marketplaceProducts, productPurchases } from "@shared/schema";
import { eq, and, gte, desc, sql, count } from "drizzle-orm";

interface InventoryAlert {
  productId: number;
  productTitle: string;
  alertType: 'low_stock' | 'out_of_stock' | 'dead_stock' | 'fast_moving';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  recommendedAction: string;
  metrics: {
    currentStock?: number;
    salesVelocity: number;
    daysUntilStockout?: number;
    daysSinceLastSale?: number;
  };
}

interface RestockRecommendation {
  productId: number;
  productTitle: string;
  currentStock: number;
  recommendedRestockQuantity: number;
  estimatedDaysUntilStockout: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  reasoning: string[];
  costEstimate: number;
}

interface InventoryHealth {
  totalProducts: number;
  activeProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  deadStockProducts: number;
  fastMovingProducts: number;
  inventoryTurnoverRate: number;
  healthScore: number;
  recommendations: string[];
}

export class InventoryManagerAgent {
  private static readonly LOW_STOCK_THRESHOLD = 10;
  private static readonly DEAD_STOCK_DAYS = 90;
  private static readonly FAST_MOVING_THRESHOLD = 5;

  static async getInventoryAlerts(sellerId: number): Promise<InventoryAlert[]> {
    const products = await db
      .select()
      .from(marketplaceProducts)
      .where(
        and(
          eq(marketplaceProducts.creatorUserId, sellerId),
          eq(marketplaceProducts.status, 'published')
        )
      );

    const alerts: InventoryAlert[] = [];

    for (const product of products) {
      const salesVelocity = await this.calculateSalesVelocity(product.id, 30);
      
      const alert = await this.checkProductInventory(product, salesVelocity);
      if (alert) {
        alerts.push(alert);
      }
    }

    return alerts.sort((a, b) => {
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });
  }

  private static async checkProductInventory(
    product: typeof marketplaceProducts.$inferSelect,
    salesVelocity: number
  ): Promise<InventoryAlert | null> {
    const daysSinceLastSale = await this.getDaysSinceLastSale(product.id);

    if (daysSinceLastSale > this.DEAD_STOCK_DAYS) {
      return {
        productId: product.id,
        productTitle: product.title,
        alertType: 'dead_stock',
        severity: 'medium',
        message: `No sales in ${daysSinceLastSale} days`,
        recommendedAction: 'Consider discounting or discontinuing this product',
        metrics: {
          salesVelocity,
          daysSinceLastSale
        }
      };
    }

    if (salesVelocity >= this.FAST_MOVING_THRESHOLD) {
      return {
        productId: product.id,
        productTitle: product.title,
        alertType: 'fast_moving',
        severity: 'low',
        message: `High sales velocity: ${salesVelocity.toFixed(1)} units/day`,
        recommendedAction: 'Monitor stock levels closely and consider increasing inventory',
        metrics: {
          salesVelocity
        }
      };
    }

    return null;
  }

  static async getRestockRecommendations(sellerId: number): Promise<RestockRecommendation[]> {
    const products = await db
      .select()
      .from(marketplaceProducts)
      .where(
        and(
          eq(marketplaceProducts.creatorUserId, sellerId),
          eq(marketplaceProducts.status, 'published')
        )
      );

    const recommendations: RestockRecommendation[] = [];

    for (const product of products) {
      const salesVelocity = await this.calculateSalesVelocity(product.id, 30);
      
      if (salesVelocity > 0) {
        const recommendation = this.calculateRestockRecommendation(
          product,
          salesVelocity
        );
        
        if (recommendation) {
          recommendations.push(recommendation);
        }
      }
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  private static calculateRestockRecommendation(
    product: typeof marketplaceProducts.$inferSelect,
    salesVelocity: number
  ): RestockRecommendation | null {
    const currentStock = 0;
    const daysUntilStockout = currentStock / Math.max(salesVelocity, 0.1);
    
    const reasoning: string[] = [];
    let priority: 'low' | 'medium' | 'high' | 'urgent';
    let recommendedQuantity = 0;

    if (daysUntilStockout <= 7) {
      priority = 'urgent';
      recommendedQuantity = Math.ceil(salesVelocity * 60);
      reasoning.push(`Critical: Stock will run out in ${Math.floor(daysUntilStockout)} days`);
      reasoning.push(`Recommend 60-day supply based on current velocity`);
    } else if (daysUntilStockout <= 14) {
      priority = 'high';
      recommendedQuantity = Math.ceil(salesVelocity * 45);
      reasoning.push(`Stock will run out in ${Math.floor(daysUntilStockout)} days`);
      reasoning.push(`Recommend 45-day supply`);
    } else if (daysUntilStockout <= 30) {
      priority = 'medium';
      recommendedQuantity = Math.ceil(salesVelocity * 30);
      reasoning.push(`Plan ahead: ${Math.floor(daysUntilStockout)} days of stock remaining`);
      reasoning.push(`Recommend 30-day supply`);
    } else {
      return null;
    }

    const costEstimate = parseFloat(product.price) * recommendedQuantity * 0.6;

    return {
      productId: product.id,
      productTitle: product.title,
      currentStock,
      recommendedRestockQuantity: recommendedQuantity,
      estimatedDaysUntilStockout: Math.floor(daysUntilStockout),
      priority,
      reasoning,
      costEstimate
    };
  }

  private static async calculateSalesVelocity(
    productId: number,
    days: number
  ): Promise<number> {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const sales = await db
      .select({ count: count() })
      .from(productPurchases)
      .where(
        and(
          eq(productPurchases.productId, productId),
          gte(productPurchases.purchasedAt, startDate)
        )
      );

    const totalSales = sales[0]?.count || 0;
    return totalSales / days;
  }

  private static async getDaysSinceLastSale(productId: number): Promise<number> {
    const lastSale = await db
      .select()
      .from(productPurchases)
      .where(eq(productPurchases.productId, productId))
      .orderBy(desc(productPurchases.purchasedAt))
      .limit(1);

    if (lastSale.length === 0) {
      return Infinity;
    }

    const daysSince = Math.floor(
      (Date.now() - new Date(lastSale[0].purchasedAt).getTime()) / (1000 * 60 * 60 * 24)
    );

    return daysSince;
  }

  static async analyzeInventoryHealth(sellerId: number): Promise<InventoryHealth> {
    const products = await db
      .select()
      .from(marketplaceProducts)
      .where(eq(marketplaceProducts.creatorUserId, sellerId));

    const activeProducts = products.filter(p => p.status === 'published');

    const alerts = await this.getInventoryAlerts(sellerId);

    const lowStockProducts = alerts.filter(a => a.alertType === 'low_stock').length;
    const outOfStockProducts = alerts.filter(a => a.alertType === 'out_of_stock').length;
    const deadStockProducts = alerts.filter(a => a.alertType === 'dead_stock').length;
    const fastMovingProducts = alerts.filter(a => a.alertType === 'fast_moving').length;

    const turnoverRate = await this.calculateInventoryTurnover(sellerId, 90);

    let healthScore = 100;
    healthScore -= outOfStockProducts * 10;
    healthScore -= lowStockProducts * 5;
    healthScore -= deadStockProducts * 3;
    healthScore = Math.max(0, healthScore);

    const recommendations: string[] = [];

    if (outOfStockProducts > 0) {
      recommendations.push(`${outOfStockProducts} products are out of stock - immediate restocking needed`);
    }
    if (lowStockProducts > activeProducts.length * 0.2) {
      recommendations.push('High proportion of low-stock items - review reordering strategy');
    }
    if (deadStockProducts > 0) {
      recommendations.push(`${deadStockProducts} slow-moving products - consider promotions or discontinuation`);
    }
    if (turnoverRate < 2) {
      recommendations.push('Low inventory turnover - optimize stock levels');
    }
    if (fastMovingProducts > 0) {
      recommendations.push(`${fastMovingProducts} fast-moving products - ensure adequate stock levels`);
    }

    return {
      totalProducts: products.length,
      activeProducts: activeProducts.length,
      lowStockProducts,
      outOfStockProducts,
      deadStockProducts,
      fastMovingProducts,
      inventoryTurnoverRate: turnoverRate,
      healthScore,
      recommendations
    };
  }

  private static async calculateInventoryTurnover(
    sellerId: number,
    days: number
  ): Promise<number> {
    const products = await db
      .select()
      .from(marketplaceProducts)
      .where(eq(marketplaceProducts.creatorUserId, sellerId));

    if (products.length === 0) return 0;

    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const sales = await db
      .select({ count: count() })
      .from(productPurchases)
      .where(
        and(
          sql`${productPurchases.productId} IN (${sql.join(products.map(p => sql`${p.id}`), sql`, `)})`,
          gte(productPurchases.purchasedAt, startDate)
        )
      );

    const totalSales = sales[0]?.count || 0;
    const periods = days / 30;

    return totalSales / (products.length * periods);
  }

  static async identifyDeadStock(
    sellerId: number,
    threshold: number = this.DEAD_STOCK_DAYS
  ): Promise<Array<{
    productId: number;
    productTitle: string;
    daysSinceLastSale: number;
    totalRevenue: number;
    recommendedAction: string;
  }>> {
    const products = await db
      .select()
      .from(marketplaceProducts)
      .where(
        and(
          eq(marketplaceProducts.creatorUserId, sellerId),
          eq(marketplaceProducts.status, 'published')
        )
      );

    const deadStock: Array<{
      productId: number;
      productTitle: string;
      daysSinceLastSale: number;
      totalRevenue: number;
      recommendedAction: string;
    }> = [];

    for (const product of products) {
      const daysSince = await this.getDaysSinceLastSale(product.id);

      if (daysSince >= threshold) {
        const revenue = parseFloat(product.revenue);

        let action: string;
        if (daysSince > 180) {
          action = 'Consider discontinuing - no recent demand';
        } else if (revenue < 100) {
          action = 'Low performer - try 30% discount or bundle';
        } else {
          action = 'Slow mover - consider 15% promotional discount';
        }

        deadStock.push({
          productId: product.id,
          productTitle: product.title,
          daysSinceLastSale: daysSince,
          totalRevenue: revenue,
          recommendedAction: action
        });
      }
    }

    return deadStock.sort((a, b) => b.daysSinceLastSale - a.daysSinceLastSale);
  }
}
