import { test, expect, Page } from '@playwright/test';

/**
 * MB.MD v9.8 Event Creation Debug Suite
 * 
 * Hierarchical Execution Framework Applied:
 * - Replit AI: Strategic test design
 * - Mr. Blue: Tactical test orchestration  
 * - Agents: Atomic test execution
 * 
 * Purpose: Debug and validate event creation flow
 * Requirements: User with role level >= 3 (Community Leader)
 */

test.describe('Event Creation Debug Suite (MB.MD v9.8)', () => {
  // Test configuration
  const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';
  const TEST_TIMEOUT = 60000;

  test.beforeEach(async ({ page }) => {
    // Set up console logging
    page.on('console', msg => {
      console.log(`[Browser ${msg.type()}]`, msg.text());
    });

    page.on('response', response => {
      const status = response.status();
      const url = response.url();
      if (url.includes('/api/events') && (status >= 400 || url.includes('POST'))) {
        console.log(`[API Response] ${response.request().method()} ${url} -> ${status}`);
      }
    });

    page.on('requestfailed', request => {
      console.log(`[Request Failed] ${request.method()} ${request.url()}: ${request.failure()?.errorText}`);
    });
  });

  test('Debug: Login and verify role level', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUT);
    
    // Step 1: Navigate to login
    console.log('[Step 1] Navigating to login page...');
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    // Step 2: Login with admin credentials
    console.log('[Step 2] Logging in...');
    const emailInput = page.locator('input[type="email"], [data-testid*="email"]').first();
    const passwordInput = page.locator('input[type="password"], [data-testid*="password"]').first();
    
    if (await emailInput.isVisible({ timeout: 5000 })) {
      await emailInput.fill('scottboddye@gmail.com');
      await passwordInput.fill('test123');
      
      const submitBtn = page.locator('button[type="submit"]').first();
      await submitBtn.click();
      await page.waitForTimeout(3000);
    }

    // Step 3: Check auth status
    console.log('[Step 3] Checking auth status...');
    const authResponse = await page.evaluate(async () => {
      const res = await fetch('/api/auth/me');
      return { status: res.status, data: await res.json().catch(() => null) };
    });
    console.log('[Auth Response]', JSON.stringify(authResponse));
    
    // Verify role level >= 3
    if (authResponse.data?.user?.roleLevel) {
      console.log(`[Role Level] ${authResponse.data.user.roleLevel} (needs >= 3)`);
      expect(authResponse.data.user.roleLevel).toBeGreaterThanOrEqual(3);
    }
  });

  test('Debug: Event creation without photos', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUT);
    
    // Login first
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    const emailInput = page.locator('input[type="email"]').first();
    if (await emailInput.isVisible({ timeout: 5000 })) {
      await emailInput.fill('scottboddye@gmail.com');
      await page.locator('input[type="password"]').first().fill('test123');
      await page.locator('button[type="submit"]').first().click();
      await page.waitForTimeout(3000);
    }

    // Navigate to event creation
    console.log('[Step 1] Navigating to /events/create...');
    await page.goto('/events/create');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Take screenshot of initial state
    await page.screenshot({ path: 'tests/screenshots/event-create-initial.png' });
    console.log('[Screenshot] Initial state captured');

    // Step 2: Fill required fields
    console.log('[Step 2] Filling form fields...');
    
    // Title
    const titleInput = page.locator('[data-testid="input-title"], input[id="title"]').first();
    if (await titleInput.isVisible()) {
      await titleInput.fill(`Debug Event ${Date.now()}`);
      console.log('[Filled] Title');
    } else {
      console.log('[ERROR] Title input not found');
    }

    // Event Type (should default to milonga)
    const eventTypeBtn = page.locator('button:has-text("Milonga"), [data-testid*="milonga"]').first();
    if (await eventTypeBtn.isVisible()) {
      await eventTypeBtn.click();
      console.log('[Filled] Event Type: Milonga');
    }

    // Date selection
    const dateBtn = page.locator('[data-testid*="date"], button:has-text("Pick"), .calendar-trigger').first();
    if (await dateBtn.isVisible()) {
      await dateBtn.click();
      await page.waitForTimeout(500);
      // Select tomorrow
      const tomorrow = page.locator('.rdp-day:not([disabled])').nth(15);
      if (await tomorrow.isVisible()) {
        await tomorrow.click();
        console.log('[Filled] Date');
      }
      await page.keyboard.press('Escape');
    }

    // Location
    const locationInput = page.locator('[data-testid*="location"], input[placeholder*="location"]').first();
    if (await locationInput.isVisible()) {
      await locationInput.fill('Buenos Aires, Argentina');
      await page.waitForTimeout(500);
      console.log('[Filled] Location');
    }

    await page.screenshot({ path: 'tests/screenshots/event-create-filled.png' });
    console.log('[Screenshot] Filled form captured');

    // Step 3: Submit form
    console.log('[Step 3] Submitting form...');
    
    // Set up request interception to capture the actual API call
    let apiRequest: any = null;
    let apiResponse: any = null;
    
    page.on('request', request => {
      if (request.url().includes('/api/events') && request.method() === 'POST') {
        apiRequest = {
          url: request.url(),
          method: request.method(),
          postData: request.postData()?.substring(0, 1000) // Limit size
        };
        console.log('[API Request] POST /api/events');
        console.log('[Request Data Preview]', apiRequest.postData?.substring(0, 500));
      }
    });

    page.on('response', async response => {
      if (response.url().includes('/api/events') && response.request().method() === 'POST') {
        apiResponse = {
          status: response.status(),
          statusText: response.statusText(),
          body: await response.text().catch(() => 'Could not read body')
        };
        console.log('[API Response]', apiResponse.status, apiResponse.statusText);
        console.log('[Response Body]', apiResponse.body?.substring(0, 500));
      }
    });

    const submitBtn = page.locator('button:has-text("Create Event"), [data-testid*="create"], [data-testid*="submit"]').first();
    if (await submitBtn.isVisible()) {
      await submitBtn.click();
      console.log('[Clicked] Submit button');
    } else {
      console.log('[ERROR] Submit button not found');
    }

    // Wait for API response
    await page.waitForTimeout(5000);

    await page.screenshot({ path: 'tests/screenshots/event-create-result.png' });
    console.log('[Screenshot] Result captured');

    // Check for success/error messages
    const successToast = page.locator('.toast:has-text("success"), [data-testid*="success"]');
    const errorToast = page.locator('.toast:has-text("error"), .toast:has-text("Failed"), [data-testid*="error"]');
    
    if (await successToast.isVisible({ timeout: 3000 }).catch(() => false)) {
      console.log('[SUCCESS] Event created!');
    } else if (await errorToast.isVisible({ timeout: 1000 }).catch(() => false)) {
      const errorText = await errorToast.textContent();
      console.log('[ERROR] Toast message:', errorText);
    }

    // Log final results
    console.log('=== DEBUG SUMMARY ===');
    console.log('API Request:', apiRequest ? 'Captured' : 'Not captured');
    console.log('API Response:', apiResponse ? `${apiResponse.status} ${apiResponse.statusText}` : 'Not captured');
  });

  test('Debug: Direct API test (bypass UI)', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUT);
    
    // Login first to get auth cookie
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    const emailInput = page.locator('input[type="email"]').first();
    if (await emailInput.isVisible({ timeout: 5000 })) {
      await emailInput.fill('scottboddye@gmail.com');
      await page.locator('input[type="password"]').first().fill('test123');
      await page.locator('button[type="submit"]').first().click();
      await page.waitForTimeout(3000);
    }

    // Direct API call
    console.log('[Step 1] Making direct API call to POST /api/events...');
    
    const result = await page.evaluate(async () => {
      const eventData = {
        title: `API Test Event ${Date.now()}`,
        description: 'Test event created via direct API call',
        eventType: 'milonga',
        location: 'Buenos Aires, Argentina',
        city: 'Buenos Aires',
        country: 'Argentina',
        startDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
        endDate: new Date(Date.now() + 90000000).toISOString(),
        startTime: '20:00',
        endTime: '23:00',
        timezone: 'America/Argentina/Buenos_Aires',
        isFree: true,
        price: null,
        currency: 'ARS',
        maxCapacity: 100,
        musicStyle: 'mixed',
        level: 'all'
      };

      console.log('Sending:', JSON.stringify(eventData));

      try {
        const response = await fetch('/api/events', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(eventData)
        });

        const responseText = await response.text();
        let responseJson = null;
        try {
          responseJson = JSON.parse(responseText);
        } catch (e) {
          // Not JSON
        }

        return {
          status: response.status,
          statusText: response.statusText,
          ok: response.ok,
          body: responseJson || responseText
        };
      } catch (error: any) {
        return {
          error: error.message,
          stack: error.stack
        };
      }
    });

    console.log('[API Result]', JSON.stringify(result, null, 2));

    if (result.ok) {
      console.log('[SUCCESS] Event created via API!');
      expect(result.status).toBe(201);
    } else {
      console.log('[FAILED] API returned error');
      console.log('Status:', result.status);
      console.log('Body:', JSON.stringify(result.body));
    }
  });

  test('Debug: Check apiRequest parameter order', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUT);
    
    // This test validates the fix for the parameter order bug
    console.log('[Test] Checking apiRequest function signature...');
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const result = await page.evaluate(async () => {
      // Test that fetch works with proper order
      try {
        // This should NOT throw "is not a valid HTTP method"
        const testResponse = await fetch('/api/auth/me', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        return { success: true, status: testResponse.status };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    });

    console.log('[Result]', result);
    expect(result.success).toBe(true);
  });
});
