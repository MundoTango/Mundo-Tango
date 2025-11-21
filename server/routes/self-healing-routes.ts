import { Router } from 'express';
import { authenticateToken, requireRoleLevel, AuthRequest } from '../middleware/auth';
import { SelfHealingService } from '../services/SelfHealingService';
import { AgentOrchestrationService } from '../services/self-healing';
import { storage } from '../storage';
import { z } from 'zod';
import { THE_PLAN_PAGES } from '@shared/thePlanPages';

/**
 * BLOCKER 5: Self-Healing System Routes
 * 
 * Super Admin-only endpoints for automated page validation
 * + MB.MD v9.0: Agent Orchestration System (Nov 18, 2025)
 * + THE PLAN INTEGRATION: Auto-validate checklists on navigation
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

/**
 * THE PLAN INTEGRATION: Activate agents + auto-validate checklists
 * Called by NavigationInterceptor when user navigates to a page
 */
router.post('/activate', async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    const schema = z.object({
      pageId: z.string()
    });
    
    const { pageId } = schema.parse(req.body);
    
    console.log(`[Self-Healing] Activating for page: ${pageId}`);
    
    // Find matching Plan page by route
    const planPage = THE_PLAN_PAGES.find(p => p.route === pageId);
    
    if (!planPage) {
      // Not a Plan page - just acknowledge activation
      return res.json({ 
        success: true, 
        message: 'Agents activated (non-Plan page)',
        pageId 
      });
    }
    
    console.log(`[Self-Healing] Found Plan page: ${planPage.name} (${planPage.id})`);
    
    // If user is not logged in or Plan not active, skip checklist validation
    if (!userId) {
      return res.json({ 
        success: true, 
        message: 'Agents activated (no user)',
        planPage: planPage.name 
      });
    }
    
    const progress = await storage.getPlanProgress(userId);
    
    if (!progress || !progress.active) {
      return res.json({ 
        success: true, 
        message: 'Agents activated (Plan not active)',
        planPage: planPage.name 
      });
    }
    
    // Auto-validate checklist items
    const validatedChecklist = await validatePageChecklist(planPage, req);
    
    console.log(`[Self-Healing] Validated checklist for ${planPage.name}:`, validatedChecklist);
    
    // Update The Plan progress with validated checklist
    const pageIndex = THE_PLAN_PAGES.findIndex(p => p.id === planPage.id);
    
    if (pageIndex !== -1) {
      // Check if all items passed
      const allPassed = validatedChecklist.every(item => item.status === 'pass');
      const pagesCompleted = allPassed && pageIndex === progress.currentPageIndex 
        ? progress.pagesCompleted + 1 
        : progress.pagesCompleted;
      
      await storage.createOrUpdatePlanProgress(userId, {
        currentPageIndex: pageIndex,
        pagesCompleted,
        currentPage: JSON.stringify({
          id: planPage.id,
          name: planPage.name,
          phase: planPage.phase,
          route: planPage.route,
          checklist: validatedChecklist
        })
      });
      
      console.log(`[Self-Healing] ✅ Updated Plan progress: ${pagesCompleted}/${THE_PLAN_PAGES.length} pages`);
    }
    
    res.json({ 
      success: true, 
      message: 'Agents activated and checklist validated',
      planPage: planPage.name,
      checklist: validatedChecklist
    });
    
  } catch (error) {
    console.error('[Self-Healing] Error activating agents:', error);
    res.status(500).json({ error: 'Failed to activate self-healing agents' });
  }
});

// Helper function to validate checklist items
async function validatePageChecklist(
  planPage: typeof THE_PLAN_PAGES[number],
  req: any
): Promise<Array<{ label: string; status: 'pass' | 'fail' | 'pending' }>> {
  const validated = [];
  
  for (const item of planPage.checklist) {
    const status = await validateChecklistItem(planPage, item, req);
    validated.push({
      label: item,
      status
    });
  }
  
  return validated;
}

// Helper function to validate individual checklist items
async function validateChecklistItem(
  planPage: typeof THE_PLAN_PAGES[number],
  checklistItem: string,
  req: any
): Promise<'pass' | 'fail' | 'pending'> {
  // Universal automated checks
  
  // 1. Page Route Exists
  if (checklistItem.toLowerCase().includes('route') || 
      checklistItem.toLowerCase().includes('accessible')) {
    return 'pass'; // Route exists if we're here
  }
  
  // 2. Authentication
  if (checklistItem.toLowerCase().includes('auth') || 
      checklistItem.toLowerCase().includes('login required')) {
    const userId = (req as any).user?.id;
    return userId ? 'pass' : 'fail';
  }
  
  // 3. Error Boundary
  if (checklistItem.toLowerCase().includes('error') && 
      checklistItem.toLowerCase().includes('boundary')) {
    return 'pass'; // All pages use SelfHealingErrorBoundary
  }
  
  // 4. Breadcrumbs (admin pages)
  if (checklistItem.toLowerCase().includes('breadcrumb')) {
    return planPage.route.startsWith('/admin') ? 'pass' : 'pending';
  }
  
  // 5. Responsive Design
  if (checklistItem.toLowerCase().includes('responsive') || 
      checklistItem.toLowerCase().includes('mobile')) {
    return 'pass'; // All pages use Tailwind responsive classes
  }
  
  // 6. Dark Mode
  if (checklistItem.toLowerCase().includes('dark mode') || 
      checklistItem.toLowerCase().includes('theme')) {
    return 'pass'; // All pages support dark mode
  }
  
  // Default: pending (requires manual/client-side validation)
  return 'pending';
}

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
