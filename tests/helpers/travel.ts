import { Page, expect } from '@playwright/test';

/**
 * Travel Integration Helper - Trip planning, itinerary optimization, expense tracking
 */

export async function createTrip(page: Page, tripData: {
  destination: string;
  startDate: string;
  endDate: string;
  eventId?: string;
}) {
  await page.getByTestId('button-create-trip').click();
  await page.waitForSelector('[data-testid="input-destination"]');
  
  await page.getByTestId('input-destination').fill(tripData.destination);
  await page.getByTestId('input-start-date').fill(tripData.startDate);
  await page.getByTestId('input-end-date').fill(tripData.endDate);
  
  if (tripData.eventId) {
    await page.getByTestId('select-event').click();
    await page.getByRole('option', { name: new RegExp(tripData.eventId) }).click();
  }
  
  const responsePromise = page.waitForResponse(
    response => response.url().includes('/api/travel/trips') && response.status() === 201
  );
  
  await page.getByTestId('button-submit-trip').click();
  await responsePromise;
  
  // Wait for redirect to trip detail page
  await page.waitForURL(/\/travel\/trip\/\d+/);
}

export async function addItineraryActivity(page: Page, activity: {
  title: string;
  type: 'workshop' | 'practice' | 'sightseeing' | 'meal' | 'travel';
  startTime: string;
  duration: number;
  location?: string;
}) {
  await page.getByTestId('button-add-activity').click();
  await page.waitForSelector('[data-testid="input-activity-title"]');
  
  await page.getByTestId('input-activity-title').fill(activity.title);
  await page.getByTestId('select-activity-type').click();
  await page.getByRole('option', { name: activity.type }).click();
  await page.getByTestId('input-activity-time').fill(activity.startTime);
  await page.getByTestId('input-activity-duration').fill(activity.duration.toString());
  
  if (activity.location) {
    await page.getByTestId('input-activity-location').fill(activity.location);
  }
  
  await page.getByTestId('button-save-activity').click();
  await page.waitForSelector('[data-testid="activity-list"]');
}

export async function optimizeItinerary(page: Page) {
  await page.getByTestId('button-optimize-itinerary').click();
  
  // Wait for AI processing
  await page.waitForSelector('[data-testid="ai-optimization-progress"]', { timeout: 30000 });
  await page.waitForSelector('[data-testid="optimized-schedule"]', { timeout: 30000 });
  
  // Verify optimization results
  await expect(page.getByTestId('optimization-score')).toBeVisible();
  await expect(page.getByTestId('route-optimization')).toBeVisible();
  await expect(page.getByTestId('energy-balance')).toBeVisible();
  await expect(page.getByTestId('conflict-resolution')).toBeVisible();
}

export async function acceptOptimizedItinerary(page: Page) {
  await page.getByTestId('button-accept-optimization').click();
  
  await page.waitForResponse(
    response => response.url().includes('/api/travel/itinerary/optimize') && response.status() === 200
  );
  
  // Verify success message
  await expect(page.getByText(/itinerary.*optimized|optimization.*applied/i)).toBeVisible();
}

export async function findTravelCompanions(page: Page, preferences?: {
  travelStyle?: string;
  budgetLevel?: string;
}) {
  await page.getByTestId('button-find-companions').click();
  await page.waitForSelector('[data-testid="companion-search-form"]');
  
  if (preferences?.travelStyle) {
    await page.getByTestId('select-travel-style').click();
    await page.getByRole('option', { name: preferences.travelStyle }).click();
  }
  
  if (preferences?.budgetLevel) {
    await page.getByTestId('select-budget-level').click();
    await page.getByRole('option', { name: preferences.budgetLevel }).click();
  }
  
  await page.getByTestId('button-search-companions').click();
  
  // Wait for AI matching results
  await page.waitForSelector('[data-testid="companion-results"]', { timeout: 15000 });
  
  // Verify compatibility scores displayed
  const scores = await page.getByTestId(/compatibility-score-\d+/).all();
  expect(scores.length).toBeGreaterThan(0);
}

