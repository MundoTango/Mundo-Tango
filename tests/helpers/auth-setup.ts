import { Page } from '@playwright/test';

/**
 * Authentication Helper - Session Reuse for Fast Tests
 * Provides quick login using hardcoded admin credentials
 */

export const ADMIN_CREDENTIALS = {
  email: 'admin@mundotango.life',
  password: 'admin123',
};

/**
 * Set up authenticated session for test
 * Uses admin credentials for consistency
 */
export async function setupAuthenticatedSession(page: Page) {
  // Navigate to home
  await page.goto('/');
  
  // Check if already logged in by looking for authenticated UI
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
  
  // Ensure we're on an authenticated page
  await page.goto('/feed');
  await page.waitForLoadState('networkidle');
}
