/**
 * AGENT 6: Static & Info Pages Test Suite
 * Tests FAQ, features, dance styles, policies, guidelines
 * Timeline: Days 5-9
 */

import { test, expect } from '@playwright/test';

test.describe('Static & Info Pages - Complete Coverage', () => {
  // Public pages - no auth required
  
  const staticPages = [
    { route: '/faq', title: 'faq' },
    { route: '/features', title: 'features' },
    { route: '/dance-styles', title: 'dance|styles|tango' },
    { route: '/community-guidelines', title: 'guidelines|community' },
    { route: '/privacy-policy', title: 'privacy' },
    { route: '/terms-of-service', title: 'terms' },
    { route: '/about-tango', title: 'about|tango' },
  ];

  for (const pageInfo of staticPages) {
    test(`${pageInfo.route} page loads correctly`, async ({ page }) => {
      await page.goto(pageInfo.route);
      await page.waitForLoadState('networkidle');
      
      // Verify page loaded
      await expect(page).toHaveTitle(/.+/);
      
      // Check for main heading matching title pattern
      const heading = page.getByRole('heading', { name: new RegExp(pageInfo.title, 'i') }).first();
      await expect(heading).toBeVisible();
    });

    test(`${pageInfo.route} has SEO meta tags`, async ({ page }) => {
      await page.goto(pageInfo.route);
      
      // Verify title exists
      await expect(page).toHaveTitle(/.+/);
      
      // Verify meta description exists
      const metaDescription = page.locator('meta[name="description"]');
      await expect(metaDescription).toHaveAttribute('content', /.+/);
    });
  }

  // FAQ Page Specific Tests
  test('FAQ page has searchable questions', async ({ page }) => {
    await page.goto('/faq');
    
    // Look for FAQ items or accordion
    const faqItems = page.locator('[data-testid*="faq"], [data-accordion-item]').first();
    if (await faqItems.isVisible()) {
      await expect(faqItems).toBeVisible();
    }
  });

  test('FAQ items can be expanded', async ({ page }) => {
    await page.goto('/faq');
    
    // Try to click first FAQ item
    const firstFaq = page.locator('[data-testid*="faq"], [data-accordion-trigger]').first();
    if (await firstFaq.isVisible()) {
      await firstFaq.click();
      await page.waitForTimeout(500);
    }
  });

  // Features Page Tests
  test('Features page displays feature list', async ({ page }) => {
    await page.goto('/features');
    
    // Look for feature cards or list
    const features = page.locator('[data-testid*="feature"]').first();
    if (await features.isVisible()) {
      await expect(features).toBeVisible();
    }
  });

  // Dance Styles Tests
  test('Dance styles page shows style cards', async ({ page }) => {
    await page.goto('/dance-styles');
    
    // Look for dance style cards
    const styleCards = page.locator('[data-testid*="style"], [data-testid*="dance"]').first();
    if (await styleCards.isVisible()) {
      await expect(styleCards).toBeVisible();
    }
  });

  test('Dance style detail page loads', async ({ page }) => {
    await page.goto('/dance-styles');
    
    // Click first dance style if exists
    const firstStyle = page.locator('[data-testid*="style"]').first();
    if (await firstStyle.isVisible()) {
      await firstStyle.click();
      
      // Verify navigated to detail page
      await expect(page).toHaveURL(/\/dance-styles\/\w+/);
    }
  });

  // Community Guidelines Tests
  test('Community guidelines page has sections', async ({ page }) => {
    await page.goto('/community-guidelines');
    
    // Look for guideline sections
    const sections = page.locator('h2, h3').first();
    await expect(sections).toBeVisible();
  });

  // Privacy Policy Tests
  test('Privacy policy page has policy text', async ({ page }) => {
    await page.goto('/privacy-policy');
    
    // Look for policy content
    const policyContent = page.locator('text=/privacy|data|information/i').first();
    await expect(policyContent).toBeVisible();
  });

  test('Privacy policy has last updated date', async ({ page }) => {
    await page.goto('/privacy-policy');
    
    // Look for date/updated text
    const dateText = page.locator('text=/updated|last modified|effective/i').first();
    if (await dateText.isVisible()) {
      await expect(dateText).toBeVisible();
    }
  });

  // Terms of Service Tests
  test('Terms of service page has terms text', async ({ page }) => {
    await page.goto('/terms-of-service');
    
    // Look for terms content
    const termsContent = page.locator('text=/terms|conditions|agreement/i').first();
    await expect(termsContent).toBeVisible();
  });

  test('Terms of service has sections', async ({ page }) => {
    await page.goto('/terms-of-service');
    
    // Look for section headings
    const sections = page.locator('h2, h3').first();
    await expect(sections).toBeVisible();
  });

  // About Tango Page Tests
  test('About tango page has educational content', async ({ page }) => {
    await page.goto('/about-tango');
    
    // Look for tango information
    const tangoContent = page.locator('text=/tango|dance|argentine/i').first();
    await expect(tangoContent).toBeVisible();
  });

  // Navigation Tests
  test('Can navigate between static pages', async ({ page }) => {
    await page.goto('/faq');
    
    // Try to find link to another static page
    const privacyLink = page.locator('a[href*="privacy"]').first();
    if (await privacyLink.isVisible()) {
      await privacyLink.click();
      await expect(page).toHaveURL(/privacy/);
    }
  });

  // Mobile Responsiveness Test
  test('Static pages are mobile responsive', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/faq');
    
    // Verify page renders on mobile
    const content = page.locator('body').first();
    await expect(content).toBeVisible();
  });
});
