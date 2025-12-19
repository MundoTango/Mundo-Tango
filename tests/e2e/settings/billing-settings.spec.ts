/**
 * BILLING SETTINGS TEST
 * Tests billing management and payment methods
 */

import { test, expect } from '@playwright/test';

test.describe('Settings - Billing', () => {
  test('should access billing settings', async ({ page }) => {
    await page.goto('/settings/billing');
    await expect(page.getByTestId('billing-settings')).toBeVisible();
  });

  test('should view current plan', async ({ page }) => {
    await page.goto('/settings/billing');
    await expect(page.getByTestId('current-plan')).toBeVisible();
  });

  test('should update payment method', async ({ page }) => {
    await page.goto('/settings/billing/payment-methods');
    await page.getByTestId('button-add-payment-method').click();
    await expect(page.getByTestId('payment-form')).toBeVisible();
  });

  test('should view billing history', async ({ page }) => {
    await page.goto('/settings/billing/history');
    await expect(page.getByTestId('billing-history')).toBeVisible();
  });

  test('should upgrade plan', async ({ page }) => {
    await page.goto('/settings/billing');
    await page.getByTestId('button-upgrade-plan').click();
    await expect(page).toHaveURL(/\/subscriptions/);
  });
});
