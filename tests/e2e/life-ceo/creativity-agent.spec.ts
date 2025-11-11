/**
 * CREATIVITY AGENT TEST
 * Tests creative projects and artistic development
 */

import { test, expect } from '@playwright/test';

test.describe('Life CEO - Creativity Agent', () => {
  test('should access Creativity Agent', async ({ page }) => {
    await page.goto('/life-ceo/creativity');
    await expect(page.getByTestId('creativity-agent-container')).toBeVisible();
  });

  test('should chat with Creativity Agent', async ({ page }) => {
    await page.goto('/life-ceo/creativity');
    await page.getByTestId('input-chat-message').fill('Help me choreograph a tango sequence');
    await page.getByTestId('button-send').click();
    await expect(page.locator('[data-testid^="agent-response-"]')).toBeVisible({ timeout: 15000 });
  });

  test('should view creative projects', async ({ page }) => {
    await page.goto('/life-ceo/creativity');
    await expect(page.getByTestId('creative-projects')).toBeVisible();
  });
});
