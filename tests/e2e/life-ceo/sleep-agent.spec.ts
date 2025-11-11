/**
 * SLEEP AGENT TEST
 * Tests sleep tracking and optimization
 */

import { test, expect } from '@playwright/test';

test.describe('Life CEO - Sleep Agent', () => {
  test('should access Sleep Agent', async ({ page }) => {
    await page.goto('/life-ceo/sleep');
    await expect(page.getByTestId('sleep-agent-container')).toBeVisible();
  });

  test('should chat with Sleep Agent', async ({ page }) => {
    await page.goto('/life-ceo/sleep');
    await page.getByTestId('input-chat-message').fill('Help me improve sleep after late milongas');
    await page.getByTestId('button-send').click();
    await expect(page.locator('[data-testid^="agent-response-"]')).toBeVisible({ timeout: 15000 });
  });

  test('should view sleep stats', async ({ page }) => {
    await page.goto('/life-ceo/sleep');
    await expect(page.getByTestId('sleep-stats')).toBeVisible();
  });

  test('should log sleep data', async ({ page }) => {
    await page.goto('/life-ceo/sleep');
    await page.getByTestId('button-log-sleep').click();
    await page.getByTestId('input-hours').fill('7.5');
    await page.getByTestId('select-quality').click();
    await page.getByTestId('option-good').click();
    await page.getByTestId('button-save-sleep').click();
    await expect(page.getByText(/logged/i)).toBeVisible();
  });

  test('should view sleep recommendations', async ({ page }) => {
    await page.goto('/life-ceo/sleep');
    await expect(page.getByTestId('sleep-recommendations')).toBeVisible();
  });
});
