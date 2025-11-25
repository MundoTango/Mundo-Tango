/**
 * Component PRD Registry
 * MB.MD v9.1 - PRD-Based Autonomous Validation Framework
 * November 25, 2025
 * 
 * Defines component-level Product Requirements Documents (PRDs) with exact field mappings.
 * Each component has its own PRD specifying required fields, display rules, and validation.
 * 
 * User Decision: Component-level PRDs (most thorough validation)
 */

export interface FieldRequirement {
  field: string;
  dbColumn?: string;
  required: boolean;
  displayElement?: string;
  dataTestId?: string;
  fallbackValue?: any;
  fallbackStrategy?: 'smart_default' | 'lookup' | 'hide' | 'placeholder';
  validation?: (value: any) => boolean;
  formatRule?: string;
}

export interface ComponentPRD {
  componentId: string;
  componentName: string;
  description: string;
  route?: string;
  dataSource: {
    table: string;
    primaryKey: string;
    joins?: Array<{
      table: string;
      on: string;
      type: 'left' | 'inner';
    }>;
  };
  fields: FieldRequirement[];
  businessRules?: string[];
  successCriteria: {
    requiredFieldsComplete: number;
    dataTestIdsPresent: boolean;
    displayElementsRendered: boolean;
  };
}

export interface PagePRD {
  pageId: string;
  pageName: string;
  route: string;
  description: string;
  components: string[];
  userJourney: Array<{
    step: number;
    action: string;
    expectedResult: string;
    criticalPath: boolean;
  }>;
}

/**
 * Component PRD Registry
 * Central store for all component-level requirements
 */
export class ComponentPRDRegistry {
  private static componentPRDs: Map<string, ComponentPRD> = new Map();
  private static pagePRDs: Map<string, PagePRD> = new Map();

  static {
    this.initializeComponentPRDs();
    this.initializePagePRDs();
  }

