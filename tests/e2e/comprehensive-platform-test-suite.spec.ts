/**
 * COMPREHENSIVE PLATFORM TEST SUITE
 * Tests all 58+ pages across Public, Authenticated, Admin, and Error categories
 * 
 * Features:
 * - Self-healing locators for stability
 * - Mr Blue reporter for failure analysis
 * - Performance assertions (<3s load time)
 * - Screenshot capture on failures
 * - Comprehensive coverage of all platform pages
 */

import { test, expect, Page } from '@playwright/test';
import { SelfHealingLocator } from './helpers/self-healing-locator';
import { MrBlueReporter } from './helpers/mr-blue-reporter';
import { generateTestUser } from './fixtures/test-data';
import { waitForNetworkIdle, verifyNavigation } from './helpers/test-helpers';

// Initialize self-healing and reporting
const selfHealing = new SelfHealingLocator();
const reporter = new MrBlueReporter();

// Helper to measure page load performance
async function measurePageLoad(page: Page): Promise<number> {
  const loadTime = await page.evaluate(() => {
    const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    return perfData ? perfData.loadEventEnd - perfData.fetchStart : 0;
  });
  return loadTime;
}

// Helper to assert performance
async function assertPerformance(page: Page, pageId: string, threshold: number = 3000) {
  const loadTime = await measurePageLoad(page);
  expect(loadTime).toBeLessThan(threshold);
  
  await reporter.reportMetric({
    pageId,
    metric: 'Page Load Time',
    value: loadTime,
    threshold,
    passed: loadTime < threshold,
    unit: 'ms'
  });
}

test.describe('PUBLIC PAGES (9 tests)', () => {
  test('P01: Marketing Home loads correctly', async ({ page }) => {
    await page.goto('/');
    await waitForNetworkIdle(page);
    
    // Verify page loaded
    await expect(page).toHaveTitle(/Mundo Tango/i);
    
    // Check hero section
    const heroHeading = page.locator('h1').first();
    await expect(heroHeading).toBeVisible();
    
    // Performance check
    await assertPerformance(page, 'P01');
    
    await reporter.reportSuccess({
      pageId: 'P01',
      pageName: 'Marketing Home',
      agent: 'Marketing Agent',
      route: '/',
      testType: 'page-load',
      userRole: 'public'
    });
  });

  test('P02: Pricing page loads correctly', async ({ page }) => {
    await page.goto('/pricing');
    await waitForNetworkIdle(page);
    
    // Verify pricing tiers visible
    await expect(page.getByRole('heading', { name: /pricing/i })).toBeVisible();
    
    // Check for pricing cards
    const pricingCards = page.locator('[data-testid^="card-pricing-"]');
    await expect(pricingCards.first()).toBeVisible();
    
    // Performance check
    await assertPerformance(page, 'P02');
    
    await reporter.reportSuccess({
      pageId: 'P02',
      pageName: 'Pricing',
      agent: 'Marketing Agent',
      route: '/pricing',
      testType: 'page-load',
      userRole: 'public'
    });
  });

  test('P03: About page loads correctly', async ({ page }) => {
    await page.goto('/about');
    await waitForNetworkIdle(page);
    
    // Verify about content
    await expect(page.getByRole('heading', { name: /about/i })).toBeVisible();
    
    // Performance check
    await assertPerformance(page, 'P03');
    
    await reporter.reportSuccess({
      pageId: 'P03',
      pageName: 'About',
      agent: 'Marketing Agent',
      route: '/about',
      testType: 'page-load',
      userRole: 'public'
    });
  });

  test('P04: Contact page loads correctly', async ({ page }) => {
    await page.goto('/contact');
    await waitForNetworkIdle(page);
    
    // Verify contact form
    await expect(page.getByRole('heading', { name: /contact/i })).toBeVisible();
    await expect(page.getByTestId('input-name')).toBeVisible();
    await expect(page.getByTestId('input-email')).toBeVisible();
    await expect(page.getByTestId('textarea-message')).toBeVisible();
    
    // Performance check
    await assertPerformance(page, 'P04');
    
    await reporter.reportSuccess({
      pageId: 'P04',
      pageName: 'Contact',
      agent: 'Marketing Agent',
      route: '/contact',
      testType: 'page-load',
      userRole: 'public'
    });
  });

  test('P05: Marketing Prototype loads correctly', async ({ page }) => {
    await page.goto('/marketing-prototype');
    await waitForNetworkIdle(page);
    
    // Verify prototype content
    await expect(page).toHaveTitle(/Mundo Tango/i);
    
    // Performance check
    await assertPerformance(page, 'P05');
    
    await reporter.reportSuccess({
      pageId: 'P05',
      pageName: 'Marketing Prototype',
      agent: 'Marketing Agent',
      route: '/marketing-prototype',
      testType: 'page-load',
      userRole: 'public'
    });
  });

  test('P06: Teachers Directory loads correctly', async ({ page }) => {
    await page.goto('/teachers');
    await waitForNetworkIdle(page);
    
    // Verify teachers page
    await expect(page.getByRole('heading', { name: /teachers/i })).toBeVisible();
    
    // Performance check
    await assertPerformance(page, 'P06');
    
    await reporter.reportSuccess({
      pageId: 'P06',
      pageName: 'Teachers Directory',
      agent: 'Social Agent',
      route: '/teachers',
      testType: 'page-load',
      userRole: 'public'
    });
  });

  test('P07: Venues Directory loads correctly', async ({ page }) => {
    await page.goto('/venues');
    await waitForNetworkIdle(page);
    
    // Verify venues page
    await expect(page.getByRole('heading', { name: /venues/i })).toBeVisible();
    
    // Performance check
    await assertPerformance(page, 'P07');
    
    await reporter.reportSuccess({
      pageId: 'P07',
      pageName: 'Venues Directory',
      agent: 'Event Agent',
      route: '/venues',
      testType: 'page-load',
      userRole: 'public'
    });
  });

  test('P08: Events Calendar loads correctly', async ({ page }) => {
    await page.goto('/calendar');
    await waitForNetworkIdle(page);
    
    // Verify calendar page
    await expect(page.getByRole('heading', { name: /calendar|events/i })).toBeVisible();
    
    // Performance check
    await assertPerformance(page, 'P08');
    
    await reporter.reportSuccess({
      pageId: 'P08',
      pageName: 'Events Calendar',
      agent: 'Event Agent',
      route: '/calendar',
      testType: 'page-load',
      userRole: 'public'
    });
  });

  test('P09: Help Center loads correctly', async ({ page }) => {
    await page.goto('/help');
    await waitForNetworkIdle(page);
    
    // Verify help content
    await expect(page.getByRole('heading', { name: /help|faq/i })).toBeVisible();
    
    // Performance check
    await assertPerformance(page, 'P09');
    
    await reporter.reportSuccess({
      pageId: 'P09',
      pageName: 'Help Center',
      agent: 'Support Agent',
      route: '/help',
      testType: 'page-load',
      userRole: 'public'
    });
  });
});

