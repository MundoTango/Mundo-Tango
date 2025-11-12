import { Router, Request, Response } from 'express';
import { governanceService } from '../services/documentation/governanceService';
import { authenticateToken, AuthRequest, requireRoleLevel } from '../middleware/auth';
import { z } from 'zod';

const router = Router();

/**
 * Documentation Governance API Routes
 * Implements APPENDIX P governance rules enforcement
 * 
 * Routes:
 * - POST /api/documentation/validate - Validate documentation file
 * - POST /api/documentation/update - Update documentation with governance checks
 * - GET /api/documentation/dependencies - Get documentation dependencies
 * - GET /api/documentation/history - Get documentation change history
 * - POST /api/documentation/check-duplicate - Check for duplicate content
 * - GET /api/documentation/single-source-map - Get Single Source of Truth map
 */

// Request validation schemas
const validateRequestSchema = z.object({
  filePath: z.string().optional(),
  strict: z.boolean().optional()
});

const updateRequestSchema = z.object({
  filePath: z.string(),
  sectionTitle: z.string(),
  content: z.string(),
  version: z.string().optional(),
  changes: z.string().optional()
});

const checkDuplicateSchema = z.object({
  filePath: z.string(),
  content: z.string(),
  sectionTitle: z.string().optional()
});

/**
 * POST /api/documentation/validate
 * Validate documentation file against APPENDIX P rules
 */
router.post('/validate', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { filePath = 'docs/handoff/AGENT_LEARNING_INDEX_COMPLETE.md', strict = false } = 
      validateRequestSchema.parse(req.body);

    const result = await governanceService.validateDocument(filePath);

    // In strict mode, warnings also count as failures
    const passed = strict ? (result.errors.length === 0 && result.warnings.length === 0) : result.passed;

    res.json({
      ...result,
      passed,
      message: passed ? 'Validation passed' : 'Validation failed - see errors and warnings'
    });
  } catch (error: any) {
    console.error('Documentation validation error:', error);
    res.status(500).json({ 
      error: 'Validation failed', 
      message: error.message 
    });
  }
});

/**
 * POST /api/documentation/update
 * Update documentation with governance checks (requires admin role)
 */
router.post('/update', authenticateToken, requireRoleLevel(5), async (req: AuthRequest, res: Response) => {
  try {
    const { filePath, sectionTitle, content, version, changes } = 
      updateRequestSchema.parse(req.body);

    // RULE 1: UPDATE IN PLACE - Check if we should update existing or create new
    const updateCheck = await governanceService.validateUpdateInPlace(filePath, sectionTitle, content);
    
    if (!updateCheck.valid) {
      return res.status(400).json({
        error: 'Update validation failed',
        message: updateCheck.message,
        rule: 'UPDATE IN PLACE'
      });
    }

    // RULE 4: CONSOLIDATE - Check for existing similar content
    const consolidateCheck = await governanceService.consolidateCheck(filePath, sectionTitle, content);
    
    if (consolidateCheck.shouldConsolidate) {
      return res.status(400).json({
        error: 'Consolidation required',
        message: 'Similar sections already exist. Please update existing sections instead.',
        rule: 'CONSOLIDATE',
        existingSections: consolidateCheck.existingSections.map(s => ({
          title: s.title,
          lines: `${s.lineStart}-${s.lineEnd}`
        }))
      });
    }

    // RULE 2: VERSION CONTROL - Validate version info
    const versionCheck = governanceService.validateVersionControl(content);
    
    if (!versionCheck.valid) {
      return res.status(400).json({
        error: 'Version control validation failed',
        message: 'Missing required version control information',
        rule: 'VERSION CONTROL',
        issues: versionCheck.issues
      });
    }

    // All checks passed - return success
    res.json({
      success: true,
      message: 'Documentation update approved',
      checks: {
        updateInPlace: updateCheck,
        consolidate: { shouldConsolidate: false },
        versionControl: versionCheck
      },
      recommendations: [
        'Update the section in place',
        'Increment version number',
        'Add date stamp and change description',
        'Run validation after update: POST /api/documentation/validate'
      ]
    });
  } catch (error: any) {
    console.error('Documentation update error:', error);
    res.status(500).json({ 
      error: 'Update validation failed', 
      message: error.message 
    });
  }
});

/**
 * GET /api/documentation/dependencies
 * Get documentation dependency graph (cross-references)
 */
router.get('/dependencies', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const filePath = (req.query.filePath as string) || 'docs/handoff/AGENT_LEARNING_INDEX_COMPLETE.md';
    
    const dependencies = await governanceService.trackDependencies(filePath);
    
    // Convert Map to object for JSON serialization
    const dependenciesObj: Record<string, string[]> = {};
    dependencies.forEach((refs, section) => {
      dependenciesObj[section] = refs;
    });

    res.json({
      dependencies: dependenciesObj,
      totalSections: dependencies.size,
      totalReferences: Array.from(dependencies.values()).reduce((sum, refs) => sum + refs.length, 0)
    });
  } catch (error: any) {
    console.error('Dependencies tracking error:', error);
    res.status(500).json({ 
      error: 'Failed to track dependencies', 
      message: error.message 
    });
  }
});

