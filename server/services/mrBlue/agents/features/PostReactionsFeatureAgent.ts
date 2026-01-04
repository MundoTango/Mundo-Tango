/**
 * PostReactionsFeatureAgent - Manages post reactions feature
 * 
 * PRD Knowledge: Knows exactly how reactions SHOULD work
 * Test Behaviors: Playwright test specifications for this feature
 */

import { BaseFeatureAgent, FeaturePRD, TestableBehavior } from '../BaseFeatureAgent';

export class PostReactionsFeatureAgent extends BaseFeatureAgent {
  constructor() {
    super('post-reactions', 'Post Reactions', 'feed-page');
  }

  initializePRD(): FeaturePRD {
    return {
      featureId: 'post-reactions',
      featureName: 'Post Reactions',
      description: 'Allows users to react to posts with various reaction types: love, passion, fire, tango, celebrate, brilliant. Reactions update optimistically and sync with server.',
      
      expectedBehaviors: this.defineTestBehaviors(),
      
      dependencies: [
        'react-query for optimistic updates',
        '/api/posts/:id/reactions endpoint',
        'ReactionPicker component',
        'Real-time WebSocket updates',
      ],
      
      apiEndpoints: [
        { endpoint: '/api/posts/:id/reactions', method: 'POST', description: 'Add reaction to post' },
        { endpoint: '/api/posts/:id/reactions', method: 'DELETE', description: 'Remove reaction from post' },
        { endpoint: '/api/posts/:id/reactions', method: 'GET', description: 'Get reactions for post' },
      ],
      
      uiElements: [
        { selector: '[data-testid="reaction-button"]', description: 'Main reaction button', testId: 'reaction-button' },
        { selector: '[data-testid="reaction-picker"]', description: 'Reaction type picker', testId: 'reaction-picker' },
        { selector: '[data-testid="reaction-count"]', description: 'Reaction count display', testId: 'reaction-count' },
        { selector: '[data-testid="reaction-love"]', description: 'Love reaction', testId: 'reaction-love' },
        { selector: '[data-testid="reaction-passion"]', description: 'Passion reaction', testId: 'reaction-passion' },
        { selector: '[data-testid="reaction-fire"]', description: 'Fire reaction', testId: 'reaction-fire' },
        { selector: '[data-testid="reaction-tango"]', description: 'Tango reaction', testId: 'reaction-tango' },
        { selector: '[data-testid="reaction-celebrate"]', description: 'Celebrate reaction', testId: 'reaction-celebrate' },
        { selector: '[data-testid="reaction-brilliant"]', description: 'Brilliant reaction', testId: 'reaction-brilliant' },
      ],
      
      knownIssues: [
        {
          pattern: 'reactions.type',
          fix: 'Use reactions.reactionType - column is named "reactionType" not "type"',
          severity: 'critical',
        },
        {
          pattern: 'optimistic update race',
          fix: 'Use react-query mutation with onMutate/onError/onSettled pattern',
          severity: 'high',
        },
        {
          pattern: 'reaction not toggling',
          fix: 'Check if user already reacted before adding/removing',
          severity: 'medium',
        },
        {
          pattern: 'count mismatch',
          fix: 'Invalidate reactions query after mutation completes',
          severity: 'medium',
        },
      ],
    };
  }

  private defineTestBehaviors(): TestableBehavior[] {
    return [
      {
        id: 'test-reaction-picker-opens',
        description: 'Reaction picker opens on button click',
        priority: 'critical',
        expectedOutcome: 'Reaction picker popover appears with all reaction types',
        steps: [
          { action: 'navigate', value: '/feed', description: 'Navigate to feed page' },
          { action: 'wait', timeout: 3000, description: 'Wait for posts to load' },
          { action: 'hover', target: '[data-testid="reaction-button"]', description: 'Hover over reaction button' },
          { action: 'wait', timeout: 500, description: 'Wait for picker to appear' },
          { action: 'assert', target: '[data-testid="reaction-picker"]', value: 'visible', description: 'Reaction picker is visible' },
        ],
      },
      {
        id: 'test-add-love-reaction',
        description: 'Adding a love reaction works',
        priority: 'critical',
        expectedOutcome: 'Love reaction is added and count increases',
        steps: [
          { action: 'navigate', value: '/feed', description: 'Navigate to feed page' },
          { action: 'wait', timeout: 3000, description: 'Wait for posts to load' },
          { action: 'hover', target: '[data-testid="reaction-button"]', description: 'Hover over reaction button' },
          { action: 'wait', timeout: 500, description: 'Wait for picker' },
          { action: 'click', target: '[data-testid="reaction-love"]', description: 'Click love reaction' },
          { action: 'wait', timeout: 1000, description: 'Wait for update' },
          { action: 'assert', target: '[data-testid="reaction-count"]', value: 'count > 0', description: 'Reaction count updated' },
        ],
      },
      {
        id: 'test-reaction-types-available',
        description: 'All 6 reaction types are available',
        priority: 'high',
        expectedOutcome: 'Picker shows love, passion, fire, tango, celebrate, brilliant',
        steps: [
          { action: 'navigate', value: '/feed', description: 'Navigate to feed page' },
          { action: 'wait', timeout: 3000, description: 'Wait for posts to load' },
          { action: 'hover', target: '[data-testid="reaction-button"]', description: 'Hover over reaction button' },
          { action: 'wait', timeout: 500, description: 'Wait for picker' },
          { action: 'assert', target: '[data-testid="reaction-love"]', value: 'visible', description: 'Love reaction visible' },
          { action: 'assert', target: '[data-testid="reaction-passion"]', value: 'visible', description: 'Passion reaction visible' },
          { action: 'assert', target: '[data-testid="reaction-fire"]', value: 'visible', description: 'Fire reaction visible' },
          { action: 'assert', target: '[data-testid="reaction-tango"]', value: 'visible', description: 'Tango reaction visible' },
          { action: 'assert', target: '[data-testid="reaction-celebrate"]', value: 'visible', description: 'Celebrate reaction visible' },
          { action: 'assert', target: '[data-testid="reaction-brilliant"]', value: 'visible', description: 'Brilliant reaction visible' },
        ],
      },
      {
        id: 'test-reaction-toggle',
        description: 'Clicking same reaction toggles it off',
        priority: 'high',
        expectedOutcome: 'Reaction removed when clicked again',
        steps: [
          { action: 'navigate', value: '/feed', description: 'Navigate to feed page' },
          { action: 'wait', timeout: 3000, description: 'Wait for posts to load' },
          { action: 'hover', target: '[data-testid="reaction-button"]', description: 'Hover first time' },
          { action: 'click', target: '[data-testid="reaction-love"]', description: 'Add reaction' },
          { action: 'wait', timeout: 1000, description: 'Wait for update' },
          { action: 'hover', target: '[data-testid="reaction-button"]', description: 'Hover second time' },
          { action: 'click', target: '[data-testid="reaction-love"]', description: 'Remove reaction' },
          { action: 'wait', timeout: 1000, description: 'Wait for update' },
        ],
      },
    ];
  }
}
