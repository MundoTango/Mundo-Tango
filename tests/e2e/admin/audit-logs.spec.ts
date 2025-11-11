/**
 * ADMIN AUDIT LOGS TEST
 * Tests activity tracking and security logs
 */

import { test, expect } from '@playwright/test';

test.describe('Admin - Audit Logs', () => {
  test('should view audit logs', async ({ page }) => {
    await page.goto('/admin/audit-logs');
    await expect(page.getByTestId('audit-logs-table')).toBeVisible();
  });

  test('should filter logs by action type', async ({ page }) => {
    await page.goto('/admin/audit-logs');
    await page.getByTestId('filter-user-created').click();
    await page.waitForLoadState('networkidle');
  });

  test('should search logs by user', async ({ page }) => {
    await page.goto('/admin/audit-logs');
    await page.getByTestId('input-search-user').fill('admin@example.com');
    await page.waitForLoadState('networkidle');
  });

  test('should view log details', async ({ page }) => {
    await page.goto('/admin/audit-logs');
    await page.locator('[data-testid^="log-entry-"]').first().click();
    await expect(page.getByTestId('log-details-modal')).toBeVisible();
  });

  test('should export audit logs', async ({ page }) => {
    await page.goto('/admin/audit-logs');
    const downloadPromise = page.waitForEvent('download');
    await page.getByTestId('button-export-logs').click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('.csv');
  });
});
