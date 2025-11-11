/**
 * ADMIN USER MANAGEMENT TEST
 * Tests user listing, editing, and moderation
 */

import { test, expect } from '@playwright/test';

test.describe('Admin - User Management', () => {
  test('should view users list', async ({ page }) => {
    await page.goto('/admin/users');
    await expect(page.getByTestId('users-table')).toBeVisible();
  });

  test('should search users', async ({ page }) => {
    await page.goto('/admin/users');
    await page.getByTestId('input-search-users').fill('test');
    await page.waitForLoadState('networkidle');
  });

  test('should filter users by role', async ({ page }) => {
    await page.goto('/admin/users');
    await page.getByTestId('filter-premium').click();
    await page.waitForLoadState('networkidle');
  });

  test('should edit user details', async ({ page }) => {
    await page.goto('/admin/users');
    await page.getByTestId('button-edit-user').first().click();
    await expect(page.getByTestId('user-edit-form')).toBeVisible();
  });

  test('should suspend user', async ({ page }) => {
    await page.goto('/admin/users');
    await page.getByTestId('button-user-menu').first().click();
    await page.getByTestId('button-suspend-user').click();
    await page.getByTestId('button-confirm-suspend').click();
    await expect(page.getByText(/suspended/i)).toBeVisible();
  });

  test('should delete user', async ({ page }) => {
    await page.goto('/admin/users');
    await page.getByTestId('button-user-menu').first().click();
    await page.getByTestId('button-delete-user').click();
    await page.getByTestId('input-confirm-delete').fill('DELETE');
    await page.getByTestId('button-confirm-delete').click();
    await expect(page.getByText(/deleted/i)).toBeVisible();
  });
});