export async function sendCompanionRequest(page: Page, companionIndex: number) {
  await page.getByTestId(`button-connect-companion-${companionIndex}`).click();
  
  await page.waitForResponse(
    response => response.url().includes('/api/travel/companions/request') && response.status() === 201
  );
  
  // Verify request sent notification
  await expect(page.getByText(/request.*sent|connection.*requested/i)).toBeVisible();
}

export async function addTravelExpense(page: Page, expense: {
  category: 'accommodation' | 'food' | 'activities' | 'transport' | 'other';
  amount: number;
  currency?: string;
  description?: string;
  receiptPath?: string;
}) {
  await page.getByTestId('button-add-expense').click();
  await page.waitForSelector('[data-testid="expense-form"]');
  
  await page.getByTestId('select-expense-category').click();
  await page.getByRole('option', { name: expense.category }).click();
  
  await page.getByTestId('input-expense-amount').fill(expense.amount.toString());
  
  if (expense.currency) {
    await page.getByTestId('select-currency').click();
    await page.getByRole('option', { name: expense.currency }).click();
  }
  
  if (expense.description) {
    await page.getByTestId('input-expense-description').fill(expense.description);
  }
  
  if (expense.receiptPath) {
    await page.getByTestId('input-receipt-upload').setInputFiles(expense.receiptPath);
  }
  
  await page.getByTestId('button-save-expense').click();
  
  await page.waitForResponse(
    response => response.url().includes('/api/travel/expenses') && response.status() === 201
  );
}

export async function verifyExpenseBreakdown(page: Page) {
  await expect(page.getByTestId('expense-category-chart')).toBeVisible();
  await expect(page.getByTestId('total-expenses')).toBeVisible();
  
  // Verify all expense categories are shown
  const categories = ['accommodation', 'food', 'activities', 'transport'];
  for (const category of categories) {
    await expect(page.getByTestId(`expense-category-${category}`)).toBeVisible();
  }
}

export async function optimizeBudget(page: Page) {
  await page.getByTestId('button-optimize-budget').click();
  
  // Wait for AI budget analysis
  await page.waitForSelector('[data-testid="budget-optimization-results"]', { timeout: 15000 });
  
  // Verify optimization recommendations
  await expect(page.getByTestId('budget-allocation-recommendations')).toBeVisible();
  await expect(page.getByTestId('cost-saving-suggestions')).toBeVisible();
  await expect(page.getByTestId('currency-optimization')).toBeVisible();
}

export async function searchAccommodation(page: Page, preferences: {
  priceRange?: { min: number; max: number };
  location?: string;
  amenities?: string[];
}) {
  await page.getByTestId('button-find-accommodation').click();
  await page.waitForSelector('[data-testid="accommodation-search-form"]');
  
  if (preferences.priceRange) {
    await page.getByTestId('input-price-min').fill(preferences.priceRange.min.toString());
    await page.getByTestId('input-price-max').fill(preferences.priceRange.max.toString());
  }
  
  if (preferences.location) {
    await page.getByTestId('input-accommodation-location').fill(preferences.location);
  }
  
  if (preferences.amenities && preferences.amenities.length > 0) {
    for (const amenity of preferences.amenities) {
      await page.getByTestId(`checkbox-amenity-${amenity}`).check();
    }
  }
  
  await page.getByTestId('button-search-accommodation').click();
  
  // Wait for SerpApi results
  await page.waitForSelector('[data-testid="accommodation-results"]', { timeout: 20000 });
}

export async function verifyAccommodationResults(page: Page) {
  const results = await page.getByTestId(/accommodation-card-\d+/).all();
  expect(results.length).toBeGreaterThan(0);
  
  // Verify price comparison is shown
  await expect(page.getByTestId('price-comparison')).toBeVisible();
  
  // Verify location optimization
  await expect(page.getByTestId('location-optimization')).toBeVisible();
}