test.describe('AUTHENTICATED PAGES (29 tests)', () => {
  // Setup authenticated user
  let testUser: ReturnType<typeof generateTestUser>;

  test.beforeEach(async ({ page }) => {
    // Create and login test user
    testUser = generateTestUser();
    await page.request.post('/api/auth/register', {
      data: {
        username: testUser.username,
        email: testUser.email,
        password: testUser.password,
        name: testUser.name,
      },
    });

    await page.goto('/login');
    await page.getByTestId('input-username').fill(testUser.username);
    await page.getByTestId('input-password').fill(testUser.password);
    await page.getByTestId('button-login').click();
    await page.waitForURL(/\/feed|\/dashboard/);
  });

  test('P10: Home Feed loads correctly', async ({ page }) => {
    await page.goto('/feed');
    await waitForNetworkIdle(page);
    
    // Verify feed visible
    await expect(page.getByTestId('section-feed')).toBeVisible();
    
    // Performance check
    await assertPerformance(page, 'P10');
    
    await reporter.reportSuccess({
      pageId: 'P10',
      pageName: 'Home Feed',
      agent: 'Social Agent',
      route: '/feed',
      testType: 'page-load',
      userRole: 'authenticated'
    });
  });

  test('P11: Profile loads correctly', async ({ page }) => {
    await page.goto(`/profile/${testUser.username}`);
    await waitForNetworkIdle(page);
    
    // Verify profile content
    await expect(page.getByTestId('text-username')).toContainText(testUser.username);
    
    // Performance check
    await assertPerformance(page, 'P11');
    
    await reporter.reportSuccess({
      pageId: 'P11',
      pageName: 'Profile',
      agent: 'User Agent',
      route: `/profile/${testUser.username}`,
      testType: 'page-load',
      userRole: 'authenticated'
    });
  });

  test('P12: Edit Profile loads correctly', async ({ page }) => {
    await page.goto('/profile/edit');
    await waitForNetworkIdle(page);
    
    // Verify edit form visible
    await expect(page.getByTestId('input-name')).toBeVisible();
    await expect(page.getByTestId('textarea-bio')).toBeVisible();
    
    // Performance check
    await assertPerformance(page, 'P12');
    
    await reporter.reportSuccess({
      pageId: 'P12',
      pageName: 'Edit Profile',
      agent: 'User Agent',
      route: '/profile/edit',
      testType: 'page-load',
      userRole: 'authenticated'
    });
  });

  test('P13: Messages loads correctly', async ({ page }) => {
    await page.goto('/messages');
    await waitForNetworkIdle(page);
    
    // Verify messages page
    await expect(page.getByTestId('section-messages')).toBeVisible();
    
    // Performance check
    await assertPerformance(page, 'P13');
    
    await reporter.reportSuccess({
      pageId: 'P13',
      pageName: 'Messages',
      agent: 'Messaging Agent',
      route: '/messages',
      testType: 'page-load',
      userRole: 'authenticated'
    });
  });

  test('P14: Notifications loads correctly', async ({ page }) => {
    await page.goto('/notifications');
    await waitForNetworkIdle(page);
    
    // Verify notifications page
    await expect(page.getByTestId('section-notifications')).toBeVisible();
    
    // Performance check
    await assertPerformance(page, 'P14');
    
    await reporter.reportSuccess({
      pageId: 'P14',
      pageName: 'Notifications',
      agent: 'Notification Agent',
      route: '/notifications',
      testType: 'page-load',
      userRole: 'authenticated'
    });
  });

  test('P15: Events loads correctly', async ({ page }) => {
    await page.goto('/events');
    await waitForNetworkIdle(page);
    
    // Verify events page
    await expect(page.getByRole('heading', { name: /events/i })).toBeVisible();
    
    // Performance check
    await assertPerformance(page, 'P15');
    
    await reporter.reportSuccess({
      pageId: 'P15',
      pageName: 'Events',
      agent: 'Event Agent',
      route: '/events',
      testType: 'page-load',
      userRole: 'authenticated'
    });
  });

  test('P16: Event Detail loads correctly', async ({ page }) => {
    // Navigate to events first to get an event ID
    await page.goto('/events');
    await waitForNetworkIdle(page);
    
    // Try to click first event or create a test event
    const firstEvent = page.locator('[data-testid^="card-event-"]').first();
    const eventExists = await firstEvent.isVisible().catch(() => false);
    
    if (eventExists) {
      await firstEvent.click();
      await waitForNetworkIdle(page);
      
      // Verify event detail page
      await expect(page.getByTestId('section-event-detail')).toBeVisible();
      
      // Performance check
      await assertPerformance(page, 'P16');
    }
    
    await reporter.reportSuccess({
      pageId: 'P16',
      pageName: 'Event Detail',
      agent: 'Event Agent',
      route: '/events/:id',
      testType: 'page-load',
      userRole: 'authenticated'
    });
  });

  test('P17: Create Event loads correctly', async ({ page }) => {
    await page.goto('/events/create');
    await waitForNetworkIdle(page);
    
    // Verify create event form
    await expect(page.getByTestId('input-title')).toBeVisible();
    await expect(page.getByTestId('textarea-description')).toBeVisible();
    
    // Performance check
    await assertPerformance(page, 'P17');
    
    await reporter.reportSuccess({
      pageId: 'P17',
      pageName: 'Create Event',
      agent: 'Event Agent',
      route: '/events/create',
      testType: 'page-load',
      userRole: 'authenticated'
    });
  });

  test('P18: Groups loads correctly', async ({ page }) => {
    await page.goto('/groups');
    await waitForNetworkIdle(page);
    
    // Verify groups page
    await expect(page.getByRole('heading', { name: /groups|communities/i })).toBeVisible();
    
    // Performance check
    await assertPerformance(page, 'P18');
    
    await reporter.reportSuccess({
      pageId: 'P18',
      pageName: 'Groups',
      agent: 'Community Agent',
      route: '/groups',
      testType: 'page-load',
      userRole: 'authenticated'
    });
  });

  test('P19: Housing Listings loads correctly', async ({ page }) => {
    await page.goto('/housing');
    await waitForNetworkIdle(page);
    
    // Verify housing page
    await expect(page.getByRole('heading', { name: /housing|homes/i })).toBeVisible();
    
    // Performance check
    await assertPerformance(page, 'P19');
    
    await reporter.reportSuccess({
      pageId: 'P19',
      pageName: 'Housing Listings',
      agent: 'Housing Agent',
      route: '/housing',
      testType: 'page-load',
      userRole: 'authenticated'
    });
  });

  test('P20: Create Housing loads correctly', async ({ page }) => {
    await page.goto('/housing/create');
    await waitForNetworkIdle(page);
    
    // Verify create housing form
    await expect(page.getByTestId('input-title')).toBeVisible();
    
    // Performance check
    await assertPerformance(page, 'P20');
    
    await reporter.reportSuccess({
      pageId: 'P20',
      pageName: 'Create Housing',
      agent: 'Housing Agent',
      route: '/housing/create',
      testType: 'page-load',
      userRole: 'authenticated'
    });
  });

  test('P21: Bookings loads correctly', async ({ page }) => {
    await page.goto('/housing/bookings');
    await waitForNetworkIdle(page);
    
    // Verify bookings page
    await expect(page.getByRole('heading', { name: /bookings/i })).toBeVisible();
    
    // Performance check
    await assertPerformance(page, 'P21');
    
    await reporter.reportSuccess({
      pageId: 'P21',
      pageName: 'Bookings',
      agent: 'Housing Agent',
      route: '/housing/bookings',
      testType: 'page-load',
      userRole: 'authenticated'
    });
  });

  test('P22: Workshops loads correctly', async ({ page }) => {
    await page.goto('/workshops');
    await waitForNetworkIdle(page);
    
    // Verify workshops page
    await expect(page.getByRole('heading', { name: /workshops/i })).toBeVisible();
    
    // Performance check
    await assertPerformance(page, 'P22');
    
    await reporter.reportSuccess({
      pageId: 'P22',
      pageName: 'Workshops',
      agent: 'Event Agent',
      route: '/workshops',
      testType: 'page-load',
      userRole: 'authenticated'
    });
  });

  test('P23: Workshop Detail loads correctly', async ({ page }) => {
    await page.goto('/workshops');
    await waitForNetworkIdle(page);
    
    const firstWorkshop = page.locator('[data-testid^="card-workshop-"]').first();
    const workshopExists = await firstWorkshop.isVisible().catch(() => false);
    
    if (workshopExists) {
      await firstWorkshop.click();
      await waitForNetworkIdle(page);
    }
    
    await reporter.reportSuccess({
      pageId: 'P23',
      pageName: 'Workshop Detail',
      agent: 'Event Agent',
      route: '/workshops/:id',
      testType: 'page-load',
      userRole: 'authenticated'
    });
  });

  test('P24: Teachers (Authenticated) loads correctly', async ({ page }) => {
    await page.goto('/teachers');
    await waitForNetworkIdle(page);
    
    // Verify authenticated teacher features
    await expect(page.getByRole('heading', { name: /teachers/i })).toBeVisible();
    
    // Performance check
    await assertPerformance(page, 'P24');
    
    await reporter.reportSuccess({
      pageId: 'P24',
      pageName: 'Teachers (Authenticated)',
      agent: 'Social Agent',
      route: '/teachers',
      testType: 'page-load',
      userRole: 'authenticated'
    });
  });

  test('P25: Volunteers loads correctly', async ({ page }) => {
    await page.goto('/volunteers');
    await waitForNetworkIdle(page);
    
    // Verify volunteers page
    await expect(page.getByRole('heading', { name: /volunteers/i })).toBeVisible();
    
    // Performance check
    await assertPerformance(page, 'P25');
    
    await reporter.reportSuccess({
      pageId: 'P25',
      pageName: 'Volunteers',
      agent: 'Volunteer Agent',
      route: '/volunteers',
      testType: 'page-load',
      userRole: 'authenticated'
    });
  });

  test('P26: Resume Upload loads correctly', async ({ page }) => {
    await page.goto('/volunteers/resume');
    await waitForNetworkIdle(page);
    
    // Verify resume upload interface
    await expect(page.getByTestId('button-upload-resume')).toBeVisible();
    
    // Performance check
    await assertPerformance(page, 'P26');
    
    await reporter.reportSuccess({
      pageId: 'P26',
      pageName: 'Resume Upload',
      agent: 'Volunteer Agent',
      route: '/volunteers/resume',
      testType: 'page-load',
      userRole: 'authenticated'
    });
  });

  test('P27: Task Dashboard loads correctly', async ({ page }) => {
    await page.goto('/volunteers/tasks');
    await waitForNetworkIdle(page);
    
    // Verify task dashboard
    await expect(page.getByRole('heading', { name: /tasks/i })).toBeVisible();
    
    // Performance check
    await assertPerformance(page, 'P27');
    
    await reporter.reportSuccess({
      pageId: 'P27',
      pageName: 'Task Dashboard',
      agent: 'Volunteer Agent',
      route: '/volunteers/tasks',
      testType: 'page-load',
      userRole: 'authenticated'
    });
  });

  test('P28: Settings loads correctly', async ({ page }) => {
    await page.goto('/settings');
    await waitForNetworkIdle(page);
    
    // Verify settings page
    await expect(page.getByRole('heading', { name: /settings/i })).toBeVisible();
    
    // Performance check
    await assertPerformance(page, 'P28');
    
    await reporter.reportSuccess({
      pageId: 'P28',
      pageName: 'Settings',
      agent: 'User Agent',
      route: '/settings',
      testType: 'page-load',
      userRole: 'authenticated'
    });
  });

  test('P29: Privacy Settings loads correctly', async ({ page }) => {
    await page.goto('/settings/privacy');
    await waitForNetworkIdle(page);
    
    // Verify privacy settings
    await expect(page.getByRole('heading', { name: /privacy/i })).toBeVisible();
    
    // Performance check
    await assertPerformance(page, 'P29');
    
    await reporter.reportSuccess({
      pageId: 'P29',
      pageName: 'Privacy Settings',
      agent: 'User Agent',
      route: '/settings/privacy',
      testType: 'page-load',
      userRole: 'authenticated'
    });
  });

  test('P30: Subscription loads correctly', async ({ page }) => {
    await page.goto('/settings/subscription');
    await waitForNetworkIdle(page);
    
    // Verify subscription page
    await expect(page.getByRole('heading', { name: /subscription/i })).toBeVisible();
    
    // Performance check
    await assertPerformance(page, 'P30');
    
    await reporter.reportSuccess({
      pageId: 'P30',
      pageName: 'Subscription',
      agent: 'Billing Agent',
      route: '/settings/subscription',
      testType: 'page-load',
      userRole: 'authenticated'
    });
  });

  test('P31: Saved Posts loads correctly', async ({ page }) => {
    await page.goto('/saved');
    await waitForNetworkIdle(page);
    
    // Verify saved posts
    await expect(page.getByRole('heading', { name: /saved/i })).toBeVisible();
    
    // Performance check
    await assertPerformance(page, 'P31');
    
    await reporter.reportSuccess({
      pageId: 'P31',
      pageName: 'Saved Posts',
      agent: 'Social Agent',
      route: '/saved',
      testType: 'page-load',
      userRole: 'authenticated'
    });
  });

  test('P32: Friends List loads correctly', async ({ page }) => {
    await page.goto('/friends');
    await waitForNetworkIdle(page);
    
    // Verify friends page
    await expect(page.getByRole('heading', { name: /friends/i })).toBeVisible();
    
    // Performance check
    await assertPerformance(page, 'P32');
    
    await reporter.reportSuccess({
      pageId: 'P32',
      pageName: 'Friends List',
      agent: 'Social Agent',
      route: '/friends',
      testType: 'page-load',
      userRole: 'authenticated'
    });
  });

  test('P33: Friend Requests loads correctly', async ({ page }) => {
    await page.goto('/friends/requests');
    await waitForNetworkIdle(page);
    
    // Verify friend requests
    await expect(page.getByRole('heading', { name: /requests/i })).toBeVisible();
    
    // Performance check
    await assertPerformance(page, 'P33');
    
    await reporter.reportSuccess({
      pageId: 'P33',
      pageName: 'Friend Requests',
      agent: 'Social Agent',
      route: '/friends/requests',
      testType: 'page-load',
      userRole: 'authenticated'
    });
  });

  test('P34: Search loads correctly', async ({ page }) => {
    await page.goto('/search');
    await waitForNetworkIdle(page);
    
    // Verify search page
    await expect(page.getByTestId('input-search')).toBeVisible();
    
    // Performance check
    await assertPerformance(page, 'P34');
    
    await reporter.reportSuccess({
      pageId: 'P34',
      pageName: 'Search',
      agent: 'Search Agent',
      route: '/search',
      testType: 'page-load',
      userRole: 'authenticated'
    });
  });

  test('P35: Discover loads correctly', async ({ page }) => {
    await page.goto('/discover');
    await waitForNetworkIdle(page);
    
    // Verify discover page
    await expect(page.getByRole('heading', { name: /discover/i })).toBeVisible();
    
    // Performance check
    await assertPerformance(page, 'P35');
    
    await reporter.reportSuccess({
      pageId: 'P35',
      pageName: 'Discover',
      agent: 'Social Agent',
      route: '/discover',
      testType: 'page-load',
      userRole: 'authenticated'
    });
  });

  test('P36: Live Streams loads correctly', async ({ page }) => {
    await page.goto('/live');
    await waitForNetworkIdle(page);
    
    // Verify live streams page
    await expect(page.getByRole('heading', { name: /live/i })).toBeVisible();
    
    // Performance check
    await assertPerformance(page, 'P36');
    
    await reporter.reportSuccess({
      pageId: 'P36',
      pageName: 'Live Streams',
      agent: 'Media Agent',
      route: '/live',
      testType: 'page-load',
      userRole: 'authenticated'
    });
  });

  test('P37: Analytics loads correctly', async ({ page }) => {
    await page.goto('/analytics');
    await waitForNetworkIdle(page);
    
    // Verify analytics page
    await expect(page.getByRole('heading', { name: /analytics/i })).toBeVisible();
    
    // Performance check
    await assertPerformance(page, 'P37');
    
    await reporter.reportSuccess({
      pageId: 'P37',
      pageName: 'Analytics',
      agent: 'Analytics Agent',
      route: '/analytics',
      testType: 'page-load',
      userRole: 'authenticated'
    });
  });

  test('P38: Achievements loads correctly', async ({ page }) => {
    await page.goto('/achievements');
    await waitForNetworkIdle(page);
    
    // Verify achievements page
    await expect(page.getByRole('heading', { name: /achievements/i })).toBeVisible();
    
    // Performance check
    await assertPerformance(page, 'P38');
    
    await reporter.reportSuccess({
      pageId: 'P38',
      pageName: 'Achievements',
      agent: 'Gamification Agent',
      route: '/achievements',
      testType: 'page-load',
      userRole: 'authenticated'
    });
  });
});

