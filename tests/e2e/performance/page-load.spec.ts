/**
 * PAGE LOAD PERFORMANCE TEST
 * Tests page load times and performance metrics
 */

import { test, expect } from '@playwright/test';

test.describe('Performance - Page Load', () => {
  test('should load homepage quickly', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    const loadTime = Date.now() - startTime;
    
    // Page should load in under 3 seconds
    expect(loadTime).toBeLessThan(3000);
    
    // Content should be visible
    await expect(page.getByTestId('homepage-container')).toBeVisible();
  });

  test('should load feed page quickly', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/feed');
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(3000);
    await expect(page.getByTestId('feed-container')).toBeVisible();
  });

  test('should lazy load images', async ({ page }) => {
    await page.goto('/gallery');
    
    // Scroll to trigger lazy loading
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);
    
    // Images should be loading
    const images = page.locator('img[data-testid^="gallery-image-"]');
    await expect(images.first()).toBeVisible();
  });

  test('should compress assets', async ({ page }) => {
    const response = await page.goto('/');
    const contentEncoding = response?.headers()['content-encoding'];
    
    // Should use gzip or brotli compression
    expect(['gzip', 'br']).toContain(contentEncoding);
  });

  test('should cache static assets', async ({ page }) => {
    await page.goto('/');
    
    // Navigate away and back
    await page.goto('/about');
    await page.goto('/');
    
    // Second load should be faster (cached)
    const performanceMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return navigation.domContentLoadedEventEnd - navigation.fetchStart;
    });
    
    expect(performanceMetrics).toBeLessThan(2000);
  });
});
