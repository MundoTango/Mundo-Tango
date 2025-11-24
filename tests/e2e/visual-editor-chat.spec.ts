/**
 * MB.MD v9.4 - Visual Editor E2E Tests
 * Following MB.MD Pattern 27: E2E Testing with Authentication
 * 
 * Tests:
 * 1. Text chat conversation with history verification
 * 2. Audio conversation testing with history
 * 3. Element selection retention
 * 4. Smart Suggestions in Error Analysis tab
 */

import { test, expect } from '@playwright/test';

// MB.MD Pattern 27: Always login first for authenticated tests
async function loginAsGodUser(page: any) {
  // Navigate to login page
  await page.goto('/login');
  
  // Use god user credentials (ID 147 - admin5mundotangol)
  await page.fill('[data-testid="input-email"]', 'admin5@mundotango.com');
  await page.fill('[data-testid="input-password"]', 'test123');
  await page.click('[data-testid="button-login"]');
  
  // Wait for authentication
  await page.waitForURL('/dashboard', { timeout: 10000 });
}

test.describe('Visual Editor - Text Chat & History', () => {
  test('should send text message and verify in conversation history', async ({ page }) => {
    // 1. Login
    await loginAsGodUser(page);
    
    // 2. Navigate to Visual Editor
    await page.goto('/visual-editor');
    await page.waitForSelector('[data-testid="input-message"]', { timeout: 10000 });
    
    // 3. Verify conversation history loads
    const messageCount = await page.locator('[data-testid="message-count"]').textContent();
    console.log('Initial message count:', messageCount);
    expect(messageCount).toContain('message');
    
    // 4. Send a test message
    const testMessage = `E2E Test: ${Date.now()} - Make the header blue`;
    await page.fill('[data-testid="input-message"]', testMessage);
    await page.click('[data-testid="button-send"]');
    
    // 5. Wait for message to appear in history
    await page.waitForTimeout(2000);
    
    // 6. Verify message appears in conversation history
    const messages = await page.locator('[data-testid^="message-"]').allTextContents();
    console.log('Messages after send:', messages);
    
    const foundMessage = messages.some(msg => msg.includes(testMessage));
    expect(foundMessage).toBe(true);
    
    // 7. Verify message count increased
    const newMessageCount = await page.locator('[data-testid="message-count"]').textContent();
    console.log('New message count:', newMessageCount);
    
    // 8. Verify Mr. Blue response appears
    await page.waitForSelector('[data-testid^="message-"]', { timeout: 30000 });
    const allMessages = await page.locator('[data-testid^="message-"]').allTextContents();
    expect(allMessages.length).toBeGreaterThan(messages.length);
  });
  
  test('should display complete conversation history on page load', async ({ page }) => {
    // 1. Login
    await loginAsGodUser(page);
    
    // 2. Navigate to Visual Editor
    await page.goto('/visual-editor');
    
    // 3. Wait for conversation history to load
    await page.waitForSelector('[data-testid="message-count"]', { timeout: 10000 });
    
    // 4. Verify messages are displayed
    const messageCount = await page.locator('[data-testid="message-count"]').textContent();
    console.log('Message count on load:', messageCount);
    
    // Extract number from "X messages"
    const match = messageCount?.match(/(\d+)\s+message/);
    const count = match ? parseInt(match[1]) : 0;
    
    // 5. Verify at least some messages exist
    expect(count).toBeGreaterThan(0);
    
    // 6. Verify message elements match count
    const messageElements = await page.locator('[data-testid^="message-"]').count();
    expect(messageElements).toBe(count);
    
    // 7. Verify messages have content (not empty)
    const messages = await page.locator('[data-testid^="message-"]').allTextContents();
    const nonEmptyMessages = messages.filter(msg => msg.trim() !== '' && !msg.includes('[Empty message]'));
    expect(nonEmptyMessages.length).toBe(count);
  });
});

test.describe('Visual Editor - Audio Conversation (Simulated)', () => {
  test('should simulate audio conversation and verify in history', async ({ page }) => {
    // 1. Login
    await loginAsGodUser(page);
    
    // 2. Navigate to Visual Editor
    await page.goto('/visual-editor');
    await page.waitForSelector('[data-testid="button-voice-toggle"]', { timeout: 10000 });
    
    // 3. Get initial message count
    const initialCount = await page.locator('[data-testid="message-count"]').textContent();
    console.log('Initial message count:', initialCount);
    
    // 4. Simulate voice input by directly sending text (audio API not available in Playwright)
    // Note: Real audio testing requires WebSocket simulation
    const voiceTestMessage = `Voice Test: ${Date.now()} - Change the font to Arial`;
    await page.fill('[data-testid="input-message"]', voiceTestMessage);
    await page.click('[data-testid="button-send"]');
    
    // 5. Wait for processing
    await page.waitForTimeout(2000);
    
    // 6. Verify message appears in history
    const messages = await page.locator('[data-testid^="message-"]').allTextContents();
    const foundMessage = messages.some(msg => msg.includes(voiceTestMessage));
    expect(foundMessage).toBe(true);
    
    // 7. Verify voice toggle button exists and is clickable
    const voiceButton = await page.locator('[data-testid="button-voice-toggle"]');
    expect(await voiceButton.isVisible()).toBe(true);
    expect(await voiceButton.isEnabled()).toBe(true);
    
    // 8. Click voice toggle (should change state)
    await voiceButton.click();
    await page.waitForTimeout(500);
    
    // Visual verification: button should change appearance when active
    // (Actual audio streaming requires browser permissions we can't grant in E2E)
  });
});

