import { test, expect } from '@playwright/test';

/**
 * Comprehensive Authentication E2E Test Suite
 * Covers: Login, Register, Password Reset, Session Management, Error Handling
 */

test.describe('Authentication - Complete Flow', () => {
  
  test.describe('User Registration', () => {
    
    test('should register new user successfully', async ({ page }) => {
      await page.goto('/register');
      
      const timestamp = Date.now();
      const email = `testuser${timestamp}@mundotango.test`;
      
      await page.fill('[data-testid="input-email"]', email);
      await page.fill('[data-testid="input-password"]', 'SecurePass123!');
      await page.fill('[data-testid="input-username"]', `user${timestamp}`);
      await page.fill('[data-testid="input-full-name"]', 'Test User');
      
      await page.click('[data-testid="button-register"]');
      
      // Should redirect to feed or onboarding
      await expect(page).toHaveURL(/\/(feed|onboarding)/);
    });
    
    test('should show validation errors for invalid email', async ({ page }) => {
      await page.goto('/register');
      
      await page.fill('[data-testid="input-email"]', 'invalid-email');
      await page.fill('[data-testid="input-password"]', 'SecurePass123!');
      await page.click('[data-testid="button-register"]');
      
      await expect(page.locator('text=Invalid email')).toBeVisible();
    });
    
    test('should show validation errors for weak password', async ({ page }) => {
      await page.goto('/register');
      
      const timestamp = Date.now();
      await page.fill('[data-testid="input-email"]', `test${timestamp}@test.com`);
      await page.fill('[data-testid="input-password"]', '123'); // Too weak
      await page.click('[data-testid="button-register"]');
      
      await expect(page.locator('text=/password.*8 characters/i')).toBeVisible();
    });
    
    test('should prevent duplicate email registration', async ({ page }) => {
      await page.goto('/register');
      
      // Use known existing email (admin) from environment secrets
      await page.fill('[data-testid="input-email"]', process.env.TEST_ADMIN_EMAIL || 'admin@mundotango.life');
      await page.fill('[data-testid="input-password"]', 'SecurePass123!');
      await page.fill('[data-testid="input-username"]', `user${Date.now()}`);
      await page.click('[data-testid="button-register"]');
      
      await expect(page.locator('text=/email.*already.*exists/i')).toBeVisible();
    });
  });
  
  test.describe('User Login', () => {
    
    test('should login with valid credentials', async ({ page }) => {
      await page.goto('/login');
      
      await page.fill('[data-testid="input-email"]', process.env.TEST_ADMIN_EMAIL || 'admin@mundotango.life');
      await page.fill('[data-testid="input-password"]', process.env.TEST_ADMIN_PASSWORD || 'admin123');
      await page.click('[data-testid="button-login"]');
      
      // Should redirect to feed
      await expect(page).toHaveURL(/\/feed/);
      
      // Should show user profile indicator
      await expect(page.locator('[data-testid="button-profile"]')).toBeVisible();
    });
    
    test('should show error for invalid credentials', async ({ page }) => {
      await page.goto('/login');
      
      await page.fill('[data-testid="input-email"]', process.env.TEST_ADMIN_EMAIL || 'admin@mundotango.life');
      await page.fill('[data-testid="input-password"]', 'wrongpassword');
      await page.click('[data-testid="button-login"]');
      
      await expect(page.locator('text=/invalid.*credentials/i')).toBeVisible();
    });
    
    test('should show error for non-existent user', async ({ page }) => {
      await page.goto('/login');
      
      await page.fill('[data-testid="input-email"]', 'nonexistent@test.com');
      await page.fill('[data-testid="input-password"]', 'password123');
      await page.click('[data-testid="button-login"]');
      
      await expect(page.locator('text=/invalid.*credentials/i')).toBeVisible();
    });
    
    test('should persist session across page reloads', async ({ page }) => {
      // Login using environment secrets
      await page.goto('/login');
      await page.fill('[data-testid="input-email"]', process.env.TEST_ADMIN_EMAIL || 'admin@mundotango.life');
      await page.fill('[data-testid="input-password"]', process.env.TEST_ADMIN_PASSWORD || 'admin123');
      await page.click('[data-testid="button-login"]');
      
      await expect(page).toHaveURL(/\/feed/);
      
      // Reload page
      await page.reload();
      
      // Should still be logged in
      await expect(page).toHaveURL(/\/feed/);
      await expect(page.locator('[data-testid="button-profile"]')).toBeVisible();
    });
  });
  
  test.describe('Password Reset', () => {
    
    test('should send password reset email', async ({ page }) => {
      await page.goto('/reset-password');
      
      await page.fill('[data-testid="input-email"]', process.env.TEST_ADMIN_EMAIL || 'admin@mundotango.life');
      await page.click('[data-testid="button-reset-password"]');
      
      await expect(page.locator('text=/email.*sent/i')).toBeVisible();
    });
    
    test('should show error for non-existent email', async ({ page }) => {
      await page.goto('/reset-password');
      
      await page.fill('[data-testid="input-email"]', 'nonexistent@test.com');
      await page.click('[data-testid="button-reset-password"]');
      
      // For security, might show same success message
      // Or specific error - adjust based on implementation
      await expect(page.locator('text=/email.*sent/i')).toBeVisible();
    });
  });
  
  test.describe('Logout', () => {
    
    test('should logout successfully', async ({ page }) => {
      // Login first
      await page.goto('/login');
      await page.fill('[data-testid="input-email"]', 'admin@mundotango.life');
      await page.fill('[data-testid="input-password"]', 'admin123');
      await page.click('[data-testid="button-login"]');
      
      await expect(page).toHaveURL(/\/feed/);
      
      // Logout
      await page.click('[data-testid="button-profile"]');
      await page.click('[data-testid="button-logout"]');
      
      // Should redirect to login or home
      await expect(page).toHaveURL(/\/(login|home|$)/);
      
      // Try to access protected page
      await page.goto('/feed');
      
      // Should redirect back to login
      await expect(page).toHaveURL(/\/login/);
    });
  });
  
  test.describe('Protected Routes', () => {
    
    test('should redirect to login when accessing protected route while logged out', async ({ page }) => {
      await page.goto('/feed');
      
      await expect(page).toHaveURL(/\/login/);
    });
    
    test('should allow access to protected route when logged in', async ({ page }) => {
      // Login
      await page.goto('/login');
      await page.fill('[data-testid="input-email"]', 'admin@mundotango.life');
      await page.fill('[data-testid="input-password"]', 'admin123');
      await page.click('[data-testid="button-login"]');
      
      // Access protected route
      await page.goto('/feed');
      
      await expect(page).toHaveURL(/\/feed/);
    });
  });
});
