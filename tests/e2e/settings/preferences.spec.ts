/**
 * PREFERENCES TEST
 * Tests general user preferences and defaults
 */

import { test, expect } from '@playwright/test';

test.describe('Settings - Preferences', () => {
  test('should access preferences', async ({ page }) => {
    await page.goto('/settings/preferences');
    await expect(page.getByTestId('preferences-container')).toBeVisible();
  });

  test('should set default event view', async ({ page }) => {
    await page.goto('/settings/preferences');
    await page.getByTestId('select-default-event-view').click();
    await page.getByTestId('option-calendar').click();
    await page.getByTestId('button-save-preferences').click();
    await expect(page.getByText(/saved/i)).toBeVisible();
  });

  test('should set auto-play videos', async ({ page }) => {
    await page.goto('/settings/preferences');
    await page.getByTestId('toggle-autoplay-videos').click();
    await page.getByTestId('button-save-preferences').click();
    await expect(page.getByText(/saved/i)).toBeVisible();
  });

  test('should set feed sort order', async ({ page }) => {
    await page.goto('/settings/preferences');
    await page.getByTestId('select-feed-sort').click();
    await page.getByTestId('option-recent').click();
    await page.getByTestId('button-save-preferences').click();
    await expect(page.getByText(/saved/i)).toBeVisible();
  });

  test('should enable compact mode', async ({ page }) => {
    await page.goto('/settings/preferences');
    await page.getByTestId('toggle-compact-mode').click();
    await page.getByTestId('button-save-preferences').click();
    await expect(page.getByText(/saved/i)).toBeVisible();
  });
});
