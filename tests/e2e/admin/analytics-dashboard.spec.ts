/**
 * ADMIN ANALYTICS DASHBOARD TEST
 * Tests analytics, charts, and reporting
 */

import { test, expect } from '@playwright/test';

test.describe('Admin - Analytics Dashboard', () => {
  test('should view analytics dashboard', async ({ page }) => {
    await page.goto('/admin/analytics');
    await expect(page.getByTestId('analytics-dashboard')).toBeVisible();
  });

  test('should view user growth chart', async ({ page }) => {
    await page.goto('/admin/analytics');
    await expect(page.getByTestId('chart-user-growth')).toBeVisible();
  });

  test('should filter by date range', async ({ page }) => {
    await page.goto('/admin/analytics');
    await page.getByTestId('select-date-range').click();
    await page.getByTestId('option-last-30-days').click();
    await page.waitForLoadState('networkidle');
  });

  test('should export analytics report', async ({ page }) => {
    await page.goto('/admin/analytics');
    const downloadPromise = page.waitForEvent('download');
    await page.getByTestId('button-export-report').click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('.csv');
  });

  test('should view engagement metrics', async ({ page }) => {
    await page.goto('/admin/analytics');
    await expect(page.getByTestId('metric-daily-active-users')).toBeVisible();
    await expect(page.getByTestId('metric-avg-session-duration')).toBeVisible();
  });
});
