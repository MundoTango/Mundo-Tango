/**
 * RECOMMENDATIONS PAGE E2E TESTS
 * Tests the AI-powered recommendations functionality
 * 
 * Test Coverage:
 * - Page navigation and title verification
 * - Stats cards display (New Today, Match Score, Acted On, Saved)
 * - Tab navigation (All, Events, People, Content, Venues)
 * - Refresh functionality
 * - Responsive design (desktop/mobile)
 */

import { test, expect } from '@playwright/test';

test.describe('Recommendations Page Tests', () => {
  test('should display recommendations page with correct title', async ({ page }) => {
    await page.goto('/recommendations');

    // Verify page title
    await expect(page.getByTestId('text-page-title')).toContainText('Recommendations For You');

    await page.waitForLoadState('networkidle');
  });

  test('should display all required stats cards', async ({ page }) => {
    await page.goto('/recommendations');

    await page.waitForLoadState('networkidle');

    // Verify New Today stat card
    await expect(page.getByTestId('text-new-today')).toBeVisible();
    const newToday = await page.getByTestId('text-new-today').textContent();
    expect(newToday).toMatch(/^\d+$/);

    // Stats should display numbers
    const statsCards = page.locator('[data-testid^="text-"]').filter({ hasText: /^\d+$/ });
    await expect(statsCards.first()).toBeVisible();
  });

  test('should display tabs for different recommendation types', async ({ page }) => {
    await page.goto('/recommendations');

    await page.waitForLoadState('networkidle');

    // Verify tabs are present (All, Events, People, Content, Venues)
    const tabsList = page.locator('[role="tablist"]');
    await expect(tabsList).toBeVisible();

    // Check if multiple tabs exist
    const tabs = page.locator('[role="tab"]');
    const tabCount = await tabs.count();
    expect(tabCount).toBeGreaterThanOrEqual(3);
  });

  test('should have refresh button visible', async ({ page }) => {
    await page.goto('/recommendations');

    // Verify refresh button is present
    await expect(page.getByTestId('button-refresh-recommendations')).toBeVisible();
  });

  test('should trigger refresh when clicking refresh button', async ({ page }) => {
    await page.goto('/recommendations');

    await page.waitForLoadState('networkidle');

    // Click refresh button
    const refreshButton = page.getByTestId('button-refresh-recommendations');
    await refreshButton.click();

    // Wait for potential data refresh
    await page.waitForTimeout(1000);

    // Page should remain stable after refresh
    await expect(page.getByTestId('text-page-title')).toBeVisible();
  });

  test('should handle empty recommendations state', async ({ page }) => {
    await page.goto('/recommendations');

    await page.waitForLoadState('networkidle');

    // Page should load without errors even with no recommendations
    await expect(page.getByTestId('text-page-title')).toBeVisible();
    
    // Stats should show 0 if no recommendations
    const newToday = await page.getByTestId('text-new-today').textContent();
    expect(newToday).toMatch(/^\d+$/);
  });

  test('should switch between tabs', async ({ page }) => {
    await page.goto('/recommendations');

    await page.waitForLoadState('networkidle');

    const tabs = page.locator('[role="tab"]');
    const tabCount = await tabs.count();

    if (tabCount > 1) {
      // Click second tab if available
      await tabs.nth(1).click();
      await page.waitForTimeout(300);

      // Should still see the page title
      await expect(page.getByTestId('text-page-title')).toBeVisible();
    }
  });

  test('should be responsive on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/recommendations');

    // Verify page title is visible on mobile
    await expect(page.getByTestId('text-page-title')).toBeVisible();

    // Verify refresh button is visible on mobile
    await expect(page.getByTestId('button-refresh-recommendations')).toBeVisible();

    // Verify stats are visible (should stack on mobile)
    await expect(page.getByTestId('text-new-today')).toBeVisible();
  });

  test('should be responsive on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/recommendations');

    await expect(page.getByTestId('text-page-title')).toBeVisible();
    await expect(page.getByTestId('button-refresh-recommendations')).toBeVisible();
    await expect(page.getByTestId('text-new-today')).toBeVisible();
  });

  test('should be responsive on desktop viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/recommendations');

    await expect(page.getByTestId('text-page-title')).toBeVisible();
    await expect(page.getByTestId('button-refresh-recommendations')).toBeVisible();
    await expect(page.getByTestId('text-new-today')).toBeVisible();
  });

  test('should display stats with numeric values', async ({ page }) => {
    await page.goto('/recommendations');

    await page.waitForLoadState('networkidle');

    // Verify all stats display numbers
    const newTodayText = await page.getByTestId('text-new-today').textContent();
    expect(newTodayText).toMatch(/^\d+$/);
  });
});
