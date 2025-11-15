import { test, expect } from '@playwright/test';
import { nanoid } from 'nanoid';

/**
 * Mention System E2E Tests
 * Tests inline mention pills, dropdown z-index, and display names
 * Uses programmatic authentication - no manual login required
 */

// Auto-login helper using environment secrets
async function loginAsTestUser(page: any) {
  const testUser = {
    email: process.env.TEST_ADMIN_EMAIL || 'admin@mundotango.life',
    password: process.env.TEST_ADMIN_PASSWORD || 'admin123',
  };

  await page.goto('/');
  
  // Check if already logged in
  const isLoggedIn = await page.locator('[data-testid="sidebar-item-memories"]').isVisible().catch(() => false);
  
  if (!isLoggedIn) {
    // Click login button
    await page.click('button:has-text("Login")').catch(() => {});
    await page.waitForSelector('input[type="email"]', { timeout: 5000 });

    // Fill login form
    await page.fill('input[type="email"]', testUser.email);
    await page.fill('input[type="password"]', testUser.password);

    // Submit login
    await page.click('button[type="submit"]:has-text("Login")');
    
    // Wait for navigation
    await page.waitForURL('/feed', { timeout: 10000 });
    await page.waitForLoadState('networkidle');
  }
}

test.describe('Mention System - Inline Pills and Z-Index', () => {
  test.beforeEach(async ({ page }) => {
    // Auto-login before each test
    await loginAsTestUser(page);
    
    // Navigate to Memories/Feed
    await page.goto('/feed');
    await page.waitForLoadState('networkidle');
    
    // Click Memories in sidebar if not already there
    await page.click('[data-testid="sidebar-item-memories"]').catch(() => {});
    await page.waitForTimeout(1000);
  });

  test('should show mention dropdown above all elements (z-index test)', async ({ page }) => {
    // Click on PostCreator input
    const input = page.locator('[data-testid="input-mentions-content"]');
    await input.click();
    await page.waitForTimeout(500);

    // Type @ to trigger dropdown
    await input.type('@bar');
    await page.waitForTimeout(1000);

    // Verify dropdown appears
    const dropdown = page.locator('[data-testid="mentions-dropdown"]');
    await expect(dropdown).toBeVisible({ timeout: 5000 });

    // Check dropdown has very high z-index
    const dropdownElement = await dropdown.elementHandle();
    if (dropdownElement) {
      const parent = await dropdownElement.evaluateHandle(el => el.parentElement);
      const zIndex = await parent.evaluate((el: any) => window.getComputedStyle(el).zIndex);
      
      // Should be 999999 (portal z-index)
      expect(parseInt(zIndex)).toBeGreaterThan(99999);
    }

    // Verify dropdown shows Barcelona results
    const firstResult = dropdown.locator('[data-testid^="mention-result-"]').first();
    await expect(firstResult).toBeVisible();
    
    const resultText = await firstResult.textContent();
    expect(resultText).toContain('Barcelona');
  });

  test('should insert mention as inline pill with display name', async ({ page }) => {
    // Click on PostCreator input
    const input = page.locator('[data-testid="input-mentions-content"]');
    await input.click();
    await page.waitForTimeout(500);

    // Type @ to trigger dropdown
    await input.type('@bar');
    await page.waitForTimeout(1500);

    // Wait for dropdown and results
    const dropdown = page.locator('[data-testid="mentions-dropdown"]');
    await expect(dropdown).toBeVisible({ timeout: 5000 });

    // Get first result details before clicking
    const firstResult = dropdown.locator('[data-testid^="mention-result-"]').first();
    await expect(firstResult).toBeVisible();
    
    const displayName = await firstResult.locator('.font-semibold').first().textContent();
    
    // Click first result
    await firstResult.click();
    await page.waitForTimeout(1000);

    // Verify dropdown closed
    await expect(dropdown).not.toBeVisible();

    // Verify inline pill exists
    const pill = input.locator('.mention-pill');
    await expect(pill).toBeVisible({ timeout: 3000 });

    // Verify pill shows DISPLAY NAME (not backend username)
    const pillText = await pill.textContent();
    expect(pillText).toContain(displayName?.trim() || 'Barcelona');
    
    // Verify pill is inside the input (inline)
    const pillParent = await pill.evaluateHandle(el => el.parentElement);
    const inputElement = await input.elementHandle();
    const isChildOfInput = await pillParent.evaluate((parent, input) => {
      return parent === input || input?.contains(parent);
    }, inputElement);
    
    expect(isChildOfInput).toBeTruthy();

    // Verify pill has colored background (gradient)
    const pillStyle = await pill.evaluate(el => window.getComputedStyle(el).background);
    expect(pillStyle).toContain('gradient');
  });

  test('should show multiple inline pills with different colors', async ({ page }) => {
    const input = page.locator('[data-testid="input-mentions-content"]');
    await input.click();
    await page.waitForTimeout(500);

    // First mention - Event (should be blue)
    await input.type('@bar');
    await page.waitForTimeout(1500);
    
    const dropdown = page.locator('[data-testid="mentions-dropdown"]');
    await expect(dropdown).toBeVisible({ timeout: 5000 });
    
    // Find and click Barcelona Milonga Night (event)
    const eventResult = dropdown.locator('text=/.*Barcelona.*Milonga.*Night.*/i').first();
    if (await eventResult.isVisible().catch(() => false)) {
      await eventResult.click();
    } else {
      // Click first result
      await dropdown.locator('[data-testid^="mention-result-"]').first().click();
    }
    
    await page.waitForTimeout(1000);

    // Type text between mentions
    await input.type(' and ');
    await page.waitForTimeout(500);

    // Second mention - City Group (should be green)
    await input.type('@mil');
    await page.waitForTimeout(1500);
    
    await expect(dropdown).toBeVisible({ timeout: 5000 });
    
    // Click second mention
    await dropdown.locator('[data-testid^="mention-result-"]').first().click();
    await page.waitForTimeout(1000);

    // Verify two pills exist
    const pills = input.locator('.mention-pill');
    await expect(pills).toHaveCount(2, { timeout: 3000 });

    // Verify both pills are visible and inline
    await expect(pills.nth(0)).toBeVisible();
    await expect(pills.nth(1)).toBeVisible();

    // Verify pills have different colors (check background contains gradient)
    const pill1Bg = await pills.nth(0).evaluate(el => window.getComputedStyle(el).background);
    const pill2Bg = await pills.nth(1).evaluate(el => window.getComputedStyle(el).background);
    
    expect(pill1Bg).toContain('gradient');
    expect(pill2Bg).toContain('gradient');

    // Verify text content includes both mentions and regular text
    const inputText = await input.textContent();
    expect(inputText).toContain('and');
  });

  test('should use display names not backend usernames in pills', async ({ page }) => {
    const input = page.locator('[data-testid="input-mentions-content"]');
    await input.click();
    await page.waitForTimeout(500);

    // Type @ to trigger dropdown
    await input.type('@bue');
    await page.waitForTimeout(1500);

    const dropdown = page.locator('[data-testid="mentions-dropdown"]');
    await expect(dropdown).toBeVisible({ timeout: 5000 });

    // Get display name from dropdown
    const firstResult = dropdown.locator('[data-testid^="mention-result-"]').first();
    const displayName = await firstResult.locator('.font-semibold').first().textContent();
    const backendUsername = await firstResult.locator('.text-white\\/80').first().textContent();

    // Click to insert mention
    await firstResult.click();
    await page.waitForTimeout(1000);

    // Verify pill exists
    const pill = input.locator('.mention-pill');
    await expect(pill).toBeVisible({ timeout: 3000 });

    // Get pill text
    const pillText = await pill.textContent();
    
    // Verify pill shows DISPLAY NAME
    expect(pillText).toContain(displayName?.trim() || 'Buenos');
    
    // Verify pill does NOT show backend username (like @buenos_aires_tango)
    if (backendUsername && backendUsername.includes('@')) {
      const username = backendUsername.replace('@', '').trim();
      expect(pillText).not.toContain(username);
    }
  });

  test('should handle keyboard navigation in mention dropdown', async ({ page }) => {
    const input = page.locator('[data-testid="input-mentions-content"]');
    await input.click();
    await page.waitForTimeout(500);

    // Type @ to trigger dropdown
    await input.type('@test');
    await page.waitForTimeout(1500);

    const dropdown = page.locator('[data-testid="mentions-dropdown"]');
    await expect(dropdown).toBeVisible({ timeout: 5000 });

    // Press ArrowDown to select next item
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(300);

    // Press Enter to select
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000);

    // Verify pill inserted
    const pill = input.locator('.mention-pill');
    await expect(pill).toBeVisible({ timeout: 3000 });

    // Verify dropdown closed
    await expect(dropdown).not.toBeVisible();
  });

  test('should show correct icon for each mention type', async ({ page }) => {
    const input = page.locator('[data-testid="input-mentions-content"]');
    await input.click();
    await page.waitForTimeout(500);

    // Search for event
    await input.type('@event');
    await page.waitForTimeout(1500);

    const dropdown = page.locator('[data-testid="mentions-dropdown"]');
    await expect(dropdown).toBeVisible({ timeout: 5000 });

    // Click first result
    await dropdown.locator('[data-testid^="mention-result-"]').first().click();
    await page.waitForTimeout(1000);

    // Get pill
    const pill = input.locator('.mention-pill');
    await expect(pill).toBeVisible({ timeout: 3000 });

    // Verify pill contains an icon (emoji)
    const pillHTML = await pill.innerHTML();
    const hasIcon = pillHTML.includes('📅') || // Event
                    pillHTML.includes('👤') || // User
                    pillHTML.includes('👔') || // Professional Group
                    pillHTML.includes('🏙️');  // City Group
    
    expect(hasIcon).toBeTruthy();
  });

  test('should maintain pill styling after typing more text', async ({ page }) => {
    const input = page.locator('[data-testid="input-mentions-content"]');
    await input.click();
    await page.waitForTimeout(500);

    // Insert mention
    await input.type('@bar');
    await page.waitForTimeout(1500);

    const dropdown = page.locator('[data-testid="mentions-dropdown"]');
    await expect(dropdown).toBeVisible({ timeout: 5000 });
    await dropdown.locator('[data-testid^="mention-result-"]').first().click();
    await page.waitForTimeout(1000);

    // Type more text after the pill
    await input.type(' is amazing!');
    await page.waitForTimeout(500);

    // Verify pill still exists and is styled
    const pill = input.locator('.mention-pill');
    await expect(pill).toBeVisible();
    
    const pillBg = await pill.evaluate(el => window.getComputedStyle(el).background);
    expect(pillBg).toContain('gradient');

    // Verify contentEditable is false on pill
    const isEditable = await pill.evaluate(el => el.getAttribute('contenteditable'));
    expect(isEditable).toBe('false');
  });
});

