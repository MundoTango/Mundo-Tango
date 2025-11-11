/**
 * ADMIN DASHBOARD OVERVIEW TEST
 * Tests main admin dashboard and platform metrics
 */

import { test, expect } from '@playwright/test';

test.describe('Admin - Dashboard Overview', () => {
  test('should access admin dashboard', async ({ page }) => {
    await page.goto('/admin');
    await expect(page.getByTestId('admin-dashboard')).toBeVisible();
  });

  test('should view platform metrics', async ({ page }) => {
    await page.goto('/admin');
    await expect(page.getByTestId('metric-total-users')).toBeVisible();
    await expect(page.getByTestId('metric-active-events')).toBeVisible();
    await expect(page.getByTestId('metric-revenue')).toBeVisible();
  });

  test('should view recent activity feed', async ({ page }) => {
    await page.goto('/admin');
    await expect(page.getByTestId('recent-activity')).toBeVisible();
  });

  test('should access quick actions', async ({ page }) => {
    await page.goto('/admin');
    await expect(page.getByTestId('quick-actions')).toBeVisible();
  });
});
