import { test, expect } from '@playwright/test';

test.describe('Visual Editor - UI Structure', () => {
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
  });

  test('should display Visual Editor with correct structure', async ({ page }) => {
    // Check toolbar
    await expect(page.locator('[data-visual-editor="toolbar"]')).toBeVisible();
    await expect(page.getByText('Visual Editor')).toBeVisible();
    
    // Check page selector
    await expect(page.locator('[data-testid="select-preview-page"]')).toBeVisible();
    
    // Check action buttons
    await expect(page.locator('[data-testid="button-open-in-new-tab"]')).toBeVisible();
    await expect(page.locator('[data-testid="button-generate-code"]')).toBeVisible();
    await expect(page.locator('[data-testid="button-save-changes"]')).toBeVisible();
  });

  test('should have resizable panels', async ({ page }) => {
    // Check that both panels exist
    await expect(page.locator('[data-visual-editor="preview-panel"]')).toBeVisible();
    await expect(page.locator('[data-visual-editor="tools-panel"]')).toBeVisible();
    
    // Check for resize handle (GripVertical icon from react-resizable-panels)
    const resizeHandle = page.locator('[data-panel-resize-handle-id]');
    await expect(resizeHandle).toBeVisible();
  });

  test('should display all dev tool tabs at top of right panel', async ({ page }) => {
    // Check all tabs are present at the TOP
    const tabs = [
      { testId: 'tab-mr-blue', text: 'Mr. Blue' },
      { testId: 'tab-git', text: 'Git' },
      { testId: 'tab-secrets', text: 'Secrets' },
      { testId: 'tab-deploy', text: 'Deploy' },
      { testId: 'tab-database', text: 'Database' },
      { testId: 'tab-console', text: 'Console' }
    ];

    for (const tab of tabs) {
      const tabElement = page.locator(`[data-testid="${tab.testId}"]`);
      await expect(tabElement).toBeVisible();
      await expect(tabElement).toContainText(tab.text);
    }
  });

  test('should switch between tabs correctly', async ({ page }) => {
    // Start on Mr. Blue tab (default)
    await expect(page.locator('[data-testid="tab-mr-blue"]')).toHaveAttribute('data-state', 'active');
    
    // Click Git tab
    await page.click('[data-testid="tab-git"]');
    await expect(page.locator('[data-testid="tab-git"]')).toHaveAttribute('data-state', 'active');
    await expect(page.getByText('Pending Commits')).toBeVisible();
    
    // Click Secrets tab
    await page.click('[data-testid="tab-secrets"]');
    await expect(page.locator('[data-testid="tab-secrets"]')).toHaveAttribute('data-state', 'active');
    await expect(page.getByText('Environment Secrets')).toBeVisible();
    
    // Click Deploy tab
    await page.click('[data-testid="tab-deploy"]');
    await expect(page.locator('[data-testid="tab-deploy"]')).toHaveAttribute('data-state', 'active');
    await expect(page.getByText('Deployments')).toBeVisible();
    
    // Click Database tab
    await page.click('[data-testid="tab-database"]');
    await expect(page.locator('[data-testid="tab-database"]')).toHaveAttribute('data-state', 'active');
    await expect(page.getByText('Database')).toBeVisible();
    
    // Click Console tab
    await page.click('[data-testid="tab-console"]');
    await expect(page.locator('[data-testid="tab-console"]')).toHaveAttribute('data-state', 'active');
    await expect(page.getByText('Console Output')).toBeVisible();
    
    // Go back to Mr. Blue
    await page.click('[data-testid="tab-mr-blue"]');
    await expect(page.locator('[data-testid="tab-mr-blue"]')).toHaveAttribute('data-state', 'active');
    await expect(page.getByText('Mr. Blue - Visual Editor')).toBeVisible();
  });

  test('should display preview iframe with hideControls parameter', async ({ page }) => {
    const iframe = page.locator('[data-testid="preview-iframe"]');
    await expect(iframe).toBeVisible();
    
    const src = await iframe.getAttribute('src');
    expect(src).toContain('hideControls=true');
  });

  test('should change preview page when selector changes', async ({ page }) => {
    const pageSelector = page.locator('[data-testid="select-preview-page"]');
    
    // Change to Feed page
    await pageSelector.selectOption('/feed');
    
    // Wait for iframe to reload
    await page.waitForTimeout(1000);
    
    const iframe = page.locator('[data-testid="preview-iframe"]');
    const src = await iframe.getAttribute('src');
    expect(src).toContain('/feed');
  });

  test('Git tab should show edit count', async ({ page }) => {
    await page.click('[data-testid="tab-git"]');
    
    // Initially should show 0 changes
    await expect(page.getByText('0 changes tracked')).toBeVisible();
    await expect(page.getByText('No changes yet')).toBeVisible();
  });

  test('Mr. Blue tab should show context display', async ({ page }) => {
    await page.click('[data-testid="tab-mr-blue"]');
    
    // Check context bar
    await expect(page.getByText('Context:')).toBeVisible();
    await expect(page.getByText('0 edits')).toBeVisible();
  });
});
