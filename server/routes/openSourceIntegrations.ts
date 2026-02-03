/**
 * OPEN SOURCE INTEGRATIONS API ROUTES
 * MB.MD v9.9.3 - External Knowledge Integrations
 * 
 * REST API for:
 * - GenAI Agents (NirDiamant patterns)
 * - Curriculum (Microsoft generative-ai-for-beginners)
 * - Media Workflows (ComfyUI-style)
 */

import { Router } from 'express';
import { genAIAgentsService } from '../services/GenAIAgentsService';
import { curriculumIngestionService } from '../services/CurriculumIngestionService';
import { mediaWorkflowOrchestrator, ROLE_QUOTAS } from '../services/MediaWorkflowOrchestrator';

const router = Router();

// ============================================================================
// GENAI AGENTS (NirDiamant)
// ============================================================================

/**
 * GET /api/integrations/genai/patterns
 * Get agent patterns (role-filtered)
 */
router.get('/genai/patterns', async (req, res) => {
  try {
    const roleLevel = (req as any).user?.roleLevel || 1;
    const category = req.query.category as string;

    let patterns;
    if (category) {
      patterns = genAIAgentsService.getPatternsByCategory(category as any);
    } else {
      patterns = genAIAgentsService.getAllPatterns();
    }

    // Filter visibility based on role
    // Standard users see simplified patterns
    const filteredPatterns = patterns.map(p => {
      if (roleLevel < 3) {
        return {
          id: p.id,
          name: p.name,
          category: p.category,
          description: p.description,
          useCases: p.useCases
        };
      }
      return p;
    });

    res.json({
      success: true,
      patterns: filteredPatterns,
      count: filteredPatterns.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get patterns'
    });
  }
});

/**
 * GET /api/integrations/genai/patterns/:id
 * Get a specific pattern
 */
router.get('/genai/patterns/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const pattern = genAIAgentsService.getPattern(id);

    if (!pattern) {
      return res.status(404).json({
        success: false,
        error: 'Pattern not found'
      });
    }

    res.json({
      success: true,
      pattern
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get pattern'
    });
  }
});

/**
 * POST /api/integrations/genai/search
 * Search patterns semantically
 */
router.post('/genai/search', async (req, res) => {
  try {
    const { query, limit = 5 } = req.body;

    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'query is required'
      });
    }

    const patterns = await genAIAgentsService.searchPatterns(query, limit);

    res.json({
      success: true,
      patterns,
      count: patterns.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to search patterns'
    });
  }
});

/**
 * POST /api/integrations/genai/recommend
 * Get recommended pattern for a use case
 */
router.post('/genai/recommend', async (req, res) => {
  try {
    const { useCase } = req.body;

    if (!useCase) {
      return res.status(400).json({
        success: false,
        error: 'useCase is required'
      });
    }

    const pattern = await genAIAgentsService.recommendPattern(useCase);

    res.json({
      success: true,
      recommendation: pattern
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get recommendation'
    });
  }
});

/**
 * GET /api/integrations/genai/guide/:id
 * Get implementation guide for a pattern
 */
router.get('/genai/guide/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const guide = genAIAgentsService.getImplementationGuide(id);

    if (!guide) {
      return res.status(404).json({
        success: false,
        error: 'Pattern not found'
      });
    }

    res.json({
      success: true,
      guide
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get guide'
    });
  }
});

/**
 * GET /api/integrations/genai/stats
 * Get pattern statistics
 */
router.get('/genai/stats', async (_req, res) => {
  try {
    const stats = genAIAgentsService.getStatistics();
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get statistics'
    });
  }
});

// ============================================================================
// CURRICULUM (Microsoft generative-ai-for-beginners)
// ============================================================================

/**
 * GET /api/integrations/curriculum/modules
 * Get all learning modules
 */
router.get('/curriculum/modules', async (req, res) => {
  try {
    const difficulty = req.query.difficulty as string;

    let modules;
    if (difficulty) {
      modules = curriculumIngestionService.getModulesByDifficulty(difficulty as any);
    } else {
      modules = curriculumIngestionService.getAllModules();
    }

    res.json({
      success: true,
      modules,
      count: modules.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get modules'
    });
  }
});

/**
 * GET /api/integrations/curriculum/modules/:id
 * Get a specific module
 */
router.get('/curriculum/modules/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const module = curriculumIngestionService.getModule(id);

    if (!module) {
      return res.status(404).json({
        success: false,
        error: 'Module not found'
      });
    }

    res.json({
      success: true,
      module
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get module'
    });
  }
});

/**
 * GET /api/integrations/curriculum/paths
 * Get all learning paths
 */
router.get('/curriculum/paths', async (_req, res) => {
  try {
    const paths = curriculumIngestionService.getAllPaths();

    res.json({
      success: true,
      paths,
      count: paths.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get paths'
    });
  }
});

/**
 * GET /api/integrations/curriculum/paths/:id
 * Get a specific learning path
 */
