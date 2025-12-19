/**
 * ADMIN FINANCIAL MANAGEMENT TEST
 * Tests revenue tracking, payouts, and financial reports
 */

import { test, expect } from '@playwright/test';

test.describe('Admin - Financial Management', () => {
  test('should view financial dashboard', async ({ page }) => {
    await page.goto('/admin/financials');
    await expect(page.getByTestId('financial-dashboard')).toBeVisible();
  });

  test('should view revenue overview', async ({ page }) => {
    await page.goto('/admin/financials');
    await expect(page.getByTestId('revenue-overview')).toBeVisible();
    await expect(page.getByTestId('metric-total-revenue')).toBeVisible();
    await expect(page.getByTestId('metric-monthly-revenue')).toBeVisible();
  });

  test('should view transactions list', async ({ page }) => {
    await page.goto('/admin/financials/transactions');
    await expect(page.getByTestId('transactions-table')).toBeVisible();
  });

  test('should export financial report', async ({ page }) => {
    await page.goto('/admin/financials');
    const downloadPromise = page.waitForEvent('download');
    await page.getByTestId('button-export-financial-report').click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('.pdf');
  });

  test('should process refund', async ({ page }) => {
    await page.goto('/admin/financials/transactions');
    await page.getByTestId('button-refund').first().click();
    await page.getByTestId('textarea-refund-reason').fill('Customer request');
    await page.getByTestId('button-confirm-refund').click();
    await expect(page.getByText(/refunded/i)).toBeVisible();
  });
});
