/**
 * CONTENT AGENT TEST
 * Tests content creation and copywriting agent
 */

import { test, expect } from '@playwright/test';

test.describe('Marketing - Content Agent', () => {
  test('should access content agent', async ({ page }) => {
    await page.goto('/admin/agents/content');
    await expect(page.getByTestId('content-agent-container')).toBeVisible();
  });

  test('should generate blog post', async ({ page }) => {
    await page.goto('/admin/agents/content');
    await page.getByTestId('select-content-type').click();
    await page.getByTestId('option-blog-post').click();
    await page.getByTestId('input-topic').fill('Tango techniques for beginners');
    await page.getByTestId('button-generate').click();
    await expect(page.getByTestId('generated-content')).toBeVisible({ timeout: 15000 });
  });

  test('should generate social media post', async ({ page }) => {
    await page.goto('/admin/agents/content');
    await page.getByTestId('select-content-type').click();
    await page.getByTestId('option-social-media').click();
    await page.getByTestId('button-generate').click();
    await expect(page.getByTestId('generated-content')).toBeVisible({ timeout: 15000 });
  });

  test('should edit generated content', async ({ page }) => {
    await page.goto('/admin/agents/content');
    await page.getByTestId('button-generate').click();
    await page.getByTestId('generated-content').waitFor();
    await page.getByTestId('button-edit').click();
    await expect(page.getByTestId('content-editor')).toBeVisible();
  });
});
