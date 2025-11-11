/**
 * PRODUCTIVITY AGENT TEST
 * Tests task management and productivity optimization
 */

import { test, expect } from '@playwright/test';

test.describe('Life CEO - Productivity Agent', () => {
  test('should access Productivity Agent', async ({ page }) => {
    await page.goto('/life-ceo/productivity');
    await expect(page.getByTestId('productivity-agent-container')).toBeVisible();
  });

  test('should chat with Productivity Agent', async ({ page }) => {
    await page.goto('/life-ceo/productivity');
    await page.getByTestId('input-chat-message').fill('Help me organize my practice schedule');
    await page.getByTestId('button-send').click();
    await expect(page.locator('[data-testid^="agent-response-"]')).toBeVisible({ timeout: 15000 });
  });

  test('should view task list', async ({ page }) => {
    await page.goto('/life-ceo/productivity');
    await expect(page.getByTestId('task-list')).toBeVisible();
  });

  test('should add task', async ({ page }) => {
    await page.goto('/life-ceo/productivity');
    await page.getByTestId('button-add-task').click();
    await page.getByTestId('input-task-title').fill('Practice tango embrace technique');
    await page.getByTestId('button-save-task').click();
    await expect(page.getByText(/saved|added/i)).toBeVisible();
  });

  test('should complete task', async ({ page }) => {
    await page.goto('/life-ceo/productivity');
    await page.getByTestId('checkbox-task').first().click();
    await expect(page.locator('[data-testid^="task-"]').first()).toHaveClass(/completed|done/);
  });
});
