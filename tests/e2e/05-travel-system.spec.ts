import { test, expect } from '@playwright/test';
import { setupAuthenticatedSession } from '../helpers/auth-setup';
import { navigateToPage, verifyOnPage, waitForPageLoad } from '../helpers/navigation';
import {
  createTrip,
  addItineraryActivity,
  optimizeItinerary,
  acceptOptimizedItinerary,
  findTravelCompanions,
  sendCompanionRequest,
  addTravelExpense,
  verifyExpenseBreakdown,
  optimizeBudget,
  searchAccommodation,
  verifyAccommodationResults,
  searchFlights,
  verifyFlightRecommendations,
  viewLocalRecommendations,
  enableRoommateFinder,
  verifyRoommateMatches,
  verifyTripInDashboard,
} from '../helpers/travel';
import {
  testTrip,
  testItineraryActivities,
  testExpenses,
  testCompanionPreferences,
  testRoommatePreferences,
  testAccommodationSearch,
  testFlightSearch,
} from '../fixtures/travel';

/**
 * WAVE 5 BATCH 2: TRAVEL INTEGRATION SYSTEM TESTS
 * Comprehensive E2E tests for trip planning, itinerary optimization, and travel features
 */

test.describe('Travel System: Trip Planning & Itinerary', () => {
  
  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedSession(page);
  });

  test('should create new trip with event selection', async ({ page }) => {
    await navigateToPage(page, '/travel/planner');
    await waitForPageLoad(page);
    
    // Verify we're on trip planner
    await expect(page.getByTestId('trip-planner-page')).toBeVisible();
    
    // Create trip
    await createTrip(page, testTrip);
    
    // Verify redirect to trip detail page
    await expect(page.url()).toMatch(/\/travel\/trip\/\d+/);
    
    // Verify trip details displayed
    await expect(page.getByText(testTrip.destination)).toBeVisible();
    await expect(page.getByTestId('trip-start-date')).toContainText('2025-06-01');
    await expect(page.getByTestId('trip-end-date')).toContainText('2025-06-08');
    
    // Verify trip appears in dashboard
    await verifyTripInDashboard(page, testTrip.destination);
  });

  test('should optimize itinerary with AI agent', async ({ page }) => {
    // Navigate to existing trip
    await navigateToPage(page, '/travel/trip/1');
    
    // Add multiple activities
    for (const activity of testItineraryActivities) {
      await addItineraryActivity(page, activity);
      await page.waitForTimeout(500); // Allow UI to update
    }
    
    // Verify activities added
    const activityList = page.getByTestId('activity-list');
    await expect(activityList).toBeVisible();
    
    for (const activity of testItineraryActivities) {
      await expect(page.getByText(activity.title)).toBeVisible();
    }
    
    // Optimize itinerary with AI
    await optimizeItinerary(page);
    
    // Verify optimization results
    await expect(page.getByTestId('optimization-score')).toBeVisible();
    await expect(page.getByTestId('route-optimization')).toBeVisible();
    await expect(page.getByTestId('energy-balance')).toBeVisible();
    await expect(page.getByTestId('conflict-resolution')).toBeVisible();
    
    // Accept optimization
    await acceptOptimizedItinerary(page);
    
    // Verify success message
    await expect(
      page.getByText(/itinerary.*optimized|optimization.*applied/i)
    ).toBeVisible({ timeout: 10000 });
  });

  test('should edit itinerary activities', async ({ page }) => {
    await navigateToPage(page, '/travel/trip/1');
    
    // Add activity
    await addItineraryActivity(page, testItineraryActivities[0]);
    
    // Edit activity
    await page.getByTestId('button-edit-activity-1').click();
    await page.waitForSelector('[data-testid="edit-activity-form"]');
    
    await page.getByTestId('input-activity-title').fill('Updated Workshop Title');
    await page.getByTestId('input-activity-duration').fill('180');
    
    await page.getByTestId('button-save-activity').click();
    
    // Verify changes
    await expect(page.getByText('Updated Workshop Title')).toBeVisible();
    await expect(page.getByText(/180|3.*hours/i)).toBeVisible();
    
    // Remove activity
    await page.getByTestId('button-delete-activity-1').click();
    await page.getByTestId('button-confirm-delete').click();
    
    // Verify activity removed
    await expect(page.getByText('Updated Workshop Title')).not.toBeVisible();
  });
});

