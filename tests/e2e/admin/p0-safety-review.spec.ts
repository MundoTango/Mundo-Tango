/**
 * P0 WORKFLOW #2: SAFETY REVIEW TEST
 * Tests safety reviews for housing listings and user verification
 */

import { test, expect } from '@playwright/test';

test.describe('P0 - Safety Review Workflow', () => {
  test('should view safety review dashboard', async ({ page }) => {
    await page.goto('/admin/p0/safety-review');
    await expect(page.getByTestId('safety-dashboard')).toBeVisible();
  });

  test('should view pending housing reviews', async ({ page }) => {
    await page.goto('/admin/p0/safety-review/housing');
    await expect(page.getByTestId('housing-reviews-queue')).toBeVisible();
  });

  test('should approve housing listing', async ({ page }) => {
    await page.goto('/admin/p0/safety-review/housing');
    await page.locator('[data-testid^="listing-"]').first().click();
    await page.getByTestId('button-approve-listing').click();
    await expect(page.getByText(/approved/i)).toBeVisible();
  });

  test('should flag listing for review', async ({ page }) => {
    await page.goto('/admin/p0/safety-review/housing');
    await page.locator('[data-testid^="listing-"]').first().click();
    await page.getByTestId('button-flag-listing').click();
    await page.getByTestId('select-flag-reason').click();
    await page.getByTestId('option-safety-concern').click();
    await page.getByTestId('button-confirm-flag').click();
    await expect(page.getByText(/flagged/i)).toBeVisible();
  });

  test('should verify user identity', async ({ page }) => {
    await page.goto('/admin/p0/safety-review/users');
    await page.locator('[data-testid^="user-verification-"]').first().click();
    await page.getByTestId('button-verify-user').click();
    await expect(page.getByText(/verified/i)).toBeVisible();
  });

  test('should reject user verification', async ({ page }) => {
    await page.goto('/admin/p0/safety-review/users');
    await page.locator('[data-testid^="user-verification-"]').first().click();
    await page.getByTestId('button-reject-verification').click();
    await page.getByTestId('textarea-rejection-reason').fill('Documents not clear');
    await page.getByTestId('button-confirm-reject').click();
    await expect(page.getByText(/rejected/i)).toBeVisible();
  });
});
