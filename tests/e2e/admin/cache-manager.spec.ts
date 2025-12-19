/**
 * ADMIN CACHE MANAGER TEST
 * Tests Redis cache management and performance
 */

import { test, expect } from '@playwright/test';

test.describe('Admin - Cache Manager', () => {
  test('should view cache dashboard', async ({ page }) => {
    await page.goto('/admin/cache');
    await expect(page.getByTestId('cache-dashboard')).toBeVisible();
  });

  test('should view cache hit rate', async ({ page }) => {
    await page.goto('/admin/cache');
    await expect(page.getByTestId('metric-hit-rate')).toBeVisible();
  });

  test('should clear specific cache', async ({ page }) => {
    await page.goto('/admin/cache');
    await page.getByTestId('button-clear-user-cache').click();
    await page.getByTestId('button-confirm-clear').click();
    await expect(page.getByText(/cleared/i)).toBeVisible();
  });

  test('should clear all caches', async ({ page }) => {
    await page.goto('/admin/cache');
    await page.getByTestId('button-clear-all-caches').click();
    await page.getByTestId('button-confirm-clear-all').click();
    await expect(page.getByText(/cleared/i)).toBeVisible();
  });

  test('should view cache keys', async ({ page }) => {
    await page.goto('/admin/cache');
    await expect(page.getByTestId('cache-keys-list')).toBeVisible();
  });
});
