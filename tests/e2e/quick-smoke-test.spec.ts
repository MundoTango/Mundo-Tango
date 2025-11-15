import { test, expect } from '@playwright/test';

test.use({
  video: 'on',
  screenshot: 'on',
});

test.describe('Quick Smoke Test - Discover Critical Bugs', () => {
  test('Bug Discovery: Login + WebSocket + Chat Routing', async ({ page }) => {
    const bugs: Array<{bug: string, files: string[], priority: string}> = [];
    
    // Test 1: Login works
    console.log('\n🧪 TEST 1: Login Authentication');
    try {
      await page.goto('http://localhost:5000/login');
      await page.fill('[data-testid="input-email"]', process.env.TEST_ADMIN_EMAIL || 'admin@mundotango.life');
      await page.fill('[data-testid="input-password"]', process.env.TEST_ADMIN_PASSWORD || 'admin123');
      await page.click('[data-testid="button-login"]');
      
      // Wait for redirect
      await page.waitForURL(/.*\/(?!login)/, { timeout: 10000 });
      console.log('✅ TEST 1 PASSED: Login works');
    } catch (error) {
      console.log(`❌ TEST 1 FAILED: ${error.message}`);
      bugs.push({
        bug: 'Login fails - form submission or redirect broken',
        files: ['server/routes/auth.ts', 'client/src/pages/LoginPage.tsx'],
        priority: 'CRITICAL'
      });
    }

    // Test 2: WebSocket connects without errors
    console.log('\n🧪 TEST 2: WebSocket Connection');
    const wsErrors: string[] = [];
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('[WS] WebSocket error') || text.includes('[WS] Disconnected')) {
        wsErrors.push(text);
      }
    });
    
    await page.waitForTimeout(3000); // Let WS connect
    
    if (wsErrors.length > 0) {
      console.log(`❌ TEST 2 FAILED: ${wsErrors.length} WebSocket errors detected`);
      console.log('Errors:', wsErrors);
      bugs.push({
        bug: 'WebSocket connection errors - disconnects immediately after connecting',
        files: ['client/src/hooks/useWebSocket.ts', 'server/index.ts'],
        priority: 'CRITICAL'
      });
    } else {
      console.log('✅ TEST 2 PASSED: WebSocket stable');
    }

    // Test 3: Navigate to Visual Editor
    console.log('\n🧪 TEST 3: Visual Editor Page Load');
    try {
      await page.goto('http://localhost:5000/admin/visual-editor');
      await page.waitForSelector('[data-testid="input-chat"]', { timeout: 10000 });
      console.log('✅ TEST 3 PASSED: Visual Editor loads');
    } catch (error) {
      console.log(`❌ TEST 3 FAILED: ${error.message}`);
      bugs.push({
        bug: 'Visual Editor page fails to load or chat input missing',
        files: ['client/src/pages/VisualEditorPage.tsx'],
        priority: 'HIGH'
      });
    }

    // Test 4: Chat routing - simple message
    console.log('\n🧪 TEST 4: Chat Routing - Simple Message');
    try {
      let chatApiCalled = false;
      let autonomousApiCalled = false;
      
      page.on('request', req => {
        if (req.url().includes('/api/mrblue/chat')) chatApiCalled = true;
        if (req.url().includes('/api/autonomous/execute')) autonomousApiCalled = true;
      });
      
      await page.fill('[data-testid="input-chat"]', 'hello');
      await page.click('[data-testid="button-send"]');
      await page.waitForTimeout(2000);
      
      if (!chatApiCalled) {
        console.log('❌ TEST 4 FAILED: Did not route to /api/mrblue/chat');
        bugs.push({
          bug: 'Chat routing broken - "hello" should route to /api/mrblue/chat',
          files: ['client/src/pages/VisualEditorPage.tsx', 'client/src/components/visual-editor/MrBlueVisualChat.tsx'],
          priority: 'HIGH'
        });
      } else {
        console.log('✅ TEST 4 PASSED: Routed to chat API');
      }
    } catch (error) {
      console.log(`❌ TEST 4 FAILED: ${error.message}`);
      bugs.push({
        bug: 'Chat submission fails completely',
        files: ['client/src/pages/VisualEditorPage.tsx'],
        priority: 'CRITICAL'
      });
    }

    // Test 5: Voice mode button exists
    console.log('\n🧪 TEST 5: Voice Mode UI');
    try {
      const voiceButton = await page.locator('[data-testid="button-enable-voice"]');
      const exists = await voiceButton.count() > 0;
      
      if (!exists) {
        console.log('❌ TEST 5 FAILED: Voice mode button missing');
        bugs.push({
          bug: 'Voice mode button not found in Visual Editor',
          files: ['client/src/pages/VisualEditorPage.tsx', 'client/src/components/visual-editor/MrBlueVisualChat.tsx'],
          priority: 'HIGH'
        });
      } else {
        console.log('✅ TEST 5 PASSED: Voice button exists');
      }
    } catch (error) {
      console.log(`❌ TEST 5 FAILED: ${error.message}`);
    }

    // Report all discovered bugs
    console.log('\n\n📊 BUG DISCOVERY SUMMARY');
    console.log('='.repeat(60));
    if (bugs.length === 0) {
      console.log('🎉 NO BUGS FOUND - All smoke tests passed!');
    } else {
      console.log(`🐛 FOUND ${bugs.length} BUGS:\n`);
      bugs.forEach((bug, i) => {
        console.log(`${i+1}. [${bug.priority}] ${bug.bug}`);
        console.log(`   Files: ${bug.files.join(', ')}\n`);
      });
      
      // Save bug report
      const report = {
        timestamp: new Date().toISOString(),
        totalBugs: bugs.length,
        bugs: bugs,
        nextSteps: 'Deploy parallel fix subagents for each bug'
      };
      
      // This will fail the test so we know there are bugs
      expect(bugs.length).toBe(0);
    }
  });
});
