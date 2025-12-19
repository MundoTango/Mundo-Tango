/**
 * CAREER AGENT TEST
 * Tests career planning, goals, and professional development
 */

import { test, expect } from '@playwright/test';

test.describe('Life CEO - Career Agent', () => {
  test('should access Career Agent', async ({ page }) => {
    await page.goto('/life-ceo/career');
    await expect(page.getByTestId('career-agent-container')).toBeVisible();
  });

  test('should chat with Career Agent', async ({ page }) => {
    await page.goto('/life-ceo/career');
    const message = 'Help me plan my tango teaching career';
    await page.getByTestId('input-chat-message').fill(message);
    await page.getByTestId('button-send').click();
    await expect(page.getByText(message)).toBeVisible();
    await expect(page.locator('[data-testid^="agent-response-"]')).toBeVisible({ timeout: 15000 });
  });

  test('should view career goals', async ({ page }) => {
    await page.goto('/life-ceo/career');
    await expect(page.getByTestId('career-goals-list')).toBeVisible();
  });

  test('should add new career goal', async ({ page }) => {
    await page.goto('/life-ceo/career');
    await page.getByTestId('button-add-goal').click();
    await page.getByTestId('input-goal-title').fill('Become certified tango instructor');
    await page.getByTestId('button-save-goal').click();
    await expect(page.getByText('Become certified tango instructor')).toBeVisible();
  });
});
