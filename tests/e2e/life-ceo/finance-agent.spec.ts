/**
 * FINANCE AGENT TEST
 * Tests financial planning, budgeting, and tracking
 */

import { test, expect } from '@playwright/test';

test.describe('Life CEO - Finance Agent', () => {
  test('should access Finance Agent', async ({ page }) => {
    await page.goto('/life-ceo/finance');
    await expect(page.getByTestId('finance-agent-container')).toBeVisible();
  });

  test('should chat with Finance Agent', async ({ page }) => {
    await page.goto('/life-ceo/finance');
    await page.getByTestId('input-chat-message').fill('Help me budget for tango events');
    await page.getByTestId('button-send').click();
    await expect(page.locator('[data-testid^="agent-response-"]')).toBeVisible({ timeout: 15000 });
  });

  test('should view budget overview', async ({ page }) => {
    await page.goto('/life-ceo/finance');
    await expect(page.getByTestId('budget-overview')).toBeVisible();
  });

  test('should add expense', async ({ page }) => {
    await page.goto('/life-ceo/finance');
    await page.getByTestId('button-add-expense').click();
    await page.getByTestId('input-expense-amount').fill('50');
    await page.getByTestId('input-expense-description').fill('Tango shoes');
    await page.getByTestId('button-save-expense').click();
    await expect(page.getByText(/saved/i)).toBeVisible();
  });
});
