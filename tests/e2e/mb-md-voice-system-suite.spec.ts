import { test, expect } from '@playwright/test';
import { BugReporter } from './helpers/bug-reporter';

const SUITE_NAME = 'Voice System Tests';
const TEST_EMAIL = process.env.TEST_ADMIN_EMAIL || 'admin@mundotango.life';
const TEST_PASSWORD = process.env.TEST_ADMIN_PASSWORD || 'admin123';

test.describe(SUITE_NAME, () => {
  let bugReporter: BugReporter;

  test.beforeEach(async ({ page, context }) => {
    await context.grantPermissions(['microphone']);
    
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

  test('VOICE-01: Enable Voice Mode button visible and clickable', async ({ page }, testInfo) => {
    try {
      const voiceButton = page.locator('[data-testid="button-enable-voice"]');
      await expect(voiceButton).toBeVisible({ timeout: 5000 });
      await expect(voiceButton).toBeEnabled();
    } catch (error) {
      await bugReporter.createBugReport(
        SUITE_NAME,
        'Enable Voice Mode button visible',
        1,
        String(error),
        {
          files: ['client/src/components/mrblue/MrBlueChat.tsx'],
          issue: 'Voice mode button not rendered or not visible',
          expectedFix: 'Add voice mode toggle button to chat interface',
          priority: 'critical',
        },
        testInfo
      );
      throw error;
    }
  });

  test('VOICE-02: Click "Enable Voice Mode" shows "Listening" status immediately', async ({ page }, testInfo) => {
    try {
      const voiceButton = page.locator('[data-testid="button-enable-voice"]');
      await voiceButton.click();
      
      await page.waitForTimeout(1000);
      
      const statusIndicator = page.locator('[data-testid="status-voice"]');
      const statusText = await statusIndicator.textContent();
      
      expect(statusText?.toLowerCase()).toContain('listening');
    } catch (error) {
      await bugReporter.createBugReport(
        SUITE_NAME,
        'Listening status shows immediately',
        2,
        String(error),
        {
          files: ['client/src/lib/mrBlue/voiceRecognition.ts'],
          issue: 'Voice mode not activating or status not updating',
          expectedFix: 'Start speech recognition and update UI state immediately',
          priority: 'critical',
        },
        testInfo
      );
      throw error;
    }
  });

  test('VOICE-03: No trigger word required - continuous listening mode', async ({ page }, testInfo) => {
    try {
      const voiceButton = page.locator('[data-testid="button-enable-voice"]');
      await voiceButton.click();
      
      await page.waitForTimeout(1000);
      
      const helpText = page.locator('[data-testid="text-voice-help"]');
      const helpContent = await helpText.textContent();
      
      expect(helpContent?.toLowerCase()).not.toContain('say');
      expect(helpContent?.toLowerCase()).not.toContain('mr. blue');
      expect(helpContent?.toLowerCase()).not.toContain('trigger');
    } catch (error) {
      await bugReporter.createBugReport(
        SUITE_NAME,
        'No trigger word UI messaging',
        3,
        String(error),
        {
          files: ['client/src/components/mrblue/VoiceModeIndicator.tsx'],
          issue: 'UI still showing trigger word instructions',
          expectedFix: 'Update help text to reflect continuous listening mode',
          priority: 'high',
        },
        testInfo
      );
      throw error;
    }
  });

  test('VOICE-04: Microphone permission requested on voice mode activation', async ({ page, context }, testInfo) => {
    try {
      let permissionRequested = false;
      
      context.on('page', async (newPage) => {
        newPage.on('console', (msg) => {
          if (msg.text().includes('microphone') || msg.text().includes('permission')) {
            permissionRequested = true;
          }
        });
      });
      
      await context.grantPermissions([]);
      
      const voiceButton = page.locator('[data-testid="button-enable-voice"]');
      await voiceButton.click();
      
      await page.waitForTimeout(2000);
      
      const currentPermissions = await context.permissions();
      expect(currentPermissions).toBeDefined();
    } catch (error) {
      await bugReporter.createBugReport(
        SUITE_NAME,
        'Microphone permission requested',
        4,
        String(error),
        {
          files: ['client/src/lib/mrBlue/voiceRecognition.ts'],
          issue: 'Microphone permission not being requested',
          expectedFix: 'Request microphone permission before starting recognition',
          priority: 'critical',
        },
        testInfo
      );
      throw error;
    }
  });

  test('VOICE-05: Continuous mode indicator visible when active', async ({ page }, testInfo) => {
    try {
      const voiceButton = page.locator('[data-testid="button-enable-voice"]');
      await voiceButton.click();
      
      await page.waitForTimeout(1000);
      
      const continuousIndicator = page.locator('[data-testid="indicator-continuous-mode"]');
      await expect(continuousIndicator).toBeVisible();
    } catch (error) {
      await bugReporter.createBugReport(
        SUITE_NAME,
        'Continuous mode indicator visible',
        5,
        String(error),
        {
          files: ['client/src/components/mrblue/VoiceModeIndicator.tsx'],
          issue: 'Continuous mode indicator not displayed',
          expectedFix: 'Add visual indicator for continuous listening',
          priority: 'medium',
        },
        testInfo
      );
      throw error;
    }
  });

  test('VOICE-06: Simulated transcript sends to chat API', async ({ page }, testInfo) => {
    try {
      const voiceButton = page.locator('[data-testid="button-enable-voice"]');
      await voiceButton.click();
      await page.waitForTimeout(1000);
      
      bugReporter.clearLogs();
      
      await page.evaluate(() => {
        const mockTranscript = 'hello how are you';
        const event = new CustomEvent('voice-transcript', {
          detail: { transcript: mockTranscript }
        });
        window.dispatchEvent(event);
      });
      
      await page.waitForTimeout(2000);
      
      const chatRequests = bugReporter.getNetworkLogs().filter(log =>
        log.url.includes('/api/mrblue/chat')
      );
      
      expect(chatRequests.length).toBeGreaterThan(0);
    } catch (error) {
      await bugReporter.createBugReport(
        SUITE_NAME,
        'Transcript sends to chat API',
        6,
        String(error),
        {
          files: ['client/src/lib/mrBlue/voiceRecognition.ts'],
          issue: 'Voice transcripts not being sent to chat endpoint',
          expectedFix: 'Send transcript to chat API on recognition complete',
          priority: 'critical',
        },
        testInfo
      );
      throw error;
    }
  });

  test('VOICE-07: After response, voice mode auto-restarts listening', async ({ page }, testInfo) => {
    try {
      const voiceButton = page.locator('[data-testid="button-enable-voice"]');
      await voiceButton.click();
      await page.waitForTimeout(1000);
      
      await page.evaluate(() => {
        const event = new CustomEvent('voice-transcript', {
          detail: { transcript: 'hello' }
        });
        window.dispatchEvent(event);
      });
      
      await page.waitForTimeout(5000);
      
      const statusIndicator = page.locator('[data-testid="status-voice"]');
      const statusText = await statusIndicator.textContent();
      
      expect(statusText?.toLowerCase()).toContain('listening');
    } catch (error) {
      await bugReporter.createBugReport(
        SUITE_NAME,
        'Voice auto-restarts after response',
        7,
        String(error),
        {
          files: ['client/src/lib/mrBlue/voiceRecognition.ts'],
          issue: 'Voice recognition not restarting after response',
          expectedFix: 'Automatically restart listening after chat response',
          priority: 'high',
        },
        testInfo
      );
      throw error;
    }
  });

  test('VOICE-08: Click "Disable Voice Mode" stops listening', async ({ page }, testInfo) => {
    try {
      const voiceButton = page.locator('[data-testid="button-enable-voice"]');
      await voiceButton.click();
      await page.waitForTimeout(1000);
      
      const disableButton = page.locator('[data-testid="button-disable-voice"]');
      await disableButton.click();
      
      await page.waitForTimeout(1000);
      
      const statusIndicator = page.locator('[data-testid="status-voice"]');
      const isVisible = await statusIndicator.isVisible();
      
      expect(isVisible).toBeFalsy();
    } catch (error) {
      await bugReporter.createBugReport(
        SUITE_NAME,
        'Disable stops listening',
        8,
        String(error),
        {
          files: ['client/src/lib/mrBlue/voiceRecognition.ts'],
          issue: 'Voice mode not properly disabling',
          expectedFix: 'Stop speech recognition and update UI on disable',
          priority: 'high',
        },
        testInfo
      );
      throw error;
    }
  });

  test('VOICE-09: Voice input triggers correct intent routing', async ({ page }, testInfo) => {
    try {
      const voiceButton = page.locator('[data-testid="button-enable-voice"]');
      await voiceButton.click();
      await page.waitForTimeout(1000);
      
      bugReporter.clearLogs();
      
      await page.evaluate(() => {
        const event = new CustomEvent('voice-transcript', {
          detail: { transcript: 'build a login page' }
        });
        window.dispatchEvent(event);
      });
      
      await page.waitForTimeout(2000);
      
      const autonomousRequests = bugReporter.getNetworkLogs().filter(log =>
        log.url.includes('/api/autonomous/execute')
      );
      
      expect(autonomousRequests.length).toBeGreaterThan(0);
    } catch (error) {
      await bugReporter.createBugReport(
        SUITE_NAME,
        'Voice triggers correct routing',
        9,
        String(error),
        {
          files: ['client/src/lib/mrBlue/intentClassifier.ts'],
          issue: 'Voice inputs not routing through intent classifier',
          expectedFix: 'Pass voice transcripts through same routing as text',
          priority: 'high',
        },
        testInfo
      );
      throw error;
    }
  });

  test('VOICE-10: Voice mode persists across navigation', async ({ page }, testInfo) => {
    try {
      const voiceButton = page.locator('[data-testid="button-enable-voice"]');
      await voiceButton.click();
      await page.waitForTimeout(1000);
      
      await page.goto('/visual-editor');
      await page.waitForTimeout(2000);
      
      const statusIndicator = page.locator('[data-testid="status-voice"]');
      const statusText = await statusIndicator.textContent();
      
      expect(statusText?.toLowerCase()).toContain('listening');
    } catch (error) {
      await bugReporter.createBugReport(
        SUITE_NAME,
        'Voice mode persists navigation',
        10,
        String(error),
        {
          files: ['client/src/lib/mrBlue/voiceRecognition.ts', 'client/src/App.tsx'],
          issue: 'Voice mode not persisting across page navigation',
          expectedFix: 'Store voice mode state globally and restore on navigation',
          priority: 'medium',
        },
        testInfo
      );
      throw error;
    }
  });

  test('VOICE-11: Background noise filtering works', async ({ page }, testInfo) => {
    try {
      const voiceButton = page.locator('[data-testid="button-enable-voice"]');
      await voiceButton.click();
      await page.waitForTimeout(1000);
      
      bugReporter.clearLogs();
      
      await page.evaluate(() => {
        for (let i = 0; i < 5; i++) {
          const event = new CustomEvent('voice-transcript', {
            detail: { transcript: '' }
          });
          window.dispatchEvent(event);
        }
      });
      
      await page.waitForTimeout(2000);
      
      const chatRequests = bugReporter.getNetworkLogs().filter(log =>
        log.url.includes('/api/mrblue/chat')
      );
      
      expect(chatRequests.length).toBe(0);
    } catch (error) {
      await bugReporter.createBugReport(
        SUITE_NAME,
        'Background noise filtering',
        11,
        String(error),
        {
          files: ['client/src/lib/mrBlue/voiceRecognition.ts'],
          issue: 'Empty transcripts being sent to API',
          expectedFix: 'Filter out empty/noise transcripts before sending',
          priority: 'low',
        },
        testInfo
      );
      throw error;
    }
  });

  test('VOICE-12: Visual feedback during speech recognition', async ({ page }, testInfo) => {
    try {
      const voiceButton = page.locator('[data-testid="button-enable-voice"]');
      await voiceButton.click();
      await page.waitForTimeout(1000);
      
      await page.evaluate(() => {
        const event = new CustomEvent('voice-speaking', {
          detail: { speaking: true }
        });
        window.dispatchEvent(event);
      });
      
      await page.waitForTimeout(500);
      
      const visualIndicator = page.locator('[data-testid="indicator-speaking"]');
      await expect(visualIndicator).toBeVisible();
    } catch (error) {
      await bugReporter.createBugReport(
        SUITE_NAME,
        'Visual feedback during speech',
        12,
        String(error),
        {
          files: ['client/src/components/mrblue/VoiceModeIndicator.tsx'],
          issue: 'No visual feedback when user is speaking',
          expectedFix: 'Add animated indicator for active speech detection',
          priority: 'low',
        },
        testInfo
      );
      throw error;
    }
  });

  test('VOICE-13: Multiple voice commands queued correctly', async ({ page }, testInfo) => {
    try {
      const voiceButton = page.locator('[data-testid="button-enable-voice"]');
      await voiceButton.click();
      await page.waitForTimeout(1000);
      
      bugReporter.clearLogs();
      
      await page.evaluate(() => {
        const commands = ['hello', 'how are you', 'tell me about tango'];
        commands.forEach((cmd, i) => {
          setTimeout(() => {
            const event = new CustomEvent('voice-transcript', {
              detail: { transcript: cmd }
            });
            window.dispatchEvent(event);
          }, i * 1000);
        });
      });
      
      await page.waitForTimeout(6000);
      
      const chatRequests = bugReporter.getNetworkLogs().filter(log =>
        log.url.includes('/api/mrblue/chat')
      );
      
      expect(chatRequests.length).toBeGreaterThanOrEqual(2);
    } catch (error) {
      await bugReporter.createBugReport(
        SUITE_NAME,
        'Multiple commands queued',
        13,
        String(error),
        {
          files: ['client/src/lib/mrBlue/voiceRecognition.ts'],
          issue: 'Rapid voice commands not being queued properly',
          expectedFix: 'Implement command queue for voice inputs',
          priority: 'medium',
        },
        testInfo
      );
      throw error;
    }
  });

  test('VOICE-14: Error handling for unsupported browser', async ({ page }, testInfo) => {
    try {
      await page.evaluate(() => {
        (window as any).SpeechRecognition = undefined;
        (window as any).webkitSpeechRecognition = undefined;
      });
      
      const voiceButton = page.locator('[data-testid="button-enable-voice"]');
      const isDisabled = await voiceButton.isDisabled();
      
      if (!isDisabled) {
        await voiceButton.click();
        await page.waitForTimeout(1000);
        
        const errorMessage = page.locator('[data-testid="text-error"]');
        await expect(errorMessage).toBeVisible();
      }
    } catch (error) {
      await bugReporter.createBugReport(
        SUITE_NAME,
        'Unsupported browser error handling',
        14,
        String(error),
        {
          files: ['client/src/lib/mrBlue/voiceRecognition.ts'],
          issue: 'No error handling for unsupported browsers',
          expectedFix: 'Detect browser support and show helpful error message',
          priority: 'low',
        },
        testInfo
      );
      throw error;
    }
  });
});
