/**
 * LEARNING AGENT TEST
 * Tests skill development and learning recommendations
 */

import { test, expect } from '@playwright/test';

test.describe('Life CEO - Learning Agent', () => {
  test('should access Learning Agent', async ({ page }) => {
    await page.goto('/life-ceo/learning');
    await expect(page.getByTestId('learning-agent-container')).toBeVisible();
  });

  test('should chat with Learning Agent', async ({ page }) => {
    await page.goto('/life-ceo/learning');
    await page.getByTestId('input-chat-message').fill('Recommend tango technique courses');
    await page.getByTestId('button-send').click();
    await expect(page.locator('[data-testid^="agent-response-"]')).toBeVisible({ timeout: 15000 });
  });

  test('should view learning paths', async ({ page }) => {
    await page.goto('/life-ceo/learning');
    await expect(page.getByTestId('learning-paths')).toBeVisible();
  });

  test('should track skill progress', async ({ page }) => {
    await page.goto('/life-ceo/learning');
    await expect(page.getByTestId('skill-progress')).toBeVisible();
  });
});
