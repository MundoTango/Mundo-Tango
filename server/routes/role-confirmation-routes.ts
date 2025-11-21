import { Router } from 'express';
import { RoleConfirmationService } from '../services/reputation/RoleConfirmationService';
import { authenticateToken } from '../middleware/auth';
import { z } from 'zod';

const router = Router();

// Validation schemas
const createConfirmationSchema = z.object({
  userId: z.number(),
  tangoRole: z.enum(['teacher', 'dj', 'organizer', 'performer']),
  relationship: z.enum(['student', 'colleague', 'event_attendee', 'co-organizer', 'friend', 'other']),
  comment: z.string().optional(),
  rating: z.number().min(1).max(5).optional()
});

/**
 * POST /api/role-confirmations
 * Confirm a user's tango role
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const confirmerId = req.user!.id;
    const data = createConfirmationSchema.parse(req.body);

    const service = new RoleConfirmationService(confirmerId);
    const confirmation = await service.confirmRole({
      ...data,
      confirmerId
    });

    res.status(201).json({
      success: true,
      confirmation,
      message: `Successfully confirmed ${data.tangoRole} role`
    });

  } catch (error: any) {
    console.error('[RoleConfirmationAPI] Error confirming role:', error);
    
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }

    if (error.message.includes('Cannot confirm your own role')) {
      return res.status(400).json({ error: error.message });
    }

    if (error.message.includes('already exists')) {
      return res.status(409).json({ error: error.message });
    }

    res.status(500).json({ error: 'Failed to confirm role' });
  }
});

/**
 * GET /api/role-confirmations/:userId
 * Get all confirmations for a user
 */
router.get('/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);

    const service = new RoleConfirmationService(0);
    const confirmations = await service.getUserConfirmations(userId);

    res.json({
      success: true,
      confirmations
    });

  } catch (error: any) {
    console.error('[RoleConfirmationAPI] Error getting confirmations:', error);
    res.status(500).json({ error: 'Failed to get confirmations' });
  }
});

/**
 * GET /api/role-confirmations/:userId/role/:role
 * Get confirmations by role
 */
router.get('/:userId/role/:role', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const role = req.params.role;

    const service = new RoleConfirmationService(0);
    const confirmations = await service.getConfirmationsByRole(userId, role);

    res.json({
      success: true,
      confirmations
    });

  } catch (error: any) {
    console.error('[RoleConfirmationAPI] Error getting confirmations by role:', error);
    res.status(500).json({ error: 'Failed to get confirmations' });
  }
});

/**
 * GET /api/role-confirmations/:userId/stats
 * Get confirmation stats for a user
 */
router.get('/:userId/stats', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);

    const service = new RoleConfirmationService(0);
    const stats = await service.getConfirmationStats(userId);

    res.json({
      success: true,
      stats
    });

  } catch (error: any) {
    console.error('[RoleConfirmationAPI] Error getting confirmation stats:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

/**
 * DELETE /api/role-confirmations/:id
 * Delete a confirmation (only confirmer can delete)
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const confirmationId = parseInt(req.params.id);
    const requesterId = req.user!.id;

    const service = new RoleConfirmationService(requesterId);
    await service.deleteConfirmation(confirmationId, requesterId);

    res.json({
      success: true,
      message: 'Confirmation deleted successfully'
    });

  } catch (error: any) {
    console.error('[RoleConfirmationAPI] Error deleting confirmation:', error);
    
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }

    if (error.message.includes('Unauthorized')) {
      return res.status(403).json({ error: error.message });
    }

    res.status(500).json({ error: 'Failed to delete confirmation' });
  }
});

/**
 * POST /api/role-confirmations/:id/verify
 * Verify confirmation (admin only)
 */
router.post('/:id/verify', authenticateToken, async (req, res) => {
  try {
    // Check if user is volunteer or higher (RBAC level 6+)
    if (req.user!.rbacLevel < 6) {
      return res.status(403).json({ error: 'Volunteer access or higher required' });
    }

    const confirmationId = parseInt(req.params.id);
    const { isVerified } = req.body;

    const service = new RoleConfirmationService(req.user!.id);
    await service.verifyConfirmation(confirmationId, isVerified);

    res.json({
      success: true,
      message: `Confirmation ${isVerified ? 'verified' : 'unverified'} successfully`
    });

  } catch (error: any) {
    console.error('[RoleConfirmationAPI] Error verifying confirmation:', error);
    res.status(500).json({ error: 'Failed to verify confirmation' });
  }
});

/**
 * GET /api/role-confirmations/pending
 * Get pending confirmations awaiting verification (admin only)
 */
router.get('/pending', authenticateToken, async (req, res) => {
  try {
    // Check if user is volunteer or higher (RBAC level 6+)
    if (req.user!.rbacLevel < 6) {
      return res.status(403).json({ error: 'Volunteer access or higher required' });
    }

    const limit = parseInt(req.query.limit as string || '20');

    const service = new RoleConfirmationService(req.user!.id);
    const confirmations = await service.getPendingConfirmations(limit);

    res.json({
      success: true,
      confirmations
    });

  } catch (error: any) {
    console.error('[RoleConfirmationAPI] Error getting pending confirmations:', error);
    res.status(500).json({ error: 'Failed to get pending confirmations' });
  }
});

export default router;
