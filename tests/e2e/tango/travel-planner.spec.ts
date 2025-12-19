/**
 * TANGO TRAVEL PLANNER TEST
 * Tests travel planning for tango festivals and trips
 */

import { test, expect } from '@playwright/test';

test.describe('Tango - Travel Planner', () => {
  test('should view travel planner', async ({ page }) => {
    await page.goto('/travel');
    await expect(page.getByTestId('travel-planner')).toBeVisible();
  });

  test('should browse destinations', async ({ page }) => {
    await page.goto('/travel/destinations');
    await expect(page.locator('[data-testid^="destination-"]')).toHaveCount({ min: 1 });
  });

  test('should view destination details', async ({ page }) => {
    await page.goto('/travel/destinations/buenos-aires');
    await expect(page.getByTestId('destination-overview')).toBeVisible();
    await expect(page.getByTestId('upcoming-events')).toBeVisible();
  });

  test('should create trip plan', async ({ page }) => {
    await page.goto('/travel');
    await page.getByTestId('button-create-trip').click();
    await page.getByTestId('input-destination').fill('Buenos Aires');
    await page.getByTestId('input-start-date').fill('2025-12-15');
    await page.getByTestId('input-end-date').fill('2025-12-22');
    await page.getByTestId('button-save-trip').click();
    await expect(page.getByText(/created/i)).toBeVisible();
  });

  test('should view travel packages', async ({ page }) => {
    await page.goto('/travel/packages');
    await expect(page.locator('[data-testid^="package-"]')).toHaveCount({ min: 0 });
  });

  test('should save destination', async ({ page }) => {
    await page.goto('/travel/destinations/buenos-aires');
    await page.getByTestId('button-save-destination').click();
    await expect(page.getByText(/saved/i)).toBeVisible();
  });
});
