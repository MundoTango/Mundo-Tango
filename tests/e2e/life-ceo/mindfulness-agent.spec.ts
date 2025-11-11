/**
 * MINDFULNESS AGENT TEST
 * Tests meditation, breathing exercises, and mindfulness
 */

import { test, expect } from '@playwright/test';

test.describe('Life CEO - Mindfulness Agent', () => {
  test('should access Mindfulness Agent', async ({ page }) => {
    await page.goto('/life-ceo/mindfulness');
    await expect(page.getByTestId('mindfulness-agent-container')).toBeVisible();
  });

  test('should chat with Mindfulness Agent', async ({ page }) => {
    await page.goto('/life-ceo/mindfulness');
    await page.getByTestId('input-chat-message').fill('Guide me through pre-performance meditation');
    await page.getByTestId('button-send').click();
    await expect(page.locator('[data-testid^="agent-response-"]')).toBeVisible({ timeout: 15000 });
  });

  test('should start meditation session', async ({ page }) => {
    await page.goto('/life-ceo/mindfulness');
    await page.getByTestId('button-start-meditation').click();
    await expect(page.getByTestId('meditation-timer')).toBeVisible();
  });

  test('should view mindfulness stats', async ({ page }) => {
    await page.goto('/life-ceo/mindfulness');
    await expect(page.getByTestId('mindfulness-stats')).toBeVisible();
  });
});
