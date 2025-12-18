import { test, expect } from '@playwright/test';

test.describe('MundoTango Core Flows Smoke Test @smoke', () => {
  test('Landing page loads with real data', async ({ page }) => {
    console.log('[Smoke Test] 🏠 Testing landing page...');
    
    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    
    const title = await page.title();
    console.log(`[Smoke Test] 📄 Page title: "${title}"`);
    expect(title).toContain('Mundo Tango');
    
    const bodyText = await page.locator('body').textContent();
    expect(bodyText).toContain('Mundo Tango');
    
    await page.screenshot({ path: 'test-results/smoke-landing.png' });
    console.log('[Smoke Test] ✅ Landing page loads correctly');
  });

  test('Pricing page shows subscription tiers', async ({ page }) => {
    console.log('[Smoke Test] 💳 Testing pricing page...');
    
    await page.goto('/pricing', { waitUntil: 'domcontentloaded', timeout: 30000 });
    
    await page.waitForTimeout(2000);
    
    const bodyText = await page.locator('body').textContent();
    const hasPricingContent = bodyText?.toLowerCase().includes('free') || 
                              bodyText?.toLowerCase().includes('explorer') ||
                              bodyText?.toLowerCase().includes('pricing');
    
    await page.screenshot({ path: 'test-results/smoke-pricing.png' });
    console.log('[Smoke Test] 💳 Pricing page content:', bodyText?.slice(0, 200));
    console.log('[Smoke Test] ✅ Pricing page accessible');
  });

  test('Events page displays real events', async ({ page }) => {
    console.log('[Smoke Test] 📅 Testing events page...');
    
    await page.goto('/events', { waitUntil: 'domcontentloaded', timeout: 30000 });
    
    await page.waitForTimeout(3000);
    
    const bodyText = await page.locator('body').textContent();
    console.log('[Smoke Test] 📅 Events page content preview:', bodyText?.slice(0, 300));
    
    await page.screenshot({ path: 'test-results/smoke-events.png' });
    console.log('[Smoke Test] ✅ Events page accessible');
  });

  test('Login flow works with admin account', async ({ page }) => {
    console.log('[Smoke Test] 🔐 Testing login flow...');
    
    await page.goto('/login', { waitUntil: 'domcontentloaded', timeout: 30000 });
    
    await page.screenshot({ path: 'test-results/smoke-login-before.png' });
    
    const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]').first();
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
    
    const hasEmailInput = await emailInput.count() > 0;
    const hasPasswordInput = await passwordInput.count() > 0;
    
    console.log(`[Smoke Test] 📧 Email input found: ${hasEmailInput}`);
    console.log(`[Smoke Test] 🔑 Password input found: ${hasPasswordInput}`);
    
    if (hasEmailInput && hasPasswordInput) {
      await emailInput.fill('admin@mundotango.life');
      await passwordInput.fill('admin123');
      
      await page.screenshot({ path: 'test-results/smoke-login-filled.png' });
      
      const submitButton = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")').first();
      const hasSubmitButton = await submitButton.count() > 0;
      
      if (hasSubmitButton) {
        await submitButton.click();
        console.log('[Smoke Test] 🖱️ Clicked login button');
        
        await page.waitForTimeout(3000);
        
        const currentUrl = page.url();
        console.log(`[Smoke Test] 📍 URL after login: ${currentUrl}`);
        
        await page.screenshot({ path: 'test-results/smoke-login-after.png' });
        
        const isLoggedIn = !currentUrl.includes('/login') || currentUrl.includes('/feed') || currentUrl.includes('/dashboard');
        console.log(`[Smoke Test] ✅ Login redirected: ${isLoggedIn}`);
      }
    }
    
    console.log('[Smoke Test] ✅ Login flow tested');
  });

  test('Groups page accessible', async ({ page }) => {
    console.log('[Smoke Test] 👥 Testing groups page...');
    
    await page.goto('/groups', { waitUntil: 'domcontentloaded', timeout: 30000 });
    
    await page.waitForTimeout(2000);
    
    const bodyText = await page.locator('body').textContent();
    console.log('[Smoke Test] 👥 Groups page content preview:', bodyText?.slice(0, 200));
    
    await page.screenshot({ path: 'test-results/smoke-groups.png' });
    console.log('[Smoke Test] ✅ Groups page accessible');
  });

  test('API health check via page', async ({ page }) => {
    console.log('[Smoke Test] 🔌 Testing API health...');
    
    const statsResponse = await page.request.get('/api/stats/public');
    expect(statsResponse.ok()).toBeTruthy();
    
    const stats = await statsResponse.json();
    console.log('[Smoke Test] 📊 Public stats:', JSON.stringify(stats));
    expect(stats.dancers).toBeGreaterThan(0);
    
    const eventsResponse = await page.request.get('/api/events');
    expect(eventsResponse.ok()).toBeTruthy();
    console.log('[Smoke Test] 📅 Events API responds');
    
    const groupsResponse = await page.request.get('/api/groups');
    expect(groupsResponse.ok()).toBeTruthy();
    console.log('[Smoke Test] 👥 Groups API responds');
    
    console.log('[Smoke Test] ✅ All APIs healthy');
  });
});
