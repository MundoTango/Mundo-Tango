import { test, expect } from '@playwright/test';

test.describe('Feed Page Login and Access', () => {
  test('should login as Super Admin and access Feed page without errors', async ({ page }) => {
    // Enable console error capture
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Capture page errors
    const pageErrors: Error[] = [];
    page.on('pageerror', error => {
      pageErrors.push(error);
    });

    // Navigate to homepage
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Click login button
    await page.click('button:has-text("Login")');
    await page.waitForSelector('input[type="email"]');

    // Fill login form
    await page.fill('input[type="email"]', 'admin@mundotango.life');
    await page.fill('input[type="password"]', 'admin123');

    // Submit login
    await page.click('button[type="submit"]:has-text("Login")');
    
    // Wait for navigation after login
    await page.waitForURL('/feed', { timeout: 10000 });
    await page.waitForLoadState('networkidle');

    // Wait for feed to load
    await page.waitForSelector('[data-testid="feed-page"]', { timeout: 10000 });

    // Check for React.Children.only error
    const hasChildrenOnlyError = consoleErrors.some(
      err => err.includes('React.Children.only') || err.includes('expected to receive a single React element child')
    );
    const hasPageError = pageErrors.some(
      err => err.message.includes('React.Children.only') || err.message.includes('expected to receive a single React element child')
    );

    // Take screenshot
    await page.screenshot({ path: 'tests/screenshots/feed-page.png', fullPage: true });

    // Assertions
    expect(hasChildrenOnlyError, `Console errors found: ${consoleErrors.join(', ')}`).toBe(false);
    expect(hasPageError, `Page errors found: ${pageErrors.map(e => e.message).join(', ')}`).toBe(false);
    
    // Verify page loaded correctly
    await expect(page.locator('[data-testid="feed-page"]')).toBeVisible();
    
    console.log('✅ Feed page loaded successfully without React.Children.only errors');
  });
});
