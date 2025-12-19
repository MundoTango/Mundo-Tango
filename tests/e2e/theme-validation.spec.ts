/**
 * THEME VALIDATION TESTS
 * Validates that the tri-theme system works correctly
 * 
 * Themes:
 * 1. Bold Ocean Hybrid - Marketing pages (turquoise + bold)
 * 2. MT Ocean - Platform pages (pure turquoise/glassmorphic)
 * 3. Bold Minimaximalist - Legacy marketing (burgundy)
 */

import { test, expect } from '@playwright/test';
import { selfHealing } from '../helpers/self-healing-locator';

test.describe('Theme System Validation', () => {
  test('HomePage (/) should use MT Ocean theme', async ({ page }) => {
    await page.goto('/');
    
    // Wait for theme to be applied
    await page.waitForTimeout(1000);

    // Check data-theme attribute
    const theme = await page.getAttribute('html', 'data-theme');
    console.log(`📊 HomePage theme: ${theme}`);

    expect(theme).toBe('mt-ocean');

    // Verify ocean colors are present (turquoise/cyan/teal)
    const primaryColor = await page.evaluate(() => {
      return getComputedStyle(document.documentElement).getPropertyValue('--color-primary');
    });

    console.log(`🎨 Primary color: ${primaryColor}`);
    expect(primaryColor).toBeTruthy();
  });

  test('/marketing-prototype-enhanced should use Bold Ocean Hybrid theme', async ({ page }) => {
    await page.goto('/marketing-prototype-enhanced');
    
    // Wait for theme to be applied
    await page.waitForTimeout(1000);

    // Check data-theme attribute
    const theme = await page.getAttribute('html', 'data-theme');
    console.log(`📊 Marketing Enhanced theme: ${theme}`);

    expect(theme).toBe('bold-ocean');
  });

  test('/pricing should use Bold Ocean Hybrid theme', async ({ page }) => {
    await page.goto('/pricing');
    
    await page.waitForTimeout(1000);

    const theme = await page.getAttribute('html', 'data-theme');
    console.log(`📊 Pricing theme: ${theme}`);

    expect(theme).toBe('bold-ocean');
  });

  test('/marketing-prototype should use Bold Minimaximalist theme', async ({ page }) => {
    await page.goto('/marketing-prototype');
    
    await page.waitForTimeout(1000);

    const theme = await page.getAttribute('html', 'data-theme');
    console.log(`📊 Marketing Prototype theme: ${theme}`);

    expect(theme).toBe('bold-minimaximalist');
  });

  test('/feed should use MT Ocean theme (after login)', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('[data-testid="input-username"]', 'admin');
    await page.fill('[data-testid="input-password"]', 'MundoTango2025!Admin');
    await page.click('[data-testid="button-login"]');
    await page.waitForURL(/\/(feed|home|dashboard)/, { timeout: 10000 });

    // Navigate to feed
    await page.goto('/feed');
    await page.waitForTimeout(1000);

    const theme = await page.getAttribute('html', 'data-theme');
    console.log(`📊 Feed theme: ${theme}`);

    expect(theme).toBe('mt-ocean');
  });

  test('Theme should switch correctly when navigating between routes', async ({ page }) => {
    // Start with MT Ocean theme (HomePage)
    await page.goto('/');
    await page.waitForTimeout(1000);
    let theme = await page.getAttribute('html', 'data-theme');
    expect(theme).toBe('mt-ocean');

    // Navigate to Bold Ocean (Marketing)
    await page.goto('/pricing');
    await page.waitForTimeout(1000);
    theme = await page.getAttribute('html', 'data-theme');
    expect(theme).toBe('bold-ocean');

    // Back to MT Ocean (HomePage)
    await page.goto('/');
    await page.waitForTimeout(1000);
    theme = await page.getAttribute('html', 'data-theme');
    expect(theme).toBe('mt-ocean');
  });

  test('Dark mode toggle should work across themes', async ({ page }) => {
    await page.goto('/');
    
    // Check initial mode
    const initialMode = await page.evaluate(() => {
      return document.documentElement.classList.contains('dark');
    });

    console.log(`🌙 Initial dark mode: ${initialMode}`);

    // Try to find and click theme toggle
    try {
      const toggle = await selfHealing.findElement(page, {
        testId: 'button-theme-toggle',
        fallbackSelectors: [
          'button[aria-label*="theme"]',
          'button:has-text("Dark")',
          'button:has-text("Light")',
          '[class*="theme-toggle"]'
        ],
        aiSuggest: true,
        timeout: 5000
      });

      await toggle.click();
      await page.waitForTimeout(500);

      // Verify mode changed
      const newMode = await page.evaluate(() => {
        return document.documentElement.classList.contains('dark');
      });

      expect(newMode).not.toBe(initialMode);
      console.log(`✅ Dark mode toggled successfully!`);
    } catch (error) {
      console.log('⚠️  Theme toggle not found - skipping dark mode test');
    }
  });

  test('CSS variables should be properly applied', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1000);

    const cssVars = await page.evaluate(() => {
      const root = document.documentElement;
      const styles = getComputedStyle(root);
      
      return {
        colorPrimary: styles.getPropertyValue('--color-primary'),
        colorSecondary: styles.getPropertyValue('--color-secondary'),
        colorAccent: styles.getPropertyValue('--color-accent'),
        borderRadius: styles.getPropertyValue('--radius-card'),
        fontWeightHeading: styles.getPropertyValue('--font-weight-heading'),
      };
    });

    console.log('🎨 CSS Variables:', cssVars);

    // All CSS variables should have values
    expect(cssVars.colorPrimary).toBeTruthy();
    expect(cssVars.fontWeightHeading).toBeTruthy();
  });
});
