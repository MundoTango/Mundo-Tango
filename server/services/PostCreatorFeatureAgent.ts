/**
 * PostCreatorFeatureAgent - Manages the post creation feature
 * 
 * PRD Knowledge: Knows exactly how post creation SHOULD work
 * Test Behaviors: Playwright test specifications for this feature
 */

import { BaseFeatureAgent, FeaturePRD, TestableBehavior } from './BaseFeatureAgent';

export class PostCreatorFeatureAgent extends BaseFeatureAgent {
  constructor() {
    super('post-creator', 'Post Creator', 'feed-page');
  }

  initializePRD(): FeaturePRD {
    return {
      featureId: 'post-creator',
      featureName: 'Post Creator',
      description: 'Allows users to create new posts with text content, media attachments, location tags, mentions, and visibility settings. Supports both regular posts and 24-hour stories.',
      
      expectedBehaviors: this.defineTestBehaviors(),
      
      dependencies: [
        'react-hook-form for form management',
        'Cloudinary for media uploads',
        '/api/posts endpoint',
        '/api/stories endpoint',
        'UnifiedLocationPicker component',
        'SimpleMentionsInput component',
      ],
      
      apiEndpoints: [
        { endpoint: '/api/posts', method: 'POST', description: 'Create new post' },
        { endpoint: '/api/stories', method: 'POST', description: 'Create new story' },
        { endpoint: '/api/upload/image', method: 'POST', description: 'Upload image attachment' },
        { endpoint: '/api/users/search', method: 'GET', description: 'Search users for mentions' },
        { endpoint: '/api/locations/search', method: 'GET', description: 'Search locations' },
      ],
      
      uiElements: [
        { selector: '[data-testid="post-creator-container"]', description: 'Main post creator container', testId: 'post-creator-container' },
        { selector: '[data-testid="post-content-input"]', description: 'Text content input', testId: 'post-content-input' },
        { selector: '[data-testid="post-submit-button"]', description: 'Submit post button', testId: 'post-submit-button' },
        { selector: '[data-testid="add-media-button"]', description: 'Add media button', testId: 'add-media-button' },
        { selector: '[data-testid="add-location-button"]', description: 'Add location button', testId: 'add-location-button' },
        { selector: '[data-testid="visibility-selector"]', description: 'Post visibility selector', testId: 'visibility-selector' },
        { selector: '[data-testid="story-toggle"]', description: 'Story mode toggle', testId: 'story-toggle' },
        { selector: '[data-testid="media-preview"]', description: 'Media upload preview', testId: 'media-preview' },
      ],
      
      knownIssues: [
        {
          pattern: 'empty post submission',
          fix: 'Validate content is not empty before enabling submit button',
          severity: 'high',
        },
        {
          pattern: 'media upload failure silent',
          fix: 'Show error toast when image upload fails',
          severity: 'medium',
        },
        {
          pattern: 'mentions not saving',
          fix: 'Extract mention IDs from content before POST request',
          severity: 'high',
        },
        {
          pattern: 'form not resetting',
          fix: 'Call form.reset() after successful post creation',
          severity: 'low',
        },
      ],
    };
  }

  private defineTestBehaviors(): TestableBehavior[] {
    return [
      {
        id: 'test-create-text-post',
        description: 'Create a basic text post',
        priority: 'critical',
        expectedOutcome: 'Post appears in feed after creation',
        steps: [
          { action: 'navigate', value: '/feed', description: 'Navigate to feed page' },
          { action: 'wait', timeout: 2000, description: 'Wait for page load' },
          { action: 'type', target: '[data-testid="post-content-input"]', value: 'Test post from Playwright ${Date.now()}', description: 'Type post content' },
          { action: 'click', target: '[data-testid="post-submit-button"]', description: 'Click submit button' },
          { action: 'wait', timeout: 3000, description: 'Wait for post creation' },
          { action: 'assert', target: '[data-testid="toast-success"]', value: 'visible', description: 'Success toast appears' },
        ],
      },
      {
        id: 'test-empty-post-validation',
        description: 'Cannot submit empty post',
        priority: 'high',
        expectedOutcome: 'Submit button disabled when content is empty',
        steps: [
          { action: 'navigate', value: '/feed', description: 'Navigate to feed page' },
          { action: 'wait', timeout: 2000, description: 'Wait for page load' },
          { action: 'assert', target: '[data-testid="post-submit-button"]', value: 'disabled', description: 'Submit button is disabled' },
        ],
      },
      {
        id: 'test-visibility-options',
        description: 'Post visibility options work correctly',
        priority: 'high',
        expectedOutcome: 'All visibility options are selectable',
        steps: [
          { action: 'navigate', value: '/feed', description: 'Navigate to feed page' },
          { action: 'wait', timeout: 2000, description: 'Wait for page load' },
          { action: 'click', target: '[data-testid="visibility-selector"]', description: 'Click visibility selector' },
          { action: 'assert', target: '[data-testid="visibility-public"]', value: 'visible', description: 'Public option visible' },
          { action: 'assert', target: '[data-testid="visibility-friends"]', value: 'visible', description: 'Friends option visible' },
          { action: 'assert', target: '[data-testid="visibility-private"]', value: 'visible', description: 'Private option visible' },
        ],
      },
      {
        id: 'test-media-upload-button',
        description: 'Media upload button is functional',
        priority: 'medium',
        expectedOutcome: 'File picker opens on media button click',
        steps: [
          { action: 'navigate', value: '/feed', description: 'Navigate to feed page' },
          { action: 'wait', timeout: 2000, description: 'Wait for page load' },
          { action: 'assert', target: '[data-testid="add-media-button"]', value: 'visible', description: 'Media button visible' },
        ],
      },
      {
        id: 'test-location-picker',
        description: 'Location picker integration works',
        priority: 'medium',
        expectedOutcome: 'Location picker opens and allows location selection',
        steps: [
          { action: 'navigate', value: '/feed', description: 'Navigate to feed page' },
          { action: 'wait', timeout: 2000, description: 'Wait for page load' },
          { action: 'click', target: '[data-testid="add-location-button"]', description: 'Click location button' },
          { action: 'wait', timeout: 1000, description: 'Wait for location picker' },
          { action: 'assert', target: '[data-testid="location-search-input"]', value: 'visible', description: 'Location search input visible' },
        ],
      },
    ];
  }
}
