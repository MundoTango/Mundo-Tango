/**
 * EVENT CHECK-IN TEST
 * Tests QR code check-in system for events
 */

import { test, expect } from '@playwright/test';

test.describe('Event Check-In', () => {
  test('should access check-in page', async ({ page }) => {
    await page.goto('/events/1/check-in');
    await expect(page.getByTestId('checkin-container')).toBeVisible();
  });

  test('should show QR code scanner', async ({ page }) => {
    await page.goto('/events/1/check-in');
    await expect(page.getByTestId('qr-scanner')).toBeVisible();
  });

  test('should manual check-in by email', async ({ page }) => {
    await page.goto('/events/1/check-in');
    await page.getByTestId('input-attendee-email').fill('test@example.com');
    await page.getByTestId('button-manual-checkin').click();
    await expect(page.getByText(/checked.*in/i)).toBeVisible();
  });

  test('should view attendee list', async ({ page }) => {
    await page.goto('/events/1/check-in');
    await expect(page.getByTestId('attendees-list')).toBeVisible();
  });
});
