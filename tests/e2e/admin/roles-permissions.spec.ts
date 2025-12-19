/**
 * ADMIN ROLES & PERMISSIONS TEST
 * Tests 8-tier RBAC system
 */

import { test, expect } from '@playwright/test';

test.describe('Admin - Roles & Permissions', () => {
  test('should view roles list', async ({ page }) => {
    await page.goto('/admin/roles');
    await expect(page.getByTestId('roles-list')).toBeVisible();
  });

  test('should view 8 role tiers', async ({ page }) => {
    await page.goto('/admin/roles');
    await expect(page.locator('[data-testid^="role-"]')).toHaveCount({ min: 8 });
  });

  test('should create custom role', async ({ page }) => {
    await page.goto('/admin/roles');
    await page.getByTestId('button-create-role').click();
    await page.getByTestId('input-role-name').fill('Event Coordinator');
    await page.getByTestId('button-save-role').click();
    await expect(page.getByText(/created/i)).toBeVisible();
  });

  test('should assign permissions to role', async ({ page }) => {
    await page.goto('/admin/roles/1');
    await page.getByTestId('checkbox-permission-manage-events').click();
    await page.getByTestId('button-save-permissions').click();
    await expect(page.getByText(/saved/i)).toBeVisible();
  });

  test('should assign role to user', async ({ page }) => {
    await page.goto('/admin/users');
    await page.getByTestId('button-edit-user').first().click();
    await page.getByTestId('select-role').click();
    await page.getByTestId('option-moderator').click();
    await page.getByTestId('button-save-user').click();
    await expect(page.getByText(/updated/i)).toBeVisible();
  });
});
