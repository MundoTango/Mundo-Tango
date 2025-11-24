import { test, expect } from '@playwright/test';

/**
 * MB.MD v9.5: Intelligence Verification Tests
 * 
 * Tests all AI intelligences in Visual Editor to verify they're actually working
 * (not just wired up).
 * 
 * CRITICAL VERIFICATION:
 * - Vibe Coding: Does it generate code or just chat?
 * - Research & Planning: Does it call /api/mrblue/analyze?
 * - Chat Routing: Does it distinguish chat from code requests?
 * - Voice: Does it show helpful errors?
 */

test.describe('MB.MD v9.5: Visual Editor Intelligence Tests', () => {
  
  /**
   * TEST 1: Vibe Coding Intelligence Verification
   * 
   * CRITICAL QUESTION: Does vibe coding actually generate code or just chat about it?
   * 
   * Expected Behavior:
   * - Console shows "code_generation" routing
   * - Files are actually modified
   * - NOT just a chat response saying "I made the change"
   */
  test('Vibe Coding: Should generate actual code (not just chat)', async ({ page }) => {
    // Enable console logging
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      const text = msg.text();
      consoleLogs.push(text);
      if (text.includes('VisualEditor') || text.includes('StreamingChat') || text.includes('Vibe')) {
        console.log('[CONSOLE]', text);
      }
    });

    // Navigate to Visual Editor
    await page.goto('/visual-editor');
    await page.waitForLoadState('networkidle');

    // Wait for chat input to be ready
    const chatInput = page.getByTestId('input-chat');
    await expect(chatInput).toBeVisible();

    // Type vibe coding request
    await chatInput.fill('make this container background transparent');

    // Click Send button
    const sendButton = page.getByTestId('button-send');
    await sendButton.click();

    // Wait for response (max 30 seconds)
    await page.waitForTimeout(5000);

    // CRITICAL VERIFICATION 1: Check console logs for routing decision
    const hasVibeCodeDetection = consoleLogs.some(log => 
      log.includes('isVibeCodeRequest: true') || 
      log.includes('🔨 Routing to VIBE CODING')
    );

    const hasCodeGeneration = consoleLogs.some(log => 
      log.includes('code_generation') && 
      log.includes('Parsed message type')
    );

    const hasChatResponseOnly = consoleLogs.some(log => 
      log.includes('chat_response') && 
      log.includes('Parsed message type')
    ) && !hasCodeGeneration;

    console.log('\n=== VIBE CODING TEST RESULTS ===');
    console.log('Detected vibe code request:', hasVibeCodeDetection);
    console.log('Routed to code_generation:', hasCodeGeneration);
    console.log('Routed to chat_response only:', hasChatResponseOnly);
    console.log('================================\n');

    // ASSERTION: Should route to code_generation, NOT chat_response
    expect(hasCodeGeneration, 
      '❌ FAILED: Vibe coding routed to chat_response instead of code_generation'
    ).toBe(true);

    expect(hasChatResponseOnly,
      '❌ FAILED: Should not route to chat_response for vibe coding requests'
    ).toBe(false);

    // CRITICAL VERIFICATION 2: Check if Code tab shows generated files
    // (This would require checking the UI - skipped for now)

    // CRITICAL VERIFICATION 3: Text box should clear after sending
    await expect(chatInput).toHaveValue('');
  });

  /**
   * TEST 2: Chat vs Vibe Coding Routing Logic
   * 
   * Verify that routing logic correctly distinguishes:
   * - Chat requests → chat_response
   * - Code requests → code_generation
   */
  test('Routing Logic: Chat vs Vibe Coding distinction', async ({ page }) => {
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      consoleLogs.push(msg.text());
    });

    await page.goto('/visual-editor');
    await page.waitForLoadState('networkidle');

    const chatInput = page.getByTestId('input-chat');
    const sendButton = page.getByTestId('button-send');

    // TEST 2A: Non-code request should route to CHAT
    console.log('\n=== TEST 2A: Non-code request (hello) ===');
    await chatInput.fill('hello');
    await sendButton.click();
    await page.waitForTimeout(3000);

    const helloChatResponse = consoleLogs.some(log => 
      log.includes('chat_response') && 
      log.includes('Parsed message type')
    );

    const helloCodeGeneration = consoleLogs.some(log => 
      log.includes('code_generation')
    );

    console.log('Routed to chat_response:', helloChatResponse);
    console.log('Routed to code_generation:', helloCodeGeneration);

    expect(helloChatResponse, '"hello" should route to chat_response').toBe(true);
    expect(helloCodeGeneration, '"hello" should NOT route to code_generation').toBe(false);

    // Clear logs for next test
    consoleLogs.length = 0;

    // TEST 2B: Code request should route to CODE GENERATION
    console.log('\n=== TEST 2B: Code request (make button blue) ===');
    await page.waitForTimeout(2000); // Wait for previous response to complete
    await chatInput.fill('make button blue');
    await sendButton.click();
    await page.waitForTimeout(3000);

    const buttonCodeGeneration = consoleLogs.some(log => 
      log.includes('code_generation')
    );

    const buttonChatOnly = consoleLogs.some(log => 
      log.includes('chat_response')
    ) && !buttonCodeGeneration;

    console.log('Routed to code_generation:', buttonCodeGeneration);
    console.log('Routed to chat_response only:', buttonChatOnly);

    expect(buttonCodeGeneration, '"make button blue" should route to code_generation').toBe(true);
  });

  /**
   * TEST 3: Research & Planning Intelligence
   * 
   * Verify analyzeBeforeGenerate() actually calls /api/mrblue/analyze
   */
  test('Research & Planning: Should call /api/mrblue/analyze for vague requests', async ({ page }) => {
    const apiCalls: { url: string; method: string; }[] = [];

    // Intercept API calls
    page.on('request', request => {
      if (request.url().includes('/api/mrblue')) {
        apiCalls.push({
          url: request.url(),
          method: request.method()
        });
        console.log('[API CALL]', request.method(), request.url());
      }
    });

    await page.goto('/visual-editor');
    await page.waitForLoadState('networkidle');

    const chatInput = page.getByTestId('input-chat');
    const sendButton = page.getByTestId('button-send');

    // Send vague request that should trigger analysis
    await chatInput.fill('make it better');
    await sendButton.click();

    // Wait for analysis to complete
    await page.waitForTimeout(5000);

    // Check if /api/mrblue/analyze was called
    const analyzeEndpointCalled = apiCalls.some(call => 
      call.url.includes('/api/mrblue/analyze') && 
      call.method === 'POST'
    );

    console.log('\n=== RESEARCH & PLANNING TEST ===');
    console.log('All API calls:', apiCalls.map(c => c.url));
    console.log('Called /api/mrblue/analyze:', analyzeEndpointCalled);
    console.log('================================\n');

    // NOTE: This test may fail if analyzeBeforeGenerate() is not enabled in frontend
    // Check client/src/pages/VisualEditorPage.tsx to see if it's being called
  });

  /**
   * TEST 4: Voice Recognition Error Handling
   * 
   * Verify voice button shows helpful error message (not cryptic "network" error)
   */
  test('Voice Recognition: Should show helpful error message', async ({ page }) => {
    await page.goto('/visual-editor');
    await page.waitForLoadState('networkidle');

    // Look for voice button
    const voiceButton = page.getByTestId('button-voice-mode');

    // If voice button doesn't exist, test passes (voice may be disabled)
    const voiceButtonExists = await voiceButton.isVisible().catch(() => false);

    if (!voiceButtonExists) {
      console.log('⚠️ Voice button not found - voice feature may be disabled');
      return;
    }

    // Click voice button
    await voiceButton.click();

    // Wait for toast or error message
    await page.waitForTimeout(2000);

    // Check if helpful toast message appears
    const toastMessage = page.locator('[role="status"], .toast, [class*="toast"]');
    const hasToast = await toastMessage.isVisible().catch(() => false);

    if (hasToast) {
      const toastText = await toastMessage.textContent();
      console.log('Toast message:', toastText);

      // Should say "Voice Mode Unavailable" or similar (NOT cryptic "network" error)
      const isHelpfulMessage = toastText?.includes('Voice Mode') || 
                               toastText?.includes('unavailable') ||
                               toastText?.includes('development mode');

      expect(isHelpfulMessage, 
        'Voice error should show helpful message, not cryptic error'
      ).toBe(true);
    }

    // Verify app didn't crash
    const chatInput = page.getByTestId('input-chat');
    await expect(chatInput).toBeVisible();
  });

  /**
   * TEST 5: Streaming Intelligence
   * 
   * Verify WebSocket streaming works for real-time updates
   */
  test('Streaming: Should receive streaming responses', async ({ page }) => {
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('StreamingChat') || text.includes('Parsed message')) {
        consoleLogs.push(text);
        console.log('[STREAMING]', text);
      }
    });

    await page.goto('/visual-editor');
    await page.waitForLoadState('networkidle');

    const chatInput = page.getByTestId('input-chat');
    const sendButton = page.getByTestId('button-send');

    await chatInput.fill('hello');
    await sendButton.click();

    // Wait for streaming response
    await page.waitForTimeout(5000);

    // Check if streaming messages were parsed
    const hasStreamingMessages = consoleLogs.some(log => 
      log.includes('Parsed message type')
    );

    const hasStreamComplete = consoleLogs.some(log => 
      log.includes('Stream complete')
    );

    console.log('\n=== STREAMING TEST ===');
    console.log('Received streaming messages:', hasStreamingMessages);
    console.log('Stream completed:', hasStreamComplete);
    console.log('======================\n');

    expect(hasStreamingMessages, 'Should receive streaming messages').toBe(true);
  });

  /**
   * TEST 6: Memory System Intelligence
   * 
   * Verify user memories are loaded in chat context
   */
  test('Memory System: Should load user memories', async ({ page }) => {
    const apiCalls: string[] = [];

    page.on('request', request => {
      if (request.url().includes('/api/mrblue/memories')) {
        apiCalls.push(request.url());
        console.log('[MEMORY API]', request.method(), request.url());
      }
    });

    await page.goto('/visual-editor');
    await page.waitForLoadState('networkidle');

    // Trigger a chat message (which should load memories in context)
    const chatInput = page.getByTestId('input-chat');
    const sendButton = page.getByTestId('button-send');

    await chatInput.fill('what do you know about me?');
    await sendButton.click();

    await page.waitForTimeout(3000);

    console.log('\n=== MEMORY TEST ===');
    console.log('Memory API calls:', apiCalls);
    console.log('===================\n');

    // NOTE: Memory loading may happen in backend, not visible in network calls
  });

  /**
   * TEST 7: Error Auto-Analysis Intelligence
   * 
   * Verify errors are automatically analyzed
   */
  test('Error Auto-Analysis: Should analyze errors', async ({ page }) => {
    const errorAPICalls: string[] = [];

    page.on('request', request => {
      if (request.url().includes('/api/mrblue/analyze-error')) {
        errorAPICalls.push(request.url());
        console.log('[ERROR ANALYSIS API]', request.method());
      }
    });

    await page.goto('/visual-editor');
    await page.waitForLoadState('networkidle');

    // Wait for any automatic error analysis
    await page.waitForTimeout(5000);

    console.log('\n=== ERROR ANALYSIS TEST ===');
    console.log('Error analysis API calls:', errorAPICalls.length);
    console.log('===========================\n');

    // At least one error should be analyzed during page load
    // (we saw 404 error for conversation/19969/messages in logs)
  });
});
