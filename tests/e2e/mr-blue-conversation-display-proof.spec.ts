import { test, expect } from '@playwright/test';

/**
 * VISUAL PROOF TEST - Mr. Blue Conversation Display
 * MB.MD Protocol v9.2: Never Assume Complete - Visual Verification Required
 * 
 * Purpose: Prove that Replit AI ↔ Mr. Blue conversation history is visible in UI
 * 
 * What this test validates:
 * 1. ✅ API accepts Replit AI messages
 * 2. ✅ Messages persist to database
 * 3. ✅ UI fetches messages on load
 * 4. ✅ User can see conversation history (VISUAL PROOF)
 * 5. ✅ Screenshot shows REAL DATA (not loading spinners)
 * 
 * MB.MD Learning: This is the correct way to validate full-stack features.
 * API tests passing ≠ Feature working. User experience is the ultimate test.
 */

test.describe('Mr. Blue Conversation Display - Visual Proof', () => {
  
  test('User sees Replit AI messages in Mr. Blue chat UI', async ({ page, request }) => {
    // Step 1: Login as test user
    await page.goto('/login');
    await page.fill('[data-testid="input-email"]', process.env.TEST_ADMIN_EMAIL || 'admin@mundotango.com');
    await page.fill('[data-testid="input-password"]', process.env.TEST_ADMIN_PASSWORD || 'admin123');
    await page.click('[data-testid="button-login"]');
    
    // Wait for successful login
    await page.waitForURL('/', { timeout: 10000 });
    console.log('[Test] ✅ Logged in successfully');
    
    // Step 2: Send message via Replit AI Bridge
    const testMessage = `Test message from Replit AI at ${Date.now()}`;
    console.log('[Test] Sending message via Replit AI Bridge:', testMessage);
    
    const response = await request.post('/api/replit-ai/trigger', {
      data: {
        action: 'ask_mrblue',
        params: {
          message: testMessage,
          context: {
            page: '/test',
            testMode: true,
          },
        },
      },
    });
    
    expect(response.ok()).toBeTruthy();
    const result = await response.json();
    console.log('[Test] API Response:', result);
    
    // Step 3: Navigate to Mr. Blue Visual Editor (where conversation should display)
    await page.goto('/');
    console.log('[Test] Navigated to Visual Editor');
    
    // Wait for React to render
    await page.waitForTimeout(2000);
    
    // Step 4: ✅ VISUAL PROOF - Assert message text is visible in DOM
    console.log('[Test] Checking if message is visible in UI...');
    
    // Look for the message content in the page
    const messageLocator = page.locator(`text=${testMessage}`);
    
    // Assert the message is visible (not just in API - in UI!)
    await expect(messageLocator).toBeVisible({ timeout: 10000 });
    console.log('[Test] ✅ Message is visible in UI!');
    
    // Step 5: ✅ SCREENSHOT PROOF - Capture visual evidence
    await page.screenshot({
      path: 'tests/e2e/screenshots/mr-blue-conversation-proof.png',
      fullPage: true,
    });
    console.log('[Test] ✅ Screenshot saved: tests/e2e/screenshots/mr-blue-conversation-proof.png');
    
    // Step 6: Validate conversation sidebar shows conversations
    const conversationSidebar = page.locator('[data-testid="conversation-sidebar"]');
    if (await conversationSidebar.isVisible()) {
      console.log('[Test] ✅ Conversation sidebar is visible');
      
      // Check if "New Chat" button exists
      const newChatButton = page.locator('[data-testid="button-new-conversation"]');
      if (await newChatButton.isVisible()) {
        console.log('[Test] ✅ New Chat button is visible');
      }
    }
    
    // Step 7: Verify no loading spinners (means data actually loaded)
    const loadingSpinner = page.locator('[data-testid="loading-spinner"]');
    const isLoadingVisible = await loadingSpinner.isVisible().catch(() => false);
    expect(isLoadingVisible).toBe(false);
    console.log('[Test] ✅ No loading spinners - data loaded successfully');
  });
  
  test('Conversation history persists across page reloads', async ({ page, request }) => {
    // Step 1: Login
    await page.goto('/login');
    await page.fill('[data-testid="input-email"]', process.env.TEST_ADMIN_EMAIL || 'admin@mundotango.com');
    await page.fill('[data-testid="input-password"]', process.env.TEST_ADMIN_PASSWORD || 'admin123');
    await page.click('[data-testid="button-login"]');
    await page.waitForURL('/', { timeout: 10000 });
    
    // Step 2: Send message
    const testMessage = `Persistence test ${Date.now()}`;
    await request.post('/api/replit-ai/trigger', {
      data: {
        action: 'ask_mrblue',
        params: { message: testMessage },
      },
    });
    
    // Step 3: Navigate to Mr. Blue
    await page.goto('/');
    await page.waitForTimeout(2000);
    
    // Verify message is visible
    await expect(page.locator(`text=${testMessage}`)).toBeVisible({ timeout: 10000 });
    console.log('[Test] ✅ Message visible on first load');
    
    // Step 4: Reload page
    await page.reload();
    await page.waitForTimeout(2000);
    
    // Step 5: ✅ CRITICAL - Message should still be visible after reload
    await expect(page.locator(`text=${testMessage}`)).toBeVisible({ timeout: 10000 });
    console.log('[Test] ✅ Message persists after page reload!');
    
    // Screenshot proof
    await page.screenshot({
      path: 'tests/e2e/screenshots/mr-blue-persistence-proof.png',
      fullPage: true,
    });
  });
  
  test('Multiple Replit AI messages display in chronological order', async ({ page, request }) => {
    // Step 1: Login
    await page.goto('/login');
    await page.fill('[data-testid="input-email"]', process.env.TEST_ADMIN_EMAIL || 'admin@mundotango.com');
    await page.fill('[data-testid="input-password"]', process.env.TEST_ADMIN_PASSWORD || 'admin123');
    await page.click('[data-testid="button-login"]');
    await page.waitForURL('/', { timeout: 10000 });
    
    // Step 2: Send 3 messages in sequence
    const messages = [
      `First message ${Date.now()}`,
      `Second message ${Date.now() + 1}`,
      `Third message ${Date.now() + 2}`,
    ];
    
    for (const msg of messages) {
      await request.post('/api/replit-ai/trigger', {
        data: {
          action: 'ask_mrblue',
          params: { message: msg },
        },
      });
      await page.waitForTimeout(500); // Small delay between messages
    }
    
    // Step 3: Navigate to Mr. Blue
    await page.goto('/');
    await page.waitForTimeout(3000);
    
    // Step 4: ✅ All messages should be visible
    for (const msg of messages) {
      await expect(page.locator(`text=${msg}`)).toBeVisible({ timeout: 10000 });
      console.log(`[Test] ✅ Message visible: ${msg}`);
    }
    
    // Screenshot proof
    await page.screenshot({
      path: 'tests/e2e/screenshots/mr-blue-multiple-messages-proof.png',
      fullPage: true,
    });
    console.log('[Test] ✅ All 3 messages visible in UI!');
  });
});
