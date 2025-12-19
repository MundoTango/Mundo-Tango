/**
 * RECRUITING AGENT TEST
 * Tests HR recruiting and candidate management
 */

import { test, expect } from '@playwright/test';

test.describe('HR - Recruiting Agent', () => {
  test('should access recruiting agent', async ({ page }) => {
    await page.goto('/admin/agents/recruiting');
    await expect(page.getByTestId('recruiting-agent-container')).toBeVisible();
  });

  test('should create job posting', async ({ page }) => {
    await page.goto('/admin/agents/recruiting');
    await page.getByTestId('button-create-job').click();
    await page.getByTestId('input-job-title').fill('Community Manager');
    await page.getByTestId('textarea-job-description').fill('Manage online tango community');
    await page.getByTestId('button-post-job').click();
    await expect(page.getByText(/posted/i)).toBeVisible();
  });

  test('should view applications', async ({ page }) => {
    await page.goto('/admin/agents/recruiting/jobs/1');
    await expect(page.getByTestId('applications-list')).toBeVisible();
  });

  test('should review candidate', async ({ page }) => {
    await page.goto('/admin/agents/recruiting/jobs/1');
    await page.locator('[data-testid^="application-"]').first().click();
    await expect(page.getByTestId('candidate-profile')).toBeVisible();
  });

  test('should schedule interview', async ({ page }) => {
    await page.goto('/admin/agents/recruiting/applications/1');
    await page.getByTestId('button-schedule-interview').click();
    await page.getByTestId('input-interview-time').fill('2025-12-20T14:00');
    await page.getByTestId('button-confirm-schedule').click();
    await expect(page.getByText(/scheduled/i)).toBeVisible();
  });
});