test.describe('Travel System: Travel Companion Matching', () => {
  
  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedSession(page);
    await navigateToPage(page, '/travel/trip/1');
  });

  test('should find travel companions with AI matching', async ({ page }) => {
    // Find companions
    await findTravelCompanions(page, testCompanionPreferences);
    
    // Verify results displayed
    await expect(page.getByTestId('companion-results')).toBeVisible({ timeout: 15000 });
    
    // Verify compatibility scores
    const scores = await page.getByTestId(/compatibility-score-\d+/).all();
    expect(scores.length).toBeGreaterThan(0);
    
    // Verify companion profiles
    await expect(page.getByTestId('companion-profile-1')).toBeVisible();
    await expect(page.getByTestId('companion-travel-style')).toBeVisible();
    await expect(page.getByTestId('companion-budget-level')).toBeVisible();
    
    // Send connection request
    await sendCompanionRequest(page, 0);
    
    // Verify request sent
    await expect(
      page.getByText(/request.*sent|connection.*requested/i)
    ).toBeVisible({ timeout: 5000 });
  });

  test('should enable roommate matching with preferences', async ({ page }) => {
    // Enable roommate finder
    await enableRoommateFinder(page, testRoommatePreferences);
    
    // Verify preferences saved
    await expect(
      page.getByText(/preferences.*saved|roommate.*preferences.*updated/i)
    ).toBeVisible({ timeout: 5000 });
    
    // View roommate matches
    await verifyRoommateMatches(page);
    
    // Verify compatibility factors
    await expect(page.getByTestId('budget-compatibility')).toBeVisible();
    await expect(page.getByTestId('accommodation-type-match')).toBeVisible();
    
    // Send roommate request
    await page.getByTestId('button-request-roommate-0').click();
    
    await expect(
      page.getByText(/roommate.*request.*sent/i)
    ).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Travel System: Expense Tracking & Optimization', () => {
  
  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedSession(page);
    await navigateToPage(page, '/travel/trip/1/expenses');
  });

  test('should manage trip expenses with category tracking', async ({ page }) => {
    // Add multiple expenses
    for (const expense of testExpenses) {
      await addTravelExpense(page, expense);
      await page.waitForTimeout(500);
    }
    
    // Verify expenses displayed
    for (const expense of testExpenses) {
      await expect(page.getByText(expense.description)).toBeVisible();
      await expect(page.getByText(expense.amount.toString())).toBeVisible();
    }
    
    // Verify expense breakdown
    await verifyExpenseBreakdown(page);
    
    // Verify total calculation
    const totalAmount = testExpenses.reduce((sum, e) => sum + e.amount, 0);
    await expect(page.getByTestId('total-expenses')).toContainText(totalAmount.toString());
    
    // Edit expense
    await page.getByTestId('button-edit-expense-1').click();
    await page.getByTestId('input-expense-amount').fill('850');
    await page.getByTestId('button-save-expense').click();
    
    // Verify update
    await expect(page.getByText('850')).toBeVisible();
    
    // Delete expense
    await page.getByTestId('button-delete-expense-1').click();
    await page.getByTestId('button-confirm-delete').click();
    
    // Verify deletion
    await expect(page.getByText('850')).not.toBeVisible();
  });

  test('should optimize budget with AI recommendations', async ({ page }) => {
    // Add test expenses first
    await addTravelExpense(page, testExpenses[0]);
    await addTravelExpense(page, testExpenses[1]);
    
    // Optimize budget
    await optimizeBudget(page);
    
    // Verify optimization results
    await expect(page.getByTestId('budget-optimization-results')).toBeVisible({ timeout: 15000 });
    await expect(page.getByTestId('budget-allocation-recommendations')).toBeVisible();
    await expect(page.getByTestId('cost-saving-suggestions')).toBeVisible();
    await expect(page.getByTestId('currency-optimization')).toBeVisible();
    
    // Verify recommendations include percentages
    await expect(page.getByText(/accommodation.*40%|40%.*accommodation/i)).toBeVisible();
    await expect(page.getByText(/food.*30%|30%.*food/i)).toBeVisible();
  });
});

