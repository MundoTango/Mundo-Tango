import { Router, type Request, type Response } from "express";
import { authenticateToken, AuthRequest } from "../middleware/auth";
import { FraudDetectionAgent } from "../services/marketplace/FraudDetection";
import { DynamicPricingAgent } from "../services/marketplace/DynamicPricing";
import { RecommendationEngine } from "../services/marketplace/RecommendationEngine";
import { ReviewAnalyzerAgent } from "../services/marketplace/ReviewAnalyzer";
import { InventoryManagerAgent } from "../services/marketplace/InventoryManager";
import { SellerSupportAgent } from "../services/marketplace/SellerSupport";
import { TransactionMonitorAgent } from "../services/marketplace/TransactionMonitor";
import { QualityAssuranceAgent } from "../services/marketplace/QualityAssurance";
import {
  queueFraudCheck,
  queuePriceOptimization,
  queueRecommendations,
  queueReviewAnalysis,
  queueInventoryCheck,
  queueSellerSupport,
  queueTransactionTracking,
  queueQAReview
} from "../workers/marketplaceAgentWorker";

const router = Router();

router.post('/fraud-check', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { productId, amount, ipAddress, stripePaymentId } = req.body;
    const userId = req.userId!;

    if (!productId || !amount) {
      return res.status(400).json({ 
        message: 'productId and amount are required' 
      });
    }

    const result = await FraudDetectionAgent.analyzePurchase({
      userId,
      productId,
      amount,
      ipAddress,
      stripePaymentId
    });

    res.json(result);
  } catch (error: any) {
    console.error('[MarketplaceAgents] Fraud check error:', error);
    res.status(500).json({ message: 'Failed to perform fraud check' });
  }
});

router.post('/optimize-price', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { productId, considerCompetitors, considerDemand, considerInventory, considerSeasonality, targetMargin } = req.body;

    if (!productId) {
      return res.status(400).json({ message: 'productId is required' });
    }

    const result = await DynamicPricingAgent.optimizePrice({
      productId,
      considerCompetitors,
      considerDemand,
      considerInventory,
      considerSeasonality,
      targetMargin
    });

    res.json(result);
  } catch (error: any) {
    console.error('[MarketplaceAgents] Price optimization error:', error);
    res.status(500).json({ message: 'Failed to optimize price' });
  }
});

router.get('/recommendations/:userId', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    const { category, limit } = req.query;

    const recommendations = await RecommendationEngine.getPersonalizedRecommendations(
      userId,
      {
        category: category as string,
        limit: limit ? parseInt(limit as string) : 10,
        excludeOwned: true
      }
    );

    res.json(recommendations);
  } catch (error: any) {
    console.error('[MarketplaceAgents] Recommendations error:', error);
    res.status(500).json({ message: 'Failed to get recommendations' });
  }
});

router.get('/recommendations/similar/:productId', async (req: Request, res: Response) => {
  try {
    const productId = parseInt(req.params.productId);
    const { limit } = req.query;

    const recommendations = await RecommendationEngine.getSimilarProducts(
      productId,
      limit ? parseInt(limit as string) : 6
    );

    res.json(recommendations);
  } catch (error: any) {
    console.error('[MarketplaceAgents] Similar products error:', error);
    res.status(500).json({ message: 'Failed to get similar products' });
  }
});

router.post('/analyze-reviews/:productId', async (req: Request, res: Response) => {
  try {
    const productId = parseInt(req.params.productId);

    const [sentiment, fakeDetection, helpfulness] = await Promise.all([
      ReviewAnalyzerAgent.analyzeProductReviews(productId),
      ReviewAnalyzerAgent.detectFakeReviews(productId),
      ReviewAnalyzerAgent.rankReviewHelpfulness(productId)
    ]);

    res.json({
      sentiment,
      fakeDetection,
      helpfulness: helpfulness.slice(0, 10)
    });
  } catch (error: any) {
    console.error('[MarketplaceAgents] Review analysis error:', error);
    res.status(500).json({ message: 'Failed to analyze reviews' });
  }
});

router.post('/analyze-review-text', async (req: Request, res: Response) => {
  try {
    const { reviewText } = req.body;

    if (!reviewText) {
      return res.status(400).json({ message: 'reviewText is required' });
    }

    const result = await ReviewAnalyzerAgent.analyzeReview(reviewText);

    res.json(result);
  } catch (error: any) {
    console.error('[MarketplaceAgents] Review text analysis error:', error);
    res.status(500).json({ message: 'Failed to analyze review text' });
  }
});

router.get('/inventory-alerts', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const sellerId = req.userId!;

    const alerts = await InventoryManagerAgent.getInventoryAlerts(sellerId);

    res.json(alerts);
  } catch (error: any) {
    console.error('[MarketplaceAgents] Inventory alerts error:', error);
    res.status(500).json({ message: 'Failed to get inventory alerts' });
  }
});

router.get('/inventory-health', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const sellerId = req.userId!;

    const health = await InventoryManagerAgent.analyzeInventoryHealth(sellerId);

    res.json(health);
  } catch (error: any) {
    console.error('[MarketplaceAgents] Inventory health error:', error);
    res.status(500).json({ message: 'Failed to analyze inventory health' });
  }
});

router.get('/restock-recommendations', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const sellerId = req.userId!;

    const recommendations = await InventoryManagerAgent.getRestockRecommendations(sellerId);

    res.json(recommendations);
  } catch (error: any) {
    console.error('[MarketplaceAgents] Restock recommendations error:', error);
    res.status(500).json({ message: 'Failed to get restock recommendations' });
  }
});

