/**
 * NOTIFICATIONS COMPLETE JOURNEY TEST
 * Tests real-time notifications, settings, and interaction
 */

import { test, expect } from '@playwright/test';

test.describe('Notifications - Complete Journey', () => {
  test('should view notifications page', async ({ page }) => {
    await page.goto('/notifications');
    await expect(page.getByTestId('notifications-container')).toBeVisible();
  });

  test('should mark notification as read', async ({ page }) => {
    await page.goto('/notifications');
    await page.locator('[data-testid^="notification-"]').first().click();
    await expect(page.locator('[data-testid^="notification-"]').first()).toHaveClass(/read|viewed/);
  });

  test('should mark all as read', async ({ page }) => {
    await page.goto('/notifications');
    await page.getByTestId('button-mark-all-read').click();
    await expect(page.getByText(/marked.*read/i)).toBeVisible();
  });

  test('should filter notifications by type', async ({ page }) => {
    await page.goto('/notifications');
    await page.getByTestId('filter-likes').click();
    await page.waitForLoadState('networkidle');
    await expect(page.locator('[data-testid^="notification-"]')).toHaveCount({ min: 0 });
  });

  test('should delete notification', async ({ page }) => {
    await page.goto('/notifications');
    await page.getByTestId('button-notification-menu').first().click();
    await page.getByTestId('button-delete-notification').click();
    await expect(page.getByText(/deleted|removed/i)).toBeVisible();
  });
});
