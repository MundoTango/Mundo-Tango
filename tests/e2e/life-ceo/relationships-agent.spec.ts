/**
 * RELATIONSHIPS AGENT TEST
 * Tests relationship advice and social connection insights
 */

import { test, expect } from '@playwright/test';

test.describe('Life CEO - Relationships Agent', () => {
  test('should access Relationships Agent', async ({ page }) => {
    await page.goto('/life-ceo/relationships');
    await expect(page.getByTestId('relationships-agent-container')).toBeVisible();
  });

  test('should chat with Relationships Agent', async ({ page }) => {
    await page.goto('/life-ceo/relationships');
    await page.getByTestId('input-chat-message').fill('How can I expand my tango network?');
    await page.getByTestId('button-send').click();
    await expect(page.locator('[data-testid^="agent-response-"]')).toBeVisible({ timeout: 15000 });
  });

  test('should view relationship insights', async ({ page }) => {
    await page.goto('/life-ceo/relationships');
    await expect(page.getByTestId('relationship-insights')).toBeVisible();
  });
});
