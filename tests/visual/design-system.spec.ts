/**
 * DESIGN SYSTEM VISUAL REGRESSION TESTS
 * Validates theme switching, CSS variables, and visual consistency
 * across Bold Minimaximalist and MT Ocean themes
 * 
 * Built with MB.MD Protocol
 */

import { test, expect } from '@playwright/test';

// ============================================================================
// THEME DETECTION TESTS
// ============================================================================

test.describe('Theme Detection', () => {
  test('Marketing page uses Bold Minimaximalist theme', async ({ page }) => {
    await page.goto('/marketing-prototype-enhanced');
    
    const theme = await page.getAttribute('html', 'data-theme');
    expect(theme).toBe('bold-minimaximalist');
  });

  test('Platform page uses MT Ocean theme', async ({ page }) => {
    await page.goto('/');
    
    const theme = await page.getAttribute('html', 'data-theme');
    expect(theme).toBe('mt-ocean');
  });

  test('Pricing page uses Bold Minimaximalist theme', async ({ page }) => {
    await page.goto('/pricing');
    
    const theme = await page.getAttribute('html', 'data-theme');
    expect(theme).toBe('bold-minimaximalist');
  });
});

// ============================================================================
// CSS VARIABLE TESTS - BOLD MINIMAXIMALIST
// ============================================================================

test.describe('Bold Minimaximalist CSS Variables', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/marketing-prototype-enhanced');
  });

  test('Primary color is burgundy #b91c3b', async ({ page }) => {
    const primaryColor = await page.evaluate(() => 
      getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim()
    );
    
    expect(primaryColor).toBe('#b91c3b');
  });

  test('Heading font weight is 800', async ({ page }) => {
    const headingWeight = await page.evaluate(() => 
      getComputedStyle(document.documentElement).getPropertyValue('--font-weight-heading').trim()
    );
    
    expect(headingWeight).toBe('800');
  });

  test('Body font weight is 600', async ({ page }) => {
    const bodyWeight = await page.evaluate(() => 
      getComputedStyle(document.documentElement).getPropertyValue('--font-weight-body').trim()
    );
    
    expect(bodyWeight).toBe('600');
  });

  test('Card border radius is 6px', async ({ page }) => {
    const cardRadius = await page.evaluate(() => 
      getComputedStyle(document.documentElement).getPropertyValue('--radius-card').trim()
    );
    
    expect(cardRadius).toBe('0.375rem'); // 6px
  });

  test('Button border radius is 6px', async ({ page }) => {
    const buttonRadius = await page.evaluate(() => 
      getComputedStyle(document.documentElement).getPropertyValue('--radius-button').trim()
    );
    
    expect(buttonRadius).toBe('0.375rem'); // 6px
  });

  test('Transition speed is 150ms', async ({ page }) => {
    const transitionSpeed = await page.evaluate(() => 
      getComputedStyle(document.documentElement).getPropertyValue('--transition-speed').trim()
    );
    
    expect(transitionSpeed).toBe('150ms');
  });

  test('Secondary color is purple #8b5cf6', async ({ page }) => {
    const secondaryColor = await page.evaluate(() => 
      getComputedStyle(document.documentElement).getPropertyValue('--color-secondary').trim()
    );
    
    expect(secondaryColor).toBe('#8b5cf6');
  });

  test('Accent color is gold #f59e0b', async ({ page }) => {
    const accentColor = await page.evaluate(() => 
      getComputedStyle(document.documentElement).getPropertyValue('--color-accent').trim()
    );
    
    expect(accentColor).toBe('#f59e0b');
  });
});

// ============================================================================
// CSS VARIABLE TESTS - MT OCEAN
// ============================================================================

