/**
 * TRAVEL AGENT TEST
 * Tests travel planning and destination recommendations
 */

import { test, expect } from '@playwright/test';

test.describe('Life CEO - Travel Agent', () => {
  test('should access Travel Agent', async ({ page }) => {
    await page.goto('/life-ceo/travel');
    await expect(page.getByTestId('travel-agent-container')).toBeVisible();
  });

  test('should chat with Travel Agent', async ({ page }) => {
    await page.goto('/life-ceo/travel');
    await page.getByTestId('input-chat-message').fill('Plan tango festival trip to Buenos Aires');
    await page.getByTestId('button-send').click();
    await expect(page.locator('[data-testid^="agent-response-"]')).toBeVisible({ timeout: 15000 });
  });

  test('should view trip plans', async ({ page }) => {
    await page.goto('/life-ceo/travel');
    await expect(page.getByTestId('trip-plans')).toBeVisible();
  });

  test('should save destination', async ({ page }) => {
    await page.goto('/life-ceo/travel');
    await page.getByTestId('button-save-destination').first().click();
    await expect(page.getByText(/saved/i)).toBeVisible();
  });
});
