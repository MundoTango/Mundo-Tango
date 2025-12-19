import { test, expect } from '@playwright/test';

/**
 * QUICK VALIDATION - Visual Editor Conversation Display
 * Fast test to validate Replit AI messages appear in Visual Editor
 */

test('Visual Editor displays Replit AI conversation', async ({ page, request }) => {
  // Login
  await page.goto('/login');
  await page.fill('[data-testid="input-email"]', process.env.TEST_ADMIN_EMAIL || 'admin@mundotango.com');
  await page.fill('[data-testid="input-password"]', process.env.TEST_ADMIN_PASSWORD || 'admin123');
  await page.click('[data-testid="button-login"]');
  await page.waitForURL('/', { timeout: 10000 });
  console.log('[Test] ✅ Logged in');

  // Send test message via Replit AI Bridge
  const testMessage = `Quick test ${Date.now()}`;
  console.log('[Test] Sending message:', testMessage);
  
  const response = await request.post('/api/replit-ai/trigger', {
    data: {
      action: 'ask_mrblue',
      params: { message: testMessage },
    },
  });
  
  expect(response.ok()).toBeTruthy();
  console.log('[Test] ✅ Message sent to API');

  // Navigate to Visual Editor
  await page.goto('/');
  console.log('[Test] ✅ Navigated to Visual Editor');

  // Wait for React to load and fetch conversation
  await page.waitForTimeout(3000);

  // Capture screenshot for debugging
  await page.screenshot({
    path: 'tests/e2e/screenshots/visual-editor-quick-check.png',
    fullPage: true,
  });
  console.log('[Test] 📸 Screenshot saved');

  // ✅ CRITICAL: Check if message is visible in UI
  const messageLocator = page.locator(`text=${testMessage}`);
  const isVisible = await messageLocator.isVisible().catch(() => false);
  
  if (isVisible) {
    console.log('[Test] ✅ SUCCESS! Message is visible in Visual Editor');
  } else {
    console.log('[Test] ❌ FAILED! Message not visible in Visual Editor');
    
    // Debug: Check what's actually on the page
    const pageText = await page.textContent('body');
    console.log('[Test] Page contains:', pageText?.substring(0, 500));
  }

  expect(messageLocator).toBeVisible({ timeout: 5000 });
});