router.get('/curriculum/paths/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const path = curriculumIngestionService.getPath(id);

    if (!path) {
      return res.status(404).json({
        success: false,
        error: 'Path not found'
      });
    }

    // Get full modules for the path
    const modules = path.modules
      .map(mId => curriculumIngestionService.getModule(mId))
      .filter(m => m !== undefined);

    res.json({
      success: true,
      path,
      modules
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get path'
    });
  }
});

/**
 * POST /api/integrations/curriculum/search
 * Search modules semantically
 */
router.post('/curriculum/search', async (req, res) => {
  try {
    const { query, limit = 5 } = req.body;

    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'query is required'
      });
    }

    const modules = await curriculumIngestionService.searchModules(query, limit);

    res.json({
      success: true,
      modules,
      count: modules.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to search modules'
    });
  }
});

/**
 * POST /api/integrations/curriculum/recommend-path
 * Recommend a learning path
 */
router.post('/curriculum/recommend-path', async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'query is required'
      });
    }

    const path = await curriculumIngestionService.recommendPath(query);

    res.json({
      success: true,
      recommendation: path
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get recommendation'
    });
  }
});

/**
 * GET /api/integrations/curriculum/stats
 * Get curriculum statistics
 */
router.get('/curriculum/stats', async (_req, res) => {
  try {
    const stats = curriculumIngestionService.getStatistics();
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get statistics'
    });
  }
});

// ============================================================================
// MEDIA WORKFLOWS (ComfyUI-style)
// ============================================================================

/**
 * GET /api/integrations/media/workflows
 * Get available workflows (role-filtered)
 */
router.get('/media/workflows', async (req, res) => {
  try {
    const roleLevel = (req as any).user?.roleLevel || 1;
    const workflows = mediaWorkflowOrchestrator.getWorkflowsForRole(roleLevel);

    res.json({
      success: true,
      workflows,
      count: workflows.length,
      quotas: ROLE_QUOTAS[roleLevel as keyof typeof ROLE_QUOTAS]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get workflows'
    });
  }
});

/**
 * GET /api/integrations/media/workflows/:id
 * Get a specific workflow
 */
router.get('/media/workflows/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const roleLevel = (req as any).user?.roleLevel || 1;
    const workflow = mediaWorkflowOrchestrator.getWorkflow(id);

    if (!workflow) {
      return res.status(404).json({
        success: false,
        error: 'Workflow not found'
      });
    }

    // Check if user can access this workflow
    if (workflow.requiredRoleLevel > roleLevel) {
      return res.status(403).json({
        success: false,
        error: `This workflow requires role level ${workflow.requiredRoleLevel}. Upgrade to unlock!`,
        upgradeRequired: true
      });
    }

    res.json({
      success: true,
      workflow
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get workflow'
    });
  }
});

/**
 * POST /api/integrations/media/generate
 * Queue a media generation job
 */
router.post('/media/generate', async (req, res) => {
  try {
    const { workflowId, inputs } = req.body;
    const userId = (req as any).user?.id || 'anonymous';
    const roleLevel = (req as any).user?.roleLevel || 1;

    if (!workflowId) {
      return res.status(400).json({
        success: false,
        error: 'workflowId is required'
      });
    }

    const result = await mediaWorkflowOrchestrator.queueJob(
      userId,
      roleLevel,
      workflowId,
      inputs || {}
    );

    if ('error' in result) {
      return res.status(403).json({
        success: false,
        error: result.error
      });
    }

    res.json({
      success: true,
      job: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to queue generation job'
    });
  }
});

/**
 * GET /api/integrations/media/jobs
 * Get user's generation jobs
 */
router.get('/media/jobs', async (req, res) => {
  try {
    const userId = (req as any).user?.id || 'anonymous';
    const limit = parseInt(req.query.limit as string) || 10;
    const jobs = mediaWorkflowOrchestrator.getUserJobs(userId, limit);

    res.json({
      success: true,
      jobs,
      count: jobs.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get jobs'
    });
  }
});

/**
 * GET /api/integrations/media/jobs/:id
 * Get a specific job
 */
router.get('/media/jobs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const job = mediaWorkflowOrchestrator.getJob(id);

    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      });
    }

    res.json({
      success: true,
      job
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get job'
    });
  }
});

/**
 * GET /api/integrations/media/empty-state
 * Get empty state for current user's role
 */
router.get('/media/empty-state', async (req, res) => {
  try {
    const roleLevel = (req as any).user?.roleLevel || 1;
    const emptyState = mediaWorkflowOrchestrator.getEmptyStateForRole(roleLevel);

    res.json({
      success: true,
      emptyState
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get empty state'
    });
  }
});

/**
 * GET /api/integrations/media/stats
 * Get media workflow statistics
 */
router.get('/media/stats', async (_req, res) => {
  try {
    const stats = mediaWorkflowOrchestrator.getStatistics();
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get statistics'
    });
  }
});

export default router;
