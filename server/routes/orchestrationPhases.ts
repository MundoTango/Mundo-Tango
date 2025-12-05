/**
 * ORCHESTRATION PHASES API ROUTES
 * MB.MD v9.9.3 - Patterns 66, 67, 68
 * 
 * REST API for:
 * - Phase 3: Build/Audit (Pattern 66 - Swarm Choreography)
 * - Phase 4: Test (Pattern 67 - Validation Relay)
 * - Phase 5: Fix (Pattern 68 - 3-Strike AutoFix)
 */

import { Router } from 'express';
import { swarmChoreographyController } from '../services/orchestration/SwarmChoreographyController';
import { validationRelayService } from '../services/orchestration/ValidationRelayService';
import { strikeTracker } from '../services/orchestration/StrikeTracker';

const router = Router();

// ============================================================================
// PHASE 3: BUILD/AUDIT (Pattern 66)
// ============================================================================

/**
 * POST /api/orchestration/audit
 * Start a page audit
 */
router.post('/audit', async (req, res) => {
  try {
    const { pageId, pageName, pageUrl, auditType = 'full' } = req.body;
    const userId = (req as any).user?.id || 'anonymous';
    const roleLevel = (req as any).user?.roleLevel || 1;

    if (!pageId || !pageName) {
      return res.status(400).json({
        success: false,
        error: 'pageId and pageName are required'
      });
    }

    const result = await swarmChoreographyController.auditPage({
      pageId,
      pageName,
      pageUrl: pageUrl || `/${pageId}`,
      requestedBy: userId,
      roleLevel,
      auditType
    });

    res.json({
      success: true,
      audit: result
    });
  } catch (error) {
    console.error('[Orchestration] Audit failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to complete audit'
    });
  }
});

/**
 * GET /api/orchestration/swarm/status
 * Get swarm choreography status
 */
router.get('/swarm/status', async (_req, res) => {
  try {
    const status = swarmChoreographyController.getStatus();
    res.json({
      success: true,
      status
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get swarm status'
    });
  }
});

/**
 * GET /api/orchestration/issues
 * Get issues (filtered by user role)
 */
router.get('/issues', async (req, res) => {
  try {
    const roleLevel = (req as any).user?.roleLevel || 1;
    const status = req.query.status as string;

    let issues;
    if (status) {
      issues = swarmChoreographyController.getIssuesByStatus(status as any);
    } else {
      issues = swarmChoreographyController.getIssuesForRole(roleLevel);
    }

    res.json({
      success: true,
      issues,
      count: issues.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get issues'
    });
  }
});

/**
 * PATCH /api/orchestration/issues/:id/fix
 * Mark an issue as fixed
 */
router.patch('/issues/:id/fix', async (req, res) => {
  try {
    const { id } = req.params;
    const { trmContext } = req.body;
    const userId = (req as any).user?.id || 'anonymous';

    const success = await swarmChoreographyController.fixIssue(id, userId, trmContext);

    if (!success) {
      return res.status(404).json({
        success: false,
        error: 'Issue not found'
      });
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fix issue'
    });
  }
});

/**
 * GET /api/orchestration/sme-agents
 * Get SME agents
 */
router.get('/sme-agents', async (_req, res) => {
  try {
    const agents = swarmChoreographyController.getSMEAgents();
    res.json({
      success: true,
      agents
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get SME agents'
    });
  }
});

// ============================================================================
// PHASE 4: TEST (Pattern 67)
// ============================================================================

/**
 * POST /api/orchestration/validate
 * Queue a validation
 */
router.post('/validate', async (req, res) => {
  try {
    const { type, target, priority = 'medium', config } = req.body;
    const userId = (req as any).user?.id || 'anonymous';
    const roleLevel = (req as any).user?.roleLevel || 1;

    if (!type || !target) {
      return res.status(400).json({
        success: false,
        error: 'type and target are required'
      });
    }

    const requestId = await validationRelayService.queueValidation({
      type,
      target,
      priority,
      requestedBy: userId,
      roleLevel,
      config
    });

    res.json({
      success: true,
      requestId
    });
  } catch (error) {
    console.error('[Orchestration] Validation queue failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to queue validation'
    });
  }
});

/**
 * GET /api/orchestration/validation/queue
 * Get validation queue status
 */
router.get('/validation/queue', async (_req, res) => {
  try {
    const status = validationRelayService.getQueueStatus();
    res.json({
      success: true,
      queue: status
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get queue status'
    });
  }
});

/**
 * GET /api/orchestration/validation/results
 * Get recent validation results
 */
router.get('/validation/results', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const results = validationRelayService.getRecentResults(limit);

    res.json({
      success: true,
      results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get validation results'
    });
  }
});

/**
 * GET /api/orchestration/validation/results/:id
 * Get specific validation result
 */
