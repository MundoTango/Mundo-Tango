/**
 * ANALYTICS AGENT TEST
 * Tests data analytics and insights agent
 */

import { test, expect } from '@playwright/test';

test.describe('Marketing - Analytics Agent', () => {
  test('should access analytics agent', async ({ page }) => {
    await page.goto('/admin/agents/analytics');
    await expect(page.getByTestId('analytics-agent-container')).toBeVisible();
  });

  test('should view user insights', async ({ page }) => {
    await page.goto('/admin/agents/analytics');
    await expect(page.getByTestId('user-insights')).toBeVisible();
  });

  test('should generate report', async ({ page }) => {
    await page.goto('/admin/agents/analytics');
    await page.getByTestId('button-generate-report').click();
    await page.getByTestId('select-report-type').click();
    await page.getByTestId('option-monthly-summary').click();
    await page.getByTestId('button-create-report').click();
    await expect(page.getByTestId('report-viewer')).toBeVisible();
  });

  test('should export data', async ({ page }) => {
    await page.goto('/admin/agents/analytics');
    const downloadPromise = page.waitForEvent('download');
    await page.getByTestId('button-export-data').click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('.csv');
  });
});
