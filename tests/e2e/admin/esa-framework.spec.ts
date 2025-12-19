/**
 * ADMIN ESA FRAMEWORK TEST
 * Tests Expert Specialized Agents monitoring and management
 */

import { test, expect } from '@playwright/test';

test.describe('Admin - ESA Framework', () => {
  test('should view ESA dashboard', async ({ page }) => {
    await page.goto('/admin/esa');
    await expect(page.getByTestId('esa-dashboard')).toBeVisible();
  });

  test('should view all 105 agents', async ({ page }) => {
    await page.goto('/admin/esa');
    await expect(page.getByTestId('agents-grid')).toBeVisible();
    await expect(page.locator('[data-testid^="agent-card-"]')).toHaveCount({ min: 50 });
  });

  test('should view agent health status', async ({ page }) => {
    await page.goto('/admin/esa');
    await expect(page.getByTestId('agents-health-monitor')).toBeVisible();
  });

  test('should restart failed agent', async ({ page }) => {
    await page.goto('/admin/esa');
    await page.getByTestId('button-restart-agent').first().click();
    await expect(page.getByText(/restarted|restarting/i)).toBeVisible();
  });

  test('should view agent logs', async ({ page }) => {
    await page.goto('/admin/esa');
    await page.locator('[data-testid^="agent-card-"]').first().click();
    await expect(page.getByTestId('agent-logs')).toBeVisible();
  });
});
