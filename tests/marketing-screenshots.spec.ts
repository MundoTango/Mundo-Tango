import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Marketing Screenshots Generator
 * 
 * Purpose: Automatically capture high-quality screenshots of all platform features
 * for use in marketing materials, social media, and documentation.
 * 
 * Output: Screenshots saved to `marketing-assets/screenshots/`
 * 
 * Run with: npx playwright test tests/marketing-screenshots.spec.ts
 */

const BASE_URL = process.env.BASE_URL || 'https://e0001089-5956-480e-9ebc-7b1a6c2ec0e7-00-3cydblgjeyjzl.worf.replit.dev';const SCREENSHOTS_DIR = path.join(process.cwd(), '../marketing-assets/screenshots');

// Ensure screenshots directory exists
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

// Helper function to take full page screenshot
async function captureFeature(
  page: Page,
  featureName: string,
  options: {
    waitFor?: string;
    scroll?: boolean;
    mobile?: boolean;
  } = {}
) {
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `${featureName.toLowerCase().replace(/\s+/g, '-')}-${timestamp}.png`;
  const filepath = path.join(SCREENSHOTS_DIR, filename);

  // Wait for any specified element
  if (options.waitFor) {
    await page.waitForSelector(options.waitFor, { timeout: 10000 });
  }

  // Wait for page to be fully loaded
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000); // Additional wait for animations

  // Scroll if needed
  if (options.scroll) {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
    await page.waitForTimeout(1000);
  }

  // Take screenshot
  await page.screenshot({
    path: filepath,
    fullPage: true,
  });

  console.log(`✅ Captured: ${filename}`);
}

