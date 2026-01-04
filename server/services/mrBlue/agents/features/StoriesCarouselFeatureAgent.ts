/**
 * StoriesCarouselFeatureAgent - Manages the stories carousel feature
 * 
 * PRD Knowledge: Knows exactly how stories SHOULD work
 * Test Behaviors: Playwright test specifications for this feature
 */

import { BaseFeatureAgent, FeaturePRD, TestableBehavior } from '../BaseFeatureAgent';

export class StoriesCarouselFeatureAgent extends BaseFeatureAgent {
  constructor() {
    super('stories-carousel', 'Stories Carousel', 'feed-page');
  }

  initializePRD(): FeaturePRD {
    return {
      featureId: 'stories-carousel',
      featureName: 'Stories Carousel',
      description: '24-hour ephemeral content carousel at the top of the feed. Users can view stories from followed users and create their own stories that expire after 24 hours.',
      
      expectedBehaviors: this.defineTestBehaviors(),
      
      dependencies: [
        'embla-carousel-react for carousel',
        '/api/stories endpoint',
        '/api/stories/viewed endpoint',
        'Story viewer modal',
      ],
      
      apiEndpoints: [
        { endpoint: '/api/stories', method: 'GET', description: 'Get active stories (not expired)' },
        { endpoint: '/api/stories', method: 'POST', description: 'Create new story' },
        { endpoint: '/api/stories/:id/viewed', method: 'POST', description: 'Mark story as viewed' },
        { endpoint: '/api/posts/stories', method: 'GET', description: 'Get user stories' },
      ],
      
      uiElements: [
        { selector: '[data-testid="stories-carousel"]', description: 'Main stories carousel', testId: 'stories-carousel' },
        { selector: '[data-testid="story-avatar"]', description: 'Story user avatar', testId: 'story-avatar' },
        { selector: '[data-testid="story-ring"]', description: 'Unviewed story ring indicator', testId: 'story-ring' },
        { selector: '[data-testid="add-story-button"]', description: 'Add new story button', testId: 'add-story-button' },
        { selector: '[data-testid="story-viewer-modal"]', description: 'Story viewer modal', testId: 'story-viewer-modal' },
        { selector: '[data-testid="story-progress-bar"]', description: 'Story progress indicator', testId: 'story-progress-bar' },
        { selector: '[data-testid="story-next-button"]', description: 'Next story button', testId: 'story-next-button' },
        { selector: '[data-testid="story-prev-button"]', description: 'Previous story button', testId: 'story-prev-button' },
      ],
      
      knownIssues: [
        {
          pattern: 'stories not expiring',
          fix: 'Filter stories where createdAt > NOW() - 24 hours',
          severity: 'high',
        },
        {
          pattern: 'viewed indicator not updating',
          fix: 'Call /api/stories/:id/viewed after viewing and refresh cache',
          severity: 'medium',
        },
        {
          pattern: 'carousel overflow',
          fix: 'Set overflow-hidden on container and use proper embla settings',
          severity: 'low',
        },
      ],
    };
  }

  private defineTestBehaviors(): TestableBehavior[] {
    return [
      {
        id: 'test-carousel-renders',
        description: 'Stories carousel renders on feed page',
        priority: 'critical',
        expectedOutcome: 'Stories carousel is visible at top of feed',
        steps: [
          { action: 'navigate', value: '/feed', description: 'Navigate to feed page' },
          { action: 'wait', timeout: 2000, description: 'Wait for page load' },
          { action: 'assert', target: '[data-testid="stories-carousel"]', value: 'visible', description: 'Carousel is visible' },
        ],
      },
      {
        id: 'test-add-story-button',
        description: 'Add story button is visible and clickable',
        priority: 'high',
        expectedOutcome: 'Add story button opens story creation',
        steps: [
          { action: 'navigate', value: '/feed', description: 'Navigate to feed page' },
          { action: 'wait', timeout: 2000, description: 'Wait for page load' },
          { action: 'assert', target: '[data-testid="add-story-button"]', value: 'visible', description: 'Add story button visible' },
        ],
      },
      {
        id: 'test-story-click-opens-viewer',
        description: 'Clicking a story opens the viewer modal',
        priority: 'high',
        expectedOutcome: 'Story viewer modal opens with content',
        steps: [
          { action: 'navigate', value: '/feed', description: 'Navigate to feed page' },
          { action: 'wait', timeout: 2000, description: 'Wait for stories to load' },
          { action: 'click', target: '[data-testid="story-avatar"]:first-child', description: 'Click first story' },
          { action: 'wait', timeout: 1000, description: 'Wait for modal' },
          { action: 'assert', target: '[data-testid="story-viewer-modal"]', value: 'visible', description: 'Story viewer opens' },
        ],
      },
      {
        id: 'test-story-navigation',
        description: 'Story navigation buttons work',
        priority: 'medium',
        expectedOutcome: 'Can navigate between stories in viewer',
        steps: [
          { action: 'navigate', value: '/feed', description: 'Navigate to feed page' },
          { action: 'wait', timeout: 2000, description: 'Wait for stories to load' },
          { action: 'click', target: '[data-testid="story-avatar"]:first-child', description: 'Open first story' },
          { action: 'wait', timeout: 1000, description: 'Wait for viewer' },
          { action: 'click', target: '[data-testid="story-next-button"]', description: 'Click next' },
          { action: 'wait', timeout: 500, description: 'Wait for transition' },
        ],
      },
    ];
  }
}
