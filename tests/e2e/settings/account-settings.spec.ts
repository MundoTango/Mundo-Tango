/**
 * ACCOUNT SETTINGS TEST
 * Tests user account configuration and preferences
 */

import { test, expect } from '@playwright/test';

test.describe('Settings - Account', () => {
  test('should access account settings', async ({ page }) => {
    await page.goto('/settings/account');
    await expect(page.getByTestId('account-settings')).toBeVisible();
  });

  test('should update email', async ({ page }) => {
    await page.goto('/settings/account');
    await page.getByTestId('input-email').fill('newemail@example.com');
    await page.getByTestId('button-save-email').click();
    await expect(page.getByText(/verification.*sent/i)).toBeVisible();
  });

  test('should change password', async ({ page }) => {
    await page.goto('/settings/account');
    await page.getByTestId('input-current-password').fill('oldpassword');
    await page.getByTestId('input-new-password').fill('newpassword123');
    await page.getByTestId('input-confirm-password').fill('newpassword123');
    await page.getByTestId('button-change-password').click();
    await expect(page.getByText(/password.*updated/i)).toBeVisible();
  });

  test('should enable two-factor authentication', async ({ page }) => {
    await page.goto('/settings/account/security');
    await page.getByTestId('button-enable-2fa').click();
    await expect(page.getByTestId('qr-code')).toBeVisible();
  });

  test('should delete account', async ({ page }) => {
    await page.goto('/settings/account');
    await page.getByTestId('button-delete-account').click();
    await page.getByTestId('input-confirm-delete').fill('DELETE');
    await page.getByTestId('button-confirm-deletion').click();
    await expect(page.getByText(/account.*deleted/i)).toBeVisible();
  });
});
