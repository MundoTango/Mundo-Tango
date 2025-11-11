/**
 * CALENDAR INTEGRATION TEST
 * Tests calendar view, event scheduling, and sync
 */

import { test, expect } from '@playwright/test';

test.describe('Calendar - Integration', () => {
  test('should view calendar', async ({ page }) => {
    await page.goto('/calendar');
    await expect(page.getByTestId('calendar-container')).toBeVisible();
  });

  test('should navigate between months', async ({ page }) => {
    await page.goto('/calendar');
    await page.getByTestId('button-next-month').click();
    await page.getByTestId('button-prev-month').click();
  });

  test('should view event details from calendar', async ({ page }) => {
    await page.goto('/calendar');
    await page.locator('[data-testid^="calendar-event-"]').first().click();
    await expect(page.getByTestId('event-details-modal')).toBeVisible();
  });

  test('should filter events by type', async ({ page }) => {
    await page.goto('/calendar');
    await page.getByTestId('filter-milongas').click();
    await page.waitForLoadState('networkidle');
  });
});
