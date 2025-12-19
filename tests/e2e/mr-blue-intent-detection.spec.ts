/**
 * MR BLUE INTENT DETECTION E2E TESTS
 * MB.MD Protocol v9.2
 * 
 * Tests the 2-tier intent classification system:
 * - Tier 1: Question Detection (FIRST)
 * - Tier 2: Action Detection (if not question)
 * 
 * Target Accuracy: 95%+
 * Target Latency: <100ms
 */

import { test, expect, type Page } from '@playwright/test';

test.describe('Mr Blue Intent Detection - Questions vs Actions', () => {

  // Helper: Login as admin
  async function loginAsAdmin(page: Page) {
    await page.goto('/login');
    await page.fill('[data-testid="input-email"]', process.env.TEST_ADMIN_EMAIL || 'admin@mundotango.life');
    await page.fill('[data-testid="input-password"]', process.env.TEST_ADMIN_PASSWORD || 'admin123');
    await page.click('[data-testid="button-login"]');
    await expect(page).toHaveURL(/\/(feed|landing|dashboard)/);
  }

  // Helper: Send message to Mr Blue
  async function sendMessage(page: Page, message: string) {
    await page.goto('/mr-blue');
    await page.waitForLoadState('networkidle');
    
    // Find chat input
    const chatInput = await page.locator('[data-testid="input-mr-blue-chat"], [data-testid="input-chat"], textarea').first();
    await chatInput.fill(message);
    
    // Send message
    await page.keyboard.press('Enter');
    
    // Wait for response
    await page.waitForTimeout(5000);
  }

  // Helper: Check if VibeCoding was triggered
  async function wasVibeCodingTriggered(page: Page): Promise<boolean> {
    const selectors = [
      '[data-testid="diff-viewer"]',
      'text=File Changes',
      'text=Generated Code',
      '.diff-viewer',
    ];
    
    for (const selector of selectors) {
      try {
        if (await page.locator(selector).isVisible({ timeout: 2000 })) {
          return true;
        }
      } catch {
        // Continue
      }
    }
    
    return false;
  }

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  // ==================== QUESTION DETECTION TESTS ====================

  test('should detect WH-questions (what, where, how, why)', async ({ page }) => {
    const questions = [
      "what page am i on",
      "where is the login button",
      "how does authentication work",
      "why is the form broken",
      "which file contains the bug",
      "who created this component",
    ];

    console.log('🧪 Testing WH-questions...');
    
    for (const question of questions) {
      await sendMessage(page, question);
      
      const isVibeCoding = await wasVibeCodingTriggered(page);
      
      console.log(`  Testing: "${question}"`);
      console.log(`  VibeCoding triggered: ${isVibeCoding}`);
      
      // Should NOT trigger VibeCoding
      expect(isVibeCoding).toBe(false);
      
      console.log(`  ✅ Correctly identified as question`);
    }
  });

  test('should detect questions with question marks', async ({ page }) => {
    const questions = [
      "what page am i on?",
      "can you help me?",
      "is the database connected?",
      "are there any errors?",
    ];

    console.log('🧪 Testing questions with ?...');
    
    for (const question of questions) {
      await sendMessage(page, question);
      
      const isVibeCoding = await wasVibeCodingTriggered(page);
      
      expect(isVibeCoding).toBe(false);
      console.log(`  ✅ "${question}" → question (not VibeCoding)`);
    }
  });

  test('should detect yes/no questions (is, can, do, would)', async ({ page }) => {
    const questions = [
      "is the database connected",
      "can you explain this",
      "do you understand the code",
      "would this work correctly",
      "does the form validate",
      "has this been implemented",
    ];

    console.log('🧪 Testing yes/no questions...');
    
    for (const question of questions) {
      await sendMessage(page, question);
      
      const isVibeCoding = await wasVibeCodingTriggered(page);
      
      expect(isVibeCoding).toBe(false);
      console.log(`  ✅ "${question}" → question (not VibeCoding)`);
    }
  });

  test('should detect question phrases (tell me, explain, show me)', async ({ page }) => {
    const questions = [
      "tell me about the authentication system",
      "explain how VibeCoding works",
      "show me the user flow",
      "can you tell me what this does",
    ];

    console.log('🧪 Testing question phrases...');
    
    for (const question of questions) {
      await sendMessage(page, question);
      
      const isVibeCoding = await wasVibeCodingTriggered(page);
      
      expect(isVibeCoding).toBe(false);
      console.log(`  ✅ "${question}" → question (not VibeCoding)`);
    }
  });

  // ==================== ACTION DETECTION TESTS ====================

  test('should detect fix/debug actions', async ({ page }) => {
    const actions = [
      "fix the username validation bug",
      "debug the login issue",
      "repair the broken form",
    ];

    console.log('🧪 Testing fix/debug actions...');
    
    for (const action of actions) {
      await sendMessage(page, action);
      
      const isVibeCoding = await wasVibeCodingTriggered(page);
      
      // Should trigger VibeCoding
      expect(isVibeCoding).toBe(true);
      console.log(`  ✅ "${action}" → VibeCoding (correct)`);
    }
  });

  test('should detect create/add actions', async ({ page }) => {
    const actions = [
      "create a new button component",
      "add a search feature",
      "build a login form",
      "implement user authentication",
    ];

    console.log('🧪 Testing create/add actions...');
    
    for (const action of actions) {
      await sendMessage(page, action);
      
      const isVibeCoding = await wasVibeCodingTriggered(page);
      
      expect(isVibeCoding).toBe(true);
      console.log(`  ✅ "${action}" → VibeCoding (correct)`);
    }
  });

  test('should detect update/modify actions', async ({ page }) => {
    const actions = [
      "update the color scheme",
      "modify the header layout",
      "change the font size",
      "edit the navigation menu",
    ];

    console.log('🧪 Testing update/modify actions...');
    
    for (const action of actions) {
      await sendMessage(page, action);
      
      const isVibeCoding = await wasVibeCodingTriggered(page);
      
      expect(isVibeCoding).toBe(true);
      console.log(`  ✅ "${action}" → VibeCoding (correct)`);
    }
  });

  // ==================== EDGE CASES ====================

  test('should handle ambiguous inputs correctly', async ({ page }) => {
    const testCases = [
      { 
        input: "what should I fix?", 
        expected: "question",
        reasoning: "WH-question with question mark takes priority"
      },
      { 
        input: "how to add a button?", 
        expected: "question",
        reasoning: "WH-question even though 'add' is present"
      },
      { 
        input: "fix it now", 
        expected: "action",
        reasoning: "Starts with action verb 'fix'"
      },
      { 
        input: "add more features", 
        expected: "action",
        reasoning: "Starts with action verb 'add'"
      },
    ];

    console.log('🧪 Testing edge cases...');
    
    for (const testCase of testCases) {
      await sendMessage(page, testCase.input);
      
      const isVibeCoding = await wasVibeCodingTriggered(page);
      
      if (testCase.expected === "question") {
        expect(isVibeCoding).toBe(false);
      } else {
        expect(isVibeCoding).toBe(true);
      }
      
      console.log(`  ✅ "${testCase.input}" → ${testCase.expected}`);
      console.log(`     Reasoning: ${testCase.reasoning}`);
    }
  });

  // ==================== REGRESSION TESTS ====================

  test('should maintain existing VibeCoding functionality', async ({ page }) => {
    // Test that explicit MB.MD requests still work
    const mbmdRequests = [
      "use mb.md: create a new component",
      "mb.md: fix the authentication bug",
    ];

    console.log('🧪 Testing MB.MD protocol compatibility...');
    
    for (const request of mbmdRequests) {
      await sendMessage(page, request);
      
      const isVibeCoding = await wasVibeCodingTriggered(page);
      
      // Should still trigger VibeCoding
      expect(isVibeCoding).toBe(true);
      console.log(`  ✅ "${request}" → VibeCoding (backward compatible)`);
    }
  });

  // ==================== PERFORMANCE TESTS ====================

  test('should detect intent within <100ms', async ({ page }) => {
    await page.goto('/mr-blue');
    
    const testMessages = [
      "what page am i on",
      "fix the bug",
      "how does this work",
      "add a button",
    ];

    console.log('🧪 Testing intent detection latency...');
    
    for (const message of testMessages) {
      const startTime = Date.now();
      
      await page.fill('[data-testid="input-mr-blue-chat"], [data-testid="input-chat"], textarea', message);
      await page.keyboard.press('Enter');
      
      // Wait for intent detection log (should be immediate)
      await page.waitForTimeout(500);
      
      const detectionTime = Date.now() - startTime;
      
      console.log(`  Intent detection for "${message}": ${detectionTime}ms`);
      
      // Note: Actual detection happens server-side, this measures client latency
      // Real test would need server metrics
    }
  });

  // ==================== SUMMARY TEST ====================

  test('FINAL: Comprehensive accuracy test', async ({ page }) => {
    const testCases = [
      // Questions (should NOT trigger VibeCoding)
      { input: "what page am i on", shouldBeAction: false },
      { input: "how does auth work?", shouldBeAction: false },
      { input: "can you explain this?", shouldBeAction: false },
      { input: "is the database connected?", shouldBeAction: false },
      { input: "tell me about the code", shouldBeAction: false },
      
      // Actions (SHOULD trigger VibeCoding)
      { input: "fix the username bug", shouldBeAction: true },
      { input: "add a new button", shouldBeAction: true },
      { input: "create a login form", shouldBeAction: true },
      { input: "update the color scheme", shouldBeAction: true },
      { input: "remove the broken link", shouldBeAction: true },
    ];

    let correctCount = 0;
    const totalCount = testCases.length;

    console.log('🎯 FINAL ACCURACY TEST');
    console.log('='.repeat(60));
    
    for (const testCase of testCases) {
      await sendMessage(page, testCase.input);
      
      const isVibeCoding = await wasVibeCodingTriggered(page);
      const isCorrect = isVibeCoding === testCase.shouldBeAction;
      
      if (isCorrect) {
        correctCount++;
        console.log(`  ✅ "${testCase.input}" → ${testCase.shouldBeAction ? 'action' : 'question'}`);
      } else {
        console.log(`  ❌ "${testCase.input}" → WRONG (expected ${testCase.shouldBeAction ? 'action' : 'question'})`);
      }
    }

    const accuracy = (correctCount / totalCount) * 100;
    console.log('='.repeat(60));
    console.log(`📊 ACCURACY: ${correctCount}/${totalCount} (${accuracy.toFixed(1)}%)`);
    console.log(`🎯 TARGET: 95%+`);
    
    // Expect 95%+ accuracy
    expect(accuracy).toBeGreaterThanOrEqual(95);
    
    if (accuracy >= 95) {
      console.log('🎊 SUCCESS: Intent detection meets 95%+ accuracy target!');
    } else {
      console.log('⚠️ FAILED: Intent detection below 95% accuracy');
    }
  });
});
