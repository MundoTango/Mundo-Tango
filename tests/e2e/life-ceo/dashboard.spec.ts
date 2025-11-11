/**
 * LIFE CEO DASHBOARD TEST
 * Tests the main Life CEO AI interface and agent selection
 */

import { test, expect } from '@playwright/test';

test.describe('Life CEO - Dashboard', () => {
  test('should view Life CEO dashboard', async ({ page }) => {
    await page.goto('/life-ceo');
    await expect(page.getByTestId('life-ceo-dashboard')).toBeVisible();
  });

  test('should display all 16 agent cards', async ({ page }) => {
    await page.goto('/life-ceo');
    await expect(page.locator('[data-testid^="agent-card-"]')).toHaveCount(16);
  });

  test('should view daily insights', async ({ page }) => {
    await page.goto('/life-ceo');
    await expect(page.getByTestId('daily-insights')).toBeVisible();
  });

  test('should access unified chat', async ({ page }) => {
    await page.goto('/life-ceo');
    await page.getByTestId('button-unified-chat').click();
    await expect(page.getByTestId('unified-chat-interface')).toBeVisible();
  });

  test('should view agent health status', async ({ page }) => {
    await page.goto('/life-ceo');
    await expect(page.getByTestId('agent-health-monitor')).toBeVisible();
  });
});
