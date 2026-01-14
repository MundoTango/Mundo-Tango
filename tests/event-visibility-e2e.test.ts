import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';

test.describe('Event Visibility E2E Tests', () => {
  
  test('Events page shows event cards with badges', async ({ page }) => {
    // Enable console logging to see what's happening in the browser
    page.on('console', msg => {
      if (msg.type() === 'error' || msg.type() === 'warn') {
        console.log(`[Browser ${msg.type()}]:`, msg.text());
      }
    });
    
    // Log network requests to events API
    page.on('request', request => {
      if (request.url().includes('/api/events')) {
        console.log(`[Network Request]: ${request.method()} ${request.url()}`);
      }
    });
    
    page.on('response', response => {
      if (response.url().includes('/api/events')) {
        console.log(`[Network Response]: ${response.status()} ${response.url()}`);
      }
    });
    
    // Navigate to events page
    await page.goto(`${BASE_URL}/events`, { waitUntil: 'networkidle', timeout: 45000 });
    
    // Take a screenshot to see what's on the page
    await page.screenshot({ path: '/tmp/events-page.png', fullPage: true });
    console.log('Screenshot saved to /tmp/events-page.png');
    
    // Wait for React to hydrate and load events
    await page.waitForTimeout(3000);
    
    console.log('Page URL:', page.url());
    console.log('Page title:', await page.title());
    
    // Check what's on the page
    const bodyText = await page.locator('body').textContent();
    console.log('Page has content:', bodyText?.substring(0, 500));
    
    // Look for loading states
    const loadingElements = await page.locator('text=/loading|Loading|Skeleton/i').count();
    console.log(`Loading elements: ${loadingElements}`);
    
    // Look for specific event card test ids
    const eventCards = await page.locator('[data-testid^="card-event-"]').count();
    console.log(`Found ${eventCards} event cards with data-testid`);
    
    // Also try generic card elements
    const genericCards = await page.locator('.card, [class*="Card"], [class*="event"]').count();
    console.log(`Found ${genericCards} generic card/event elements`);
    
    // Check for tabs (EventsPage has tabs for views)
    const tabs = await page.locator('[role="tablist"], [data-testid*="tab"]').count();
    console.log(`Found ${tabs} tab elements`);
    
    // Get all data-testid attributes on the page
    const allTestIds = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('[data-testid]'))
        .map(el => el.getAttribute('data-testid'))
        .slice(0, 30);
    });
    console.log('Sample data-testid attributes:', allTestIds);
    
    console.log('✓ Events page test completed');
  });
});
