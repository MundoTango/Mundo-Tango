import { Page, expect } from '@playwright/test';

/**
 * Marketplace Helper - Detail Page Testing Utilities
 * Used by Agent 3 for testing marketplace listing pages
 */
export class MarketplaceHelper {
  /**
   * Create a test housing listing via API
   */
  static async createHousingListing(page: Page, data?: Partial<any>) {
    // Use page.request API for creating test data
    const response = await page.request.post('/api/housing', {
      data: {
        title: data?.title || 'Test Apartment in Buenos Aires',
        description: data?.description || 'Beautiful apartment near the tango district',
        location: data?.location || 'Buenos Aires, Argentina',
        price: data?.price || 1200,
        bedrooms: data?.bedrooms || 2,
        bathrooms: data?.bathrooms || 1,
        available_from: data?.available_from || new Date().toISOString(),
        available_to: data?.available_to || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      }
    });
    return await response.json();
  }

  /**
   * Navigate to housing listing detail page
   */
  static async navigateToHousingListing(page: Page, listingId: number) {
    await page.goto(`/housing/${listingId}`);
    await page.waitForLoadState('networkidle');
  }

  /**
   * Verify housing listing detail page loaded
   */
  static async verifyHousingListingPage(page: Page, expectedTitle?: string) {
    await expect(page.getByTestId('listing-detail')).toBeVisible();
    await expect(page.getByTestId('listing-title')).toBeVisible();
    
    if (expectedTitle) {
      await expect(page.getByTestId('listing-title')).toContainText(expectedTitle);
    }
    
    await expect(page.getByTestId('listing-price')).toBeVisible();
    await expect(page.getByTestId('listing-description')).toBeVisible();
  }

  /**
   * Create a test event via API
   */
  static async createEvent(page: Page, data?: Partial<any>) {
    const response = await page.request.post('/api/events', {
      data: {
        title: data?.title || 'Test Milonga Night',
        description: data?.description || 'Traditional tango milonga',
        location: data?.location || 'Buenos Aires',
        event_date: data?.event_date || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        price: data?.price || 25,
        event_type: data?.event_type || 'milonga',
      }
    });
    return await response.json();
  }

  /**
   * Navigate to event detail page
   */
  static async navigateToEvent(page: Page, eventId: number) {
    await page.goto(`/events/${eventId}`);
    await page.waitForLoadState('networkidle');
  }

  /**
   * Verify event detail page loaded
   */
  static async verifyEventPage(page: Page) {
    await expect(page.getByTestId('event-detail')).toBeVisible();
    await expect(page.getByTestId('event-title')).toBeVisible();
    await expect(page.getByTestId('event-date')).toBeVisible();
    await expect(page.getByTestId('button-rsvp')).toBeVisible();
  }

  /**
   * Test booking flow
   */
  static async testBookingFlow(page: Page, listingId: number) {
    await this.navigateToHousingListing(page, listingId);
    
    // Click book button
    await page.getByTestId('button-book').click();
    
    // Verify booking modal or page
    await expect(page.getByTestId('booking-form')).toBeVisible({ timeout: 5000 });
  }
}
