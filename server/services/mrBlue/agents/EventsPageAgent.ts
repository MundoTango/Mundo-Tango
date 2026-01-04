/**
 * EventsPageAgent - Specialized agent for Events functionality
 * 
 * MB.MD Level 3: Complete specification of Events system
 */

import { BasePageAgent, ElementLocation } from './BasePageAgent';
import { BaseFeatureAgent, FeaturePRD, TestableBehavior } from './BaseFeatureAgent';

class EventCalendarFeatureAgent extends BaseFeatureAgent {
  constructor() {
    super('event-calendar', 'Event Calendar', 'events-page');
  }

  initializePRD(): FeaturePRD {
    return {
      featureId: 'event-calendar',
      featureName: 'Event Calendar View',
      description: 'Calendar view showing tango events by date. Supports month/week/day views with event filtering.',
      expectedBehaviors: [
        { id: 'test-calendar-render', description: 'Calendar renders with events', priority: 'critical', expectedOutcome: 'Calendar grid visible with event markers', steps: [
          { action: 'navigate', value: '/events/calendar', description: 'Navigate to events calendar' },
          { action: 'wait', timeout: 2000, description: 'Wait for calendar load' },
          { action: 'assert', target: '[data-testid="event-calendar"]', value: 'visible', description: 'Calendar visible' },
        ]},
        { id: 'test-view-toggle', description: 'Can switch between month/week/day views', priority: 'high', expectedOutcome: 'View changes on toggle', steps: [
          { action: 'navigate', value: '/events/calendar', description: 'Navigate to calendar' },
          { action: 'click', target: '[data-testid="view-week"]', description: 'Click week view' },
          { action: 'assert', target: '[data-testid="week-view"]', value: 'visible', description: 'Week view active' },
        ]},
        { id: 'test-event-click', description: 'Clicking event shows details', priority: 'high', expectedOutcome: 'Event detail modal/page opens', steps: [
          { action: 'navigate', value: '/events/calendar', description: 'Navigate to calendar' },
          { action: 'click', target: '[data-testid="calendar-event"]:first-child', description: 'Click first event' },
          { action: 'assert', target: '[data-testid="event-detail"]', value: 'visible', description: 'Event detail opens' },
        ]},
      ],
      dependencies: ['react-big-calendar', '/api/events'],
      apiEndpoints: [
        { endpoint: '/api/events', method: 'GET', description: 'Get events with date range filter' },
        { endpoint: '/api/events/:id', method: 'GET', description: 'Get single event details' },
      ],
      uiElements: [
        { selector: '[data-testid="event-calendar"]', description: 'Calendar container', testId: 'event-calendar' },
        { selector: '[data-testid="calendar-event"]', description: 'Event on calendar', testId: 'calendar-event' },
        { selector: '[data-testid="view-month"]', description: 'Month view toggle', testId: 'view-month' },
        { selector: '[data-testid="view-week"]', description: 'Week view toggle', testId: 'view-week' },
      ],
      knownIssues: [
        { pattern: 'timezone mismatch', fix: 'Store events in UTC, convert to local on display', severity: 'high' },
      ],
    };
  }
}

class EventCreationFeatureAgent extends BaseFeatureAgent {
  constructor() {
    super('event-creation', 'Event Creation', 'events-page');
  }

