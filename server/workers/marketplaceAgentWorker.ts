import { Worker, Job, Queue } from "bullmq";
import Redis from "ioredis";
import { MarketplaceOrchestrator } from "../services/marketplace/MarketplaceOrchestrator";

// Only create Redis connection if REDIS_URL is explicitly set
const connection = process.env.REDIS_URL 
  ? new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 0,
      retryStrategy: () => null,
      enableOfflineQueue: false,
      lazyConnect: true,
    })
  : null;

export const marketplaceAgentQueue = connection ? new Queue('marketplace-agents', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000
    },
    removeOnComplete: 100,
    removeOnFail: 50
  }
}) : null;

interface MarketplaceAgentJob {
  type: 'fraud-check' | 'price-optimize' | 'recommend-products' | 'analyze-reviews' | 
        'monitor-inventory' | 'support-seller' | 'track-transaction' | 'qa-review' |
        'daily-maintenance' | 'process-purchase' | 'process-review' | 'process-listing';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  data: any;
}

export const marketplaceAgentWorker = connection ? new Worker<MarketplaceAgentJob>(
  'marketplace-agents',
  async (job: Job<MarketplaceAgentJob>) => {
    const { type, priority = 'medium', data } = job.data;

    console.log(`[MarketplaceAgentWorker] Processing ${type} job (Priority: ${priority})`);

    try {
      let result;

      switch (type) {
        case 'fraud-check':
          result = await MarketplaceOrchestrator.executeTask({
            type: 'fraud-check',
            priority,
            data
          });
          break;

        case 'price-optimize':
          result = await MarketplaceOrchestrator.executeTask({
            type: 'price-optimize',
            priority,
            data
          });
          break;

        case 'recommend-products':
          result = await MarketplaceOrchestrator.executeTask({
            type: 'recommend-products',
            priority,
            data
          });
          break;

        case 'analyze-reviews':
          result = await MarketplaceOrchestrator.executeTask({
            type: 'analyze-reviews',
            priority,
            data
          });
          break;

        case 'monitor-inventory':
          result = await MarketplaceOrchestrator.executeTask({
            type: 'monitor-inventory',
            priority,
            data
          });
          break;

        case 'support-seller':
          result = await MarketplaceOrchestrator.executeTask({
            type: 'support-seller',
            priority,
            data
          });
          break;

        case 'track-transaction':
          result = await MarketplaceOrchestrator.executeTask({
            type: 'track-transaction',
            priority,
            data
          });
          break;

        case 'qa-review':
          result = await MarketplaceOrchestrator.executeTask({
            type: 'qa-review',
            priority,
            data
          });
          break;

        case 'daily-maintenance':
          await MarketplaceOrchestrator.runDailyMaintenance();
          result = { success: true, message: 'Daily maintenance complete' };
          break;

        case 'process-purchase':
          await MarketplaceOrchestrator.handleNewPurchase(data.purchaseId);
          result = { success: true, message: 'Purchase processed' };
          break;

        case 'process-review':
          await MarketplaceOrchestrator.handleNewReview(
            data.reviewId,
            data.productId,
            data.reviewText
          );
          result = { success: true, message: 'Review processed' };
          break;

        case 'process-listing':
          await MarketplaceOrchestrator.handleNewProductListing(data.productId);
          result = { success: true, message: 'Listing processed' };
          break;

        default:
          throw new Error(`Unknown job type: ${type}`);
      }

      console.log(`[MarketplaceAgentWorker] Job ${type} completed successfully`);
      return result;

    } catch (error: any) {
      console.error(`[MarketplaceAgentWorker] Job ${type} failed:`, error);
      throw error;
    }
  },
  {
    connection,
    concurrency: 5,
    limiter: {
      max: 10,
      duration: 1000
    }
  },
  {
    connection,
    concurrency: 5,
    limiter: {
      max: 10,
      duration: 1000
    }
  }
) : null;

