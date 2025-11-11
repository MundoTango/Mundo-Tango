/**
 * TANGO HOUSING TEST
 * Tests housing listings, bookings, and reviews
 */

import { test, expect } from '@playwright/test';

test.describe('Tango - Housing', () => {
  test('should view housing listings', async ({ page }) => {
    await page.goto('/housing');
    await expect(page.getByTestId('housing-container')).toBeVisible();
  });

  test('should search listings', async ({ page }) => {
    await page.goto('/housing');
    await page.getByTestId('input-search-location').fill('Buenos Aires');
    await page.waitForLoadState('networkidle');
  });

  test('should filter by price', async ({ page }) => {
    await page.goto('/housing');
    await page.getByTestId('slider-max-price').fill('100');
    await page.waitForLoadState('networkidle');
  });

  test('should view listing details', async ({ page }) => {
    await page.goto('/housing/1');
    await expect(page.getByTestId('listing-title')).toBeVisible();
    await expect(page.getByTestId('listing-price')).toBeVisible();
    await expect(page.getByTestId('listing-amenities')).toBeVisible();
  });

  test('should book listing', async ({ page }) => {
    await page.goto('/housing/1');
    await page.getByTestId('input-check-in').fill('2025-12-15');
    await page.getByTestId('input-check-out').fill('2025-12-22');
    await page.getByTestId('button-book-now').click();
    await expect(page.getByTestId('booking-confirmation')).toBeVisible();
  });

  test('should save listing to favorites', async ({ page }) => {
    await page.goto('/housing/1');
    await page.getByTestId('button-save-listing').click();
    await expect(page.getByText(/saved/i)).toBeVisible();
  });

  test('should write review', async ({ page }) => {
    await page.goto('/housing/1');
    await page.getByTestId('button-write-review').click();
    await page.getByTestId('select-rating').click();
    await page.getByTestId('option-5-stars').click();
    await page.getByTestId('textarea-review').fill('Great place, very welcoming host!');
    await page.getByTestId('button-submit-review').click();
    await expect(page.getByText(/submitted/i)).toBeVisible();
  });
});
