import { test, expect } from '@playwright/test';
import { generateTestUser } from './fixtures/test-data';
import { verifyToast, waitForApiResponse } from './helpers/test-helpers';

test.describe('Registration and Authentication Journey', () => {
  test('should register a new user successfully', async ({ page }) => {
    const testUser = generateTestUser();
    
    await page.goto('/register');
    
    // Fill registration form
    await page.getByTestId('input-username').fill(testUser.username);
    await page.getByTestId('input-email').fill(testUser.email);
    await page.getByTestId('input-password').fill(testUser.password);
    await page.getByTestId('input-name').fill(testUser.name);
    
    // Submit form
    const responsePromise = waitForApiResponse(page, '/api/auth/register');
    await page.getByTestId('button-register').click();
    await responsePromise;
    
    // Should redirect to feed or onboarding
    await page.waitForURL(/\/(feed|onboarding|profile)/);
  });

  test('should show validation errors for invalid registration', async ({ page }) => {
    await page.goto('/register');
    
    // Try to submit empty form
    await page.getByTestId('button-register').click();
    
    // Verify validation errors appear
    await expect(page.getByText(/username is required/i)).toBeVisible();
    await expect(page.getByText(/email is required/i)).toBeVisible();
    await expect(page.getByText(/password is required/i)).toBeVisible();
  });

  test('should login with existing credentials', async ({ page }) => {
    // First register a user
    const testUser = generateTestUser();
    await page.request.post('/api/auth/register', {
      data: {
        username: testUser.username,
        email: testUser.email,
        password: testUser.password,
        name: testUser.name,
      },
    });
    
    // Go to login page
    await page.goto('/login');
    
    // Fill login form
    await page.getByTestId('input-username').fill(testUser.username);
    await page.getByTestId('input-password').fill(testUser.password);
    
    // Submit login
    const responsePromise = waitForApiResponse(page, '/api/auth/login');
    await page.getByTestId('button-login').click();
    await responsePromise;
    
    // Should redirect to feed
    await page.waitForURL('**/feed');
    
    // Verify user is logged in
    await expect(page.getByTestId('nav-authenticated')).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');
    
    // Try invalid credentials
    await page.getByTestId('input-username').fill('invaliduser');
    await page.getByTestId('input-password').fill('wrongpassword');
    await page.getByTestId('button-login').click();
    
    // Verify error message
    await expect(page.getByText(/invalid credentials/i)).toBeVisible();
  });

  test('should logout successfully', async ({ page }) => {
    // Register and login
    const testUser = generateTestUser();
    await page.request.post('/api/auth/register', {
      data: {
        username: testUser.username,
        email: testUser.email,
        password: testUser.password,
        name: testUser.name,
      },
    });
    
    await page.goto('/login');
    await page.getByTestId('input-username').fill(testUser.username);
    await page.getByTestId('input-password').fill(testUser.password);
    await page.getByTestId('button-login').click();
    await page.waitForURL('**/feed');
    
    // Logout
    await page.getByTestId('button-user-menu').click();
    await page.getByTestId('button-logout').click();
    
    // Should redirect to public page
    await page.waitForURL(/\/(|login|home)/);
  });
});
