import { test, expect } from '@playwright/test';

test.describe('Public Marketing Site Journey', () => {
  test('should navigate through all public pages', async ({ page }) => {
    // Start at home
    await page.goto('/');
    await expect(page).toHaveTitle(/Mundo Tango/i);
    await expect(page.getByTestId('nav-public')).toBeVisible();
    
    // Verify home page content
    await expect(page.getByRole('heading', { name: /welcome/i, level: 1 })).toBeVisible();
    
    // Navigate to About
    await page.getByTestId('link-about').click();
    await page.waitForURL('**/about');
    await expect(page.getByRole('heading', { name: /about/i })).toBeVisible();
    
    // Navigate to Pricing
    await page.getByTestId('link-pricing').click();
    await page.waitForURL('**/pricing');
    await expect(page.getByRole('heading', { name: /pricing/i })).toBeVisible();
    
    // Navigate to FAQ
    await page.getByTestId('link-faq').click();
    await page.waitForURL('**/faq');
    await expect(page.getByRole('heading', { name: /faq/i })).toBeVisible();
    
    // Navigate to Contact
    await page.getByTestId('link-contact').click();
    await page.waitForURL('**/contact');
    await expect(page.getByRole('heading', { name: /contact/i })).toBeVisible();
    
    // Navigate to Dance Styles
    await page.getByTestId('link-dance-styles').click();
    await page.waitForURL('**/dance-styles');
    await expect(page.getByRole('heading', { name: /dance styles/i })).toBeVisible();
  });

  test('should toggle theme', async ({ page }) => {
    await page.goto('/');
    
    // Get initial theme
    const html = page.locator('html');
    const initialTheme = await html.getAttribute('class');
    
    // Click theme toggle
    await page.getByTestId('button-theme-toggle').click();
    await page.waitForTimeout(500);
    
    // Verify theme changed
    const newTheme = await html.getAttribute('class');
    expect(newTheme).not.toBe(initialTheme);
  });

  test('should navigate to login from public pages', async ({ page }) => {
    await page.goto('/');
    
    // Click LOGIN button in navbar
    await page.getByTestId('button-login').click();
    await page.waitForURL('**/login');
    
    // Verify login page
    await expect(page.getByRole('heading', { name: /login/i })).toBeVisible();
    await expect(page.getByTestId('input-username')).toBeVisible();
    await expect(page.getByTestId('input-password')).toBeVisible();
  });

  test('should navigate to register from public pages', async ({ page }) => {
    await page.goto('/');
    
    // Navigate to register
    await page.goto('/register');
    await page.waitForURL('**/register');
    
    // Verify register page
    await expect(page.getByRole('heading', { name: /register/i })).toBeVisible();
    await expect(page.getByTestId('input-username')).toBeVisible();
    await expect(page.getByTestId('input-email')).toBeVisible();
    await expect(page.getByTestId('input-password')).toBeVisible();
  });

  test('should show consistent navigation across all public pages', async ({ page }) => {
    const publicPages = ['/', '/about', '/pricing', '/faq', '/contact', '/dance-styles'];
    
    for (const pagePath of publicPages) {
      await page.goto(pagePath);
      
      // Verify navbar is visible
      await expect(page.getByTestId('nav-public')).toBeVisible();
      
      // Verify all nav links are present
      await expect(page.getByTestId('link-home')).toBeVisible();
      await expect(page.getByTestId('link-about')).toBeVisible();
      await expect(page.getByTestId('link-pricing')).toBeVisible();
      await expect(page.getByTestId('link-faq')).toBeVisible();
      await expect(page.getByTestId('link-contact')).toBeVisible();
      await expect(page.getByTestId('link-dance-styles')).toBeVisible();
      
      // Verify LOGIN button is visible
      await expect(page.getByTestId('button-login')).toBeVisible();
      
      // Verify theme toggle is visible
      await expect(page.getByTestId('button-theme-toggle')).toBeVisible();
    }
  });
});