if (marketplaceAgentWorker) {
  marketplaceAgentWorker.on('completed', (job) => {
  console.log(`[MarketplaceAgentWorker] Job ${job.id} completed`);
});

marketplaceAgentWorker.on('failed', (job, error) => {
  console.error(`[MarketplaceAgentWorker] Job ${job?.id} failed:`, error.message);
});

marketplaceAgentWorker.on('error', (error) => {
    console.error('[MarketplaceAgentWorker] Worker error:', error);
  });
}

export async function scheduleDailyMaintenance() {
  if (!marketplaceAgentQueue) {
    console.log('ℹ️ Marketplace workers disabled (Redis not configured)');
    return;
  }
  await marketplaceAgentQueue.add(
    'daily-maintenance',
    {
      type: 'daily-maintenance',
      priority: 'low',
      data: {}
    },
    {
      repeat: {
        pattern: '0 2 * * *'
      },
      jobId: 'daily-maintenance-job'
    }
  );

  console.log('[MarketplaceAgentWorker] Daily maintenance job scheduled for 2:00 AM');
}

scheduleDailyMaintenance().catch(console.error);

export async function queueFraudCheck(data: {
  userId: number;
  productId: number;
  amount: number;
  ipAddress?: string;
  stripePaymentId?: string;
}): Promise<void> {
  if (!marketplaceAgentQueue) return;
  await marketplaceAgentQueue.add('fraud-check', {
    type: 'fraud-check',
    priority: 'critical',
    data
  });
}

export async function queuePriceOptimization(data: {
  productId?: number;
  sellerId?: number;
}): Promise<void> {
  if (!marketplaceAgentQueue) return;
  await marketplaceAgentQueue.add('price-optimization', {
    type: 'price-optimize',
    priority: 'medium',
    data
  });
}

export async function queueRecommendations(data: {
  userId?: number;
  productId?: number;
  category?: string;
  limit?: number;
}): Promise<void> {
  if (!marketplaceAgentQueue) return;
  await marketplaceAgentQueue.add('recommendations', {
    type: 'recommend-products',
    priority: 'low',
    data
  });
}

export async function queueReviewAnalysis(data: {
  productId?: number;
  reviewText?: string;
  reviewId?: number;
}): Promise<void> {
  if (!marketplaceAgentQueue) return;
  await marketplaceAgentQueue.add('review-analysis', {
    type: 'analyze-reviews',
    priority: 'medium',
    data
  });
}

export async function queueInventoryCheck(data: {
  sellerId: number;
}): Promise<void> {
  if (!marketplaceAgentQueue) return;
  await marketplaceAgentQueue.add('inventory-check', {
    type: 'monitor-inventory',
    priority: 'low',
    data
  });
}

export async function queueSellerSupport(data: {
  sellerId: number;
  period?: 'day' | 'week' | 'month' | 'quarter';
}): Promise<void> {
  if (!marketplaceAgentQueue) return;
  await marketplaceAgentQueue.add('seller-support', {
    type: 'support-seller',
    priority: 'low',
    data
  });
}

export async function queueTransactionTracking(data: {
  purchaseId?: number;
  sellerId?: number;
}): Promise<void> {
  if (!marketplaceAgentQueue) return;
  await marketplaceAgentQueue.add('transaction-tracking', {
    type: 'track-transaction',
    priority: 'high',
    data
  });
}

export async function queueQAReview(data: {
  productId?: number;
  autoApprove?: boolean;
}): Promise<void> {
  if (!marketplaceAgentQueue) return;
  await marketplaceAgentQueue.add('qa-review', {
    type: 'qa-review',
    priority: 'high',
    data
  });
}

if (connection) {
  console.log('✅ [MarketplaceAgentWorker] Worker initialized and ready');
} else {
  console.log('ℹ️ [MarketplaceAgentWorker] Disabled (REDIS_URL not set)');
}
