/**
 * VIDEO STUDIO TEST  
 * Tests video creation and editing tools
 */

import { test, expect } from '@playwright/test';

test.describe('Video Studio', () => {
  test('should open video studio', async ({ page }) => {
    await page.goto('/video-studio');
    await expect(page.getByTestId('video-studio-container')).toBeVisible();
  });

  test('should access video templates', async ({ page }) => {
    await page.goto('/video-studio');
    await expect(page.getByTestId('templates-gallery')).toBeVisible();
    await expect(page.locator('[data-testid^="template-"]')).toHaveCount({ min: 1 });
  });

  test('should select template', async ({ page }) => {
    await page.goto('/video-studio');
    await page.locator('[data-testid^="template-"]').first().click();
    await expect(page.getByTestId('editor-canvas')).toBeVisible();
  });

  test('should add text to video', async ({ page }) => {
    await page.goto('/video-studio');
    await page.getByTestId('button-add-text').click();
    await page.getByTestId('input-text-content').fill('Tango Night 2025');
    await page.getByTestId('button-apply-text').click();
  });

  test('should export video', async ({ page }) => {
    await page.goto('/video-studio');
    await page.getByTestId('button-export-video').click();
    await expect(page.getByText(/exporting|processing/i)).toBeVisible();
  });
});
