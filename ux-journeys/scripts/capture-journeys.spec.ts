/**
 * UX Journey Capture Script
 * Captures screenshots and videos of all customer journeys using Playwright
 *
 * Usage: npx playwright test ux-journeys/scripts/capture-journeys.ts
 */

import { test, expect, Page, BrowserContext } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';
const SCREENSHOTS_DIR = path.join(__dirname, '../screenshots');
const VIDEOS_DIR = path.join(__dirname, '../videos');

// Test user credentials
const TEST_USER = {
  email: 'admin@mundotango.life',
  password: 'admin123',
};

// Ensure directories exist
function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Helper to take screenshot with consistent naming
async function captureStep(page: Page, journey: string, step: string, description: string) {
  const journeyDir = path.join(SCREENSHOTS_DIR, journey);
  ensureDir(journeyDir);

  const filename = `${step}-${description.toLowerCase().replace(/\s+/g, '-')}.png`;
  await page.screenshot({
    path: path.join(journeyDir, filename),
    fullPage: false
  });
  console.log(`📸 Captured: ${journey}/${filename}`);
}

// Configure test to record video
test.use({
  video: {
    mode: 'on',
    size: { width: 1280, height: 720 }
  },
  viewport: { width: 1280, height: 720 },
});

// ============================================
// JOURNEY 1: ONBOARDING
// ============================================
test.describe('01-onboarding', () => {
  test('capture onboarding journey', async ({ page, context }) => {
    const journey = '01-onboarding';

    // Step 1: Landing/Register page
    await page.goto(`${BASE_URL}/register`);
    await page.waitForLoadState('networkidle');
    await captureStep(page, journey, '01', 'register-page');

    // Step 2: Fill registration form
    await page.fill('input[name="email"]', `newuser_${Date.now()}@test.com`);
    await page.fill('input[name="password"]', 'TestPassword123!');
    await captureStep(page, journey, '02', 'registration-form-filled');

    // Step 3: Submit and go to onboarding
    // Note: Actual submission would create a user, capture the expected flow
    await page.goto(`${BASE_URL}/onboarding/welcome`);
    await page.waitForLoadState('networkidle');
    await captureStep(page, journey, '03', 'onboarding-welcome');

    // Step 4: Profile setup
    await page.goto(`${BASE_URL}/onboarding/profile`);
    await page.waitForLoadState('networkidle');
    await captureStep(page, journey, '04', 'onboarding-profile');

    // Step 5: Dance preferences
    await page.goto(`${BASE_URL}/onboarding/preferences`);
    await page.waitForLoadState('networkidle');
    await captureStep(page, journey, '05', 'onboarding-preferences');

    // Step 6: Location selection
    await page.goto(`${BASE_URL}/onboarding/location`);
    await page.waitForLoadState('networkidle');
    await captureStep(page, journey, '06', 'onboarding-location');

    // Step 7: Complete - redirect to feed
    await page.goto(`${BASE_URL}/feed`);
    await page.waitForLoadState('networkidle');
    await captureStep(page, journey, '07', 'onboarding-complete-feed');
  });
});

