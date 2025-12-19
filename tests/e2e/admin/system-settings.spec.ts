/**
 * ADMIN SYSTEM SETTINGS TEST
 * Tests platform configuration and settings
 */

import { test, expect } from '@playwright/test';

test.describe('Admin - System Settings', () => {
  test('should access system settings', async ({ page }) => {
    await page.goto('/admin/settings');
    await expect(page.getByTestId('settings-container')).toBeVisible();
  });

  test('should update platform name', async ({ page }) => {
    await page.goto('/admin/settings');
    await page.getByTestId('input-platform-name').fill('Mundo Tango');
    await page.getByTestId('button-save-settings').click();
    await expect(page.getByText(/saved/i)).toBeVisible();
  });

  test('should enable/disable features', async ({ page }) => {
    await page.goto('/admin/settings/features');
    await page.getByTestId('toggle-live-streaming').click();
    await expect(page.getByText(/updated/i)).toBeVisible();
  });

  test('should configure email settings', async ({ page }) => {
    await page.goto('/admin/settings/email');
    await expect(page.getByTestId('email-settings-form')).toBeVisible();
  });
});