  initializePRD(): FeaturePRD {
    return {
      featureId: 'event-creation',
      featureName: 'Event Creation Form',
      description: 'Multi-step form for creating tango events with title, date, venue, pricing, and media.',
      expectedBehaviors: [
        { id: 'test-create-button', description: 'Create event button visible', priority: 'critical', expectedOutcome: 'Create button accessible', steps: [
          { action: 'navigate', value: '/events', description: 'Navigate to events' },
          { action: 'assert', target: '[data-testid="create-event-button"]', value: 'visible', description: 'Create button visible' },
        ]},
        { id: 'test-form-steps', description: 'Multi-step form navigates correctly', priority: 'high', expectedOutcome: 'Steps progress forward/backward', steps: [
          { action: 'navigate', value: '/events/create', description: 'Navigate to create event' },
          { action: 'type', target: '[data-testid="input-event-title"]', value: 'Test Milonga', description: 'Enter title' },
          { action: 'click', target: '[data-testid="next-step-button"]', description: 'Click next' },
          { action: 'assert', target: '[data-testid="step-2"]', value: 'visible', description: 'Step 2 visible' },
        ]},
        { id: 'test-submit-event', description: 'Submitting creates event', priority: 'critical', expectedOutcome: 'Event created with success message', steps: [
          { action: 'navigate', value: '/events/create', description: 'Navigate to create event' },
          { action: 'type', target: '[data-testid="input-event-title"]', value: 'Test Event ${Date.now()}', description: 'Enter title' },
          { action: 'click', target: '[data-testid="submit-event-button"]', description: 'Submit event' },
          { action: 'wait', timeout: 3000, description: 'Wait for submission' },
          { action: 'assert', target: '[data-testid="toast-success"]', value: 'visible', description: 'Success message' },
        ]},
      ],
      dependencies: ['react-hook-form', 'UnifiedLocationPicker', '/api/events'],
      apiEndpoints: [
        { endpoint: '/api/events', method: 'POST', description: 'Create new event' },
        { endpoint: '/api/upload/event-image', method: 'POST', description: 'Upload event cover' },
      ],
      uiElements: [
        { selector: '[data-testid="create-event-button"]', description: 'Create button', testId: 'create-event-button' },
        { selector: '[data-testid="input-event-title"]', description: 'Title input', testId: 'input-event-title' },
        { selector: '[data-testid="input-event-date"]', description: 'Date picker', testId: 'input-event-date' },
        { selector: '[data-testid="submit-event-button"]', description: 'Submit button', testId: 'submit-event-button' },
      ],
      knownIssues: [
        { pattern: 'date validation fail', fix: 'Ensure date is in future before submission', severity: 'high' },
      ],
    };
  }
}

class EventDetailFeatureAgent extends BaseFeatureAgent {
  constructor() {
    super('event-detail', 'Event Detail', 'events-page');
  }

  initializePRD(): FeaturePRD {
    return {
      featureId: 'event-detail',
      featureName: 'Event Detail Page',
      description: 'Displays full event information including description, venue, organizer, attendees, and RSVP options.',
      expectedBehaviors: [
        { id: 'test-detail-load', description: 'Event detail page loads', priority: 'critical', expectedOutcome: 'Event info displayed', steps: [
          { action: 'navigate', value: '/events/:eventId', description: 'Navigate to event detail' },
          { action: 'wait', timeout: 2000, description: 'Wait for load' },
          { action: 'assert', target: '[data-testid="event-title"]', value: 'visible', description: 'Event title visible' },
        ]},
        { id: 'test-venue-map', description: 'Venue map displays location', priority: 'high', expectedOutcome: 'Map with marker visible', steps: [
          { action: 'navigate', value: '/events/:eventId', description: 'Navigate to event' },
          { action: 'assert', target: '[data-testid="venue-map"]', value: 'visible', description: 'Map visible' },
        ]},
      ],
      dependencies: ['leaflet', '/api/events/:id'],
      apiEndpoints: [
        { endpoint: '/api/events/:id', method: 'GET', description: 'Get event details' },
        { endpoint: '/api/events/:id/attendees', method: 'GET', description: 'Get attendee list' },
      ],
      uiElements: [
        { selector: '[data-testid="event-title"]', description: 'Event title', testId: 'event-title' },
        { selector: '[data-testid="event-date"]', description: 'Event date/time', testId: 'event-date' },
        { selector: '[data-testid="venue-map"]', description: 'Venue location map', testId: 'venue-map' },
        { selector: '[data-testid="organizer-info"]', description: 'Organizer section', testId: 'organizer-info' },
      ],
      knownIssues: [],
    };
  }
}

class EventRSVPFeatureAgent extends BaseFeatureAgent {
  constructor() {
    super('event-rsvp', 'Event RSVP', 'events-page');
  }

