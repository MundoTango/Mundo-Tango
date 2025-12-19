/**
 * PRIVACY SETTINGS TEST
 * Tests privacy controls and data management
 */

import { test, expect } from '@playwright/test';

test.describe('Settings - Privacy', () => {
  test('should access privacy settings', async ({ page }) => {
    await page.goto('/settings/privacy');
    await expect(page.getByTestId('privacy-settings')).toBeVisible();
  });

  test('should update profile visibility', async ({ page }) => {
    await page.goto('/settings/privacy');
    await page.getByTestId('select-profile-visibility').click();
    await page.getByTestId('option-friends-only').click();
    await page.getByTestId('button-save-privacy').click();
    await expect(page.getByText(/saved/i)).toBeVisible();
  });

  test('should manage blocked users', async ({ page }) => {
    await page.goto('/settings/privacy/blocked');
    await expect(page.getByTestId('blocked-users-list')).toBeVisible();
  });

  test('should download personal data', async ({ page }) => {
    await page.goto('/settings/privacy');
    const downloadPromise = page.waitForEvent('download');
    await page.getByTestId('button-download-data').click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('.zip');
  });

  test('should disable data sharing', async ({ page }) => {
    await page.goto('/settings/privacy');
    await page.getByTestId('toggle-data-sharing').click();
    await page.getByTestId('button-save-privacy').click();
    await expect(page.getByText(/saved/i)).toBeVisible();
  });
});