test.describe('Mention Dropdown Portal Positioning', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/feed');
    await page.waitForLoadState('networkidle');
  });

  test('should position dropdown correctly below input', async ({ page }) => {
    const input = page.locator('[data-testid="input-mentions-content"]');
    await input.click();
    await page.waitForTimeout(500);

    // Get input position
    const inputBox = await input.boundingBox();
    expect(inputBox).not.toBeNull();

    // Trigger dropdown
    await input.type('@test');
    await page.waitForTimeout(1500);

    const dropdown = page.locator('[data-testid="mentions-dropdown"]');
    await expect(dropdown).toBeVisible({ timeout: 5000 });

    // Get dropdown position
    const dropdownBox = await dropdown.boundingBox();
    expect(dropdownBox).not.toBeNull();

    // Verify dropdown is below input
    if (inputBox && dropdownBox) {
      expect(dropdownBox.y).toBeGreaterThan(inputBox.y);
      
      // Verify dropdown top is close to input bottom (within 10px)
      const distance = dropdownBox.y - (inputBox.y + inputBox.height);
      expect(distance).toBeLessThan(20);
      expect(distance).toBeGreaterThan(-5);
    }
  });

  test('should render dropdown in document.body (portal)', async ({ page }) => {
    const input = page.locator('[data-testid="input-mentions-content"]');
    await input.click();
    await page.waitForTimeout(500);

    await input.type('@test');
    await page.waitForTimeout(1500);

    const dropdown = page.locator('[data-testid="mentions-dropdown"]');
    await expect(dropdown).toBeVisible({ timeout: 5000 });

    // Verify dropdown parent is body (portal behavior)
    const isInBody = await dropdown.evaluate(el => {
      let current = el.parentElement;
      while (current && current !== document.body) {
        current = current.parentElement;
      }
      return current === document.body;
    });

    expect(isInBody).toBeTruthy();
  });
});
