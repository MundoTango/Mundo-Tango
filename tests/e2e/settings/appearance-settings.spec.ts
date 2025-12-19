/**
 * APPEARANCE SETTINGS TEST
 * Tests theme and display preferences
 */

import { test, expect } from '@playwright/test';

test.describe('Settings - Appearance', () => {
  test('should access appearance settings', async ({ page }) => {
    await page.goto('/settings/appearance');
    await expect(page.getByTestId('appearance-settings')).toBeVisible();
  });

  test('should switch to dark mode', async ({ page }) => {
    await page.goto('/settings/appearance');
    await page.getByTestId('toggle-dark-mode').click();
    await expect(page.locator('html')).toHaveClass(/dark/);
  });

  test('should switch to light mode', async ({ page }) => {
    await page.goto('/settings/appearance');
    await page.getByTestId('toggle-light-mode').click();
    await expect(page.locator('html')).not.toHaveClass(/dark/);
  });

  test('should change language', async ({ page }) => {
    await page.goto('/settings/appearance');
    await page.getByTestId('select-language').click();
    await page.getByTestId('option-spanish').click();
    await page.getByTestId('button-save-appearance').click();
    await expect(page.getByText(/guardado/i)).toBeVisible();
  });

  test('should adjust font size', async ({ page }) => {
    await page.goto('/settings/appearance');
    await page.getByTestId('slider-font-size').fill('18');
    await page.getByTestId('button-save-appearance').click();
    await expect(page.getByText(/saved/i)).toBeVisible();
  });
});
