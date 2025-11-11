/**
 * ADMIN IMPERSONATION TEST
 * Tests god-level user impersonation for troubleshooting
 */

import { test, expect } from '@playwright/test';

test.describe('Admin - User Impersonation', () => {
  test('should access impersonation tool', async ({ page }) => {
    await page.goto('/admin/users');
    await page.getByTestid('button-user-menu').first().click();
    await expect(page.getByTestId('button-impersonate')).toBeVisible();
  });

  test('should impersonate user', async ({ page }) => {
    await page.goto('/admin/users');
    await page.getByTestId('button-user-menu').first().click();
    await page.getByTestId('button-impersonate').click();
    await page.getByTestId('button-confirm-impersonate').click();
    
    // Should see impersonation banner
    await expect(page.getByTestId('impersonation-banner')).toBeVisible();
    await expect(page.getByText(/viewing as/i)).toBeVisible();
  });

  test('should browse as impersonated user', async ({ page }) => {
    await page.goto('/admin/users');
    await page.getByTestId('button-user-menu').first().click();
    await page.getByTestId('button-impersonate').click();
    await page.getByTestId('button-confirm-impersonate').click();
    
    // Navigate to feed as user
    await page.goto('/feed');
    await expect(page.getByTestId('impersonation-banner')).toBeVisible();
  });

  test('should exit impersonation', async ({ page }) => {
    await page.goto('/admin/users');
    await page.getByTestId('button-user-menu').first().click();
    await page.getByTestId('button-impersonate').click();
    await page.getByTestId('button-confirm-impersonate').click();
    
    // Exit impersonation
    await page.getByTestId('button-exit-impersonation').click();
    await expect(page.getByTestId('impersonation-banner')).not.toBeVisible();
  });

  test('should log impersonation activity', async ({ page }) => {
    await page.goto('/admin/users');
    await page.getByTestId('button-user-menu').first().click();
    await page.getByTestId('button-impersonate').click();
    await page.getByTestId('button-confirm-impersonate').click();
    await page.getByTestId('button-exit-impersonation').click();
    
    // Check audit log
    await page.goto('/admin/audit-logs');
    await page.getByTestId('filter-impersonation').click();
    await expect(page.locator('[data-testid^="log-entry-"]')).toHaveCount({ min: 1 });
  });
});
