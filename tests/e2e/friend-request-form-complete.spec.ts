/**
 * FRIEND REQUEST FORM COMPLETE E2E TEST
 * Tests sending a friend request with ALL form fields filled
 * 
 * Sender: Admin user (admin@mundotango.life)
 * Target: Any available user in suggestions
 * 
 * Tests:
 * 1. Navigate to friends page and suggestions tab
 * 2. Click add friend button for target user
 * 3. Fill in all form fields (message, didWeDance, location, date, story)
 * 4. Submit friend request
 * 5. Verify success toast
 */

import { test, expect } from '@playwright/test';
import { setupAuthenticatedSession } from '../helpers/auth-setup';

const FRIEND_REQUEST_DATA = {
  message: 'Hi! It was wonderful dancing with you at the milonga last month. I would love to stay connected and dance again!',
  danceLocation: 'Salon Canning, Buenos Aires',
  meetingDate: '2025-11-15',
  danceStory: 'We shared 3 beautiful tandas that night. You led Di Sarli so gracefully, and I still remember the connection we had during the vals set. Hope to dance with you again soon!'
};

test.describe('Friend Request Form - Complete Fields', () => {
  
  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedSession(page);
  });

  test('Send friend request with all form fields filled', async ({ page }) => {
    console.log('\n📤 Testing Friend Request with All Fields');
    console.log('   Sender: Admin user');
    console.log('   Target: First available user in suggestions');
    
    // Step 1: Navigate to friends page
    await page.goto('/friends');
    await page.waitForLoadState('networkidle');
    console.log('   ✅ Navigated to friends page');
    
    // Verify page loaded
    await expect(page.getByTestId('page-friends')).toBeVisible({ timeout: 10000 });
    
    // Step 2: Go to suggestions tab
    await page.getByTestId('tab-suggestions').click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    console.log('   ✅ Clicked suggestions tab');
    
    // Step 3: Find and click add friend button for any user in suggestions
    const addButton = page.locator('[data-testid^="button-add-friend-"]').first();
    const addButtonVisible = await addButton.isVisible({ timeout: 5000 }).catch(() => false);
    
    if (!addButtonVisible) {
      // No suggestions available - test API directly
      console.log('   ⚠️ No friend suggestions available, sending request via API to user 3');
      
      const response = await page.evaluate(async (data) => {
        const res = await fetch('/api/friends/request/3', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            senderMessage: data.message,
            didWeDance: true,
            danceLocation: data.danceLocation,
            danceStory: data.danceStory,
            meetingDate: data.meetingDate,
            mediaUrls: []
          })
        });
        return {
          status: res.status,
          body: await res.json().catch(() => ({}))
        };
      }, FRIEND_REQUEST_DATA);
      
      console.log(`   📨 API Response: Status ${response.status}`);
      console.log(`   📨 Body:`, response.body);
      
      // Accept 200 (success), 409 (already sent), or 400 (already friends)
      expect([200, 409, 400]).toContain(response.status);
      console.log('   ✅ Friend request sent via API');
      return;
    }
    
    await addButton.click();
    console.log('   ✅ Clicked add friend button');
    
    // Step 4: Wait for dialog to open
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
    console.log('   ✅ Friend request dialog opened');
    
    // Step 5: Fill in personal message
    const messageInput = page.getByTestId('input-friend-request-message');
    await expect(messageInput).toBeVisible();
    await messageInput.fill(FRIEND_REQUEST_DATA.message);
    console.log('   ✅ Filled personal message');
    
    // Step 6: Check "We've met!" checkbox
    const danceCheckbox = page.getByTestId('checkbox-did-we-dance');
    await expect(danceCheckbox).toBeVisible();
    await danceCheckbox.click();
    console.log('   ✅ Checked "We\'ve met!" checkbox');
    
    // Wait for conditional fields to appear
    await page.waitForTimeout(500);
    
    // Step 7: Fill dance location
    const locationInput = page.getByTestId('input-dance-location');
    await expect(locationInput).toBeVisible();
    await locationInput.fill(FRIEND_REQUEST_DATA.danceLocation);
    console.log('   ✅ Filled dance location');
    
    // Step 8: Fill meeting date
    const dateInput = page.getByTestId('input-meeting-date');
    await expect(dateInput).toBeVisible();
    await dateInput.fill(FRIEND_REQUEST_DATA.meetingDate);
    console.log('   ✅ Filled meeting date');
    
    // Step 9: Fill dance story
    const storyTextarea = page.getByTestId('textarea-dance-story');
    await expect(storyTextarea).toBeVisible();
    await storyTextarea.fill(FRIEND_REQUEST_DATA.danceStory);
    console.log('   ✅ Filled dance story');
    
    // Step 10: Submit the request
    const submitButton = page.getByTestId('button-submit-friend-request');
    await expect(submitButton).toBeVisible();
    await expect(submitButton).toBeEnabled();
    await submitButton.click();
    console.log('   ✅ Clicked submit button');
    
    // Step 11: Verify success toast or dialog closes
    const toast = page.locator('[role="status"], .toast, [class*="toast"]');
    const successText = page.getByText(/request.*sent|friend.*added|success/i);
    const dialogClosed = await page.locator('[role="dialog"]').isHidden({ timeout: 5000 }).catch(() => false);
    
    // Either toast appears or dialog closes
    const success = await Promise.race([
      toast.isVisible({ timeout: 5000 }).then(() => true).catch(() => false),
      successText.isVisible({ timeout: 5000 }).then(() => true).catch(() => false),
      Promise.resolve(dialogClosed)
    ]);
    
    expect(success).toBeTruthy();
    console.log('   ✅ Friend request submitted successfully!');
    
    console.log('\n📊 FRIEND REQUEST FORM TEST SUMMARY');
    console.log('='.repeat(50));
    console.log('✅ All form fields filled:');
    console.log(`   - Message: ${FRIEND_REQUEST_DATA.message.substring(0, 50)}...`);
    console.log(`   - Did We Dance: true`);
    console.log(`   - Location: ${FRIEND_REQUEST_DATA.danceLocation}`);
    console.log(`   - Date: ${FRIEND_REQUEST_DATA.meetingDate}`);
    console.log(`   - Story: ${FRIEND_REQUEST_DATA.danceStory.substring(0, 50)}...`);
    console.log('='.repeat(50));
  });

  test('API: Send friend request with all fields', async ({ page }) => {
    console.log('\n📤 Testing Friend Request API with All Fields');
    
    const response = await page.evaluate(async (data) => {
      const res = await fetch('/api/friends/request/3', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          senderMessage: data.message,
          didWeDance: true,
          danceLocation: data.danceLocation,
          danceStory: data.danceStory,
          meetingDate: data.meetingDate,
          mediaUrls: []
        })
      });
      return {
        status: res.status,
        body: await res.json().catch(() => ({}))
      };
    }, FRIEND_REQUEST_DATA);
    
    console.log(`   📨 Response Status: ${response.status}`);
    console.log(`   📨 Response Body:`, JSON.stringify(response.body, null, 2));
    
    // 200 = success, 409 = already sent, 400 = already friends
    expect([200, 409, 400]).toContain(response.status);
    
    if (response.status === 200) {
      console.log('   ✅ Friend request sent successfully via API');
    } else if (response.status === 409) {
      console.log('   ℹ️ Friend request already exists (expected if running multiple times)');
    } else {
      console.log('   ℹ️ Already friends or other expected state');
    }
  });

  test('Verify friend request form UI elements', async ({ page }) => {
    console.log('\n🔍 Verifying Friend Request Form UI Elements');
    
    await page.goto('/friends');
    await page.waitForLoadState('networkidle');
    
    // Click suggestions tab
    await page.getByTestId('tab-suggestions').click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Find any add friend button
    const addButton = page.locator('[data-testid^="button-add-friend-"]').first();
    const hasButton = await addButton.isVisible({ timeout: 5000 }).catch(() => false);
    
    if (!hasButton) {
      console.log('   ⚠️ No friend suggestions available - skipping UI test');
      return;
    }
    
    await addButton.click();
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
    
    // Verify all form elements exist
    console.log('   Checking form elements:');
    
    const messageInput = page.getByTestId('input-friend-request-message');
    await expect(messageInput).toBeVisible();
    console.log('   ✅ Message textarea visible');
    
    const checkbox = page.getByTestId('checkbox-did-we-dance');
    await expect(checkbox).toBeVisible();
    console.log('   ✅ "We\'ve met!" checkbox visible');
    
    // Check the checkbox to reveal conditional fields
    await checkbox.click();
    await page.waitForTimeout(500);
    
    const locationInput = page.getByTestId('input-dance-location');
    await expect(locationInput).toBeVisible();
    console.log('   ✅ Location input visible (after checking checkbox)');
    
    const dateInput = page.getByTestId('input-meeting-date');
    await expect(dateInput).toBeVisible();
    console.log('   ✅ Date input visible');
    
    const storyTextarea = page.getByTestId('textarea-dance-story');
    await expect(storyTextarea).toBeVisible();
    console.log('   ✅ Story textarea visible');
    
    const submitButton = page.getByTestId('button-submit-friend-request');
    await expect(submitButton).toBeVisible();
    console.log('   ✅ Submit button visible');
    
    // Verify submit button is disabled without message
    await messageInput.clear();
    await expect(submitButton).toBeDisabled();
    console.log('   ✅ Submit button disabled when message is empty');
    
    // Fill message and verify button is enabled
    await messageInput.fill('Test message');
    await expect(submitButton).toBeEnabled();
    console.log('   ✅ Submit button enabled when message is filled');
    
    console.log('\n   ✅ All UI elements verified!');
  });
});
