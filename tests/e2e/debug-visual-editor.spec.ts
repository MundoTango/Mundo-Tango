import { test } from '@playwright/test';

test('debug visual editor crash', async ({ page }) => {
  // Capture ALL console messages
  page.on('console', msg => {
    const type = msg.type();
    console.log(`[BROWSER ${type.toUpperCase()}]:`, msg.text());
  });
  
  // Capture page errors (unhandled exceptions)
  page.on('pageerror', error => {
    console.error('[PAGE JAVASCRIPT ERROR]:');
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
  });

  // Login
  await page.goto('http://localhost:5000/login');
  await page.fill('[data-testid="input-email"]', process.env.TEST_ADMIN_EMAIL!);
  await page.fill('[data-testid="input-password"]', process.env.TEST_ADMIN_PASSWORD!);
  await page.click('[data-testid="button-submit"]');
  await page.waitForURL('**/dashboard', { timeout: 10000 });
  
  // Navigate to Visual Editor
  console.log('[TEST] Navigating to Visual Editor...');
  await page.goto('http://localhost:5000/admin/visual-editor');
  
  // Wait for errors to surface
  await page.waitForTimeout(5000);
  
  console.log('[TEST] Test complete - check logs above');
});
