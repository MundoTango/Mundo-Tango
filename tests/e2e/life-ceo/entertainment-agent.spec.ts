/**
 * ENTERTAINMENT AGENT TEST
 * Tests entertainment recommendations and leisure planning
 */

import { test, expect } from '@playwright/test';

test.describe('Life CEO - Entertainment Agent', () => {
  test('should access Entertainment Agent', async ({ page }) => {
    await page.goto('/life-ceo/entertainment');
    await expect(page.getByTestId('entertainment-agent-container')).toBeVisible();
  });

  test('should chat with Entertainment Agent', async ({ page }) => {
    await page.goto('/life-ceo/entertainment');
    await page.getByTestId('input-chat-message').fill('Recommend tango documentaries');
    await page.getByTestId('button-send').click();
    await expect(page.locator('[data-testid^="agent-response-"]')).toBeVisible({ timeout: 15000 });
  });

  test('should view entertainment recommendations', async ({ page }) => {
    await page.goto('/life-ceo/entertainment');
    await expect(page.getByTestId('recommendations-list')).toBeVisible();
  });

  test('should save recommendation', async ({ page }) => {
    await page.goto('/life-ceo/entertainment');
    await page.getByTestId('button-save-recommendation').first().click();
    await expect(page.getByText(/saved/i)).toBeVisible();
  });
});
