/**
 * TANGO HELP CENTER TEST
 * Tests FAQ, support tickets, and documentation
 */

import { test, expect } from '@playwright/test';

test.describe('Tango - Help Center', () => {
  test('should view help center', async ({ page }) => {
    await page.goto('/help');
    await expect(page.getByTestId('help-center')).toBeVisible();
  });

  test('should search help articles', async ({ page }) => {
    await page.goto('/help');
    await page.getByTestId('input-search-help').fill('How to create event');
    await page.waitForLoadState('networkidle');
  });

  test('should browse by category', async ({ page }) => {
    await page.goto('/help');
    await page.getByTestId('category-getting-started').click();
    await expect(page.locator('[data-testid^="article-"]')).toHaveCount({ min: 1 });
  });

  test('should read help article', async ({ page }) => {
    await page.goto('/help/article/1');
    await expect(page.getByTestId('article-title')).toBeVisible();
    await expect(page.getByTestId('article-content')).toBeVisible();
  });

  test('should mark article as helpful', async ({ page }) => {
    await page.goto('/help/article/1');
    await page.getByTestId('button-helpful').click();
    await expect(page.getByText(/helpful/i)).toBeVisible();
  });

  test('should submit support ticket', async ({ page }) => {
    await page.goto('/help/contact');
    await page.getByTestId('input-subject').fill('Need help with event creation');
    await page.getByTestId('textarea-message').fill('I cannot find the create event button');
    await page.getByTestId('button-submit-ticket').click();
    await expect(page.getByText(/submitted/i)).toBeVisible();
  });

  test('should view my tickets', async ({ page }) => {
    await page.goto('/help/tickets');
    await expect(page.getByTestId('tickets-list')).toBeVisible();
  });
});