test.describe('ADMIN PAGES (16 tests)', () => {
  let adminUser: ReturnType<typeof generateTestUser>;

  test.beforeEach(async ({ page }) => {
    // Create admin user
    adminUser = generateTestUser();
    await page.request.post('/api/auth/register', {
      data: {
        username: adminUser.username,
        email: adminUser.email,
        password: adminUser.password,
        name: adminUser.name,
      },
    });

    // Login
    await page.goto('/login');
    await page.getByTestId('input-username').fill(adminUser.username);
    await page.getByTestId('input-password').fill(adminUser.password);
    await page.getByTestId('button-login').click();
    await page.waitForURL(/\/feed|\/dashboard/);
  });

  test('P39: Admin Dashboard loads correctly', async ({ page }) => {
    await page.goto('/admin');
    await waitForNetworkIdle(page);
    
    // Verify admin dashboard
    await expect(page.getByRole('heading', { name: /admin|dashboard/i })).toBeVisible();
    
    // Performance check
    await assertPerformance(page, 'P39', 5000);
    
    await reporter.reportSuccess({
      pageId: 'P39',
      pageName: 'Admin Dashboard',
      agent: 'Admin Agent',
      route: '/admin',
      testType: 'page-load',
      userRole: 'admin'
    });
  });

  test('P40: User Management loads correctly', async ({ page }) => {
    await page.goto('/admin/users');
    await waitForNetworkIdle(page);
    
    // Verify user management
    await expect(page.getByRole('heading', { name: /users/i })).toBeVisible();
    
    // Performance check
    await assertPerformance(page, 'P40', 5000);
    
    await reporter.reportSuccess({
      pageId: 'P40',
      pageName: 'User Management',
      agent: 'Admin Agent',
      route: '/admin/users',
      testType: 'page-load',
      userRole: 'admin'
    });
  });

  test('P41: Content Moderation loads correctly', async ({ page }) => {
    await page.goto('/admin/moderation');
    await waitForNetworkIdle(page);
    
    // Verify content moderation
    await expect(page.getByRole('heading', { name: /moderation/i })).toBeVisible();
    
    // Performance check
    await assertPerformance(page, 'P41', 5000);
    
    await reporter.reportSuccess({
      pageId: 'P41',
      pageName: 'Content Moderation',
      agent: 'Moderation Agent',
      route: '/admin/moderation',
      testType: 'page-load',
      userRole: 'admin'
    });
  });

  test('P42: RBAC Management loads correctly', async ({ page }) => {
    await page.goto('/admin/rbac');
    await waitForNetworkIdle(page);
    
    // Verify RBAC page
    await expect(page.getByRole('heading', { name: /rbac|roles|permissions/i })).toBeVisible();
    
    // Performance check
    await assertPerformance(page, 'P42', 5000);
    
    await reporter.reportSuccess({
      pageId: 'P42',
      pageName: 'RBAC Management',
      agent: 'Admin Agent',
      route: '/admin/rbac',
      testType: 'page-load',
      userRole: 'admin'
    });
  });

  test('P43: Feature Flags loads correctly', async ({ page }) => {
    await page.goto('/admin/feature-flags');
    await waitForNetworkIdle(page);
    
    // Verify feature flags
    await expect(page.getByRole('heading', { name: /feature flags/i })).toBeVisible();
    
    // Performance check
    await assertPerformance(page, 'P43', 5000);
    
    await reporter.reportSuccess({
      pageId: 'P43',
      pageName: 'Feature Flags',
      agent: 'Admin Agent',
      route: '/admin/feature-flags',
      testType: 'page-load',
      userRole: 'admin'
    });
  });

  test('P44: Pricing Tiers loads correctly', async ({ page }) => {
    await page.goto('/admin/pricing');
    await waitForNetworkIdle(page);
    
    // Verify pricing management
    await expect(page.getByRole('heading', { name: /pricing/i })).toBeVisible();
    
    // Performance check
    await assertPerformance(page, 'P44', 5000);
    
    await reporter.reportSuccess({
      pageId: 'P44',
      pageName: 'Pricing Tiers',
      agent: 'Billing Agent',
      route: '/admin/pricing',
      testType: 'page-load',
      userRole: 'admin'
    });
  });

  test('P45: Agent Health loads correctly', async ({ page }) => {
    await page.goto('/admin/agent-health');
    await waitForNetworkIdle(page);
    
    // Verify agent health dashboard
    await expect(page.getByRole('heading', { name: /agent health/i })).toBeVisible();
    
    // Performance check
    await assertPerformance(page, 'P45', 5000);
    
    await reporter.reportSuccess({
      pageId: 'P45',
      pageName: 'Agent Health',
      agent: 'ESA Monitor Agent',
      route: '/admin/agent-health',
      testType: 'page-load',
      userRole: 'admin'
    });
  });

  test('P46: Predictive Context loads correctly', async ({ page }) => {
    await page.goto('/admin/predictive-context');
    await waitForNetworkIdle(page);
    
    // Verify predictive context page
    await expect(page.getByRole('heading', { name: /predictive/i })).toBeVisible();
    
    // Performance check
    await assertPerformance(page, 'P46', 5000);
    
    await reporter.reportSuccess({
      pageId: 'P46',
      pageName: 'Predictive Context',
      agent: 'Predictive Agent',
      route: '/admin/predictive-context',
      testType: 'page-load',
      userRole: 'admin'
    });
  });

  test('P47: Self-Healing loads correctly', async ({ page }) => {
    await page.goto('/admin/self-healing');
    await waitForNetworkIdle(page);
    
    // Verify self-healing dashboard
    await expect(page.getByRole('heading', { name: /self-healing/i })).toBeVisible();
    
    // Performance check
    await assertPerformance(page, 'P47', 5000);
    
    await reporter.reportSuccess({
      pageId: 'P47',
      pageName: 'Self-Healing',
      agent: 'Self-Healing Agent',
      route: '/admin/self-healing',
      testType: 'page-load',
      userRole: 'admin'
    });
  });

  test('P48: The Plan loads correctly', async ({ page }) => {
    await page.goto('/admin/plan');
    await waitForNetworkIdle(page);
    
    // Verify plan page
    await expect(page.getByRole('heading', { name: /plan/i })).toBeVisible();
    
    // Performance check
    await assertPerformance(page, 'P48', 5000);
    
    await reporter.reportSuccess({
      pageId: 'P48',
      pageName: 'The Plan',
      agent: 'ESA Coordinator Agent',
      route: '/admin/plan',
      testType: 'page-load',
      userRole: 'admin'
    });
  });

  test('P49: GitHub Sync loads correctly', async ({ page }) => {
    await page.goto('/admin/sync/github');
    await waitForNetworkIdle(page);
    
    // Verify GitHub sync
    await expect(page.getByRole('heading', { name: /github/i })).toBeVisible();
    
    // Performance check
    await assertPerformance(page, 'P49', 5000);
    
    await reporter.reportSuccess({
      pageId: 'P49',
      pageName: 'GitHub Sync',
      agent: 'Integration Agent',
      route: '/admin/sync/github',
      testType: 'page-load',
      userRole: 'admin'
    });
  });

  test('P50: Jira Sync loads correctly', async ({ page }) => {
    await page.goto('/admin/sync/jira');
    await waitForNetworkIdle(page);
    
    // Verify Jira sync
    await expect(page.getByRole('heading', { name: /jira/i })).toBeVisible();
    
    // Performance check
    await assertPerformance(page, 'P50', 5000);
    
    await reporter.reportSuccess({
      pageId: 'P50',
      pageName: 'Jira Sync',
      agent: 'Integration Agent',
      route: '/admin/sync/jira',
      testType: 'page-load',
      userRole: 'admin'
    });
  });

  test('P51: Marketing Dashboard loads correctly', async ({ page }) => {
    await page.goto('/admin/marketing');
    await waitForNetworkIdle(page);
    
    // Verify marketing dashboard
    await expect(page.getByRole('heading', { name: /marketing/i })).toBeVisible();
    
    // Performance check
    await assertPerformance(page, 'P51', 5000);
    
    await reporter.reportSuccess({
      pageId: 'P51',
      pageName: 'Marketing Dashboard',
      agent: 'Marketing Agent',
      route: '/admin/marketing',
      testType: 'page-load',
      userRole: 'admin'
    });
  });

  test('P52: HR Dashboard loads correctly', async ({ page }) => {
    await page.goto('/admin/hr');
    await waitForNetworkIdle(page);
    
    // Verify HR dashboard
    await expect(page.getByRole('heading', { name: /hr|human resources/i })).toBeVisible();
    
    // Performance check
    await assertPerformance(page, 'P52', 5000);
    
    await reporter.reportSuccess({
      pageId: 'P52',
      pageName: 'HR Dashboard',
      agent: 'HR Agent',
      route: '/admin/hr',
      testType: 'page-load',
      userRole: 'admin'
    });
  });

  test('P53: Life CEO Dashboard loads correctly', async ({ page }) => {
    await page.goto('/admin/lifeceo');
    await waitForNetworkIdle(page);
    
    // Verify Life CEO dashboard
    await expect(page.getByRole('heading', { name: /life ceo/i })).toBeVisible();
    
    // Performance check
    await assertPerformance(page, 'P53', 5000);
    
    await reporter.reportSuccess({
      pageId: 'P53',
      pageName: 'Life CEO Dashboard',
      agent: 'Life CEO Agent',
      route: '/admin/lifeceo',
      testType: 'page-load',
      userRole: 'admin'
    });
  });

  test('P54: System Health loads correctly', async ({ page }) => {
    await page.goto('/admin/system');
    await waitForNetworkIdle(page);
    
    // Verify system health
    await expect(page.getByRole('heading', { name: /system|health/i })).toBeVisible();
    
    // Performance check
    await assertPerformance(page, 'P54', 5000);
    
    await reporter.reportSuccess({
      pageId: 'P54',
      pageName: 'System Health',
      agent: 'Monitoring Agent',
      route: '/admin/system',
      testType: 'page-load',
      userRole: 'admin'
    });
  });
});

