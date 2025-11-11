/**
 * ADMIN NOTIFICATIONS MANAGER TEST
 * Tests system-wide notification broadcasting
 */

import { test, expect } from '@playwright/test';

test.describe('Admin - Notifications Manager', () => {
  test('should view notifications manager', async ({ page }) => {
    await page.goto('/admin/notifications');
    await expect(page.getByTestId('notifications-manager')).toBeVisible();
  });

  test('should send broadcast notification', async ({ page }) => {
    await page.goto('/admin/notifications');
    await page.getByTestId('button-create-broadcast').click();
    await page.getByTestId('input-notification-title').fill('System Maintenance');
    await page.getByTestId('textarea-notification-message').fill('Scheduled maintenance tonight at 2 AM');
    await page.getByTestId('button-send-broadcast').click();
    await expect(page.getByText(/sent/i)).toBeVisible();
  });

  test('should schedule notification', async ({ page }) => {
    await page.goto('/admin/notifications');
    await page.getByTestId('button-schedule-notification').click();
    await page.getByTestId('input-notification-title').fill('Event Reminder');
    await page.getByTestId('input-schedule-time').fill('2025-12-15T18:00');
    await page.getByTestId('button-save-schedule').click();
    await expect(page.getByText(/scheduled/i)).toBeVisible();
  });

  test('should view notification history', async ({ page }) => {
    await page.goto('/admin/notifications/history');
    await expect(page.getByTestId('notification-history')).toBeVisible();
  });
});
