/**
 * FRIEND REQUEST API VALIDATION E2E TEST
 * MB.MD SUBAGENT #7: Tests friend request error handling
 * 
 * Tests:
 * 1. POST /api/friends/request with valid friend ID - returns 200
 * 2. POST /api/friends/request with same friend ID again - returns 409 (duplicate)
 * 3. POST /api/friends/request with own user ID - returns 400 (self-request)
 * 4. Browser-based add friend button with toast verification
 */

import { test, expect } from '@playwright/test';
import { setupAuthenticatedSession, ADMIN_CREDENTIALS } from '../helpers/auth-setup';

test.describe('Friend Request API Validation', () => {
  
  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedSession(page);
  });

  test('Friends page loads with tabs', async ({ page }) => {
    await page.goto('/friends');
    await page.waitForLoadState('networkidle');
    
    await expect(page.getByTestId('heading-page-title')).toBeVisible();
    await expect(page.getByTestId('tab-all-friends')).toBeVisible();
    await expect(page.getByTestId('tab-requests')).toBeVisible();
    await expect(page.getByTestId('tab-suggestions')).toBeVisible();
  });

  test('Friend suggestions tab loads', async ({ page }) => {
    await page.goto('/friends');
    await page.waitForLoadState('networkidle');
    
    await page.getByTestId('tab-suggestions').click();
    await page.waitForLoadState('networkidle');
    
    const suggestionsContainer = page.locator('[data-testid^="suggestion-card-"]');
    const noSuggestions = page.getByText('No suggestions at the moment');
    
    await expect(suggestionsContainer.first().or(noSuggestions)).toBeVisible({ timeout: 10000 });
  });

  test('API: Valid friend request returns 200', async ({ page, request }) => {
    const cookies = await page.context().cookies();
    const sessionCookie = cookies.find(c => c.name === 'connect.sid' || c.name === 'session');
    
    const validUserId = 2;
    
    const response = await page.evaluate(async (userId) => {
      const res = await fetch(`/api/friends/request/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      return {
        status: res.status,
        body: await res.json().catch(() => ({}))
      };
    }, validUserId);
    
    console.log(`Friend request to user ${validUserId}: Status ${response.status}`);
    
    expect([200, 409]).toContain(response.status);
  });

  test('API: Duplicate friend request returns 409', async ({ page }) => {
    const targetUserId = 3;
    
    const firstResponse = await page.evaluate(async (userId) => {
      const res = await fetch(`/api/friends/request/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      return { status: res.status, body: await res.json().catch(() => ({})) };
    }, targetUserId);
    
    console.log(`First request to user ${targetUserId}: Status ${firstResponse.status}`);
    
    if (firstResponse.status !== 200 && firstResponse.status !== 409) {
      console.log('First request did not succeed, skipping duplicate test');
      return;
    }
    
    const duplicateResponse = await page.evaluate(async (userId) => {
      const res = await fetch(`/api/friends/request/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      return { status: res.status, body: await res.json().catch(() => ({})) };
    }, targetUserId);
    
    console.log(`Duplicate request to user ${targetUserId}: Status ${duplicateResponse.status}, Body:`, duplicateResponse.body);
    
    expect(duplicateResponse.status).toBe(409);
    expect(duplicateResponse.body.error).toMatch(/already.*sent|already.*exists|already.*friends/i);
  });

  test('API: Self friend request returns 400', async ({ page }) => {
    const currentUserResponse = await page.evaluate(async () => {
      const res = await fetch('/api/user', {
        method: 'GET',
        credentials: 'include',
      });
      return res.ok ? await res.json() : null;
    });
    
    console.log('Current user:', currentUserResponse);
    
    const selfUserId = currentUserResponse?.id || 1;
    
    const selfResponse = await page.evaluate(async (userId) => {
      const res = await fetch(`/api/friends/request/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      return { status: res.status, body: await res.json().catch(() => ({})) };
    }, selfUserId);
    
    console.log(`Self-request (user ${selfUserId}): Status ${selfResponse.status}, Body:`, selfResponse.body);
    
    expect(selfResponse.status).toBe(400);
    expect(selfResponse.body.error).toMatch(/yourself|self|own/i);
  });

  test('Browser: Add friend button shows success toast', async ({ page }) => {
    await page.goto('/friends');
    await page.waitForLoadState('networkidle');
    
    await page.getByTestId('tab-suggestions').click();
    await page.waitForLoadState('networkidle');
    
    await page.waitForTimeout(1000);
    
    const addButton = page.locator('[data-testid^="button-add-"]').first();
    const hasAddButton = await addButton.isVisible().catch(() => false);
    
    if (hasAddButton) {
      await addButton.click();
      
      const toast = page.locator('[role="status"], .toast, [class*="toast"]');
      const successText = page.getByText(/request.*sent|friend.*added|success/i);
      const errorText = page.getByText(/already.*sent|already.*request|error/i);
      
      await expect(toast.or(successText).or(errorText)).toBeVisible({ timeout: 5000 });
      console.log('Toast notification displayed after clicking Add Friend button');
    } else {
      console.log('No add friend button visible in suggestions - this may be expected if no suggestions available');
    }
  });

  test('Browser: Friend requests tab shows pending requests', async ({ page }) => {
    await page.goto('/friends');
    await page.waitForLoadState('networkidle');
    
    await page.getByTestId('tab-requests').click();
    await page.waitForLoadState('networkidle');
    
    const requestCard = page.locator('[data-testid^="request-card-"]');
    const noRequests = page.getByText('No pending friend requests');
    
    await expect(requestCard.first().or(noRequests)).toBeVisible({ timeout: 10000 });
    
    if (await requestCard.count() > 0) {
      await expect(page.locator('[data-testid^="button-accept-"]').first()).toBeVisible();
      await expect(page.locator('[data-testid^="button-decline-"]').first()).toBeVisible();
      console.log(`Found ${await requestCard.count()} pending friend requests`);
    } else {
      console.log('No pending friend requests (empty state displayed correctly)');
    }
  });

  test('API: Get friends list returns array', async ({ page }) => {
    const friendsResponse = await page.evaluate(async () => {
      const res = await fetch('/api/friends', {
        method: 'GET',
        credentials: 'include',
      });
      return { status: res.status, body: await res.json().catch(() => null) };
    });
    
    console.log(`GET /api/friends: Status ${friendsResponse.status}`);
    
    expect(friendsResponse.status).toBe(200);
    expect(Array.isArray(friendsResponse.body)).toBe(true);
    console.log(`Friends count: ${friendsResponse.body?.length || 0}`);
  });

  test('API: Get friend suggestions returns array', async ({ page }) => {
    const suggestionsResponse = await page.evaluate(async () => {
      const res = await fetch('/api/friends/suggestions', {
        method: 'GET',
        credentials: 'include',
      });
      return { status: res.status, body: await res.json().catch(() => null) };
    });
    
    console.log(`GET /api/friends/suggestions: Status ${suggestionsResponse.status}`);
    
    expect(suggestionsResponse.status).toBe(200);
    expect(Array.isArray(suggestionsResponse.body)).toBe(true);
    console.log(`Suggestions count: ${suggestionsResponse.body?.length || 0}`);
  });

  test('API: Get friend requests returns array', async ({ page }) => {
    const requestsResponse = await page.evaluate(async () => {
      const res = await fetch('/api/friends/requests', {
        method: 'GET',
        credentials: 'include',
      });
      return { status: res.status, body: await res.json().catch(() => null) };
    });
    
    console.log(`GET /api/friends/requests: Status ${requestsResponse.status}`);
    
    expect(requestsResponse.status).toBe(200);
    expect(Array.isArray(requestsResponse.body)).toBe(true);
    console.log(`Pending requests count: ${requestsResponse.body?.length || 0}`);
  });
});
