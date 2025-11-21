import { Router } from 'express';
import { Response } from "express";
import { TangoResumeService } from '../services/reputation/TangoResumeService';
import { authenticateToken } from '../middleware/auth';
import { z } from 'zod';

const router = Router();

// Validation schemas
const createResumeSchema = z.object({
  headline: z.string().optional(),
  bio: z.string().optional(),
  yearsExperience: z.number().min(0).optional(),
  specialties: z.array(z.string()).optional(),
  tangoRoles: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
  teachingLocations: z.array(z.string()).optional(),
  availability: z.enum(['available', 'limited', 'unavailable']).optional(),
  hourlyRate: z.number().min(0).optional(),
  website: z.string().url().optional(),
  youtubeChannel: z.string().optional(),
  instagramHandle: z.string().optional()
});

/**
 * POST /api/resumes
 * Create or update tango résumé
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user!.id;
    const data = createResumeSchema.parse(req.body);

    const service = new TangoResumeService(userId);
    const resume = await service.createOrUpdateResume({
      userId,
      ...data
    });

    // Recalculate professional score
    await service.calculateProfessionalScore(userId);

    res.status(201).json({
      success: true,
      resume
    });

  } catch (error: any) {
    console.error('[TangoResumeAPI] Error creating/updating résumé:', error);
    
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }

    res.status(500).json({ error: 'Failed to create/update résumé' });
  }
});

/**
 * GET /api/resumes/:userId
 * Get résumé by user ID with all stats
 */
router.get('/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);

    const service = new TangoResumeService(userId);
    const resume = await service.getResumeByUserId(userId);

    if (!resume) {
      return res.status(404).json({ error: 'Résumé not found' });
    }

    res.json({
      success: true,
      resume
    });

  } catch (error: any) {
    console.error('[TangoResumeAPI] Error getting résumé:', error);
    res.status(500).json({ error: 'Failed to get résumé' });
  }
});

/**
 * GET /api/resumes/:userId/stats
 * Get résumé stats summary
 */
router.get('/:userId/stats', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);

    const service = new TangoResumeService(userId);
    const stats = await service.getResumeStats(userId);

    res.json({
      success: true,
      stats
    });

  } catch (error: any) {
    console.error('[TangoResumeAPI] Error getting résumé stats:', error);
    res.status(500).json({ error: 'Failed to get résumé stats' });
  }
});

/**
 * GET /api/resumes/search
 * Search résumés by role, location, availability
 */
router.get('/search', async (req, res) => {
  try {
    const filters = {
      tangoRole: req.query.role as string,
      location: req.query.location as string,
      availability: req.query.availability as string,
      minScore: req.query.minScore ? parseInt(req.query.minScore as string) : undefined
    };

    const service = new TangoResumeService(0); // No specific user context for search
    const results = await service.searchResumes(filters);

    res.json({
      success: true,
      results,
      count: results.length
    });

  } catch (error: any) {
    console.error('[TangoResumeAPI] Error searching résumés:', error);
    res.status(500).json({ error: 'Failed to search résumés' });
  }
});

/**
 * GET /api/resumes/top/:role
 * Get top professionals by role
 */
router.get('/top/:role', async (req, res) => {
  try {
    const role = req.params.role;
    const limit = parseInt(req.query.limit as string || '10');

    const service = new TangoResumeService(0);
    const professionals = await service.getTopProfessionals(role, limit);

    res.json({
      success: true,
      professionals
    });

  } catch (error: any) {
    console.error('[TangoResumeAPI] Error getting top professionals:', error);
    res.status(500).json({ error: 'Failed to get top professionals' });
  }
});

/**
 * POST /api/resumes/:userId/verify
 * Verify professional (admin only)
 */
router.post('/:userId/verify', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin (RBAC level 4+)
    if (req.user!.rbacLevel < 4) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const userId = parseInt(req.params.userId);
    const { isVerified } = req.body;

    const service = new TangoResumeService(userId);
    await service.verifyProfessional(userId, isVerified);

    res.json({
      success: true,
      message: `Professional ${isVerified ? 'verified' : 'unverified'} successfully`
    });

  } catch (error: any) {
    console.error('[TangoResumeAPI] Error verifying professional:', error);
    res.status(500).json({ error: 'Failed to verify professional' });
  }
});

/**
 * POST /api/resumes/:userId/premium
 * Set premium status (admin only)
 */
router.post('/:userId/premium', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin (RBAC level 4+)
    if (req.user!.rbacLevel < 4) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const userId = parseInt(req.params.userId);
    const { isPremium } = req.body;

    const service = new TangoResumeService(userId);
    await service.setPremiumStatus(userId, isPremium);

    res.json({
      success: true,
      message: `Premium status ${isPremium ? 'enabled' : 'disabled'} successfully`
    });

  } catch (error: any) {
    console.error('[TangoResumeAPI] Error setting premium status:', error);
    res.status(500).json({ error: 'Failed to set premium status' });
  }
});

export default router;
