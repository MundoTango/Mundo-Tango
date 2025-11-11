/**
 * TANGO REVIEWS SYSTEM TEST
 * Tests polymorphic reviews, ratings, and helpful voting
 */

import { test, expect } from '@playwright/test';

test.describe('Tango - Reviews System', () => {
  test('should write teacher review', async ({ page }) => {
    await page.goto('/teachers/1');
    await page.getByTestId('button-write-review').click();
    await page.getByTestId('select-rating').click();
    await page.getByTestId('option-5-stars').click();
    await page.getByTestId('textarea-review').fill('Excellent teacher, very patient!');
    await page.getByTestId('button-submit-review').click();
    await expect(page.getByText(/submitted/i)).toBeVisible();
  });

  test('should write venue review', async ({ page }) => {
    await page.goto('/venues/1');
    await page.getByTestId('button-write-review').click();
    await page.getByTestId('select-rating').click();
    await page.getByTestId('option-4-stars').click();
    await page.getByTestId('textarea-review').fill('Great atmosphere!');
    await page.getByTestId('button-submit-review').click();
    await expect(page.getByText(/submitted/i)).toBeVisible();
  });

  test('should mark review as helpful', async ({ page }) => {
    await page.goto('/teachers/1');
    await page.getByTestId('button-helpful').first().click();
    await expect(page.getByTestId('helpful-count')).toBeVisible();
  });

  test('should view all reviews', async ({ page }) => {
    await page.goto('/teachers/1');
    await page.getByTestId('button-view-all-reviews').click();
    await expect(page.getByTestId('reviews-list')).toBeVisible();
  });

  test('should filter reviews by rating', async ({ page }) => {
    await page.goto('/teachers/1/reviews');
    await page.getByTestId('filter-5-stars').click();
    await page.waitForLoadState('networkidle');
  });

  test('should edit own review', async ({ page }) => {
    await page.goto('/teachers/1/reviews');
    await page.getByTestId('button-edit-review').first().click();
    await page.getByTestId('textarea-review').fill('Updated review text');
    await page.getByTestId('button-save-review').click();
    await expect(page.getByText(/updated/i)).toBeVisible();
  });
});
