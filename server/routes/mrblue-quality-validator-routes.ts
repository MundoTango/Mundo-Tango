/**
 * MR BLUE QUALITY VALIDATOR API ROUTES - AGENT #43
 * API endpoints for code quality, security scanning, and content validation
 */

import { Router, Request, Response } from 'express';
import { qualityValidatorAgent } from '../services/mrBlue/qualityValidatorAgent';
import { authenticateToken, type AuthRequest } from '../middleware/auth';

const router = Router();

/**
 * POST /api/mrblue/quality/validate-content
 * Validate post content for profanity, spam, etc.
 */
router.post('/validate-content', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { text } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'text (string) is required'
      });
    }

    const result = await qualityValidatorAgent.validatePostContent(text);

    res.json({
      success: true,
      validation: result
    });
  } catch (error: any) {
    console.error('[QualityValidator API] Validate content error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/mrblue/quality/suggest-improvements
 * Get AI-powered content improvement suggestions
 */
router.post('/suggest-improvements', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { text } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'text (string) is required'
      });
    }

    const result = await qualityValidatorAgent.suggestImprovements(text);

    res.json({
      success: true,
      suggestions: result
    });
  } catch (error: any) {
    console.error('[QualityValidator API] Suggest improvements error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/mrblue/quality/code-quality
 * Analyze code quality and provide feedback
 */
router.post('/code-quality', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { code, language } = req.body;

    if (!code || !language) {
      return res.status(400).json({
        success: false,
        error: 'code and language are required'
      });
    }

    const result = await qualityValidatorAgent.detectCodeQuality(code, language);

    res.json({
      success: true,
      report: result
    });
  } catch (error: any) {
    console.error('[QualityValidator API] Code quality error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/mrblue/quality/security-scan
 * Scan code for security vulnerabilities
 */
router.post('/security-scan', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { code, language } = req.body;

    if (!code || !language) {
      return res.status(400).json({
        success: false,
        error: 'code and language are required'
      });
    }

    const result = await qualityValidatorAgent.detectSecurityVulnerabilities(code, language);

    res.json({
      success: true,
      scan: result
    });
  } catch (error: any) {
    console.error('[QualityValidator API] Security scan error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/mrblue/quality/automated-fixes
 * Generate automated fix suggestions for detected issues
 */
router.post('/automated-fixes', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { code, language } = req.body;

    if (!code || !language) {
      return res.status(400).json({
        success: false,
        error: 'code and language are required'
      });
    }

    const result = await qualityValidatorAgent.generateAutomatedFixes(code, language);

    res.json({
      success: true,
      fixes: result
    });
  } catch (error: any) {
    console.error('[QualityValidator API] Automated fixes error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/mrblue/quality/batch-validate
 * Batch validate multiple texts
 */
router.post('/batch-validate', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { texts } = req.body;

    if (!Array.isArray(texts)) {
      return res.status(400).json({
        success: false,
        error: 'texts (array) is required'
      });
    }

    const results = await qualityValidatorAgent.batchValidate(texts);

    res.json({
      success: true,
      results,
      count: results.length
    });
  } catch (error: any) {
    console.error('[QualityValidator API] Batch validate error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
