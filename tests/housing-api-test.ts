#!/usr/bin/env tsx

/**
 * Comprehensive Housing Marketplace API Test Suite
 * Tests all Housing API endpoints for correctness
 */

import axios, { AxiosInstance, AxiosError } from 'axios';

const API_BASE = process.env.API_BASE || 'http://localhost:5000';
const TEST_USER_EMAIL = 'housingtest@example.com';
const TEST_USER_PASSWORD = 'testpass123';
const UNIQUE_ID = Date.now();

interface TestResult {
  endpoint: string;
  method: string;
  status: 'PASS' | 'FAIL';
  statusCode?: number;
  message: string;
  data?: any;
}

class HousingAPITester {
  private client: AxiosInstance;
  private token: string = '';
  private results: TestResult[] = [];
  private testData = {
    listingId: 0,
    bookingId: 0,
    userId: 0
  };

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE,
      validateStatus: () => true // Don't throw on any status
    });
  }

  private log(message: string, type: 'info' | 'success' | 'error' | 'warn' = 'info') {
    const colors = {
      info: '\x1b[36m',    // Cyan
      success: '\x1b[32m', // Green
      error: '\x1b[31m',   // Red
      warn: '\x1b[33m'     // Yellow
    };
    const reset = '\x1b[0m';
    console.log(`${colors[type]}${message}${reset}`);
  }

  private addResult(endpoint: string, method: string, status: 'PASS' | 'FAIL', statusCode: number, message: string, data?: any) {
    this.results.push({ endpoint, method, status, statusCode, message, data });
    const statusSymbol = status === 'PASS' ? '✓' : '✗';
    const logType = status === 'PASS' ? 'success' : 'error';
    this.log(`${statusSymbol} ${method} ${endpoint} - ${statusCode} - ${message}`, logType);
  }

  async setup() {
    this.log('\n========================================', 'info');
    this.log('🏠 Housing API Test Suite Starting...', 'info');
    this.log('========================================\n', 'info');

    // Register test user
    this.log('Setting up test user...', 'info');
    try {
      const registerRes = await this.client.post('/api/auth/register', {
        name: `Housing Test User ${UNIQUE_ID}`,
        username: `housingtest${UNIQUE_ID}`,
        email: `housingtest${UNIQUE_ID}@example.com`,
        password: TEST_USER_PASSWORD
      });

      if (registerRes.status === 201 || registerRes.status === 200) {
        this.token = registerRes.data.accessToken;
        this.testData.userId = registerRes.data.user?.id;
        this.log('✓ Test user created successfully', 'success');
      } else if (registerRes.status === 400 && registerRes.data.message?.includes('already exists')) {
        // Try to login instead
        const loginRes = await this.client.post('/api/auth/login', {
          email: `housingtest${UNIQUE_ID}@example.com`,
          password: TEST_USER_PASSWORD
        });
        this.token = loginRes.data.accessToken;
        this.testData.userId = loginRes.data.user?.id;
        this.log('✓ Logged in with existing user', 'success');
      } else {
        throw new Error(`Failed to setup user: ${registerRes.status}`);
      }

      this.client.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
      this.log(`User ID: ${this.testData.userId}\n`, 'info');
    } catch (error: any) {
      this.log(`✗ Setup failed: ${error.message}`, 'error');
      throw error;
    }
  }

  // ============================================================================
  // LISTINGS MANAGEMENT TESTS
  // ============================================================================

  async testCreateListing() {
    this.log('\n--- Testing: Create Listing ---', 'info');
    const listing = {
      title: `Cozy Tango Apartment ${UNIQUE_ID}`,
      description: 'Beautiful apartment in the heart of Buenos Aires, perfect for tango dancers',
      propertyType: 'apartment',
      bedrooms: 2,
      bathrooms: 1,
      maxGuests: 4,
      pricePerNight: 100,
      currency: 'USD',
      address: '123 Tango Street',
      city: 'Buenos Aires',
      country: 'Argentina',
      latitude: '-34.6037',
      longitude: '-58.3816',
      amenities: ['wifi', 'kitchen', 'air_conditioning'],
      houseRules: ['No smoking', 'No parties'],
      images: ['https://example.com/image1.jpg']
    };

    const res = await this.client.post('/api/housing/listings', listing);
    
    if (res.status === 201 && res.data.id) {
      this.testData.listingId = res.data.id;
      this.addResult('/api/housing/listings', 'POST', 'PASS', res.status, 'Listing created successfully', res.data);
    } else {
      this.addResult('/api/housing/listings', 'POST', 'FAIL', res.status, `Failed: ${res.data.message}`);
    }
  }

  async testGetAllListings() {
    this.log('\n--- Testing: Get All Listings ---', 'info');
    const res = await this.client.get('/api/housing/listings');
    
    if (res.status === 200 && Array.isArray(res.data)) {
      const foundOurListing = res.data.some((item: any) => item.listing?.id === this.testData.listingId);
      if (foundOurListing) {
        this.addResult('/api/housing/listings', 'GET', 'PASS', res.status, `Found ${res.data.length} listings including our test listing`);
      } else {
        this.addResult('/api/housing/listings', 'GET', 'FAIL', res.status, 'Our test listing not found in results');
      }
    } else {
      this.addResult('/api/housing/listings', 'GET', 'FAIL', res.status, 'Invalid response format');
    }
  }

  async testGetListingById() {
    this.log('\n--- Testing: Get Listing by ID ---', 'info');
    const res = await this.client.get(`/api/housing/listings/${this.testData.listingId}`);
    
    if (res.status === 200 && res.data.listing?.id === this.testData.listingId) {
      this.addResult(`/api/housing/listings/${this.testData.listingId}`, 'GET', 'PASS', res.status, 'Listing retrieved successfully');
    } else if (res.status === 404) {
      this.addResult(`/api/housing/listings/${this.testData.listingId}`, 'GET', 'FAIL', res.status, 'Listing not found');
    } else {
      this.addResult(`/api/housing/listings/${this.testData.listingId}`, 'GET', 'FAIL', res.status, 'Unexpected response');
    }
  }

  async testUpdateListing() {
    this.log('\n--- Testing: Update Listing ---', 'info');
    const updates = {
      title: `Updated Tango Apartment ${UNIQUE_ID}`,
      pricePerNight: 120
    };

    const res = await this.client.patch(`/api/housing/listings/${this.testData.listingId}`, updates);
    
    if (res.status === 200 && res.data.title === updates.title) {
      this.addResult(`/api/housing/listings/${this.testData.listingId}`, 'PATCH', 'PASS', res.status, 'Listing updated successfully');
    } else if (res.status === 403) {
      this.addResult(`/api/housing/listings/${this.testData.listingId}`, 'PATCH', 'FAIL', res.status, 'Authorization failed');
    } else {
      this.addResult(`/api/housing/listings/${this.testData.listingId}`, 'PATCH', 'FAIL', res.status, `Update failed: ${res.data.message}`);
    }
  }

  // ============================================================================
  // SEARCH & FILTER TESTS
  // ============================================================================

  async testFilterByCity() {
    this.log('\n--- Testing: Filter by City ---', 'info');
    const res = await this.client.get('/api/housing/listings?city=Buenos Aires');
    
    if (res.status === 200 && Array.isArray(res.data)) {
      const allMatchCity = res.data.every((item: any) => item.listing?.city === 'Buenos Aires');
      if (allMatchCity || res.data.length === 0) {
        this.addResult('/api/housing/listings?city=Buenos Aires', 'GET', 'PASS', res.status, `Found ${res.data.length} listings in Buenos Aires`);
      } else {
        this.addResult('/api/housing/listings?city=Buenos Aires', 'GET', 'FAIL', res.status, 'Some listings do not match city filter');
      }
    } else {
      this.addResult('/api/housing/listings?city=Buenos Aires', 'GET', 'FAIL', res.status, 'Invalid response');
    }
  }

  async testFilterByPrice() {
    this.log('\n--- Testing: Filter by Price Range ---', 'info');
    const res = await this.client.get('/api/housing/listings?minPrice=50&maxPrice=200');
    
    if (res.status === 200 && Array.isArray(res.data)) {
      const allInRange = res.data.every((item: any) => {
        const price = item.listing?.pricePerNight;
        return price >= 50 && price <= 200;
      });
      if (allInRange || res.data.length === 0) {
        this.addResult('/api/housing/listings?minPrice=50&maxPrice=200', 'GET', 'PASS', res.status, `Found ${res.data.length} listings in price range`);
      } else {
        this.addResult('/api/housing/listings?minPrice=50&maxPrice=200', 'GET', 'FAIL', res.status, 'Some listings outside price range');
      }
    } else {
      this.addResult('/api/housing/listings?minPrice=50&maxPrice=200', 'GET', 'FAIL', res.status, 'Invalid response');
    }
  }

  async testFilterByPropertyType() {
    this.log('\n--- Testing: Filter by Property Type ---', 'info');
    const res = await this.client.get('/api/housing/listings?propertyType=apartment');
    
    if (res.status === 200 && Array.isArray(res.data)) {
      const allMatch = res.data.every((item: any) => item.listing?.propertyType === 'apartment');
      if (allMatch || res.data.length === 0) {
        this.addResult('/api/housing/listings?propertyType=apartment', 'GET', 'PASS', res.status, `Found ${res.data.length} apartments`);
      } else {
        this.addResult('/api/housing/listings?propertyType=apartment', 'GET', 'FAIL', res.status, 'Some listings are not apartments');
      }
    } else {
      this.addResult('/api/housing/listings?propertyType=apartment', 'GET', 'FAIL', res.status, 'Invalid response');
    }
  }

  // ============================================================================
  // BOOKINGS SYSTEM TESTS
  // ============================================================================

  async testCreateBooking() {
    this.log('\n--- Testing: Create Booking ---', 'info');
    const booking = {
      listingId: this.testData.listingId,
      checkInDate: '2025-12-01',
      checkOutDate: '2025-12-07',
      guests: 2,
      totalAmount: 600
    };

    const res = await this.client.post('/api/housing/bookings', booking);
    
    if (res.status === 201 && res.data.id) {
      this.testData.bookingId = res.data.id;
      this.addResult('/api/housing/bookings', 'POST', 'PASS', res.status, 'Booking created successfully', res.data);
    } else if (res.status === 409) {
      this.addResult('/api/housing/bookings', 'POST', 'FAIL', res.status, 'Date conflict detected');
    } else {
      this.addResult('/api/housing/bookings', 'POST', 'FAIL', res.status, `Failed: ${res.data.message}`);
    }
  }

  async testGetUserBookings() {
    this.log('\n--- Testing: Get User Bookings ---', 'info');
    const res = await this.client.get('/api/housing/bookings');
    
    if (res.status === 200 && Array.isArray(res.data)) {
      const foundOurBooking = res.data.some((item: any) => item.booking?.id === this.testData.bookingId);
      if (foundOurBooking) {
        this.addResult('/api/housing/bookings', 'GET', 'PASS', res.status, `Found ${res.data.length} bookings including our test booking`);
      } else {
        this.addResult('/api/housing/bookings', 'GET', 'FAIL', res.status, 'Our test booking not found');
      }
    } else if (res.status === 401) {
      this.addResult('/api/housing/bookings', 'GET', 'FAIL', res.status, 'Authentication required');
    } else {
      this.addResult('/api/housing/bookings', 'GET', 'FAIL', res.status, 'Invalid response');
    }
  }

  async testUpdateBookingStatus() {
    this.log('\n--- Testing: Update Booking Status ---', 'info');
    const res = await this.client.patch(`/api/housing/bookings/${this.testData.bookingId}/status`, {
      status: 'confirmed'
    });
    
    if (res.status === 200 && res.data.status === 'confirmed') {
      this.addResult(`/api/housing/bookings/${this.testData.bookingId}/status`, 'PATCH', 'PASS', res.status, 'Booking status updated successfully');
    } else if (res.status === 403) {
      this.addResult(`/api/housing/bookings/${this.testData.bookingId}/status`, 'PATCH', 'FAIL', res.status, 'Not authorized (expected - guest cannot confirm)');
    } else {
      this.addResult(`/api/housing/bookings/${this.testData.bookingId}/status`, 'PATCH', 'FAIL', res.status, `Failed: ${res.data.message}`);
    }
  }

  // ============================================================================
  // REVIEWS SYSTEM TESTS
  // ============================================================================

  async testGetListingReviews() {
    this.log('\n--- Testing: Get Listing Reviews ---', 'info');
    const res = await this.client.get(`/api/housing/listings/${this.testData.listingId}/reviews`);
    
    if (res.status === 200 && Array.isArray(res.data)) {
      this.addResult(`/api/housing/listings/${this.testData.listingId}/reviews`, 'GET', 'PASS', res.status, `Found ${res.data.length} reviews`);
    } else {
      this.addResult(`/api/housing/listings/${this.testData.listingId}/reviews`, 'GET', 'FAIL', res.status, 'Invalid response');
    }
  }

  async testCreateReview() {
    this.log('\n--- Testing: Create Review ---', 'info');
    // First, update booking to completed status (needed to leave review)
    await this.client.patch(`/api/housing/bookings/${this.testData.bookingId}/status`, {
      status: 'completed'
    });

    const review = {
      rating: 5,
      review: 'Amazing apartment for tango dancers! Highly recommended.'
    };

    const res = await this.client.post(`/api/housing/listings/${this.testData.listingId}/reviews`, review);
    
    if (res.status === 201) {
      this.addResult(`/api/housing/listings/${this.testData.listingId}/reviews`, 'POST', 'PASS', res.status, 'Review created successfully');
    } else if (res.status === 403) {
      this.addResult(`/api/housing/listings/${this.testData.listingId}/reviews`, 'POST', 'FAIL', res.status, 'Must complete booking first (expected if booking not completed)');
    } else if (res.status === 409) {
      this.addResult(`/api/housing/listings/${this.testData.listingId}/reviews`, 'POST', 'FAIL', res.status, 'Already reviewed this listing');
    } else {
      this.addResult(`/api/housing/listings/${this.testData.listingId}/reviews`, 'POST', 'FAIL', res.status, `Failed: ${res.data.message}`);
    }
  }

  // ============================================================================
  // FAVORITES SYSTEM TESTS
  // ============================================================================

  async testAddToFavorites() {
    this.log('\n--- Testing: Add to Favorites ---', 'info');
    const res = await this.client.post(`/api/housing/favorites/${this.testData.listingId}`);
    
    if (res.status === 201) {
      this.addResult(`/api/housing/favorites/${this.testData.listingId}`, 'POST', 'PASS', res.status, 'Added to favorites successfully');
    } else if (res.status === 409) {
      this.addResult(`/api/housing/favorites/${this.testData.listingId}`, 'POST', 'FAIL', res.status, 'Already in favorites');
    } else {
      this.addResult(`/api/housing/favorites/${this.testData.listingId}`, 'POST', 'FAIL', res.status, `Failed: ${res.data.message}`);
    }
  }

  async testGetFavorites() {
    this.log('\n--- Testing: Get User Favorites ---', 'info');
    const res = await this.client.get('/api/housing/favorites');
    
    if (res.status === 200 && Array.isArray(res.data)) {
      const foundOurListing = res.data.some((item: any) => item.listing?.id === this.testData.listingId);
      if (foundOurListing) {
        this.addResult('/api/housing/favorites', 'GET', 'PASS', res.status, `Found ${res.data.length} favorites including our test listing`);
      } else {
        this.addResult('/api/housing/favorites', 'GET', 'FAIL', res.status, 'Our test listing not in favorites');
      }
    } else {
      this.addResult('/api/housing/favorites', 'GET', 'FAIL', res.status, 'Invalid response');
    }
  }

  async testRemoveFromFavorites() {
    this.log('\n--- Testing: Remove from Favorites ---', 'info');
    const res = await this.client.delete(`/api/housing/favorites/${this.testData.listingId}`);
    
    if (res.status === 200) {
      this.addResult(`/api/housing/favorites/${this.testData.listingId}`, 'DELETE', 'PASS', res.status, 'Removed from favorites successfully');
    } else {
      this.addResult(`/api/housing/favorites/${this.testData.listingId}`, 'DELETE', 'FAIL', res.status, `Failed: ${res.data.message}`);
    }
  }

  // ============================================================================
  // CLEANUP
  // ============================================================================

  async testDeleteListing() {
    this.log('\n--- Testing: Delete Listing ---', 'info');
    const res = await this.client.delete(`/api/housing/listings/${this.testData.listingId}`);
    
    if (res.status === 200) {
      this.addResult(`/api/housing/listings/${this.testData.listingId}`, 'DELETE', 'PASS', res.status, 'Listing deleted successfully');
    } else if (res.status === 403) {
      this.addResult(`/api/housing/listings/${this.testData.listingId}`, 'DELETE', 'FAIL', res.status, 'Not authorized');
    } else {
      this.addResult(`/api/housing/listings/${this.testData.listingId}`, 'DELETE', 'FAIL', res.status, `Failed: ${res.data.message}`);
    }
  }

  // ============================================================================
  // TEST RUNNER
  // ============================================================================

  async runAllTests() {
    try {
      await this.setup();

      // Listings Management
      this.log('\n═══════════════════════════════════════', 'info');
      this.log('📋 LISTINGS MANAGEMENT TESTS', 'info');
      this.log('═══════════════════════════════════════', 'info');
      await this.testCreateListing();
      await this.testGetAllListings();
      await this.testGetListingById();
      await this.testUpdateListing();

      // Search & Filters
      this.log('\n═══════════════════════════════════════', 'info');
      this.log('🔍 SEARCH & FILTER TESTS', 'info');
      this.log('═══════════════════════════════════════', 'info');
      await this.testFilterByCity();
      await this.testFilterByPrice();
      await this.testFilterByPropertyType();

      // Bookings System
      this.log('\n═══════════════════════════════════════', 'info');
      this.log('📅 BOOKINGS SYSTEM TESTS', 'info');
      this.log('═══════════════════════════════════════', 'info');
      await this.testCreateBooking();
      await this.testGetUserBookings();
      await this.testUpdateBookingStatus();

      // Reviews System
      this.log('\n═══════════════════════════════════════', 'info');
      this.log('⭐ REVIEWS SYSTEM TESTS', 'info');
      this.log('═══════════════════════════════════════', 'info');
      await this.testGetListingReviews();
      await this.testCreateReview();

      // Favorites System
      this.log('\n═══════════════════════════════════════', 'info');
      this.log('❤️ FAVORITES SYSTEM TESTS', 'info');
      this.log('═══════════════════════════════════════', 'info');
      await this.testAddToFavorites();
      await this.testGetFavorites();
      await this.testRemoveFromFavorites();

      // Cleanup
      this.log('\n═══════════════════════════════════════', 'info');
      this.log('🧹 CLEANUP', 'info');
      this.log('═══════════════════════════════════════', 'info');
      await this.testDeleteListing();

      this.printSummary();
    } catch (error: any) {
      this.log(`\n❌ Test suite failed: ${error.message}`, 'error');
      process.exit(1);
    }
  }

  printSummary() {
    this.log('\n\n═══════════════════════════════════════', 'info');
    this.log('📊 TEST SUMMARY', 'info');
    this.log('═══════════════════════════════════════\n', 'info');

    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    const total = this.results.length;

    this.log(`Total Tests: ${total}`, 'info');
    this.log(`Passed: ${passed}`, 'success');
    this.log(`Failed: ${failed}`, failed > 0 ? 'error' : 'success');
    this.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%\n`, failed > 0 ? 'warn' : 'success');

    if (failed > 0) {
      this.log('Failed Tests:', 'error');
      this.results
        .filter(r => r.status === 'FAIL')
        .forEach(r => {
          this.log(`  ✗ ${r.method} ${r.endpoint} - ${r.message}`, 'error');
        });
      this.log('', 'info');
    }

    this.log('Endpoints Tested:', 'info');
    const uniqueEndpoints = new Set(this.results.map(r => `${r.method} ${r.endpoint}`));
    uniqueEndpoints.forEach(endpoint => {
      this.log(`  • ${endpoint}`, 'info');
    });

    this.log('\n═══════════════════════════════════════\n', 'info');

    if (failed > 0) {
      this.log('⚠️  Some tests failed. Please review the errors above.', 'warn');
      process.exit(1);
    } else {
      this.log('✅ All tests passed successfully!', 'success');
      process.exit(0);
    }
  }
}

// Run the tests
const tester = new HousingAPITester();
tester.runAllTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
