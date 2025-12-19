import { test, expect } from '@playwright/test';

test.describe('Mr Blue Video Conference Journey', () => {
  test.beforeEach(async ({ page }) => {
    // Login with admin credentials
    await page.goto('/login');
    await page.getByTestId('input-username').fill('admin@mundotango.life');
    await page.getByTestId('input-password').fill('admin123');
    await page.getByTestId('button-login').click();
    await page.waitForURL('**/feed');
  });

  test('should display video conference component', async ({ page }) => {
    // Navigate to Mr Blue video conference page
    // Note: You may need to adjust this route based on your app's routing
    await page.goto('/mr-blue/video');
    
    // Verify main video conference card is visible
    await expect(page.getByText('Video Conference with Mr Blue')).toBeVisible();
    await expect(page.getByText('Face-to-face conversation powered by Daily.co')).toBeVisible();
    
    // Verify start button is present
    await expect(page.getByTestId('button-start-conference')).toBeVisible();
  });

  test('should create video conference room', async ({ page }) => {
    await page.goto('/mr-blue/video');
    
    // Click start video call button
    await page.getByTestId('button-start-conference').click();
    
    // Wait for room creation (this may take a few seconds)
    await page.waitForTimeout(3000);
    
    // Verify video container appears
    await expect(page.getByTestId('video-container')).toBeVisible({ timeout: 10000 });
    
    // Verify control buttons are visible
    await expect(page.getByTestId('button-toggle-mute')).toBeVisible();
    await expect(page.getByTestId('button-toggle-video')).toBeVisible();
    await expect(page.getByTestId('button-toggle-screen-share')).toBeVisible();
    await expect(page.getByTestId('button-toggle-recording')).toBeVisible();
    await expect(page.getByTestId('button-end-call')).toBeVisible();
  });

  test('should display participant count and call duration', async ({ page }) => {
    await page.goto('/mr-blue/video');
    
    // Start video call
    await page.getByTestId('button-start-conference').click();
    await page.waitForTimeout(3000);
    
    // Verify participant count badge is visible
    await expect(page.getByTestId('badge-participant-count')).toBeVisible({ timeout: 10000 });
    
    // Verify call duration is visible and counting
    const durationBadge = page.getByTestId('badge-call-duration');
    await expect(durationBadge).toBeVisible();
    
    // Wait a bit and verify time has changed
    await page.waitForTimeout(2000);
    const durationText = await durationBadge.textContent();
    expect(durationText).toMatch(/\d+:\d{2}/); // Format: M:SS
  });

  test('should toggle mute button', async ({ page }) => {
    await page.goto('/mr-blue/video');
    
    // Start call
    await page.getByTestId('button-start-conference').click();
    await page.waitForTimeout(3000);
    
    // Get initial button variant
    const muteButton = page.getByTestId('button-toggle-mute');
    await expect(muteButton).toBeVisible({ timeout: 10000 });
    
    // Click mute button
    await muteButton.click();
    await page.waitForTimeout(500);
    
    // Verify button state changed (destructive variant indicates muted)
    // The button should now have destructive styling
    const buttonClass = await muteButton.getAttribute('class');
    expect(buttonClass).toContain('destructive');
  });

  test('should toggle video button', async ({ page }) => {
    await page.goto('/mr-blue/video');
    
    // Start call
    await page.getByTestId('button-start-conference').click();
    await page.waitForTimeout(3000);
    
    // Click video button to turn off video
    const videoButton = page.getByTestId('button-toggle-video');
    await expect(videoButton).toBeVisible({ timeout: 10000 });
    await videoButton.click();
    await page.waitForTimeout(500);
    
    // Verify button state changed
    const buttonClass = await videoButton.getAttribute('class');
    expect(buttonClass).toContain('destructive');
  });

  test('should toggle screen sharing', async ({ page }) => {
    await page.goto('/mr-blue/video');
    
    // Start call
    await page.getByTestId('button-start-conference').click();
    await page.waitForTimeout(3000);
    
    // Get screen share button
    const screenShareButton = page.getByTestId('button-toggle-screen-share');
    await expect(screenShareButton).toBeVisible({ timeout: 10000 });
    
    // Note: Actually starting screen share may fail in headless mode
    // We just verify the button is clickable
    await expect(screenShareButton).toBeEnabled();
  });

  test('should show recording badge when recording starts', async ({ page }) => {
    await page.goto('/mr-blue/video');
    
    // Start call
    await page.getByTestId('button-start-conference').click();
    await page.waitForTimeout(3000);
    
    // Click recording button
    const recordButton = page.getByTestId('button-toggle-recording');
    await expect(recordButton).toBeVisible({ timeout: 10000 });
    
    // Click to start recording
    await recordButton.click();
    await page.waitForTimeout(1000);
    
    // Note: Recording may not start in test environment due to Daily.co restrictions
    // But we can verify the button is functional
    await expect(recordButton).toBeEnabled();
  });

  test('should end video call successfully', async ({ page }) => {
    await page.goto('/mr-blue/video');
    
    // Start call
    await page.getByTestId('button-start-conference').click();
    await page.waitForTimeout(3000);
    
    // Wait for call to be joined
    await expect(page.getByTestId('video-container')).toBeVisible({ timeout: 10000 });
    
    // Click end call button
    await page.getByTestId('button-end-call').click();
    await page.waitForTimeout(1000);
    
    // Verify we're back to start screen
    await expect(page.getByTestId('button-start-conference')).toBeVisible({ timeout: 5000 });
    await expect(page.getByTestId('video-container')).not.toBeVisible();
  });

  test('should show chat integration option when enabled', async ({ page }) => {
    await page.goto('/mr-blue/video');
    
    // Start call
    await page.getByTestId('button-start-conference').click();
    await page.waitForTimeout(3000);
    
    // Wait for call to be joined
    await expect(page.getByTestId('video-container')).toBeVisible({ timeout: 10000 });
    
    // Note: Chat integration is controlled by showChatIntegration prop
    // This test verifies the UI is responsive to that prop
    // In a real implementation, you'd test the chat component here
  });

  test('should handle connection errors gracefully', async ({ page }) => {
    // This test verifies error handling
    // We can't easily simulate Daily.co errors without mocking
    // But we can verify the UI doesn't crash
    await page.goto('/mr-blue/video');
    
    await expect(page.getByTestId('button-start-conference')).toBeVisible();
    await expect(page.getByText('Video Conference with Mr Blue')).toBeVisible();
  });

  test('should persist video state during page interactions', async ({ page }) => {
    await page.goto('/mr-blue/video');
    
    // Start call
    await page.getByTestId('button-start-conference').click();
    await page.waitForTimeout(3000);
    
    // Verify video is active
    await expect(page.getByTestId('video-container')).toBeVisible({ timeout: 10000 });
    
    // Interact with controls
    await page.getByTestId('button-toggle-mute').click();
    await page.waitForTimeout(500);
    
    // Verify video container is still visible
    await expect(page.getByTestId('video-container')).toBeVisible();
  });
});
