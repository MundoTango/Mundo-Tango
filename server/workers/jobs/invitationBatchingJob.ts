import { Job } from 'bullmq';
import { InvitationBatchingService } from '../../services/invitations/InvitationBatchingService';
import { db } from '../../db';
import { invitationBatches } from '@shared/schema';
import { eq } from 'drizzle-orm';

/**
 * BullMQ Job: Process invitation batches
 * Scheduled to run every 2-3 days to send batched invitations
 * 
 * MB.MD Protocol Phase 1: Smart Invitation Batching
 * - Rate limiting: Max 50 invitations per batch
 * - Delay: 2-3 days between batches
 * - Platform: Facebook Messenger (WhatsApp deferred)
 */

export interface InvitationBatchJobData {
  batchId: number;
  userId: number;
}

export async function processInvitationBatch(job: Job<InvitationBatchJobData>): Promise<void> {
  const { batchId, userId } = job.data;

  console.log(`[InvitationBatchJob] Processing batch ${batchId} for user ${userId}`);

  try {
    // Update job progress
    await job.updateProgress(0);

    // Get batch details
    const batch = await db.query.invitationBatches.findFirst({
      where: eq(invitationBatches.id, batchId)
    });

    if (!batch) {
      console.error(`[InvitationBatchJob] Batch ${batchId} not found`);
      throw new Error(`Batch ${batchId} not found`);
    }

    // Check if already processed
    if (batch.status !== 'pending') {
      console.log(`[InvitationBatchJob] Batch ${batchId} already processed (${batch.status})`);
      return;
    }

    await job.updateProgress(10);

    // Process the batch
    const batchingService = new InvitationBatchingService(userId);
    await batchingService.processBatch(batchId);

    await job.updateProgress(90);

    // Get final progress
    const progress = await batchingService.getBatchProgress(batchId);
    
    console.log(`[InvitationBatchJob] Batch ${batchId} complete:`, {
      sent: progress?.sentInvitations,
      failed: progress?.failedInvitations,
      percentComplete: progress?.percentComplete
    });

    await job.updateProgress(100);

  } catch (error: any) {
    console.error(`[InvitationBatchJob] Error processing batch ${batchId}:`, error);

    // Mark batch as failed
    await db.update(invitationBatches)
      .set({
        status: 'failed',
        metadata: { error: error.message }
      })
      .where(eq(invitationBatches.id, batchId));

    throw error;
  }
}

/**
 * Schedule batch for processing after delay
 * @param batchId - Batch ID to process
 * @param userId - User ID
 * @param delayDays - Number of days to delay (default: 2)
 */
export function getScheduleDelay(delayDays = 2): number {
  // Convert days to milliseconds
  return delayDays * 24 * 60 * 60 * 1000;
}

/**
 * Default delay: 2 days (in milliseconds)
 */
export const DEFAULT_BATCH_DELAY = getScheduleDelay(2);

/**
 * Export job configuration
 */
export const invitationBatchJobConfig = {
  name: 'invitation-batch',
  processor: processInvitationBatch,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential' as const,
      delay: 5000
    },
    removeOnComplete: {
      age: 7 * 24 * 60 * 60, // 7 days
      count: 100
    },
    removeOnFail: {
      age: 30 * 24 * 60 * 60, // 30 days
    }
  }
};
