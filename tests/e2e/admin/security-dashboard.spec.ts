/**
 * ADMIN SECURITY DASHBOARD TEST
 * Tests security monitoring and threat detection
 */

import { test, expect } from '@playwright/test';

test.describe('Admin - Security Dashboard', () => {
  test('should view security dashboard', async ({ page }) => {
    await page.goto('/admin/security');
    await expect(page.getByTestId('security-dashboard')).toBeVisible();
  });

  test('should view security alerts', async ({ page }) => {
    await page.goto('/admin/security');
    await expect(page.getByTestId('security-alerts')).toBeVisible();
  });

  test('should view failed login attempts', async ({ page }) => {
    await page.goto('/admin/security/failed-logins');
    await expect(page.getByTestId('failed-logins-list')).toBeVisible();
  });

  test('should block IP address', async ({ page }) => {
    await page.goto('/admin/security/ip-blacklist');
    await page.getByTestId('button-add-ip').click();
    await page.getByTestId('input-ip-address').fill('192.168.1.100');
    await page.getByTestId('textarea-reason').fill('Suspicious activity');
    await page.getByTestId('button-block-ip').click();
    await expect(page.getByText(/blocked/i)).toBeVisible();
  });

  test('should view blocked IPs', async ({ page }) => {
    await page.goto('/admin/security/ip-blacklist');
    await expect(page.getByTestId('blocked-ips-list')).toBeVisible();
  });

  test('should unblock IP address', async ({ page }) => {
    await page.goto('/admin/security/ip-blacklist');
    await page.getByTestId('button-unblock-ip').first().click();
    await expect(page.getByText(/unblocked/i)).toBeVisible();
  });
});
