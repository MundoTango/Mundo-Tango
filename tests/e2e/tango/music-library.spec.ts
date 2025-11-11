/**
 * TANGO MUSIC LIBRARY TEST
 * Tests music catalog, playlists, and favorites
 */

import { test, expect } from '@playwright/test';

test.describe('Tango - Music Library', () => {
  test('should view music library', async ({ page }) => {
    await page.goto('/music');
    await expect(page.getByTestId('music-library')).toBeVisible();
  });

  test('should search songs', async ({ page }) => {
    await page.goto('/music');
    await page.getByTestId('input-search-songs').fill('La Cumparsita');
    await page.waitForLoadState('networkidle');
  });

  test('should filter by artist', async ({ page }) => {
    await page.goto('/music');
    await page.getByTestId('filter-artist').click();
    await page.getByTestId('option-carlos-gardel').click();
    await page.waitForLoadState('networkidle');
  });

  test('should filter by orchestra', async ({ page }) => {
    await page.goto('/music');
    await page.getByTestId('filter-orchestra').click();
    await page.getByTestId('option-di-sarli').click();
    await page.waitForLoadState('networkidle');
  });

  test('should play song preview', async ({ page }) => {
    await page.goto('/music');
    await page.getByTestId('button-play').first().click();
    await expect(page.getByTestId('audio-player')).toBeVisible();
  });

  test('should add song to favorites', async ({ page }) => {
    await page.goto('/music');
    await page.getByTestId('button-favorite').first().click();
    await expect(page.getByText(/added.*favorites/i)).toBeVisible();
  });

  test('should create playlist', async ({ page }) => {
    await page.goto('/music/playlists');
    await page.getByTestId('button-create-playlist').click();
    await page.getByTestId('input-playlist-name').fill('Milonga Favorites');
    await page.getByTestId('button-save-playlist').click();
    await expect(page.getByText(/created/i)).toBeVisible();
  });

  test('should add song to playlist', async ({ page }) => {
    await page.goto('/music');
    await page.getByTestId('button-add-to-playlist').first().click();
    await page.getByTestId('select-playlist').click();
    await page.getByTestId('option-my-playlist').first().click();
    await expect(page.getByText(/added/i)).toBeVisible();
  });
});
