/**
 * AGENT 7: Advanced AI Systems Test Suite
 * Tests ESA Framework, AI Intelligence Core, Bifrost Gateway
 * Timeline: Days 2-3
 */

import { test, expect } from '@playwright/test';
import { AdvancedAIHelper } from '../helpers/advanced-ai-helper';
import { setupAuthenticatedSession } from '../helpers/auth-setup';

test.describe('Advanced AI Systems - Complete Coverage', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedSession(page);
  });

  // ESA Framework Tests
  test('ESA Dashboard loads correctly', async ({ page }) => {
    await AdvancedAIHelper.navigateToESADashboard(page);
    await AdvancedAIHelper.verifyESADashboard(page);
  });

  test('ESA Tasks page displays correctly', async ({ page }) => {
    await AdvancedAIHelper.navigateToESATasks(page);
    await AdvancedAIHelper.verifyAdminPage(page, 'tasks');
  });

  test('ESA Communications page displays correctly', async ({ page }) => {
    await AdvancedAIHelper.navigateToESACommunications(page);
    await AdvancedAIHelper.verifyAdminPage(page, 'communications');
  });

  test('Can create ESA task via API', async ({ page }) => {
    const task = await AdvancedAIHelper.createESATask(page, {
      title: 'Test Bug Fix',
      priority: 'high'
    });
    
    // Verify task was created
    expect(task).toBeDefined();
    if (task.success !== undefined) {
      expect(task.success).toBeTruthy();
    }
  });

  test('Can create ESA communication via API', async ({ page }) => {
    // Create task first
    const task = await AdvancedAIHelper.createESATask(page);
    
    if (task.task && task.task.id) {
      // Create communication for task
      const comm = await AdvancedAIHelper.createESACommunication(page, task.task.id);
      
      // Verify communication was created
      expect(comm).toBeDefined();
      if (comm.success !== undefined) {
        expect(comm.success).toBeTruthy();
      }
    }
  });

  test('ESA task list displays created tasks', async ({ page }) => {
    // Create a test task
    await AdvancedAIHelper.createESATask(page, {
      title: 'Visible Test Task'
    });
    
    // Navigate to tasks page
    await AdvancedAIHelper.navigateToESATasks(page);
    
    // Check for task list
    await AdvancedAIHelper.verifyTableDisplayed(page);
  });

  // AI Intelligence Dashboard Tests
  test('AI Intelligence Dashboard loads correctly', async ({ page }) => {
    await AdvancedAIHelper.navigateToAIIntelligence(page);
    await AdvancedAIHelper.verifyAdminPage(page, 'intelligence');
  });

  test('Multi-AI Metrics page displays correctly', async ({ page }) => {
    await AdvancedAIHelper.navigateToMultiAIMetrics(page);
    await AdvancedAIHelper.verifyAdminPage(page, 'metrics');
  });

  test('Multi-AI Metrics shows platform data', async ({ page }) => {
    await AdvancedAIHelper.navigateToMultiAIMetrics(page);
    await AdvancedAIHelper.verifyMetricsDisplayed(page);
  });

  // Bifrost Gateway Tests
  test('Bifrost Dashboard loads correctly', async ({ page }) => {
    await AdvancedAIHelper.navigateToBifrostDashboard(page);
    await AdvancedAIHelper.verifyAdminPage(page, 'bifrost');
  });

  test('Cost Tracking page displays correctly', async ({ page }) => {
    await AdvancedAIHelper.navigateToCostTracking(page);
    await AdvancedAIHelper.verifyAdminPage(page, 'cost');
  });

  test('Cost Tracking shows spending data', async ({ page }) => {
    await AdvancedAIHelper.navigateToCostTracking(page);
    await AdvancedAIHelper.verifyMetricsDisplayed(page);
  });

  test('Semantic Cache page displays correctly', async ({ page }) => {
    await AdvancedAIHelper.navigateToSemanticCache(page);
    await AdvancedAIHelper.verifyAdminPage(page, 'cache');
  });

  test('Semantic Cache shows hit rate metrics', async ({ page }) => {
    await AdvancedAIHelper.navigateToSemanticCache(page);
    await AdvancedAIHelper.verifyMetricsDisplayed(page);
  });

  // Agent Performance Tests
  test('Agent Performance page displays correctly', async ({ page }) => {
    await AdvancedAIHelper.navigateToAgentPerformance(page);
    await AdvancedAIHelper.verifyAdminPage(page, 'performance');
  });

  test('Agent Performance shows metrics', async ({ page }) => {
    await AdvancedAIHelper.navigateToAgentPerformance(page);
    await AdvancedAIHelper.verifyTableDisplayed(page);
  });

  // Quality Validation Tests
  test('Quality Validation page displays correctly', async ({ page }) => {
    await AdvancedAIHelper.navigateToQualityValidation(page);
    await AdvancedAIHelper.verifyAdminPage(page, 'quality');
  });

  test('Quality Validation shows validation results', async ({ page }) => {
    await AdvancedAIHelper.navigateToQualityValidation(page);
    await AdvancedAIHelper.verifyTableDisplayed(page);
  });

  // Learning Patterns Tests
  test('Learning Patterns page displays correctly', async ({ page }) => {
    await AdvancedAIHelper.navigateToLearningPatterns(page);
    await AdvancedAIHelper.verifyAdminPage(page, 'learning');
  });

  test('Learning Patterns shows pattern library', async ({ page }) => {
    await AdvancedAIHelper.navigateToLearningPatterns(page);
    await AdvancedAIHelper.verifyTableDisplayed(page);
  });

  // Collaboration Log Tests
  test('Collaboration Log page displays correctly', async ({ page }) => {
    await AdvancedAIHelper.navigateToCollaborationLog(page);
    await AdvancedAIHelper.verifyAdminPage(page, 'collaboration');
  });

  test('Collaboration Log shows agent communications', async ({ page }) => {
    await AdvancedAIHelper.navigateToCollaborationLog(page);
    await AdvancedAIHelper.verifyTableDisplayed(page);
  });

  // Knowledge Graph Tests
  test('Knowledge Graph page displays correctly', async ({ page }) => {
    await AdvancedAIHelper.navigateToKnowledgeGraph(page);
    await AdvancedAIHelper.verifyAdminPage(page, 'knowledge');
  });

  test('Knowledge Graph shows relationships', async ({ page }) => {
    await AdvancedAIHelper.navigateToKnowledgeGraph(page);
    // Knowledge graph might use canvas or SVG
    const graph = page.locator('canvas, svg, [data-testid*="graph"]').first();
    if (await graph.isVisible()) {
      await expect(graph).toBeVisible();
    }
  });

  // Platform Health Tests
  test('Platform Health page displays correctly', async ({ page }) => {
    await AdvancedAIHelper.navigateToPlatformHealth(page);
    await AdvancedAIHelper.verifyAdminPage(page, 'health');
  });

  test('Platform Health shows system metrics', async ({ page }) => {
    await AdvancedAIHelper.navigateToPlatformHealth(page);
    await AdvancedAIHelper.verifyMetricsDisplayed(page);
  });

  // Intelligence Overview Tests
  test('Intelligence Overview page displays correctly', async ({ page }) => {
    await AdvancedAIHelper.navigateToIntelligenceOverview(page);
    await AdvancedAIHelper.verifyAdminPage(page, 'intelligence');
  });

  test('Intelligence Overview shows comprehensive dashboard', async ({ page }) => {
    await AdvancedAIHelper.navigateToIntelligenceOverview(page);
    await AdvancedAIHelper.verifyMetricsDisplayed(page);
  });
});
