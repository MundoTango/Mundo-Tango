/**
 * LANGUAGE SETTINGS TEST
 * Tests i18n language selection and localization
 */

import { test, expect } from '@playwright/test';

test.describe('Settings - Language & Localization', () => {
  test('should access language settings', async ({ page }) => {
    await page.goto('/settings/language');
    await expect(page.getByTestId('language-settings')).toBeVisible();
  });

  test('should switch to Spanish', async ({ page }) => {
    await page.goto('/settings/language');
    await page.getByTestId('select-language').click();
    await page.getByTestId('option-es').click();
    await page.waitForLoadState('networkidle');
    await expect(page.getByTestId('language-label')).toHaveText(/español/i);
  });

  test('should switch to English', async ({ page }) => {
    await page.goto('/settings/language');
    await page.getByTestId('select-language').click();
    await page.getByTestId('option-en').click();
    await page.waitForLoadState('networkidle');
    await expect(page.getByTestId('language-label')).toHaveText(/english/i);
  });

  test('should set date format', async ({ page }) => {
    await page.goto('/settings/language');
    await page.getByTestId('select-date-format').click();
    await page.getByTestId('option-dd-mm-yyyy').click();
    await page.getByTestId('button-save-language').click();
    await expect(page.getByText(/saved/i)).toBeVisible();
  });

  test('should set timezone', async ({ page }) => {
    await page.goto('/settings/language');
    await page.getByTestId('select-timezone').click();
    await page.getByTestId('option-america-buenos-aires').click();
    await page.getByTestId('button-save-language').click();
    await expect(page.getByText(/saved/i)).toBeVisible();
  });
});
