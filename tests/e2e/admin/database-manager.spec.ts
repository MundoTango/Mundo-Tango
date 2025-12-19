/**
 * ADMIN DATABASE MANAGER TEST  
 * Tests database operations and backups
 */

import { test, expect } from '@playwright/test';

test.describe('Admin - Database Manager', () => {
  test('should view database overview', async ({ page }) => {
    await page.goto('/admin/database');
    await expect(page.getByTestId('database-overview')).toBeVisible();
  });

  test('should view table statistics', async ({ page }) => {
    await page.goto('/admin/database');
    await expect(page.getByTestId('table-stats')).toBeVisible();
  });

  test('should create backup', async ({ page }) => {
    await page.goto('/admin/database/backups');
    await page.getByTestId('button-create-backup').click();
    await expect(page.getByText(/backup.*started|creating/i)).toBeVisible();
  });

  test('should view backup history', async ({ page }) => {
    await page.goto('/admin/database/backups');
    await expect(page.getByTestId('backups-list')).toBeVisible();
  });

  test('should download backup', async ({ page }) => {
    await page.goto('/admin/database/backups');
    const downloadPromise = page.waitForEvent('download');
    await page.getByTestId('button-download-backup').first().click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('.sql');
  });
});
