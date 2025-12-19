import { test, expect } from '@playwright/test';
import { BugReporter } from './helpers/bug-reporter';

const SUITE_NAME = 'Chat Routing Tests';
const TEST_EMAIL = process.env.TEST_ADMIN_EMAIL || 'admin@mundotango.life';
const TEST_PASSWORD = process.env.TEST_ADMIN_PASSWORD || 'admin123';

test.describe(SUITE_NAME, () => {
  let bugReporter: BugReporter;

  test.beforeEach(async ({ page }) => {
    bugReporter = new BugReporter(page);
    await page.goto('/login');
    await page.fill('[data-testid="input-email"]', TEST_EMAIL);
    await page.fill('[data-testid="input-password"]', TEST_PASSWORD);
    await page.click('[data-testid="button-login"]');
    await page.waitForURL(/\/feed|\/dashboard/, { timeout: 10000 });
    
    const mrBlueButton = page.locator('[data-testid="button-mr-blue"]').first();
    if (await mrBlueButton.isVisible()) {
      await mrBlueButton.click();
      await page.waitForTimeout(1000);
    }
  });

  test('CHAT-01: "hello" routes to /api/mrblue/chat', async ({ page }, testInfo) => {
    try {
      bugReporter.clearLogs();
      
      const chatInput = page.locator('[data-testid="input-chat"]');
      await chatInput.fill('hello');
      await chatInput.press('Enter');
      
      await page.waitForTimeout(2000);
      
      const chatRequests = bugReporter.getNetworkLogs().filter(log =>
        log.url.includes('/api/mrblue/chat')
      );
      
      expect(chatRequests.length).toBeGreaterThan(0);
    } catch (error) {
      await bugReporter.createBugReport(
        SUITE_NAME,
        '"hello" routes to /api/mrblue/chat',
        1,
        String(error),
        {
          files: ['client/src/components/mrblue/MrBlueChat.tsx', 'server/routes/mrblue.ts'],
          issue: 'Conversational messages not routing to chat endpoint',
          expectedFix: 'Implement routing logic to detect conversational vs autonomous messages',
          priority: 'critical',
        },
        testInfo
      );
      throw error;
    }
  });

  test('CHAT-02: "what can you do" routes to /api/mrblue/chat', async ({ page }, testInfo) => {
    try {
      bugReporter.clearLogs();
      
      const chatInput = page.locator('[data-testid="input-chat"]');
      await chatInput.fill('what can you do');
      await chatInput.press('Enter');
      
      await page.waitForTimeout(2000);
      
      const chatRequests = bugReporter.getNetworkLogs().filter(log =>
        log.url.includes('/api/mrblue/chat')
      );
      
      expect(chatRequests.length).toBeGreaterThan(0);
    } catch (error) {
      await bugReporter.createBugReport(
        SUITE_NAME,
        '"what can you do" routes to chat',
        2,
        String(error),
        {
          files: ['client/src/lib/mrBlue/intentClassifier.ts'],
          issue: 'Question messages not classified as conversational',
          expectedFix: 'Update intent classifier to recognize questions',
          priority: 'high',
        },
        testInfo
      );
      throw error;
    }
  });

  test('CHAT-03: "tell me about tango" routes to /api/mrblue/chat', async ({ page }, testInfo) => {
    try {
      bugReporter.clearLogs();
      
      const chatInput = page.locator('[data-testid="input-chat"]');
      await chatInput.fill('tell me about tango');
      await chatInput.press('Enter');
      
      await page.waitForTimeout(2000);
      
      const chatRequests = bugReporter.getNetworkLogs().filter(log =>
        log.url.includes('/api/mrblue/chat')
      );
      
      expect(chatRequests.length).toBeGreaterThan(0);
    } catch (error) {
      await bugReporter.createBugReport(
        SUITE_NAME,
        '"tell me about" routes to chat',
        3,
        String(error),
        {
          files: ['client/src/lib/mrBlue/intentClassifier.ts'],
          issue: 'Informational queries not routing to chat',
          expectedFix: 'Add informational intent patterns',
          priority: 'medium',
        },
        testInfo
      );
      throw error;
    }
  });

  test('CHAT-04: "build a login page" routes to /api/autonomous/execute', async ({ page }, testInfo) => {
    try {
      bugReporter.clearLogs();
      
      const chatInput = page.locator('[data-testid="input-chat"]');
      await chatInput.fill('build a login page');
      await chatInput.press('Enter');
      
      await page.waitForTimeout(2000);
      
      const autonomousRequests = bugReporter.getNetworkLogs().filter(log =>
        log.url.includes('/api/autonomous/execute')
      );
      
      expect(autonomousRequests.length).toBeGreaterThan(0);
    } catch (error) {
      await bugReporter.createBugReport(
        SUITE_NAME,
        '"build" routes to autonomous',
        4,
        String(error),
        {
          files: ['client/src/lib/mrBlue/intentClassifier.ts', 'server/routes/autonomous.ts'],
          issue: 'Build commands not routing to autonomous endpoint',
          expectedFix: 'Add "build" keyword to autonomous intent patterns',
          priority: 'critical',
        },
        testInfo
      );
      throw error;
    }
  });

  test('CHAT-05: "fix the bug" routes to /api/autonomous/execute', async ({ page }, testInfo) => {
    try {
      bugReporter.clearLogs();
      
      const chatInput = page.locator('[data-testid="input-chat"]');
      await chatInput.fill('fix the bug');
      await chatInput.press('Enter');
      
      await page.waitForTimeout(2000);
      
      const autonomousRequests = bugReporter.getNetworkLogs().filter(log =>
        log.url.includes('/api/autonomous/execute')
      );
      
      expect(autonomousRequests.length).toBeGreaterThan(0);
    } catch (error) {
      await bugReporter.createBugReport(
        SUITE_NAME,
        '"fix" routes to autonomous',
        5,
        String(error),
        {
          files: ['client/src/lib/mrBlue/intentClassifier.ts'],
          issue: 'Fix commands not classified as autonomous',
          expectedFix: 'Add "fix" keyword to autonomous patterns',
          priority: 'high',
        },
        testInfo
      );
      throw error;
    }
  });

  test('CHAT-06: "create a feature" routes to /api/autonomous/execute', async ({ page }, testInfo) => {
    try {
      bugReporter.clearLogs();
      
      const chatInput = page.locator('[data-testid="input-chat"]');
      await chatInput.fill('create a feature for user profiles');
      await chatInput.press('Enter');
      
      await page.waitForTimeout(2000);
      
      const autonomousRequests = bugReporter.getNetworkLogs().filter(log =>
        log.url.includes('/api/autonomous/execute')
      );
      
      expect(autonomousRequests.length).toBeGreaterThan(0);
    } catch (error) {
      await bugReporter.createBugReport(
        SUITE_NAME,
        '"create" routes to autonomous',
        6,
        String(error),
        {
          files: ['client/src/lib/mrBlue/intentClassifier.ts'],
          issue: 'Create commands not routing to autonomous',
          expectedFix: 'Add "create" to autonomous intent keywords',
          priority: 'high',
        },
        testInfo
      );
      throw error;
    }
  });

  test('CHAT-07: Quick style "make this blue" routes to /api/autonomous/quick-style', async ({ page }, testInfo) => {
    try {
      await page.goto('/visual-editor');
      await page.waitForTimeout(2000);
      
      const element = page.locator('button').first();
      if (await element.isVisible()) {
        await element.click();
        await page.waitForTimeout(500);
      }
      
      bugReporter.clearLogs();
      
      const chatInput = page.locator('[data-testid="input-chat"]');
      await chatInput.fill('make this blue');
      await chatInput.press('Enter');
      
      await page.waitForTimeout(2000);
      
      const quickStyleRequests = bugReporter.getNetworkLogs().filter(log =>
        log.url.includes('/api/autonomous/quick-style')
      );
      
      expect(quickStyleRequests.length).toBeGreaterThan(0);
    } catch (error) {
      await bugReporter.createBugReport(
        SUITE_NAME,
        'Quick style routing with selection',
        7,
        String(error),
        {
          files: ['client/src/lib/mrBlue/intentClassifier.ts', 'server/routes/autonomous.ts'],
          issue: 'Quick style commands not routing correctly',
          expectedFix: 'Implement element selection + style command detection',
          priority: 'high',
        },
        testInfo
      );
      throw error;
    }
  });

  test('CHAT-08: Quick style "change background to red" routes correctly', async ({ page }, testInfo) => {
    try {
      await page.goto('/visual-editor');
      await page.waitForTimeout(2000);
      
      const element = page.locator('div').first();
      if (await element.isVisible()) {
        await element.click();
      }
      
      bugReporter.clearLogs();
      
      const chatInput = page.locator('[data-testid="input-chat"]');
      await chatInput.fill('change background to red');
      await chatInput.press('Enter');
      
      await page.waitForTimeout(2000);
      
      const quickStyleRequests = bugReporter.getNetworkLogs().filter(log =>
        log.url.includes('/api/autonomous/quick-style')
      );
      
      expect(quickStyleRequests.length).toBeGreaterThan(0);
    } catch (error) {
      await bugReporter.createBugReport(
        SUITE_NAME,
        'Background change quick style',
        8,
        String(error),
        {
          files: ['client/src/lib/mrBlue/intentClassifier.ts'],
          issue: 'Style modification commands not detected',
          expectedFix: 'Add style-related keywords to quick-style patterns',
          priority: 'medium',
        },
        testInfo
      );
      throw error;
    }
  });

  test('CHAT-09: Chat response is conversational, not "Starting task..."', async ({ page }, testInfo) => {
    try {
      const chatInput = page.locator('[data-testid="input-chat"]');
      await chatInput.fill('hello');
      await chatInput.press('Enter');
      
      await page.waitForTimeout(3000);
      
      const chatResponse = page.locator('[data-testid="text-chat-response"]').last();
      const responseText = await chatResponse.textContent();
      
      expect(responseText).toBeTruthy();
      expect(responseText?.toLowerCase()).not.toContain('starting task');
      expect(responseText?.toLowerCase()).not.toContain('executing');
    } catch (error) {
      await bugReporter.createBugReport(
        SUITE_NAME,
        'Response is conversational',
        9,
        String(error),
        {
          files: ['server/routes/mrblue.ts', 'server/services/ai/chatService.ts'],
          issue: 'Chat responses showing task status instead of conversation',
          expectedFix: 'Return conversational responses for chat endpoint',
          priority: 'critical',
        },
        testInfo
      );
      throw error;
    }
  });

  test('CHAT-10: Streaming works with progressive text display', async ({ page }, testInfo) => {
    try {
      const chatInput = page.locator('[data-testid="input-chat"]');
      await chatInput.fill('tell me a story about tango');
      
      let streamingDetected = false;
      page.on('response', async (response) => {
        if (response.url().includes('/api/mrblue/chat')) {
          const contentType = response.headers()['content-type'];
          if (contentType?.includes('text/event-stream') || contentType?.includes('stream')) {
            streamingDetected = true;
          }
        }
      });
      
      await chatInput.press('Enter');
      await page.waitForTimeout(5000);
      
      expect(streamingDetected).toBeTruthy();
    } catch (error) {
      await bugReporter.createBugReport(
        SUITE_NAME,
        'Streaming progressive display',
        10,
        String(error),
        {
          files: ['server/routes/mrblue.ts', 'client/src/components/mrblue/MrBlueChat.tsx'],
          issue: 'Streaming not working for chat responses',
          expectedFix: 'Implement SSE streaming for chat endpoint',
          priority: 'high',
        },
        testInfo
      );
      throw error;
    }
  });

  test('CHAT-11: Multiple chat messages route correctly', async ({ page }, testInfo) => {
    try {
      const messages = [
        { text: 'hello', expectedEndpoint: '/api/mrblue/chat' },
        { text: 'build a feature', expectedEndpoint: '/api/autonomous/execute' },
        { text: 'what is tango', expectedEndpoint: '/api/mrblue/chat' },
      ];
      
      for (const msg of messages) {
        bugReporter.clearLogs();
        
        const chatInput = page.locator('[data-testid="input-chat"]');
        await chatInput.fill(msg.text);
        await chatInput.press('Enter');
        
        await page.waitForTimeout(2000);
        
        const requests = bugReporter.getNetworkLogs().filter(log =>
          log.url.includes(msg.expectedEndpoint)
        );
        
        expect(requests.length).toBeGreaterThan(0);
      }
    } catch (error) {
      await bugReporter.createBugReport(
        SUITE_NAME,
        'Multiple messages route correctly',
        11,
        String(error),
        {
          files: ['client/src/lib/mrBlue/intentClassifier.ts'],
          issue: 'Intent classifier failing on multiple messages',
          expectedFix: 'Ensure state resets between message classifications',
          priority: 'medium',
        },
        testInfo
      );
      throw error;
    }
  });

  test('CHAT-12: Context-aware routing based on conversation history', async ({ page }, testInfo) => {
    try {
      const chatInput = page.locator('[data-testid="input-chat"]');
      
      await chatInput.fill('I want to build a feature');
      await chatInput.press('Enter');
      await page.waitForTimeout(2000);
      
      bugReporter.clearLogs();
      
      await chatInput.fill('make it blue');
      await chatInput.press('Enter');
      await page.waitForTimeout(2000);
      
      const autonomousRequests = bugReporter.getNetworkLogs().filter(log =>
        log.url.includes('/api/autonomous')
      );
      
      expect(autonomousRequests.length).toBeGreaterThan(0);
    } catch (error) {
      await bugReporter.createBugReport(
        SUITE_NAME,
        'Context-aware routing',
        12,
        String(error),
        {
          files: ['client/src/lib/mrBlue/intentClassifier.ts'],
          issue: 'Not using conversation context for routing',
          expectedFix: 'Implement context tracking in intent classifier',
          priority: 'low',
        },
        testInfo
      );
      throw error;
    }
  });

  test('CHAT-13: Error messages route to chat endpoint', async ({ page }, testInfo) => {
    try {
      bugReporter.clearLogs();
      
      const chatInput = page.locator('[data-testid="input-chat"]');
      await chatInput.fill('help I have an error');
      await chatInput.press('Enter');
      
      await page.waitForTimeout(2000);
      
      const chatRequests = bugReporter.getNetworkLogs().filter(log =>
        log.url.includes('/api/mrblue/chat')
      );
      
      expect(chatRequests.length).toBeGreaterThan(0);
    } catch (error) {
      await bugReporter.createBugReport(
        SUITE_NAME,
        'Error messages route to chat',
        13,
        String(error),
        {
          files: ['client/src/lib/mrBlue/intentClassifier.ts'],
          issue: 'Help/error requests not classified as conversational',
          expectedFix: 'Add help keywords to chat intent patterns',
          priority: 'medium',
        },
        testInfo
      );
      throw error;
    }
  });

  test('CHAT-14: Code snippets in messages handled correctly', async ({ page }, testInfo) => {
    try {
      bugReporter.clearLogs();
      
      const chatInput = page.locator('[data-testid="input-chat"]');
      await chatInput.fill('explain this code: const x = 5;');
      await chatInput.press('Enter');
      
      await page.waitForTimeout(2000);
      
      const chatRequests = bugReporter.getNetworkLogs().filter(log =>
        log.url.includes('/api/mrblue/chat')
      );
      
      expect(chatRequests.length).toBeGreaterThan(0);
    } catch (error) {
      await bugReporter.createBugReport(
        SUITE_NAME,
        'Code snippets handled',
        14,
        String(error),
        {
          files: ['client/src/lib/mrBlue/intentClassifier.ts'],
          issue: 'Code explanation requests misrouted',
          expectedFix: 'Detect "explain" keyword for chat routing',
          priority: 'low',
        },
        testInfo
      );
      throw error;
    }
  });

  test('CHAT-15: Empty messages prevented from sending', async ({ page }, testInfo) => {
    try {
      bugReporter.clearLogs();
      
      const chatInput = page.locator('[data-testid="input-chat"]');
      await chatInput.press('Enter');
      
      await page.waitForTimeout(1000);
      
      const allRequests = bugReporter.getNetworkLogs().filter(log =>
        log.url.includes('/api/mrblue') || log.url.includes('/api/autonomous')
      );
      
      expect(allRequests.length).toBe(0);
    } catch (error) {
      await bugReporter.createBugReport(
        SUITE_NAME,
        'Empty messages prevented',
        15,
        String(error),
        {
          files: ['client/src/components/mrblue/MrBlueChat.tsx'],
          issue: 'Empty messages being sent to API',
          expectedFix: 'Add validation to prevent empty message submission',
          priority: 'low',
        },
        testInfo
      );
      throw error;
    }
  });

  test('CHAT-16: Long messages handled without truncation', async ({ page }, testInfo) => {
    try {
      const longMessage = 'Please help me build a comprehensive user authentication system with email verification, password reset, two-factor authentication, session management, and OAuth integration for Google and Facebook. '.repeat(3);
      
      bugReporter.clearLogs();
      
      const chatInput = page.locator('[data-testid="input-chat"]');
      await chatInput.fill(longMessage);
      await chatInput.press('Enter');
      
      await page.waitForTimeout(2000);
      
      const requests = bugReporter.getNetworkLogs().filter(log =>
        log.url.includes('/api/')
      );
      
      expect(requests.length).toBeGreaterThan(0);
    } catch (error) {
      await bugReporter.createBugReport(
        SUITE_NAME,
        'Long messages handled',
        16,
        String(error),
        {
          files: ['client/src/components/mrblue/MrBlueChat.tsx'],
          issue: 'Long messages failing to send',
          expectedFix: 'Remove message length restrictions or increase limit',
          priority: 'low',
        },
        testInfo
      );
      throw error;
    }
  });

  test('CHAT-17: Special characters in messages handled correctly', async ({ page }, testInfo) => {
    try {
      bugReporter.clearLogs();
      
      const chatInput = page.locator('[data-testid="input-chat"]');
      await chatInput.fill('hello @user! how are you? 😊 #tango');
      await chatInput.press('Enter');
      
      await page.waitForTimeout(2000);
      
      const chatRequests = bugReporter.getNetworkLogs().filter(log =>
        log.url.includes('/api/mrblue/chat')
      );
      
      expect(chatRequests.length).toBeGreaterThan(0);
      expect(chatRequests[0].status).toBe(200);
    } catch (error) {
      await bugReporter.createBugReport(
        SUITE_NAME,
        'Special characters handled',
        17,
        String(error),
        {
          files: ['client/src/components/mrblue/MrBlueChat.tsx', 'server/routes/mrblue.ts'],
          issue: 'Special characters causing message failures',
          expectedFix: 'Properly encode special characters in requests',
          priority: 'medium',
        },
        testInfo
      );
      throw error;
    }
  });

  test('CHAT-18: Rapid consecutive messages queued correctly', async ({ page }, testInfo) => {
    try {
      bugReporter.clearLogs();
      
      const chatInput = page.locator('[data-testid="input-chat"]');
      
      await chatInput.fill('hello');
      await chatInput.press('Enter');
      
      await chatInput.fill('how are you');
      await chatInput.press('Enter');
      
      await chatInput.fill('tell me about tango');
      await chatInput.press('Enter');
      
      await page.waitForTimeout(5000);
      
      const chatRequests = bugReporter.getNetworkLogs().filter(log =>
        log.url.includes('/api/mrblue/chat')
      );
      
      expect(chatRequests.length).toBeGreaterThanOrEqual(2);
    } catch (error) {
      await bugReporter.createBugReport(
        SUITE_NAME,
        'Rapid messages queued',
        18,
        String(error),
        {
          files: ['client/src/components/mrblue/MrBlueChat.tsx'],
          issue: 'Rapid messages not being queued/sent properly',
          expectedFix: 'Implement message queue for rapid submissions',
          priority: 'medium',
        },
        testInfo
      );
      throw error;
    }
  });
});