  private static initializeComponentPRDs() {
    // =========================================================
    // EVENT DETAILS PAGE - EventDetailsCard Component
    // =========================================================
    this.componentPRDs.set('event-details-card', {
      componentId: 'event-details-card',
      componentName: 'EventDetailsCard',
      description: 'Main card displaying event information on EventDetailsPage',
      route: '/events/:id',
      dataSource: {
        table: 'events',
        primaryKey: 'id',
        joins: [
          { table: 'users', on: 'events.organizer_id = users.id', type: 'left' }
        ]
      },
      fields: [
        {
          field: 'title',
          dbColumn: 'title',
          required: true,
          displayElement: 'h1',
          dataTestId: 'text-event-title',
          validation: (v) => typeof v === 'string' && v.length > 0
        },
        {
          field: 'date',
          dbColumn: 'start_date',
          required: true,
          displayElement: 'span',
          dataTestId: 'text-event-date',
          formatRule: 'MMM dd, yyyy',
          validation: (v) => v instanceof Date || typeof v === 'string'
        },
        {
          field: 'location',
          dbColumn: 'location',
          required: true,
          displayElement: 'span',
          dataTestId: 'text-event-location',
          fallbackValue: 'Location TBA',
          fallbackStrategy: 'placeholder'
        },
        {
          field: 'organizer',
          dbColumn: 'organizer_id',
          required: true,
          displayElement: 'div',
          dataTestId: 'container-organizer',
          fallbackStrategy: 'smart_default',
          fallbackValue: { name: 'Community Event', avatar: null }
        },
        {
          field: 'organizerName',
          dbColumn: 'users.name',
          required: true,
          displayElement: 'span',
          dataTestId: 'text-organizer-name'
        },
        {
          field: 'organizerAvatar',
          dbColumn: 'users.profile_image',
          required: false,
          displayElement: 'img',
          dataTestId: 'img-organizer-avatar'
        },
        {
          field: 'price',
          dbColumn: 'price',
          required: true,
          displayElement: 'span',
          dataTestId: 'text-event-price',
          formatRule: 'currency_USD',
          fallbackValue: 0,
          fallbackStrategy: 'smart_default'
        },
        {
          field: 'description',
          dbColumn: 'description',
          required: false,
          displayElement: 'p',
          dataTestId: 'text-event-description'
        },
        {
          field: 'eventType',
          dbColumn: 'event_type',
          required: false,
          displayElement: 'Badge',
          dataTestId: 'badge-event-type'
        }
      ],
      businessRules: [
        'If organizer_id is NULL, auto-assign to event creator',
        'Price of 0 should display as "Free"',
        'Past events should show "Event Ended" badge'
      ],
      successCriteria: {
        requiredFieldsComplete: 100,
        dataTestIdsPresent: true,
        displayElementsRendered: true
      }
    });

    // =========================================================
    // POST ITEM - Feed Post Component
    // =========================================================
    this.componentPRDs.set('post-item', {
      componentId: 'post-item',
      componentName: 'PostItem',
      description: 'Individual post card in feed',
      route: '/feed',
      dataSource: {
        table: 'posts',
        primaryKey: 'id',
        joins: [
          { table: 'users', on: 'posts.user_id = users.id', type: 'left' }
        ]
      },
      fields: [
        {
          field: 'content',
          dbColumn: 'content',
          required: true,
          displayElement: 'div',
          dataTestId: 'text-post-content'
        },
        {
          field: 'authorName',
          dbColumn: 'users.name',
          required: true,
          displayElement: 'span',
          dataTestId: 'text-author-name'
        },
        {
          field: 'authorUsername',
          dbColumn: 'users.username',
          required: true,
          displayElement: 'span',
          dataTestId: 'text-author-username'
        },
        {
          field: 'authorAvatar',
          dbColumn: 'users.profile_image',
          required: false,
          displayElement: 'img',
          dataTestId: 'img-author-avatar'
        },
        {
          field: 'authorRoles',
          dbColumn: 'users.tango_roles',
          required: false,
          displayElement: 'div',
          dataTestId: 'container-author-roles'
        },
        {
          field: 'createdAt',
          dbColumn: 'created_at',
          required: true,
          displayElement: 'span',
          dataTestId: 'text-post-time',
          formatRule: 'relative_time'
        },
        {
          field: 'imageUrl',
          dbColumn: 'image_url',
          required: false,
          displayElement: 'img',
          dataTestId: 'img-post-media'
        },
        {
          field: 'likes',
          dbColumn: 'likes',
          required: true,
          displayElement: 'span',
          dataTestId: 'text-likes-count',
          fallbackValue: 0,
          fallbackStrategy: 'smart_default'
        },
        {
          field: 'comments',
          dbColumn: 'comments',
          required: true,
          displayElement: 'span',
          dataTestId: 'text-comments-count',
          fallbackValue: 0,
          fallbackStrategy: 'smart_default'
        }
      ],
      businessRules: [
        'Role icons only show for users with tangoRoles set',
        'Posts with postType="memory" also appear in MemoriesPage',
        'Private posts only visible to author'
      ],
      successCriteria: {
        requiredFieldsComplete: 100,
        dataTestIdsPresent: true,
        displayElementsRendered: true
      }
    });

    // =========================================================
    // MEMORY ITEM - Memories Grid Component
    // =========================================================
    this.componentPRDs.set('memory-item', {
      componentId: 'memory-item',
      componentName: 'MemoryItem',
      description: 'Individual memory card in memories grid (unified with posts)',
      route: '/memories',
      dataSource: {
        table: 'posts',
        primaryKey: 'id',
        joins: [
          { table: 'users', on: 'posts.user_id = users.id', type: 'left' }
        ]
      },
      fields: [
        {
          field: 'content',
          dbColumn: 'content',
          required: false,
          displayElement: 'p',
          dataTestId: 'text-memory-caption'
        },
        {
          field: 'imageUrl',
          dbColumn: 'image_url',
          required: false,
          displayElement: 'img',
          dataTestId: 'img-memory-media'
        },
        {
          field: 'videoUrl',
          dbColumn: 'video_url',
          required: false,
          displayElement: 'video',
          dataTestId: 'video-memory-media'
        },
        {
          field: 'createdAt',
          dbColumn: 'created_at',
          required: true,
          displayElement: 'span',
          dataTestId: 'text-memory-date',
          formatRule: 'date'
        },
        {
          field: 'authorName',
          dbColumn: 'users.name',
          required: true,
          displayElement: 'span',
          dataTestId: 'text-memory-author'
        },
        {
          field: 'location',
          dbColumn: 'location',
          required: false,
          displayElement: 'span',
          dataTestId: 'text-memory-location'
        },
        {
          field: 'postType',
          dbColumn: 'post_type',
          required: true,
          displayElement: null,
          dataTestId: null,
          validation: (v) => v === 'memory'
        }
      ],
      businessRules: [
        'Filter posts where postType = "memory"',
        'Memories must have at least one media (image or video) OR content',
        'Unified with posts table - no separate media table needed'
      ],
      successCriteria: {
        requiredFieldsComplete: 100,
        dataTestIdsPresent: true,
        displayElementsRendered: true
      }
    });

    // =========================================================
    // USER PROFILE HEADER - Profile Component
    // =========================================================
    this.componentPRDs.set('user-profile-header', {
      componentId: 'user-profile-header',
      componentName: 'UserProfileHeader',
      description: 'User profile header with avatar, name, roles',
      route: '/profile/:username',
      dataSource: {
        table: 'users',
        primaryKey: 'id'
      },
      fields: [
        {
          field: 'name',
          dbColumn: 'name',
          required: true,
          displayElement: 'h1',
          dataTestId: 'text-profile-name'
        },
        {
          field: 'username',
          dbColumn: 'username',
          required: true,
          displayElement: 'span',
          dataTestId: 'text-profile-username'
        },
        {
          field: 'profileImage',
          dbColumn: 'profile_image',
          required: false,
          displayElement: 'img',
          dataTestId: 'img-profile-avatar'
        },
        {
          field: 'bio',
          dbColumn: 'bio',
          required: false,
          displayElement: 'p',
          dataTestId: 'text-profile-bio'
        },
        {
          field: 'tangoRoles',
          dbColumn: 'tango_roles',
          required: false,
          displayElement: 'div',
          dataTestId: 'container-profile-roles'
        },
        {
          field: 'location',
          dbColumn: 'location',
          required: false,
          displayElement: 'span',
          dataTestId: 'text-profile-location'
        },
        {
          field: 'followersCount',
          dbColumn: 'followers_count',
          required: true,
          displayElement: 'span',
          dataTestId: 'text-followers-count',
          fallbackValue: 0,
          fallbackStrategy: 'smart_default'
        },
        {
          field: 'followingCount',
          dbColumn: 'following_count',
          required: true,
          displayElement: 'span',
          dataTestId: 'text-following-count',
          fallbackValue: 0,
          fallbackStrategy: 'smart_default'
        }
      ],
      businessRules: [
        'Role icons display based on tangoRoles array',
        'Show edit button for own profile',
        'Show friend request button for non-friends'
      ],
      successCriteria: {
        requiredFieldsComplete: 100,
        dataTestIdsPresent: true,
        displayElementsRendered: true
      }
    });
  }

