/**
 * Visual Editor Quality Test
 * MB.MD Methodology: Tests Smart Suggestions improvements
 * 
 * Validates:
 * 1. Shadcn component usage for better structure
 * 2. Clear information hierarchy with proper headings
 * 3. Accessibility compliance (WCAG 2.1 AA)
 * 4. Smart Suggestions quality score improvement (target: 85+)
 * 
 * Uses admin@mundotango.life / admin123 for God Level access
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.REPL_SLUG 
  ? `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`
  : 'http://localhost:5000';

test.describe('Visual Editor Quality Improvements', () => {
  test.beforeEach(async ({ page }) => {
    // Login as God Level admin
    await page.goto(`${BASE_URL}/login`);
    
    // Fill login form
    await page.fill('input[name="email"]', 'admin@mundotango.life');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    // Wait for navigation to complete
    await page.waitForURL(/\/(dashboard|feed|admin)/);
    await expect(page.locator('text=Admin')).toBeVisible({ timeout: 10000 });
    
    // Navigate to Visual Editor
    await page.goto(`${BASE_URL}/admin/visual-editor`);
    await page.waitForLoadState('networkidle');
  });

  test('Critical Issue #1: Page uses shadcn components for structure', async ({ page }) => {
    // Verify Card components are used for main sections
    const cards = page.locator('[class*="rounded-lg"][class*="border"]');
    const cardCount = await cards.count();
    expect(cardCount).toBeGreaterThan(2); // At least 3 Card components
    
    // Verify Separator components are used
    const separators = page.locator('[role="separator"]');
    const separatorCount = await separators.count();
    expect(separatorCount).toBeGreaterThan(0); // At least 1 Separator
    
    // Verify Tabs component is present
    await expect(page.locator('[role="tablist"]')).toBeVisible();
    
    // Verify Accordion or Collapsible for content sections
    const accordions = page.locator('[data-radix-accordion-content]');
    const accordionCount = await accordions.count();
    expect(accordionCount).toBeGreaterThan(0); // At least 1 Accordion
    
    console.log(`✅ Shadcn components: ${cardCount} Cards, ${separatorCount} Separators, ${accordionCount} Accordions`);
  });

  test('Critical Issue #2: Clear information hierarchy established', async ({ page }) => {
    // Verify page has proper heading structure
    const h1 = page.locator('h1');
    await expect(h1).toHaveCount(1); // Exactly one h1
    const h1Text = await h1.textContent();
    expect(h1Text).toBeTruthy();
    expect(h1Text?.length).toBeGreaterThan(10);
    
    // Verify h2 headings for main sections
    const h2Elements = page.locator('h2');
    const h2Count = await h2Elements.count();
    expect(h2Count).toBeGreaterThanOrEqual(2); // At least 2 sections
    
    // Verify h3 headings for sub-sections
    const h3Elements = page.locator('h3');
    const h3Count = await h3Elements.count();
    expect(h3Count).toBeGreaterThanOrEqual(1); // At least 1 sub-section
    
    // Verify semantic HTML structure
    const main = page.locator('main');
    await expect(main).toHaveCount(1);
    
    const sections = page.locator('section, [role="region"]');
    const sectionCount = await sections.count();
    expect(sectionCount).toBeGreaterThan(0);
    
    console.log(`✅ Hierarchy: 1 H1, ${h2Count} H2s, ${h3Count} H3s, ${sectionCount} sections`);
  });

  test('Smart Suggestions quality score improves to 85+', async ({ page }) => {
    // Wait for Smart Suggestions panel to load
    await page.waitForSelector('[data-testid="smart-suggestions-panel"]', { timeout: 15000 });
    
    // Get quality score
    const scoreElement = page.locator('text=/Page Quality Score/').locator('..').locator('text=/\\d+\/100/');
    await expect(scoreElement).toBeVisible({ timeout: 10000 });
    
    const scoreText = await scoreElement.textContent();
    const score = parseInt(scoreText?.match(/(\d+)\/100/)?.[1] || '0');
    
    console.log(`📊 Page Quality Score: ${score}/100`);
    
    // Target: 85+ after improvements
    expect(score).toBeGreaterThanOrEqual(85);
  });

  test('Critical issues reduced to 0', async ({ page }) => {
    // Wait for Smart Suggestions panel
    await page.waitForSelector('[data-testid="smart-suggestions-panel"]', { timeout: 15000 });
    
    // Get critical count
    const criticalBadge = page.locator('text=Critical').locator('..');
    await expect(criticalBadge).toBeVisible();
    
    const criticalText = await criticalBadge.textContent();
    const criticalCount = parseInt(criticalText?.match(/(\d+)/)?.[1] || '99');
    
    console.log(`🚨 Critical Issues: ${criticalCount}`);
    
    // After improvements, should have 0 critical issues
    expect(criticalCount).toBe(0);
  });

  test('Accessibility: All interactive elements have labels', async ({ page }) => {
    // Get all buttons
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    
    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i);
      const hasAriaLabel = await button.getAttribute('aria-label');
      const hasText = await button.textContent();
      const hasTitle = await button.getAttribute('title');
      
      expect(
        hasAriaLabel || (hasText && hasText.trim().length > 0) || hasTitle
      ).toBeTruthy();
    }
    
    console.log(`✅ All ${buttonCount} buttons have accessible labels`);
  });

  test('Accessibility: Keyboard navigation works', async ({ page }) => {
    // Test Tab key navigation
    await page.keyboard.press('Tab');
    const firstFocused = await page.evaluate(() => document.activeElement?.tagName);
    expect(firstFocused).toBeTruthy();
    
    // Tab through interactive elements
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    const focusedElement = await page.evaluate(() => {
      const el = document.activeElement;
      return {
        tagName: el?.tagName,
        isInteractive: ['BUTTON', 'INPUT', 'TEXTAREA', 'A', 'SELECT'].includes(el?.tagName || '')
      };
    });
    
    expect(focusedElement.isInteractive).toBe(true);
    
    console.log('✅ Keyboard navigation working');
  });

  test('Visual regression: Smart Suggestions panel renders correctly', async ({ page }) => {
    // Wait for panel to load
    await page.waitForSelector('[data-testid="smart-suggestions-panel"]', { timeout: 15000 });
    
    const panel = page.locator('[data-testid="smart-suggestions-panel"]');
    await expect(panel).toBeVisible();
    
    // Verify quality score badge is visible
    await expect(page.locator('text=/\\d+\/100/')).toBeVisible();
    
    // Verify category badges (Critical, Warnings, Suggestions, Auto-Fix)
    await expect(page.locator('text=Critical')).toBeVisible();
    await expect(page.locator('text=Warnings')).toBeVisible();
    await expect(page.locator('text=Suggestions')).toBeVisible();
    
    // Take screenshot for visual regression
    await page.screenshot({ 
      path: 'tests/screenshots/smart-suggestions-panel.png',
      fullPage: false
    });
    
    console.log('✅ Smart Suggestions panel rendered correctly');
  });

  test('Integration: Mr. Blue responds to quality improvement requests', async ({ page }) => {
    // Wait for Mr. Blue chat to be ready
    await expect(page.locator('[data-testid="input-visual-chat"]')).toBeVisible({ timeout: 10000 });
    
    // Send quality improvement request
    const input = page.locator('[data-testid="input-visual-chat"]');
    await input.fill('Improve page accessibility');
    
    const sendButton = page.locator('[data-testid="button-send-visual-chat"]');
    await sendButton.click();
    
    // Wait for Mr. Blue response
    await page.waitForSelector('text=/accessibility|improve|suggestions/', { timeout: 15000 });
    
    // Verify response appears in chat
    const messages = page.locator('[class*="message"]');
    const messageCount = await messages.count();
    expect(messageCount).toBeGreaterThan(0);
    
    console.log('✅ Mr. Blue responds to quality requests');
  });

  test('Performance: Smart Suggestions analysis completes within 10s', async ({ page }) => {
    const startTime = Date.now();
    
    // Trigger re-analysis by refreshing
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Wait for suggestions to load
    await page.waitForSelector('[data-testid="smart-suggestions-panel"]', { timeout: 15000 });
    await page.waitForSelector('text=/Page Quality Score/', { timeout: 15000 });
    
    const endTime = Date.now();
    const analysisTime = endTime - startTime;
    
    console.log(`⚡ Analysis completed in ${analysisTime}ms`);
    
    // Should complete within 10 seconds
    expect(analysisTime).toBeLessThan(10000);
  });

  test('End-to-end: Complete quality improvement workflow', async ({ page }) => {
    // 1. Initial state: Load Visual Editor
    await expect(page.locator('h1')).toBeVisible();
    
    // 2. Check Smart Suggestions panel
    await page.waitForSelector('[data-testid="smart-suggestions-panel"]', { timeout: 15000 });
    const initialScore = await page.locator('text=/\\d+\/100/').first().textContent();
    console.log(`📊 Initial score: ${initialScore}`);
    
    // 3. Verify improvements are applied
    const cards = page.locator('[class*="rounded-lg"][class*="border"]');
    const cardCount = await cards.count();
    expect(cardCount).toBeGreaterThan(2);
    
    // 4. Verify heading hierarchy
    await expect(page.locator('h1')).toHaveCount(1);
    const h2Count = await page.locator('h2').count();
    expect(h2Count).toBeGreaterThanOrEqual(2);
    
    // 5. Verify critical issues are resolved
    const criticalText = await page.locator('text=Critical').locator('..').textContent();
    const criticalCount = parseInt(criticalText?.match(/(\d+)/)?.[1] || '99');
    expect(criticalCount).toBe(0);
    
    // 6. Final quality score check
    const finalScore = parseInt(initialScore?.match(/(\d+)\/100/)?.[1] || '0');
    expect(finalScore).toBeGreaterThanOrEqual(85);
    
    console.log('✅ Complete quality improvement workflow successful');
  });
});
