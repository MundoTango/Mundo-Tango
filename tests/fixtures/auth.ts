import { test as base } from '@playwright/test';

/**
 * Authentication Fixture for Mundo Tango Tests
 * Provides automatic login with hardcoded admin credentials
 * No manual login required - tests start on /feed ready to go
 */

export const ADMIN_CREDENTIALS = {
  email: 'admin@mundotango.life',
  password: 'admin123',
};

export const test = base.extend({
  page: async ({ page }, use) => {
    // Auto-login before each test
    await page.goto('/');
    
    // Check if already logged in
    const isLoggedIn = await page.locator('[data-testid="sidebar-item-memories"]').isVisible().catch(() => false);
    
    if (!isLoggedIn) {
      // Click login button
      await page.click('button:has-text("Login")').catch(() => {});
      await page.waitForSelector('input[type="email"]', { timeout: 5000 });

      // Fill login form
      await page.fill('input[type="email"]', ADMIN_CREDENTIALS.email);
      await page.fill('input[type="password"]', ADMIN_CREDENTIALS.password);

      // Submit login
      await page.click('button[type="submit"]:has-text("Login")');
      
      // Wait for successful login
      await page.waitForURL('/feed', { timeout: 10000 });
      await page.waitForLoadState('networkidle');
    }
    
    // Navigate to /feed (Memories page)
    await page.goto('/feed');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000); // Allow UI to settle
    
    // Pass authenticated page to test
    await use(page);
  },
});

export { expect } from '@playwright/test';
