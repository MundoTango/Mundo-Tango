/**
 * TANGO BLOG TEST
 * Tests blog posts, categories, and publishing workflow
 */

import { test, expect } from '@playwright/test';

test.describe('Tango - Blog', () => {
  test('should view blog', async ({ page }) => {
    await page.goto('/blog');
    await expect(page.getByTestId('blog-container')).toBeVisible();
  });

  test('should read blog post', async ({ page }) => {
    await page.goto('/blog');
    await page.locator('[data-testid^="post-"]').first().click();
    await expect(page.getByTestId('post-title')).toBeVisible();
    await expect(page.getByTestId('post-content')).toBeVisible();
  });

  test('should filter by category', async ({ page }) => {
    await page.goto('/blog');
    await page.getByTestId('category-technique').click();
    await page.waitForLoadState('networkidle');
  });

  test('should search blog posts', async ({ page }) => {
    await page.goto('/blog');
    await page.getByTestId('input-search-blog').fill('tango history');
    await page.waitForLoadState('networkidle');
  });

  test('should comment on blog post', async ({ page }) => {
    await page.goto('/blog/1');
    await page.getByTestId('textarea-comment').fill('Great article!');
    await page.getByTestId('button-post-comment').click();
    await expect(page.getByText('Great article!')).toBeVisible();
  });

  test('should share blog post', async ({ page }) => {
    await page.goto('/blog/1');
    await page.getByTestId('button-share').click();
    await expect(page.getByTestId('share-modal')).toBeVisible();
  });
});
