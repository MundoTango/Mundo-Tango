import { Page, expect } from '@playwright/test';

/**
 * MT Ocean Theme Validation Helper
 * Utilities for verifying MT Ocean glassmorphic design
 */

export const MT_OCEAN_COLORS = {
  PRIMARY: 'rgb(64, 224, 208)', // Turquoise #40E0D0
  PRIMARY_DARK: 'rgb(30, 144, 255)', // Dodger Blue #1E90FF
  GRADIENT_START: 'rgba(64, 224, 208',
  GRADIENT_END: 'rgba(30, 144, 255',
};

export async function verifyMTOceanTheme(page: Page) {
  // Check for glassmorphic elements (backdrop-blur)
  const glassmorphicElements = await page.locator('[style*="backdrop-filter"]').count();
  expect(glassmorphicElements).toBeGreaterThan(0);
}

export async function verifyTurquoiseAccents(page: Page) {
  // Check for turquoise color in page
  const body = await page.innerHTML('body');
  const hasTurquoise = body.includes('40E0D0') || 
                       body.includes('rgb(64, 224, 208)') ||
                       body.includes('turquoise');
  
  expect(hasTurquoise).toBeTruthy();
}

export async function verifyGlassmorphicCard(page: Page, testId: string) {
  const card = page.getByTestId(testId);
  
  // Get computed styles
  const backdropFilter = await card.evaluate(el => {
    return window.getComputedStyle(el).backdropFilter;
  });
  
  // Should have blur effect
  expect(backdropFilter).toContain('blur');
}

export async function verifyGradientBackground(page: Page, testId?: string) {
  const element = testId ? page.getByTestId(testId) : page.locator('body');
  
  const background = await element.evaluate(el => {
    return window.getComputedStyle(el).background;
  });
  
  // Should have gradient
  expect(background.toLowerCase()).toMatch(/gradient|linear/);
}

export async function verifyDarkModeToggle(page: Page) {
  // Find dark mode toggle button
  const toggleButton = page.getByTestId('button-theme-toggle');
  await expect(toggleButton).toBeVisible();
  
  // Toggle dark mode
  await toggleButton.click();
  await page.waitForTimeout(500);
  
  // Verify dark class is applied
  const htmlElement = page.locator('html');
  const isDark = await htmlElement.evaluate(el => el.classList.contains('dark'));
  
  expect(isDark).toBeTruthy();
  
  // Toggle back to light
  await toggleButton.click();
  await page.waitForTimeout(500);
}

export async function verifyResponsiveDesign(page: Page) {
  const viewports = [
    { width: 375, height: 667, name: 'mobile' },
    { width: 768, height: 1024, name: 'tablet' },
    { width: 1920, height: 1080, name: 'desktop' },
  ];
  
  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    await page.waitForTimeout(300);
    
    // Verify page renders without horizontal scroll
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.body.scrollWidth > window.innerWidth;
    });
    
    expect(hasHorizontalScroll).toBeFalsy();
  }
  
  // Reset to default
  await page.setViewportSize({ width: 1920, height: 1080 });
}

export async function verifyThemeConsistency(page: Page, routes: string[]) {
  for (const route of routes) {
    await page.goto(route);
    await page.waitForLoadState('networkidle');
    
    // Verify MT Ocean theme is present
    await verifyMTOceanTheme(page);
    await verifyTurquoiseAccents(page);
  }
}

export async function verifyAnimations(page: Page, testId: string) {
  const element = page.getByTestId(testId);
  
  // Check for transition or animation
  const hasAnimation = await element.evaluate(el => {
    const styles = window.getComputedStyle(el);
    return styles.transition !== 'none' || styles.animation !== 'none';
  });
  
  expect(hasAnimation).toBeTruthy();
}
