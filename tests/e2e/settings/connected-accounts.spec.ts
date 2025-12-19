/**
 * CONNECTED ACCOUNTS TEST
 * Tests third-party account integrations
 */

import { test, expect } from '@playwright/test';

test.describe('Settings - Connected Accounts', () => {
  test('should access connected accounts', async ({ page }) => {
    await page.goto('/settings/connected-accounts');
    await expect(page.getByTestId('connected-accounts')).toBeVisible();
  });

  test('should view available connections', async ({ page }) => {
    await page.goto('/settings/connected-accounts');
    await expect(page.getByTestId('connection-google')).toBeVisible();
    await expect(page.getByTestId('connection-facebook')).toBeVisible();
  });

  test('should disconnect account', async ({ page }) => {
    await page.goto('/settings/connected-accounts');
    await page.getByTestId('button-disconnect-google').click();
    await page.getByTestId('button-confirm-disconnect').click();
    await expect(page.getByText(/disconnected/i)).toBeVisible();
  });

  test('should view connection permissions', async ({ page }) => {
    await page.goto('/settings/connected-accounts');
    await page.getByTestId('button-view-permissions').first().click();
    await expect(page.getByTestId('permissions-modal')).toBeVisible();
  });
});