  initializePRD(): FeaturePRD {
    return {
      featureId: 'event-rsvp',
      featureName: 'Event RSVP System',
      description: 'Handles event registration, ticket purchase, and attendance tracking.',
      expectedBehaviors: [
        { id: 'test-rsvp-button', description: 'RSVP button visible', priority: 'critical', expectedOutcome: 'RSVP/Register button clickable', steps: [
          { action: 'navigate', value: '/events/:eventId', description: 'Navigate to event' },
          { action: 'assert', target: '[data-testid="rsvp-button"]', value: 'visible', description: 'RSVP button visible' },
        ]},
        { id: 'test-rsvp-submit', description: 'RSVP submission works', priority: 'critical', expectedOutcome: 'Registration confirmed', steps: [
          { action: 'navigate', value: '/events/:eventId', description: 'Navigate to event' },
          { action: 'click', target: '[data-testid="rsvp-button"]', description: 'Click RSVP' },
          { action: 'wait', timeout: 2000, description: 'Wait for response' },
          { action: 'assert', target: '[data-testid="rsvp-confirmed"]', value: 'visible', description: 'Confirmation shown' },
        ]},
      ],
      dependencies: ['Stripe for paid events', '/api/events/:id/rsvp'],
      apiEndpoints: [
        { endpoint: '/api/events/:id/rsvp', method: 'POST', description: 'Submit RSVP' },
        { endpoint: '/api/events/:id/rsvp', method: 'DELETE', description: 'Cancel RSVP' },
      ],
      uiElements: [
        { selector: '[data-testid="rsvp-button"]', description: 'RSVP button', testId: 'rsvp-button' },
        { selector: '[data-testid="rsvp-confirmed"]', description: 'Confirmation badge', testId: 'rsvp-confirmed' },
        { selector: '[data-testid="attendee-count"]', description: 'Attendee counter', testId: 'attendee-count' },
      ],
      knownIssues: [
        { pattern: 'double RSVP', fix: 'Check existing RSVP before allowing new submission', severity: 'high' },
      ],
    };
  }
}

export class EventsPageAgent extends BasePageAgent {
  private featureAgents: Map<string, BaseFeatureAgent>;

  constructor() {
    super(
      'events-page',
      'Events Page Agent',
      [
        'client/src/pages/EventCalendarPage.tsx',
        'client/src/pages/EventCreationPage.tsx',
        'client/src/pages/EventDetailPage.tsx',
        'client/src/pages/MyEventsPage.tsx',
        'client/src/pages/CreateEventPage.tsx',
        'client/src/components/events/EventCard.tsx',
        'client/src/components/events/EventCalendar.tsx',
        'server/routes/event-routes.ts',
      ]
    );

    this.featureAgents = new Map();
    this.initializeFeatureAgents();
  }

  private initializeFeatureAgents() {
    const agents = [
      new EventCalendarFeatureAgent(),
      new EventCreationFeatureAgent(),
      new EventDetailFeatureAgent(),
      new EventRSVPFeatureAgent(),
    ];
    agents.forEach(a => this.featureAgents.set(a.getFeatureId(), a));
    console.log(`[Events Page Agent] Initialized ${this.featureAgents.size} feature agents`);
  }

  getFeatureAgents(): BaseFeatureAgent[] {
    return Array.from(this.featureAgents.values());
  }

  getFeatureAgent(id: string): BaseFeatureAgent | undefined {
    return this.featureAgents.get(id);
  }

  async canHandle(query: string): Promise<{ canHandle: boolean; confidence: number; element: ElementLocation | null; reason: string }> {
    const lower = query.toLowerCase();
    if (lower.includes('event') || lower.includes('calendar') || lower.includes('milonga') || lower.includes('rsvp')) {
      return { canHandle: true, confidence: 0.90, element: null, reason: 'Events Page Agent owns all event functionality' };
    }
    return { canHandle: false, confidence: 0, element: null, reason: 'Query does not match Events domain' };
  }

  async findElement(query: string): Promise<ElementLocation | null> {
    return null;
  }
}
