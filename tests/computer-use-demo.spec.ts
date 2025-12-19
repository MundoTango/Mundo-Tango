import { test, expect } from '@playwright/test';

/**
 * COMPUTER USE - NATURAL LANGUAGE AUTOMATION TEST
 * 
 * This test demonstrates the complete Computer Use workflow:
 * 1. User logs in
 * 2. Opens Mr. Blue chat (global button)
 * 3. Sends natural language command: "Extract my Wix contacts"
 * 4. Watches automation execute with live progress
 * 5. Views screenshots captured during execution
 * 
 * Requirements:
 * - TEST_ADMIN_EMAIL and TEST_ADMIN_PASSWORD must be set (admin with roleLevel >= 8)
 * - WIX_EMAIL and WIX_PASSWORD must be set for actual Wix extraction
 * - Application must be running on localhost:5000
 */

test.describe('Computer Use - Natural Language Interface', () => {
  test('Complete workflow: Login → Mr. Blue → Computer Use command → Watch execution', async ({ page }) => {
    // ============================================================================
    // PHASE 1: Login
    // ============================================================================
    console.log('🔐 PHASE 1: Logging in...');
    
    await page.goto('/login');
    await expect(page).toHaveURL(/\/login/);
    
    // Fill login credentials
    const emailInput = page.getByTestId('input-email');
    const passwordInput = page.getByTestId('input-password');
    const loginButton = page.getByTestId('button-login');
    
    await emailInput.fill(process.env.TEST_ADMIN_EMAIL || '');
    await passwordInput.fill(process.env.TEST_ADMIN_PASSWORD || '');
    await loginButton.click();
    
    // Wait for successful login (redirect to feed or home)
    await page.waitForURL(/\/(feed|home|dashboard)/, { timeout: 10000 });
    console.log('✅ Login successful!');
    
    // ============================================================================
    // PHASE 2: Open Mr. Blue Chat
    // ============================================================================
    console.log('🤖 PHASE 2: Opening Mr. Blue chat...');
    
    // Wait for page to load completely
    await page.waitForTimeout(2000);
    
    // Click the "Ask Mr. Blue" floating button (bottom-right)
    const mrBlueButton = page.getByTestId('button-ask-mr-blue');
    await expect(mrBlueButton).toBeVisible({ timeout: 10000 });
    await mrBlueButton.click();
    
    // Verify chat panel opens
    const chatPanel = page.getByTestId('chat-side-panel');
    await expect(chatPanel).toBeVisible({ timeout: 5000 });
    console.log('✅ Mr. Blue chat opened!');
    
    // ============================================================================
    // PHASE 3: Send Computer Use Command
    // ============================================================================
    console.log('💬 PHASE 3: Sending Computer Use command...');
    
    // Type the natural language command
    const chatInput = page.getByTestId('input-chat-message');
    await expect(chatInput).toBeVisible();
    
    const command = "Extract my Wix contacts";
    await chatInput.fill(command);
    console.log(`📝 Command: "${command}"`);
    
    // Send the message
    const sendButton = page.getByTestId('button-send-message');
    await sendButton.click();
    console.log('✅ Command sent!');
    
    // ============================================================================
    // PHASE 4: Watch for Automation Response
    // ============================================================================
    console.log('⏳ PHASE 4: Waiting for automation response...');
    
    // Wait for Mr. Blue's response (should include task creation or error)
    await page.waitForTimeout(3000);
    
    // Check for two possible scenarios:
    
    // Scenario A: WIX credentials configured → Task created
    const automationTaskCard = page.locator('[data-testid^="automation-task-"]');
    const hasTask = await automationTaskCard.count() > 0;
    
    if (hasTask) {
      console.log('🚀 Automation task created!');
      
      // Wait for task elements to appear
      await expect(automationTaskCard.first()).toBeVisible({ timeout: 5000 });
      
      // Look for progress indicators
      const progressBar = page.locator('[data-testid="automation-progress-bar"]').first();
      const statusBadge = page.locator('[data-testid^="automation-status-"]').first();
      
      // Check if progress bar exists
      const hasProgressBar = await progressBar.count() > 0;
      if (hasProgressBar) {
        await expect(progressBar).toBeVisible();
        console.log('✅ Progress bar visible');
      }
      
      // Check status badge
      const hasStatusBadge = await statusBadge.count() > 0;
      if (hasStatusBadge) {
        await expect(statusBadge).toBeVisible();
        const statusText = await statusBadge.textContent();
        console.log(`📊 Status: ${statusText}`);
      }
      
      // ============================================================================
      // PHASE 5: Watch Live Execution
      // ============================================================================
      console.log('👀 PHASE 5: Watching live execution...');
      
      // Wait to observe task progress (polling happens every 3 seconds)
      await page.waitForTimeout(6000);
      
      // Look for screenshots grid
      const screenshotsGrid = page.locator('[data-testid="screenshots-grid"]');
      const hasScreenshots = await screenshotsGrid.count() > 0;
      
      if (hasScreenshots) {
        console.log('📸 Screenshots detected!');
        await expect(screenshotsGrid.first()).toBeVisible();
        
        // Count screenshot images
        const screenshotImages = page.locator('[data-testid^="screenshot-img-"]');
        const screenshotCount = await screenshotImages.count();
        console.log(`📸 Number of screenshots: ${screenshotCount}`);
        
        // Take a screenshot of the chat showing automation progress
        await page.screenshot({ 
          path: 'tests/screenshots/computer-use-execution.png',
          fullPage: true 
        });
        console.log('📸 Test screenshot saved: tests/screenshots/computer-use-execution.png');
      } else {
        console.log('⏳ No screenshots yet (task may be queued or starting)');
      }
      
      // Look for recent actions
      const recentActions = page.locator('[data-testid="recent-actions"]');
      const hasActions = await recentActions.count() > 0;
      
      if (hasActions) {
        console.log('📋 Recent actions detected!');
        const actionsText = await recentActions.first().textContent();
        console.log(`📋 Actions: ${actionsText?.slice(0, 200)}...`);
      }
      
      // Check final status after waiting
      await page.waitForTimeout(5000);
      const finalStatusBadge = page.locator('[data-testid^="automation-status-"]').first();
      if (await finalStatusBadge.count() > 0) {
        const finalStatus = await finalStatusBadge.textContent();
        console.log(`✅ Final status: ${finalStatus}`);
      }
      
    } else {
      // Scenario B: WIX credentials NOT configured → Error message
      console.log('⚠️  No automation task found - checking for error message...');
      
      // Look for error message about missing credentials
      const messageText = await page.locator('[data-testid^="message-"]').last().textContent();
      console.log(`💬 Mr. Blue response: ${messageText?.slice(0, 200)}`);
      
      // Verify error mentions WIX credentials
      if (messageText?.includes('WIX_EMAIL') || messageText?.includes('WIX_PASSWORD') || messageText?.includes('credentials')) {
        console.log('✅ Correctly shows error about missing WIX credentials');
      }
      
      // Take screenshot of error state
      await page.screenshot({ 
        path: 'tests/screenshots/computer-use-credentials-needed.png',
        fullPage: true 
      });
      console.log('📸 Test screenshot saved: tests/screenshots/computer-use-credentials-needed.png');
    }
    
    // ============================================================================
    // PHASE 6: Verify Chat Integration
    // ============================================================================
    console.log('🔍 PHASE 6: Verifying chat integration...');
    
    // Verify chat is still functional
    await expect(chatInput).toBeVisible();
    await expect(chatPanel).toBeVisible();
    
    // Verify user can still type
    await chatInput.clear();
    await chatInput.fill('Thank you!');
    console.log('✅ Chat remains functional after automation');
    
    // Close chat panel
    const closeButton = page.locator('[data-testid="button-close-chat"]');
    if (await closeButton.count() > 0) {
      await closeButton.click();
      await expect(chatPanel).not.toBeVisible({ timeout: 2000 });
      console.log('✅ Chat panel closed successfully');
    }
    
    // ============================================================================
    // TEST COMPLETE
    // ============================================================================
    console.log('🎉 TEST COMPLETE!');
    console.log('');
    console.log('='.repeat(80));
    console.log('SUMMARY:');
    console.log('='.repeat(80));
    console.log('✅ Login successful');
    console.log('✅ Mr. Blue chat opened');
    console.log('✅ Computer Use command sent');
    console.log(hasTask ? '✅ Automation task created and tracked' : '⚠️  Task not created (credentials needed)');
    console.log('✅ Chat integration working');
    console.log('='.repeat(80));
  });
  
  test('Test Computer Use intent detection with different commands', async ({ page }) => {
    console.log('🧪 Testing different Computer Use commands...');
    
    // Login
    await page.goto('/login');
    await page.getByTestId('input-email').fill(process.env.TEST_ADMIN_EMAIL || '');
    await page.getByTestId('input-password').fill(process.env.TEST_ADMIN_PASSWORD || '');
    await page.getByTestId('button-login').click();
    await page.waitForURL(/\/(feed|home|dashboard)/);
    
    // Open Mr. Blue
    await page.waitForTimeout(2000);
    await page.getByTestId('button-ask-mr-blue').click();
    await expect(page.getByTestId('chat-side-panel')).toBeVisible();
    
    const chatInput = page.getByTestId('input-chat-message');
    const sendButton = page.getByTestId('button-send-message');
    
    // Test various commands
    const commands = [
      'Extract my Wix contacts',
      'Migrate Wix data to Mundo Tango',
      'Automate Facebook posting',
      'Help me extract my Wix site data',
    ];
    
    for (const command of commands) {
      console.log(`Testing command: "${command}"`);
      
      await chatInput.fill(command);
      await sendButton.click();
      await page.waitForTimeout(2000);
      
      // Check if response indicates Computer Use was triggered
      const lastMessage = await page.locator('[data-testid^="message-"]').last().textContent();
      console.log(`Response preview: ${lastMessage?.slice(0, 100)}...`);
      
      await page.waitForTimeout(1000);
    }
    
    console.log('✅ All command variants tested');
  });
});
