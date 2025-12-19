/**
 * SEO AGENT TEST
 * Tests SEO agent for search optimization recommendations
 */

import { test, expect } from '@playwright/test';

test.describe('Marketing - SEO Agent', () => {
  test('should access SEO agent', async ({ page }) => {
    await page.goto('/admin/agents/seo');
    await expect(page.getByTestId('seo-agent-container')).toBeVisible();
  });

  test('should view SEO analysis', async ({ page }) => {
    await page.goto('/admin/agents/seo');
    await expect(page.getByTestId('seo-score')).toBeVisible();
    await expect(page.getByTestId('recommendations')).toBeVisible();
  });

  test('should analyze page SEO', async ({ page }) => {
    await page.goto('/admin/agents/seo');
    await page.getByTestId('input-url').fill('/events');
    await page.getByTestId('button-analyze').click();
    await expect(page.getByTestId('analysis-results')).toBeVisible();
  });

  test('should view keyword suggestions', async ({ page }) => {
    await page.goto('/admin/agents/seo');
    await expect(page.getByTestId('keyword-suggestions')).toBeVisible();
  });
});
