/**
 * DISCOVER COMPLETE JOURNEY TEST
 * Tests content discovery, trending topics, recommended users
 */

import { test, expect } from '@playwright/test';

test.describe('Discover - Complete Journey', () => {
  test('should view discover page', async ({ page }) => {
    await page.goto('/discover');
    await expect(page.getByTestId('discover-container')).toBeVisible();
  });

  test('should browse trending topics', async ({ page }) => {
    await page.goto('/discover');
    await expect(page.getByTestId('trending-topics')).toBeVisible();
    await page.getByTestId('topic-tango').click();
    await expect(page.getByTestId('topic-posts')).toBeVisible();
  });

  test('should view recommended users', async ({ page }) => {
    await page.goto('/discover');
    await expect(page.getByTestId('recommended-users')).toBeVisible();
    await expect(page.locator('[data-testid^="user-card-"]')).toHaveCount({ min: 1 });
  });

  test('should follow user from discover', async ({ page }) => {
    await page.goto('/discover');
    await page.getByTestId('button-follow').first().click();
    await expect(page.getByTestId('button-follow').first()).toHaveText(/following/i);
  });

  test('should browse popular posts', async ({ page }) => {
    await page.goto('/discover');
    await page.getByTestId('tab-popular').click();
    await expect(page.locator('[data-testid^="post-"]')).toHaveCount({ min: 1 });
  });
});