test.describe('Marketing Screenshots Generator', () => {
  test.use({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 2, // Retina quality
  });

  test.beforeEach(async ({ page }) => {
    // Login as admin user for full feature access
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', 'admin@mundotango.life');
    await page.fill('input[type="password"]', 'MundoTango2025!Admin');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/feed');
  });

  test('01 - Memory Feed', async ({ page }) => {
    await page.goto(`${BASE_URL}/feed`);
    await captureFeature(page, 'memory-feed', {
      waitFor: '[data-testid="memory-feed"]',
      scroll: true,
    });
  });

  test('02 - Events Discovery - List View', async ({ page }) => {
    await page.goto(`${BASE_URL}/events`);
    await captureFeature(page, 'events-discovery-list', {
      waitFor: '[data-testid="events-list"]',
      scroll: true,
    });
  });

  test('03 - Events Discovery - Calendar View', async ({ page }) => {
    await page.goto(`${BASE_URL}/events`);
    await page.click('button:has-text("Calendar")');
    await page.waitForTimeout(1000);
    await captureFeature(page, 'events-discovery-calendar', {
      waitFor: '[data-testid="events-calendar"]',
    });
  });

  test('04 - Events Discovery - Map View', async ({ page }) => {
    await page.goto(`${BASE_URL}/events`);
    await page.click('button:has-text("Map")');
    await page.waitForTimeout(2000);
    await captureFeature(page, 'events-discovery-map');
  });

  test('05 - Housing Marketplace', async ({ page }) => {
    await page.goto(`${BASE_URL}/housing`);
    await captureFeature(page, 'housing-marketplace', {
      scroll: true,
    });
  });

  test('06 - Housing Marketplace - Single Listing', async ({ page }) => {
    await page.goto(`${BASE_URL}/housing`);
    await page.waitForSelector('[data-testid="housing-listing"]');
    await page.click('[data-testid="housing-listing"]:first-of-type');
    await page.waitForTimeout(2000);
    await captureFeature(page, 'housing-listing-detail', {
      scroll: true,
    });
  });

  test('07 - Professional Network - Organizers', async ({ page }) => {
    await page.goto(`${BASE_URL}/pro/organizers`);
    await captureFeature(page, 'professional-organizers', {
      scroll: true,
    });
  });

  test('08 - Professional Network - Dancers', async ({ page }) => {
    await page.goto(`${BASE_URL}/pro/dancers`);
    await captureFeature(page, 'professional-dancers', {
      scroll: true,
    });
  });

  test('09 - Professional Network - Teachers', async ({ page }) => {
    await page.goto(`${BASE_URL}/pro/learning`);
    await captureFeature(page, 'professional-teachers', {
      scroll: true,
    });
  });

  test('10 - Community Groups', async ({ page }) => {
    await page.goto(`${BASE_URL}/groups`);
    await captureFeature(page, 'community-groups', {
      scroll: true,
    });
  });

  test('11 - Community World Map', async ({ page }) => {
    await page.goto(`${BASE_URL}/community-world-map`);
    await page.waitForTimeout(3000); // Wait for map to load
    await captureFeature(page, 'community-world-map');
  });

  test('12 - User Profile', async ({ page }) => {
    await page.goto(`${BASE_URL}/profile`);
    await captureFeature(page, 'user-profile', {
      scroll: true,
    });
  });

  test('13 - Friends Network', async ({ page }) => {
    await page.goto(`${BASE_URL}/friends`);
    await captureFeature(page, 'friends-network', {
      scroll: true,
    });
  });

  test('14 - Messaging', async ({ page }) => {
    await page.goto(`${BASE_URL}/messages`);
    await captureFeature(page, 'messaging');
  });

  test('15 - Leaderboard', async ({ page }) => {
    await page.goto(`${BASE_URL}/leaderboard`);
    await captureFeature(page, 'leaderboard', {
      scroll: true,
    });
  });

  test('16 - Mr. Blue AI Assistant', async ({ page }) => {
    await page.goto(`${BASE_URL}/feed`);
    await page.click('button:has-text("Ask Mr. Blue")');
    await page.waitForTimeout(1000);
    await captureFeature(page, 'mr-blue-ai-assistant');
  });

  test('17 - Life CEO Agents', async ({ page }) => {
    await page.goto(`${BASE_URL}/life-ceo`);
    await captureFeature(page, 'life-ceo-agents', {
      scroll: true,
    });
  });

  test('18 - Mobile - Memory Feed', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 }); // iPhone X
    await page.goto(`${BASE_URL}/feed`);
    await captureFeature(page, 'mobile-memory-feed', {
      mobile: true,
    });
  });

  test('19 - Mobile - Events Discovery', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(`${BASE_URL}/events`);
    await captureFeature(page, 'mobile-events-discovery', {
      mobile: true,
    });
  });

  test('20 - Mobile - Housing Marketplace', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(`${BASE_URL}/housing`);
    await captureFeature(page, 'mobile-housing-marketplace', {
      mobile: true,
    });
  });
});

test.describe('Feature Demos with Interaction', () => {
  test.use({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 2,
  });

  test('Demo - Creating a Post', async ({ page }) => {
    await page.goto(`${BASE_URL}/feed`);
    await page.click('[data-testid="create-post-button"]');
    await page.fill('textarea[placeholder*="memory"]', 'Amazing milonga last night in Buenos Aires! 💃');
    await page.waitForTimeout(1000);
    await captureFeature(page, 'demo-creating-post');
  });

  test('Demo - Searching Events', async ({ page }) => {
    await page.goto(`${BASE_URL}/events`);
    await page.fill('input[placeholder*="Search"]', 'Buenos Aires');
    await page.waitForTimeout(1500);
    await captureFeature(page, 'demo-searching-events');
  });

  test('Demo - Filtering Housing', async ({ page }) => {
    await page.goto(`${BASE_URL}/housing`);
    await page.fill('input[placeholder*="city"]', 'Paris');
    await page.waitForTimeout(1000);
    // Adjust price range
    await page.evaluate(() => {
      const slider = document.querySelector('input[type="range"]') as HTMLInputElement;
      if (slider) slider.value = '100';
    });
    await page.waitForTimeout(1000);
    await captureFeature(page, 'demo-filtering-housing');
  });

  test('Demo - Event RSVP', async ({ page }) => {
    await page.goto(`${BASE_URL}/events`);
    await page.waitForSelector('[data-testid="event-card"]');
    await page.hover('[data-testid="event-card"]:first-of-type');
    await page.waitForTimeout(500);
    await captureFeature(page, 'demo-event-rsvp');
  });
});

