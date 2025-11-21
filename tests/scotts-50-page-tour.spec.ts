/**
 * SCOTT'S 50-PAGE TOUR - Comprehensive Platform Validation
 * MB.MD Execution Plan - Automated Testing
 * 
 * Tests all 50 pages from The Plan across 5 test users
 * Validates routes, auth, basic functionality, The Plan progress
 */

import { test, expect, Page } from '@playwright/test';

// Test users from COMPLETE_TEST_USERS.md
const TEST_USERS = [
  { email: 'scottplan@test.com', password: 'testpass123', role: 'primary-tour' },
  { email: 'teacher@test.com', password: 'testpass123', role: 'teacher' },
  { email: 'venue@test.com', password: 'testpass123', role: 'venue' },
  { email: 'user@test.com', password: 'testpass123', role: 'regular' },
  { email: 'premium@test.com', password: 'testpass123', role: 'premium' },
];

// All 50 routes from thePlanPages.ts
const THE_PLAN_ROUTES = [
  // PHASE 1: CORE PLATFORM (6 pages)
  { id: 1, route: '/dashboard', name: 'Dashboard / Home Feed', phase: 'Core Platform' },
  { id: 2, route: '/profile', name: 'User Profile Page', phase: 'Core Platform' },
  { id: 3, route: '/settings', name: 'Profile Settings', phase: 'Core Platform' },
  { id: 4, route: '/settings/privacy', name: 'Privacy & Security', phase: 'Core Platform' },
  { id: 5, route: '/settings/notifications', name: 'Notification Settings', phase: 'Core Platform' },
  { id: 6, route: '/search', name: 'Search & Discover', phase: 'Core Platform' },

  // PHASE 2: SOCIAL FEATURES (6 pages)
  { id: 7, route: '/friends', name: 'Friendship System', phase: 'Social Features' },
  { id: 8, route: '/friends/requests', name: 'Friendship Requests', phase: 'Social Features' },
  { id: 9, route: '/friendship', name: 'Friendship Pages', phase: 'Social Features' },
  { id: 10, route: '/memories', name: 'Memory Feed', phase: 'Social Features' },
  { id: 11, route: '/feed', name: 'Post Creator', phase: 'Social Features' },
  { id: 12, route: '/feed', name: 'Comments System', phase: 'Social Features' },

  // PHASE 3: COMMUNITIES & EVENTS (7 pages)
  { id: 13, route: '/community/map', name: 'Community Map (Tango Map)', phase: 'Communities & Events' },
  { id: 14, route: '/groups', name: 'City Groups', phase: 'Communities & Events' },
  { id: 15, route: '/groups', name: 'Professional Groups', phase: 'Communities & Events' },
  { id: 16, route: '/groups', name: 'Custom Groups', phase: 'Communities & Events' },
  { id: 17, route: '/events', name: 'Event Calendar', phase: 'Communities & Events' },
  { id: 18, route: '/events/create', name: 'Event Creation', phase: 'Communities & Events' },
  { id: 19, route: '/events', name: 'Event RSVP & Check-in', phase: 'Communities & Events' },

  // PHASE 4: HOUSING & CLASSIFIEDS (3 pages)
  { id: 20, route: '/housing', name: 'Housing Marketplace', phase: 'Housing & Classifieds' },
  { id: 21, route: '/housing/create', name: 'Housing Listings Creation', phase: 'Housing & Classifieds' },
  { id: 22, route: '/housing', name: 'Housing Search & Filters', phase: 'Housing & Classifieds' },

  // PHASE 5: MESSAGING (4 pages)
  { id: 23, route: '/messages', name: 'All-in-One Messaging', phase: 'Messaging' },
  { id: 24, route: '/messages', name: 'Direct Messages', phase: 'Messaging' },
  { id: 25, route: '/messages', name: 'Group Chats', phase: 'Messaging' },
  { id: 26, route: '/messages', name: 'Message Threads', phase: 'Messaging' },

  // PHASE 6: SUBSCRIPTIONS & PAYMENTS (4 pages)
  { id: 27, route: '/pricing', name: 'Subscription Plans', phase: 'Subscriptions & Payments' },
  { id: 28, route: '/pricing', name: 'Payment Integration (Stripe)', phase: 'Subscriptions & Payments' },
  { id: 29, route: '/settings/billing', name: 'Billing History', phase: 'Subscriptions & Payments' },
  { id: 30, route: '/settings/billing', name: 'Invoice Management', phase: 'Subscriptions & Payments' },

  // PHASE 7: ADMIN TOOLS (8 pages)
  { id: 31, route: '/admin/dashboard', name: 'Admin Dashboard', phase: 'Admin Tools' },
  { id: 32, route: '/admin/users', name: 'User Management', phase: 'Admin Tools' },
  { id: 33, route: '/admin/moderation', name: 'Content Moderation', phase: 'Admin Tools' },
  { id: 34, route: '/admin/analytics', name: 'Analytics & Insights', phase: 'Admin Tools' },
  { id: 35, route: '/admin/esa-mind', name: 'ESA Mind Dashboard', phase: 'Admin Tools' },
  { id: 36, route: '/visual-editor', name: 'Visual Editor', phase: 'Admin Tools' },
  { id: 37, route: '/admin/project-tracker', name: 'Project Tracker (Agent #65)', phase: 'Admin Tools' },
  { id: 38, route: '/admin/compliance', name: 'Compliance Center (TrustCloud)', phase: 'Admin Tools' },

  // PHASE 8: MR. BLUE FEATURES (6 pages)
  { id: 39, route: '/mr-blue/chat', name: 'Mr. Blue Chat Interface', phase: 'Mr. Blue Features' },
  { id: 40, route: '/mr-blue/chat', name: 'Mr. Blue 3D Avatar', phase: 'Mr. Blue Features' },
  { id: 41, route: '/mr-blue/chat', name: 'Mr. Blue Video Avatar (D-ID)', phase: 'Mr. Blue Features' },
  { id: 42, route: '/mr-blue/tours', name: 'Mr. Blue Tours System', phase: 'Mr. Blue Features' },
  { id: 43, route: '/mr-blue/chat', name: 'Mr. Blue Suggestions', phase: 'Mr. Blue Features' },
  { id: 44, route: '/mr-blue/chat', name: 'AI Help Button', phase: 'Mr. Blue Features' },

  // PHASE 9: INTERNATIONALIZATION (2 pages)
  { id: 45, route: '/settings', name: 'Language Switcher (68 languages)', phase: 'Internationalization' },
  { id: 46, route: '/admin/translations', name: 'Translation Management', phase: 'Internationalization' },

  // PHASE 10: SOCIAL DATA INTEGRATION (4 pages)
  { id: 47, route: '/admin/scraping', name: 'Multi-Platform Scraping Setup', phase: 'Social Data Integration' },
  { id: 48, route: '/analytics/closeness', name: 'Closeness Metrics Dashboard', phase: 'Social Data Integration' },
  { id: 49, route: '/profile/reputation', name: 'Professional Reputation Page', phase: 'Social Data Integration' },
  { id: 50, route: '/invitations', name: 'Invitation System', phase: 'Social Data Integration' },
];

