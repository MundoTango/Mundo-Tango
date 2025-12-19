/**
 * AGENT 1: Life CEO Agents Test Suite
 * Tests all 16 Life CEO AI agent pages
 * Timeline: Days 1-4
 */

import { test, expect } from '@playwright/test';
import { LifeCEOHelper } from '../helpers/lifeceo-helper';
import { setupAuthenticatedSession } from '../helpers/auth-setup';

test.describe('Life CEO Agent System - Complete Coverage', () => {
  test.beforeEach(async ({ page }) => {
    // Use session reuse for faster tests
    await setupAuthenticatedSession(page);
  });

  // Test Life CEO Dashboard
  test('Life CEO Dashboard loads correctly', async ({ page }) => {
    await page.goto('/life-ceo');
    await page.waitForLoadState('networkidle');
    
    // Verify page loaded with flexible selectors
    await expect(page.getByRole('heading', { name: /life ceo|ceo/i })).toBeVisible();
    
    // Verify some agent links/cards are present (flexible selector)
    const agentElements = page.locator('[data-testid*="agent"], [href*="/life-ceo/"]');
    const count = await agentElements.count();
    expect(count).toBeGreaterThan(0); // At least some agents visible
  });

  // Test each Life CEO agent
  const agents = LifeCEOHelper.getAllAgents();
  
  for (const agentName of agents) {
    test(`Life CEO ${agentName} agent works correctly`, async ({ page }) => {
      // Navigate to agent page
      await LifeCEOHelper.navigateToAgent(page, agentName);
      
      // Verify agent dashboard loaded
      await LifeCEOHelper.verifyAgentDashboard(page, agentName);
      
      // Send a test query
      const testQueries: Record<string, string> = {
        health: 'What are some healthy habits?',
        finance: 'How can I budget better?',
        career: 'What are good career development tips?',
        productivity: 'How can I be more productive?',
        travel: 'Where should I travel for tango?',
        home: 'How can I organize my home?',
        learning: 'What should I learn next?',
        social: 'How can I improve my social skills?',
        wellness: 'What are wellness best practices?',
        entertainment: 'What are good entertainment options?',
        creativity: 'How can I boost creativity?',
        fitness: 'What is a good workout routine?',
        nutrition: 'What are healthy eating tips?',
        sleep: 'How can I improve my sleep?',
        stress: 'How can I manage stress?',
      };
      
      const query = testQueries[agentName] || 'How can you help me?';
      await LifeCEOHelper.sendQuery(page, query);
      
      // Verify response quality
      await LifeCEOHelper.verifyResponseQuality(page);
    });
  }

  // Test agent data persistence
  test('Life CEO agent saves conversation history', async ({ page }) => {
    await LifeCEOHelper.navigateToAgent(page, 'health');
    
    // Send first message
    await LifeCEOHelper.sendQuery(page, 'First test message');
    
    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Verify message history persisted
    await expect(page.getByText('First test message')).toBeVisible();
  });

  // Test agent switching
  test('Can switch between Life CEO agents', async ({ page }) => {
    // Start with health agent
    await LifeCEOHelper.navigateToAgent(page, 'health');
    await LifeCEOHelper.verifyAgentDashboard(page, 'health');
    
    // Switch to finance agent
    await page.getByTestId('nav-agent-finance').click();
    await page.waitForURL('**/life-ceo/finance');
    await LifeCEOHelper.verifyAgentDashboard(page, 'finance');
  });

  // Test agent recommendations
  test('Life CEO agents provide contextual recommendations', async ({ page }) => {
    await LifeCEOHelper.navigateToAgent(page, 'travel');
    
    // Check for recommendations section
    await expect(page.getByTestId('agent-recommendations')).toBeVisible();
  });
});
