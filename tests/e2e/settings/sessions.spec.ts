/**
 * SESSIONS TEST
 * Tests active session management
 */

import { test, expect } from '@playwright/test';

test.describe('Settings - Sessions', () => {
  test('should view active sessions', async ({ page }) => {
    await page.goto('/settings/sessions');
    await expect(page.getByTestId('sessions-list')).toBeVisible();
  });

  test('should view session details', async ({ page }) => {
    await page.goto('/settings/sessions');
    await expect(page.locator('[data-testid^="session-"]').first()).toBeVisible();
    await expect(page.getByTestId('session-device')).toBeVisible();
    await expect(page.getByTestId('session-location')).toBeVisible();
  });

  test('should revoke session', async ({ page }) => {
    await page.goto('/settings/sessions');
    await page.getByTestId('button-revoke-session').first().click();
    await page.getByTestId('button-confirm-revoke').click();
    await expect(page.getByText(/revoked/i)).toBeVisible();
  });

  test('should revoke all sessions', async ({ page }) => {
    await page.goto('/settings/sessions');
    await page.getByTestId('button-revoke-all').click();
    await page.getByTestId('button-confirm-revoke-all').click();
    await expect(page.getByText(/all.*revoked/i)).toBeVisible();
  });
});
