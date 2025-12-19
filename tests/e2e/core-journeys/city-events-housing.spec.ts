import { test, expect } from '@playwright/test';

/**
 * City Hub, Events & Housing - E2E Tests
 * Tests the core user journeys for:
 * - Browsing city hubs
 * - Viewing events by city
 * - Viewing housing listings by city
 * - City group navigation
 */

test.describe('City Hub Journey', () => {
  test('city-hub-loads: City Hub page loads with Buenos Aires', async ({ page }) => {
    await page.goto('/city-hub?city=Buenos%20Aires');
    await page.waitForLoadState('domcontentloaded');
    
    const heading = page.locator('[data-testid="heading-city-hub"]');
    await expect(heading).toBeVisible({ timeout: 10000 });
    await expect(heading).toContainText('Buenos Aires');
  });

  test('city-hub-events-section: Events section shows Buenos Aires events', async ({ page }) => {
    await page.goto('/city-hub?city=Buenos%20Aires');
    await page.waitForLoadState('domcontentloaded');
    
    const eventsSection = page.locator('[data-testid="section-events"]');
    await expect(eventsSection).toBeVisible({ timeout: 10000 });
  });

  test('city-hub-housing-section: Housing section shows listings', async ({ page }) => {
    await page.goto('/city-hub?city=Buenos%20Aires');
    await page.waitForLoadState('domcontentloaded');
    
    const housingSection = page.locator('[data-testid="section-housing"]');
    await expect(housingSection).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Event Detail Journey', () => {
  test('event-detail-loads: Event detail page loads correctly', async ({ page }) => {
    await page.goto('/events/2');
    await page.waitForLoadState('domcontentloaded');
    
    const title = page.locator('[data-testid="text-event-title"]');
    await expect(title).toBeVisible({ timeout: 10000 });
    await expect(title).toContainText('Milonga');
  });
});

test.describe('Housing Detail Journey', () => {
  test('housing-detail-loads: Housing listing page loads correctly', async ({ page }) => {
    await page.goto('/housing/listing/1');
    await page.waitForLoadState('domcontentloaded');
    
    const title = page.locator('[data-testid="text-listing-title"]');
    await expect(title).toBeVisible({ timeout: 10000 });
    await expect(title).toContainText('Studio');
  });
});

test.describe('City Groups Journey', () => {
  test('city-groups-page-loads: City groups page loads', async ({ page }) => {
    await page.goto('/city-groups');
    await page.waitForLoadState('domcontentloaded');
    
    const heading = page.locator('[data-testid="heading-city-groups"]');
    await expect(heading).toBeVisible({ timeout: 10000 });
    await expect(heading).toContainText('City Groups');
  });
});

test.describe('API Verification', () => {
  test('api-events-city-filter: Events API filters by city', async ({ request }) => {
    const response = await request.get('/api/events?city=Buenos%20Aires');
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
    
    const firstEvent = data[0];
    expect(firstEvent.event).toBeDefined();
    expect(firstEvent.event.city).toBe('Buenos Aires');
  });

  test('api-housing-city-filter: Housing API filters by city', async ({ request }) => {
    const response = await request.get('/api/housing/listings?city=Buenos%20Aires');
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
    
    const firstListing = data[0];
    expect(firstListing.listing).toBeDefined();
    expect(firstListing.listing.city).toBe('Buenos Aires');
  });

  test('api-groups-type-filter: Groups API filters by type', async ({ request }) => {
    const response = await request.get('/api/groups?type=city&limit=10');
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
    
    const firstGroup = data[0];
    expect(firstGroup.group).toBeDefined();
    expect(firstGroup.group.type).toBe('city');
  });

  test('api-event-detail: Event detail API returns correct data', async ({ request }) => {
    const response = await request.get('/api/events/2');
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data.event).toBeDefined();
    expect(data.event.title).toBe('Friday Night Milonga');
    expect(data.event.city).toBe('Buenos Aires');
  });

  test('api-housing-detail: Housing detail API returns correct data', async ({ request }) => {
    const response = await request.get('/api/housing/listings/1');
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data.listing).toBeDefined();
    expect(data.listing.title).toBe('Cozy Studio near Milongas');
    expect(data.listing.city).toBe('Buenos Aires');
  });

  test('api-group-detail: Group detail API returns correct data', async ({ request }) => {
    const response = await request.get('/api/groups/9');
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data.group).toBeDefined();
    expect(data.group.name).toBe('Buenos Aires Tango Community');
    expect(data.group.city).toBe('Buenos Aires');
  });
});
