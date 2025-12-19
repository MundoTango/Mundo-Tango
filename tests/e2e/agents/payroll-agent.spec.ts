/**
 * PAYROLL AGENT TEST
 * Tests payroll processing and compensation management
 */

import { test, expect } from '@playwright/test';

test.describe('HR - Payroll Agent', () => {
  test('should access payroll agent', async ({ page }) => {
    await page.goto('/admin/agents/payroll');
    await expect(page.getByTestId('payroll-agent-container')).toBeVisible();
  });

  test('should view payroll overview', async ({ page }) => {
    await page.goto('/admin/agents/payroll');
    await expect(page.getByTestId('payroll-overview')).toBeVisible();
  });

  test('should process payroll run', async ({ page }) => {
    await page.goto('/admin/agents/payroll');
    await page.getByTestId('button-run-payroll').click();
    await page.getByTestId('select-pay-period').click();
    await page.getByTestId('option-december-2025').click();
    await page.getByTestId('button-confirm-run').click();
    await expect(page.getByText(/processing/i)).toBeVisible();
  });

  test('should view payroll reports', async ({ page }) => {
    await page.goto('/admin/agents/payroll/reports');
    await expect(page.getByTestId('payroll-reports')).toBeVisible();
  });

  test('should export payroll data', async ({ page }) => {
    await page.goto('/admin/agents/payroll');
    const downloadPromise = page.waitForEvent('download');
    await page.getByTestId('button-export-payroll').click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('.csv');
  });
});
