/**
 * PERFORMANCE AGENT TEST
 * Tests employee performance tracking and reviews
 */

import { test, expect } from '@playwright/test';

test.describe('HR - Performance Agent', () => {
  test('should access performance agent', async ({ page }) => {
    await page.goto('/admin/agents/performance');
    await expect(page.getByTestId('performance-agent-container')).toBeVisible();
  });

  test('should create performance review', async ({ page }) => {
    await page.goto('/admin/agents/performance');
    await page.getByTestId('button-create-review').click();
    await page.getByTestId('select-employee').click();
    await page.getByTestId('option-employee-1').click();
    await page.getByTestId('button-save-review').click();
    await expect(page.getByText(/created/i)).toBeVisible();
  });

  test('should submit review feedback', async ({ page }) => {
    await page.goto('/admin/agents/performance/reviews/1');
    await page.getByTestId('textarea-feedback').fill('Great performance this quarter');
    await page.getByTestId('select-rating').click();
    await page.getByTestId('option-exceeds-expectations').click();
    await page.getByTestId('button-submit-review').click();
    await expect(page.getByText(/submitted/i)).toBeVisible();
  });

  test('should view team performance', async ({ page }) => {
    await page.goto('/admin/agents/performance/team');
    await expect(page.getByTestId('team-metrics')).toBeVisible();
  });
});
