/**
 * HEALTH AGENT TEST
 * Tests health tracking, recommendations, and wellness
 */

import { test, expect } from '@playwright/test';

test.describe('Life CEO - Health Agent', () => {
  test('should access Health Agent', async ({ page }) => {
    await page.goto('/life-ceo/health');
    await expect(page.getByTestId('health-agent-container')).toBeVisible();
  });

  test('should chat with Health Agent', async ({ page }) => {
    await page.goto('/life-ceo/health');
    await page.getByTestId('input-chat-message').fill('Suggest exercises for tango dancers');
    await page.getByTestId('button-send').click();
    await expect(page.locator('[data-testid^="agent-response-"]')).toBeVisible({ timeout: 15000 });
  });

  test('should view health metrics', async ({ page }) => {
    await page.goto('/life-ceo/health');
    await expect(page.getByTestId('health-metrics')).toBeVisible();
  });

  test('should log health activity', async ({ page }) => {
    await page.goto('/life-ceo/health');
    await page.getByTestId('button-log-activity').click();
    await page.getByTestId('select-activity-type').click();
    await page.getByTestId('option-dance').click();
    await page.getByTestId('button-save-activity').click();
    await expect(page.getByText(/logged|saved/i)).toBeVisible();
  });
});