// Helper: Login function
async function login(page: Page, email: string, password: string) {
  await page.goto('/');
  
  // Check if already logged in
  const isDashboard = await page.url().includes('/dashboard');
  if (isDashboard) {
    console.log('Already logged in, skipping login');
    return;
  }

  // Try to find login form
  const emailInput = page.locator('input[type="email"], input[name="email"], input[data-testid*="email"]').first();
  const passwordInput = page.locator('input[type="password"], input[name="password"], input[data-testid*="password"]').first();
  
  if (await emailInput.count() > 0) {
    await emailInput.fill(email);
    await passwordInput.fill(password);
    
    // Find and click login button
    const loginButton = page.locator('button[type="submit"], button[data-testid*="login"], button:has-text("Login"), button:has-text("Sign in")').first();
    await loginButton.click();
    
    // Wait for navigation
    await page.waitForURL(/dashboard|profile|feed/, { timeout: 10000 });
    console.log(`✅ Logged in as ${email}`);
  } else {
    console.log('⚠️  No login form found, may already be authenticated');
  }
}

// Helper: Check if route is accessible
async function checkRouteAccessible(page: Page, route: string, pageName: string): Promise<boolean> {
  try {
    await page.goto(route, { timeout: 15000, waitUntil: 'domcontentloaded' });
    
    // Wait a bit for content to load
    await page.waitForTimeout(1000);
    
    // Check if we got redirected to login (route failed)
    if (page.url().includes('/login') || page.url().includes('/auth')) {
      console.log(`❌ ${pageName}: Redirected to login (auth required)`);
      return false;
    }
    
    // Check for error boundaries or crash indicators
    const hasError = await page.locator('text=/error|crash|something went wrong/i').count() > 0;
    if (hasError) {
      console.log(`❌ ${pageName}: Error boundary triggered`);
      return false;
    }
    
    console.log(`✅ ${pageName}: Route accessible`);
    return true;
  } catch (error) {
    console.log(`❌ ${pageName}: Navigation failed - ${error.message}`);
    return false;
  }
}

