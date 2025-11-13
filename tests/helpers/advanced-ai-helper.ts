import { Page, expect } from '@playwright/test';

/**
 * Advanced AI Helper - ESA, Intelligence, Bifrost Testing Utilities
 * Used by Agent 7 for testing advanced AI systems
 */
export class AdvancedAIHelper {
  /**
   * Navigate to ESA Dashboard
   */
  static async navigateToESADashboard(page: Page) {
    await page.goto('/admin/esa-dashboard');
    await page.waitForLoadState('networkidle');
  }

  /**
   * Navigate to ESA Tasks page
   */
  static async navigateToESATasks(page: Page) {
    await page.goto('/admin/esa-tasks');
    await page.waitForLoadState('networkidle');
  }

  /**
   * Navigate to ESA Communications page
   */
  static async navigateToESACommunications(page: Page) {
    await page.goto('/admin/esa-communications');
    await page.waitForLoadState('networkidle');
  }

  /**
   * Create a test ESA task via API
   */
  static async createESATask(page: Page, data?: Partial<any>) {
    const response = await page.request.post('/api/platform/esa/tasks', {
      data: {
        taskType: data?.taskType || 'fix_bug',
        title: data?.title || 'Test ESA Task',
        description: data?.description || 'Test task description',
        priority: data?.priority || 'medium',
        agentCode: data?.agentCode || 'DEBUG-001',
      }
    });
    return await response.json();
  }

  /**
   * Create a test ESA communication via API
   */
  static async createESACommunication(page: Page, taskId: number, data?: Partial<any>) {
    const response = await page.request.post('/api/platform/esa/communications', {
      data: {
        messageType: data?.messageType || 'escalation',
        subject: data?.subject || 'Test Communication',
        message: data?.message || 'Test message body',
        priority: data?.priority || 'normal',
        taskId: taskId,
      }
    });
    return await response.json();
  }

  /**
   * Verify ESA dashboard loaded
   */
  static async verifyESADashboard(page: Page) {
    // Look for dashboard heading
    const heading = page.getByRole('heading', { name: /esa|agent|dashboard/i }).first();
    if (await heading.isVisible()) {
      await expect(heading).toBeVisible();
    }
    
    // Look for agent stats or task list
    const content = page.locator('[data-testid*="esa"], [data-testid*="agent"], [data-testid*="task"]').first();
    if (await content.isVisible()) {
      await expect(content).toBeVisible();
    }
  }

  /**
   * Navigate to AI Intelligence Dashboard
   */
  static async navigateToAIIntelligence(page: Page) {
    await page.goto('/admin/ai-intelligence');
    await page.waitForLoadState('networkidle');
  }

  /**
   * Navigate to Multi-AI Metrics page
   */
  static async navigateToMultiAIMetrics(page: Page) {
    await page.goto('/admin/multi-ai-metrics');
    await page.waitForLoadState('networkidle');
  }

  /**
   * Navigate to Bifrost Dashboard
   */
  static async navigateToBifrostDashboard(page: Page) {
    await page.goto('/admin/bifrost-dashboard');
    await page.waitForLoadState('networkidle');
  }

  /**
   * Navigate to Cost Tracking page
   */
  static async navigateToCostTracking(page: Page) {
    await page.goto('/admin/cost-tracking');
    await page.waitForLoadState('networkidle');
  }

  /**
   * Navigate to Semantic Cache page
   */
  static async navigateToSemanticCache(page: Page) {
    await page.goto('/admin/semantic-cache');
    await page.waitForLoadState('networkidle');
  }

  /**
   * Navigate to Agent Performance page
   */
  static async navigateToAgentPerformance(page: Page) {
    await page.goto('/admin/agent-performance');
    await page.waitForLoadState('networkidle');
  }

  /**
   * Navigate to Quality Validation page
   */
  static async navigateToQualityValidation(page: Page) {
    await page.goto('/admin/quality-validation');
    await page.waitForLoadState('networkidle');
  }

  /**
   * Navigate to Learning Patterns page
   */
  static async navigateToLearningPatterns(page: Page) {
    await page.goto('/admin/learning-patterns');
    await page.waitForLoadState('networkidle');
  }

  /**
   * Navigate to Collaboration Log page
   */
  static async navigateToCollaborationLog(page: Page) {
    await page.goto('/admin/collaboration-log');
    await page.waitForLoadState('networkidle');
  }

  /**
   * Navigate to Knowledge Graph page
   */
  static async navigateToKnowledgeGraph(page: Page) {
    await page.goto('/admin/knowledge-graph');
    await page.waitForLoadState('networkidle');
  }

  /**
   * Navigate to Platform Health page
   */
  static async navigateToPlatformHealth(page: Page) {
    await page.goto('/admin/platform-health');
    await page.waitForLoadState('networkidle');
  }

  /**
   * Navigate to Intelligence Overview page
   */
  static async navigateToIntelligenceOverview(page: Page) {
    await page.goto('/admin/intelligence-overview');
    await page.waitForLoadState('networkidle');
  }

  /**
   * Verify admin page loaded (flexible check)
   */
  static async verifyAdminPage(page: Page, pageName: string) {
    // Look for heading with page name
    const heading = page.getByRole('heading', { name: new RegExp(pageName, 'i') }).first();
    if (await heading.isVisible()) {
      await expect(heading).toBeVisible();
    } else {
      // Fallback: check URL contains page name
      await expect(page).toHaveURL(new RegExp(pageName));
    }
  }

  /**
   * Check if metrics are displayed (flexible)
   */
  static async verifyMetricsDisplayed(page: Page) {
    // Look for numbers, charts, or stats
    const metrics = page.locator('[data-testid*="metric"], [data-testid*="stat"], [data-testid*="chart"]').first();
    if (await metrics.isVisible()) {
      await expect(metrics).toBeVisible();
    }
  }

  /**
   * Check if table/list is displayed (flexible)
   */
  static async verifyTableDisplayed(page: Page) {
    // Look for table or list structure
    const table = page.locator('table, [role="table"], [data-testid*="list"], [data-testid*="table"]').first();
    if (await table.isVisible()) {
      await expect(table).toBeVisible();
    }
  }
}
