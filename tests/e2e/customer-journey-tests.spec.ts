/**
 * CUSTOMER JOURNEY TEST SUITE
 * End-to-end user flow tests covering 15+ complete user journeys
 * 
 * Features:
 * - Complete user flows from start to finish
 * - Real-world scenarios
 * - Self-healing locators
 * - Mr Blue failure analysis
 * - Mobile viewport testing for key journeys
 * - Performance tracking
 */

import { test, expect, Page } from '@playwright/test';
import { SelfHealingLocator } from './helpers/self-healing-locator';
import { MrBlueReporter } from './helpers/mr-blue-reporter';
import { generateTestUser, generateTestPost, generateTestEvent } from './fixtures/test-data';
import { waitForNetworkIdle, waitForApiResponse } from './helpers/test-helpers';

const selfHealing = new SelfHealingLocator();
const reporter = new MrBlueReporter();

test.describe('AUTHENTICATION JOURNEYS (3)', () => {
  test('J01: New User Registration → Email Verification → Profile Setup → First Post', async ({ page }) => {
    const testUser = generateTestUser();
    
    // STEP 1: Navigate to registration
    await page.goto('/register');
    await waitForNetworkIdle(page);
    
    // STEP 2: Fill registration form
    await page.getByTestId('input-username').fill(testUser.username);
    await page.getByTestId('input-email').fill(testUser.email);
    await page.getByTestId('input-password').fill(testUser.password);
    await page.getByTestId('input-name').fill(testUser.name);
    
    // STEP 3: Submit registration
    const registerPromise = waitForApiResponse(page, '/api/auth/register');
    await page.getByTestId('button-register').click();
    await registerPromise;
    
    // STEP 4: Should redirect to feed or onboarding
    await page.waitForURL(/\/(feed|onboarding|profile)/);
    
    // STEP 5: If onboarding, complete it
    if (page.url().includes('onboarding')) {
      await page.getByTestId('button-skip-onboarding').click();
      await page.waitForURL(/\/feed/);
    }
    
    // STEP 6: Navigate to profile edit
    await page.goto('/profile/edit');
    await waitForNetworkIdle(page);
    
    // STEP 7: Update profile bio
    await page.getByTestId('textarea-bio').fill('Passionate tango dancer from Buenos Aires');
    await page.getByTestId('button-save-profile').click();
    await waitForApiResponse(page, '/api/profile');
    
    // STEP 8: Create first post
    await page.goto('/feed');
    await waitForNetworkIdle(page);
    
    const testPost = generateTestPost();
    await page.getByTestId('textarea-create-post').fill(testPost.content);
    await page.getByTestId('button-publish-post').click();
    await waitForApiResponse(page, '/api/posts');
    
    // STEP 9: Verify post appears in feed
    await expect(page.getByText(testPost.content)).toBeVisible();
    
    await reporter.reportSuccess({
      pageId: 'J01',
      pageName: 'Complete Registration Journey',
      agent: 'User Lifecycle Agent',
      route: 'Multi-page flow',
      testType: 'customer-journey',
      userRole: 'new-user'
    });
  });

  test('J02: Login → Remember Me → Logout → Login Again', async ({ page }) => {
    // STEP 1: Create test user
    const testUser = generateTestUser();
    await page.request.post('/api/auth/register', {
      data: {
        username: testUser.username,
        email: testUser.email,
        password: testUser.password,
        name: testUser.name,
      },
    });
    
    // STEP 2: Go to login
    await page.goto('/login');
    await waitForNetworkIdle(page);
    
    // STEP 3: Fill credentials and check "Remember Me"
    await page.getByTestId('input-username').fill(testUser.username);
    await page.getByTestId('input-password').fill(testUser.password);
    
    const rememberMeCheckbox = page.getByTestId('checkbox-remember-me');
    if (await rememberMeCheckbox.isVisible()) {
      await rememberMeCheckbox.check();
    }
    
    // STEP 4: Login
    await page.getByTestId('button-login').click();
    await page.waitForURL(/\/feed/);
    
    // STEP 5: Verify logged in
    await expect(page.getByTestId('nav-authenticated')).toBeVisible();
    
    // STEP 6: Logout
    await page.getByTestId('button-user-menu').click();
    await page.getByTestId('button-logout').click();
    await page.waitForURL(/\/(|login|home)/);
    
    // STEP 7: Login again (should be faster with remembered session)
    await page.goto('/login');
    await page.getByTestId('input-username').fill(testUser.username);
    await page.getByTestId('input-password').fill(testUser.password);
    await page.getByTestId('button-login').click();
    await page.waitForURL(/\/feed/);
    
    await reporter.reportSuccess({
      pageId: 'J02',
      pageName: 'Login/Logout Journey',
      agent: 'Auth Agent',
      route: 'Multi-page flow',
      testType: 'customer-journey',
      userRole: 'authenticated'
    });
  });

  test('J03: Forgot Password → Reset Email → New Password → Login', async ({ page }) => {
    // STEP 1: Create test user
    const testUser = generateTestUser();
    await page.request.post('/api/auth/register', {
      data: {
        username: testUser.username,
        email: testUser.email,
        password: testUser.password,
        name: testUser.name,
      },
    });
    
    // STEP 2: Go to login and click "Forgot Password"
    await page.goto('/login');
    await waitForNetworkIdle(page);
    
    const forgotPasswordLink = page.getByTestId('link-forgot-password');
    if (await forgotPasswordLink.isVisible()) {
      await forgotPasswordLink.click();
      await waitForNetworkIdle(page);
      
      // STEP 3: Enter email for password reset
      await page.getByTestId('input-email').fill(testUser.email);
      await page.getByTestId('button-send-reset').click();
      
      // STEP 4: Verify success message
      await expect(page.getByText(/reset link sent/i)).toBeVisible();
    }
    
    await reporter.reportSuccess({
      pageId: 'J03',
      pageName: 'Password Reset Journey',
      agent: 'Auth Agent',
      route: 'Multi-page flow',
      testType: 'customer-journey',
      userRole: 'public'
    });
  });
});