/**
 * GET /api/documentation/history
 * Get documentation change history from git
 */
router.get('/history', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const filePath = (req.query.filePath as string) || 'docs/handoff/AGENT_LEARNING_INDEX_COMPLETE.md';
    const limit = parseInt(req.query.limit as string) || 10;
    
    const history = await governanceService.getDocumentationHistory(filePath, limit);
    
    res.json({
      filePath,
      commits: history,
      total: history.length
    });
  } catch (error: any) {
    console.error('History retrieval error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve history', 
      message: error.message 
    });
  }
});

/**
 * POST /api/documentation/check-duplicate
 * Check if content is duplicate before adding
 */
router.post('/check-duplicate', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { filePath, content, sectionTitle } = checkDuplicateSchema.parse(req.body);

    // Read file and check for duplicates
    const fullContent = await governanceService['readFile'](filePath);
    const sections = governanceService['extractSections'](fullContent);

    // Check for exact and near duplicates
    const exactDuplicates = governanceService['findExactDuplicates'](sections);
    const nearDuplicates = await governanceService['findNearDuplicates'](sections);

    // Check if new content is duplicate
    const newContentDuplicates = await governanceService['findSimilarContent'](fullContent, content);

    res.json({
      isDuplicate: newContentDuplicates.length > 0,
      exactMatches: newContentDuplicates.filter(d => d.type === 'exact').length,
      nearMatches: newContentDuplicates.filter(d => d.type === 'near').length,
      matches: newContentDuplicates.map(d => ({
        existingSection: d.section1.title,
        lines: `${d.section1.lineStart}-${d.section1.lineEnd}`,
        similarity: `${(d.similarity * 100).toFixed(1)}%`,
        type: d.type
      })),
      recommendation: newContentDuplicates.length > 0
        ? 'Update existing section instead of creating new one (UPDATE IN PLACE rule)'
        : 'No duplicates found - safe to add new section'
    });
  } catch (error: any) {
    console.error('Duplicate check error:', error);
    res.status(500).json({ 
      error: 'Duplicate check failed', 
      message: error.message 
    });
  }
});

/**
 * GET /api/documentation/single-source-map
 * Get the Single Source of Truth map
 */
router.get('/single-source-map', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { SINGLE_SOURCE_MAP } = await import('../services/documentation/governanceService');
    
    res.json({
      map: SINGLE_SOURCE_MAP,
      total: SINGLE_SOURCE_MAP.length,
      description: 'Canonical locations for each concept - all references must link to these locations'
    });
  } catch (error: any) {
    console.error('Single source map error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve single source map', 
      message: error.message 
    });
  }
});

/**
 * GET /api/documentation/rules
 * Get the 4 core governance rules
 */
router.get('/rules', async (req: Request, res: Response) => {
  res.json({
    rules: [
      {
        number: 1,
        name: 'UPDATE IN PLACE',
        description: 'Never duplicate sections. Always modify existing content instead of creating new versions.',
        example: {
          correct: 'Update existing "Agent #5 Training" section',
          incorrect: 'Create new "Agent #5 Training (Updated)" section'
        }
      },
      {
        number: 2,
        name: 'VERSION CONTROL',
        description: 'Track all changes with date stamps, version numbers, and change descriptions.',
        required: ['**Last Updated:** date', '**Version:** number', '**Changes:** description']
      },
      {
        number: 3,
        name: 'REFERENCE DON\'T COPY',
        description: 'Link to canonical locations instead of copying content.',
        example: {
          correct: 'See APPENDIX I (lines 8,139-13,130) for ESA Framework',
          incorrect: 'Copy entire ESA Framework content here'
        }
      },
      {
        number: 4,
        name: 'CONSOLIDATE',
        description: 'Check for existing content before adding new sections.',
        workflow: [
          'Run: node scripts/validate-docs.cjs',
          'Search for similar content',
          'If found, update existing section',
          'If not found, add new section'
        ]
      }
    ],
    appendixReference: 'APPENDIX P (lines 26,620-27,039)',
    validationScript: 'scripts/validate-docs.cjs',
    preCommitHook: '.husky/pre-commit'
  });
});

/**
 * GET /api/documentation/stats
 * Get current documentation statistics
 */
router.get('/stats', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const filePath = (req.query.filePath as string) || 'docs/handoff/AGENT_LEARNING_INDEX_COMPLETE.md';
    
    const validation = await governanceService.validateDocument(filePath);
    
    res.json({
      file: filePath,
      stats: validation.stats,
      health: {
        passed: validation.passed,
        errorCount: validation.errors.length,
        warningCount: validation.warnings.length
      },
      lastChecked: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Stats retrieval error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve stats', 
      message: error.message 
    });
  }
});

export default router;
