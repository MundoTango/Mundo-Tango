/**
 * HousingPageAgent - Specialized agent for Housing/Accommodation functionality
 * 
 * MB.MD Level 3: Complete specification of Housing system
 */

import { BasePageAgent, ElementLocation } from './BasePageAgent';
import { BaseFeatureAgent, FeaturePRD, TestableBehavior } from './BaseFeatureAgent';

class ListingSearchFeatureAgent extends BaseFeatureAgent {
  constructor() {
    super('listing-search', 'Listing Search', 'housing-page');
  }

  initializePRD(): FeaturePRD {
    return {
      featureId: 'listing-search',
      featureName: 'Housing Listing Search',
      description: 'Search and filter housing listings by location, dates, price, amenities, and tango-specific features.',
      expectedBehaviors: [
        { id: 'test-search-page', description: 'Search page loads', priority: 'critical', expectedOutcome: 'Search form and results visible', steps: [
          { action: 'navigate', value: '/housing', description: 'Navigate to housing' },
          { action: 'wait', timeout: 2000, description: 'Wait for load' },
          { action: 'assert', target: '[data-testid="housing-search"]', value: 'visible', description: 'Search visible' },
        ]},
        { id: 'test-location-filter', description: 'Location filter works', priority: 'high', expectedOutcome: 'Results filtered by location', steps: [
          { action: 'navigate', value: '/housing', description: 'Navigate to housing' },
          { action: 'type', target: '[data-testid="location-input"]', value: 'Buenos Aires', description: 'Enter location' },
          { action: 'click', target: '[data-testid="search-button"]', description: 'Click search' },
          { action: 'wait', timeout: 2000, description: 'Wait for results' },
        ]},
        { id: 'test-date-filter', description: 'Date range filter works', priority: 'high', expectedOutcome: 'Results filtered by dates', steps: [
          { action: 'navigate', value: '/housing', description: 'Navigate to housing' },
          { action: 'click', target: '[data-testid="date-picker"]', description: 'Open date picker' },
          { action: 'assert', target: '[data-testid="calendar"]', value: 'visible', description: 'Calendar opens' },
        ]},
      ],
      dependencies: ['UnifiedLocationPicker', '/api/housing/listings'],
      apiEndpoints: [
        { endpoint: '/api/housing/listings', method: 'GET', description: 'Search listings' },
        { endpoint: '/api/housing/listings/featured', method: 'GET', description: 'Get featured listings' },
      ],
      uiElements: [
        { selector: '[data-testid="housing-search"]', description: 'Search container', testId: 'housing-search' },
        { selector: '[data-testid="location-input"]', description: 'Location input', testId: 'location-input' },
        { selector: '[data-testid="date-picker"]', description: 'Date range picker', testId: 'date-picker' },
        { selector: '[data-testid="search-button"]', description: 'Search button', testId: 'search-button' },
        { selector: '[data-testid="listings-grid"]', description: 'Results grid', testId: 'listings-grid' },
      ],
      knownIssues: [
        { pattern: 'geocoding fail', fix: 'Show error message and suggest manual coordinate entry', severity: 'medium' },
      ],
    };
  }
}

class ListingDetailFeatureAgent extends BaseFeatureAgent {
  constructor() {
    super('listing-detail', 'Listing Detail', 'housing-page');
  }

  initializePRD(): FeaturePRD {
    return {
      featureId: 'listing-detail',
      featureName: 'Listing Detail Page',
      description: 'Detailed view of a housing listing with photos, amenities, host info, reviews, and booking options.',
      expectedBehaviors: [
        { id: 'test-detail-load', description: 'Listing detail loads', priority: 'critical', expectedOutcome: 'Full listing info visible', steps: [
          { action: 'navigate', value: '/housing/:listingId', description: 'Navigate to listing' },
          { action: 'wait', timeout: 2000, description: 'Wait for load' },
          { action: 'assert', target: '[data-testid="listing-title"]', value: 'visible', description: 'Title visible' },
        ]},
        { id: 'test-photo-gallery', description: 'Photo gallery works', priority: 'high', expectedOutcome: 'Photos display in gallery', steps: [
          { action: 'navigate', value: '/housing/:listingId', description: 'Navigate to listing' },
          { action: 'click', target: '[data-testid="photo-gallery"]', description: 'Click gallery' },
          { action: 'assert', target: '[data-testid="lightbox"]', value: 'visible', description: 'Lightbox opens' },
        ]},
        { id: 'test-booking-widget', description: 'Booking widget visible', priority: 'critical', expectedOutcome: 'Book/inquire button active', steps: [
          { action: 'navigate', value: '/housing/:listingId', description: 'Navigate to listing' },
          { action: 'assert', target: '[data-testid="booking-widget"]', value: 'visible', description: 'Booking widget visible' },
        ]},
      ],
      dependencies: ['Cloudinary', 'Leaflet map', '/api/housing/listings/:id'],
      apiEndpoints: [
        { endpoint: '/api/housing/listings/:id', method: 'GET', description: 'Get listing details' },
        { endpoint: '/api/housing/listings/:id/reviews', method: 'GET', description: 'Get listing reviews' },
      ],
      uiElements: [
        { selector: '[data-testid="listing-title"]', description: 'Listing title', testId: 'listing-title' },
        { selector: '[data-testid="photo-gallery"]', description: 'Photo gallery', testId: 'photo-gallery' },
        { selector: '[data-testid="amenities-list"]', description: 'Amenities list', testId: 'amenities-list' },
        { selector: '[data-testid="booking-widget"]', description: 'Booking widget', testId: 'booking-widget' },
        { selector: '[data-testid="host-info"]', description: 'Host information', testId: 'host-info' },
      ],
      knownIssues: [],
    };
  }
}

