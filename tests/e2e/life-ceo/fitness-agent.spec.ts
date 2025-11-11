/**
 * FITNESS AGENT TEST
 * Tests workout planning and fitness tracking
 */

import { test, expect } from '@playwright/test';

test.describe('Life CEO - Fitness Agent', () => {
  test('should access Fitness Agent', async ({ page }) => {
    await page.goto('/life-ceo/fitness');
    await expect(page.getByTestId('fitness-agent-container')).toBeVisible();
  });

  test('should chat with Fitness Agent', async ({ page }) => {
    await page.goto('/life-ceo/fitness');
    await page.getByTestId('input-chat-message').fill('Create strength training plan for dancers');
    await page.getByTestId('button-send').click();
    await expect(page.locator('[data-testid^="agent-response-"]')).toBeVisible({ timeout: 15000 });
  });

  test('should view workout plans', async ({ page }) => {
    await page.goto('/life-ceo/fitness');
    await expect(page.getByTestId('workout-plans')).toBeVisible();
  });

  test('should log workout', async ({ page }) => {
    await page.goto('/life-ceo/fitness');
    await page.getByTestId('button-log-workout').click();
    await page.getByTestId('select-workout-type').click();
    await page.getByTestId('option-cardio').click();
    await page.getByTestId('input-duration').fill('30');
    await page.getByTestId('button-save-workout').click();
    await expect(page.getByText(/logged/i)).toBeVisible();
  });

  test('should view fitness stats', async ({ page }) => {
    await page.goto('/life-ceo/fitness');
    await expect(page.getByTestId('fitness-stats')).toBeVisible();
  });
});
