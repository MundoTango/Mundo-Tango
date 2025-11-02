import { Router } from 'express';
import { authenticateToken, requireRoleLevel, AuthRequest } from '../middleware/auth';
import { SelfHealingService } from '../services/SelfHealingService';

/**
 * BLOCKER 5: Self-Healing System Routes
 * 
 * Super Admin-only endpoints for automated page validation
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

export default router;
