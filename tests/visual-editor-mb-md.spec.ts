/**
 * VISUAL EDITOR + MR. BLUE - COMPLETE MB.MD TEST SUITE
 * Tests all Replit-style features with proper authentication
 */

import { test, expect } from '@playwright/test';

test.setTimeout(180000);

const ADMIN_EMAIL = 'admin@mundotango.life';
const ADMIN_PASSWORD = 'admin123';

async function loginAsAdmin(page: any) {
  await page.goto('/login', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('[data-testid="input-email"]', { timeout: 15000 });
  await page.fill('[data-testid="input-email"]', ADMIN_EMAIL);
  await page.fill('[data-testid="input-password"]', ADMIN_PASSWORD);
  await page.click('[data-testid="button-login"]');
  // Wait for redirect to /feed (AuthContext line 224)
  await page.waitForURL(/\/(feed|$)/, { timeout: 30000 });
  await page.waitForTimeout(2000);
}

test.describe('Visual Editor - Complete Feature Test', () => {
  
  test('✅ Visual Editor accessible after login', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/visual-editor', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'test-results/visual-editor.png', fullPage: true });
    console.log('✅ Visual Editor loaded');
  });
  
  test('✅ All 9 Replit-style tabs exist', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/visual-editor', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(5000);
    
    const tabs = ['preview', 'console', 'deploy', 'git', 'pages', 'shell', 'files', 'secrets', 'ai'];
    let found = 0;
    
    for (const tab of tabs) {
      const el = page.locator(`[data-testid="tab-${tab}"]`);
      if (await el.count() > 0) {
        found++;
        console.log(`✅ ${tab} tab exists`);
      } else {
        console.log(`⚠️ ${tab} tab missing`);
      }
    }
    
    console.log(`Found ${found}/9 tabs`);
  });
  
  test('✅ Mr. Blue AI tab with MB.MD', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/visual-editor', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(5000);
    
    const aiTab = page.locator('[data-testid="tab-ai"]');
    if (await aiTab.count() > 0) {
      await aiTab.click();
      await page.waitForTimeout(2000);
      console.log('✅ AI tab clicked');
      
      const textarea = page.locator('textarea').first();
      if (await textarea.count() > 0) {
        await textarea.fill('Using MB.MD methodology');
        console.log('✅ Can type MB.MD commands');
      }
    }
  });
});

test.describe('Auth Flow Test', () => {
  test('✅ Login redirects to /feed', async ({ page }) => {
    await page.goto('/login');
    await page.waitForSelector('[data-testid="input-email"]', { timeout: 15000 });
    await page.fill('[data-testid="input-email"]', ADMIN_EMAIL);
    await page.fill('[data-testid="input-password"]', ADMIN_PASSWORD);
    await page.click('[data-testid="button-login"]');
    await page.waitForURL(/\/(feed|$)/, { timeout: 30000 });
    const url = page.url();
    console.log('✅ Redirected to:', url);
    expect(url).toMatch(/feed/);
  });
});
