/**
 * ProfilePageAgent - Specialized agent for User Profile Pages
 * 
 * MB.MD Level 3: Complete specification of Profile functionality
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { BasePageAgent, ElementLocation } from './BasePageAgent';
import { BaseFeatureAgent, FeaturePRD, TestableBehavior } from './BaseFeatureAgent';

class ProfileInfoFeatureAgent extends BaseFeatureAgent {
  constructor() {
    super('profile-info', 'Profile Information', 'profile-page');
  }

  initializePRD(): FeaturePRD {
    return {
      featureId: 'profile-info',
      featureName: 'Profile Information Display',
      description: 'Displays user profile information including avatar, bio, dance styles, skill levels, location, and social links.',
      expectedBehaviors: [
        { id: 'test-avatar-display', description: 'User avatar displays correctly', priority: 'critical', expectedOutcome: 'Avatar image or fallback initials visible', steps: [
          { action: 'navigate', value: '/profile/:userId', description: 'Navigate to profile page' },
          { action: 'wait', timeout: 2000, description: 'Wait for profile load' },
          { action: 'assert', target: '[data-testid="profile-avatar"]', value: 'visible', description: 'Avatar is visible' },
        ]},
        { id: 'test-bio-display', description: 'Bio section displays user description', priority: 'high', expectedOutcome: 'Bio text visible or empty state', steps: [
          { action: 'navigate', value: '/profile/:userId', description: 'Navigate to profile page' },
          { action: 'assert', target: '[data-testid="profile-bio"]', value: 'visible', description: 'Bio section visible' },
        ]},
        { id: 'test-dance-styles', description: 'Dance styles and skill levels shown', priority: 'high', expectedOutcome: 'Dance style badges visible', steps: [
          { action: 'navigate', value: '/profile/:userId', description: 'Navigate to profile page' },
          { action: 'assert', target: '[data-testid="dance-styles"]', value: 'visible', description: 'Dance styles section visible' },
        ]},
      ],
      dependencies: ['/api/users/:id', '/api/profiles/:id'],
      apiEndpoints: [
        { endpoint: '/api/users/:id', method: 'GET', description: 'Get user basic info' },
        { endpoint: '/api/profiles/:id', method: 'GET', description: 'Get extended profile data' },
      ],
      uiElements: [
        { selector: '[data-testid="profile-avatar"]', description: 'User avatar', testId: 'profile-avatar' },
        { selector: '[data-testid="profile-name"]', description: 'User display name', testId: 'profile-name' },
        { selector: '[data-testid="profile-bio"]', description: 'User biography', testId: 'profile-bio' },
        { selector: '[data-testid="dance-styles"]', description: 'Dance styles list', testId: 'dance-styles' },
        { selector: '[data-testid="profile-location"]', description: 'User location', testId: 'profile-location' },
      ],
      knownIssues: [
        { pattern: 'avatar 404', fix: 'Use fallback initials when image fails to load', severity: 'medium' },
        { pattern: 'undefined name', fix: 'Use displayName || username || email fallback chain', severity: 'high' },
      ],
    };
  }
}

class ProfileMediaFeatureAgent extends BaseFeatureAgent {
  constructor() {
    super('profile-media', 'Profile Media Gallery', 'profile-page');
  }

  initializePRD(): FeaturePRD {
    return {
      featureId: 'profile-media',
      featureName: 'Profile Media Gallery',
      description: 'Displays user uploaded photos, videos, and albums. Supports gallery view, lightbox, and media organization.',
      expectedBehaviors: [
        { id: 'test-gallery-load', description: 'Media gallery loads photos', priority: 'high', expectedOutcome: 'Grid of media items or empty state', steps: [
          { action: 'navigate', value: '/profile/:userId', description: 'Navigate to profile page' },
          { action: 'click', target: '[data-testid="tab-media"]', description: 'Click media tab' },
          { action: 'wait', timeout: 2000, description: 'Wait for media load' },
          { action: 'assert', target: '[data-testid="media-grid"], [data-testid="empty-media"]', value: 'visible', description: 'Media content visible' },
        ]},
        { id: 'test-lightbox-open', description: 'Clicking media opens lightbox', priority: 'high', expectedOutcome: 'Full-screen lightbox view', steps: [
          { action: 'navigate', value: '/profile/:userId', description: 'Navigate to profile page' },
          { action: 'click', target: '[data-testid="media-item"]:first-child', description: 'Click first media item' },
          { action: 'assert', target: '[data-testid="lightbox"]', value: 'visible', description: 'Lightbox opens' },
        ]},
      ],
      dependencies: ['Cloudinary', '/api/media/:userId'],
      apiEndpoints: [
        { endpoint: '/api/media/:userId', method: 'GET', description: 'Get user media items' },
        { endpoint: '/api/albums/:userId', method: 'GET', description: 'Get user albums' },
      ],
      uiElements: [
        { selector: '[data-testid="media-grid"]', description: 'Media gallery grid', testId: 'media-grid' },
        { selector: '[data-testid="media-item"]', description: 'Individual media item', testId: 'media-item' },
        { selector: '[data-testid="lightbox"]', description: 'Fullscreen lightbox', testId: 'lightbox' },
        { selector: '[data-testid="upload-media-button"]', description: 'Upload button', testId: 'upload-media-button' },
      ],
      knownIssues: [
        { pattern: 'Cloudinary timeout', fix: 'Implement retry logic and loading skeleton', severity: 'medium' },
      ],
    };
  }
}

class ProfileStatsFeatureAgent extends BaseFeatureAgent {
  constructor() {
    super('profile-stats', 'Profile Statistics', 'profile-page');
  }

  initializePRD(): FeaturePRD {
    return {
      featureId: 'profile-stats',
      featureName: 'Profile Statistics',
      description: 'Shows user engagement statistics including followers, following, posts, events attended, and reputation score.',
      expectedBehaviors: [
        { id: 'test-follower-count', description: 'Follower count displays', priority: 'high', expectedOutcome: 'Follower number visible', steps: [
          { action: 'navigate', value: '/profile/:userId', description: 'Navigate to profile page' },
          { action: 'assert', target: '[data-testid="followers-count"]', value: 'visible', description: 'Followers count visible' },
        ]},
        { id: 'test-following-count', description: 'Following count displays', priority: 'high', expectedOutcome: 'Following number visible', steps: [
          { action: 'navigate', value: '/profile/:userId', description: 'Navigate to profile page' },
          { action: 'assert', target: '[data-testid="following-count"]', value: 'visible', description: 'Following count visible' },
        ]},
      ],
      dependencies: ['/api/users/:id/stats', '/api/reputation/:userId'],
      apiEndpoints: [
        { endpoint: '/api/users/:id/stats', method: 'GET', description: 'Get user statistics' },
        { endpoint: '/api/reputation/:userId', method: 'GET', description: 'Get reputation score' },
      ],
      uiElements: [
        { selector: '[data-testid="followers-count"]', description: 'Followers count', testId: 'followers-count' },
        { selector: '[data-testid="following-count"]', description: 'Following count', testId: 'following-count' },
        { selector: '[data-testid="posts-count"]', description: 'Posts count', testId: 'posts-count' },
        { selector: '[data-testid="reputation-score"]', description: 'Reputation badge', testId: 'reputation-score' },
      ],
      knownIssues: [],
    };
  }
}

class EditProfileFeatureAgent extends BaseFeatureAgent {
  constructor() {
    super('edit-profile', 'Edit Profile', 'profile-page');
  }

  initializePRD(): FeaturePRD {
    return {
      featureId: 'edit-profile',
      featureName: 'Edit Profile Form',
      description: 'Form for editing user profile information including bio, avatar, dance styles, and privacy settings.',
      expectedBehaviors: [
        { id: 'test-edit-button', description: 'Edit button visible on own profile', priority: 'critical', expectedOutcome: 'Edit button clickable', steps: [
          { action: 'navigate', value: '/profile', description: 'Navigate to own profile' },
          { action: 'assert', target: '[data-testid="edit-profile-button"]', value: 'visible', description: 'Edit button visible' },
        ]},
        { id: 'test-edit-form-open', description: 'Clicking edit opens form', priority: 'critical', expectedOutcome: 'Edit form/modal appears', steps: [
          { action: 'navigate', value: '/profile', description: 'Navigate to own profile' },
          { action: 'click', target: '[data-testid="edit-profile-button"]', description: 'Click edit button' },
          { action: 'assert', target: '[data-testid="edit-profile-form"]', value: 'visible', description: 'Edit form visible' },
        ]},
        { id: 'test-save-changes', description: 'Save button submits form', priority: 'critical', expectedOutcome: 'Changes saved with success message', steps: [
          { action: 'navigate', value: '/profile/edit', description: 'Navigate to edit page' },
          { action: 'type', target: '[data-testid="input-bio"]', value: 'Updated bio text', description: 'Type new bio' },
          { action: 'click', target: '[data-testid="save-profile-button"]', description: 'Click save' },
          { action: 'assert', target: '[data-testid="toast-success"]', value: 'visible', description: 'Success toast appears' },
        ]},
      ],
      dependencies: ['react-hook-form', '/api/profiles/:id'],
      apiEndpoints: [
        { endpoint: '/api/profiles/:id', method: 'PATCH', description: 'Update profile' },
        { endpoint: '/api/upload/avatar', method: 'POST', description: 'Upload new avatar' },
      ],
      uiElements: [
        { selector: '[data-testid="edit-profile-button"]', description: 'Edit button', testId: 'edit-profile-button' },
        { selector: '[data-testid="edit-profile-form"]', description: 'Edit form', testId: 'edit-profile-form' },
        { selector: '[data-testid="input-bio"]', description: 'Bio input', testId: 'input-bio' },
        { selector: '[data-testid="save-profile-button"]', description: 'Save button', testId: 'save-profile-button' },
      ],
      knownIssues: [
        { pattern: 'form validation errors', fix: 'Show inline validation messages', severity: 'medium' },
      ],
    };
  }
}

export class ProfilePageAgent extends BasePageAgent {
  private featureAgents: Map<string, BaseFeatureAgent>;

  constructor() {
    super(
      'profile-page',
      'Profile Page Agent',
      [
        'client/src/pages/ProfilePage.tsx',
        'client/src/pages/ProfileEditPage.tsx',
        'client/src/components/profile/ProfileHeader.tsx',
        'client/src/components/profile/ProfileStats.tsx',
        'client/src/components/profile/ProfileMedia.tsx',
        'client/src/components/profile/ProfileTabs.tsx',
        'server/routes/profileRoutes.ts',
      ]
    );

    this.featureAgents = new Map();
    this.initializeFeatureAgents();
  }

  private initializeFeatureAgents() {
    const agents = [
      new ProfileInfoFeatureAgent(),
      new ProfileMediaFeatureAgent(),
      new ProfileStatsFeatureAgent(),
      new EditProfileFeatureAgent(),
    ];
    agents.forEach(a => this.featureAgents.set(a.getFeatureId(), a));
    console.log(`[Profile Page Agent] Initialized ${this.featureAgents.size} feature agents`);
  }

  getFeatureAgents(): BaseFeatureAgent[] {
    return Array.from(this.featureAgents.values());
  }

  getFeatureAgent(id: string): BaseFeatureAgent | undefined {
    return this.featureAgents.get(id);
  }

  async canHandle(query: string): Promise<{ canHandle: boolean; confidence: number; element: ElementLocation | null; reason: string }> {
    const lower = query.toLowerCase();
    if (lower.includes('profile') || lower.includes('avatar') || lower.includes('bio')) {
      return { canHandle: true, confidence: 0.90, element: null, reason: 'Profile Page Agent owns all profile functionality' };
    }
    return { canHandle: false, confidence: 0, element: null, reason: 'Query does not match Profile Page domain' };
  }

  async findElement(query: string): Promise<ElementLocation | null> {
    return null;
  }
}