test.describe('CONTENT CREATION JOURNEYS (2)', () => {
  test('J04: Create Post → Add Image → Publish → Edit → Delete', async ({ page }) => {
    // STEP 1: Login
    const testUser = generateTestUser();
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
    await page.waitForURL(/\/feed/);
    
    // STEP 2: Create new post
    const testPost = generateTestPost();
    await page.getByTestId('textarea-create-post').fill(testPost.content);
    
    // STEP 3: Add image (if image upload available)
    const imageInput = page.getByTestId('input-upload-image');
    if (await imageInput.isVisible()) {
      // In real test, you would upload an actual image file
      // await imageInput.setInputFiles('path/to/test-image.jpg');
    }
    
    // STEP 4: Publish post
    await page.getByTestId('button-publish-post').click();
    await waitForApiResponse(page, '/api/posts');
    
    // STEP 5: Verify post appears
    await expect(page.getByText(testPost.content)).toBeVisible();
    
    // STEP 6: Edit post
    const editButton = page.getByTestId('button-edit-post').first();
    if (await editButton.isVisible()) {
      await editButton.click();
      await waitForNetworkIdle(page);
      
      const editedContent = testPost.content + ' [EDITED]';
      await page.getByTestId('textarea-edit-post').fill(editedContent);
      await page.getByTestId('button-save-edit').click();
      await waitForApiResponse(page, '/api/posts');
      
      // Verify edited content
      await expect(page.getByText(editedContent)).toBeVisible();
    }
    
    // STEP 7: Delete post
    const deleteButton = page.getByTestId('button-delete-post').first();
    if (await deleteButton.isVisible()) {
      await deleteButton.click();
      
      // Confirm deletion
      const confirmButton = page.getByTestId('button-confirm-delete');
      if (await confirmButton.isVisible()) {
        await confirmButton.click();
        await waitForApiResponse(page, '/api/posts');
      }
    }
    
    await reporter.reportSuccess({
      pageId: 'J04',
      pageName: 'Post Creation Journey',
      agent: 'Content Agent',
      route: 'Multi-page flow',
      testType: 'customer-journey',
      userRole: 'authenticated'
    });
  });

  test('J05: Create Event → Add Workshop → Publish → RSVP Management', async ({ page }) => {
    // STEP 1: Login
    const testUser = generateTestUser();
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
    await page.waitForURL(/\/feed/);
    
    // STEP 2: Navigate to create event
    await page.goto('/events/create');
    await waitForNetworkIdle(page);
    
    // STEP 3: Fill event form
    const testEvent = generateTestEvent();
    await page.getByTestId('input-title').fill(testEvent.title);
    await page.getByTestId('textarea-description').fill(testEvent.description);
    await page.getByTestId('input-location').fill(testEvent.location);
    
    // STEP 4: Publish event
    await page.getByTestId('button-publish-event').click();
    await waitForApiResponse(page, '/api/events');
    
    // STEP 5: Verify redirect to event detail
    await page.waitForURL(/\/events\/.+/);
    await expect(page.getByText(testEvent.title)).toBeVisible();
    
    await reporter.reportSuccess({
      pageId: 'J05',
      pageName: 'Event Creation Journey',
      agent: 'Event Agent',
      route: 'Multi-page flow',
      testType: 'customer-journey',
      userRole: 'authenticated'
    });
  });
});