router.get('/seller-insights/:sellerId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const sellerId = parseInt(req.params.sellerId);
    const { period } = req.query;

    if (sellerId !== req.userId && req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const [performance, forecast, listingScores] = await Promise.all([
      SellerSupportAgent.getSellerPerformance(
        sellerId, 
        (period as 'day' | 'week' | 'month' | 'quarter') || 'month'
      ),
      SellerSupportAgent.forecastRevenue(sellerId),
      Promise.resolve([])
    ]);

    res.json({
      performance,
      forecast,
      listingScores
    });
  } catch (error: any) {
    console.error('[MarketplaceAgents] Seller insights error:', error);
    res.status(500).json({ message: 'Failed to get seller insights' });
  }
});

router.get('/listing-quality/:productId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const productId = parseInt(req.params.productId);

    const qualityScore = await SellerSupportAgent.scoreListingQuality(productId);

    res.json(qualityScore);
  } catch (error: any) {
    console.error('[MarketplaceAgents] Listing quality error:', error);
    res.status(500).json({ message: 'Failed to score listing quality' });
  }
});

router.get('/transaction-status/:orderId', async (req: Request, res: Response) => {
  try {
    const orderId = parseInt(req.params.orderId);

    const [status, prediction, chargebackRisk] = await Promise.all([
      TransactionMonitorAgent.getOrderStatus(orderId),
      TransactionMonitorAgent.predictDeliveryTime(orderId),
      TransactionMonitorAgent.getChargebackRisk(orderId)
    ]);

    res.json({
      status,
      deliveryPrediction: prediction,
      chargebackRisk
    });
  } catch (error: any) {
    console.error('[MarketplaceAgents] Transaction status error:', error);
    res.status(500).json({ message: 'Failed to get transaction status' });
  }
});

router.post('/process-refund', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { purchaseId, reason, amount } = req.body;

    if (!purchaseId || !reason) {
      return res.status(400).json({ message: 'purchaseId and reason are required' });
    }

    const result = await TransactionMonitorAgent.processRefund({
      purchaseId,
      reason,
      amount,
      autoApproved: false
    });

    res.json(result);
  } catch (error: any) {
    console.error('[MarketplaceAgents] Refund processing error:', error);
    res.status(500).json({ message: 'Failed to process refund' });
  }
});

router.get('/settlement-status', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const sellerId = req.userId!;

    const settlement = await TransactionMonitorAgent.getSettlementStatus(sellerId);

    res.json(settlement);
  } catch (error: any) {
    console.error('[MarketplaceAgents] Settlement status error:', error);
    res.status(500).json({ message: 'Failed to get settlement status' });
  }
});

router.post('/qa-review/:productId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const productId = parseInt(req.params.productId);
    const { autoApprove } = req.body;

    const result = autoApprove 
      ? await QualityAssuranceAgent.autoApproveProduct(productId)
      : await QualityAssuranceAgent.reviewListing(productId);

    res.json(result);
  } catch (error: any) {
    console.error('[MarketplaceAgents] QA review error:', error);
    res.status(500).json({ message: 'Failed to perform QA review' });
  }
});

router.get('/qa-queue', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const queue = await QualityAssuranceAgent.getQAQueue();

    res.json(queue);
  } catch (error: any) {
    console.error('[MarketplaceAgents] QA queue error:', error);
    res.status(500).json({ message: 'Failed to get QA queue' });
  }
});

router.get('/seller-behavior/:sellerId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const sellerId = parseInt(req.params.sellerId);

    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const result = await FraudDetectionAgent.checkSellerBehavior(sellerId);

    res.json(result);
  } catch (error: any) {
    console.error('[MarketplaceAgents] Seller behavior check error:', error);
    res.status(500).json({ message: 'Failed to check seller behavior' });
  }
});

router.get('/transaction-health', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const health = await TransactionMonitorAgent.monitorTransactionHealth();

    res.json(health);
  } catch (error: any) {
    console.error('[MarketplaceAgents] Transaction health error:', error);
    res.status(500).json({ message: 'Failed to monitor transaction health' });
  }
});

router.get('/bundle-suggestions/:productId', async (req: Request, res: Response) => {
  try {
    const productId = parseInt(req.params.productId);

    const suggestions = await RecommendationEngine.getBundleSuggestions(productId);

    res.json(suggestions);
  } catch (error: any) {
    console.error('[MarketplaceAgents] Bundle suggestions error:', error);
    res.status(500).json({ message: 'Failed to get bundle suggestions' });
  }
});

router.get('/dead-stock', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const sellerId = req.userId!;
    const { threshold } = req.query;

    const deadStock = await InventoryManagerAgent.identifyDeadStock(
      sellerId,
      threshold ? parseInt(threshold as string) : undefined
    );

    res.json(deadStock);
  } catch (error: any) {
    console.error('[MarketplaceAgents] Dead stock error:', error);
    res.status(500).json({ message: 'Failed to identify dead stock' });
  }
});

router.get('/bulk-pricing/:sellerId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const sellerId = parseInt(req.params.sellerId);

    if (sellerId !== req.userId && req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const recommendations = await DynamicPricingAgent.getBulkPricingRecommendations(sellerId);

    res.json(recommendations);
  } catch (error: any) {
    console.error('[MarketplaceAgents] Bulk pricing error:', error);
    res.status(500).json({ message: 'Failed to get bulk pricing recommendations' });
  }
});

export default router;