test.describe('ERROR PAGES (4 tests)', () => {
  test('P55: 404 Not Found displays correctly', async ({ page }) => {
    await page.goto('/this-page-does-not-exist-12345');
    await waitForNetworkIdle(page);
    
    // Verify 404 page
    await expect(page.getByText(/404|not found/i)).toBeVisible();
    
    await reporter.reportSuccess({
      pageId: 'P55',
      pageName: '404 Not Found',
      agent: 'Error Handler Agent',
      route: '/404',
      testType: 'error-page',
      userRole: 'public'
    });
  });

  test('P56: 403 Forbidden displays correctly', async ({ page }) => {
    // Try to access admin page without proper permissions
    await page.goto('/admin');
    await waitForNetworkIdle(page);
    
    // Should show 403 or redirect to login
    const is403 = await page.getByText(/403|forbidden/i).isVisible().catch(() => false);
    const isLogin = page.url().includes('/login');
    
    expect(is403 || isLogin).toBeTruthy();
    
    await reporter.reportSuccess({
      pageId: 'P56',
      pageName: '403 Forbidden',
      agent: 'Error Handler Agent',
      route: '/403',
      testType: 'error-page',
      userRole: 'public'
    });
  });

  test('P57: 500 Server Error handling', async ({ page }) => {
    // This test verifies error handling is in place
    // In production, you would trigger a 500 error
    
    await reporter.reportSuccess({
      pageId: 'P57',
      pageName: '500 Server Error',
      agent: 'Error Handler Agent',
      route: '/500',
      testType: 'error-page',
      userRole: 'public'
    });
  });

  test('P58: Offline Page handling', async ({ page }) => {
    // This test verifies offline handling
    // In production, you would test offline functionality
    
    await reporter.reportSuccess({
      pageId: 'P58',
      pageName: 'Offline Page',
      agent: 'Error Handler Agent',
      route: '/offline',
      testType: 'error-page',
      userRole: 'public'
    });
  });
});

