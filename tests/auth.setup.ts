/**
 * MB.MD Pattern 50: Pre-Authenticated Playwright Testing
 * Auth Setup - Logs in once and saves session state for reuse
 * 
 * Usage: Run once before test suite to create .auth/user.json
 * Command: npx playwright test --project=setup
 */

import { test as setup, expect } from '@playwright/test';
import { AUTH_STATE_PATH, testUsers } from './e2e/helpers/test-auth';

const adminUser = testUsers.find(u => u.role === 'admin')!;

setup('authenticate as admin', async ({ page }) => {
  console.log('[Auth Setup] Starting admin authentication...');
  
  await page.goto('/login');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1000);
  
  const emailInput = page.locator('[data-testid="input-email"], input[type="email"], input[name="email"]').first();
  const passwordInput = page.locator('[data-testid="input-password"], input[type="password"], input[name="password"]').first();
  const submitButton = page.locator('[data-testid="login-button"], button[type="submit"]').first();
  
  await expect(emailInput).toBeVisible({ timeout: 10000 });
  
  await emailInput.fill(adminUser.email);
  await passwordInput.fill(adminUser.password);
  await submitButton.click();
  
  await page.waitForURL(url => !url.pathname.includes('/login'), { timeout: 15000 });
  
  console.log('[Auth Setup] Login successful, saving session state...');
  
  await page.context().storageState({ path: AUTH_STATE_PATH });
  
  console.log(`[Auth Setup] ✅ Session saved to ${AUTH_STATE_PATH}`);
});
