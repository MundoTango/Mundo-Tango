import { test, expect } from '@playwright/test';
import fs from 'fs';

test.describe('Photo Upload Dialog Debug', () => {
  test('observe profile photo upload behavior', async ({ page }) => {
    // Set a longer timeout
    test.setTimeout(60000);
    
    // Navigate to profile page
    await page.goto('/profile/15', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    
    // Take initial screenshot
    await page.screenshot({ path: 'test-results/01-profile-page.png', fullPage: true });
    console.log('Screenshot 1: Profile page');
    
    // Find and click the profile photo edit button
    const profilePhotoButton = page.locator('[data-testid="button-change-profile-photo"]');
    
    // Wait for button with longer timeout
    try {
      await expect(profilePhotoButton).toBeVisible({ timeout: 15000 });
    } catch (e) {
      // Try alternative selector
      console.log('Primary button not found, trying alternative...');
      await page.screenshot({ path: 'test-results/01b-looking-for-button.png', fullPage: true });
      throw e;
    }
    
    await profilePhotoButton.click();
    await page.waitForTimeout(1000);
    
    // Wait for dialog
    await page.waitForSelector('[role="dialog"]', { timeout: 10000 });
    await page.screenshot({ path: 'test-results/02-dialog-opened.png' });
    console.log('Screenshot 2: Dialog opened');
    
    // Create test image in browser and get as buffer
    const base64Image = await page.evaluate(() => {
      const canvas = document.createElement('canvas');
      canvas.width = 800;
      canvas.height = 600;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Gradient background
        const gradient = ctx.createLinearGradient(0, 0, 800, 600);
        gradient.addColorStop(0, '#ff6b6b');
        gradient.addColorStop(0.5, '#4ecdc4');
        gradient.addColorStop(1, '#45b7d1');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 800, 600);
        
        // Face circle
        ctx.beginPath();
        ctx.arc(400, 300, 150, 0, Math.PI * 2);
        ctx.fillStyle = '#ffeaa7';
        ctx.fill();
        
        // Eyes
        ctx.beginPath();
        ctx.arc(350, 270, 20, 0, Math.PI * 2);
        ctx.fillStyle = '#2d3436';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(450, 270, 20, 0, Math.PI * 2);
        ctx.fill();
      }
      return canvas.toDataURL('image/png').split(',')[1];
    });
    
    // Save test image
    fs.mkdirSync('test-results', { recursive: true });
    fs.writeFileSync('test-results/test-upload-image.png', Buffer.from(base64Image, 'base64'));
    
    // Upload the file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('test-results/test-upload-image.png');
    await page.waitForTimeout(2000);
    
    await page.screenshot({ path: 'test-results/03-image-loaded.png' });
    console.log('Screenshot 3: Image loaded in dialog');
    
    // Analyze DOM
    const analysis = await page.evaluate(() => {
      const img = document.querySelector('[role="dialog"] img[alt="Preview"]') as HTMLImageElement;
      const container = img?.parentElement;
      
      if (!img || !container) {
        return { error: 'Elements not found', imgFound: !!img, containerFound: !!container };
      }
      
      const imgStyles = window.getComputedStyle(img);
      const containerStyles = window.getComputedStyle(container);
      
      return {
        image: {
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
          displayWidth: img.offsetWidth,
          displayHeight: img.offsetHeight,
          className: img.className,
          inlineStyle: img.getAttribute('style'),
          computed: {
            width: imgStyles.width,
            height: imgStyles.height,
            transform: imgStyles.transform,
            transformOrigin: imgStyles.transformOrigin,
            position: imgStyles.position,
            top: imgStyles.top,
            left: imgStyles.left
          }
        },
        container: {
          className: container.className,
          inlineStyle: container.getAttribute('style'),
          offsetWidth: container.offsetWidth,
          offsetHeight: container.offsetHeight,
          computed: {
            width: containerStyles.width,
            height: containerStyles.height,
            overflow: containerStyles.overflow,
            borderRadius: containerStyles.borderRadius
          }
        }
      };
    });
    
    console.log('=== DOM ANALYSIS ===');
    console.log(JSON.stringify(analysis, null, 2));
    fs.writeFileSync('test-results/04-dom-analysis.json', JSON.stringify(analysis, null, 2));
    
    // Check for any CSS that might be affecting the image
    const globalStyles = await page.evaluate(() => {
      const sheets = Array.from(document.styleSheets);
      const relevantRules: string[] = [];
      
      for (const sheet of sheets) {
        try {
          const rules = Array.from(sheet.cssRules || []);
          for (const rule of rules) {
            const text = rule.cssText || '';
            // Look for rules that might affect images
            if (text.includes('img') || 
                text.includes('object-fit') || 
                text.includes('aspect-ratio') ||
                text.includes('.absolute')) {
              relevantRules.push(text.substring(0, 200));
            }
          }
        } catch (e) {
          // Cross-origin stylesheet, skip
        }
      }
      return relevantRules.slice(0, 20);
    });
    
    console.log('=== RELEVANT CSS RULES ===');
    console.log(JSON.stringify(globalStyles, null, 2));
    fs.writeFileSync('test-results/05-css-rules.json', JSON.stringify(globalStyles, null, 2));
    
    expect(analysis.error).toBeUndefined();
  });
});
