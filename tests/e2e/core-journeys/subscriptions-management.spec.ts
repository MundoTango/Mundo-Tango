/**
 * SUBSCRIPTIONS MANAGEMENT TEST
 * Tests subscription tier selection, upgrades, and management
 */

import { test, expect } from '@playwright/test';

test.describe('Subscriptions - Management', () => {
  test('should view subscription plans', async ({ page }) => {
    await page.goto('/subscriptions');
    await expect(page.getByTestId('plans-container')).toBeVisible();
    await expect(page.locator('[data-testid^="plan-"]')).toHaveCount({ min: 3 });
  });

  test('should upgrade to premium plan', async ({ page }) => {
    await page.goto('/subscriptions');
    await page.getByTestId('button-subscribe-premium').click();
    await expect(page).toHaveURL(/\/checkout/);
  });

  test('should view current subscription', async ({ page }) => {
    await page.goto('/manage-subscription');
    await expect(page.getByTestId('current-plan')).toBeVisible();
    await expect(page.getByTestId('next-billing-date')).toBeVisible();
  });

  test('should cancel subscription', async ({ page }) => {
    await page.goto('/manage-subscription');
    await page.getByTestId('button-cancel-subscription').click();
    await page.getByTestId('select-cancellation-reason').click();
    await page.getByTestId('option-too-expensive').click();
    await page.getByTestId('button-confirm-cancel').click();
    await expect(page.getByText(/cancelled/i)).toBeVisible();
  });

  test('should reactivate subscription', async ({ page }) => {
    await page.goto('/manage-subscription');
    await page.getByTestId('button-reactivate').click();
    await expect(page.getByText(/reactivated/i)).toBeVisible();
  });
});