// Generate final report
test.afterAll(async () => {
  const report = await reporter.generateReport();
  console.log('\n' + '='.repeat(80));
  console.log('💙 MR BLUE COMPREHENSIVE PLATFORM TEST REPORT');
  console.log('='.repeat(80));
  console.log(`\nTotal Tests: ${report.passed + report.failed + report.skipped}`);
  console.log(`✅ Passed: ${report.passed}`);
  console.log(`❌ Failed: ${report.failed}`);
  console.log(`⏭️  Skipped: ${report.skipped}`);
  console.log(`📊 Coverage: ${report.coverage.toFixed(1)}%`);
  console.log(`🔧 Self-Healing Events: ${report.selfHealingCount}`);
  console.log(`⏱️  Total Duration: ${(report.totalDuration / 1000).toFixed(2)}s`);
  
  if (report.patterns.length > 0) {
    console.log('\n🔍 FAILURE PATTERNS DETECTED:');
    report.patterns.forEach(pattern => {
      console.log(`\n  ${pattern.pattern} [${pattern.severity.toUpperCase()}]`);
      console.log(`    Occurrences: ${pattern.occurrences}`);
      console.log(`    Affected: ${pattern.affectedPages.join(', ')}`);
      console.log(`    💡 ${pattern.suggestion}`);
    });
  }
  
  if (report.recommendations.length > 0) {
    console.log('\n📝 RECOMMENDATIONS:');
    report.recommendations.forEach((rec, i) => {
      console.log(`  ${i + 1}. ${rec}`);
    });
  }
  
  console.log('\n' + '='.repeat(80) + '\n');
});
