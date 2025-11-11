/**
 * TANGO VENUE RECOMMENDATIONS TEST
 * Tests user-curated venue discovery system
 */

import { test, expect } from '@playwright/test';

test.describe('Tango - Venue Recommendations', () => {
  test('should view recommended venues', async ({ page }) => {
    await page.goto('/venues/recommended');
    await expect(page.getByTestId('recommended-venues')).toBeVisible();
  });

  test('should recommend a venue', async ({ page }) => {
    await page.goto('/venues/1');
    await page.getByTestId('button-recommend').click();
    await page.getByTestId('textarea-recommendation').fill('Best sound system in the city!');
    await page.getByTestId('button-submit-recommendation').click();
    await expect(page.getByText(/submitted/i)).toBeVisible();
  });

  test('should browse by dance style', async ({ page }) => {
    await page.goto('/venues/recommended');
    await page.getByTestId('filter-tango').click();
    await page.waitForLoadState('networkidle');
  });

  test('should upvote recommendation', async ({ page }) => {
    await page.goto('/venues/recommended');
    await page.getByTestId('button-upvote').first().click();
    await expect(page.getByTestId('upvote-count')).toBeVisible();
  });
});
