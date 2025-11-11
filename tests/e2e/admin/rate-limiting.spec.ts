/**
 * ADMIN RATE LIMITING TEST
 * Tests API rate limiting configuration
 */

import { test, expect } from '@playwright/test';

test.describe('Admin - Rate Limiting', () => {
  test('should view rate limiting settings', async ({ page }) => {
    await page.goto('/admin/rate-limiting');
    await expect(page.getByTestId('rate-limiting-settings')).toBeVisible();
  });

  test('should update global rate limits', async ({ page }) => {
    await page.goto('/admin/rate-limiting');
    await page.getByTestId('input-requests-per-minute').fill('100');
    await page.getByTestId('button-save-limits').click();
    await expect(page.getByText(/saved/i)).toBeVisible();
  });

  test('should view rate limit violations', async ({ page }) => {
    await page.goto('/admin/rate-limiting/violations');
    await expect(page.getByTestId('violations-list')).toBeVisible();
  });

  test('should create custom rate limit rule', async ({ page }) => {
    await page.goto('/admin/rate-limiting');
    await page.getByTestId('button-add-rule').click();
    await page.getByTestId('input-endpoint').fill('/api/posts');
    await page.getByTestId('input-limit').fill('50');
    await page.getByTestId('button-save-rule').click();
    await expect(page.getByText(/created/i)).toBeVisible();
  });
});
