/**
 * STRESS MANAGEMENT AGENT TEST
 * Tests stress reduction and coping strategies
 */

import { test, expect } from '@playwright/test';

test.describe('Life CEO - Stress Management Agent', () => {
  test('should access Stress Management Agent', async ({ page }) => {
    await page.goto('/life-ceo/stress');
    await expect(page.getByTestId('stress-agent-container')).toBeVisible();
  });

  test('should chat with Stress Agent', async ({ page }) => {
    await page.goto('/life-ceo/stress');
    await page.getByTestId('input-chat-message').fill('Manage performance anxiety before competitions');
    await page.getByTestId('button-send').click();
    await expect(page.locator('[data-testid^="agent-response-"]')).toBeVisible({ timeout: 15000 });
  });

  test('should view stress level tracker', async ({ page }) => {
    await page.goto('/life-ceo/stress');
    await expect(page.getByTestId('stress-tracker')).toBeVisible();
  });

  test('should log stress level', async ({ page }) => {
    await page.goto('/life-ceo/stress');
    await page.getByTestId('button-log-stress').click();
    await page.getByTestId('slider-stress-level').fill('5');
    await page.getByTestId('button-save-stress').click();
    await expect(page.getByText(/logged/i)).toBeVisible();
  });

  test('should start breathing exercise', async ({ page }) => {
    await page.goto('/life-ceo/stress');
    await page.getByTestId('button-breathing-exercise').click();
    await expect(page.getByTestId('breathing-timer')).toBeVisible();
  });

  test('should view coping strategies', async ({ page }) => {
    await page.goto('/life-ceo/stress');
    await expect(page.getByTestId('coping-strategies')).toBeVisible();
  });
});