class CreateListingFeatureAgent extends BaseFeatureAgent {
  constructor() {
    super('create-listing', 'Create Listing', 'housing-page');
  }

  initializePRD(): FeaturePRD {
    return {
      featureId: 'create-listing',
      featureName: 'Create Listing Form',
      description: 'Multi-step form for hosts to create new housing listings with photos, pricing, and availability.',
      expectedBehaviors: [
        { id: 'test-create-form', description: 'Create form loads', priority: 'critical', expectedOutcome: 'Form wizard visible', steps: [
          { action: 'navigate', value: '/housing/create', description: 'Navigate to create listing' },
          { action: 'assert', target: '[data-testid="listing-form"]', value: 'visible', description: 'Form visible' },
        ]},
        { id: 'test-photo-upload', description: 'Photo upload works', priority: 'high', expectedOutcome: 'Photos upload and preview', steps: [
          { action: 'navigate', value: '/housing/create', description: 'Navigate to create listing' },
          { action: 'assert', target: '[data-testid="photo-upload"]', value: 'visible', description: 'Upload area visible' },
        ]},
        { id: 'test-submit-listing', description: 'Submit creates listing', priority: 'critical', expectedOutcome: 'Listing created and redirected', steps: [
          { action: 'navigate', value: '/housing/create', description: 'Navigate to create listing' },
          { action: 'type', target: '[data-testid="listing-title-input"]', value: 'Test Listing', description: 'Enter title' },
          { action: 'click', target: '[data-testid="submit-listing-button"]', description: 'Submit listing' },
        ]},
      ],
      dependencies: ['Cloudinary', 'react-hook-form', '/api/housing/listings'],
      apiEndpoints: [
        { endpoint: '/api/housing/listings', method: 'POST', description: 'Create new listing' },
        { endpoint: '/api/upload/housing-photos', method: 'POST', description: 'Upload listing photos' },
      ],
      uiElements: [
        { selector: '[data-testid="listing-form"]', description: 'Listing form', testId: 'listing-form' },
        { selector: '[data-testid="listing-title-input"]', description: 'Title input', testId: 'listing-title-input' },
        { selector: '[data-testid="photo-upload"]', description: 'Photo upload area', testId: 'photo-upload' },
        { selector: '[data-testid="submit-listing-button"]', description: 'Submit button', testId: 'submit-listing-button' },
      ],
      knownIssues: [
        { pattern: 'photo size limit', fix: 'Compress images before upload, max 10MB per photo', severity: 'medium' },
      ],
    };
  }
}

export class HousingPageAgent extends BasePageAgent {
  private featureAgents: Map<string, BaseFeatureAgent>;

  constructor() {
    super(
      'housing-page',
      'Housing Page Agent',
      [
        'client/src/pages/HousingSearchPage.tsx',
        'client/src/pages/HousingListingDetailPage.tsx',
        'client/src/pages/HousingMarketplacePage.tsx',
        'client/src/pages/housing/CreateListingPage.tsx',
        'client/src/components/housing/ListingCard.tsx',
        'server/routes/housing-routes.ts',
      ]
    );

    this.featureAgents = new Map();
    this.initializeFeatureAgents();
  }

  private initializeFeatureAgents() {
    const agents = [
      new ListingSearchFeatureAgent(),
      new ListingDetailFeatureAgent(),
      new CreateListingFeatureAgent(),
    ];
    agents.forEach(a => this.featureAgents.set(a.getFeatureId(), a));
    console.log(`[Housing Page Agent] Initialized ${this.featureAgents.size} feature agents`);
  }

  getFeatureAgents(): BaseFeatureAgent[] {
    return Array.from(this.featureAgents.values());
  }

  getFeatureAgent(id: string): BaseFeatureAgent | undefined {
    return this.featureAgents.get(id);
  }

  async canHandle(query: string): Promise<{ canHandle: boolean; confidence: number; element: ElementLocation | null; reason: string }> {
    const lower = query.toLowerCase();
    if (lower.includes('housing') || lower.includes('listing') || lower.includes('accommodation') || lower.includes('rent')) {
      return { canHandle: true, confidence: 0.90, element: null, reason: 'Housing Page Agent owns all housing functionality' };
    }
    return { canHandle: false, confidence: 0, element: null, reason: 'Query does not match Housing domain' };
  }

  async findElement(query: string): Promise<ElementLocation | null> {
    return null;
  }
}