export async function searchFlights(page: Page, searchData: {
  departure: string;
  arrival: string;
  departureDate: string;
  returnDate?: string;
}) {
  await page.getByTestId('button-find-flights').click();
  await page.waitForSelector('[data-testid="flight-search-form"]');
  
  await page.getByTestId('input-departure-city').fill(searchData.departure);
  await page.getByTestId('input-arrival-city').fill(searchData.arrival);
  await page.getByTestId('input-departure-date').fill(searchData.departureDate);
  
  if (searchData.returnDate) {
    await page.getByTestId('input-return-date').fill(searchData.returnDate);
  }
  
  await page.getByTestId('button-search-flights').click();
  
  // Wait for SerpApi flight search
  await page.waitForSelector('[data-testid="flight-results"]', { timeout: 25000 });
}

export async function verifyFlightRecommendations(page: Page) {
  // Verify price trend analysis
  await expect(page.getByTestId('price-trend-analysis')).toBeVisible();
  
  // Verify flexible date suggestions
  await expect(page.getByTestId('flexible-dates')).toBeVisible();
  
  // Verify route optimization
  await expect(page.getByTestId('route-optimization')).toBeVisible();
  
  // Verify airline comparison
  const airlines = await page.getByTestId(/airline-option-\d+/).all();
  expect(airlines.length).toBeGreaterThan(0);
}

export async function viewLocalRecommendations(page: Page) {
  await page.getByTestId('tab-local-tips').click();
  
  // Verify local recommendations sections
  await expect(page.getByTestId('restaurant-recommendations')).toBeVisible();
  await expect(page.getByTestId('practice-spaces')).toBeVisible();
  await expect(page.getByTestId('sightseeing-suggestions')).toBeVisible();
  await expect(page.getByTestId('emergency-services')).toBeVisible();
  await expect(page.getByTestId('transportation-options')).toBeVisible();
}

export async function enableRoommateFinder(page: Page, preferences: {
  gender?: string;
  smoking?: boolean;
  noiseLevel?: string;
}) {
  await page.getByTestId('checkbox-looking-for-roommate').check();
  
  await page.waitForSelector('[data-testid="roommate-preferences-form"]');
  
  if (preferences.gender) {
    await page.getByTestId('select-roommate-gender').click();
    await page.getByRole('option', { name: preferences.gender }).click();
  }
  
  if (preferences.smoking !== undefined) {
    if (preferences.smoking) {
      await page.getByTestId('radio-smoking-yes').check();
    } else {
      await page.getByTestId('radio-smoking-no').check();
    }
  }
  
  if (preferences.noiseLevel) {
    await page.getByTestId('select-noise-level').click();
    await page.getByRole('option', { name: preferences.noiseLevel }).click();
  }
  
  await page.getByTestId('button-save-roommate-preferences').click();
  
  await page.waitForResponse(
    response => response.url().includes('/api/travel/roommate/preferences') && response.status() === 200
  );
}

export async function verifyRoommateMatches(page: Page) {
  await page.waitForSelector('[data-testid="roommate-matches"]', { timeout: 15000 });
  
  const matches = await page.getByTestId(/roommate-match-\d+/).all();
  expect(matches.length).toBeGreaterThan(0);
  
  // Verify compatibility factors displayed
  await expect(page.getByTestId('budget-compatibility')).toBeVisible();
  await expect(page.getByTestId('accommodation-type-match')).toBeVisible();
}

export async function verifyTripInDashboard(page: Page, tripDestination: string) {
  await page.goto('/travel/dashboard');
  await page.waitForLoadState('networkidle');
  
  // Verify trip appears in list
  await expect(
    page.getByText(new RegExp(tripDestination, 'i'))
  ).toBeVisible();
}
