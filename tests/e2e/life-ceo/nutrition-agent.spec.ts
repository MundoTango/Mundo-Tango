/**
 * NUTRITION AGENT TEST
 * Tests meal planning and nutritional guidance
 */

import { test, expect } from '@playwright/test';

test.describe('Life CEO - Nutrition Agent', () => {
  test('should access Nutrition Agent', async ({ page }) => {
    await page.goto('/life-ceo/nutrition');
    await expect(page.getByTestId('nutrition-agent-container')).toBeVisible();
  });

  test('should chat with Nutrition Agent', async ({ page }) => {
    await page.goto('/life-ceo/nutrition');
    await page.getByTestId('input-chat-message').fill('Recommend pre-milonga meals');
    await page.getByTestId('button-send').click();
    await expect(page.locator('[data-testid^="agent-response-"]')).toBeVisible({ timeout: 15000 });
  });

  test('should view meal plans', async ({ page }) => {
    await page.goto('/life-ceo/nutrition');
    await expect(page.getByTestId('meal-plans')).toBeVisible();
  });

  test('should log meal', async ({ page }) => {
    await page.goto('/life-ceo/nutrition');
    await page.getByTestId('button-log-meal').click();
    await page.getByTestId('input-meal-name').fill('Grilled chicken salad');
    await page.getByTestId('button-save-meal').click();
    await expect(page.getByText(/logged/i)).toBeVisible();
  });

  test('should view nutrition insights', async ({ page }) => {
    await page.goto('/life-ceo/nutrition');
    await expect(page.getByTestId('nutrition-insights')).toBeVisible();
  });
});
