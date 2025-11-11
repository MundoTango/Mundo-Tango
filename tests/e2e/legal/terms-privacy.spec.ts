/**
 * LEGAL PAGES TEST
 * Tests terms of service, privacy policy, and legal pages
 */

import { test, expect } from '@playwright/test';

test.describe('Legal - Terms & Privacy', () => {
  test('should view terms of service', async ({ page }) => {
    await page.goto('/terms');
    await expect(page.getByTestId('terms-container')).toBeVisible();
    await expect(page.getByRole('heading', { name: /terms of service/i })).toBeVisible();
  });

  test('should view privacy policy', async ({ page }) => {
    await page.goto('/privacy');
    await expect(page.getByTestId('privacy-container')).toBeVisible();
    await expect(page.getByRole('heading', { name: /privacy policy/i })).toBeVisible();
  });

  test('should view cookie policy', async ({ page }) => {
    await page.goto('/cookies');
    await expect(page.getByTestId('cookies-container')).toBeVisible();
  });

  test('should view community guidelines', async ({ page }) => {
    await page.goto('/community-guidelines');
    await expect(page.getByTestId('guidelines-container')).toBeVisible();
  });

  test('should accept cookie consent', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('button-accept-cookies').click();
    await expect(page.getByTestId('cookie-banner')).not.toBeVisible();
  });

  test('should customize cookie preferences', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('button-customize-cookies').click();
    await expect(page.getByTestId('cookie-preferences-modal')).toBeVisible();
  });
});
