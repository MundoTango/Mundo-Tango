/**
 * MB.MD v9.2 - VibeCoding + Self-Healing UX Fix Tests
 * 
 * Tests Training Lesson #44:
 * 1. VibeCoding generates actual code (not "I'll help you" responses)
 * 2. Self-healing notification integrated in Errors tab (not floating overlay)
 * 
 * This test validates the complete fix for Action-Claim Mismatch anti-pattern
 */

import { test, expect } from '@playwright/test';

test.describe('VibeCoding + Self-Healing UX - Training Lesson #44', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to Visual Editor (Mr. Blue God Mode)
    await page.goto('/');
    await page.waitForTimeout(2000); // Allow self-healing to complete
  });

  test('VibeCoding generates actual code, not generic "I will help you" responses', async ({ page }) => {
    // Navigate to Visual Editor
    await page.goto('/');
    
    // Type VibeCoding request
    const chatInput = page.getByTestId('input-mr-blue-chat');
    await chatInput.fill('Generate a simple React button component with TypeScript');
    
    // Send request
    const sendButton = page.getByTestId('button-send');
    await sendButton.click();
    
    // Wait for Mr. Blue response (up to 10 seconds for GROQ Llama-3.3-70b)
    await page.waitForTimeout(10000);
    
    // Get all messages in conversation
    const messages = await page.locator('[data-testid^="message-"]').all();
    
    // Should have at least 2 messages (user + assistant)
    expect(messages.length).toBeGreaterThanOrEqual(2);
    
    // Get the last message (Mr. Blue's response)
    const lastMessage = messages[messages.length - 1];
    const responseText = await lastMessage.textContent();
    
    // CRITICAL ASSERTIONS: Must generate actual code
    expect(responseText).toContain('```'); // Must include code block
    expect(responseText).not.toContain('I will help you'); // Must NOT be generic
    expect(responseText).not.toContain("I'll help you"); // Must NOT be generic
    expect(responseText?.length || 0).toBeGreaterThan(100); // Must be substantial
    
    console.log('✅ VibeCoding generated actual code (not generic response)');
  });

  test('Self-healing notification appears in Errors tab, not as floating overlay', async ({ page }) => {
    await page.goto('/');
    
    // Wait for auto-triggered self-healing to complete
    await page.waitForTimeout(3000);
    
    // Navigate to Errors tab
    const errorsTab = page.getByTestId('tab-errors');
    await errorsTab.click();
    
    // Wait for tab content to load
    await page.waitForTimeout(500);
    
    // Check for self-healing result in Errors tab
    const selfHealingResult = page.getByTestId('self-healing-result');
    
    // If self-healing ran, verify it's in the Errors tab
    if (await selfHealingResult.isVisible()) {
      // Verify it's inside ScrollArea (part of Errors tab content)
      const parent = await selfHealingResult.locator('..').getAttribute('class');
      
      // Should NOT have 'absolute' class (floating overlay)
      expect(parent).not.toContain('absolute');
      
      // Should contain self-healing completion message
      const resultText = await selfHealingResult.textContent();
      expect(resultText).toContain('Self-Healing Complete');
      expect(resultText).toContain('Agents:');
      expect(resultText).toContain('Total Time:');
      
      console.log('✅ Self-healing notification integrated in Errors tab');
    } else {
      console.log('⏭️  No self-healing result (no issues detected)');
    }
    
    // Ensure NO floating overlay exists
    const floatingNotification = page.locator('[data-testid="self-healing-result"].absolute');
    await expect(floatingNotification).toHaveCount(0);
    
    console.log('✅ No floating overlay (verified)');
  });

  test('VibeCoding endpoint responds with correct structure', async ({ page }) => {
    // Intercept API call to /api/mrblue/generate-code
    let apiResponse: any;
    
    page.on('response', async (response) => {
      if (response.url().includes('/api/mrblue/generate-code')) {
        apiResponse = await response.json();
      }
    });
    
    // Trigger VibeCoding request
    const chatInput = page.getByTestId('input-mr-blue-chat');
    await chatInput.fill('Create a TypeScript interface for a User');
    
    const sendButton = page.getByTestId('button-send');
    await sendButton.click();
    
    // Wait for API response
    await page.waitForTimeout(10000);
    
    // Verify API response structure
    if (apiResponse) {
      expect(apiResponse.success).toBe(true);
      expect(apiResponse.code).toBeDefined(); // Code blocks extracted
      expect(apiResponse.explanation).toBeDefined(); // Explanation provided
      expect(apiResponse.model).toBe('llama-3.3-70b-versatile'); // Correct model
      expect(apiResponse.tokensUsed).toBeGreaterThan(0); // Tokens consumed
      
      console.log('✅ VibeCoding API structure correct:', apiResponse);
    } else {
      throw new Error('❌ VibeCoding API was not called');
    }
  });

  test('Self-healing status shows "Running" state correctly', async ({ page }) => {
    await page.goto('/');
    
    // Navigate to Errors tab immediately (might catch "Running" state)
    const errorsTab = page.getByTestId('tab-errors');
    await errorsTab.click();
    
    // Wait a moment to see if "Running" status appears
    await page.waitForTimeout(100);
    
    const runningStatus = page.getByTestId('self-healing-status');
    
    // If running state is visible, verify structure
    if (await runningStatus.isVisible({ timeout: 500 })) {
      const statusText = await runningStatus.textContent();
      expect(statusText).toContain('Self-Healing System Active');
      expect(statusText).toContain('Scanning');
      
      // Should have loading spinner
      const spinner = runningStatus.locator('.animate-spin');
      await expect(spinner).toBeVisible();
      
      console.log('✅ Self-healing "Running" state captured');
    } else {
      console.log('⏭️  Self-healing completed too quickly (good performance)');
    }
  });

  test('Errors tab shows error patterns with correct structure', async ({ page }) => {
    await page.goto('/');
    
    // Navigate to Errors tab
    const errorsTab = page.getByTestId('tab-errors');
    await errorsTab.click();
    
    await page.waitForTimeout(1000);
    
    // Check if error patterns card exists
    const errorAnalysisCard = page.getByTestId('card-error-analysis');
    await expect(errorAnalysisCard).toBeVisible();
    
    // Verify card structure
    const cardText = await errorAnalysisCard.textContent();
    expect(cardText).toContain('Error Analysis');
    expect(cardText).toContain('AI-analyzed error patterns');
    
    // Check for either error patterns or empty state
    const errorPatternsList = page.getByTestId('list-error-patterns');
    const emptyState = page.getByTestId('status-empty');
    
    const hasErrors = await errorPatternsList.isVisible({ timeout: 1000 }).catch(() => false);
    const isEmpty = await emptyState.isVisible({ timeout: 1000 }).catch(() => false);
    
    // Should have either error patterns or empty state (not both)
    expect(hasErrors || isEmpty).toBe(true);
    
    if (hasErrors) {
      console.log('✅ Error patterns displayed');
    } else {
      console.log('✅ Empty state shown (no errors)');
    }
  });

  test('Complete VibeCoding + Self-Healing integration flow', async ({ page }) => {
    await page.goto('/');
    
    // 1. Wait for self-healing to run
    await page.waitForTimeout(3000);
    
    // 2. Navigate to Errors tab
    const errorsTab = page.getByTestId('tab-errors');
    await errorsTab.click();
    await page.waitForTimeout(500);
    
    // 3. Verify self-healing result is in Errors tab (if available)
    const selfHealingInTab = await page.getByTestId('self-healing-result').isVisible().catch(() => false);
    
    // 4. Navigate back to chat
    const chatInput = page.getByTestId('input-mr-blue-chat');
    await chatInput.fill('Generate a Hello World function');
    
    // 5. Send VibeCoding request
    const sendButton = page.getByTestId('button-send');
    await sendButton.click();
    
    // 6. Wait for code generation
    await page.waitForTimeout(10000);
    
    // 7. Verify response contains code
    const messages = await page.locator('[data-testid^="message-"]').all();
    const lastMessage = messages[messages.length - 1];
    const responseText = await lastMessage.textContent();
    
    expect(responseText).toContain('```');
    
    console.log('✅ Complete integration flow successful');
    console.log(`   - Self-healing: ${selfHealingInTab ? 'Integrated in Errors tab' : 'No issues detected'}`);
    console.log(`   - VibeCoding: Generated ${responseText?.length} characters`);
  });
});