// ============================================
// JOURNEY 2: FEED & SOCIAL
// ============================================
test.describe('02-feed-social', () => {
  test('capture feed and social journey', async ({ page }) => {
    const journey = '02-feed-social';

    // Login first
    await page.goto(`${BASE_URL}/login`);
    await page.fill('[data-testid="input-email"]', TEST_USER.email);
    await page.fill('[data-testid="input-password"]', TEST_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');

    // Step 1: Main feed
    await page.goto(`${BASE_URL}/feed`);
    await page.waitForLoadState('networkidle');
    await captureStep(page, journey, '01', 'main-feed');

    // Step 2: Create post modal/form
    const createPostButton = page.locator('[data-testid="create-post"], button:has-text("Post")').first();
    if (await createPostButton.isVisible()) {
      await createPostButton.click();
      await page.waitForTimeout(500);
      await captureStep(page, journey, '02', 'create-post-modal');
    }

    // Step 3: View a post detail
    const firstPost = page.locator('[data-testid="post-card"], article').first();
    if (await firstPost.isVisible()) {
      await firstPost.click();
      await page.waitForTimeout(500);
      await captureStep(page, journey, '03', 'post-detail');
    }

    // Step 4: Comments section
    await captureStep(page, journey, '04', 'comments-section');

    // Step 5: Reactions
    await captureStep(page, journey, '05', 'reactions');
  });
});

// ============================================
// JOURNEY 3: EVENTS
// ============================================
test.describe('03-events', () => {
  test('capture events journey', async ({ page }) => {
    const journey = '03-events';

    // Login first
    await page.goto(`${BASE_URL}/login`);
    await page.fill('[data-testid="input-email"]', TEST_USER.email);
    await page.fill('[data-testid="input-password"]', TEST_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');

    // Step 1: Events list
    await page.goto(`${BASE_URL}/events`);
    await page.waitForLoadState('networkidle');
    await captureStep(page, journey, '01', 'events-list');

    // Step 2: Event filters
    await captureStep(page, journey, '02', 'events-filters');

    // Step 3: Event detail page
    const firstEvent = page.locator('[data-testid="event-card"], a[href*="/events/"]').first();
    if (await firstEvent.isVisible()) {
      await firstEvent.click();
      await page.waitForLoadState('networkidle');
      await captureStep(page, journey, '03', 'event-detail');
    }

    // Step 4: RSVP button/modal
    const rsvpButton = page.locator('button:has-text("RSVP"), button:has-text("Going")').first();
    if (await rsvpButton.isVisible()) {
      await rsvpButton.click();
      await page.waitForTimeout(500);
      await captureStep(page, journey, '04', 'rsvp-modal');
    }

    // Step 5: Check-in flow
    await page.goto(`${BASE_URL}/events`);
    await captureStep(page, journey, '05', 'check-in-ready');

    // Step 6: Create event
    await page.goto(`${BASE_URL}/events/create`);
    await page.waitForLoadState('networkidle');
    await captureStep(page, journey, '06', 'create-event-form');
  });
});

// ============================================
// JOURNEY 4: CITIES & GROUPS
// ============================================
test.describe('04-cities-groups', () => {
  test('capture cities and groups journey', async ({ page }) => {
    const journey = '04-cities-groups';

    // Login
    await page.goto(`${BASE_URL}/login`);
    await page.fill('[data-testid="input-email"]', TEST_USER.email);
    await page.fill('[data-testid="input-password"]', TEST_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');

    // Step 1: City groups overview
    await page.goto(`${BASE_URL}/city-groups`);
    await page.waitForLoadState('networkidle');
    await captureStep(page, journey, '01', 'city-groups-overview');

    // Step 2: City page (try Buenos Aires or first available)
    await page.goto(`${BASE_URL}/city/buenos-aires`);
    await page.waitForLoadState('networkidle');
    await captureStep(page, journey, '02', 'city-page-buenos-aires');

    // Step 3: City events tab
    await captureStep(page, journey, '03', 'city-events');

    // Step 4: City members
    await captureStep(page, journey, '04', 'city-members');

    // Step 5: Group detail
    await page.goto(`${BASE_URL}/groups`);
    await page.waitForLoadState('networkidle');
    await captureStep(page, journey, '05', 'groups-list');

    // Step 6: Join group flow
    const joinButton = page.locator('button:has-text("Join")').first();
    if (await joinButton.isVisible()) {
      await captureStep(page, journey, '06', 'join-group-button');
    }
  });
});

// ============================================
// JOURNEY 5: PROFILE
// ============================================
test.describe('05-profile', () => {
  test('capture profile journey', async ({ page }) => {
    const journey = '05-profile';

    // Login
    await page.goto(`${BASE_URL}/login`);
    await page.fill('[data-testid="input-email"]', TEST_USER.email);
    await page.fill('[data-testid="input-password"]', TEST_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');

    // Step 1: Own profile
    await page.goto(`${BASE_URL}/profile`);
    await page.waitForLoadState('networkidle');
    await captureStep(page, journey, '01', 'profile-main');

    // Step 2: Posts tab
    await page.click('text=Posts').catch(() => {});
    await page.waitForTimeout(300);
    await captureStep(page, journey, '02', 'profile-posts');

    // Step 3: Travel tab
    await page.click('text=Travel').catch(() => {});
    await page.waitForTimeout(300);
    await captureStep(page, journey, '03', 'profile-travel');

    // Step 4: Events tab
    await page.click('text=Events').catch(() => {});
    await page.waitForTimeout(300);
    await captureStep(page, journey, '04', 'profile-events');

    // Step 5: Photos tab
    await page.click('text=Photos').catch(() => {});
    await page.waitForTimeout(300);
    await captureStep(page, journey, '05', 'profile-photos');

    // Step 6: About tab
    await page.click('text=About').catch(() => {});
    await page.waitForTimeout(300);
    await captureStep(page, journey, '06', 'profile-about');

    // Step 7: Edit profile
    await page.goto(`${BASE_URL}/profile/edit`);
    await page.waitForLoadState('networkidle');
    await captureStep(page, journey, '07', 'profile-edit');
  });
});

// ============================================
// JOURNEY 6: FRIENDS
// ============================================
test.describe('06-friends', () => {
  test('capture friends journey', async ({ page }) => {
    const journey = '06-friends';

    // Login
    await page.goto(`${BASE_URL}/login`);
    await page.fill('[data-testid="input-email"]', TEST_USER.email);
    await page.fill('[data-testid="input-password"]', TEST_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');

    // Step 1: Friend requests
    await page.goto(`${BASE_URL}/friend-requests`);
    await page.waitForLoadState('networkidle');
    await captureStep(page, journey, '01', 'friend-requests');

    // Step 2: Friends list
    await page.goto(`${BASE_URL}/friends`);
    await page.waitForLoadState('networkidle');
    await captureStep(page, journey, '02', 'friends-list');

    // Step 3: Friendship page (mutual connections)
    await page.goto(`${BASE_URL}/friendship`);
    await page.waitForLoadState('networkidle');
    await captureStep(page, journey, '03', 'friendship-connections');

    // Step 4: Send friend request
    await captureStep(page, journey, '04', 'send-friend-request');
  });
});

// ============================================
// JOURNEY 7: MESSAGES
// ============================================
test.describe('07-messages', () => {
  test('capture messages journey', async ({ page }) => {
    const journey = '07-messages';

    // Login
    await page.goto(`${BASE_URL}/login`);
    await page.fill('[data-testid="input-email"]', TEST_USER.email);
    await page.fill('[data-testid="input-password"]', TEST_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');

    // Step 1: Messages inbox
    await page.goto(`${BASE_URL}/messages`);
    await page.waitForLoadState('networkidle');
    await captureStep(page, journey, '01', 'messages-inbox');

    // Step 2: Conversation view
    const firstConversation = page.locator('[data-testid="conversation"], a[href*="/messages/"]').first();
    if (await firstConversation.isVisible()) {
      await firstConversation.click();
      await page.waitForLoadState('networkidle');
      await captureStep(page, journey, '02', 'conversation-view');
    }

    // Step 3: Compose new message
    const composeButton = page.locator('button:has-text("New"), button:has-text("Compose")').first();
    if (await composeButton.isVisible()) {
      await composeButton.click();
      await page.waitForTimeout(500);
      await captureStep(page, journey, '03', 'compose-message');
    }

    // Step 4: Message input
    await captureStep(page, journey, '04', 'message-input');
  });
});

// ============================================
// JOURNEY 8: TRAVEL
// ============================================
test.describe('08-travel', () => {
  test('capture travel journey', async ({ page }) => {
    const journey = '08-travel';

    // Login
    await page.goto(`${BASE_URL}/login`);
    await page.fill('[data-testid="input-email"]', TEST_USER.email);
    await page.fill('[data-testid="input-password"]', TEST_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');

    // Step 1: Travel overview
    await page.goto(`${BASE_URL}/travel`);
    await page.waitForLoadState('networkidle');
    await captureStep(page, journey, '01', 'travel-overview');

    // Step 2: Travel planner
    await page.goto(`${BASE_URL}/travel/planner`);
    await page.waitForLoadState('networkidle');
    await captureStep(page, journey, '02', 'travel-planner');

    // Step 3: Create trip
    await captureStep(page, journey, '03', 'create-trip-form');

    // Step 4: Trip detail
    await page.goto(`${BASE_URL}/travel`);
    const firstTrip = page.locator('a[href*="/travel/trip/"]').first();
    if (await firstTrip.isVisible()) {
      await firstTrip.click();
      await page.waitForLoadState('networkidle');
      await captureStep(page, journey, '04', 'trip-detail');
    }

    // Step 5: Travel connections
    await captureStep(page, journey, '05', 'travel-connections');
  });
});

// ============================================
// JOURNEY 9: HOUSING
// ============================================
test.describe('09-housing', () => {
  test('capture housing journey', async ({ page }) => {
    const journey = '09-housing';

    // Login
    await page.goto(`${BASE_URL}/login`);
    await page.fill('[data-testid="input-email"]', TEST_USER.email);
    await page.fill('[data-testid="input-password"]', TEST_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');

    // Step 1: Housing search
    await page.goto(`${BASE_URL}/housing/search`);
    await page.waitForLoadState('networkidle');
    await captureStep(page, journey, '01', 'housing-search');

    // Step 2: Search filters
    await captureStep(page, journey, '02', 'housing-filters');

    // Step 3: Listing results
    await captureStep(page, journey, '03', 'housing-results');

    // Step 4: Listing detail
    const firstListing = page.locator('a[href*="/housing/listing/"]').first();
    if (await firstListing.isVisible()) {
      await firstListing.click();
      await page.waitForLoadState('networkidle');
      await captureStep(page, journey, '04', 'housing-listing-detail');
    }

    // Step 5: Contact host (browse only for standard users)
    await captureStep(page, journey, '05', 'housing-contact');
  });
});

// ============================================
// JOURNEY 10: MR. BLUE (Basic Chat)
// ============================================
test.describe('10-mr-blue', () => {
  test('capture mr blue journey', async ({ page }) => {
    const journey = '10-mr-blue';

    // Login
    await page.goto(`${BASE_URL}/login`);
    await page.fill('[data-testid="input-email"]', TEST_USER.email);
    await page.fill('[data-testid="input-password"]', TEST_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');

    // Step 1: Mr. Blue chat interface
    await page.goto(`${BASE_URL}/mr-blue-chat`);
    await page.waitForLoadState('networkidle');
    await captureStep(page, journey, '01', 'mr-blue-chat-interface');

    // Step 2: Chat input
    const chatInput = page.locator('textarea, input[type="text"]').last();
    if (await chatInput.isVisible()) {
      await chatInput.fill('Hello Mr. Blue! Tell me about tango events in Buenos Aires.');
      await captureStep(page, journey, '02', 'mr-blue-chat-input');
    }

    // Step 3: Chat response
    await page.keyboard.press('Enter');
    await page.waitForTimeout(2000); // Wait for response
    await captureStep(page, journey, '03', 'mr-blue-response');

    // Step 4: Conversation history
    await captureStep(page, journey, '04', 'mr-blue-history');
  });
});

// After all tests, move videos to proper location
test.afterAll(async () => {
  console.log('\n📹 Videos will be saved to test-results/ directory');
  console.log('Move them to ux-journeys/videos/ after test run');
});
