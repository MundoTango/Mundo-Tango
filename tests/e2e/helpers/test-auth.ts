/**
 * Test Authentication Helper
 * Provides authenticated sessions for Playwright tests
 */

import { Page } from '@playwright/test';

export interface TestUser {
  email: string;
  password: string;
  role: 'user' | 'admin' | 'organizer' | 'professional';
}

export const testUsers: TestUser[] = [
  { email: 'testuser1@mundotango.com', password: 'TestPassword123!', role: 'user' },
  { email: 'testuser2@mundotango.com', password: 'TestPassword123!', role: 'user' },
  { email: 'admin@mundotango.com', password: 'AdminPassword123!', role: 'admin' },
  { email: 'organizer@mundotango.com', password: 'OrganizerPassword123!', role: 'organizer' },
  { email: 'professional@mundotango.com', password: 'ProfessionalPassword123!', role: 'professional' },
];

/**
 * Login as a test user
 */
export async function loginAsTestUser(page: Page, user: TestUser): Promise<boolean> {
  try {
    await page.goto('/login');
    await page.waitForTimeout(1000);
    
    // Fill login form
    const emailInput = page.locator('[data-testid="input-email"], input[type="email"], input[name="email"]');
    const passwordInput = page.locator('[data-testid="input-password"], input[type="password"], input[name="password"]');
    const submitButton = page.locator('[data-testid="login-button"], button[type="submit"]');
    
    if (await emailInput.isVisible()) {
      await emailInput.fill(user.email);
      await passwordInput.fill(user.password);
      await submitButton.click();
      await page.waitForTimeout(2000);
      
      // Check if login succeeded (redirected away from login page)
      const currentUrl = page.url();
      return !currentUrl.includes('/login');
    }
    
    return false;
  } catch (error) {
    console.error('Login failed:', error);
    return false;
  }
}

/**
 * Logout current user
 */
export async function logout(page: Page): Promise<void> {
  try {
    const logoutButton = page.locator('[data-testid="logout-button"]');
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
      await page.waitForTimeout(1000);
    } else {
      // Try navigating to logout
      await page.goto('/logout');
      await page.waitForTimeout(1000);
    }
  } catch (error) {
    console.error('Logout failed:', error);
  }
}

/**
 * Check if user is logged in
 */
export async function isLoggedIn(page: Page): Promise<boolean> {
  try {
    const userMenu = page.locator('[data-testid="user-menu"], [data-testid="profile-avatar"]');
    return await userMenu.isVisible({ timeout: 2000 });
  } catch {
    return false;
  }
}

/**
 * Get test user by role
 */
export function getTestUserByRole(role: TestUser['role']): TestUser {
  const user = testUsers.find(u => u.role === role);
  if (!user) {
    throw new Error(`No test user found for role: ${role}`);
  }
  return user;
}

/**
 * Setup authenticated test session
 */
export async function setupAuthenticatedSession(page: Page, role: TestUser['role'] = 'user'): Promise<boolean> {
  const user = getTestUserByRole(role);
  return await loginAsTestUser(page, user);
}
