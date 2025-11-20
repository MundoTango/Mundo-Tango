/**
 * PAGE AUDIT API ROUTES - MB.MD PROTOCOL v9.2
 * November 20, 2025
 */

import { Router } from 'express';
import { pageAuditService } from '../services/page-audit/PageAuditService';

const router = Router();

/**
 * POST /api/page-audit/audit
 * Audit a single page
 */
router.post('/audit', async (req, res) => {
  try {
    const { pagePath, category, handoffReference, autoFix } = req.body;
    
    if (!pagePath) {
      return res.status(400).json({ error: 'pagePath is required' });
    }
    
    console.log(`🔍 [API] Page audit request: ${pagePath}`);
    
    const report = await pageAuditService.auditPage({
      pagePath,
      category,
      handoffReference,
      autoFix
    });
    
    res.json({
      success: true,
      report
    });
    
  } catch (error) {
    console.error('[API] Page audit failed:', error);
    res.status(500).json({ 
      error: 'Page audit failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/page-audit/auto-fix
 * Auto-fix issues in an audit report
 */
router.post('/auto-fix', async (req, res) => {
  try {
    const { report } = req.body;
    
    if (!report) {
      return res.status(400).json({ error: 'report is required' });
    }
    
    console.log(`🔧 [API] Auto-fix request for ${report.pagePath}`);
    
    const result = await pageAuditService.autoFixIssues(report);
    
    res.json({
      success: true,
      fixed: result.fixed,
      failed: result.failed
    });
    
  } catch (error) {
    console.error('[API] Auto-fix failed:', error);
    res.status(500).json({ 
      error: 'Auto-fix failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/page-audit/categories
 * Get list of audit categories
 */
router.get('/categories', (req, res) => {
  res.json({
    categories: [
      {
        id: 'component-structure',
        name: 'Component Structure',
        description: 'Proper imports, exports, TypeScript usage'
      },
      {
        id: 'data-fetching',
        name: 'Data Fetching',
        description: 'useQuery patterns, loading states, error handling'
      },
      {
        id: 'forms',
        name: 'Forms',
        description: 'useForm, validation, submission'
      },
      {
        id: 'ui-ux',
        name: 'UI/UX',
        description: 'Layout, Cards, spacing, visual consistency'
      },
      {
        id: 'routing',
        name: 'Routing',
        description: 'Wouter integration, params, navigation'
      },
      {
        id: 'api-integration',
        name: 'API Integration',
        description: 'Backend routes, validation, error handling'
      },
      {
        id: 'database',
        name: 'Database',
        description: 'Schema integrity, relations, indexes'
      },
      {
        id: 'testing',
        name: 'Testing',
        description: 'Playwright tests, data-testid attributes'
      },
      {
        id: 'documentation',
        name: 'Documentation',
        description: 'Handoff compliance, feature completeness'
      },
      {
        id: 'performance',
        name: 'Performance',
        description: 'Bundle size, lazy loading, memoization'
      },
      {
        id: 'security',
        name: 'Security',
        description: 'XSS prevention, input validation, auth'
      },
      {
        id: 'accessibility',
        name: 'Accessibility',
        description: 'WCAG 2.1 AAA, keyboard nav, ARIA'
      }
    ]
  });
});

export default router;
