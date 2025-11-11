/**
 * ADMIN BULK ACTIONS TEST
 * Tests batch operations on multiple items
 */

import { test, expect } from '@playwright/test';

test.describe('Admin - Bulk Actions', () => {
  test('should select multiple users', async ({ page }) => {
    await page.goto('/admin/users');
    await page.getByTestId('checkbox-select-all').click();
    await expect(page.getByTestId('bulk-actions-bar')).toBeVisible();
  });

  test('should bulk suspend users', async ({ page }) => {
    await page.goto('/admin/users');
    await page.getByTestId('checkbox-user').first().click();
    await page.getByTestId('checkbox-user').nth(1).click();
    await page.getByTestId('button-bulk-suspend').click();
    await page.getByTestId('button-confirm-bulk-action').click();
    await expect(page.getByText(/suspended/i)).toBeVisible();
  });

  test('should bulk delete posts', async ({ page }) => {
    await page.goto('/admin/moderation/posts');
    await page.getByTestId('checkbox-post').first().click();
    await page.getByTestId('checkbox-post').nth(1).click();
    await page.getByTestId('button-bulk-delete').click();
    await page.getByTestId('button-confirm-bulk-delete').click();
    await expect(page.getByText(/deleted/i)).toBeVisible();
  });

  test('should bulk export data', async ({ page }) => {
    await page.goto('/admin/users');
    await page.getByTestId('checkbox-select-all').click();
    const downloadPromise = page.waitForEvent('download');
    await page.getByTestId('button-bulk-export').click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('.csv');
  });
});
