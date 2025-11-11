/**
 * MARKETPLACE COMPLETE TEST
 * Tests marketplace browsing, filtering, and item viewing
 */

import { test, expect } from '@playwright/test';

test.describe('Marketplace - Complete', () => {
  test('should view marketplace', async ({ page }) => {
    await page.goto('/marketplace');
    await expect(page.getByTestId('marketplace-container')).toBeVisible();
  });

  test('should browse items', async ({ page }) => {
    await page.goto('/marketplace');
    await expect(page.locator('[data-testid^="item-"]')).toHaveCount({ min: 1 });
  });

  test('should filter by category', async ({ page }) => {
    await page.goto('/marketplace');
    await page.getByTestId('filter-shoes').click();
    await page.waitForLoadState('networkidle');
  });

  test('should search items', async ({ page }) => {
    await page.goto('/marketplace');
    await page.getByTestId('input-search-items').fill('tango');
    await page.waitForLoadState('networkidle');
  });

  test('should view item details', async ({ page }) => {
    await page.goto('/marketplace/1');
    await expect(page.getByTestId('item-title')).toBeVisible();
    await expect(page.getByTestId('item-price')).toBeVisible();
    await expect(page.getByTestId('item-description')).toBeVisible();
  });

  test('should add item to cart', async ({ page }) => {
    await page.goto('/marketplace/1');
    await page.getByTestId('button-add-to-cart').click();
    await expect(page.getByText(/added.*cart/i)).toBeVisible();
  });
});
