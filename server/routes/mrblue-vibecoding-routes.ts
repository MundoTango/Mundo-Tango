/**
 * MR BLUE VIBE CODING ROUTES
 * Natural Language → Production Code API
 * 
 * Week 1, Day 1 Implementation - MB.MD v7.1
 * 
 * Endpoints:
 * - POST /api/mrblue/vibecode/generate - Generate code from natural language
 * - POST /api/mrblue/vibecode/apply - Apply generated code changes
 * - POST /api/mrblue/vibecode/preview - Preview generated changes
 * - POST /api/mrblue/vibecode/validate - Validate code safety
 */

import { Router, type Request, type Response } from 'express';
import { vibeCodingService, type VibeCodeRequest } from '../services/mrBlue/VibeCodingService';
import { authenticateToken, type AuthRequest } from '../middleware/auth';
import { z } from 'zod';

const router = Router();

// Initialize service
vibeCodingService.initialize().catch(error => {
  console.error('[VibeCoding Routes] ❌ Failed to initialize:', error);
});

// Validation schemas
const generateSchema = z.object({
  naturalLanguage: z.string().min(3).max(1000),
  context: z.array(z.string()).optional(),
  targetFiles: z.array(z.string()).optional(),
});

const applySchema = z.object({
  sessionId: z.string(),
});

const previewSchema = z.object({
  sessionId: z.string(),
});

const validateSchema = z.object({
  code: z.string(),
  filePath: z.string(),
});

/**
 * POST /api/mrblue/vibecode/generate
 * Generate code from natural language request
 */
router.post('/generate', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const body = generateSchema.parse(req.body);
    
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        error: 'Authentication required' 
      });
    }

    // Create session ID
    const sessionId = `vibe_${req.user.id}_${Date.now()}`;

    const request: VibeCodeRequest = {
      naturalLanguage: body.naturalLanguage,
      context: body.context,
      targetFiles: body.targetFiles,
      userId: req.user.id,
      sessionId,
    };

    console.log(`[VibeCoding API] 🎯 Generate request from user ${req.user.id}: "${body.naturalLanguage}"`);

    const result = await vibeCodingService.generateCode(request);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error || 'Failed to generate code',
      });
    }

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('[VibeCoding API] ❌ Generate error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors,
      });
    }

    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
});

/**
 * POST /api/mrblue/vibecode/apply
 * Apply generated code changes
 */
router.post('/apply', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const body = applySchema.parse(req.body);
    
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        error: 'Authentication required' 
      });
    }

    console.log(`[VibeCoding API] 📝 Apply request for session ${body.sessionId}`);

    const result = await vibeCodingService.applyChanges(body.sessionId, req.user.id);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error || 'Failed to apply changes',
      });
    }

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('[VibeCoding API] ❌ Apply error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors,
      });
    }

    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
});

/**
 * POST /api/mrblue/vibecode/preview
 * Preview generated code changes
 */
router.post('/preview', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const body = previewSchema.parse(req.body);
    
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        error: 'Authentication required' 
      });
    }

    console.log(`[VibeCoding API] 👀 Preview request for session ${body.sessionId}`);

    const result = await vibeCodingService.previewChanges(body.sessionId);

    if (!result) {
      return res.status(404).json({
        success: false,
        error: 'Session not found or expired',
      });
    }

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('[VibeCoding API] ❌ Preview error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors,
      });
    }

    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
});

/**
 * POST /api/mrblue/vibecode/validate
 * Validate code safety
 */
router.post('/validate', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const body = validateSchema.parse(req.body);
    
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        error: 'Authentication required' 
      });
    }

    console.log(`[VibeCoding API] ✅ Validate request for ${body.filePath}`);

    const result = await vibeCodingService.validateCode(body.code, body.filePath);

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('[VibeCoding API] ❌ Validate error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors,
      });
    }

    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
      });
  }
});

/**
 * GET /api/mrblue/vibecode/status
 * Get service status
 */
router.get('/status', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    res.json({
      success: true,
      data: {
        service: 'Vibe Coding Engine',
        status: 'active',
        model: 'llama-3.1-70b-versatile',
        provider: 'GROQ',
        features: [
          'Natural language to code',
          'Multi-file editing',
          'Safety validation',
          'Git integration',
          'Preview before apply',
        ],
      },
    });
  } catch (error: any) {
    console.error('[VibeCoding API] ❌ Status error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
});

export default router;
