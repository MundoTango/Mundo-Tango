/**
 * Component Registry - Maps data-testid patterns to source files
 * Enables Mr. Blue to identify which code file to investigate
 * MB.MD Pattern 67: QA System Intelligence
 */

export interface ComponentMapping {
  testIdPattern: RegExp | string;
  file: string;
  component: string;
  section?: string;
  relatedAPIs?: string[];
  requiredContext?: string[];
}

export interface BugPattern {
  id: string;
  pattern: RegExp | ((context: DiagnosticContext) => boolean);
  diagnosis: string;
  suggestedFix: string;
  relatedFiles: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface DiagnosticContext {
  testId?: string;
  breadcrumb: string[];
  apiCalls: APICallRecord[];
  userContext: UserContext;
  errors: ErrorRecord[];
  appState: Record<string, unknown>;
}

export interface APICallRecord {
  timestamp: number;
  url: string;
  method: string;
  status: number;
  requestBody?: unknown;
  responseBody?: unknown;
  duration: number;
  error?: string;
}

export interface UserContext {
  id?: number;
  tier: 'free' | 'pro' | 'admin' | 'god';
  cityId?: number;
  cityName?: string;
  isVerified: boolean;
  profileComplete: boolean;
  permissions: string[];
}

export interface ErrorRecord {
  timestamp: number;
  type: 'console' | 'network' | 'react' | 'unhandled';
  message: string;
  stack?: string;
  componentName?: string;
}

const componentMappings: ComponentMapping[] = [
  // Profile Tabs
  { testIdPattern: /^button-tab-travel$/, file: 'client/src/components/profile/ProfileTabTravel.tsx', component: 'ProfileTabTravel', section: 'Travel Tab' },
  { testIdPattern: /^button-tab-about$/, file: 'client/src/components/profile/ProfileTabAbout.tsx', component: 'ProfileTabAbout', section: 'About Tab' },
  { testIdPattern: /^button-tab-events$/, file: 'client/src/components/profile/ProfileTabEvents.tsx', component: 'ProfileTabEvents', section: 'Events Tab' },
  { testIdPattern: /^button-tab-media$/, file: 'client/src/components/profile/ProfileTabMedia.tsx', component: 'ProfileTabMedia', section: 'Media Tab' },
  { testIdPattern: /^button-tab-settings$/, file: 'client/src/components/profile/ProfileTabSettings.tsx', component: 'ProfileTabSettings', section: 'Settings Tab' },
  
  // Travel Tab Sections
  { testIdPattern: /^section-transport/, file: 'client/src/components/profile/ProfileTabTravel.tsx', component: 'TransportSection', section: 'Transport' },
  { testIdPattern: /^section-events-milongas/, file: 'client/src/components/profile/ProfileTabTravel.tsx', component: 'EventsMilongasSection', section: 'Events & Milongas', relatedAPIs: ['/api/events/city/:id', '/api/travel/:tripId/items'], requiredContext: ['cityId', 'tripId'] },
  { testIdPattern: /^section-accommodation/, file: 'client/src/components/profile/ProfileTabTravel.tsx', component: 'AccommodationSection', section: 'Accommodation' },
  { testIdPattern: /^section-travel-companions/, file: 'client/src/components/profile/ProfileTabTravel.tsx', component: 'TravelCompanionsSection', section: 'Travel Companions' },
  { testIdPattern: /^section-trip-planner/, file: 'client/src/components/profile/ProfileTabTravel.tsx', component: 'TripPlannerSection', section: 'Trip Planner' },
  
  // Travel Tab Buttons
  { testIdPattern: /^button-add-event/, file: 'client/src/components/profile/ProfileTabTravel.tsx', component: 'AddEventButton', section: 'Events & Milongas', relatedAPIs: ['/api/travel/:tripId/items'] },
  { testIdPattern: /^button-add-transport/, file: 'client/src/components/profile/ProfileTabTravel.tsx', component: 'AddTransportButton', section: 'Transport' },
  { testIdPattern: /^button-add-accommodation/, file: 'client/src/components/profile/ProfileTabTravel.tsx', component: 'AddAccommodationButton', section: 'Accommodation' },
  
  // City Groups
  { testIdPattern: /^city-tab-/, file: 'client/src/pages/CityGroupPage.tsx', component: 'CityGroupPage', section: 'City Tab' },
  { testIdPattern: /^section-city-events/, file: 'client/src/pages/CityGroupPage.tsx', component: 'CityEventsSection', section: 'City Events', relatedAPIs: ['/api/cities/:id/events'] },
  
  // Messaging
  { testIdPattern: /^inbox-/, file: 'client/src/pages/InboxPage.tsx', component: 'InboxPage', section: 'Messaging' },
  { testIdPattern: /^message-/, file: 'client/src/components/messaging/MessageThread.tsx', component: 'MessageThread', section: 'Messages' },
  
  // Events
  { testIdPattern: /^event-card-/, file: 'client/src/components/events/EventCard.tsx', component: 'EventCard', section: 'Event Display' },
  { testIdPattern: /^button-rsvp/, file: 'client/src/components/events/EventCard.tsx', component: 'RSVPButton', section: 'Event RSVP', relatedAPIs: ['/api/events/:id/rsvp'] },
  
  // Mr. Blue
  { testIdPattern: /^button-ask-mr-blue$/, file: 'client/src/components/mrBlue/MrBlueFloatingButton.tsx', component: 'MrBlueFloatingButton', section: 'AI Assistant' },
  { testIdPattern: /^mr-blue-panel$/, file: 'client/src/components/mrBlue/core/MrBlueChat.tsx', component: 'MrBlueChat', section: 'AI Chat' },
  { testIdPattern: /^button-qa-/, file: 'client/src/components/mrBlue/core/MrBlueChat.tsx', component: 'QAButtons', section: 'QA System' },
];

const bugPatterns: BugPattern[] = [
  {
    id: 'empty-events-no-city',
    pattern: (ctx) => {
      const hasEventsAPI = ctx.apiCalls.some(c => c.url.includes('/api/events') && c.status === 200);
      const emptyResponse = ctx.apiCalls.some(c => c.url.includes('/api/events') && 
        (c.responseBody as any)?.length === 0);
      const noCity = !ctx.userContext.cityId;
      return hasEventsAPI && emptyResponse && noCity;
    },
    diagnosis: 'Events API returned empty because user has no city set in their profile.',
    suggestedFix: 'Prompt user to set their city in profile settings, or show a helpful empty state explaining why no events are displayed.',
    relatedFiles: ['client/src/components/profile/ProfileTabTravel.tsx', 'server/routes/events-routes.ts'],
    severity: 'medium'
  },
  {
    id: 'api-404-resource',
    pattern: (ctx) => ctx.apiCalls.some(c => c.status === 404),
    diagnosis: 'Requested resource was not found. The ID in the URL may be invalid or the resource was deleted.',
    suggestedFix: 'Check if the resource ID exists in the database. Add proper error handling for 404 responses.',
    relatedFiles: [],
    severity: 'medium'
  },
  {
    id: 'api-401-unauthorized',
    pattern: (ctx) => ctx.apiCalls.some(c => c.status === 401),
    diagnosis: 'User is not authenticated or session expired.',
    suggestedFix: 'Redirect to login page or refresh the authentication token.',
    relatedFiles: ['server/middleware/auth.ts'],
    severity: 'high'
  },
  {
    id: 'api-500-server-error',
    pattern: (ctx) => ctx.apiCalls.some(c => c.status >= 500),
    diagnosis: 'Server encountered an internal error. Check server logs for stack trace.',
    suggestedFix: 'Review server logs. Common causes: database connection issues, null pointer exceptions, missing environment variables.',
    relatedFiles: [],
    severity: 'critical'
  },
  {
    id: 'react-render-error',
    pattern: (ctx) => ctx.errors.some(e => e.type === 'react'),
    diagnosis: 'React component failed to render. Usually caused by undefined data or prop type mismatch.',
    suggestedFix: 'Check the component stack trace. Add null checks or optional chaining for data access.',
    relatedFiles: [],
    severity: 'high'
  },
  {
    id: 'network-timeout',
    pattern: (ctx) => ctx.errors.some(e => e.message.toLowerCase().includes('timeout') || e.message.toLowerCase().includes('network')),
    diagnosis: 'Network request timed out or failed. Could be server overload or connectivity issue.',
    suggestedFix: 'Add retry logic, increase timeout, or check server performance.',
    relatedFiles: ['client/src/lib/queryClient.ts'],
    severity: 'medium'
  },
  {
    id: 'missing-required-data',
    pattern: (ctx) => ctx.errors.some(e => e.message.includes('undefined') || e.message.includes('null')),
    diagnosis: 'Code attempted to access undefined or null data.',
    suggestedFix: 'Add defensive null checks. Ensure data is loaded before rendering dependent components.',
    relatedFiles: [],
    severity: 'medium'
  },
];

export function findComponentForTestId(testId: string): ComponentMapping | null {
  for (const mapping of componentMappings) {
    if (typeof mapping.testIdPattern === 'string') {
      if (mapping.testIdPattern === testId) return mapping;
    } else if (mapping.testIdPattern.test(testId)) {
      return mapping;
    }
  }
  return null;
}

export function findMatchingBugPatterns(context: DiagnosticContext): BugPattern[] {
  return bugPatterns.filter(bp => {
    if (typeof bp.pattern === 'function') {
      return bp.pattern(context);
    }
    return false;
  });
}

export function buildBreadcrumbFromJourney(journey: Array<{ element?: string; action?: string }>): string[] {
  const breadcrumb: string[] = [];
  
  for (const step of journey) {
    if (!step.element) continue;
    
    // Extract meaningful breadcrumb from element
    if (step.element.startsWith('tab:')) {
      breadcrumb.push(step.element.replace('tab:', 'Tab: '));
    } else if (step.element.startsWith('section:')) {
      breadcrumb.push(step.element.replace('section:', ''));
    } else if (step.element.startsWith('button:')) {
      breadcrumb.push('Clicked: ' + step.element.replace('button:', ''));
    } else if (step.element.startsWith('nav:')) {
      breadcrumb.push('Nav: ' + step.element.replace('nav:', ''));
    } else if (step.action === 'page_load') {
      // Skip page loads in breadcrumb
    } else {
      breadcrumb.push(step.element);
    }
  }
  
  return breadcrumb;
}

export function generateDiagnosisSummary(context: DiagnosticContext): string {
  const matchedPatterns = findMatchingBugPatterns(context);
  const componentInfo = context.testId ? findComponentForTestId(context.testId) : null;
  
  let summary = '';
  
  // Add component location if known
  if (componentInfo) {
    summary += `**Location:** ${componentInfo.file} → ${componentInfo.component}\n`;
    if (componentInfo.section) {
      summary += `**Section:** ${componentInfo.section}\n`;
    }
    if (componentInfo.relatedAPIs?.length) {
      summary += `**Related APIs:** ${componentInfo.relatedAPIs.join(', ')}\n`;
    }
  }
  
  // Add breadcrumb
  if (context.breadcrumb.length > 0) {
    summary += `**User Path:** ${context.breadcrumb.join(' → ')}\n`;
  }
  
  // Add user context
  summary += `**User:** ${context.userContext.tier} tier`;
  if (context.userContext.cityName) {
    summary += `, City: ${context.userContext.cityName}`;
  }
  if (!context.userContext.isVerified) {
    summary += ' (unverified)';
  }
  summary += '\n';
  
  // Add detected issues
  if (matchedPatterns.length > 0) {
    summary += '\n**Detected Issues:**\n';
    for (const pattern of matchedPatterns) {
      summary += `- [${pattern.severity.toUpperCase()}] ${pattern.diagnosis}\n`;
      summary += `  → Fix: ${pattern.suggestedFix}\n`;
      if (pattern.relatedFiles.length > 0) {
        summary += `  → Files: ${pattern.relatedFiles.join(', ')}\n`;
      }
    }
  }
  
  // Add API call summary
  const failedCalls = context.apiCalls.filter(c => c.status >= 400);
  if (failedCalls.length > 0) {
    summary += '\n**Failed API Calls:**\n';
    for (const call of failedCalls) {
      summary += `- ${call.method} ${call.url} → ${call.status}\n`;
    }
  }
  
  // Add console errors
  if (context.errors.length > 0) {
    summary += '\n**Errors:**\n';
    for (const error of context.errors.slice(0, 5)) {
      summary += `- [${error.type}] ${error.message.substring(0, 100)}\n`;
    }
  }
  
  return summary;
}

export { componentMappings, bugPatterns };
