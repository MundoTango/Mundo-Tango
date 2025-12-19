/**
 * TANGO COMMUNITY MAP TEST
 * Tests global map with locations and statistics
 */

import { test, expect } from '@playwright/test';

test.describe('Tango - Community Map', () => {
  test('should view community map', async ({ page }) => {
    await page.goto('/map');
    await expect(page.getByTestId('community-map')).toBeVisible();
  });

  test('should view global statistics', async ({ page }) => {
    await page.goto('/map');
    await expect(page.getByTestId('global-stats')).toBeVisible();
    await expect(page.getByTestId('stat-total-dancers')).toBeVisible();
    await expect(page.getByTestId('stat-active-events')).toBeVisible();
  });

  test('should click on location marker', async ({ page }) => {
    await page.goto('/map');
    await page.locator('[data-testid^="marker-"]').first().click();
    await expect(page.getByTestId('location-popup')).toBeVisible();
  });

  test('should filter by event type', async ({ page }) => {
    await page.goto('/map');
    await page.getByTestId('filter-milongas').click();
    await page.waitForLoadState('networkidle');
  });

  test('should search location', async ({ page }) => {
    await page.goto('/map');
    await page.getByTestId('input-search-location').fill('Buenos Aires');
    await page.waitForLoadState('networkidle');
  });
});
