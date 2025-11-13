import { FraudDetectionAgent } from "./FraudDetection";
import { DynamicPricingAgent } from "./DynamicPricing";
import { RecommendationEngine } from "./RecommendationEngine";
import { ReviewAnalyzerAgent } from "./ReviewAnalyzer";
import { InventoryManagerAgent } from "./InventoryManager";
import { SellerSupportAgent } from "./SellerSupport";
import { TransactionMonitorAgent } from "./TransactionMonitor";
import { QualityAssuranceAgent } from "./QualityAssurance";
import { db } from "@shared/db";
import { productPurchases, marketplaceProducts } from "@shared/schema";
import { eq } from "drizzle-orm";

interface OrchestratorTask {
  type: 'fraud-check' | 'price-optimize' | 'recommend-products' | 'analyze-reviews' | 
        'monitor-inventory' | 'support-seller' | 'track-transaction' | 'qa-review';
  priority: 'low' | 'medium' | 'high' | 'critical';
  data: any;
}

interface TaskResult {
  success: boolean;
  data?: any;
  error?: string;
  timestamp: Date;
}

export class MarketplaceOrchestrator {
  static async executeTask(task: OrchestratorTask): Promise<TaskResult> {
    const startTime = Date.now();

    try {
      let result: any;

      switch (task.type) {
        case 'fraud-check':
          result = await this.handleFraudCheck(task.data);
          break;

        case 'price-optimize':
          result = await this.handlePriceOptimization(task.data);
          break;

        case 'recommend-products':
          result = await this.handleProductRecommendations(task.data);
          break;

        case 'analyze-reviews':
          result = await this.handleReviewAnalysis(task.data);
          break;

        case 'monitor-inventory':
          result = await this.handleInventoryMonitoring(task.data);
          break;

        case 'support-seller':
          result = await this.handleSellerSupport(task.data);
          break;

        case 'track-transaction':
          result = await this.handleTransactionTracking(task.data);
          break;

        case 'qa-review':
          result = await this.handleQAReview(task.data);
          break;

        default:
          throw new Error(`Unknown task type: ${(task as any).type}`);
      }

      const duration = Date.now() - startTime;
      console.log(`[Orchestrator] Task ${task.type} completed in ${duration}ms`);

      return {
        success: true,
        data: result,
        timestamp: new Date()
      };
    } catch (error: any) {
      console.error(`[Orchestrator] Task ${task.type} failed:`, error);

      return {
        success: false,
        error: error.message,
        timestamp: new Date()
      };
    }
  }

  private static async handleFraudCheck(data: {
    userId: number;
    productId: number;
    amount: number;
    ipAddress?: string;
    stripePaymentId?: string;
  }): Promise<any> {
    const fraudResult = await FraudDetectionAgent.analyzePurchase({
      userId: data.userId,
      productId: data.productId,
      amount: data.amount,
      ipAddress: data.ipAddress,
      stripePaymentId: data.stripePaymentId
    });

    if (fraudResult.shouldBlock) {
      console.warn(`[Orchestrator] Transaction blocked - Risk: ${fraudResult.riskLevel}, Score: ${fraudResult.riskScore}`);
    }

    return fraudResult;
  }

  private static async handlePriceOptimization(data: {
    productId?: number;
    sellerId?: number;
  }): Promise<any> {
    if (data.productId) {
      return await DynamicPricingAgent.optimizePrice({
        productId: data.productId,
        considerCompetitors: true,
        considerDemand: true,
        considerInventory: true,
        considerSeasonality: true
      });
    } else if (data.sellerId) {
      return await DynamicPricingAgent.getBulkPricingRecommendations(data.sellerId);
    } else {
      throw new Error('Either productId or sellerId required for price optimization');
    }
  }

  private static async handleProductRecommendations(data: {
    userId?: number;
    productId?: number;
    category?: string;
    limit?: number;
  }): Promise<any> {
    if (data.userId) {
      return await RecommendationEngine.getPersonalizedRecommendations(
        data.userId,
        {
          category: data.category,
          limit: data.limit || 10,
          excludeOwned: true
        }
      );
    } else if (data.productId) {
      return await RecommendationEngine.getSimilarProducts(
        data.productId,
        data.limit || 6
      );
    } else {
      throw new Error('Either userId or productId required for recommendations');
    }
  }

  private static async handleReviewAnalysis(data: {
    productId?: number;
    reviewText?: string;
    reviewId?: number;
  }): Promise<any> {
    if (data.reviewText) {
      return await ReviewAnalyzerAgent.analyzeReview(
        data.reviewText,
        data.reviewId
      );
    } else if (data.productId) {
      const [sentiment, fakeDetection, helpfulness] = await Promise.all([
        ReviewAnalyzerAgent.analyzeProductReviews(data.productId),
        ReviewAnalyzerAgent.detectFakeReviews(data.productId),
        ReviewAnalyzerAgent.rankReviewHelpfulness(data.productId)
      ]);

      return {
        sentiment,
        fakeDetection,
        helpfulness: helpfulness.slice(0, 10)
      };
    } else {
      throw new Error('Either productId or reviewText required for analysis');
    }
  }

