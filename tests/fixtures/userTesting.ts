/**
 * User Testing Platform Test Fixtures
 * Provides test data for sessions, recordings, interactions, insights
 */

export const testSession = {
  featureToTest: 'Event Registration Flow',
  tasks: [
    'Browse events on the Events page',
    'Select a workshop event',
    'Complete the registration form',
    'Submit payment information',
    'Verify registration confirmation'
  ],
  duration: 30,
  participants: ['tester1@example.com', 'tester2@example.com'],
  sessionDate: '2025-06-01',
  sessionTime: '14:00'
};

export const aiGeneratedTasks = [
  {
    id: 1,
    task: 'Navigate to the home page and locate the main call-to-action',
    expectedOutcome: 'User finds CTA within 5 seconds',
    difficulty: 'easy'
  },
  {
    id: 2,
    task: 'Search for "tango workshops" using the search bar',
    expectedOutcome: 'Relevant results appear',
    difficulty: 'easy'
  },
  {
    id: 3,
    task: 'Filter events by location and date range',
    expectedOutcome: 'Filters apply correctly',
    difficulty: 'medium'
  },
  {
    id: 4,
    task: 'Add an event to favorites and verify it appears in favorites list',
    expectedOutcome: 'Event saved successfully',
    difficulty: 'medium'
  },
  {
    id: 5,
    task: 'Complete profile setup with all required fields',
    expectedOutcome: 'Profile saves without errors',
    difficulty: 'hard'
  }
];

export const sessionOptimizationResults = {
  optimalDuration: 25,
  taskFlow: [
    'Start with easiest task to build confidence',
    'Progress to medium difficulty tasks',
    'End with most complex task',
    'Allow 5-minute buffer for questions'
  ],
  participantMatching: {
    recommended: [
      {
        name: 'Sarah Johnson',
        matchScore: 95,
        reason: 'Experience level matches test complexity'
      },
      {
        name: 'Michael Chen',
        matchScore: 88,
        reason: 'Relevant domain knowledge in event planning'
      }
    ]
  },
  recordingQuality: {
    resolution: '1080p',
    frameRate: 30,
    audioQuality: 'high',
    bandwidth: 'minimum 5 Mbps'
  },
  realTimeGuidance: [
    'Encourage thinking aloud',
    'Ask clarifying questions when user seems stuck',
    'Don\'t provide direct hints unless critical',
    'Note timestamps of confusion points'
  ]
};

export const sampleSessions = [
  {
    id: 1,
    feature: 'Event Registration',
    status: 'completed',
    date: '2025-05-15',
    duration: 28,
    participantCount: 3,
    issuesFound: 5,
    successRate: 67
  },
  {
    id: 2,
    feature: 'Social Feed Posting',
    status: 'completed',
    date: '2025-05-18',
    duration: 22,
    participantCount: 2,
    issuesFound: 2,
    successRate: 90
  },
  {
    id: 3,
    feature: 'Profile Editing',
    status: 'in-progress',
    date: '2025-05-20',
    duration: 0,
    participantCount: 1,
    issuesFound: 0,
    successRate: 0
  },
  {
    id: 4,
    feature: 'Marketplace Checkout',
    status: 'scheduled',
    date: '2025-05-25',
    duration: 0,
    participantCount: 4,
    issuesFound: 0,
    successRate: 0
  }
];

export const interactionAnalysisResults = {
  confusionIndicators: [
    {
      type: 'back_button_usage',
      count: 8,
      timestamps: ['00:02:15', '00:03:42', '00:05:10'],
      context: 'User repeatedly returned to previous page when searching for "Submit" button'
    },
    {
      type: 'rapid_clicks',
      count: 12,
      timestamps: ['00:04:30', '00:04:31', '00:04:32'],
      context: 'Multiple clicks on non-responsive button'
    },
    {
      type: 'mouse_hovering',
      count: 5,
      timestamps: ['00:01:50', '00:06:20'],
      context: 'Extended hover over unclear navigation menu items'
    }
  ],
  frustrationDetection: [
    {
      level: 'high',
      description: 'User repeated same action 6 times without success',
      location: 'Payment form',
      timestamp: '00:07:45'
    },
    {
      level: 'medium',
      description: 'User verbalized confusion about field requirements',
      location: 'Registration form',
      timestamp: '00:03:10'
    }
  ],
  successPaths: [
    {
      task: 'Find and click event',
      avgDuration: '15 seconds',
      completionRate: 100,
      optimalPath: ['Home → Events → Event Card → Click']
    },
    {
      task: 'Add to cart',
      avgDuration: '8 seconds',
      completionRate: 100,
      optimalPath: ['Product Page → Add to Cart Button → Cart Confirmation']
    }
  ],
  interactionTimeline: [
    { time: '00:00:00', action: 'Page load', element: 'Homepage' },
    { time: '00:00:05', action: 'Click', element: 'Events menu' },
    { time: '00:00:12', action: 'Scroll', element: 'Events list' },
    { time: '00:00:25', action: 'Click', element: 'Event card' },
    { time: '00:00:30', action: 'Click', element: 'Register button' }
  ]
};

