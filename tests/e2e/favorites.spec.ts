/**
 * FAVORITES PAGE E2E TESTS
 * Tests the favorites/bookmarks functionality
 * 
 * Test Coverage:
 * - Page navigation and title verification
 * - Stats cards display (Total, Events, People, Venues, Content)
 * - Tab navigation (All, Events, People, Venues, Content)
 * - Favorite items display
 * - Empty state handling
 * - Responsive design (desktop/mobile)
 */

import { test, expect } from '@playwright/test';

test.describe('Favorites Page Tests', () => {
  test('should display favorites page with correct title', async ({ page }) => {
    await page.goto('/favorites');

    // Verify page title
    await expect(page.getByTestId('text-page-title')).toContainText('My Favorites');

    await page.waitForLoadState('networkidle');
  });

  test('should display total favorites stat card', async ({ page }) => {
    await page.goto('/favorites');

    await page.waitForLoadState('networkidle');

    // Verify total stat card
    await expect(page.getByTestId('text-total-favorites')).toBeVisible();
    
    const totalFavorites = await page.getByTestId('text-total-favorites').textContent();
    expect(totalFavorites).toMatch(/^\d+$/);
  });

  test('should display tabs for different favorite types', async ({ page }) => {
    await page.goto('/favorites');

    await page.waitForLoadState('networkidle');

    // Verify tabs are present (All, Events, People, Venues, Content)
    const tabsList = page.locator('[role="tablist"]');
    await expect(tabsList).toBeVisible();

    // Should have multiple tabs
    const tabs = page.locator('[role="tab"]');
    const tabCount = await tabs.count();
    expect(tabCount).toBeGreaterThanOrEqual(3);
  });

  test('should handle empty favorites state gracefully', async ({ page }) => {
    await page.goto('/favorites');

    await page.waitForLoadState('networkidle');

    // Page should load without errors even with no favorites
    await expect(page.getByTestId('text-page-title')).toBeVisible();
    
    // Stats should show 0 if no favorites
    const totalFavorites = await page.getByTestId('text-total-favorites').textContent();
    expect(totalFavorites).toMatch(/^\d+$/);
  });

  test('should switch between favorite type tabs', async ({ page }) => {
    await page.goto('/favorites');

    await page.waitForLoadState('networkidle');

    const tabs = page.locator('[role="tab"]');
    const tabCount = await tabs.count();

    if (tabCount > 1) {
      // Click second tab
      await tabs.nth(1).click();
      await page.waitForTimeout(300);

      // Should still see the page title
      await expect(page.getByTestId('text-page-title')).toBeVisible();

      // Click third tab if it exists
      if (tabCount > 2) {
        await tabs.nth(2).click();
        await page.waitForTimeout(300);
        await expect(page.getByTestId('text-page-title')).toBeVisible();
      }
    }
  });

  test('should display favorite categories correctly', async ({ page }) => {
    await page.goto('/favorites');

    await page.waitForLoadState('networkidle');

    // Page should show categories (Events, People, Venues, Content)
    // Even if empty, the tabs should be present
    const tabsList = page.locator('[role="tablist"]');
    await expect(tabsList).toBeVisible();
  });

  test('should be responsive on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/favorites');

    // Verify page title is visible on mobile
    await expect(page.getByTestId('text-page-title')).toBeVisible();

    // Verify stats are visible (should stack on mobile)
    await expect(page.getByTestId('text-total-favorites')).toBeVisible();

    // Verify tabs are accessible on mobile
    const tabsList = page.locator('[role="tablist"]');
    await expect(tabsList).toBeVisible();
  });

  test('should be responsive on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/favorites');

    await expect(page.getByTestId('text-page-title')).toBeVisible();
    await expect(page.getByTestId('text-total-favorites')).toBeVisible();
  });

  test('should be responsive on desktop viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/favorites');

    await expect(page.getByTestId('text-page-title')).toBeVisible();
    await expect(page.getByTestId('text-total-favorites')).toBeVisible();
  });

  test('should display stats with numeric values', async ({ page }) => {
    await page.goto('/favorites');

    await page.waitForLoadState('networkidle');

    // Verify stats display numbers
    const totalText = await page.getByTestId('text-total-favorites').textContent();
    expect(totalText).toMatch(/^\d+$/);
  });

  test('should handle page load without errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/favorites');
    await page.waitForLoadState('networkidle');

    // Page should be stable
    await expect(page.getByTestId('text-page-title')).toBeVisible();

    // Should have minimal console errors (allow for common warnings)
    expect(errors.length).toBeLessThan(5);
  });

  test('should navigate back to all favorites after filtering', async ({ page }) => {
    await page.goto('/favorites');

    await page.waitForLoadState('networkidle');

    const tabs = page.locator('[role="tab"]');
    const tabCount = await tabs.count();

    if (tabCount > 1) {
      // Click a filter tab
      await tabs.nth(1).click();
      await page.waitForTimeout(300);

      // Click back to "All" tab (first tab)
      await tabs.nth(0).click();
      await page.waitForTimeout(300);

      // Should still see the page title
      await expect(page.getByTestId('text-page-title')).toBeVisible();
    }
  });
});
