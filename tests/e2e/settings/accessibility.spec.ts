/**
 * ACCESSIBILITY SETTINGS TEST
 * Tests accessibility features and preferences
 */

import { test, expect } from '@playwright/test';

test.describe('Settings - Accessibility', () => {
  test('should access accessibility settings', async ({ page }) => {
    await page.goto('/settings/accessibility');
    await expect(page.getByTestId('accessibility-settings')).toBeVisible();
  });

  test('should enable high contrast mode', async ({ page }) => {
    await page.goto('/settings/accessibility');
    await page.getByTestId('toggle-high-contrast').click();
    await page.getByTestId('button-save-accessibility').click();
    await expect(page.getByText(/saved/i)).toBeVisible();
  });

  test('should enable reduce motion', async ({ page }) => {
    await page.goto('/settings/accessibility');
    await page.getByTestId('toggle-reduce-motion').click();
    await page.getByTestId('button-save-accessibility').click();
    await expect(page.getByText(/saved/i)).toBeVisible();
  });

  test('should enable screen reader optimizations', async ({ page }) => {
    await page.goto('/settings/accessibility');
    await page.getByTestId('toggle-screen-reader').click();
    await page.getByTestId('button-save-accessibility').click();
    await expect(page.getByText(/saved/i)).toBeVisible();
  });

  test('should increase text size', async ({ page }) => {
    await page.goto('/settings/accessibility');
    await page.getByTestId('slider-text-size').fill('20');
    await page.getByTestId('button-save-accessibility').click();
    await expect(page.getByText(/saved/i)).toBeVisible();
  });

  test('should enable keyboard navigation', async ({ page }) => {
    await page.goto('/settings/accessibility');
    await page.getByTestId('toggle-keyboard-nav').click();
    await page.getByTestId('button-save-accessibility').click();
    await expect(page.getByText(/saved/i)).toBeVisible();
  });
});
