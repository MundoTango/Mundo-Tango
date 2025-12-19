/**
 * AVATAR DESIGNER TEST
 * Tests 3D avatar customization
 */

import { test, expect } from '@playwright/test';

test.describe('Avatar Designer', () => {
  test('should open avatar designer', async ({ page }) => {
    await page.goto('/avatar-designer');
    await expect(page.getByTestId('avatar-designer-container')).toBeVisible();
  });

  test('should customize avatar appearance', async ({ page }) => {
    await page.goto('/avatar-designer');
    
    // Change skin tone
    await page.getByTestId('select-skin-tone').click();
    await page.getByTestId('option-light').click();
    
    // Change hair style
    await page.getByTestId('select-hair-style').click();
    await page.getByTestId('option-long').click();
    
    // Change clothing
    await page.getByTestId('select-outfit').click();
    await page.getByTestId('option-formal').click();
  });

  test('should preview avatar', async ({ page }) => {
    await page.goto('/avatar-designer');
    await expect(page.getByTestId('avatar-preview')).toBeVisible();
  });

  test('should save avatar', async ({ page }) => {
    await page.goto('/avatar-designer');
    await page.getByTestId('button-save-avatar').click();
    await expect(page.getByText(/saved/i)).toBeVisible();
  });

  test('should reset avatar to default', async ({ page }) => {
    await page.goto('/avatar-designer');
    await page.getByTestId('button-reset-avatar').click();
    await page.getByTestId('button-confirm-reset').click();
    await expect(page.getByText(/reset/i)).toBeVisible();
  });
});