test.describe('Hero Images for Landing Page', () => {
  test.use({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 2,
  });

  test('Hero - Events Grid', async ({ page }) => {
    await page.goto(`${BASE_URL}/events`);
    await page.waitForLoadState('networkidle');
    // Scroll to show nice grid of events
    await page.evaluate(() => window.scrollTo(0, 300));
    await page.waitForTimeout(1000);
    
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'hero-events-grid.png'),
      clip: { x: 0, y: 200, width: 1920, height: 800 },
    });
    console.log('✅ Captured: hero-events-grid.png');
  });

  test('Hero - Housing Listings', async ({ page }) => {
    await page.goto(`${BASE_URL}/housing`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'hero-housing-listings.png'),
      clip: { x: 0, y: 100, width: 1920, height: 900 },
    });
    console.log('✅ Captured: hero-housing-listings.png');
  });

  test('Hero - Community Feed', async ({ page }) => {
    await page.goto(`${BASE_URL}/feed`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'hero-community-feed.png'),
      clip: { x: 200, y: 150, width: 1520, height: 850 },
    });
    console.log('✅ Captured: hero-community-feed.png');
  });

  test('Hero - Pro/Organizer Network', async ({ page }) => {
    await page.goto(`${BASE_URL}/pro`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'hero-pro-network.png'),
      clip: { x: 0, y: 80, width: 1920, height: 900 },
    });
    console.log('✅ Captured: hero-pro-network.png');
  });

  test('Hero - Groups/Communities', async ({ page }) => {
    await page.goto(`${BASE_URL}/groups`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'hero-groups.png'),
      clip: { x: 0, y: 80, width: 1920, height: 900 },
    });
    console.log('✅ Captured: hero-groups.png');
  });

  test('Hero - User Profile', async ({ page }) => {
    await page.goto(`${BASE_URL}/profile`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'hero-profile.png'),
      clip: { x: 0, y: 80, width: 1920, height: 900 },
    });
    console.log('✅ Captured: hero-profile.png');
  });
});

// Feature Screenshots - Detailed views
test.describe('Feature Screenshots', () => {
  test('Events - List View with Filters', async ({ page }) => {
    await page.goto(`${BASE_URL}/events`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'feature-events-list.png'),
      fullPage: false,
    });
    console.log('✅ Captured: feature-events-list.png');
  });

  test('Events - Calendar View', async ({ page }) => {
    await page.goto(`${BASE_URL}/events`);
    await page.waitForLoadState('networkidle');
    
    // Click calendar view button
    await page.click('[data-view="calendar"]');
    await page.waitForTimeout(1500);

    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'feature-events-calendar.png'),
    });
    console.log('✅ Captured: feature-events-calendar.png');
  });

  test('Events - Map View', async ({ page }) => {
    await page.goto(`${BASE_URL}/events`);
    await page.waitForLoadState('networkidle');
    
    // Click map view button
    await page.click('[data-view="map"]');
    await page.waitForTimeout(2000);

    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'feature-events-map.png'),
    });
    console.log('✅ Captured: feature-events-map.png');
  });

  test('Housing - Listings with Search', async ({ page }) => {
    await page.goto(`${BASE_URL}/housing`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'feature-housing-search.png'),
    });
    console.log('✅ Captured: feature-housing-search.png');
  });

  test('Pro Network - Directory', async ({ page }) => {
    await page.goto(`${BASE_URL}/pro`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'feature-pro-directory.png'),
    });
    console.log('✅ Captured: feature-pro-directory.png');
  });

  test('Groups - Community List', async ({ page }) => {
    await page.goto(`${BASE_URL}/groups`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'feature-groups-list.png'),
    });
    console.log('✅ Captured: feature-groups-list.png');
  });

  test('Groups - Individual Group Page', async ({ page }) => {
    await page.goto(`${BASE_URL}/groups`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Click first group
    await page.click('.group-card:first-child');
    await page.waitForTimeout(2000);

    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'feature-group-detail.png'),
    });
    console.log('✅ Captured: feature-group-detail.png');
  });

  test('Social Feed - Posts and Interactions', async ({ page }) => {
    await page.goto(`${BASE_URL}/feed`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'feature-social-feed.png'),
    });
    console.log('✅ Captured: feature-social-feed.png');
  });

  test('Profile - User Dashboard', async ({ page }) => {
    await page.goto(`${BASE_URL}/profile`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'feature-profile-dashboard.png'),
    });
    console.log('✅ Captured: feature-profile-dashboard.png');
  });

  test('Friends - Network Management', async ({ page }) => {
    await page.goto(`${BASE_URL}/friends`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'feature-friends-network.png'),
    });
    console.log('✅ Captured: feature-friends-network.png');
  });

  test('Messaging - Chat Interface', async ({ page }) => {
    await page.goto(`${BASE_URL}/messages`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'feature-messaging.png'),
    });
    console.log('✅ Captured: feature-messaging.png');
  });

  test('Leaderboard - Community Rankings', async ({ page }) => {
    await page.goto(`${BASE_URL}/leaderboard`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'feature-leaderboard.png'),
    });
    console.log('✅ Captured: feature-leaderboard.png');
  });
});

