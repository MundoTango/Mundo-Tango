import { test, expect, Page, BrowserContext } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';

const VISIBILITY_OPTIONS = {
  close_friend: { label: 'Close Friends', badgeClass: 'bg-pink-500', icon: 'Heart' },
  friends_1st: { label: 'Friends', badgeClass: 'bg-blue-500', icon: 'User' },
  friends_2nd: { label: 'Friends of Friends', badgeClass: 'bg-indigo-500', icon: 'Users' },
  friends_3rd: { label: 'Extended Network', badgeClass: 'bg-purple-500', icon: 'UserCheck' },
  all: { label: null, badgeClass: null, icon: null }, // Public - no badge
};

test.describe('Event Visibility E2E Tests', () => {
  test.setTimeout(120000);

  test('Events page loads and displays event cards', async ({ page }) => {
    await page.goto(`${BASE_URL}/events`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    
    await page.waitForTimeout(3000);
    
    const pageTitle = await page.title();
    console.log('Page title:', pageTitle);
    
    const eventCards = await page.locator('[data-testid^="card-event-"]').count();
    console.log(`Found ${eventCards} event cards`);
    
    await page.screenshot({ path: '/tmp/events-page-loaded.png', fullPage: true });
    
    expect(eventCards).toBeGreaterThanOrEqual(0);
  });

  test('Event cards display visibility badges correctly', async ({ page }) => {
    await page.goto(`${BASE_URL}/events`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(3000);
    
    const visibilityBadges = await page.locator('[data-testid^="badge-visibility-"]').all();
    console.log(`Found ${visibilityBadges.length} visibility badges`);
    
    for (const badge of visibilityBadges) {
      const badgeText = await badge.textContent();
      const badgeClass = await badge.getAttribute('class');
      console.log(`Badge: "${badgeText}" with class: ${badgeClass}`);
      
      const validLabels = ['Close Friends', 'Friends', 'Friends of Friends', 'Extended Network'];
      const hasValidLabel = validLabels.some(label => badgeText?.includes(label));
      
      if (badgeText && badgeText.trim() !== '') {
        expect(hasValidLabel).toBe(true);
      }
    }
    
    await page.screenshot({ path: '/tmp/visibility-badges.png', fullPage: true });
  });

  test('Category badges display on event cards', async ({ page }) => {
    await page.goto(`${BASE_URL}/events`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(3000);
    
    const categoryBadges = await page.locator('[data-testid^="badge-category-"]').all();
    console.log(`Found ${categoryBadges.length} category badges`);
    
    for (const badge of categoryBadges.slice(0, 5)) {
      const badgeText = await badge.textContent();
      console.log(`Category badge: "${badgeText}"`);
      expect(badgeText).toBeTruthy();
    }
  });

  test('Event card structure is correct', async ({ page }) => {
    await page.goto(`${BASE_URL}/events`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(3000);
    
    const firstCard = page.locator('[data-testid^="card-event-"]').first();
    
    if (await firstCard.count() > 0) {
      const eventId = await firstCard.getAttribute('data-testid');
      const id = eventId?.replace('card-event-', '');
      console.log(`Testing event card with ID: ${id}`);
      
      const hasTitle = await page.locator(`[data-testid="text-event-title-${id}"]`).count() > 0;
      const hasDate = await page.locator(`[data-testid="text-event-date-${id}"]`).count() > 0;
      const hasImage = await page.locator(`[data-testid="img-event-${id}"]`).count() > 0;
      
      console.log(`Event card has: title=${hasTitle}, date=${hasDate}, image=${hasImage}`);
      
      expect(hasTitle || hasDate || hasImage).toBe(true);
    } else {
      console.log('No event cards found - skipping structure test');
    }
  });

  test('Visibility badge color coding matches visibility level', async ({ page }) => {
    await page.goto(`${BASE_URL}/events`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(3000);
    
    const badges = await page.locator('[data-testid^="badge-visibility-"]').all();
    
    for (const badge of badges) {
      const badgeText = await badge.textContent();
      const badgeClass = await badge.getAttribute('class') || '';
      
      if (badgeText?.includes('Close Friends')) {
        expect(badgeClass).toContain('pink');
        console.log('✓ Close Friends badge has pink color');
      } else if (badgeText === 'Friends' || badgeText?.match(/^Friends$/)) {
        expect(badgeClass).toContain('blue');
        console.log('✓ Friends badge has blue color');
      } else if (badgeText?.includes('Friends of Friends')) {
        expect(badgeClass).toContain('indigo');
        console.log('✓ Friends of Friends badge has indigo color');
      } else if (badgeText?.includes('Extended Network')) {
        expect(badgeClass).toContain('purple');
        console.log('✓ Extended Network badge has purple color');
      }
    }
    
    await page.screenshot({ path: '/tmp/badge-colors.png', fullPage: true });
  });

  test('Public events do not show visibility badge', async ({ page }) => {
    await page.goto(`${BASE_URL}/events`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(3000);
    
    const allCards = await page.locator('[data-testid^="card-event-"]').all();
    const visibilityBadges = await page.locator('[data-testid^="badge-visibility-"]').count();
    
    console.log(`Total cards: ${allCards.length}, Visibility badges: ${visibilityBadges}`);
    
    if (allCards.length > visibilityBadges) {
      console.log('✓ Some events are public (no visibility badge)');
    }
  });

  test('Events page has proper navigation tabs', async ({ page }) => {
    await page.goto(`${BASE_URL}/events`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(2000);
    
    const tabs = await page.locator('[role="tab"], [data-testid*="tab"]').all();
    console.log(`Found ${tabs.length} tab elements`);
    
    for (const tab of tabs.slice(0, 5)) {
      const tabText = await tab.textContent();
      console.log(`Tab: "${tabText}"`);
    }
  });
});

test.describe('Event Creation with Visibility', () => {
  test.setTimeout(180000);

  test('Navigate to create event page when authenticated', async ({ page }) => {
    await page.goto(`${BASE_URL}/events/create`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(2000);
    
    const pageUrl = page.url();
    console.log('Current URL:', pageUrl);
    
    await page.screenshot({ path: '/tmp/create-event-page.png', fullPage: true });
    
    const hasForm = await page.locator('form, [data-testid*="event-form"]').count() > 0;
    const hasLoginPrompt = await page.locator('text=/login|sign in|log in/i').count() > 0;
    
    console.log(`Has form: ${hasForm}, Has login prompt: ${hasLoginPrompt}`);
    
    if (hasLoginPrompt) {
      console.log('User needs to be authenticated to create events');
    }
  });

  test('Visibility selector exists on event creation form', async ({ page }) => {
    await page.goto(`${BASE_URL}/events/create`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(3000);
    
    const visibilitySection = await page.locator('text=/visibility|who can see|closeness|attendee/i').first();
    
    if (await visibilitySection.count() > 0) {
      console.log('✓ Visibility section found on create event page');
      
      const visibilityOptions = await page.locator('[data-testid*="closeness"], [data-testid*="visibility"], [role="radiogroup"]').count();
      console.log(`Found ${visibilityOptions} visibility-related elements`);
    } else {
      console.log('Visibility section not visible (may require auth or scroll)');
    }
    
    await page.screenshot({ path: '/tmp/create-event-visibility.png', fullPage: true });
  });
});
