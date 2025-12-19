/**
 * NOTIFICATION SETTINGS TEST
 * Tests notification preferences and channels
 */

import { test, expect } from '@playwright/test';

test.describe('Settings - Notifications', () => {
  test('should access notification settings', async ({ page }) => {
    await page.goto('/settings/notifications');
    await expect(page.getByTestId('notification-settings')).toBeVisible();
  });

  test('should toggle email notifications', async ({ page }) => {
    await page.goto('/settings/notifications');
    await page.getByTestId('toggle-email-notifications').click();
    await page.getByTestId('button-save-notifications').click();
    await expect(page.getByText(/saved/i)).toBeVisible();
  });

  test('should toggle push notifications', async ({ page }) => {
    await page.goto('/settings/notifications');
    await page.getByTestId('toggle-push-notifications').click();
    await page.getByTestId('button-save-notifications').click();
    await expect(page.getByText(/saved/i)).toBeVisible();
  });

  test('should customize notification types', async ({ page }) => {
    await page.goto('/settings/notifications');
    await page.getByTestId('checkbox-event-reminders').click();
    await page.getByTestId('checkbox-friend-requests').click();
    await page.getByTestId('button-save-notifications').click();
    await expect(page.getByText(/saved/i)).toBeVisible();
  });

  test('should set quiet hours', async ({ page }) => {
    await page.goto('/settings/notifications');
    await page.getByTestId('toggle-quiet-hours').click();
    await page.getByTestId('input-quiet-start').fill('22:00');
    await page.getByTestId('input-quiet-end').fill('08:00');
    await page.getByTestId('button-save-notifications').click();
    await expect(page.getByText(/saved/i)).toBeVisible();
  });
});
