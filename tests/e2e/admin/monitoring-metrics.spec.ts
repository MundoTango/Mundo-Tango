/**
 * ADMIN MONITORING & METRICS TEST
 * Tests Prometheus metrics and Grafana dashboards
 */

import { test, expect } from '@playwright/test';

test.describe('Admin - Monitoring & Metrics', () => {
  test('should view monitoring dashboard', async ({ page }) => {
    await page.goto('/admin/monitoring');
    await expect(page.getByTestId('monitoring-dashboard')).toBeVisible();
  });

  test('should view system health', async ({ page }) => {
    await page.goto('/admin/monitoring');
    await expect(page.getByTestId('system-health')).toBeVisible();
    await expect(page.getByTestId('metric-cpu-usage')).toBeVisible();
    await expect(page.getByTestId('metric-memory-usage')).toBeVisible();
  });

  test('should view application metrics', async ({ page }) => {
    await page.goto('/admin/monitoring/app');
    await expect(page.getByTestId('app-metrics')).toBeVisible();
    await expect(page.getByTestId('metric-request-rate')).toBeVisible();
    await expect(page.getByTestId('metric-error-rate')).toBeVisible();
  });

  test('should view custom metrics', async ({ page }) => {
    await page.goto('/admin/monitoring/custom');
    await expect(page.locator('[data-testid^="metric-"]')).toHaveCount({ min: 30 });
  });

  test('should view alerts', async ({ page }) => {
    await page.goto('/admin/monitoring/alerts');
    await expect(page.getByTestId('alerts-list')).toBeVisible();
  });

  test('should create alert rule', async ({ page }) => {
    await page.goto('/admin/monitoring/alerts');
    await page.getByTestId('button-create-alert').click();
    await page.getByTestId('input-alert-name').fill('High CPU Usage');
    await page.getByTestId('input-threshold').fill('80');
    await page.getByTestId('button-save-alert').click();
    await expect(page.getByText(/created/i)).toBeVisible();
  });
});
