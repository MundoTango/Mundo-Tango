/**
 * PERFORMANCE TESTS - PAGE LOAD
 * CRITICAL: Validates that pages load within acceptable time limits
 * 
 * Targets:
 * - Landing/Login pages: <3s
 * - Authenticated pages: <5s
 * - API responses: <500ms
 */

import { test, expect } from '@playwright/test';

test.describe('Page Load Performance Tests', () => {
  test('Landing page should load in <3 seconds', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    
    const loadTime = Date.now() - startTime;
    console.log(`📊 Landing page loaded in: ${loadTime}ms`);

    expect(loadTime).toBeLessThan(3000);
  });

  test('Login page should load in <3 seconds', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/login');
    await page.waitForLoadState('domcontentloaded');
    
    const loadTime = Date.now() - startTime;
    console.log(`📊 Login page loaded in: ${loadTime}ms`);

    expect(loadTime).toBeLessThan(3000);
  });

  test('Register page should load in <3 seconds', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/register');
    await page.waitForLoadState('domcontentloaded');
    
    const loadTime = Date.now() - startTime;
    console.log(`📊 Register page loaded in: ${loadTime}ms`);

    expect(loadTime).toBeLessThan(3000);
  });

  test('Feed page should load in <5 seconds (authenticated)', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('[data-testid="input-username"]', 'admin');
    await page.fill('[data-testid="input-password"]', 'MundoTango2025!Admin');
    await page.click('[data-testid="button-login"]');
    await page.waitForURL(/\/(feed|home|dashboard)/, { timeout: 10000 });

    // Measure feed load time
    const startTime = Date.now();
    await page.goto('/feed');
    await page.waitForLoadState('domcontentloaded');
    
    const loadTime = Date.now() - startTime;
    console.log(`📊 Feed page loaded in: ${loadTime}ms`);

    expect(loadTime).toBeLessThan(5000);
  });

  test('Events page should load in <5 seconds', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('[data-testid="input-username"]', 'admin');
    await page.fill('[data-testid="input-password"]', 'MundoTango2025!Admin');
    await page.click('[data-testid="button-login"]');
    await page.waitForURL(/\/(feed|home|dashboard)/, { timeout: 10000 });

    // Measure events load time
    const startTime = Date.now();
    await page.goto('/events');
    await page.waitForLoadState('domcontentloaded');
    
    const loadTime = Date.now() - startTime;
    console.log(`📊 Events page loaded in: ${loadTime}ms`);

    expect(loadTime).toBeLessThan(5000);
  });

  test('Profile page should load in <5 seconds', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('[data-testid="input-username"]', 'admin');
    await page.fill('[data-testid="input-password"]', 'MundoTango2025!Admin');
    await page.click('[data-testid="button-login"]');
    await page.waitForURL(/\/(feed|home|dashboard)/, { timeout: 10000 });

    // Measure profile load time
    const startTime = Date.now();
    await page.goto('/profile/15'); // God user ID
    await page.waitForLoadState('domcontentloaded');
    
    const loadTime = Date.now() - startTime;
    console.log(`📊 Profile page loaded in: ${loadTime}ms`);

    expect(loadTime).toBeLessThan(5000);
  });

  test('Should not have excessive DOM size', async ({ page }) => {
    await page.goto('/');
    
    const domSize = await page.evaluate(() => {
      return document.querySelectorAll('*').length;
    });

    console.log(`📊 DOM elements: ${domSize}`);

    // Warn if > 1500 elements (performance concern)
    expect(domSize).toBeLessThan(2000);
  });

  test('Should load critical CSS inline', async ({ page }) => {
    await page.goto('/');
    
    const hasInlineStyles = await page.evaluate(() => {
      const styleTag = document.querySelector('style');
      return styleTag !== null && styleTag.textContent && styleTag.textContent.length > 100;
    });

    expect(hasInlineStyles).toBe(true);
  });
});