  private static initializePagePRDs() {
    // =========================================================
    // EVENT DETAILS PAGE
    // =========================================================
    this.pagePRDs.set('event-details', {
      pageId: 'event-details',
      pageName: 'Event Details Page',
      route: '/events/:id',
      description: 'Displays full event information with RSVP functionality',
      components: ['event-details-card'],
      userJourney: [
        {
          step: 1,
          action: 'Navigate to event page',
          expectedResult: 'Event hero image and title displayed',
          criticalPath: true
        },
        {
          step: 2,
          action: 'View event details',
          expectedResult: 'Date, location, organizer, price visible',
          criticalPath: true
        },
        {
          step: 3,
          action: 'Click RSVP button',
          expectedResult: 'RSVP modal opens or status updates',
          criticalPath: true
        },
        {
          step: 4,
          action: 'View organizer profile',
          expectedResult: 'Organizer avatar and name link to profile',
          criticalPath: false
        }
      ]
    });

    // =========================================================
    // FEED PAGE
    // =========================================================
    this.pagePRDs.set('feed', {
      pageId: 'feed',
      pageName: 'Feed Page',
      route: '/feed',
      description: 'Main social feed with posts from connections',
      components: ['post-item'],
      userJourney: [
        {
          step: 1,
          action: 'Load feed page',
          expectedResult: 'Posts load with author info and reactions',
          criticalPath: true
        },
        {
          step: 2,
          action: 'React to a post',
          expectedResult: 'Reaction updates immediately',
          criticalPath: true
        },
        {
          step: 3,
          action: 'Open comments',
          expectedResult: 'Comments section expands with existing comments',
          criticalPath: true
        },
        {
          step: 4,
          action: 'Create new post',
          expectedResult: 'Post appears at top of feed',
          criticalPath: true
        }
      ]
    });

    // =========================================================
    // MEMORIES PAGE
    // =========================================================
    this.pagePRDs.set('memories', {
      pageId: 'memories',
      pageName: 'Memories Page',
      route: '/memories',
      description: 'Grid view of user memories (photos/videos from posts)',
      components: ['memory-item'],
      userJourney: [
        {
          step: 1,
          action: 'Navigate to memories page',
          expectedResult: 'Grid of memories loads from posts with postType=memory',
          criticalPath: true
        },
        {
          step: 2,
          action: 'Filter by type (photos/videos)',
          expectedResult: 'Grid updates to show only selected type',
          criticalPath: false
        },
        {
          step: 3,
          action: 'Click on memory',
          expectedResult: 'Lightbox opens with full media',
          criticalPath: true
        },
        {
          step: 4,
          action: 'Upload new memory',
          expectedResult: 'Memory added to grid and posts table',
          criticalPath: true
        }
      ]
    });
  }

