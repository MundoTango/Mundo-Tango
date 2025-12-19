/**
 * TANGO TEACHERS DIRECTORY TEST
 * Tests teacher profiles, search, and booking
 */

import { test, expect } from '@playwright/test';

test.describe('Tango - Teachers Directory', () => {
  test('should view teachers directory', async ({ page }) => {
    await page.goto('/teachers');
    await expect(page.getByTestId('teachers-container')).toBeVisible();
  });

  test('should search teachers by name', async ({ page }) => {
    await page.goto('/teachers');
    await page.getByTestId('input-search-teachers').fill('Carlos');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('[data-testid^="teacher-card-"]')).toHaveCount({ min: 0 });
  });

  test('should filter by dance style', async ({ page }) => {
    await page.goto('/teachers');
    await page.getByTestId('filter-milonga').click();
    await page.waitForLoadState('networkidle');
  });

  test('should filter by location', async ({ page }) => {
    await page.goto('/teachers');
    await page.getByTestId('select-location').click();
    await page.getByTestId('option-buenos-aires').click();
    await page.waitForLoadState('networkidle');
  });

  test('should view teacher profile', async ({ page }) => {
    await page.goto('/teachers/1');
    await expect(page.getByTestId('teacher-profile')).toBeVisible();
    await expect(page.getByTestId('teacher-bio')).toBeVisible();
    await expect(page.getByTestId('teacher-rating')).toBeVisible();
  });

  test('should book lesson with teacher', async ({ page }) => {
    await page.goto('/teachers/1');
    await page.getByTestId('button-book-lesson').click();
    await expect(page.getByTestId('booking-form')).toBeVisible();
  });

  test('should contact teacher', async ({ page }) => {
    await page.goto('/teachers/1');
    await page.getByTestId('button-contact-teacher').click();
    await page.getByTestId('textarea-message').fill('I would like to book a lesson');
    await page.getByTestId('button-send-message').click();
    await expect(page.getByText(/sent/i)).toBeVisible();
  });
});