export const extractedInsights = {
  keyProblems: [
    {
      severity: 'critical',
      problem: 'Payment form validation errors unclear',
      impact: 'Users abandoned checkout process',
      frequency: '80% of participants'
    },
    {
      severity: 'major',
      problem: 'Submit button not visible below fold',
      impact: 'Users didn\'t know how to complete registration',
      frequency: '60% of participants'
    },
    {
      severity: 'minor',
      problem: 'Event date format confusing',
      impact: 'Users hesitated before selecting',
      frequency: '40% of participants'
    }
  ],
  painPoints: [
    'Form field requirements not clearly explained',
    'No progress indicator for multi-step process',
    'Error messages appear above fold',
    'Mobile keyboard covers input fields'
  ],
  featureRequests: [
    'Save progress and resume later',
    'Autofill from profile data',
    'Guest checkout option',
    'Social login (Google, Facebook)'
  ],
  usabilityIssues: {
    critical: [
      'Payment form submit button hidden',
      'Required field validation fails silently'
    ],
    moderate: [
      'Date picker difficult to use on mobile',
      'Dropdown menu items too small to click',
      'No confirmation before data deletion'
    ],
    minor: [
      'Tooltip text too small',
      'Loading spinner not visible',
      'Success message disappears too quickly'
    ]
  },
  improvementSuggestions: [
    {
      priority: 1,
      suggestion: 'Add inline field validation with clear error messages',
      expectedImpact: 'Reduce form abandonment by 40%'
    },
    {
      priority: 2,
      suggestion: 'Implement sticky submit button that stays visible',
      expectedImpact: 'Increase completion rate by 25%'
    },
    {
      priority: 3,
      suggestion: 'Add progress bar for multi-step forms',
      expectedImpact: 'Improve user confidence and reduce drop-off'
    }
  ],
  priorityRanking: [
    { rank: 1, issue: 'Payment form submit button visibility' },
    { rank: 2, issue: 'Field validation clarity' },
    { rank: 3, issue: 'Multi-step process indication' },
    { rank: 4, issue: 'Mobile keyboard overlay' },
    { rank: 5, issue: 'Error message positioning' }
  ]
};

export const knowledgeBaseData = {
  patternRecognition: [
    {
      pattern: 'Users consistently scroll past submit buttons',
      occurrences: 15,
      affectedFeatures: ['Registration', 'Profile Edit', 'Checkout'],
      recommendation: 'Implement sticky footer with submit button'
    },
    {
      pattern: 'Form validation errors cause confusion',
      occurrences: 22,
      affectedFeatures: ['All forms'],
      recommendation: 'Use inline validation with clear messaging'
    },
    {
      pattern: 'Mobile users struggle with dropdowns',
      occurrences: 18,
      affectedFeatures: ['Event filters', 'Profile selectors'],
      recommendation: 'Increase touch target sizes to 44x44px minimum'
    }
  ],
  commonIssues: [
    {
      issue: 'Hidden submit buttons',
      frequency: 'Very High',
      impact: 'Critical',
      solution: 'Sticky footer buttons'
    },
    {
      issue: 'Unclear error messages',
      frequency: 'High',
      impact: 'Major',
      solution: 'Inline validation with examples'
    },
    {
      issue: 'Small touch targets',
      frequency: 'Medium',
      impact: 'Moderate',
      solution: 'Minimum 44x44px buttons and links'
    }
  ],
  bestPractices: [
    'Always keep submit buttons visible (sticky or frequent repetition)',
    'Validate form fields inline with immediate feedback',
    'Use progress indicators for multi-step processes',
    'Design for mobile-first with appropriate touch targets',
    'Provide clear, actionable error messages with examples',
    'Test all forms on actual mobile devices, not just emulators'
  ],
  designSystemRecommendations: [
    {
      component: 'Form Submit Button',
      recommendation: 'Create sticky footer variant for long forms',
      rationale: 'Reduces completion errors by 40%'
    },
    {
      component: 'Input Fields',
      recommendation: 'Add inline validation component with error/success states',
      rationale: 'Improves user confidence and reduces errors'
    },
    {
      component: 'Progress Indicator',
      recommendation: 'Standardize multi-step form progress component',
      rationale: 'Users complete 25% more multi-step flows with progress indicators'
    }
  ]
};

export const bugReportTemplate = {
  title: '[User Testing] Hidden Submit Button on Payment Form',
  description: `## Issue Summary
Users cannot find the submit button on the payment form during checkout process.

## Reproduction Steps
1. Navigate to marketplace checkout
2. Fill payment form
3. Scroll to bottom of page
4. Look for submit button

## Expected Behavior
Submit button should be visible and accessible at all times

## Actual Behavior
Submit button is hidden below the fold and users don't scroll to find it

## Impact
- 80% of test participants failed to complete checkout
- High abandonment rate
- Critical revenue impact

## Supporting Data
- Session IDs: 1, 2, 4
- Timestamps: See interaction analysis
- Heatmap data: attached

## Recommended Solution
Implement sticky footer with submit button

## Priority
Critical - Immediate fix required`,
  severity: 'critical',
  component: 'Checkout',
  affectedUsers: '80%',
  labels: ['user-testing', 'checkout', 'ux', 'critical']
};
