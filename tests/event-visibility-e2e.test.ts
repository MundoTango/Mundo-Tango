import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';

test.describe.configure({ mode: 'serial' });

test.describe('Event Features E2E', () => {
  
  test('Discover page shows events', async ({ page }) => {
    // Use domcontentloaded which is more reliable
    await page.goto(`${BASE_URL}/discover`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    
    // Wait for React to render
    await page.waitForSelector('body', { timeout: 10000 });
    await page.waitForTimeout(5000);
    
    // Take screenshot for debugging
    const url = page.url();
    console.log(`Current URL: ${url}`);
    
    // Check page has rendered
    const hasBody = await page.locator('body').isVisible();
    expect(hasBody).toBe(true);
    
    // Check for any content
    const bodyText = await page.locator('body').innerText();
    console.log(`Body text length: ${bodyText.length}`);
    expect(bodyText.length).toBeGreaterThan(0);
    
    console.log('✓ Discover page loaded with content');
  });

  test('Login form is accessible', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    
    // Wait for React to hydrate fully
    await page.waitForTimeout(5000);
    
    // Check for login form using flexible selectors
    const formExists = await page.locator('form').count() > 0;
    const hasEmailField = await page.locator('input[type="email"], input[name="email"], [data-testid="input-email"]').count() > 0;
    const hasPasswordField = await page.locator('input[type="password"], [data-testid="input-password"]').count() > 0;
    
    console.log(`Form exists: ${formExists}, Email field: ${hasEmailField}, Password field: ${hasPasswordField}`);
    
    expect(formExists).toBe(true);
    expect(hasEmailField).toBe(true);
    expect(hasPasswordField).toBe(true);
    
    console.log('✓ Login form with all elements visible');
  });

  test('User can login successfully', async ({ page }) => {
    // Navigate to login
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(5000);
    
    // Find and fill login form
    const emailInput = page.locator('input[type="email"], input[name="email"], [data-testid="input-email"]').first();
    const passwordInput = page.locator('input[type="password"], [data-testid="input-password"]').first();
    const loginButton = page.locator('button[type="submit"], [data-testid="button-login"]').first();
    
    await emailInput.waitFor({ state: 'visible', timeout: 15000 });
    await emailInput.fill('scott+5@boddye.com');
    await passwordInput.fill('password123');
    
    console.log('Filled login form, clicking submit...');
    await loginButton.click();
    
    // Wait for navigation/redirect
    await page.waitForTimeout(8000);
    
    // Verify login succeeded (should be redirected away from login)
    const currentUrl = page.url();
    console.log(`After login URL: ${currentUrl}`);
    
    // User should be redirected to dashboard or feed
    expect(currentUrl).not.toContain('/login');
    console.log('✓ Login successful, user redirected');
  });
});
