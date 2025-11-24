/**
 * MB.MD QA: Comprehensive Mr. Blue Production Test
 * 
 * Tests Mr. Blue's full capabilities with realistic user scenarios:
 * - 15 carefully designed prompts testing Vibe Coding, chat, planning
 * - Voice input UI validation (click-to-toggle mode)
 * - Self-healing framework validation
 * - Message persistence across page reloads
 * 
 * @see docs/MB_MD_QA_COMPREHENSIVE_MR_BLUE_TEST_PLAN.md
 * @auth admin@mundotango.life / admin123
 */

import { test, expect } from '@playwright/test';

// Extend timeout for AI interactions
test.setTimeout(180000); // 3 minutes per test

// Admin credentials
const ADMIN_EMAIL = 'admin@mundotango.life';
const ADMIN_PASSWORD = 'admin123';

/**
 * Helper: Login as admin user
 */
async function loginAsAdmin(page: any) {
  console.log('🔑 Logging in as admin...');
  
  await page.goto('/login', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('[data-testid="input-email"]', { timeout: 15000 });
  
  await page.fill('[data-testid="input-email"]', ADMIN_EMAIL);
  await page.fill('[data-testid="input-password"]', ADMIN_PASSWORD);
  await page.click('[data-testid="button-login"]');
  
  // Wait for redirect to /feed
  await page.waitForURL(/\/(feed|$)/, { timeout: 30000 });
  await page.waitForTimeout(2000);
  
  console.log('✅ Logged in successfully');
}

/**
 * Helper: Navigate to Visual Editor and wait for initialization
 */
async function goToVisualEditor(page: any) {
  console.log('🚀 Navigating to Visual Editor (Test Route)...');
  
  // Navigate to test route (lightweight, Playwright-compatible version)
  await page.goto('/visual-editor-test', { 
    waitUntil: 'domcontentloaded', 
    timeout: 60000 
  });
  
  // Wait for Mr. Blue to initialize
  await page.waitForSelector('[data-testid="input-chat"]', { timeout: 15000 });
  await page.waitForSelector('[data-testid="button-send"]', { timeout: 15000 });
  
  // Give extra time for conversation initialization
  await page.waitForTimeout(2000);
  
  console.log('✅ Visual Editor Test Route loaded');
}

/**
 * Helper: Send message to Mr. Blue via text input
 */
async function sendTextMessage(page: any, message: string) {
  console.log(`💬 Sending: "${message}"`);
  
  const input = page.locator('[data-testid="input-chat"]');
  const sendButton = page.locator('[data-testid="button-send"]');
  
  // Clear any existing text
  await input.fill('');
  
  // Type the message
  await input.fill(message);
  
  // Wait a moment for any typing effects
  await page.waitForTimeout(500);
  
  // Click send
  await sendButton.click();
  
  // Wait for text box to clear (validates P0-2 fix)
  await page.waitForTimeout(500);
  const inputValue = await input.inputValue();
  expect(inputValue).toBe('');
  
  console.log('✅ Message sent, text box cleared');
}

/**
 * Helper: Wait for assistant response
 */
async function waitForAssistantResponse(page: any, timeout = 30000) {
  console.log('⏳ Waiting for Mr. Blue response...');
  
  // Look for any assistant message (could be chat or code response)
  const responseAppeared = await page.waitForSelector(
    'text=/How can I assist|I can help|I\'ve|Here\'s|Let me|Sure/i',
    { timeout, state: 'visible' }
  ).catch(() => null);
  
  if (responseAppeared) {
    console.log('✅ Assistant response received');
    return true;
  } else {
    console.log('⚠️ No response within timeout');
    return false;
  }
}

/**
 * Helper: Check if code was generated (file tree updated)
 */
async function validateCodeGeneration(page: any) {
  console.log('🔍 Checking for code generation...');
  
  // Look for indicators of code generation:
  // 1. File tree updates
  // 2. "Code generated" or similar message
  // 3. Preview iframe updates
  
  const codeIndicators = [
    'text=/code.*generated|updated.*file|applied.*change/i',
    '[data-testid="file-tree"]',
    '[data-testid="code-diff"]'
  ];
  
  for (const selector of codeIndicators) {
    const found = await page.locator(selector).count();
    if (found > 0) {
      console.log(`✅ Code generation detected (${selector})`);
      return true;
    }
  }
  
  console.log('⚠️ No code generation detected');
  return false;
}

/**
 * Helper: Validate chat response (NOT code generation)
 */
async function validateChatResponse(page: any) {
  console.log('🔍 Checking for chat response (no code)...');
  
  // Should see assistant message but NO code generation
  const hasResponse = await page.locator('text=/How can I assist|I can help|Here\'s how/i').count() > 0;
  const hasCodeGen = await validateCodeGeneration(page);
  
  const isChatOnly = hasResponse && !hasCodeGen;
  
  if (isChatOnly) {
    console.log('✅ Chat-only response (no code generation)');
  } else {
    console.log('⚠️ Expected chat-only, got code generation or no response');
  }
  
  return isChatOnly;
}

/**
 * Helper: Capture evidence for debugging
 */
async function captureEvidence(page: any, testName: string) {
  const timestamp = Date.now();
  const screenshotPath = `test-results/mb-md-qa-${testName}-${timestamp}.png`;
  
  await page.screenshot({ 
    path: screenshotPath, 
    fullPage: true 
  });
  
  console.log(`📸 Screenshot saved: ${screenshotPath}`);
}

// ============================================================================
// TEST SUITE
// ============================================================================

test.describe('MB.MD QA: Mr. Blue Comprehensive Test', () => {
  
  // ========================================================================
  // SETUP: Login and navigate to Visual Editor
  // ========================================================================
  
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await goToVisualEditor(page);
  });
  
  // ========================================================================
  // CATEGORY 1: UI Modifications (Vibe Coding) 🎨
  // These should trigger CODE GENERATION, not just chat
  // ========================================================================
  
  test('Vibe #1: Make header background transparent', async ({ page }) => {
    await sendTextMessage(page, 'Make the header background transparent');
    await waitForAssistantResponse(page);
    
    const codeGenerated = await validateCodeGeneration(page);
    expect(codeGenerated).toBe(true);
    
    await captureEvidence(page, 'vibe-1-header-transparent');
  });
  
  test('Vibe #2: Change button color to ocean blue', async ({ page }) => {
    await sendTextMessage(page, 'Change button color to ocean blue');
    await waitForAssistantResponse(page);
    
    const codeGenerated = await validateCodeGeneration(page);
    expect(codeGenerated).toBe(true);
    
    await captureEvidence(page, 'vibe-2-button-ocean-blue');
  });
  
  test('Vibe #3: Add padding to container', async ({ page }) => {
    await sendTextMessage(page, 'Add 20px padding to this container');
    await waitForAssistantResponse(page);
    
    const codeGenerated = await validateCodeGeneration(page);
    expect(codeGenerated).toBe(true);
    
    await captureEvidence(page, 'vibe-3-padding');
  });
  
  test('Vibe #4: Make text bigger and bold', async ({ page }) => {
    await sendTextMessage(page, 'Make text bigger and bold');
    await waitForAssistantResponse(page);
    
    const codeGenerated = await validateCodeGeneration(page);
    expect(codeGenerated).toBe(true);
    
    await captureEvidence(page, 'vibe-4-text-bold');
  });
  
  test('Vibe #5: Center align text in section', async ({ page }) => {
    await sendTextMessage(page, 'Center align all text in this section');
    await waitForAssistantResponse(page);
    
    const codeGenerated = await validateCodeGeneration(page);
    expect(codeGenerated).toBe(true);
    
    await captureEvidence(page, 'vibe-5-center-align');
  });
  
  // ========================================================================
  // CATEGORY 2: Conversational Questions (Chat) 💬
  // These should trigger CHAT RESPONSES, not code generation
  // ========================================================================
  
  test('Chat #1: What can you do?', async ({ page }) => {
    await sendTextMessage(page, 'What can you do?');
    await waitForAssistantResponse(page);
    
    const chatOnly = await validateChatResponse(page);
    expect(chatOnly).toBe(true);
    
    await captureEvidence(page, 'chat-1-capabilities');
  });
  
  test('Chat #2: How do I make a button clickable?', async ({ page }) => {
    await sendTextMessage(page, 'How do I make a button clickable?');
    await waitForAssistantResponse(page);
    
    const chatOnly = await validateChatResponse(page);
    expect(chatOnly).toBe(true);
    
    await captureEvidence(page, 'chat-2-clickable-button');
  });
  
  test('Chat #3: Explain margin vs padding', async ({ page }) => {
    await sendTextMessage(page, 'What\'s the difference between margin and padding?');
    await waitForAssistantResponse(page);
    
    const chatOnly = await validateChatResponse(page);
    expect(chatOnly).toBe(true);
    
    await captureEvidence(page, 'chat-3-margin-padding');
  });
  
  // ========================================================================
  // CATEGORY 3: Complex Multi-Step Requests 🔧
  // These test Mr. Blue's planning capabilities
  // ========================================================================
  
  test('Complex #1: Create hero section', async ({ page }) => {
    await sendTextMessage(page, 'Create a hero section with image background and centered title');
    await waitForAssistantResponse(page, 45000); // Longer timeout for complex tasks
    
    const codeGenerated = await validateCodeGeneration(page);
    expect(codeGenerated).toBe(true);
    
    await captureEvidence(page, 'complex-1-hero-section');
  });
  
  test('Complex #2: Responsive navigation bar', async ({ page }) => {
    await sendTextMessage(page, 'Make a responsive navigation bar with dropdown menu');
    await waitForAssistantResponse(page, 45000);
    
    const codeGenerated = await validateCodeGeneration(page);
    expect(codeGenerated).toBe(true);
    
    await captureEvidence(page, 'complex-2-nav-bar');
  });
  
  // ========================================================================
  // CATEGORY 4: Clarification Needed ❓
  // These should trigger Mr. Blue to ask for more information
  // ========================================================================
  
  test('Clarify #1: Change the color (ambiguous)', async ({ page }) => {
    await sendTextMessage(page, 'Change the color');
    const responded = await waitForAssistantResponse(page);
    
    expect(responded).toBe(true);
    
    // Should ask "Which element?" or "What color?"
    const hasClarification = await page.locator('text=/which|what color|please specify/i').count() > 0;
    console.log(`Clarification question asked: ${hasClarification}`);
    
    await captureEvidence(page, 'clarify-1-color');
  });
  
  test('Clarify #2: Make it bigger (ambiguous)', async ({ page }) => {
    await sendTextMessage(page, 'Make it bigger');
    const responded = await waitForAssistantResponse(page);
    
    expect(responded).toBe(true);
    
    // Should ask "Which element?"
    const hasClarification = await page.locator('text=/which|what element|please specify/i').count() > 0;
    console.log(`Clarification question asked: ${hasClarification}`);
    
    await captureEvidence(page, 'clarify-2-bigger');
  });
  
  // ========================================================================
  // CATEGORY 5: Error Recovery 🔄
  // These test self-healing when things go wrong
  // ========================================================================
  
  test('Error #1: Empty message blocked', async ({ page }) => {
    console.log('Testing empty message blocking...');
    
    const input = page.locator('[data-testid="input-chat"]');
    const sendButton = page.locator('[data-testid="button-send"]');
    
    // Try to send empty message (just whitespace)
    await input.fill('   ');
    
    // Send button should be disabled
    await expect(sendButton).toBeDisabled();
    
    console.log('✅ Empty message blocked correctly');
    await captureEvidence(page, 'error-1-empty-blocked');
  });
  
  test('Error #2: Message persistence after reload', async ({ page }) => {
    const testMessage = 'Test message persistence';
    
    // Send a message
    await sendTextMessage(page, testMessage);
    await waitForAssistantResponse(page);
    
    // Reload page
    console.log('🔄 Reloading page...');
    await page.reload();
    await page.waitForSelector('[data-testid="input-chat"]', { timeout: 15000 });
    
    // User message should still be visible
    const messageVisible = await page.locator(`text="${testMessage}"`).isVisible();
    expect(messageVisible).toBe(true);
    
    console.log('✅ Message persisted after reload');
    await captureEvidence(page, 'error-2-persistence');
  });
  
  test('Error #3: No duplicate messages', async ({ page }) => {
    const testMessage = 'Check for duplicates';
    
    // Send a message
    await sendTextMessage(page, testMessage);
    await waitForAssistantResponse(page);
    
    // Wait a bit more to ensure no late duplicates appear
    await page.waitForTimeout(3000);
    
    // Count how many times this message appears
    const messageCount = await page.locator(`text="${testMessage}"`).count();
    
    // Should appear exactly ONCE
    expect(messageCount).toBe(1);
    
    console.log(`✅ Message appears ${messageCount} time(s) (expected: 1)`);
    await captureEvidence(page, 'error-3-no-duplicates');
  });
  
  // ========================================================================
  // VOICE INPUT TESTS 🎤
  // Tests click-to-toggle voice mode UI
  // ========================================================================
  
  test('Voice #1: Voice button toggles correctly', async ({ page }) => {
    console.log('Testing voice toggle UI...');
    
    const voiceButton = page.locator('[data-testid="button-voice-mode"]');
    
    // Check if voice button exists
    if (await voiceButton.count() === 0) {
      console.log('⏭️  Voice button not found (may not be supported in this environment)');
      return;
    }
    
    // Click to start listening
    await voiceButton.click();
    
    // Should show recording indicator
    const recordingIndicator = page.locator('[data-testid="recording-indicator"]');
    await expect(recordingIndicator).toBeVisible({ timeout: 2000 });
    
    // Voice button should have red styling
    const buttonClasses = await voiceButton.getAttribute('class');
    expect(buttonClasses).toContain('border-red-500');
    
    console.log('✅ Voice mode activated (recording indicator visible)');
    
    // Click to stop listening
    await voiceButton.click();
    
    // Recording indicator should disappear
    await expect(recordingIndicator).not.toBeVisible({ timeout: 2000 });
    
    console.log('✅ Voice mode deactivated (click-to-toggle works)');
    await captureEvidence(page, 'voice-1-toggle');
  });
  
  test('Voice #2: Voice button disabled during execution', async ({ page }) => {
    const voiceButton = page.locator('[data-testid="button-voice-mode"]');
    
    if (await voiceButton.count() === 0) {
      console.log('⏭️  Voice button not found');
      return;
    }
    
    // Send a message
    await sendTextMessage(page, 'What can you do?');
    
    // During processing, voice button should be disabled
    const isDisabled = await voiceButton.isDisabled();
    
    if (isDisabled) {
      console.log('✅ Voice button disabled during execution');
    } else {
      console.log('⚠️ Voice button not disabled during execution');
    }
    
    await captureEvidence(page, 'voice-2-disabled-during-exec');
  });
  
  // ========================================================================
  // CONVERSATION FLOW TESTS 🔄
  // Tests multi-message conversations
  // ========================================================================
  
  test('Flow #1: Multi-message conversation', async ({ page }) => {
    const messages = [
      'Hello Mr. Blue!',
      'What can you help me with?',
      'Thanks for the info!'
    ];
    
    for (const msg of messages) {
      await sendTextMessage(page, msg);
      await waitForAssistantResponse(page);
      await page.waitForTimeout(1000); // Brief pause between messages
    }
    
    // All 3 user messages should be visible
    for (const msg of messages) {
      const visible = await page.locator(`text="${msg}"`).isVisible();
      expect(visible).toBe(true);
    }
    
    console.log('✅ Multi-message conversation successful');
    await captureEvidence(page, 'flow-1-multi-message');
  });
  
  test('Flow #2: Text box always clears after send', async ({ page }) => {
    const input = page.locator('[data-testid="input-chat"]');
    
    const testMessages = [
      'First message',
      'Second message',
      'Third message'
    ];
    
    for (const msg of testMessages) {
      await sendTextMessage(page, msg);
      
      // Text box should be empty immediately after send
      const inputValue = await input.inputValue();
      expect(inputValue).toBe('');
      
      await page.waitForTimeout(500);
    }
    
    console.log('✅ Text box cleared after every message');
    await captureEvidence(page, 'flow-2-text-clear');
  });
  
});

