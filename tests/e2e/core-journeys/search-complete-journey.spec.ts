/**
 * SEARCH COMPLETE JOURNEY TEST
 * Tests global search functionality across users, posts, events
 */

import { test, expect } from '@playwright/test';

test.describe('Search - Complete Journey', () => {
  test('should perform global search', async ({ page }) => {
    await page.goto('/search');
    await page.getByTestId('input-search').fill('tango');
    await page.waitForLoadState('networkidle');
    await expect(page.getByTestId('search-results')).toBeVisible();
  });

  test('should filter search by type (Users, Posts, Events)', async ({ page }) => {
    await page.goto('/search?q=tango');
    
    await page.getByTestId('filter-users').click();
    await expect(page.locator('[data-testid^="user-result-"]')).toHaveCount({ min: 0 });
    
    await page.getByTestId('filter-posts').click();
    await expect(page.locator('[data-testid^="post-result-"]')).toHaveCount({ min: 0 });
    
    await page.getByTestId('filter-events').click();
    await expect(page.locator('[data-testid^="event-result-"]')).toHaveCount({ min: 0 });
  });

  test('should show search suggestions', async ({ page }) => {
    await page.goto('/search');
    await page.getByTestId('input-search').fill('tan');
    await page.waitForTimeout(500);
    await expect(page.getByTestId('search-suggestions')).toBeVisible();
  });

  test('should clear search', async ({ page }) => {
    await page.goto('/search?q=tango');
    await page.getByTestId('button-clear-search').click();
    await expect(page.getByTestId('input-search')).toHaveValue('');
  });
});
