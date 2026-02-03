/**
 * InfiniteScrollFeatureAgent - Manages the infinite scroll feed feature
 * 
 * PRD Knowledge: Knows exactly how infinite scroll SHOULD work
 * Test Behaviors: Playwright test specifications for this feature
 */

import { BaseFeatureAgent, FeaturePRD, TestableBehavior } from './BaseFeatureAgent';

export class InfiniteScrollFeatureAgent extends BaseFeatureAgent {
  constructor() {
    super('infinite-scroll', 'Infinite Scroll Feed', 'feed-page');
  }

  initializePRD(): FeaturePRD {
    return {
      featureId: 'infinite-scroll',
      featureName: 'Infinite Scroll Feed',
      description: 'Displays posts in a paginated feed that loads more content as user scrolls to bottom. Uses cursor-based pagination with 20 posts per page.',
      
      expectedBehaviors: this.defineTestBehaviors(),
      
      dependencies: [
        'react-query for data fetching',
        'IntersectionObserver for scroll detection',
        '/api/feed/following endpoint',
        '/api/feed/discover endpoint',
      ],
      
      apiEndpoints: [
        { endpoint: '/api/feed/following', method: 'GET', description: 'Get posts from followed users with pagination' },
        { endpoint: '/api/feed/discover', method: 'GET', description: 'Get recommended posts for discovery' },
        { endpoint: '/api/posts/:id', method: 'GET', description: 'Get single post details' },
      ],
      
      uiElements: [
        { selector: '[data-testid="infinite-scroll-container"]', description: 'Main scroll container', testId: 'infinite-scroll-container' },
        { selector: '[data-testid="post-card"]', description: 'Individual post card', testId: 'post-card' },
        { selector: '[data-testid="load-more-trigger"]', description: 'Intersection observer trigger', testId: 'load-more-trigger' },
        { selector: '[data-testid="loading-skeleton"]', description: 'Loading state skeleton', testId: 'loading-skeleton' },
        { selector: '[data-testid="empty-feed-message"]', description: 'Empty state message', testId: 'empty-feed-message' },
        { selector: '[data-testid="error-message"]', description: 'Error state message', testId: 'error-message' },
      ],
      
      knownIssues: [
        {
          pattern: 'reactions.type',
          fix: 'Use reactions.reactionType - column is named reactionType not type',
          severity: 'critical',
        },
        {
          pattern: 'duplicate posts on scroll',
          fix: 'Ensure cursor pagination uses unique IDs and check for existing posts before appending',
          severity: 'high',
        },
        {
          pattern: 'infinite loop on error',
          fix: 'Add error state check to prevent continuous retries on failed requests',
          severity: 'high',
        },
        {
          pattern: 'stale data after post creation',
          fix: 'Invalidate infinite-feed query key after creating new post',
          severity: 'medium',
        },
      ],
    };
  }

  private defineTestBehaviors(): TestableBehavior[] {
    return [
      {
        id: 'test-initial-load',
        description: 'Initial feed loads with posts',
        priority: 'critical',
        expectedOutcome: 'Feed displays at least 1 post or empty state message',
        steps: [
          { action: 'navigate', value: '/feed', description: 'Navigate to feed page' },
          { action: 'wait', timeout: 3000, description: 'Wait for initial data load' },
          { action: 'assert', target: '[data-testid="post-card"], [data-testid="empty-feed-message"]', value: 'visible', description: 'Either posts or empty message visible' },
        ],
      },
      {
        id: 'test-scroll-load-more',
        description: 'Scrolling to bottom loads more posts',
        priority: 'high',
        expectedOutcome: 'New posts appear when scrolled to bottom',
        steps: [
          { action: 'navigate', value: '/feed', description: 'Navigate to feed page' },
          { action: 'wait', timeout: 3000, description: 'Wait for initial load' },
          { action: 'scroll', value: 'bottom', description: 'Scroll to bottom of page' },
          { action: 'wait', timeout: 2000, description: 'Wait for more posts to load' },
          { action: 'assert', target: '[data-testid="post-card"]', value: 'count > 0', description: 'More posts loaded' },
        ],
      },
      {
        id: 'test-loading-state',
        description: 'Loading skeleton shown while fetching',
        priority: 'medium',
        expectedOutcome: 'Skeleton UI appears during data fetch',
        steps: [
          { action: 'navigate', value: '/feed', description: 'Navigate to feed page' },
          { action: 'assert', target: '[data-testid="loading-skeleton"]', value: 'visible', description: 'Loading skeleton shown initially' },
        ],
      },
      {
        id: 'test-feed-tab-switch',
        description: 'Switching between Following and Discover tabs',
        priority: 'high',
        expectedOutcome: 'Feed content updates when switching tabs',
        steps: [
          { action: 'navigate', value: '/feed', description: 'Navigate to feed page' },
          { action: 'wait', timeout: 2000, description: 'Wait for initial load' },
          { action: 'click', target: '[data-testid="tab-discover"]', description: 'Click Discover tab' },
          { action: 'wait', timeout: 2000, description: 'Wait for discover feed to load' },
          { action: 'assert', target: '[data-testid="post-card"], [data-testid="empty-feed-message"]', value: 'visible', description: 'Discover feed content visible' },
        ],
      },
      {
        id: 'test-post-visibility',
        description: 'Post cards display all required elements',
        priority: 'high',
        expectedOutcome: 'Each post shows author, content, reactions, and actions',
        steps: [
          { action: 'navigate', value: '/feed', description: 'Navigate to feed page' },
          { action: 'wait', timeout: 3000, description: 'Wait for posts to load' },
          { action: 'assert', target: '[data-testid="post-author-name"]', value: 'visible', description: 'Author name visible' },
          { action: 'assert', target: '[data-testid="post-content"]', value: 'visible', description: 'Post content visible' },
          { action: 'assert', target: '[data-testid="post-reactions"]', value: 'visible', description: 'Reactions area visible' },
        ],
      },
    ];
  }
}
