/**
 * TANGO VENUES DIRECTORY TEST
 * Tests venue listings, reviews, and recommendations
 */

import { test, expect } from '@playwright/test';

test.describe('Tango - Venues Directory', () => {
  test('should view venues directory', async ({ page }) => {
    await page.goto('/venues');
    await expect(page.getByTestId('venues-container')).toBeVisible();
  });

  test('should search venues', async ({ page }) => {
    await page.goto('/venues');
    await page.getByTestId('input-search-venues').fill('La Catedral');
    await page.waitForLoadState('networkidle');
  });

  test('should filter by type', async ({ page }) => {
    await page.goto('/venues');
    await page.getByTestId('filter-milonga').click();
    await page.waitForLoadState('networkidle');
  });

  test('should view venue details', async ({ page }) => {
    await page.goto('/venues/1');
    await expect(page.getByTestId('venue-name')).toBeVisible();
    await expect(page.getByTestId('venue-address')).toBeVisible();
    await expect(page.getByTestId('venue-rating')).toBeVisible();
  });

  test('should view venue on map', async ({ page }) => {
    await page.goto('/venues/1');
    await expect(page.getByTestId('venue-map')).toBeVisible();
  });

  test('should write venue review', async ({ page }) => {
    await page.goto('/venues/1');
    await page.getByTestId('button-write-review').click();
    await page.getByTestId('select-rating').click();
    await page.getByTestId('option-5-stars').click();
    await page.getByTestId('textarea-review').fill('Amazing venue with great atmosphere!');
    await page.getByTestId('button-submit-review').click();
    await expect(page.getByText(/submitted/i)).toBeVisible();
  });

  test('should save venue to favorites', async ({ page }) => {
    await page.goto('/venues/1');
    await page.getByTestId('button-save-venue').click();
    await expect(page.getByText(/saved/i)).toBeVisible();
  });
});
