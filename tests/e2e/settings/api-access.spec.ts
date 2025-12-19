/**
 * API ACCESS TEST
 * Tests developer API key management
 */

import { test, expect } from '@playwright/test';

test.describe('Settings - API Access', () => {
  test('should access API settings', async ({ page }) => {
    await page.goto('/settings/api');
    await expect(page.getByTestId('api-settings')).toBeVisible();
  });

  test('should create API key', async ({ page }) => {
    await page.goto('/settings/api');
    await page.getByTestId('button-create-api-key').click();
    await page.getByTestId('input-key-name').fill('Test API Key');
    await page.getByTestId('button-generate-key').click();
    await expect(page.getByTestId('generated-key')).toBeVisible();
  });

  test('should view API keys list', async ({ page }) => {
    await page.goto('/settings/api');
    await expect(page.getByTestId('api-keys-list')).toBeVisible();
  });

  test('should delete API key', async ({ page }) => {
    await page.goto('/settings/api');
    await page.getByTestId('button-delete-key').first().click();
    await page.getByTestId('button-confirm-delete').click();
    await expect(page.getByText(/deleted/i)).toBeVisible();
  });

  test('should view API documentation', async ({ page }) => {
    await page.goto('/settings/api');
    await page.getByTestId('link-api-docs').click();
    await expect(page).toHaveURL(/\/api-docs/);
  });
});
