/**
 * ADMIN API KEYS TEST
 * Tests API key management for integrations
 */

import { test, expect } from '@playwright/test';

test.describe('Admin - API Keys', () => {
  test('should view API keys list', async ({ page }) => {
    await page.goto('/admin/api-keys');
    await expect(page.getByTestId('api-keys-list')).toBeVisible();
  });

  test('should create API key', async ({ page }) => {
    await page.goto('/admin/api-keys');
    await page.getByTestId('button-create-api-key').click();
    await page.getByTestId('input-key-name').fill('Mobile App API');
    await page.getByTestId('select-permissions').click();
    await page.getByTestId('option-read-write').click();
    await page.getByTestId('button-generate-key').click();
    await expect(page.getByTestId('generated-key')).toBeVisible();
  });

  test('should revoke API key', async ({ page }) => {
    await page.goto('/admin/api-keys');
    await page.getByTestId('button-revoke-key').first().click();
    await page.getByTestId('button-confirm-revoke').click();
    await expect(page.getByText(/revoked/i)).toBeVisible();
  });

  test('should view API key usage stats', async ({ page }) => {
    await page.goto('/admin/api-keys');
    await page.locator('[data-testid^="api-key-"]').first().click();
    await expect(page.getByTestId('usage-stats')).toBeVisible();
  });

  test('should regenerate API key', async ({ page }) => {
    await page.goto('/admin/api-keys');
    await page.getByTestId('button-regenerate-key').first().click();
    await page.getByTestId('button-confirm-regenerate').click();
    await expect(page.getByTestId('generated-key')).toBeVisible();
  });
});
