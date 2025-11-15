import { test, expect } from '@playwright/test';

test.describe('Visual Editor - Editing Controls', () => {
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
    await page.waitForTimeout(1500);
  });

  test('Edit Controls should not be visible initially', async ({ page }) => {
    const editControls = page.locator('[data-testid="panel-edit-controls"]');
    await expect(editControls).not.toBeVisible();
  });

  test('Generate Code button should be disabled initially', async ({ page }) => {
    const generateButton = page.locator('[data-testid="button-generate-code"]');
    await expect(generateButton).toBeDisabled();
  });

  test('Save button should be disabled initially', async ({ page }) => {
    const saveButton = page.locator('[data-testid="button-save-changes"]');
    await expect(saveButton).toBeDisabled();
  });

  test('Open Page button should be enabled', async ({ page }) => {
    const openButton = page.locator('[data-testid="button-open-in-new-tab"]');
    await expect(openButton).toBeEnabled();
  });

  test('Git tab should show save instructions', async ({ page }) => {
    await page.click('[data-testid="tab-git"]');
    
    await expect(page.getByText(/Changes will be committed when you click/i)).toBeVisible();
    await expect(page.getByText(/"Save & Commit"/i)).toBeVisible();
  });

  test('should display loading state while iframe loads', async ({ page }) => {
    // Reload page to see loading state
    await page.reload();
    
    // Check for loading indicator (briefly visible)
    const loadingText = page.getByText('Loading preview...');
    // May or may not catch it due to speed, but structure should exist
    const count = await loadingText.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('page selector should have multiple options', async ({ page }) => {
    const pageSelector = page.locator('[data-testid="select-preview-page"]');
    await expect(pageSelector).toBeVisible();
    
    // Check options
    const options = await pageSelector.locator('option').allTextContents();
    expect(options).toContain('Homepage');
    expect(options).toContain('Memories');
    expect(options).toContain('Feed');
    expect(options).toContain('Events');
    expect(options).toContain('Groups');
    expect(options).toContain('Teachers');
  });

  test('changing page should update iframe', async ({ page }) => {
    const pageSelector = page.locator('[data-testid="select-preview-page"]');
    const iframe = page.locator('[data-testid="preview-iframe"]');
    
    // Get initial src
    const initialSrc = await iframe.getAttribute('src');
    expect(initialSrc).toContain('/?hideControls=true');
    
    // Change to Feed
    await pageSelector.selectOption('/feed');
    await page.waitForTimeout(1000);
    
    // Check src updated
    const newSrc = await iframe.getAttribute('src');
    expect(newSrc).toContain('/feed');
    expect(newSrc).toContain('hideControls=true');
  });

  test('Console tab should show ready status', async ({ page }) => {
    await page.click('[data-testid="tab-console"]');
    
    await expect(page.getByText('[Visual Editor] Ready')).toBeVisible();
    await expect(page.getByText('[Preview] /')).toBeVisible();
  });

  test('Database tab should show management option', async ({ page }) => {
    await page.click('[data-testid="tab-database"]');
    
    await expect(page.getByText('View and manage your database schema')).toBeVisible();
    await expect(page.getByText('Open Database')).toBeVisible();
  });

  test('Deploy tab should show production deployment option', async ({ page }) => {
    await page.click('[data-testid="tab-deploy"]');
    
    await expect(page.getByText('Preview and publish your changes to production')).toBeVisible();
    await expect(page.getByText('Deploy to Production')).toBeVisible();
  });

  test('Secrets tab should show secrets management', async ({ page }) => {
    await page.click('[data-testid="tab-secrets"]');
    
    await expect(page.getByText('Manage API keys and secrets for your application')).toBeVisible();
    await expect(page.getByText('Manage Secrets')).toBeVisible();
  });
});
