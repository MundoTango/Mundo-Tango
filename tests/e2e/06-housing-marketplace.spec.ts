import { test, expect } from '@playwright/test';
import { generateTestUser, generateTestHousingListing } from './fixtures/test-data';
import { waitForApiResponse } from './helpers/test-helpers';

test.describe('Housing Marketplace Journey', () => {
  let testUser: ReturnType<typeof generateTestUser>;

  test.beforeEach(async ({ page }) => {
    // Register and login
    testUser = generateTestUser();
    await page.request.post('/api/auth/register', {
      data: {
        username: testUser.username,
        email: testUser.email,
        password: testUser.password,
        name: testUser.name,
      },
    });
    
    await page.goto('/login');
    await page.getByTestId('input-username').fill(testUser.username);
    await page.getByTestId('input-password').fill(testUser.password);
    await page.getByTestId('button-login').click();
    await page.waitForURL('**/feed');
  });

  test('should browse housing listings', async ({ page }) => {
    await page.goto('/housing');
    
    // Verify housing page
    await expect(page.getByRole('heading', { name: /housing/i })).toBeVisible();
    await expect(page.getByTestId('housing-listing-card')).toHaveCount({ min: 1 });
  });

  test('should search housing by location', async ({ page }) => {
    await page.goto('/housing');
    
    // Search by city
    await page.getByTestId('input-search-housing').fill('Buenos Aires');
    await waitForApiResponse(page, '/api/housing');
    
    // Verify filtered results
    await expect(page.getByText(/Buenos Aires/i)).toBeVisible();
  });

  test('should filter housing by price range', async ({ page }) => {
    await page.goto('/housing');
    
    // Apply price filter
    await page.getByTestId('input-price-min').fill('500');
    await page.getByTestId('input-price-max').fill('1500');
    await page.getByTestId('button-apply-filters').click();
    
    await waitForApiResponse(page, '/api/housing');
    
    // Verify filtered results
    await expect(page.getByTestId('housing-listing-card')).toBeVisible();
  });

  test('should view housing listing details', async ({ page }) => {
    // Create test listing
    const listing = generateTestHousingListing();
    const listingResponse = await page.request.post('/api/housing/listings', {
      data: listing,
    });
    const listingData = await listingResponse.json();
    
    await page.goto(`/housing/${listingData.id}`);
    
    // Verify listing details
    await expect(page.getByRole('heading', { name: listing.title })).toBeVisible();
    await expect(page.getByText(listing.description)).toBeVisible();
    await expect(page.getByText(listing.price)).toBeVisible();
    await expect(page.getByText(`${listing.bedrooms} bed`)).toBeVisible();
    await expect(page.getByText(`${listing.bathrooms} bath`)).toBeVisible();
  });

  test('should contact landlord', async ({ page }) => {
    // Create test listing
    const listing = generateTestHousingListing();
    const listingResponse = await page.request.post('/api/housing/listings', {
      data: listing,
    });
    const listingData = await listingResponse.json();
    
    await page.goto(`/housing/${listingData.id}`);
    
    // Click contact button
    await page.getByTestId('button-contact-landlord').click();
    
    // Fill contact form
    await page.getByTestId('textarea-message').fill('I am interested in this property');
    await page.getByTestId('button-send-message').click();
    
    // Verify success
    await expect(page.getByText(/message sent/i)).toBeVisible();
  });

  test('should save housing listing', async ({ page }) => {
    // Create test listing
    const listing = generateTestHousingListing();
    const listingResponse = await page.request.post('/api/housing/listings', {
      data: listing,
    });
    const listingData = await listingResponse.json();
    
    await page.goto(`/housing/${listingData.id}`);
    
    // Save listing
    await page.getByTestId('button-save-listing').click();
    await page.waitForTimeout(500);
    
    // Verify saved status
    await expect(page.getByTestId('button-save-listing')).toHaveAttribute('data-saved', 'true');
    
    // Navigate to saved listings
    await page.goto('/housing/saved');
    await expect(page.getByText(listing.title)).toBeVisible();
  });

  test('should book viewing appointment', async ({ page }) => {
    // Create test listing
    const listing = generateTestHousingListing();
    const listingResponse = await page.request.post('/api/housing/listings', {
      data: listing,
    });
    const listingData = await listingResponse.json();
    
    await page.goto(`/housing/${listingData.id}`);
    
    // Open booking dialog
    await page.getByTestId('button-book-viewing').click();
    
    // Select date and time
    await page.getByTestId('input-booking-date').fill('2025-12-01');
    await page.getByTestId('input-booking-time').fill('14:00');
    await page.getByTestId('textarea-booking-notes').fill('Looking forward to viewing');
    
    // Submit booking
    await page.getByTestId('button-confirm-booking').click();
    
    // Verify success
    await expect(page.getByText(/booking confirmed/i)).toBeVisible();
  });
});
