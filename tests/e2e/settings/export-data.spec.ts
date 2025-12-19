/**
 * EXPORT DATA TEST
 * Tests data export and portability
 */

import { test, expect } from '@playwright/test';

test.describe('Settings - Export Data', () => {
  test('should access export data page', async ({ page }) => {
    await page.goto('/settings/export-data');
    await expect(page.getByTestId('export-data-container')).toBeVisible();
  });

  test('should request full data export', async ({ page }) => {
    await page.goto('/settings/export-data');
    await page.getByTestId('button-request-export').click();
    await page.getByTestId('button-confirm-export').click();
    await expect(page.getByText(/export.*started/i)).toBeVisible();
  });

  test('should export specific data type', async ({ page }) => {
    await page.goto('/settings/export-data');
    await page.getByTestId('checkbox-posts').click();
    await page.getByTestId('checkbox-events').click();
    await page.getByTestId('button-export-selected').click();
    await expect(page.getByText(/processing/i)).toBeVisible();
  });

  test('should view export history', async ({ page }) => {
    await page.goto('/settings/export-data/history');
    await expect(page.getByTestId('export-history')).toBeVisible();
  });

  test('should download completed export', async ({ page }) => {
    await page.goto('/settings/export-data/history');
    const downloadPromise = page.waitForEvent('download');
    await page.getByTestId('button-download-export').first().click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('.zip');
  });
});
