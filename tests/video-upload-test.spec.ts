import { test, expect } from '@playwright/test';

test.describe('Video Upload Debug', () => {
  test('should track upload progress and show errors', async ({ page }) => {
    // Listen to console for our debug logs
    const logs: string[] = [];
    page.on('console', msg => {
      if (msg.text().includes('[PostCreator]')) {
        logs.push(msg.text());
        console.log('BROWSER:', msg.text());
      }
    });

    // Login first
    await page.goto('/auth');
    await page.fill('[data-testid="input-email"]', 'admin@example.com');
    await page.fill('[data-testid="input-password"]', 'admin123');
    await page.click('[data-testid="button-submit"]');
    
    // Wait for feed to load
    await page.waitForURL(/feed|home/, { timeout: 10000 });
    
    // Create a small test video file (10KB)
    const smallVideoBuffer = Buffer.alloc(10 * 1024).fill(0);
    
    // Find the file input and upload
    const fileInput = page.locator('input[type="file"][accept*="video"]').first();
    
    if (await fileInput.count() > 0) {
      await fileInput.setInputFiles({
        name: 'test-video.mp4',
        mimeType: 'video/mp4',
        buffer: smallVideoBuffer,
      });
      
      // Wait and check logs
      await page.waitForTimeout(3000);
      
      // Try to submit
      const postButton = page.locator('[data-testid*="post"], button:has-text("Post")').first();
      if (await postButton.isEnabled()) {
        await postButton.click();
        
        // Wait for upload
        await page.waitForTimeout(5000);
      }
      
      console.log('\n=== CAPTURED LOGS ===');
      logs.forEach(log => console.log(log));
    }
  });
});