  /**
   * Get Component PRD
   */
  static getComponentPRD(componentId: string): ComponentPRD | undefined {
    return this.componentPRDs.get(componentId);
  }

  /**
   * Get Page PRD
   */
  static getPagePRD(pageId: string): PagePRD | undefined {
    return this.pagePRDs.get(pageId);
  }

  /**
   * Get all component PRDs for a page
   */
  static getPageComponents(pageId: string): ComponentPRD[] {
    const pagePRD = this.pagePRDs.get(pageId);
    if (!pagePRD) return [];
    
    return pagePRD.components
      .map(id => this.componentPRDs.get(id))
      .filter((c): c is ComponentPRD => c !== undefined);
  }

  /**
   * Get all registered component IDs
   */
  static getAllComponentIds(): string[] {
    return Array.from(this.componentPRDs.keys());
  }

  /**
   * Get all registered page IDs
   */
  static getAllPageIds(): string[] {
    return Array.from(this.pagePRDs.keys());
  }

  /**
   * Get required fields for a component
   */
  static getRequiredFields(componentId: string): FieldRequirement[] {
    const prd = this.componentPRDs.get(componentId);
    if (!prd) return [];
    return prd.fields.filter(f => f.required);
  }

  /**
   * Get fields with smart defaults
   */
  static getFieldsWithDefaults(componentId: string): FieldRequirement[] {
    const prd = this.componentPRDs.get(componentId);
    if (!prd) return [];
    return prd.fields.filter(f => f.fallbackStrategy === 'smart_default');
  }
}