router.get('/validation/results/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = validationRelayService.getResult(id);

    if (!result) {
      return res.status(404).json({
        success: false,
        error: 'Result not found'
      });
    }

    res.json({
      success: true,
      result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get validation result'
    });
  }
});

/**
 * GET /api/orchestration/validation/stats
 * Get validation statistics
 */
router.get('/validation/stats', async (_req, res) => {
  try {
    const stats = validationRelayService.getStats();
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get validation stats'
    });
  }
});

/**
 * POST /api/orchestration/validation/report
 * Generate a validation report
 */
router.post('/validation/report', async (req, res) => {
  try {
    const { name, resultIds } = req.body;
    const userId = (req as any).user?.id || 'anonymous';
    const roleLevel = (req as any).user?.roleLevel || 1;

    const report = await validationRelayService.generateReport(
      name || 'Validation Report',
      userId,
      roleLevel,
      resultIds
    );

    res.json({
      success: true,
      report
    });
  } catch (error) {
    console.error('[Orchestration] Report generation failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate report'
    });
  }
});

// ============================================================================
// PHASE 5: FIX (Pattern 68)
// ============================================================================

/**
 * POST /api/orchestration/autofix/register
 * Register an issue for auto-fix tracking
 */
router.post('/autofix/register', async (req, res) => {
  try {
    const { issueId, issueType, issueSeverity } = req.body;

    if (!issueId || !issueType) {
      return res.status(400).json({
        success: false,
        error: 'issueId and issueType are required'
      });
    }

    const strikes = await strikeTracker.registerIssue(
      issueId,
      issueType,
      issueSeverity || 'medium'
    );

    res.json({
      success: true,
      strikes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to register issue'
    });
  }
});

/**
 * POST /api/orchestration/autofix/attempt
 * Record a fix attempt
 */
router.post('/autofix/attempt', async (req, res) => {
  try {
    const { 
      issueId, 
      strategy, 
      appliedFix, 
      success, 
      confidence, 
      duration,
      error: fixError,
      trmContext 
    } = req.body;

    if (!issueId || !strategy || !appliedFix) {
      return res.status(400).json({
        success: false,
        error: 'issueId, strategy, and appliedFix are required'
      });
    }

    const result = await strikeTracker.recordAttempt(
      issueId,
      strategy,
      appliedFix,
      success ?? false,
      confidence ?? 0.5,
      duration ?? 0,
      fixError,
      trmContext
    );

    res.json({
      success: true,
      strikes: result.strikes,
      shouldEscalate: result.shouldEscalate
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to record attempt'
    });
  }
});

/**
 * GET /api/orchestration/autofix/metrics
 * Get auto-fix metrics
 */
router.get('/autofix/metrics', async (_req, res) => {
  try {
    const metrics = strikeTracker.getMetrics();
    const withinTarget = strikeTracker.isWithinEscalationTarget();

    res.json({
      success: true,
      metrics,
      withinTarget,
      target: '<10% escalation rate'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get metrics'
    });
  }
});

/**
 * GET /api/orchestration/autofix/escalated
 * Get escalated issues (role-filtered)
 */
router.get('/autofix/escalated', async (req, res) => {
  try {
    const roleLevel = (req as any).user?.roleLevel || 1;
    const escalated = strikeTracker.getEscalatedForRole(roleLevel);

    res.json({
      success: true,
      escalated,
      count: escalated.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get escalated issues'
    });
  }
});

/**
 * POST /api/orchestration/autofix/resolve
 * Manually resolve an issue
 */
router.post('/autofix/resolve', async (req, res) => {
  try {
    const { issueId } = req.body;
    const userId = (req as any).user?.id || 'anonymous';

    if (!issueId) {
      return res.status(400).json({
        success: false,
        error: 'issueId is required'
      });
    }

    const success = await strikeTracker.resolveManually(issueId, userId);

    if (!success) {
      return res.status(404).json({
        success: false,
        error: 'Issue not found'
      });
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to resolve issue'
    });
  }
});

/**
 * GET /api/orchestration/autofix/suggest/:issueId
 * Get suggested fix for an issue
 */
router.get('/autofix/suggest/:issueId', async (req, res) => {
  try {
    const { issueId } = req.params;
    const suggestion = await strikeTracker.getFixWithContext(issueId);

    res.json({
      success: true,
      suggestion
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get fix suggestion'
    });
  }
});

/**
 * GET /api/orchestration/autofix/learnings
 * Get all learned fix patterns
 */
router.get('/autofix/learnings', async (_req, res) => {
  try {
    const learnings = strikeTracker.getAllLearnings();

    res.json({
      success: true,
      learnings,
      count: learnings.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get learnings'
    });
  }
});

/**
 * GET /api/orchestration/autofix/stats
 * Get strike tracker statistics
 */
router.get('/autofix/stats', async (_req, res) => {
  try {
    const stats = strikeTracker.getStats();
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get autofix stats'
    });
  }
});

export default router;
