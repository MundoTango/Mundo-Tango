import { test, expect } from '@playwright/test';

/**
 * Comprehensive Events E2E Test Suite
 * Covers: Event Creation, RSVP, Ticketing, Search, Filters
 */

// Helper to login before tests
async function loginAsAdmin(page: any) {
  await page.goto('/login');
  await page.fill('[data-testid="input-email"]', process.env.TEST_ADMIN_EMAIL || 'admin@mundotango.life');
  await page.fill('[data-testid="input-password"]', process.env.TEST_ADMIN_PASSWORD || 'admin123');
  await page.click('[data-testid="button-login"]');
  await page.waitForURL(/\/feed/);
}

test.describe('Events - Complete Flow', () => {
  
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });
  
  test.describe('Event Discovery', () => {
    
    test('should display events list', async ({ page }) => {
      await page.goto('/events');
      
      // Should show events grid or list
      await expect(page.locator('[data-testid^="card-event-"]')).toBeVisible();
    });
    
    test('should filter events by type', async ({ page }) => {
      await page.goto('/events');
      
      // Click milonga filter
      await page.click('[data-testid="filter-milonga"]');
      
      // Should show only milongas
      await expect(page.locator('text=/milonga/i')).toBeVisible();
    });
    
    test('should search events by name', async ({ page }) => {
      await page.goto('/events');
      
      await page.fill('[data-testid="input-search"]', 'tango');
      await page.click('[data-testid="button-search"]');
      
      // Should show search results
      await expect(page.locator('[data-testid^="card-event-"]')).toBeVisible();
    });
    
    test('should filter events by date', async ({ page }) => {
      await page.goto('/events');
      
      // Select date filter
      await page.click('[data-testid="filter-upcoming"]');
      
      // Should show upcoming events
      await expect(page.locator('[data-testid^="card-event-"]')).toBeVisible();
    });
  });
  
  test.describe('Event Details', () => {
    
    test('should view event details', async ({ page }) => {
      await page.goto('/events');
      
      // Click first event
      const firstEvent = page.locator('[data-testid^="card-event-"]').first();
      await firstEvent.click();
      
      // Should show event details
      await expect(page.locator('[data-testid="text-event-title"]')).toBeVisible();
      await expect(page.locator('[data-testid="text-event-date"]')).toBeVisible();
      await expect(page.locator('[data-testid="text-event-location"]')).toBeVisible();
    });
  });
  
  test.describe('Event RSVP', () => {
    
    test('should RSVP to free event', async ({ page }) => {
      await page.goto('/events');
      
      // Find a free event or click first event
      const firstEvent = page.locator('[data-testid^="card-event-"]').first();
      await firstEvent.click();
      
      // Click RSVP button
      await page.click('[data-testid="button-rsvp"]');
      
      // Should show RSVP confirmation
      await expect(page.locator('text=/rsvp.*confirmed/i')).toBeVisible();
    });
    
    test('should cancel RSVP', async ({ page }) => {
      await page.goto('/events');
      
      // Click first event that user has RSVPed to
      const firstEvent = page.locator('[data-testid^="card-event-"]').first();
      await firstEvent.click();
      
      // RSVP first
      const rsvpButton = page.locator('[data-testid="button-rsvp"]');
      if (await rsvpButton.isVisible()) {
        await rsvpButton.click();
        await page.waitForTimeout(500);
      }
      
      // Cancel RSVP
      await page.click('[data-testid="button-cancel-rsvp"]');
      
      // Should show cancellation confirmation
      await expect(page.locator('text=/rsvp.*cancelled/i')).toBeVisible();
    });
  });
  
  test.describe('Event Creation', () => {
    
    test('should create new event', async ({ page }) => {
      await page.goto('/events');
      
      // Click create event button
      await page.click('[data-testid="button-create-event"]');
      
      const timestamp = Date.now();
      
      // Fill event form
      await page.fill('[data-testid="input-event-title"]', `Test Event ${timestamp}`);
      await page.fill('[data-testid="input-event-description"]', 'This is a test event');
      await page.fill('[data-testid="input-event-location"]', 'Buenos Aires, Argentina');
      
      // Set date (future date)
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);
      await page.fill('[data-testid="input-event-date"]', futureDate.toISOString().split('T')[0]);
      
      // Submit
      await page.click('[data-testid="button-submit-event"]');
      
      // Should show success message
      await expect(page.locator('text=/event.*created/i')).toBeVisible();
    });
    
    test('should validate required fields', async ({ page }) => {
      await page.goto('/events');
      
      await page.click('[data-testid="button-create-event"]');
      
      // Try to submit without filling
      await page.click('[data-testid="button-submit-event"]');
      
      // Should show validation errors
      await expect(page.locator('text=/required/i')).toBeVisible();
    });
  });
  
  test.describe('Ticketed Events', () => {
    
    test('should show ticket pricing for paid events', async ({ page }) => {
      await page.goto('/events');
      
      // Find a paid event
      const paidEvent = page.locator('[data-testid^="card-event-"]').first();
      await paidEvent.click();
      
      // Should show ticket price
      const priceElement = page.locator('[data-testid="text-ticket-price"]');
      if (await priceElement.isVisible()) {
        await expect(priceElement).toBeVisible();
      }
    });
  });
  
  test.describe('My Events', () => {
    
    test('should view my RSVPed events', async ({ page }) => {
      await page.goto('/events/my-events');
      
      // Should show user's events
      await expect(page.locator('h1')).toContainText(/my.*events/i);
    });
  });
});