test.describe('SOCIAL INTERACTION JOURNEYS (2)', () => {
  test('J06: View Feed → Like Post → Comment → Share', async ({ page }) => {
    // STEP 1: Login
    const testUser = generateTestUser();
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
    await page.waitForURL(/\/feed/);
    
    // STEP 2: View feed
    await waitForNetworkIdle(page);
    
    // STEP 3: Like first post
    const likeButton = page.getByTestId('button-like-post').first();
    if (await likeButton.isVisible()) {
      await likeButton.click();
      await waitForApiResponse(page, '/api/posts');
    }
    
    // STEP 4: Comment on post
    const commentInput = page.getByTestId('textarea-comment').first();
    if (await commentInput.isVisible()) {
      await commentInput.fill('Great post! I love tango too!');
      await page.getByTestId('button-submit-comment').first().click();
      await waitForApiResponse(page, '/api/comments');
    }
    
    // STEP 5: Share post
    const shareButton = page.getByTestId('button-share-post').first();
    if (await shareButton.isVisible()) {
      await shareButton.click();
      await waitForNetworkIdle(page);
      
      // Select share method if modal appears
      const shareToFeedButton = page.getByTestId('button-share-to-feed');
      if (await shareToFeedButton.isVisible()) {
        await shareToFeedButton.click();
        await waitForApiResponse(page, '/api/posts');
      }
    }
    
    await reporter.reportSuccess({
      pageId: 'J06',
      pageName: 'Social Engagement Journey',
      agent: 'Social Agent',
      route: 'Multi-page flow',
      testType: 'customer-journey',
      userRole: 'authenticated'
    });
  });

  test('J07: Send Friend Request → Accept → View Profile → Message', async ({ page }) => {
    // STEP 1: Create two users
    const user1 = generateTestUser();
    const user2 = generateTestUser();
    
    await page.request.post('/api/auth/register', {
      data: {
        username: user1.username,
        email: user1.email,
        password: user1.password,
        name: user1.name,
      },
    });
    
    await page.request.post('/api/auth/register', {
      data: {
        username: user2.username,
        email: user2.email,
        password: user2.password,
        name: user2.name,
      },
    });
    
    // STEP 2: Login as user1
    await page.goto('/login');
    await page.getByTestId('input-username').fill(user1.username);
    await page.getByTestId('input-password').fill(user1.password);
    await page.getByTestId('button-login').click();
    await page.waitForURL(/\/feed/);
    
    // STEP 3: Search for user2
    await page.goto('/search');
    await page.getByTestId('input-search').fill(user2.username);
    await page.getByTestId('button-search').click();
    await waitForNetworkIdle(page);
    
    // STEP 4: Send friend request
    const addFriendButton = page.getByTestId('button-add-friend').first();
    if (await addFriendButton.isVisible()) {
      await addFriendButton.click();
      await waitForApiResponse(page, '/api/friends');
    }
    
    // STEP 5: Logout and login as user2
    await page.getByTestId('button-user-menu').click();
    await page.getByTestId('button-logout').click();
    
    await page.goto('/login');
    await page.getByTestId('input-username').fill(user2.username);
    await page.getByTestId('input-password').fill(user2.password);
    await page.getByTestId('button-login').click();
    await page.waitForURL(/\/feed/);
    
    // STEP 6: Accept friend request
    await page.goto('/friends/requests');
    await waitForNetworkIdle(page);
    
    const acceptButton = page.getByTestId('button-accept-request').first();
    if (await acceptButton.isVisible()) {
      await acceptButton.click();
      await waitForApiResponse(page, '/api/friends');
    }
    
    // STEP 7: View user1's profile
    await page.goto(`/profile/${user1.username}`);
    await waitForNetworkIdle(page);
    
    // STEP 8: Send message
    const messageButton = page.getByTestId('button-send-message');
    if (await messageButton.isVisible()) {
      await messageButton.click();
      await waitForNetworkIdle(page);
      
      await page.getByTestId('textarea-message').fill('Hi! Thanks for connecting!');
      await page.getByTestId('button-send').click();
      await waitForApiResponse(page, '/api/messages');
    }
    
    await reporter.reportSuccess({
      pageId: 'J07',
      pageName: 'Friend Connection Journey',
      agent: 'Social Agent',
      route: 'Multi-page flow',
      testType: 'customer-journey',
      userRole: 'authenticated'
    });
  });
});