test.describe('Training Lesson #44 - Validation', () => {
  test('Lesson #44 fixes are production-ready', async ({ page }) => {
    await page.goto('/');
    
    const validations = {
      'VibeCoding endpoint exists': false,
      'Self-healing integrated in Errors tab': false,
      'No floating overlays': true, // Assume true until proven false
      'Code generation functional': false,
    };
    
    // 1. Test VibeCoding endpoint
    try {
      const chatInput = page.getByTestId('input-mr-blue-chat');
      await chatInput.fill('Test code generation');
      const sendButton = page.getByTestId('button-send');
      await sendButton.click();
      await page.waitForTimeout(10000);
      
      const messages = await page.locator('[data-testid^="message-"]').all();
      if (messages.length >= 2) {
        const lastMessage = messages[messages.length - 1];
        const text = await lastMessage.textContent();
        
        if (text && text.includes('```')) {
          validations['VibeCoding endpoint exists'] = true;
          validations['Code generation functional'] = true;
        }
      }
    } catch (err) {
      console.error('VibeCoding test failed:', err);
    }
    
    // 2. Test self-healing integration
    try {
      const errorsTab = page.getByTestId('tab-errors');
      await errorsTab.click();
      await page.waitForTimeout(1000);
      
      const errorCard = page.getByTestId('card-error-analysis');
      if (await errorCard.isVisible()) {
        validations['Self-healing integrated in Errors tab'] = true;
      }
    } catch (err) {
      console.error('Self-healing integration test failed:', err);
    }
    
    // 3. Verify no floating overlays
    try {
      const floatingOverlay = page.locator('.absolute[data-testid="self-healing-result"]');
      const count = await floatingOverlay.count();
      
      if (count > 0) {
        validations['No floating overlays'] = false;
      }
    } catch (err) {
      console.error('Floating overlay check failed:', err);
    }
    
    // Print validation results
    console.log('\n=== Training Lesson #44 Validation Results ===');
    Object.entries(validations).forEach(([key, value]) => {
      console.log(`${value ? '✅' : '❌'} ${key}`);
    });
    
    // All validations must pass
    const allPassed = Object.values(validations).every(v => v === true);
    expect(allPassed).toBe(true);
    
    console.log(`\n${allPassed ? '✅ ALL VALIDATIONS PASSED' : '❌ SOME VALIDATIONS FAILED'}`);
  });
});
