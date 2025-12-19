/**
 * Visual Editor Direct Tests
 * Tests what's accessible without complex login flow
 */

import { test, expect } from '@playwright/test';

test.describe('Visual Editor - Direct Access Tests', () => {
  
  test('Can access login page', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('[data-testid="input-email"]')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('[data-testid="input-password"]')).toBeVisible();
    await expect(page.locator('[data-testid="button-login"]')).toBeVisible();
  });

  test('Homepage loads', async ({ page }) => {
    await page.goto('/');
    // Should see some content
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('After Login - Visual Editor Features', () => {
  
  test.beforeEach(async ({ page }) => {
    // Login using environment secrets
    await page.goto('/login');
    await page.waitForSelector('[data-testid="input-email"]', { timeout: 15000 });
    await page.fill('[data-testid="input-email"]', process.env.TEST_ADMIN_EMAIL || 'admin@mundotango.life');
    await page.fill('[data-testid="input-password"]', process.env.TEST_ADMIN_PASSWORD || 'admin123');
    
    // Click login and wait
    await page.click('[data-testid="button-login"]');
    await page.waitForTimeout(5000); // Give time for redirect
  });

  test('Visual Editor page is accessible', async ({ page }) => {
    await page.goto('/admin/visual-editor', { waitUntil: 'domcontentloaded', timeout: 60000 });
    
    // Check for key elements
    await expect(page.locator('text=Visual Editor')).toBeVisible({ timeout: 15000 });
  });

  test('Visual Editor has iframe preview', async ({ page }) => {
    await page.goto('/admin/visual-editor', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(3000);
    
    const iframe = page.locator('[data-testid="preview-iframe"]');
    await expect(iframe).toBeVisible({ timeout: 15000 });
  });

  test('Mr. Blue chat interface exists', async ({ page }) => {
    await page.goto('/admin/visual-editor', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(3000);
    
    await expect(page.locator('[data-testid="input-mr-blue-whisper-chat"]')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('[data-testid="button-send-whisper-chat"]')).toBeVisible();
    await expect(page.locator('[data-testid="button-whisper-voice"]')).toBeVisible();
  });

  test('Can type in Mr. Blue chat', async ({ page }) => {
    await page.goto('/admin/visual-editor', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(3000);
    
    const input = page.locator('[data-testid="input-mr-blue-whisper-chat"]');
    await input.fill('Hello test');
    
    const value = await input.inputValue();
    expect(value).toBe('Hello test');
  });

  test('Send button is disabled when input empty', async ({ page }) => {
    await page.goto('/admin/visual-editor', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(3000);
    
    const sendBtn = page.locator('[data-testid="button-send-whisper-chat"]');
    await expect(sendBtn).toBeDisabled();
  });

  test('Send button enabled when input has text', async ({ page }) => {
    await page.goto('/admin/visual-editor', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(3000);
    
    const input = page.locator('[data-testid="input-mr-blue-whisper-chat"]');
    const sendBtn = page.locator('[data-testid="button-send-whisper-chat"]');
    
    await input.fill('Test message');
    await expect(sendBtn).toBeEnabled();
  });

  test('All tabs are present', async ({ page }) => {
    await page.goto('/admin/visual-editor', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(3000);
    
    await expect(page.locator('[data-testid="tab-mr-blue"]')).toBeVisible();
    await expect(page.locator('[data-testid="tab-git"]')).toBeVisible();
    await expect(page.locator('[data-testid="tab-secrets"]')).toBeVisible();
    await expect(page.locator('[data-testid="tab-database"]')).toBeVisible();
  });

  test('Voice recording button exists and is enabled', async ({ page }) => {
    await page.goto('/admin/visual-editor', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(3000);
    
    const voiceBtn = page.locator('[data-testid="button-whisper-voice"]');
    await expect(voiceBtn).toBeVisible();
    await expect(voiceBtn).toBeEnabled();
  });

  test('Save button exists', async ({ page }) => {
    await page.goto('/admin/visual-editor', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(3000);
    
    await expect(page.locator('[data-testid="button-save-changes"]')).toBeVisible();
  });

  test('Page selector exists', async ({ page }) => {
    await page.goto('/admin/visual-editor', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(3000);
    
    await expect(page.locator('[data-testid="select-preview-page"]')).toBeVisible();
  });
});
