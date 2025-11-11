/**
 * TANGO MEDIA GALLERY TEST
 * Tests photo/video uploads, albums, and likes
 */

import { test, expect } from '@playwright/test';

test.describe('Tango - Media Gallery', () => {
  test('should view media gallery', async ({ page }) => {
    await page.goto('/gallery');
    await expect(page.getByTestId('gallery-container')).toBeVisible();
  });

  test('should upload photo', async ({ page }) => {
    await page.goto('/gallery');
    await page.getByTestId('button-upload').click();
    await expect(page.getByTestId('upload-form')).toBeVisible();
  });

  test('should create album', async ({ page }) => {
    await page.goto('/gallery');
    await page.getByTestId('button-create-album').click();
    await page.getByTestId('input-album-name').fill('Festival 2025');
    await page.getByTestId('button-save-album').click();
    await expect(page.getByText(/created/i)).toBeVisible();
  });

  test('should like photo', async ({ page }) => {
    await page.goto('/gallery');
    await page.getByTestId('button-like-photo').first().click();
    await expect(page.getByTestId('like-count')).toBeVisible();
  });

  test('should comment on photo', async ({ page }) => {
    await page.goto('/gallery/photo/1');
    await page.getByTestId('textarea-comment').fill('Beautiful performance!');
    await page.getByTestId('button-post-comment').click();
    await expect(page.getByText('Beautiful performance!')).toBeVisible();
  });

  test('should filter by media type', async ({ page }) => {
    await page.goto('/gallery');
    await page.getByTestId('filter-videos').click();
    await page.waitForLoadState('networkidle');
  });
});
