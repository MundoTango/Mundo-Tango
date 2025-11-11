/**
 * TANGO TUTORIALS TEST
 * Tests video tutorials and learning resources
 */

import { test, expect } from '@playwright/test';

test.describe('Tango - Tutorials', () => {
  test('should view tutorials page', async ({ page }) => {
    await page.goto('/tutorials');
    await expect(page.getByTestId('tutorials-container')).toBeVisible();
  });

  test('should browse by category', async ({ page }) => {
    await page.goto('/tutorials');
    await page.getByTestId('category-basic-steps').click();
    await expect(page.locator('[data-testid^="tutorial-"]')).toHaveCount({ min: 1 });
  });

  test('should filter by skill level', async ({ page }) => {
    await page.goto('/tutorials');
    await page.getByTestId('filter-beginner').click();
    await page.waitForLoadState('networkidle');
  });

  test('should watch tutorial video', async ({ page }) => {
    await page.goto('/tutorials/1');
    await expect(page.getByTestId('video-player')).toBeVisible();
  });

  test('should mark tutorial as completed', async ({ page }) => {
    await page.goto('/tutorials/1');
    await page.getByTestId('button-mark-complete').click();
    await expect(page.getByText(/completed/i)).toBeVisible();
  });

  test('should save tutorial for later', async ({ page }) => {
    await page.goto('/tutorials/1');
    await page.getByTestId('button-save-tutorial').click();
    await expect(page.getByText(/saved/i)).toBeVisible();
  });

  test('should view learning progress', async ({ page }) => {
    await page.goto('/tutorials/progress');
    await expect(page.getByTestId('progress-overview')).toBeVisible();
  });
});
