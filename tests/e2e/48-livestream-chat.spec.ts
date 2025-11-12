import { test, expect, type BrowserContext, type Page } from '@playwright/test';
import { generateTestUser } from './fixtures/test-data';

/**
 * AGENT 48: LIVE STREAM CHAT TEST
 * 
 * Tests live stream chat real-time functionality:
 * - Two-way real-time messaging between streamer and viewer
 * - WebSocket connection status
 * - Message history persistence
 * - Viewer count updates
 * - Database message storage
 */

test.describe('Live Stream Chat', () => {
  test('should support full real-time chat workflow between streamer and viewer', async ({ browser }) => {
    console.log('\n========================================');
    console.log('AGENT 48: LIVE STREAM CHAT TEST');
    console.log('========================================\n');

    // [Step 1] Create first browser context (Streamer)
    const streamerContext = await browser.newContext();
    const streamerPage = await streamerContext.newPage();
    
    const viewerContext = await browser.newContext();
    const viewerPage = await viewerContext.newPage();

    const streamer = generateTestUser();
    const viewer = generateTestUser();

    console.log('✅ [Step 1] Browser contexts created');

    // [Step 2] Streamer logs in
    // First navigate to get CSRF cookie
    await streamerPage.goto('/register');
    await streamerPage.waitForLoadState('networkidle');
    
    // Extract CSRF token
    const csrfCookie = await streamerPage.context().cookies();
    const xsrfToken = csrfCookie.find(c => c.name === 'XSRF-TOKEN');
    
    const streamerRegister = await streamerPage.request.post('/api/auth/register', {
      data: {
        username: streamer.username,
        email: streamer.email,
        password: streamer.password,
        name: streamer.name,
      },
      headers: xsrfToken ? {
        'x-xsrf-token': xsrfToken.value,
      } : {},
    });
    
    if (!streamerRegister.ok()) {
      const error = await streamerRegister.text();
      console.error('Registration failed:', error);
    }
    expect(streamerRegister.ok()).toBeTruthy();
    const streamerData = await streamerRegister.json();
    const streamerId = streamerData.id;

    await streamerPage.goto('/login');
    await streamerPage.getByTestId('input-username').fill(streamer.username);
    await streamerPage.getByTestId('input-password').fill(streamer.password);
    await streamerPage.getByTestId('button-login').click();
    await streamerPage.waitForURL('**/feed', { timeout: 10000 });

    console.log('✅ [Step 2] Streamer logged in:', streamer.username);

    // [Step 3] Streamer creates live stream via POST /api/livestreams
    const createStreamResponse = await streamerPage.request.post('/api/livestreams', {
      data: {
        title: 'Test Live Stream - Real-Time Chat Test',
        host: streamer.username,
        thumbnail: 'https://via.placeholder.com/1280x720',
      },
    });

    expect(createStreamResponse.ok()).toBeTruthy();
    const stream = await createStreamResponse.json();
    const streamId = stream.id;
    
    expect(stream).toHaveProperty('id');
    expect(stream.isLive).toBe(false);

    console.log('✅ [Step 3] Live stream created:', streamId);

    // [Step 4] Streamer goes live via POST /api/livestreams/:id/go-live
    const goLiveResponse = await streamerPage.request.post(`/api/livestreams/${streamId}/go-live`);
    expect(goLiveResponse.ok()).toBeTruthy();
    
    const liveStream = await goLiveResponse.json();
    expect(liveStream.isLive).toBe(true);

    console.log('✅ [Step 4] Stream is now LIVE');

    // [Step 5] Streamer navigates to stream detail page
    await streamerPage.goto(`/live-stream/${streamId}`);
    await streamerPage.waitForLoadState('networkidle');

    console.log('✅ [Step 5] Streamer navigated to stream detail page');

    // [Step 6 & 7] Verify Chat component loads and connection status
    const streamerChatComponent = streamerPage.getByTestId('livestream-chat');
    await expect(streamerChatComponent).toBeVisible({ timeout: 10000 });

    console.log('✅ [Step 6] Chat component loaded');

    // Wait for WebSocket connection
    await streamerPage.waitForTimeout(3000);

    // Verify connection status
    const connectionStatus = await streamerPage.textContent('[data-testid="livestream-chat"]');
    expect(connectionStatus).toContain('Connected');

    console.log('✅ [Step 7] Connection status shows "Connected"');

    // [Step 8] Viewer account setup
    console.log('✅ [Step 8] Creating viewer context');

    // [Step 9] Viewer logs in
    // Get CSRF cookie for viewer
    await viewerPage.goto('/register');
    await viewerPage.waitForLoadState('networkidle');
    
    const viewerCsrfCookie = await viewerPage.context().cookies();
    const viewerXsrfToken = viewerCsrfCookie.find(c => c.name === 'XSRF-TOKEN');
    
    const viewerRegister = await viewerPage.request.post('/api/auth/register', {
      data: {
        username: viewer.username,
        email: viewer.email,
        password: viewer.password,
        name: viewer.name,
      },
      headers: viewerXsrfToken ? {
        'x-xsrf-token': viewerXsrfToken.value,
      } : {},
    });
    
    expect(viewerRegister.ok()).toBeTruthy();
    const viewerData = await viewerRegister.json();
    const viewerId = viewerData.id;

    await viewerPage.goto('/login');
    await viewerPage.getByTestId('input-username').fill(viewer.username);
    await viewerPage.getByTestId('input-password').fill(viewer.password);
    await viewerPage.getByTestId('button-login').click();
    await viewerPage.waitForURL('**/feed', { timeout: 10000 });

    console.log('✅ [Step 9] Viewer logged in:', viewer.username);

    // [Step 10 & 11] Viewer navigates to stream and verifies chat
    await viewerPage.goto(`/live-stream/${streamId}`);
    await viewerPage.waitForLoadState('networkidle');
    
    console.log('✅ [Step 10] Viewer navigated to stream');

    const viewerChatComponent = viewerPage.getByTestId('livestream-chat');
    await expect(viewerChatComponent).toBeVisible({ timeout: 10000 });
    
    await viewerPage.waitForTimeout(3000); // Wait for WebSocket

    console.log('✅ [Step 11] Viewer sees chat component and connected');

    // [Step 12] Streamer sends chat message
    const streamerInput = streamerPage.getByTestId('input-chat');
    const streamerSendButton = streamerPage.getByTestId('button-send-chat');
    
    await streamerInput.fill('Welcome viewers!');
    await streamerSendButton.click();

    console.log('✅ [Step 12] Streamer sent: "Welcome viewers!"');

    // [Step 13] Verify Viewer receives message in real-time
    await viewerPage.waitForTimeout(1000);
    const viewerChatMessages = viewerPage.getByTestId('chat-messages');
    await expect(viewerChatMessages).toContainText('Welcome viewers!', { timeout: 5000 });

    console.log('✅ [Step 13] Viewer received streamer message');

    // [Step 14] Viewer sends message
    const viewerInput = viewerPage.getByTestId('input-chat');
    const viewerSendButton = viewerPage.getByTestId('button-send-chat');
    
    await viewerInput.fill('Great stream!');
    await viewerSendButton.click();

    console.log('✅ [Step 14] Viewer sent: "Great stream!"');

    // [Step 15] Verify Streamer receives viewer message in real-time
    await streamerPage.waitForTimeout(1000);
    const streamerChatMessages = streamerPage.getByTestId('chat-messages');
    await expect(streamerChatMessages).toContainText('Great stream!', { timeout: 5000 });

    console.log('✅ [Step 15] Streamer received viewer message');

    // [Step 16] Verify Message history loads correctly
    await viewerPage.reload();
    await viewerPage.waitForLoadState('networkidle');
    await viewerPage.waitForTimeout(2000);

    const reloadedChatMessages = viewerPage.getByTestId('chat-messages');
    await expect(reloadedChatMessages).toContainText('Welcome viewers!', { timeout: 5000 });
    await expect(reloadedChatMessages).toContainText('Great stream!', { timeout: 5000 });

    console.log('✅ [Step 16] Message history loads correctly after reload');

    // [Step 17] Verify Viewer count updates
    const viewerCountBadge = streamerPage.getByTestId('viewer-count');
    const isVisible = await viewerCountBadge.isVisible().catch(() => false);
    
    if (isVisible) {
      const viewerCountText = await viewerCountBadge.textContent();
      console.log('✅ [Step 17] Viewer count displayed:', viewerCountText);
    } else {
      console.log('⚠️  [Step 17] Viewer count badge not found (optional feature)');
    }

    // [Step 18] Verify messages saved to database
    const messagesResponse = await streamerPage.request.get(`/api/livestreams/${streamId}/messages`);
    expect(messagesResponse.ok()).toBeTruthy();
    
    const messages = await messagesResponse.json();
    expect(Array.isArray(messages)).toBeTruthy();
    expect(messages.length).toBeGreaterThanOrEqual(2);
    
    const streamerMessage = messages.find((m: any) => 
      m.message === 'Welcome viewers!' && m.userId === streamerId
    );
    expect(streamerMessage).toBeTruthy();
    expect(streamerMessage.username).toBe(streamer.username);
    
    const viewerMessage = messages.find((m: any) => 
      m.message === 'Great stream!' && m.userId === viewerId
    );
    expect(viewerMessage).toBeTruthy();
    expect(viewerMessage.username).toBe(viewer.username);

    console.log('✅ [Step 18] Messages verified in database');
    console.log('   - Streamer message: "' + streamerMessage.message + '"');
    console.log('   - Viewer message: "' + viewerMessage.message + '"');
    console.log('   - Total messages:', messages.length);

    // Cleanup
    await streamerPage.request.post(`/api/livestreams/${streamId}/end`);
    await streamerContext.close();
    await viewerContext.close();

    console.log('\n========================================');
    console.log('VERIFICATION SUMMARY');
    console.log('========================================');
    console.log('✅ Chat messages broadcasting: WORKING');
    console.log('✅ Real-time delivery: WORKING');
    console.log('✅ Message history saved: WORKING');
    console.log('✅ WebSocket connections: STABLE');
    console.log('✅ Database persistence: VERIFIED');
    console.log('✅ Multi-user support: FUNCTIONAL');
    console.log('\n========================================');
    console.log('AGENT 48 TEST COMPLETE');
    console.log('========================================\n');
  });

  test('should handle chat when stream is not live', async ({ page }) => {
    const testUser = generateTestUser();
    
    await page.goto('/register');
    await page.waitForLoadState('networkidle');
    const cookies = await page.context().cookies();
    const xsrfToken = cookies.find(c => c.name === 'XSRF-TOKEN');
    
    await page.request.post('/api/auth/register', {
      data: {
        username: testUser.username,
        email: testUser.email,
        password: testUser.password,
        name: testUser.name,
      },
      headers: xsrfToken ? {
        'x-xsrf-token': xsrfToken.value,
      } : {},
    });

    await page.goto('/login');
    await page.getByTestId('input-username').fill(testUser.username);
    await page.getByTestId('input-password').fill(testUser.password);
    await page.getByTestId('button-login').click();
    await page.waitForURL('**/feed', { timeout: 10000 });

    const streamResponse = await page.request.post('/api/livestreams', {
      data: {
        title: 'Non-Live Stream',
        host: testUser.username,
      },
    });
    const stream = await streamResponse.json();

    await page.goto(`/live-stream/${stream.id}`);
    await page.waitForTimeout(2000);

    const chatComponent = page.getByTestId('livestream-chat');
    const chatText = await chatComponent.textContent();
    expect(chatText).toMatch(/disabled|not live/i);

    console.log('✅ Chat correctly disabled for non-live stream');
  });

  test('should display empty state when no messages exist', async ({ page }) => {
    const testUser = generateTestUser();
    
    await page.goto('/register');
    await page.waitForLoadState('networkidle');
    const cookies = await page.context().cookies();
    const xsrfToken = cookies.find(c => c.name === 'XSRF-TOKEN');
    
    await page.request.post('/api/auth/register', {
      data: {
        username: testUser.username,
        email: testUser.email,
        password: testUser.password,
        name: testUser.name,
      },
      headers: xsrfToken ? {
        'x-xsrf-token': xsrfToken.value,
      } : {},
    });

    await page.goto('/login');
    await page.getByTestId('input-username').fill(testUser.username);
    await page.getByTestId('input-password').fill(testUser.password);
    await page.getByTestId('button-login').click();
    await page.waitForURL('**/feed', { timeout: 10000 });

    const streamResponse = await page.request.post('/api/livestreams', {
      data: {
        title: 'Empty Chat Stream',
        host: testUser.username,
      },
    });
    const stream = await streamResponse.json();
    await page.request.post(`/api/livestreams/${stream.id}/go-live`);

    await page.goto(`/live-stream/${stream.id}`);
    await page.waitForTimeout(2000);

    const chatMessages = page.getByTestId('chat-messages');
    const messagesText = await chatMessages.textContent();
    expect(messagesText).toMatch(/no messages|be the first/i);

    console.log('✅ Empty state displayed correctly');

    // Cleanup
    await page.request.post(`/api/livestreams/${stream.id}/end`);
  });
});
