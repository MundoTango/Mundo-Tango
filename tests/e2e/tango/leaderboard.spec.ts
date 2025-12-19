/**
 * TANGO LEADERBOARD TEST
 * Tests points, rankings, and community contributions
 */

import { test, expect } from '@playwright/test';

test.describe('Tango - Leaderboard', () => {
  test('should view leaderboard', async ({ page }) => {
    await page.goto('/leaderboard');
    await expect(page.getByTestId('leaderboard-container')).toBeVisible();
  });

  test('should view top contributors', async ({ page }) => {
    await page.goto('/leaderboard');
    await expect(page.locator('[data-testid^="rank-"]')).toHaveCount({ min: 10 });
  });

  test('should filter by category', async ({ page }) => {
    await page.goto('/leaderboard');
    await page.getByTestId('filter-events-attended').click();
    await page.waitForLoadState('networkidle');
  });

  test('should view own stats', async ({ page }) => {
    await page.goto('/leaderboard');
    await page.getByTestId('button-my-stats').click();
    await expect(page.getByTestId('user-stats')).toBeVisible();
  });

  test('should view user profile from leaderboard', async ({ page }) => {
    await page.goto('/leaderboard');
    await page.locator('[data-testid^="rank-"]').first().click();
    await expect(page.getByTestId('profile-header')).toBeVisible();
  });
});
