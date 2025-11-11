/**
 * WORKSHOPS BOOKING TEST
 * Tests workshop enrollment and registration
 */

import { test, expect } from '@playwright/test';

test.describe('Workshops - Booking', () => {
  test('should view workshops directory', async ({ page }) => {
    await page.goto('/workshops');
    await expect(page.getByTestId('workshops-container')).toBeVisible();
  });

  test('should view workshop details', async ({ page }) => {
    await page.goto('/workshops/1');
    await expect(page.getByTestId('workshop-title')).toBeVisible();
    await expect(page.getByTestId('workshop-description')).toBeVisible();
    await expect(page.getByTestId('workshop-price')).toBeVisible();
  });

  test('should enroll in workshop', async ({ page }) => {
    await page.goto('/workshops/1');
    await page.getByTestId('button-enroll').click();
    await expect(page.getByText(/enrolled|registered/i)).toBeVisible();
  });

  test('should unenroll from workshop', async ({ page }) => {
    await page.goto('/workshops/1');
    await page.getByTestId('button-unenroll').click();
    await page.getByTestId('button-confirm-unenroll').click();
    await expect(page.getByText(/unenrolled/i)).toBeVisible();
  });
});