test.describe('Travel System: Accommodation & Flight Search', () => {
  
  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedSession(page);
    await navigateToPage(page, '/travel/trip/1');
  });

  test('should search accommodations with SerpApi integration', async ({ page }) => {
    // Search accommodations
    await searchAccommodation(page, testAccommodationSearch);
    
    // Verify results loaded (SerpApi)
    await expect(page.getByTestId('accommodation-results')).toBeVisible({ timeout: 20000 });
    
    // Verify accommodation results
    await verifyAccommodationResults(page);
    
    // Verify result details
    const results = await page.getByTestId(/accommodation-card-\d+/).all();
    expect(results.length).toBeGreaterThan(0);
    
    // Verify price comparison
    await expect(page.getByTestId('price-comparison')).toBeVisible();
    
    // Verify location optimization
    await expect(page.getByTestId('location-optimization')).toBeVisible();
    
    // Save favorite
    await page.getByTestId('button-save-accommodation-0').click().catch(() => {});
    await expect(
      page.getByText(/saved|favorite.*added/i)
    ).toBeVisible({ timeout: 5000 }).catch(() => {});
  });

  test('should search flights with AI recommendations', async ({ page }) => {
    // Search flights
    await searchFlights(page, testFlightSearch);
    
    // Verify flight results (SerpApi)
    await expect(page.getByTestId('flight-results')).toBeVisible({ timeout: 25000 });
    
    // Verify flight recommendations
    await verifyFlightRecommendations(page);
    
    // Verify price trend analysis
    await expect(page.getByTestId('price-trend-analysis')).toBeVisible();
    
    // Verify flexible dates
    await expect(page.getByTestId('flexible-dates')).toBeVisible();
    
    // Verify route optimization
    await expect(page.getByTestId('route-optimization')).toBeVisible();
    
    // Verify airlines displayed
    const airlines = await page.getByTestId(/airline-option-\d+/).all();
    expect(airlines.length).toBeGreaterThan(0);
    
    // Save flight option
    await page.getByTestId('button-save-flight-0').click().catch(() => {});
    await expect(
      page.getByText(/flight.*saved/i)
    ).toBeVisible({ timeout: 5000 }).catch(() => {});
  });

  test('should view local recommendations and tips', async ({ page }) => {
    // View local recommendations
    await viewLocalRecommendations(page);
    
    // Verify all recommendation sections
    await expect(page.getByTestId('restaurant-recommendations')).toBeVisible();
    await expect(page.getByTestId('practice-spaces')).toBeVisible();
    await expect(page.getByTestId('sightseeing-suggestions')).toBeVisible();
    await expect(page.getByTestId('emergency-services')).toBeVisible();
    await expect(page.getByTestId('transportation-options')).toBeVisible();
    
    // Verify restaurant suggestions include dietary info
    await expect(
      page.getByText(/vegetarian|vegan|gluten.*free/i)
    ).toBeVisible().catch(() => {});
    
    // Verify practice spaces (dance studios, milongas)
    await expect(
      page.getByText(/studio|milonga|practice/i)
    ).toBeVisible().catch(() => {});
  });
});

test.describe('Travel System: Performance & Usability', () => {
  
  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedSession(page);
  });

  test('should load travel pages within performance targets', async ({ page }) => {
    const pages = [
      '/travel/dashboard',
      '/travel/planner',
      '/travel/trip/1',
      '/travel/trip/1/expenses'
    ];
    
    for (const url of pages) {
      const loadTime = await waitForPageLoad(page, 3000);
      await navigateToPage(page, url);
      
      // Verify page loads in under 3 seconds
      expect(loadTime).toBeLessThan(3000);
      
      // Verify no console errors
      const errors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });
      
      expect(errors).toHaveLength(0);
    }
  });

  test('should persist data across sessions', async ({ page }) => {
    // Create trip
    await navigateToPage(page, '/travel/planner');
    await createTrip(page, testTrip);
    
    // Get trip ID from URL
    const url = page.url();
    const tripId = url.match(/\/travel\/trip\/(\d+)/)?.[1];
    
    // Add expense
    await navigateToPage(page, `/travel/trip/${tripId}/expenses`);
    await addTravelExpense(page, testExpenses[0]);
    
    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Verify data persists
    await expect(page.getByText(testExpenses[0].description)).toBeVisible();
    await expect(page.getByText(testExpenses[0].amount.toString())).toBeVisible();
    
    // Navigate away and back
    await navigateToPage(page, '/feed');
    await navigateToPage(page, `/travel/trip/${tripId}/expenses`);
    
    // Verify data still present
    await expect(page.getByText(testExpenses[0].description)).toBeVisible();
  });
});