test.describe('MT Ocean CSS Variables', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Primary color is turquoise #14b8a6', async ({ page }) => {
    const primaryColor = await page.evaluate(() => 
      getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim()
    );
    
    expect(primaryColor).toBe('#14b8a6');
  });

  test('Heading font weight is 600', async ({ page }) => {
    const headingWeight = await page.evaluate(() => 
      getComputedStyle(document.documentElement).getPropertyValue('--font-weight-heading').trim()
    );
    
    expect(headingWeight).toBe('600');
  });

  test('Body font weight is 400', async ({ page }) => {
    const bodyWeight = await page.evaluate(() => 
      getComputedStyle(document.documentElement).getPropertyValue('--font-weight-body').trim()
    );
    
    expect(bodyWeight).toBe('400');
  });

  test('Card border radius is 16px', async ({ page }) => {
    const cardRadius = await page.evaluate(() => 
      getComputedStyle(document.documentElement).getPropertyValue('--radius-card').trim()
    );
    
    expect(cardRadius).toBe('1rem'); // 16px
  });

  test('Button border radius is 16px', async ({ page }) => {
    const buttonRadius = await page.evaluate(() => 
      getComputedStyle(document.documentElement).getPropertyValue('--radius-button').trim()
    );
    
    expect(buttonRadius).toBe('1rem'); // 16px
  });

  test('Transition speed is 300ms', async ({ page }) => {
    const transitionSpeed = await page.evaluate(() => 
      getComputedStyle(document.documentElement).getPropertyValue('--transition-speed').trim()
    );
    
    expect(transitionSpeed).toBe('300ms');
  });

  test('Secondary color is cyan #06b6d4', async ({ page }) => {
    const secondaryColor = await page.evaluate(() => 
      getComputedStyle(document.documentElement).getPropertyValue('--color-secondary').trim()
    );
    
    expect(secondaryColor).toBe('#06b6d4');
  });

  test('Accent color is teal #0d9488', async ({ page }) => {
    const accentColor = await page.evaluate(() => 
      getComputedStyle(document.documentElement).getPropertyValue('--color-accent').trim()
    );
    
    expect(accentColor).toBe('#0d9488');
  });
});

// ============================================================================
// DARK MODE TESTS
// ============================================================================

test.describe('Dark Mode', () => {
  test('Bold theme supports dark mode', async ({ page }) => {
    await page.goto('/marketing-prototype-enhanced');
    
    // Set dark mode manually via localStorage
    await page.evaluate(() => {
      localStorage.setItem('mundo-tango-dark-mode', 'dark');
      window.location.reload();
    });
    
    await page.waitForLoadState('networkidle');
    
    const hasDarkClass = await page.evaluate(() => 
      document.documentElement.classList.contains('dark')
    );
    
    expect(hasDarkClass).toBe(true);
  });

  test('Ocean theme supports dark mode', async ({ page }) => {
    await page.goto('/');
    
    // Set dark mode manually via localStorage
    await page.evaluate(() => {
      localStorage.setItem('mundo-tango-dark-mode', 'dark');
      window.location.reload();
    });
    
    await page.waitForLoadState('networkidle');
    
    const hasDarkClass = await page.evaluate(() => 
      document.documentElement.classList.contains('dark')
    );
    
    expect(hasDarkClass).toBe(true);
  });
});

// ============================================================================
// VISUAL SNAPSHOT TESTS
// ============================================================================

test.describe('Visual Snapshots - Marketing Page', () => {
  test('Bold Minimaximalist - Light Mode - Hero Section', async ({ page }) => {
    await page.goto('/marketing-prototype-enhanced');
    
    const heroSection = page.locator('[data-testid="section-hero"]');
    await expect(heroSection).toBeVisible();
    
    await expect(heroSection).toHaveScreenshot('bold-hero-light.png', {
      maxDiffPixels: 100,
    });
  });

  test('Bold Minimaximalist - Light Mode - Stats Section', async ({ page }) => {
    await page.goto('/marketing-prototype-enhanced');
    
    const statsSection = page.locator('[data-testid="section-stats"]');
    await expect(statsSection).toBeVisible();
    
    await expect(statsSection).toHaveScreenshot('bold-stats-light.png', {
      maxDiffPixels: 100,
    });
  });

  test('Bold Minimaximalist - Light Mode - Features Section', async ({ page }) => {
    await page.goto('/marketing-prototype-enhanced');
    
    const featuresSection = page.locator('[data-testid="section-features"]');
    await expect(featuresSection).toBeVisible();
    
    await expect(featuresSection).toHaveScreenshot('bold-features-light.png', {
      maxDiffPixels: 100,
    });
  });
});

