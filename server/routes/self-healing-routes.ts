import { Router } from 'express';
import { authenticateToken, requireRoleLevel, AuthRequest } from '../middleware/auth';
import { SelfHealingService } from '../services/SelfHealingService';
import { AgentOrchestrationService } from '../services/self-healing';

/**
 * BLOCKER 5: Self-Healing System Routes
 * 
 * Super Admin-only endpoints for automated page validation
 * + MB.MD v9.0: Agent Orchestration System (Nov 18, 2025)
 */
const router = Router();

// Get dashboard data (page health overview)
router.get('/dashboard', authenticateToken, requireRoleLevel(7), async (req: AuthRequest, res) => {
  try {
    const dashboard = await SelfHealingService.getPageHealthDashboard();
    res.json(dashboard);
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({ message: 'Error fetching dashboard data' });
  }
});

// Trigger manual scan
router.post('/scan', authenticateToken, requireRoleLevel(7), async (req: AuthRequest, res) => {
  try {
    const result = await SelfHealingService.scanAllPages();
    res.json(result);
  } catch (error) {
    console.error('Scan error:', error);
    res.status(500).json({ message: 'Error scanning pages' });
  }
});

// Get issues for specific page
router.get('/pages/:pagePath/issues', authenticateToken, requireRoleLevel(7), async (req: AuthRequest, res) => {
  try {
    const { pagePath } = req.params;
    const issues = await SelfHealingService.getPageIssues(decodeURIComponent(pagePath));
    res.json({ issues });
  } catch (error) {
    console.error('Get page issues error:', error);
    res.status(500).json({ message: 'Error fetching page issues' });
  }
});

// Generate AI fix for validation issue
router.post('/generate-fix/:validationLogId', authenticateToken, requireRoleLevel(7), async (req: AuthRequest, res) => {
  try {
    const { validationLogId } = req.params;
    const fix = await SelfHealingService.generateAutoFix(Number(validationLogId));
    res.json(fix);
  } catch (error) {
    console.error('Generate fix error:', error);
    res.status(500).json({ message: 'Error generating fix' });
  }
});

// ============================================================================
// MB.MD v9.0: Agent Orchestration System (Nov 18, 2025)
// ============================================================================

// Trigger complete self-healing cycle for a page (public - called by Visual Editor)
router.post('/orchestrate', async (req, res) => {
  try {
    const { route } = req.body;
    
    if (!route) {
      return res.status(400).json({ 
        success: false, 
        error: 'Route is required' 
      });
    }

    console.log(`🔧 [Agent Orchestration] Handling page load: ${route}`);

    const result = await AgentOrchestrationService.handlePageLoad(route);

    res.json({
      success: true,
      result
    });
  } catch (error: any) {
    console.error('[Agent Orchestration] Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get orchestration health status
router.get('/health', async (req, res) => {
  try {
    const health = await AgentOrchestrationService.getHealthStatus();

    res.json({
      success: true,
      health
    });
  } catch (error: any) {
    console.error('[Agent Orchestration] Health check error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
