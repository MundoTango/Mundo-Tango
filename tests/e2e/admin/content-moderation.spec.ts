/**
 * ADMIN CONTENT MODERATION TEST
 * Tests content review, approval, and moderation
 */

import { test, expect } from '@playwright/test';

test.describe('Admin - Content Moderation', () => {
  test('should view moderation queue', async ({ page }) => {
    await page.goto('/admin/moderation');
    await expect(page.getByTestId('moderation-queue')).toBeVisible();
  });

  test('should view reported posts', async ({ page }) => {
    await page.goto('/admin/moderation/posts');
    await expect(page.getByTestId('reported-posts')).toBeVisible();
  });

  test('should approve post', async ({ page }) => {
    await page.goto('/admin/moderation/posts');
    await page.getByTestId('button-approve').first().click();
    await expect(page.getByText(/approved/i)).toBeVisible();
  });

  test('should remove post', async ({ page }) => {
    await page.goto('/admin/moderation/posts');
    await page.getByTestId('button-remove').first().click();
    await page.getByTestId('select-reason').click();
    await page.getByTestId('option-spam').click();
    await page.getByTestId('button-confirm-remove').click();
    await expect(page.getByText(/removed/i)).toBeVisible();
  });

  test('should warn user about content', async ({ page }) => {
    await page.goto('/admin/moderation/posts');
    await page.getByTestId('button-warn-user').first().click();
    await page.getByTestId('textarea-warning-message').fill('Please follow community guidelines');
    await page.getByTestId('button-send-warning').click();
    await expect(page.getByText(/warning.*sent/i)).toBeVisible();
  });
});
