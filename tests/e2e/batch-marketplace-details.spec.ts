/**
 * AGENT 3: Marketplace Detail Pages Test Suite
 * Tests individual listing, event, workshop, venue, teacher pages
 * Timeline: Days 2-6
 */

import { test, expect } from '@playwright/test';
import { MarketplaceHelper } from '../helpers/marketplace-helper';
import { setupAuthenticatedSession } from '../helpers/auth-setup';

test.describe('Marketplace Detail Pages - Complete Coverage', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedSession(page);
  });

  // Housing Listing Detail Pages
  test('Housing listing detail page displays correctly', async ({ page }) => {
    // Create test listing
    const listing = await MarketplaceHelper.createHousingListing(page, {
      title: 'Test Buenos Aires Apartment',
      price: 1500
    });
    
    // Navigate to listing
    await MarketplaceHelper.navigateToHousingListing(page, listing.id);
    
    // Verify page loaded
    await MarketplaceHelper.verifyHousingListingPage(page, 'Test Buenos Aires Apartment');
    
    // Verify booking button
    await expect(page.getByTestId('button-book')).toBeVisible();
  });

  test('Housing listing shows all details', async ({ page }) => {
    const listing = await MarketplaceHelper.createHousingListing(page);
    await MarketplaceHelper.navigateToHousingListing(page, listing.id);
    
    // Verify all detail sections
    await expect(page.getByTestId('listing-location')).toBeVisible();
    await expect(page.getByTestId('listing-bedrooms')).toBeVisible();
    await expect(page.getByTestId('listing-bathrooms')).toBeVisible();
    await expect(page.getByTestId('listing-availability')).toBeVisible();
  });

  test('Housing booking flow works', async ({ page }) => {
    const listing = await MarketplaceHelper.createHousingListing(page);
    await MarketplaceHelper.testBookingFlow(page, listing.id);
  });

  // Event Detail Pages
  test('Event detail page displays correctly', async ({ page }) => {
    const event = await MarketplaceHelper.createEvent(page, {
      title: 'Test Tango Milonga',
      price: 25
    });
    
    await MarketplaceHelper.navigateToEvent(page, event.id);
    await MarketplaceHelper.verifyEventPage(page);
  });

  test('Event RSVP button works', async ({ page }) => {
    const event = await MarketplaceHelper.createEvent(page);
    await MarketplaceHelper.navigateToEvent(page, event.id);
    
    // Click RSVP
    await page.getByTestId('button-rsvp').click();
    
    // Verify RSVP confirmation
    await expect(page.getByTestId('rsvp-success')).toBeVisible({ timeout: 5000 });
  });

  test('Event shows attendees', async ({ page }) => {
    const event = await MarketplaceHelper.createEvent(page);
    await MarketplaceHelper.navigateToEvent(page, event.id);
    
    // Check for attendees section
    await expect(page.getByTestId('event-attendees')).toBeVisible();
  });

  // Workshop Detail Pages
  test('Workshop detail page displays correctly', async ({ page }) => {
    await page.goto('/workshops');
    
    // Find first workshop
    const firstWorkshop = page.getByTestId(/card-workshop-/).first();
    if (await firstWorkshop.isVisible()) {
      await firstWorkshop.click();
      
      // Verify workshop detail page
      await expect(page).toHaveURL(/\/workshops\/\d+/);
      await expect(page.getByTestId('workshop-detail')).toBeVisible();
    }
  });

  // Venue Detail Pages
  test('Venue detail page displays correctly', async ({ page }) => {
    await page.goto('/venues');
    
    // Find first venue
    const firstVenue = page.getByTestId(/card-venue-/).first();
    if (await firstVenue.isVisible()) {
      await firstVenue.click();
      
      // Verify venue detail page
      await expect(page).toHaveURL(/\/venues\/\d+/);
      await expect(page.getByTestId('venue-detail')).toBeVisible();
      await expect(page.getByTestId('venue-address')).toBeVisible();
    }
  });

  // Teacher Profile Pages
  test('Teacher profile page displays correctly', async ({ page }) => {
    await page.goto('/teachers');
    
    // Find first teacher
    const firstTeacher = page.getByTestId(/card-teacher-/).first();
    if (await firstTeacher.isVisible()) {
      await firstTeacher.click();
      
      // Verify teacher profile page
      await expect(page).toHaveURL(/\/teachers\/\d+/);
      await expect(page.getByTestId('teacher-profile')).toBeVisible();
      await expect(page.getByTestId('teacher-bio')).toBeVisible();
    }
  });

  // Group Detail Pages
  test('Group detail page displays correctly', async ({ page }) => {
    await page.goto('/groups');
    
    // Find first group
    const firstGroup = page.getByTestId(/card-group-/).first();
    if (await firstGroup.isVisible()) {
      await firstGroup.click();
      
      // Verify group detail page
      await expect(page).toHaveURL(/\/groups\/\d+/);
      await expect(page.getByTestId('group-detail')).toBeVisible();
      await expect(page.getByTestId('group-members')).toBeVisible();
    }
  });

  test('Group join button works', async ({ page }) => {
    await page.goto('/groups');
    
    const firstGroup = page.getByTestId(/card-group-/).first();
    if (await firstGroup.isVisible()) {
      await firstGroup.click();
      
      // Try to join group
      const joinButton = page.getByTestId('button-join-group');
      if (await joinButton.isVisible()) {
        await joinButton.click();
        await expect(page.getByTestId('join-success')).toBeVisible({ timeout: 5000 });
      }
    }
  });
});