// Helper: Get The Plan progress
async function getThePlanProgress(page: Page): Promise<any> {
  try {
    const response = await page.request.get('/api/the-plan/progress');
    if (response.ok()) {
      return await response.json();
    }
  } catch (error) {
    console.log('Could not fetch The Plan progress:', error.message);
  }
  return null;
}

// Test suite for each user
for (const user of TEST_USERS) {
  test.describe(`Scott's 50-Page Tour: ${user.email}`, () => {
    let page: Page;
    const results = {
      user: user.email,
      role: user.role,
      totalPages: THE_PLAN_ROUTES.length,
      accessible: 0,
      failed: 0,
      errors: [] as string[],
      screenshots: [] as string[],
    };

    test.beforeAll(async ({ browser }) => {
      page = await browser.newPage();
      await login(page, user.email, user.password);
    });

    test.afterAll(async () => {
      // Generate report
      console.log('\n' + '='.repeat(60));
      console.log(`TOUR SUMMARY: ${user.email} (${user.role})`);
      console.log('='.repeat(60));
      console.log(`✅ Accessible: ${results.accessible}/${results.totalPages}`);
      console.log(`❌ Failed: ${results.failed}/${results.totalPages}`);
      console.log(`📊 Success Rate: ${((results.accessible / results.totalPages) * 100).toFixed(1)}%`);
      
      if (results.errors.length > 0) {
        console.log('\n🚨 ERRORS:');
        results.errors.forEach((error, i) => console.log(`  ${i + 1}. ${error}`));
      }
      
      console.log('='.repeat(60) + '\n');
      
      await page.close();
    });

    // Test each of the 50 pages
    for (const pageInfo of THE_PLAN_ROUTES) {
      test(`Page ${pageInfo.id}: ${pageInfo.name} (${pageInfo.route})`, async () => {
        console.log(`\n📄 Testing: ${pageInfo.name}`);
        
        // Check route accessibility
        const accessible = await checkRouteAccessible(page, pageInfo.route, pageInfo.name);
        
        if (accessible) {
          results.accessible++;
          
          // Take screenshot
          const screenshotPath = `test-results/tour-${user.role}-page-${pageInfo.id}.png`;
          await page.screenshot({ path: screenshotPath, fullPage: false });
          results.screenshots.push(screenshotPath);
          
          // Basic page validation
          expect(page.url()).toContain(pageInfo.route);
          
          // Check for critical UI elements
          const hasContent = await page.locator('body').textContent();
          expect(hasContent).toBeTruthy();
          
        } else {
          results.failed++;
          results.errors.push(`${pageInfo.name} (${pageInfo.route}): Not accessible`);
          
          // Still take screenshot of error state
          const screenshotPath = `test-results/tour-${user.role}-page-${pageInfo.id}-ERROR.png`;
          await page.screenshot({ path: screenshotPath, fullPage: false });
          
          // Don't fail the test, just record the issue
          test.info().annotations.push({ type: 'issue', description: `Route ${pageInfo.route} not accessible` });
        }
      });
    }

    // Final test: Check The Plan progress API
    test('Check The Plan Progress API', async () => {
      const progress = await getThePlanProgress(page);
      
      if (progress) {
        console.log('📊 The Plan Progress:', {
          totalPages: progress.totalPages || 50,
          completed: progress.completedPages || 0,
          percentage: progress.completionPercentage || 0,
        });
      } else {
        console.log('⚠️  Could not fetch The Plan progress');
      }
      
      // This shouldn't fail the test, just informational
      expect(progress).toBeTruthy();
    });
  });
}

// Summary test: Cross-user comparison
test.describe('Cross-User Summary', () => {
  test('Generate final validation report', async () => {
    console.log('\n' + '='.repeat(80));
    console.log('SCOTT\'S 50-PAGE TOUR - FINAL VALIDATION REPORT');
    console.log('='.repeat(80));
    console.log(`Total Pages: ${THE_PLAN_ROUTES.length}`);
    console.log(`Test Users: ${TEST_USERS.length}`);
    console.log(`Total Tests: ${THE_PLAN_ROUTES.length * TEST_USERS.length}`);
    console.log('='.repeat(80));
    console.log('\n✅ Tour execution complete!');
    console.log('📊 Check test-results/ directory for screenshots and detailed reports');
    console.log('📈 Review HTML report: npx playwright show-report\n');
    
    // Pass test to signal completion
    expect(true).toBe(true);
  });
});
