/**
 * TALENT MATCH JOURNEY TEST
 * Tests AI-powered dancer/teacher matching
 */

import { test, expect } from '@playwright/test';

test.describe('Talent Match - Journey', () => {
  test('should view talent match dashboard', async ({ page }) => {
    await page.goto('/talent');
    await expect(page.getByTestId('talent-dashboard')).toBeVisible();
  });

  test('should view match suggestions', async ({ page }) => {
    await page.goto('/talent');
    await expect(page.getByTestId('match-suggestions')).toBeVisible();
    await expect(page.locator('[data-testid^="match-card-"]')).toHaveCount({ min: 1 });
  });

  test('should filter matches by role', async ({ page }) => {
    await page.goto('/talent');
    await page.getByTestId('filter-teachers').click();
    await page.waitForLoadState('networkidle');
  });

  test('should view match profile', async ({ page }) => {
    await page.goto('/talent');
    await page.locator('[data-testid^="match-card-"]').first().click();
    await expect(page.getByTestId('match-profile-modal')).toBeVisible();
  });

  test('should send connection request', async ({ page }) => {
    await page.goto('/talent');
    await page.locator('[data-testid^="match-card-"]').first().click();
    await page.getByTestId('button-connect').click();
    await expect(page.getByText(/request.*sent/i)).toBeVisible();
  });
});
