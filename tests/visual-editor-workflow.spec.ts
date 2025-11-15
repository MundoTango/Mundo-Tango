import { test, expect } from '@playwright/test';

test.describe('Visual Editor - Complete Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin using environment secrets
    await page.goto('/');
    await page.fill('[data-testid="input-email"]', process.env.TEST_ADMIN_EMAIL || 'admin@mundotango.life');
    await page.fill('[data-testid="input-password"]', process.env.TEST_ADMIN_PASSWORD || 'admin123');
    await page.click('[data-testid="button-login"]');
    await page.waitForURL('/');
    
    // Navigate to Visual Editor
    await page.goto('/admin/visual-editor');
    await page.waitForSelector('[data-visual-editor="root"]');
    await page.waitForTimeout(2000);
  });

  test('complete workflow: navigate, view, and interact with UI', async ({ page }) => {
    // Step 1: Verify initial state
    await expect(page.getByText('Visual Editor')).toBeVisible();
    await expect(page.locator('[data-testid="preview-iframe"]')).toBeVisible();
    
    // Step 2: Check all tabs are accessible
    const tabs = ['mrblue', 'git', 'secrets', 'deploy', 'database', 'console'];
    for (const tab of tabs) {
      await page.click(`[data-testid="tab-${tab}"]`);
      await expect(page.locator(`[data-testid="tab-${tab}"]`)).toHaveAttribute('data-state', 'active');
    }
    
    // Step 3: Return to Mr. Blue and verify chat
    await page.click('[data-testid="tab-mr-blue"]');
    await expect(page.locator('[data-testid="input-mr-blue-visual-chat"]')).toBeVisible();
    
    // Step 4: Type a message
    await page.fill('[data-testid="input-mr-blue-visual-chat"]', 'Hello Mr. Blue!');
    await expect(page.locator('[data-testid="button-send-visual-chat"]')).toBeEnabled();
    
    // Step 5: Clear input
    await page.fill('[data-testid="input-mr-blue-visual-chat"]', '');
    await expect(page.locator('[data-testid="button-send-visual-chat"]')).toBeDisabled();
  });

  test('Mr. Blue interaction workflow', async ({ page }) => {
    await page.click('[data-testid="tab-mr-blue"]');
    
    // Verify initial messages
    const messages = page.locator('[data-testid="message-assistant"]');
    await expect(messages.first()).toBeVisible();
    
    // Type a request
    const chatInput = page.locator('[data-testid="input-mr-blue-visual-chat"]');
    await chatInput.fill('Make the header bigger');
    
    // Verify send button is enabled
    const sendButton = page.locator('[data-testid="button-send-visual-chat"]');
    await expect(sendButton).toBeEnabled();
    
    // Note: Actual send would trigger API call - testing UI readiness
  });

  test('multi-tab navigation workflow', async ({ page }) => {
    // Git Tab workflow
    await page.click('[data-testid="tab-git"]');
    await expect(page.getByText('Pending Commits')).toBeVisible();
    await expect(page.getByText('0 changes tracked')).toBeVisible();
    
    // Secrets Tab workflow
    await page.click('[data-testid="tab-secrets"]');
    await expect(page.getByText('Environment Secrets')).toBeVisible();
    
    // Deploy Tab workflow
    await page.click('[data-testid="tab-deploy"]');
    await expect(page.getByText('Deployments')).toBeVisible();
    
    // Database Tab workflow
    await page.click('[data-testid="tab-database"]');
    await expect(page.getByText('Database')).toBeVisible();
    
    // Console Tab workflow
    await page.click('[data-testid="tab-console"]');
    await expect(page.getByText('Console Output')).toBeVisible();
    await expect(page.getByText('[Visual Editor] Ready')).toBeVisible();
    
    // Back to Mr. Blue
    await page.click('[data-testid="tab-mr-blue"]');
    await expect(page.getByText('Mr. Blue - Visual Editor')).toBeVisible();
  });

  test('page preview switching workflow', async ({ page }) => {
    const pageSelector = page.locator('[data-testid="select-preview-page"]');
    const iframe = page.locator('[data-testid="preview-iframe"]');
    
    // Test multiple page switches
    const pages = [
      { value: '/feed', name: 'Feed' },
      { value: '/events', name: 'Events' },
      { value: '/groups', name: 'Groups' },
      { value: '/', name: 'Homepage' }
    ];
    
    for (const testPage of pages) {
      await pageSelector.selectOption(testPage.value);
      await page.waitForTimeout(800);
      
      const src = await iframe.getAttribute('src');
      expect(src).toContain(testPage.value);
      expect(src).toContain('hideControls=true');
    }
  });

  test('context awareness workflow', async ({ page }) => {
    await page.click('[data-testid="tab-mr-blue"]');
    
    // Check context bar shows current page
    const contextText = page.locator('text=Context:');
    await expect(contextText).toBeVisible();
    
    // Change page and verify context updates
    const pageSelector = page.locator('[data-testid="select-preview-page"]');
    await pageSelector.selectOption('/feed');
    await page.waitForTimeout(1000);
    
    // Context bar should still be visible (exact content may update)
    await expect(contextText).toBeVisible();
  });

  test('comprehensive UI state check', async ({ page }) => {
    // Toolbar elements
    await expect(page.locator('[data-visual-editor="toolbar"]')).toBeVisible();
    await expect(page.locator('[data-testid="select-preview-page"]')).toBeVisible();
    await expect(page.locator('[data-testid="button-open-in-new-tab"]')).toBeVisible();
    await expect(page.locator('[data-testid="button-generate-code"]')).toBeVisible();
    await expect(page.locator('[data-testid="button-save-changes"]')).toBeVisible();
    
    // Preview panel
    await expect(page.locator('[data-visual-editor="preview-panel"]')).toBeVisible();
    await expect(page.locator('[data-testid="preview-iframe"]')).toBeVisible();
    
    // Tools panel
    await expect(page.locator('[data-visual-editor="tools-panel"]')).toBeVisible();
    
    // All tabs
    await expect(page.locator('[data-testid="tab-mrblue"]')).toBeVisible();
    await expect(page.locator('[data-testid="tab-git"]')).toBeVisible();
    await expect(page.locator('[data-testid="tab-secrets"]')).toBeVisible();
    await expect(page.locator('[data-testid="tab-deploy"]')).toBeVisible();
    await expect(page.locator('[data-testid="tab-database"]')).toBeVisible();
    await expect(page.locator('[data-testid="tab-console"]')).toBeVisible();
  });
});
