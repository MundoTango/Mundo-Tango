/**
 * TANGO STORIES TEST
 * Tests ephemeral 24-hour content stories system
 */

import { test, expect } from '@playwright/test';

test.describe('Tango - Stories', () => {
  test('should view stories feed', async ({ page }) => {
    await page.goto('/stories');
    await expect(page.getByTestId('stories-container')).toBeVisible();
  });

  test('should create story', async ({ page }) => {
    await page.goto('/stories/create');
    await page.getByTestId('textarea-story-content').fill('At the milonga tonight! 💃');
    await page.getByTestId('button-post-story').click();
    await expect(page.getByText(/posted/i)).toBeVisible();
  });

  test('should view story', async ({ page }) => {
    await page.goto('/stories');
    await page.locator('[data-testid^="story-"]').first().click();
    await expect(page.getByTestId('story-viewer')).toBeVisible();
  });

  test('should react to story', async ({ page }) => {
    await page.goto('/stories');
    await page.locator('[data-testid^="story-"]').first().click();
    await page.getByTestId('button-react').click();
    await page.getByTestId('reaction-heart').click();
    await expect(page.getByText(/sent/i)).toBeVisible();
  });

  test('should delete story', async ({ page }) => {
    await page.goto('/stories');
    await page.getByTestId('button-my-story').click();
    await page.getByTestId('button-delete-story').click();
    await page.getByTestId('button-confirm-delete').click();
    await expect(page.getByText(/deleted/i)).toBeVisible();
  });
});
