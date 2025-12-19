/**
 * BILLING HISTORY TEST
 * Tests invoices, payment methods, and billing history
 */

import { test, expect } from '@playwright/test';

test.describe('Billing - History', () => {
  test('should view billing page', async ({ page }) => {
    await page.goto('/billing');
    await expect(page.getByTestId('billing-container')).toBeVisible();
  });

  test('should view invoice history', async ({ page }) => {
    await page.goto('/billing');
    await expect(page.getByTestId('invoices-list')).toBeVisible();
    await expect(page.locator('[data-testid^="invoice-"]')).toHaveCount({ min: 0 });
  });

  test('should download invoice PDF', async ({ page }) => {
    await page.goto('/billing');
    const downloadPromise = page.waitForEvent('download');
    await page.getByTestId('button-download-invoice').first().click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('.pdf');
  });

  test('should add payment method', async ({ page }) => {
    await page.goto('/billing');
    await page.getByTestId('button-add-payment-method').click();
    await expect(page.getByTestId('payment-form')).toBeVisible();
  });

  test('should set default payment method', async ({ page }) => {
    await page.goto('/billing');
    await page.getByTestId('button-set-default').first().click();
    await expect(page.getByText(/default.*updated/i)).toBeVisible();
  });

  test('should remove payment method', async ({ page }) => {
    await page.goto('/billing');
    await page.getByTestId('button-remove-payment').first().click();
    await page.getByTestId('button-confirm-remove').click();
    await expect(page.getByText(/removed/i)).toBeVisible();
  });
});