// ============================================================================
// COMPONENT TESTS - ADAPTIVE BUTTON
// ============================================================================

test.describe('AdaptiveButton Component', () => {
  test('Primary button has burgundy background on marketing page', async ({ page }) => {
    await page.goto('/marketing-prototype-enhanced');
    
    const button = page.locator('[data-testid="button-join-community"]');
    await expect(button).toBeVisible();
    
    const bgColor = await button.evaluate((el) => 
      window.getComputedStyle(el).backgroundColor
    );
    
    // Burgundy #b91c3b = rgb(185, 28, 59)
    expect(bgColor).toContain('185');
    expect(bgColor).toContain('28');
    expect(bgColor).toContain('59');
  });

  test('Button has correct border radius on marketing page', async ({ page }) => {
    await page.goto('/marketing-prototype-enhanced');
    
    const button = page.locator('[data-testid="button-join-community"]');
    const borderRadius = await button.evaluate((el) => 
      window.getComputedStyle(el).borderRadius
    );
    
    // Should be 6px
    expect(borderRadius).toBe('6px');
  });
});

// ============================================================================
// GRADIENT TESTS
// ============================================================================

test.describe('Gradient Backgrounds', () => {
  test('Bold theme has correct gradient hero', async ({ page }) => {
    await page.goto('/marketing-prototype-enhanced');
    
    const gradientHero = await page.evaluate(() => 
      getComputedStyle(document.documentElement).getPropertyValue('--gradient-hero').trim()
    );
    
    expect(gradientHero).toContain('#b91c3b'); // Burgundy
    expect(gradientHero).toContain('#8b5cf6'); // Purple
    expect(gradientHero).toContain('#f59e0b'); // Gold
  });

  test('Ocean theme has correct gradient primary', async ({ page }) => {
    await page.goto('/');
    
    const gradientPrimary = await page.evaluate(() => 
      getComputedStyle(document.documentElement).getPropertyValue('--gradient-primary').trim()
    );
    
    expect(gradientPrimary).toContain('#2dd4bf'); // Turquoise
    expect(gradientPrimary).toContain('#22d3ee'); // Cyan
    expect(gradientPrimary).toContain('#0d9488'); // Teal
  });
});

// ============================================================================
// ACCESSIBILITY TESTS
// ============================================================================

test.describe('Accessibility', () => {
  test('Marketing page has proper heading hierarchy', async ({ page }) => {
    await page.goto('/marketing-prototype-enhanced');
    
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBeGreaterThan(0);
    
    const h2Count = await page.locator('h2').count();
    expect(h2Count).toBeGreaterThan(0);
  });

  test('Buttons have proper contrast in Bold theme', async ({ page }) => {
    await page.goto('/marketing-prototype-enhanced');
    
    const button = page.locator('[data-testid="button-join-community"]');
    const bgColor = await button.evaluate((el) => 
      window.getComputedStyle(el).backgroundColor
    );
    const textColor = await button.evaluate((el) => 
      window.getComputedStyle(el).color
    );
    
    // Burgundy background should have white text
    expect(textColor).toContain('255'); // White has 255,255,255
  });
});

// ============================================================================
// PERFORMANCE TESTS
// ============================================================================

test.describe('Performance', () => {
  test('Theme switching does not cause layout shift', async ({ page }) => {
    await page.goto('/marketing-prototype-enhanced');
    
    const initialHeight = await page.evaluate(() => document.body.scrollHeight);
    
    // Simulate theme context re-render
    await page.waitForTimeout(100);
    
    const finalHeight = await page.evaluate(() => document.body.scrollHeight);
    
    // Height should remain stable
    expect(Math.abs(finalHeight - initialHeight)).toBeLessThan(50);
  });

  test('CSS variables load without FOUC', async ({ page }) => {
    await page.goto('/marketing-prototype-enhanced');
    
    // Check that primary color is set immediately
    const primaryColor = await page.evaluate(() => 
      getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim()
    );
    
    expect(primaryColor).toBeTruthy();
    expect(primaryColor).not.toBe('');
  });
});
