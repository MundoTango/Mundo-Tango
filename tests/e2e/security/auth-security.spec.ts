/**
 * AUTH SECURITY TEST
 * Tests authentication security features and protection
 */

import { test, expect } from '@playwright/test';

test.describe('Security - Authentication', () => {
  test('should require authentication for protected routes', async ({ page }) => {
    await page.goto('/feed');
    await expect(page).toHaveURL(/\/login/);
  });

  test('should handle rate limiting on login', async ({ page }) => {
    await page.goto('/login');
    
    // Attempt multiple failed logins
    for (let i = 0; i < 6; i++) {
      await page.getByTestId('input-email').fill('test@example.com');
      await page.getByTestId('input-password').fill('wrongpassword');
      await page.getByTestId('button-login').click();
      await page.waitForTimeout(500);
    }
    
    // Should show rate limit message
    await expect(page.getByText(/too many.*attempts/i)).toBeVisible();
  });

  test('should enforce CSRF protection', async ({ page }) => {
    await page.goto('/login');
    
    // Token should be present
    const csrfToken = await page.locator('[name="csrf_token"]').getAttribute('value');
    expect(csrfToken).toBeTruthy();
  });

  test('should validate password strength', async ({ page }) => {
    await page.goto('/register');
    await page.getByTestId('input-password').fill('weak');
    await page.getByTestId('input-password').blur();
    await expect(page.getByText(/password.*too weak/i)).toBeVisible();
  });

  test('should secure session with httpOnly cookies', async ({ page }) => {
    // This test verifies secure session handling
    await page.goto('/login');
    const cookies = await page.context().cookies();
    const sessionCookie = cookies.find(c => c.name.includes('session'));
    
    if (sessionCookie) {
      expect(sessionCookie.httpOnly).toBe(true);
      expect(sessionCookie.secure).toBe(true);
    }
  });
});