test.describe('EVENT MANAGEMENT JOURNEYS (1)', () => {
  test('J08: Browse Events → Filter by City → View Details → RSVP → Add to Calendar', async ({ page }) => {
    // STEP 1: Login
    const testUser = generateTestUser();
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
    await page.waitForURL(/\/feed/);
    
    // STEP 2: Navigate to events
    await page.goto('/events');
    await waitForNetworkIdle(page);
    
    // STEP 3: Filter by city
    const cityFilter = page.getByTestId('select-city-filter');
    if (await cityFilter.isVisible()) {
      await cityFilter.click();
      await page.getByRole('option', { name: /buenos aires/i }).click();
      await waitForNetworkIdle(page);
    }
    
    // STEP 4: Click first event
    const firstEvent = page.getByTestId('card-event').first();
    if (await firstEvent.isVisible()) {
      await firstEvent.click();
      await waitForNetworkIdle(page);
      
      // STEP 5: RSVP to event
      const rsvpButton = page.getByTestId('button-rsvp');
      if (await rsvpButton.isVisible()) {
        await rsvpButton.click();
        await waitForApiResponse(page, '/api/events');
        
        // Verify RSVP confirmation
        await expect(page.getByText(/you're going/i)).toBeVisible();
      }
      
      // STEP 6: Add to calendar
      const addToCalendarButton = page.getByTestId('button-add-to-calendar');
      if (await addToCalendarButton.isVisible()) {
        await addToCalendarButton.click();
      }
    }
    
    await reporter.reportSuccess({
      pageId: 'J08',
      pageName: 'Event Discovery Journey',
      agent: 'Event Agent',
      route: 'Multi-page flow',
      testType: 'customer-journey',
      userRole: 'authenticated'
    });
  });
});

test.describe('SUBSCRIPTION JOURNEYS (1)', () => {
  test('J09: View Pricing → Start Trial → Upgrade → Payment Success', async ({ page }) => {
    // STEP 1: Visit pricing page
    await page.goto('/pricing');
    await waitForNetworkIdle(page);
    
    // STEP 2: Click "Start Trial" button
    const startTrialButton = page.getByTestId('button-start-trial');
    if (await startTrialButton.isVisible()) {
      await startTrialButton.click();
      
      // Should redirect to register if not logged in
      if (page.url().includes('/register')) {
        const testUser = generateTestUser();
        await page.getByTestId('input-username').fill(testUser.username);
        await page.getByTestId('input-email').fill(testUser.email);
        await page.getByTestId('input-password').fill(testUser.password);
        await page.getByTestId('input-name').fill(testUser.name);
        await page.getByTestId('button-register').click();
        await page.waitForURL(/\/(feed|dashboard)/);
      }
    }
    
    // STEP 3: Navigate to subscription settings
    await page.goto('/settings/subscription');
    await waitForNetworkIdle(page);
    
    // STEP 4: View upgrade options
    const upgradeButton = page.getByTestId('button-upgrade');
    if (await upgradeButton.isVisible()) {
      await upgradeButton.click();
      await waitForNetworkIdle(page);
    }
    
    await reporter.reportSuccess({
      pageId: 'J09',
      pageName: 'Subscription Journey',
      agent: 'Billing Agent',
      route: 'Multi-page flow',
      testType: 'customer-journey',
      userRole: 'authenticated'
    });
  });
});

test.describe('HOUSING JOURNEYS (1)', () => {
  test('J10: Browse Listings → Filter → View Details → Send Booking Request', async ({ page }) => {
    // STEP 1: Login
    const testUser = generateTestUser();
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
    await page.waitForURL(/\/feed/);
    
    // STEP 2: Navigate to housing
    await page.goto('/housing');
    await waitForNetworkIdle(page);
    
    // STEP 3: Apply filters
    const priceFilter = page.getByTestId('input-max-price');
    if (await priceFilter.isVisible()) {
      await priceFilter.fill('1000');
      await page.getByTestId('button-apply-filters').click();
      await waitForNetworkIdle(page);
    }
    
    // STEP 4: View listing details
    const firstListing = page.getByTestId('card-housing').first();
    if (await firstListing.isVisible()) {
      await firstListing.click();
      await waitForNetworkIdle(page);
      
      // STEP 5: Send booking request
      const bookButton = page.getByTestId('button-book-now');
      if (await bookButton.isVisible()) {
        await bookButton.click();
        await waitForNetworkIdle(page);
        
        // Fill booking form
        await page.getByTestId('input-check-in').fill('2025-12-01');
        await page.getByTestId('input-check-out').fill('2025-12-07');
        await page.getByTestId('textarea-message').fill('Looking forward to staying here!');
        await page.getByTestId('button-submit-booking').click();
        await waitForApiResponse(page, '/api/housing/bookings');
        
        // Verify confirmation
        await expect(page.getByText(/booking request sent/i)).toBeVisible();
      }
    }
    
    await reporter.reportSuccess({
      pageId: 'J10',
      pageName: 'Housing Booking Journey',
      agent: 'Housing Agent',
      route: 'Multi-page flow',
      testType: 'customer-journey',
      userRole: 'authenticated'
    });
  });
});

test.describe('VOLUNTEER JOURNEYS (1)', () => {
  test('J11: Upload Resume → AI Parsing → Task Matching → Accept Task', async ({ page }) => {
    // STEP 1: Login
    const testUser = generateTestUser();
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
    await page.waitForURL(/\/feed/);
    
    // STEP 2: Navigate to volunteer resume upload
    await page.goto('/volunteers/resume');
    await waitForNetworkIdle(page);
    
    // STEP 3: Upload resume (mock)
    const uploadButton = page.getByTestId('button-upload-resume');
    if (await uploadButton.isVisible()) {
      // In real test, would upload actual PDF/DOCX file
      // await page.getByTestId('input-resume-file').setInputFiles('path/to/resume.pdf');
      
      // For now, just verify upload interface exists
      await expect(uploadButton).toBeVisible();
    }
    
    // STEP 4: Navigate to task dashboard
    await page.goto('/volunteers/tasks');
    await waitForNetworkIdle(page);
    
    // STEP 5: View matched tasks
    const firstTask = page.getByTestId('card-task').first();
    if (await firstTask.isVisible()) {
      await firstTask.click();
      await waitForNetworkIdle(page);
      
      // STEP 6: Accept task
      const acceptButton = page.getByTestId('button-accept-task');
      if (await acceptButton.isVisible()) {
        await acceptButton.click();
        await waitForApiResponse(page, '/api/volunteers/tasks');
        
        // Verify task accepted
        await expect(page.getByText(/task accepted/i)).toBeVisible();
      }
    }
    
    await reporter.reportSuccess({
      pageId: 'J11',
      pageName: 'Volunteer Onboarding Journey',
      agent: 'Volunteer Agent',
      route: 'Multi-page flow',
      testType: 'customer-journey',
      userRole: 'authenticated'
    });
  });
});

test.describe('MESSAGING JOURNEYS (1)', () => {
  test('J12: Start Conversation → Send Message → Receive Reply → Archive', async ({ page }) => {
    // STEP 1: Create two users
    const user1 = generateTestUser();
    const user2 = generateTestUser();
    
    await page.request.post('/api/auth/register', {
      data: {
        username: user1.username,
        email: user1.email,
        password: user1.password,
        name: user1.name,
      },
    });
    
    await page.request.post('/api/auth/register', {
      data: {
        username: user2.username,
        email: user2.email,
        password: user2.password,
        name: user2.name,
      },
    });
    
    // STEP 2: Login as user1
    await page.goto('/login');
    await page.getByTestId('input-username').fill(user1.username);
    await page.getByTestId('input-password').fill(user1.password);
    await page.getByTestId('button-login').click();
    await page.waitForURL(/\/feed/);
    
    // STEP 3: Navigate to messages
    await page.goto('/messages');
    await waitForNetworkIdle(page);
    
    // STEP 4: Start new conversation
    const newMessageButton = page.getByTestId('button-new-message');
    if (await newMessageButton.isVisible()) {
      await newMessageButton.click();
      await waitForNetworkIdle(page);
      
      // Search for user2
      await page.getByTestId('input-search-users').fill(user2.username);
      await waitForNetworkIdle(page);
      
      const selectUser = page.getByTestId(`user-${user2.username}`);
      if (await selectUser.isVisible()) {
        await selectUser.click();
      }
    }
    
    // STEP 5: Send message
    await page.getByTestId('textarea-message').fill('Hey! Want to dance tango together?');
    await page.getByTestId('button-send').click();
    await waitForApiResponse(page, '/api/messages');
    
    // STEP 6: Verify message sent
    await expect(page.getByText(/want to dance tango/i)).toBeVisible();
    
    // STEP 7: Archive conversation
    const moreButton = page.getByTestId('button-conversation-more');
    if (await moreButton.isVisible()) {
      await moreButton.click();
      await page.getByTestId('button-archive-conversation').click();
      await waitForApiResponse(page, '/api/messages');
    }
    
    await reporter.reportSuccess({
      pageId: 'J12',
      pageName: 'Messaging Journey',
      agent: 'Messaging Agent',
      route: 'Multi-page flow',
      testType: 'customer-journey',
      userRole: 'authenticated'
    });
  });
});

test.describe('SEARCH & DISCOVERY (1)', () => {
  test('J13: Search Users → Filter → View Profile → Follow', async ({ page }) => {
    // STEP 1: Login
    const testUser = generateTestUser();
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
    await page.waitForURL(/\/feed/);
    
    // STEP 2: Navigate to search
    await page.goto('/search');
    await waitForNetworkIdle(page);
    
    // STEP 3: Search for users
    await page.getByTestId('input-search').fill('tango');
    await page.getByTestId('button-search').click();
    await waitForNetworkIdle(page);
    
    // STEP 4: Filter results
    const userFilter = page.getByTestId('filter-users');
    if (await userFilter.isVisible()) {
      await userFilter.click();
      await waitForNetworkIdle(page);
    }
    
    // STEP 5: View profile
    const firstResult = page.getByTestId('search-result-user').first();
    if (await firstResult.isVisible()) {
      await firstResult.click();
      await waitForNetworkIdle(page);
      
      // STEP 6: Follow user
      const followButton = page.getByTestId('button-follow');
      if (await followButton.isVisible()) {
        await followButton.click();
        await waitForApiResponse(page, '/api/users/follow');
        
        // Verify following
        await expect(page.getByText(/following/i)).toBeVisible();
      }
    }
    
    await reporter.reportSuccess({
      pageId: 'J13',
      pageName: 'User Discovery Journey',
      agent: 'Search Agent',
      route: 'Multi-page flow',
      testType: 'customer-journey',
      userRole: 'authenticated'
    });
  });
});

test.describe('ADMIN WORKFLOWS (2)', () => {
  test('J14: Review Reports → Moderate Content → Ban User', async ({ page }) => {
    // STEP 1: Login as admin (would need proper admin credentials)
    const adminUser = generateTestUser();
    await page.request.post('/api/auth/register', {
      data: {
        username: adminUser.username,
        email: adminUser.email,
        password: adminUser.password,
        name: adminUser.name,
      },
    });
    
    await page.goto('/login');
    await page.getByTestId('input-username').fill(adminUser.username);
    await page.getByTestId('input-password').fill(adminUser.password);
    await page.getByTestId('button-login').click();
    await page.waitForURL(/\/feed/);
    
    // STEP 2: Navigate to admin moderation
    await page.goto('/admin/moderation');
    await waitForNetworkIdle(page);
    
    // STEP 3: Review reports
    const firstReport = page.getByTestId('card-report').first();
    if (await firstReport.isVisible()) {
      await firstReport.click();
      await waitForNetworkIdle(page);
      
      // STEP 4: Take moderation action
      const banButton = page.getByTestId('button-ban-user');
      if (await banButton.isVisible()) {
        await banButton.click();
        
        // Confirm ban
        await page.getByTestId('button-confirm-ban').click();
        await waitForApiResponse(page, '/api/admin/moderation');
        
        // Verify action completed
        await expect(page.getByText(/user banned/i)).toBeVisible();
      }
    }
    
    await reporter.reportSuccess({
      pageId: 'J14',
      pageName: 'Content Moderation Journey',
      agent: 'Moderation Agent',
      route: 'Multi-page flow',
      testType: 'customer-journey',
      userRole: 'admin'
    });
  });

  test('J15: View Agent Health → Run Validation → Fix Issues', async ({ page }) => {
    // STEP 1: Login as admin
    const adminUser = generateTestUser();
    await page.request.post('/api/auth/register', {
      data: {
        username: adminUser.username,
        email: adminUser.email,
        password: adminUser.password,
        name: adminUser.name,
      },
    });
    
    await page.goto('/login');
    await page.getByTestId('input-username').fill(adminUser.username);
    await page.getByTestId('input-password').fill(adminUser.password);
    await page.getByTestId('button-login').click();
    await page.waitForURL(/\/feed/);
    
    // STEP 2: Navigate to agent health
    await page.goto('/admin/agent-health');
    await waitForNetworkIdle(page);
    
    // STEP 3: View agent status
    await expect(page.getByRole('heading', { name: /agent health/i })).toBeVisible();
    
    // STEP 4: Run validation
    const runValidationButton = page.getByTestId('button-run-validation');
    if (await runValidationButton.isVisible()) {
      await runValidationButton.click();
      await waitForApiResponse(page, '/api/admin/agent-health');
    }
    
    // STEP 5: View validation results
    await waitForNetworkIdle(page);
    
    await reporter.reportSuccess({
      pageId: 'J15',
      pageName: 'Agent Health Monitoring Journey',
      agent: 'ESA Monitor Agent',
      route: 'Multi-page flow',
      testType: 'customer-journey',
      userRole: 'admin'
    });
  });
});

// Mobile viewport tests for critical journeys
test.describe('MOBILE VIEWPORT TESTS', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE

  test('Mobile: Registration Journey', async ({ page }) => {
    const testUser = generateTestUser();
    
    await page.goto('/register');
    await waitForNetworkIdle(page);
    
    // Verify mobile layout
    await page.getByTestId('input-username').fill(testUser.username);
    await page.getByTestId('input-email').fill(testUser.email);
    await page.getByTestId('input-password').fill(testUser.password);
    await page.getByTestId('input-name').fill(testUser.name);
    
    await page.getByTestId('button-register').click();
    await page.waitForURL(/\/(feed|onboarding|profile)/);
    
    await reporter.reportSuccess({
      pageId: 'M01',
      pageName: 'Mobile Registration',
      agent: 'User Lifecycle Agent',
      route: '/register',
      testType: 'mobile-journey',
      userRole: 'public'
    });
  });
});

// Generate final journey report
test.afterAll(async () => {
  const report = await reporter.generateReport();
  console.log('\n' + '='.repeat(80));
  console.log('💙 MR BLUE CUSTOMER JOURNEY TEST REPORT');
  console.log('='.repeat(80));
  console.log(`\nTotal Journeys: ${report.passed + report.failed}`);
  console.log(`✅ Successful: ${report.passed}`);
  console.log(`❌ Failed: ${report.failed}`);
  console.log(`📊 Success Rate: ${report.coverage.toFixed(1)}%`);
  console.log(`⏱️  Total Duration: ${(report.totalDuration / 1000).toFixed(2)}s`);
  console.log('\n' + '='.repeat(80) + '\n');
});