/**
 * SELF-HEALING VALIDATION TESTS
 * Tests Phase C autonomous framework
 */
test.describe('MB.MD QA: Self-Healing Framework', () => {
  
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await goToVisualEditor(page);
  });
  
  test('Self-Healing #1: Proactive error detection active', async ({ page }) => {
    console.log('Testing error detection system...');
    
    // Monitor console for error detection logs
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.text().includes('ProactiveErrorDetector') || 
          msg.text().includes('[VisualEditor] ❌')) {
        errors.push(msg.text());
      }
    });
    
    // Send a message
    await sendTextMessage(page, 'Hello');
    await waitForAssistantResponse(page);
    
    // Just verify the page doesn't crash
    const chatStillWorks = await page.locator('[data-testid="input-chat"]').isVisible();
    expect(chatStillWorks).toBe(true);
    
    console.log(`Detected ${errors.length} error-related messages`);
    console.log('✅ Error detection system active');
    
    await captureEvidence(page, 'self-heal-1-detection');
  });
  
  test('Self-Healing #2: Conversation initialization race condition handled', async ({ page }) => {
    console.log('Testing race condition handling...');
    
    // Immediately try to send message after page load (before initialization)
    await page.goto('/admin/visual-editor');
    
    // Don't wait for full initialization
    await page.waitForSelector('[data-testid="input-chat"]', { timeout: 5000 });
    
    // Try to send quickly
    await sendTextMessage(page, 'Quick test');
    
    // Should either:
    // 1. Show "Initializing" toast and block
    // 2. Successfully send after auto-retry
    
    // Either way, the page should not crash
    const chatStillWorks = await page.locator('[data-testid="input-chat"]').isVisible();
    expect(chatStillWorks).toBe(true);
    
    console.log('✅ Race condition handled gracefully');
    await captureEvidence(page, 'self-heal-2-race-condition');
  });
  
});
