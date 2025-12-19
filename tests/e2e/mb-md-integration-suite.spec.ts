import { test, expect } from '@playwright/test';
import { BugReporter } from './helpers/bug-reporter';

const SUITE_NAME = 'Integration Tests';
const TEST_EMAIL = process.env.TEST_ADMIN_EMAIL || 'admin@mundotango.life';
const TEST_PASSWORD = process.env.TEST_ADMIN_PASSWORD || 'admin123';

test.describe(SUITE_NAME, () => {
  let bugReporter: BugReporter;

  test.beforeEach(async ({ page }) => {
    bugReporter = new BugReporter(page);
  });

  test('INT-01: Full flow - Login → Feed → Chat → Response', async ({ page }, testInfo) => {
    try {
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
      
      const chatInput = page.locator('[data-testid="input-chat"]');
      await chatInput.fill('hello');
      await chatInput.press('Enter');
      
      await page.waitForTimeout(5000);
      
      const chatResponse = page.locator('[data-testid="text-chat-response"]').last();
      await expect(chatResponse).toBeVisible();
      
      const wsErrors = bugReporter.getWebSocketErrors();
      const apiErrors = bugReporter.get401Errors();
      
      expect(wsErrors.length).toBe(0);
      expect(apiErrors.length).toBe(0);
    } catch (error) {
      await bugReporter.createBugReport(
        SUITE_NAME,
        'Full flow Login to Chat Response',
        1,
        String(error),
        {
          files: ['client/src/App.tsx', 'client/src/components/mrblue/MrBlueChat.tsx'],
          issue: 'End-to-end chat flow not working',
          expectedFix: 'Ensure all components work together seamlessly',
          priority: 'critical',
        },
        testInfo
      );
      throw error;
    }
  });

  test('INT-02: Full flow - Login → Visual Editor → Chat → Get response', async ({ page }, testInfo) => {
    try {
      await page.goto('/login');
      await page.fill('[data-testid="input-email"]', TEST_EMAIL);
      await page.fill('[data-testid="input-password"]', TEST_PASSWORD);
      await page.click('[data-testid="button-login"]');
      await page.waitForURL(/\/feed|\/dashboard/);
      
      await page.goto('/visual-editor');
      await page.waitForTimeout(2000);
      
      const mrBlueButton = page.locator('[data-testid="button-mr-blue"]').first();
      if (await mrBlueButton.isVisible()) {
        await mrBlueButton.click();
        await page.waitForTimeout(1000);
      }
      
      const chatInput = page.locator('[data-testid="input-chat"]');
      await chatInput.fill('hello');
      await chatInput.press('Enter');
      
      await page.waitForTimeout(5000);
      
      const chatResponse = page.locator('[data-testid="text-chat-response"]').last();
      await expect(chatResponse).toBeVisible();
      
      const consoleErrors = bugReporter.getConsoleErrors();
      expect(consoleErrors.length).toBe(0);
    } catch (error) {
      await bugReporter.createBugReport(
        SUITE_NAME,
        'Visual Editor chat integration',
        2,
        String(error),
        {
          files: ['client/src/pages/VisualEditor.tsx', 'client/src/components/mrblue/MrBlueChat.tsx'],
          issue: 'Chat not working in Visual Editor context',
          expectedFix: 'Ensure Mr. Blue chat works in all page contexts',
          priority: 'high',
        },
        testInfo
      );
      throw error;
    }
  });

  test('INT-03: Full flow - Enable voice → Speak → Get response → Keeps listening', async ({ page, context }, testInfo) => {
    try {
      await context.grantPermissions(['microphone']);
      
      await page.goto('/login');
      await page.fill('[data-testid="input-email"]', TEST_EMAIL);
      await page.fill('[data-testid="input-password"]', TEST_PASSWORD);
      await page.click('[data-testid="button-login"]');
      await page.waitForURL(/\/feed|\/dashboard/);
      
      const mrBlueButton = page.locator('[data-testid="button-mr-blue"]').first();
      if (await mrBlueButton.isVisible()) {
        await mrBlueButton.click();
        await page.waitForTimeout(1000);
      }
      
      const voiceButton = page.locator('[data-testid="button-enable-voice"]');
      await voiceButton.click();
      await page.waitForTimeout(1000);
      
      await page.evaluate(() => {
        const event = new CustomEvent('voice-transcript', {
          detail: { transcript: 'hello how are you' }
        });
        window.dispatchEvent(event);
      });
      
      await page.waitForTimeout(5000);
      
      const chatResponse = page.locator('[data-testid="text-chat-response"]').last();
      await expect(chatResponse).toBeVisible();
      
      const statusIndicator = page.locator('[data-testid="status-voice"]');
      const statusText = await statusIndicator.textContent();
      expect(statusText?.toLowerCase()).toContain('listening');
    } catch (error) {
      await bugReporter.createBugReport(
        SUITE_NAME,
        'Voice flow end-to-end',
        3,
        String(error),
        {
          files: ['client/src/lib/mrBlue/voiceRecognition.ts', 'client/src/components/mrblue/MrBlueChat.tsx'],
          issue: 'Voice mode integration not working end-to-end',
          expectedFix: 'Ensure voice recognition integrates with chat system',
          priority: 'high',
        },
        testInfo
      );
      throw error;
    }
  });

  test('INT-04: Full flow - Type "build a feature" → Autonomous workflow starts', async ({ page }, testInfo) => {
    try {
      await page.goto('/login');
      await page.fill('[data-testid="input-email"]', TEST_EMAIL);
      await page.fill('[data-testid="input-password"]', TEST_PASSWORD);
      await page.click('[data-testid="button-login"]');
      await page.waitForURL(/\/feed|\/dashboard/);
      
      const mrBlueButton = page.locator('[data-testid="button-mr-blue"]').first();
      if (await mrBlueButton.isVisible()) {
        await mrBlueButton.click();
        await page.waitForTimeout(1000);
      }
      
      bugReporter.clearLogs();
      
      const chatInput = page.locator('[data-testid="input-chat"]');
      await chatInput.fill('build a user profile feature');
      await chatInput.press('Enter');
      
      await page.waitForTimeout(3000);
      
      const autonomousRequests = bugReporter.getNetworkLogs().filter(log =>
        log.url.includes('/api/autonomous/execute')
      );
      
      expect(autonomousRequests.length).toBeGreaterThan(0);
      
      const workflowPanel = page.locator('[data-testid="panel-autonomous-workflow"]');
      const isVisible = await workflowPanel.isVisible();
      expect(isVisible).toBeTruthy();
    } catch (error) {
      await bugReporter.createBugReport(
        SUITE_NAME,
        'Autonomous workflow trigger',
        4,
        String(error),
        {
          files: ['client/src/lib/mrBlue/intentClassifier.ts', 'client/src/components/autonomous/AutonomousWorkflowPanel.tsx'],
          issue: 'Autonomous workflow not starting for build commands',
          expectedFix: 'Connect intent routing to autonomous workflow UI',
          priority: 'critical',
        },
        testInfo
      );
      throw error;
    }
  });

  test('INT-05: Conversation history persists across page refresh', async ({ page }, testInfo) => {
    try {
      await page.goto('/login');
      await page.fill('[data-testid="input-email"]', TEST_EMAIL);
      await page.fill('[data-testid="input-password"]', TEST_PASSWORD);
      await page.click('[data-testid="button-login"]');
      await page.waitForURL(/\/feed|\/dashboard/);
      
      const mrBlueButton = page.locator('[data-testid="button-mr-blue"]').first();
      if (await mrBlueButton.isVisible()) {
        await mrBlueButton.click();
        await page.waitForTimeout(1000);
      }
      
      const chatInput = page.locator('[data-testid="input-chat"]');
      await chatInput.fill('remember this: my favorite color is blue');
      await chatInput.press('Enter');
      await page.waitForTimeout(3000);
      
      await page.reload();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      const messages = page.locator('[data-testid*="text-chat"]');
      const count = await messages.count();
      
      expect(count).toBeGreaterThan(0);
    } catch (error) {
      await bugReporter.createBugReport(
        SUITE_NAME,
        'Conversation history persists',
        5,
        String(error),
        {
          files: ['client/src/components/mrblue/MrBlueChat.tsx', 'server/routes/mrblue.ts'],
          issue: 'Chat history not persisting across refreshes',
          expectedFix: 'Store and load chat history from database/localStorage',
          priority: 'high',
        },
        testInfo
      );
      throw error;
    }
  });

  test('INT-06: Multi-tab authentication synchronization', async ({ browser }, testInfo) => {
    try {
      const context = await browser.newContext();
      const page1 = await context.newPage();
      const bugReporter1 = new BugReporter(page1);
      
      await page1.goto('/login');
      await page1.fill('[data-testid="input-email"]', TEST_EMAIL);
      await page1.fill('[data-testid="input-password"]', TEST_PASSWORD);
      await page1.click('[data-testid="button-login"]');
      await page1.waitForURL(/\/feed|\/dashboard/);
      
      const page2 = await context.newPage();
      const bugReporter2 = new BugReporter(page2);
      await page2.goto('/feed');
      
      await expect(page2).toHaveURL(/\/feed/);
      
      await page1.click('[data-testid="button-logout"]');
      await page1.waitForURL(/\/login/);
      
      await page2.waitForTimeout(2000);
      await page2.reload();
      
      await expect(page2).toHaveURL(/\/login/);
      
      await context.close();
    } catch (error) {
      await bugReporter.createBugReport(
        SUITE_NAME,
        'Multi-tab auth sync',
        6,
        String(error),
        {
          files: ['client/src/lib/queryClient.ts', 'client/src/App.tsx'],
          issue: 'Authentication state not synchronized across tabs',
          expectedFix: 'Listen to localStorage events for auth state changes',
          priority: 'medium',
        },
        testInfo
      );
      throw error;
    }
  });

  test('INT-07: WebSocket reconnection maintains chat functionality', async ({ page }, testInfo) => {
    try {
      await page.goto('/login');
      await page.fill('[data-testid="input-email"]', TEST_EMAIL);
      await page.fill('[data-testid="input-password"]', TEST_PASSWORD);
      await page.click('[data-testid="button-login"]');
      await page.waitForURL(/\/feed|\/dashboard/);
      
      await page.waitForTimeout(2000);
      
      await page.evaluate(() => {
        const ws = (window as any).ws;
        if (ws && ws.close) {
          ws.close();
        }
      });
      
      await page.waitForTimeout(5000);
      
      const mrBlueButton = page.locator('[data-testid="button-mr-blue"]').first();
      if (await mrBlueButton.isVisible()) {
        await mrBlueButton.click();
        await page.waitForTimeout(1000);
      }
      
      const chatInput = page.locator('[data-testid="input-chat"]');
      await chatInput.fill('hello after reconnect');
      await chatInput.press('Enter');
      
      await page.waitForTimeout(5000);
      
      const chatResponse = page.locator('[data-testid="text-chat-response"]').last();
      await expect(chatResponse).toBeVisible();
    } catch (error) {
      await bugReporter.createBugReport(
        SUITE_NAME,
        'WebSocket reconnection chat functionality',
        7,
        String(error),
        {
          files: ['client/src/lib/websocket.ts', 'client/src/components/mrblue/MrBlueChat.tsx'],
          issue: 'Chat not working after WebSocket reconnection',
          expectedFix: 'Ensure chat remains functional during/after WS reconnect',
          priority: 'high',
        },
        testInfo
      );
      throw error;
    }
  });

  test('INT-08: Complete user journey - Signup → Login → Chat → Voice → Logout', async ({ page, context }, testInfo) => {
    try {
      await context.grantPermissions(['microphone']);
      
      await page.goto('/login');
      
      const token = await page.evaluate(() => localStorage.getItem('authToken'));
      if (token) {
        await page.click('[data-testid="button-logout"]');
        await page.waitForTimeout(1000);
      }
      
      await page.fill('[data-testid="input-email"]', TEST_EMAIL);
      await page.fill('[data-testid="input-password"]', TEST_PASSWORD);
      await page.click('[data-testid="button-login"]');
      await page.waitForURL(/\/feed|\/dashboard/);
      
      const mrBlueButton = page.locator('[data-testid="button-mr-blue"]').first();
      if (await mrBlueButton.isVisible()) {
        await mrBlueButton.click();
        await page.waitForTimeout(1000);
      }
      
      const chatInput = page.locator('[data-testid="input-chat"]');
      await chatInput.fill('hello from integration test');
      await chatInput.press('Enter');
      await page.waitForTimeout(3000);
      
      const voiceButton = page.locator('[data-testid="button-enable-voice"]');
      if (await voiceButton.isVisible()) {
        await voiceButton.click();
        await page.waitForTimeout(1000);
        
        await page.evaluate(() => {
          const event = new CustomEvent('voice-transcript', {
            detail: { transcript: 'this is a voice test' }
          });
          window.dispatchEvent(event);
        });
        
        await page.waitForTimeout(3000);
      }
      
      await page.click('[data-testid="button-logout"]');
      await expect(page).toHaveURL(/\/login/);
      
      const finalToken = await page.evaluate(() => localStorage.getItem('authToken'));
      expect(finalToken).toBeFalsy();
      
      const allErrors = bugReporter.getConsoleErrors();
      const criticalErrors = allErrors.filter(e => 
        !e.message.includes('coframe') && 
        !e.message.includes('analytics')
      );
      expect(criticalErrors.length).toBe(0);
    } catch (error) {
      await bugReporter.createBugReport(
        SUITE_NAME,
        'Complete user journey',
        8,
        String(error),
        {
          files: ['client/src/App.tsx'],
          issue: 'Full user journey has errors or incomplete flows',
          expectedFix: 'Ensure all features work together in complete workflow',
          priority: 'critical',
        },
        testInfo
      );
      throw error;
    }
  });
});
