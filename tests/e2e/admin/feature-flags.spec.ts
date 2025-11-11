/**
 * ADMIN FEATURE FLAGS TEST
 * Tests dynamic feature flag system
 */

import { test, expect } from '@playwright/test';

test.describe('Admin - Feature Flags', () => {
  test('should view feature flags', async ({ page }) => {
    await page.goto('/admin/feature-flags');
    await expect(page.getByTestId('feature-flags-list')).toBeVisible();
  });

  test('should toggle feature flag', async ({ page }) => {
    await page.goto('/admin/feature-flags');
    await page.getByTestId('toggle-live-streaming').click();
    await expect(page.getByText(/updated/i)).toBeVisible();
  });

  test('should create new feature flag', async ({ page }) => {
    await page.goto('/admin/feature-flags');
    await page.getByTestId('button-create-flag').click();
    await page.getByTestId('input-flag-key').fill('beta_video_studio');
    await page.getByTestId('input-flag-description').fill('Beta access to video studio');
    await page.getByTestId('button-save-flag').click();
    await expect(page.getByText(/created/i)).toBeVisible();
  });

  test('should enable flag for specific users', async ({ page }) => {
    await page.goto('/admin/feature-flags/1');
    await page.getByTestId('button-add-user').click();
    await page.getByTestId('input-user-email').fill('beta@example.com');
    await page.getByTestId('button-save-user').click();
    await expect(page.getByText(/added/i)).toBeVisible();
  });
});
