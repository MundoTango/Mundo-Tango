/**
 * HOME AGENT TEST
 * Tests home management and living space optimization
 */

import { test, expect } from '@playwright/test';

test.describe('Life CEO - Home Agent', () => {
  test('should access Home Agent', async ({ page }) => {
    await page.goto('/life-ceo/home');
    await expect(page.getByTestId('home-agent-container')).toBeVisible();
  });

  test('should chat with Home Agent', async ({ page }) => {
    await page.goto('/life-ceo/home');
    await page.getByTestId('input-chat-message').fill('Create practice space for dancing');
    await page.getByTestId('button-send').click();
    await expect(page.locator('[data-testid^="agent-response-"]')).toBeVisible({ timeout: 15000 });
  });

  test('should view home projects', async ({ page }) => {
    await page.goto('/life-ceo/home');
    await expect(page.getByTestId('home-projects')).toBeVisible();
  });
});
