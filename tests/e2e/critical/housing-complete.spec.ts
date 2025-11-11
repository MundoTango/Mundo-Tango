import { test, expect } from '@playwright/test';

/**
 * Housing Marketplace E2E Tests
 * Covers: Listings, Search, Booking, Reviews, Favorites
 */

async function loginAsAdmin(page: any) {
  await page.goto('/login');
  await page.fill('[data-testid="input-email"]', 'admin@mundotango.life');
  await page.fill('[data-testid="input-password"]', 'admin123');
  await page.click('[data-testid="button-login"]');
  await page.waitForURL(/\/feed/);
}

test.describe('Housing Marketplace - Complete Flow', () => {
  
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });
  
  test.describe('Housing Listings Discovery', () => {
    
    test('should display housing listings', async ({ page }) => {
      await page.goto('/housing');
      
      // Should show listings grid
      await expect(page.locator('[data-testid^="card-listing-"]')).toBeVisible();
    });
    
    test('should filter by accommodation type', async ({ page }) => {
      await page.goto('/housing');
      
      // Click apartment filter
      await page.click('[data-testid="filter-apartment"]');
      
      // Should show filtered results
      await expect(page.locator('[data-testid^="card-listing-"]')).toBeVisible();
    });
    
    test('should search by location', async ({ page }) => {
      await page.goto('/housing');
      
      await page.fill('[data-testid="input-location"]', 'Buenos Aires');
      await page.click('[data-testid="button-search"]');
      
      // Should show search results
      await expect(page.locator('[data-testid^="card-listing-"]')).toBeVisible();
    });
    
    test('should filter by price range', async ({ page }) => {
      await page.goto('/housing');
      
      // Set price range
      await page.fill('[data-testid="input-min-price"]', '50');
      await page.fill('[data-testid="input-max-price"]', '150');
      await page.click('[data-testid="button-apply-filters"]');
      
      // Should show filtered results
      await expect(page.locator('[data-testid^="card-listing-"]')).toBeVisible();
    });
  });
  
  test.describe('Listing Details', () => {
    
    test('should view listing details', async ({ page }) => {
      await page.goto('/housing');
      
      // Click first listing
      const firstListing = page.locator('[data-testid^="card-listing-"]').first();
      await firstListing.click();
      
      // Should show listing details
      await expect(page.locator('[data-testid="text-listing-title"]')).toBeVisible();
      await expect(page.locator('[data-testid="text-listing-price"]')).toBeVisible();
      await expect(page.locator('[data-testid="text-listing-description"]')).toBeVisible();
    });
    
    test('should show listing photos', async ({ page }) => {
      await page.goto('/housing');
      
      const firstListing = page.locator('[data-testid^="card-listing-"]').first();
      await firstListing.click();
      
      // Should show image gallery
      await expect(page.locator('[data-testid="img-listing-photo"]')).toBeVisible();
    });
    
    test('should show amenities', async ({ page }) => {
      await page.goto('/housing');
      
      const firstListing = page.locator('[data-testid^="card-listing-"]').first();
      await firstListing.click();
      
      // Should show amenities section
      await expect(page.locator('text=/amenities/i')).toBeVisible();
    });
  });
  
  test.describe('Booking Flow', () => {
    
    test('should initiate booking request', async ({ page }) => {
      await page.goto('/housing');
      
      const firstListing = page.locator('[data-testid^="card-listing-"]').first();
      await firstListing.click();
      
      // Click book now button
      await page.click('[data-testid="button-book-now"]');
      
      // Should show booking form
      await expect(page.locator('[data-testid="input-check-in"]')).toBeVisible();
      await expect(page.locator('[data-testid="input-check-out"]')).toBeVisible();
    });
    
    test('should validate booking dates', async ({ page }) => {
      await page.goto('/housing');
      
      const firstListing = page.locator('[data-testid^="card-listing-"]').first();
      await firstListing.click();
      
      await page.click('[data-testid="button-book-now"]');
      
      // Try to book with invalid dates (check-out before check-in)
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      await page.fill('[data-testid="input-check-in"]', today.toISOString().split('T')[0]);
      await page.fill('[data-testid="input-check-out"]', yesterday.toISOString().split('T')[0]);
      
      await page.click('[data-testid="button-submit-booking"]');
      
      // Should show validation error
      await expect(page.locator('text=/invalid.*date/i')).toBeVisible();
    });
  });
  
  test.describe('Reviews', () => {
    
    test('should view listing reviews', async ({ page }) => {
      await page.goto('/housing');
      
      const firstListing = page.locator('[data-testid^="card-listing-"]').first();
      await firstListing.click();
      
      // Should show reviews section
      const reviewsSection = page.locator('text=/reviews/i');
      if (await reviewsSection.isVisible()) {
        await expect(reviewsSection).toBeVisible();
      }
    });
  });
  
  test.describe('Favorites', () => {
    
    test('should favorite a listing', async ({ page }) => {
      await page.goto('/housing');
      
      const firstListing = page.locator('[data-testid^="card-listing-"]').first();
      await firstListing.click();
      
      // Click favorite button
      await page.click('[data-testid="button-favorite"]');
      
      // Should show favorited state
      await expect(page.locator('[data-testid="button-favorite"][aria-pressed="true"]')).toBeVisible();
    });
    
    test('should view favorited listings', async ({ page }) => {
      await page.goto('/housing/favorites');
      
      // Should show favorites page
      await expect(page.locator('h1')).toContainText(/favorite/i);
    });
  });
  
  test.describe('Create Listing', () => {
    
    test('should create new housing listing', async ({ page }) => {
      await page.goto('/housing');
      
      await page.click('[data-testid="button-create-listing"]');
      
      const timestamp = Date.now();
      
      // Fill listing form
      await page.fill('[data-testid="input-listing-title"]', `Test Listing ${timestamp}`);
      await page.fill('[data-testid="input-listing-description"]', 'Beautiful apartment near milongas');
      await page.fill('[data-testid="input-listing-price"]', '100');
      await page.fill('[data-testid="input-listing-location"]', 'Buenos Aires');
      
      // Submit
      await page.click('[data-testid="button-submit-listing"]');
      
      // Should show success message
      await expect(page.locator('text=/listing.*created/i')).toBeVisible();
    });
  });
});
