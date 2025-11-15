import { test, expect } from '@playwright/test';

test.describe('Screen Reader Compatibility', () => {
  test('Page has proper heading hierarchy', async ({ page }) => {
    await page.goto('/mr-blue');
    
    const headings = await page.evaluate(() => {
      const h1 = document.querySelectorAll('h1').length;
      const h2 = document.querySelectorAll('h2').length;
      const h3 = document.querySelectorAll('h3').length;
      return { h1, h2, h3 };
    });
    
    // Should have exactly one h1
    expect(headings.h1).toBe(1);
  });
  
  test('Landmarks are properly defined', async ({ page }) => {
    await page.goto('/mr-blue');
    
    const landmarks = await page.evaluate(() => ({
      main: document.querySelectorAll('[role="main"], main').length,
      navigation: document.querySelectorAll('[role="navigation"], nav').length,
      complementary: document.querySelectorAll('[role="complementary"]').length,
    }));
    
    // Should have at least one main landmark
    expect(landmarks.main).toBeGreaterThanOrEqual(1);
  });
  
  test('Live regions for dynamic content', async ({ page }) => {
    await page.goto('/mr-blue');
    
    // Check for aria-live regions
    const liveRegions = await page.evaluate(() => 
      document.querySelectorAll('[aria-live]').length
    );
    
    // Should have live regions for chat messages
    expect(liveRegions).toBeGreaterThan(0);
  });
});