  private static async handleInventoryMonitoring(data: {
    sellerId: number;
  }): Promise<any> {
    const [alerts, restockRecs, health, deadStock] = await Promise.all([
      InventoryManagerAgent.getInventoryAlerts(data.sellerId),
      InventoryManagerAgent.getRestockRecommendations(data.sellerId),
      InventoryManagerAgent.analyzeInventoryHealth(data.sellerId),
      InventoryManagerAgent.identifyDeadStock(data.sellerId)
    ]);

    return {
      alerts,
      restockRecommendations: restockRecs,
      healthMetrics: health,
      deadStock
    };
  }

  private static async handleSellerSupport(data: {
    sellerId: number;
    period?: 'day' | 'week' | 'month' | 'quarter';
  }): Promise<any> {
    const [performance, forecast] = await Promise.all([
      SellerSupportAgent.getSellerPerformance(data.sellerId, data.period || 'month'),
      SellerSupportAgent.forecastRevenue(data.sellerId)
    ]);

    return {
      performance,
      forecast
    };
  }

  private static async handleTransactionTracking(data: {
    purchaseId?: number;
    sellerId?: number;
  }): Promise<any> {
    if (data.purchaseId) {
      const [status, prediction, chargebackRisk] = await Promise.all([
        TransactionMonitorAgent.getOrderStatus(data.purchaseId),
        TransactionMonitorAgent.predictDeliveryTime(data.purchaseId),
        TransactionMonitorAgent.getChargebackRisk(data.purchaseId)
      ]);

      return {
        status,
        deliveryPrediction: prediction,
        chargebackRisk
      };
    } else if (data.sellerId) {
      const [lateShipments, settlement] = await Promise.all([
        TransactionMonitorAgent.getLateShipments(data.sellerId),
        TransactionMonitorAgent.getSettlementStatus(data.sellerId)
      ]);

      return {
        lateShipments,
        settlement
      };
    } else {
      throw new Error('Either purchaseId or sellerId required for transaction tracking');
    }
  }

  private static async handleQAReview(data: {
    productId?: number;
    autoApprove?: boolean;
  }): Promise<any> {
    if (data.productId) {
      if (data.autoApprove) {
        return await QualityAssuranceAgent.autoApproveProduct(data.productId);
      } else {
        return await QualityAssuranceAgent.reviewListing(data.productId);
      }
    } else {
      return await QualityAssuranceAgent.getQAQueue();
    }
  }

  static async handleNewPurchase(purchaseId: number): Promise<void> {
    console.log(`[Orchestrator] Processing new purchase ${purchaseId}`);

    const purchase = await db
      .select()
      .from(productPurchases)
      .where(eq(productPurchases.id, purchaseId))
      .limit(1);

    if (!purchase.length) {
      console.error(`[Orchestrator] Purchase ${purchaseId} not found`);
      return;
    }

    const p = purchase[0];

    const fraudCheck = await this.executeTask({
      type: 'fraud-check',
      priority: 'critical',
      data: {
        userId: p.buyerUserId,
        productId: p.productId,
        amount: parseFloat(p.amount),
        stripePaymentId: p.stripePaymentId
      }
    });

    if (fraudCheck.success && fraudCheck.data?.shouldBlock) {
      console.warn(`[Orchestrator] High-risk transaction detected for purchase ${purchaseId}`);
    }

    await this.executeTask({
      type: 'track-transaction',
      priority: 'high',
      data: {
        purchaseId
      }
    });

    console.log(`[Orchestrator] Purchase ${purchaseId} processing complete`);
  }

  static async handleNewReview(reviewId: number, productId: number, reviewText: string): Promise<void> {
    console.log(`[Orchestrator] Processing new review for product ${productId}`);

    await this.executeTask({
      type: 'analyze-reviews',
      priority: 'medium',
      data: {
        reviewText,
        reviewId
      }
    });

    await this.executeTask({
      type: 'analyze-reviews',
      priority: 'low',
      data: {
        productId
      }
    });

    console.log(`[Orchestrator] Review analysis complete for product ${productId}`);
  }

  static async handleNewProductListing(productId: number): Promise<void> {
    console.log(`[Orchestrator] Processing new product listing ${productId}`);

    const qaResult = await this.executeTask({
      type: 'qa-review',
      priority: 'high',
      data: {
        productId,
        autoApprove: true
      }
    });

    if (qaResult.success && qaResult.data?.approved) {
      console.log(`[Orchestrator] Product ${productId} auto-approved`);
    } else {
      console.log(`[Orchestrator] Product ${productId} requires manual review`);
    }
  }

  static async runDailyMaintenance(): Promise<void> {
    console.log('[Orchestrator] Running daily maintenance tasks');

    const products = await db
      .select()
      .from(marketplaceProducts)
      .where(eq(marketplaceProducts.status, 'published'))
      .limit(100);

    const sellers = [...new Set(products.map(p => p.creatorUserId))];

    for (const sellerId of sellers) {
      try {
        await this.executeTask({
          type: 'monitor-inventory',
          priority: 'low',
          data: { sellerId }
        });

        await this.executeTask({
          type: 'support-seller',
          priority: 'low',
          data: { sellerId, period: 'week' }
        });
      } catch (error) {
        console.error(`[Orchestrator] Error in daily maintenance for seller ${sellerId}:`, error);
      }
    }

    console.log('[Orchestrator] Daily maintenance complete');
  }
}