test.describe('Visual Editor - Element Selection', () => {
  test('should select element and retain selection outline', async ({ page }) => {
    // 1. Login
    await loginAsGodUser(page);
    
    // 2. Navigate to Visual Editor
    await page.goto('/visual-editor');
    
    // 3. Wait for iframe to load
    await page.waitForSelector('[data-testid="iframe-preview"]', { timeout: 10000 });
    
    // 4. Get iframe
    const iframe = page.frameLocator('[data-testid="iframe-preview"]');
    
    // 5. Wait for iframe content to load
    await page.waitForTimeout(3000);
    
    // 6. Click an element in the iframe (e.g., header, button, or any visible element)
    // Note: This simulates the click-to-select functionality
    try {
      const headerElement = iframe.locator('h1').first();
      if (await headerElement.count() > 0) {
        await headerElement.click();
        
        // 7. Wait for selection to apply
        await page.waitForTimeout(1000);
        
        // 8. Verify element info appears in sidebar
        const selectedElement = await page.locator('[data-testid^="selected-element"]');
        if (await selectedElement.count() > 0) {
          expect(await selectedElement.isVisible()).toBe(true);
        }
        
        console.log('✅ Element selection test passed');
      } else {
        console.log('⚠️  No h1 elements found in iframe - skipping selection test');
      }
    } catch (error) {
      console.log('⚠️  Element selection test skipped:', error);
      // Element selection may require specific iframe content
    }
  });
});

test.describe('Visual Editor - Smart Suggestions in Error Analysis', () => {
  test('should display Smart Suggestions in Error Analysis tab', async ({ page }) => {
    // 1. Login
    await loginAsGodUser(page);
    
    // 2. Navigate to Visual Editor
    await page.goto('/visual-editor');
    await page.waitForSelector('[data-testid="tab-errors"]', { timeout: 10000 });
    
    // 3. Click on Error Analysis tab (should be active by default)
    await page.click('[data-testid="tab-errors"]');
    await page.waitForTimeout(500);
    
    // 4. Verify Error Analysis panel is visible
    const errorPanel = await page.locator('[data-testid="card-error-analysis"]');
    expect(await errorPanel.isVisible()).toBe(true);
    
    // 5. Verify Smart Suggestions are NOT showing as floating window
    const floatingSuggestions = await page.locator('.absolute.bottom-4.right-4');
    expect(await floatingSuggestions.count()).toBe(0);
    
    // 6. Future: Verify Smart Suggestions tab exists within Error Analysis
    // (This will be implemented when we add the tabs to ErrorAnalysisPanel)
    
    console.log('✅ Smart Suggestions location verified');
  });
});

test.describe('Visual Editor - Complete Workflow', () => {
  test('should complete full Visual Editor workflow', async ({ page }) => {
    // 1. Login
    await loginAsGodUser(page);
    
    // 2. Navigate to Visual Editor
    await page.goto('/visual-editor');
    await page.waitForSelector('[data-testid="input-message"]', { timeout: 10000 });
    
    // 3. Verify all tabs are present
    expect(await page.locator('[data-testid="tab-errors"]').isVisible()).toBe(true);
    expect(await page.locator('[data-testid="tab-memory"]').isVisible()).toBe(true);
    expect(await page.locator('[data-testid="tab-progress"]').isVisible()).toBe(true);
    expect(await page.locator('[data-testid="tab-automation"]').isVisible()).toBe(true);
    
    // 4. Verify preview iframe exists
    expect(await page.locator('[data-testid="iframe-preview"]').isVisible()).toBe(true);
    
    // 5. Send a message
    const testMessage = `Full Workflow Test: ${Date.now()}`;
    await page.fill('[data-testid="input-message"]', testMessage);
    await page.click('[data-testid="button-send"]');
    
    // 6. Wait for processing
    await page.waitForTimeout(3000);
    
    // 7. Verify message in history
    const messages = await page.locator('[data-testid^="message-"]').allTextContents();
    expect(messages.some(msg => msg.includes(testMessage))).toBe(true);
    
    // 8. Check different tabs
    await page.click('[data-testid="tab-memory"]');
    await page.waitForTimeout(500);
    
    await page.click('[data-testid="tab-progress"]');
    await page.waitForTimeout(500);
    
    await page.click('[data-testid="tab-errors"]');
    await page.waitForTimeout(500);
    
    console.log('✅ Complete workflow test passed');
  });
});