// AI Assistant Screenshots
test.describe('AI Assistant - Mr. Blue', () => {
  test('Mr. Blue - Chat Interface', async ({ page }) => {
    await page.goto(`${BASE_URL}/feed`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Click Mr. Blue button
    await page.click('[aria-label="Mr. Blue Assistant"]');
    await page.waitForTimeout(1500);

    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'feature-mrblue-chat.png'),
    });
    console.log('✅ Captured: feature-mrblue-chat.png');
  });

  test('Life CEO - Goal Tracking', async ({ page }) => {
    await page.goto(`${BASE_URL}/life-ceo`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'feature-life-ceo.png'),
    });
    console.log('✅ Captured: feature-life-ceo.png');
  });
});

// Mobile Screenshots
test.describe('Mobile Views', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('Mobile - Feed View', async ({ page }) => {
    await page.goto(`${BASE_URL}/feed`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'mobile-feed.png'),
    });
    console.log('✅ Captured: mobile-feed.png');
  });

  test('Mobile - Events List', async ({ page }) => {
    await page.goto(`${BASE_URL}/events`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'mobile-events.png'),
    });
    console.log('✅ Captured: mobile-events.png');
  });

  test('Mobile - Navigation Menu', async ({ page }) => {
    await page.goto(`${BASE_URL}/feed`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Open mobile menu
    await page.click('[aria-label="Open menu"]');
    await page.waitForTimeout(500);

    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'mobile-navigation.png'),
    });
    console.log('✅ Captured: mobile-navigation.png');
  });
});

// Demo/Tutorial Screenshots
test.describe('Demo Flows', () => {
  test('Demo - Event Discovery Flow', async ({ page }) => {
    await page.goto(`${BASE_URL}/events`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Step 1: Events page
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'demo-events-step1.png'),
    });

    // Step 2: Click first event
    await page.click('.event-card:first-child');
    await page.waitForTimeout(1500);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'demo-events-step2-detail.png'),
    });

    console.log('✅ Captured: Event discovery flow');
  });

  test('Demo - Housing Search Flow', async ({ page }) => {
    await page.goto(`${BASE_URL}/housing`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Step 1: Housing listings
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'demo-housing-step1.png'),
    });

    // Step 2: Apply filter
    await page.click('[data-filter="short-term"]');
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'demo-housing-step2-filtered.png'),
    });

    console.log('✅ Captured: Housing search flow');
  });

  test('Demo - Social Connection Flow', async ({ page }) => {
    await page.goto(`${BASE_URL}/feed`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Step 1: Feed
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'demo-social-step1-feed.png'),
    });

    // Step 2: Click profile
    await page.click('.post-author:first-child');
    await page.waitForTimeout(1500);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'demo-social-step2-profile.png'),
    });

    console.log('✅ Captured: Social connection flow');
  });
});

