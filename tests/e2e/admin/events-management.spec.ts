/**
 * ADMIN EVENTS MANAGEMENT TEST
 * Tests event approval and management
 */

import { test, expect } from '@playwright/test';

test.describe('Admin - Events Management', () => {
  test('should view all events', async ({ page }) => {
    await page.goto('/admin/events');
    await expect(page.getByTestId('events-table')).toBeVisible();
  });

  test('should approve pending event', async ({ page }) => {
    await page.goto('/admin/events');
    await page.getByTestId('filter-pending').click();
    await page.getByTestId('button-approve-event').first().click();
    await expect(page.getByText(/approved/i)).toBeVisible();
  });

  test('should reject event', async ({ page }) => {
    await page.goto('/admin/events');
    await page.getByTestId('button-reject-event').first().click();
    await page.getByTestId('textarea-rejection-reason').fill('Does not meet guidelines');
    await page.getByTestId('button-confirm-reject').click();
    await expect(page.getByText(/rejected/i)).toBeVisible();
  });

  test('should feature event', async ({ page }) => {
    await page.goto('/admin/events');
    await page.getByTestId('button-feature-event').first().click();
    await expect(page.getByText(/featured/i)).toBeVisible();
  });
});
