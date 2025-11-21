import { Router } from 'express';
import { InvitationBatchingService } from '../services/invitations/InvitationBatchingService';
import { requireAuth } from '../middleware/auth';
import { z } from 'zod';
import { getQueue } from '../workers/queue';
import { DEFAULT_BATCH_DELAY } from '../workers/jobs/invitationBatchingJob';

const router = Router();

// Validation schemas
const createBatchSchema = z.object({
  batchName: z.string().optional(),
  platform: z.enum(['facebook_messenger', 'whatsapp', 'email']),
  friends: z.array(z.object({
    name: z.string(),
    friendId: z.string().optional(),
    platform: z.string()
  })).max(50, 'Maximum 50 invitations per batch'),
  messageTemplate: z.string().optional(),
  scheduledFor: z.string().optional().transform(val => val ? new Date(val) : undefined)
});

/**
 * POST /api/invitations/batches
 * Create a new invitation batch
 */
router.post('/batches', requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    const data = createBatchSchema.parse(req.body);

    // Check daily rate limit
    const service = new InvitationBatchingService(userId);
    const rateLimit = await service.checkDailyRateLimit();

    if (!rateLimit.allowed) {
      return res.status(429).json({
        error: 'Daily rate limit exceeded',
        message: 'Maximum 50 invitations per day. Try again tomorrow.',
        remaining: rateLimit.remaining
      });
    }

    // Create batch
    const batchId = await service.createBatch({
      userId,
      ...data
    });

    // Schedule batch processing job (2 days delay)
    const queue = getQueue('invitation-batch');
    await queue.add('process-batch', {
      batchId,
      userId
    }, {
      delay: DEFAULT_BATCH_DELAY
    });

    // Get batch details
    const progress = await service.getBatchProgress(batchId);

    res.status(201).json({
      success: true,
      batchId,
      progress,
      message: 'Invitation batch created and scheduled for processing in 2 days'
    });

  } catch (error: any) {
    console.error('[InvitationBatchingAPI] Error creating batch:', error);
    
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }

    res.status(500).json({ error: 'Failed to create invitation batch' });
  }
});

/**
 * GET /api/invitations/batches
 * Get all batches for current user
 */
router.get('/batches', requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    const service = new InvitationBatchingService(userId);

    const batches = await service.getUserBatches();

    res.json({
      success: true,
      batches
    });

  } catch (error: any) {
    console.error('[InvitationBatchingAPI] Error getting batches:', error);
    res.status(500).json({ error: 'Failed to get invitation batches' });
  }
});

/**
 * GET /api/invitations/batches/:id/progress
 * Get batch progress
 */
router.get('/batches/:id/progress', requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    const batchId = parseInt(req.params.id);

    const service = new InvitationBatchingService(userId);
    const progress = await service.getBatchProgress(batchId);

    if (!progress) {
      return res.status(404).json({ error: 'Batch not found' });
    }

    res.json({
      success: true,
      progress
    });

  } catch (error: any) {
    console.error('[InvitationBatchingAPI] Error getting batch progress:', error);
    res.status(500).json({ error: 'Failed to get batch progress' });
  }
});

/**
 * GET /api/invitations/top-friends
 * Get top friends to invite based on closeness score
 */
router.get('/top-friends', requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    const limit = parseInt(req.query.limit as string || '20');

    const service = new InvitationBatchingService(userId);
    const friends = await service.getTopFriendsToInvite(limit);

    res.json({
      success: true,
      friends
    });

  } catch (error: any) {
    console.error('[InvitationBatchingAPI] Error getting top friends:', error);
    res.status(500).json({ error: 'Failed to get top friends' });
  }
});

/**
 * GET /api/invitations/rate-limit
 * Check daily rate limit
 */
router.get('/rate-limit', requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;

    const service = new InvitationBatchingService(userId);
    const rateLimit = await service.checkDailyRateLimit();

    res.json({
      success: true,
      ...rateLimit
    });

  } catch (error: any) {
    console.error('[InvitationBatchingAPI] Error checking rate limit:', error);
    res.status(500).json({ error: 'Failed to check rate limit' });
  }
});

export default router;
