/**
 * ADMIN WORKERS MONITOR TEST
 * Tests BullMQ workers and background jobs
 */

import { test, expect } from '@playwright/test';

test.describe('Admin - Workers Monitor', () => {
  test('should view workers dashboard', async ({ page }) => {
    await page.goto('/admin/workers');
    await expect(page.getByTestId('workers-dashboard')).toBeVisible();
  });

  test('should view 6 worker queues', async ({ page }) => {
    await page.goto('/admin/workers');
    await expect(page.locator('[data-testid^="worker-queue-"]')).toHaveCount({ min: 6 });
  });

  test('should view job queue status', async ({ page }) => {
    await page.goto('/admin/workers');
    await expect(page.getByTestId('queue-email')).toBeVisible();
    await expect(page.getByTestId('queue-notifications')).toBeVisible();
  });

  test('should view active jobs', async ({ page }) => {
    await page.goto('/admin/workers/jobs');
    await expect(page.getByTestId('active-jobs-list')).toBeVisible();
  });

  test('should retry failed job', async ({ page }) => {
    await page.goto('/admin/workers/failed');
    await page.getByTestId('button-retry-job').first().click();
    await expect(page.getByText(/retrying|queued/i)).toBeVisible();
  });

  test('should pause worker queue', async ({ page }) => {
    await page.goto('/admin/workers');
    await page.getByTestId('button-pause-queue').first().click();
    await expect(page.getByText(/paused/i)).toBeVisible();
  });
});
