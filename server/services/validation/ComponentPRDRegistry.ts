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

    // =========================================================
    // MB.MD Q&A SESSION - COMPREHENSIVE PRDs FOR ALL PAGES
    // Replit AI → Mr. Blue Research Output
    // November 25, 2025
    // =========================================================

    // =========================================================
    // TEACHER CARD - Teachers List Component
    // =========================================================
    this.componentPRDs.set('teacher-card', {
      componentId: 'teacher-card',
      componentName: 'TeacherCard',
      description: 'Teacher profile card in teachers listing',
      route: '/teachers',
      dataSource: {
        table: 'teacher_profiles',
        primaryKey: 'id',
        joins: [
          { table: 'users', on: 'teacher_profiles.user_id = users.id', type: 'left' }
        ]
      },
      fields: [
        { field: 'name', dbColumn: 'users.name', required: true, displayElement: 'h3', dataTestId: 'text-teacher-name' },
        { field: 'profileImage', dbColumn: 'users.profile_image', required: false, displayElement: 'img', dataTestId: 'img-teacher-avatar' },
        { field: 'specialty', dbColumn: 'specialty', required: false, displayElement: 'span', dataTestId: 'text-teacher-specialty', fallbackValue: 'Tango Instructor', fallbackStrategy: 'smart_default' },
        { field: 'yearsExperience', dbColumn: 'years_experience', required: false, displayElement: 'span', dataTestId: 'text-teacher-experience', fallbackValue: 0, fallbackStrategy: 'smart_default' },
        { field: 'hourlyRate', dbColumn: 'hourly_rate', required: false, displayElement: 'span', dataTestId: 'text-teacher-rate', formatRule: 'currency' },
        { field: 'location', dbColumn: 'users.location', required: false, displayElement: 'span', dataTestId: 'text-teacher-location' },
        { field: 'rating', dbColumn: 'rating', required: false, displayElement: 'div', dataTestId: 'container-teacher-rating', fallbackValue: 0, fallbackStrategy: 'smart_default' }
      ],
      businessRules: ['Filter by specialty and location', 'Rating displays as stars'],
      successCriteria: { requiredFieldsComplete: 100, dataTestIdsPresent: true, displayElementsRendered: true }
    });

    // =========================================================
    // VENUE CARD - Venues List Component
    // =========================================================
    this.componentPRDs.set('venue-card', {
      componentId: 'venue-card',
      componentName: 'VenueCard',
      description: 'Venue card in venues listing',
      route: '/venues',
      dataSource: {
        table: 'venues',
        primaryKey: 'id'
      },
      fields: [
        { field: 'name', dbColumn: 'name', required: true, displayElement: 'h3', dataTestId: 'text-venue-name' },
        { field: 'address', dbColumn: 'address', required: true, displayElement: 'span', dataTestId: 'text-venue-address' },
        { field: 'city', dbColumn: 'city', required: true, displayElement: 'span', dataTestId: 'text-venue-city' },
        { field: 'imageUrl', dbColumn: 'image_url', required: false, displayElement: 'img', dataTestId: 'img-venue-photo' },
        { field: 'capacity', dbColumn: 'capacity', required: false, displayElement: 'span', dataTestId: 'text-venue-capacity' },
        { field: 'rating', dbColumn: 'rating', required: false, displayElement: 'div', dataTestId: 'container-venue-rating', fallbackValue: 0, fallbackStrategy: 'smart_default' },
        { field: 'venueType', dbColumn: 'venue_type', required: false, displayElement: 'Badge', dataTestId: 'badge-venue-type' }
      ],
      businessRules: ['Filter by city and venue type', 'Show upcoming events count'],
      successCriteria: { requiredFieldsComplete: 100, dataTestIdsPresent: true, displayElementsRendered: true }
    });

    // =========================================================
    // EVENT CARD - Events List Component
    // =========================================================
    this.componentPRDs.set('event-card', {
      componentId: 'event-card',
      componentName: 'EventCard',
      description: 'Event card in events listing',
      route: '/events',
      dataSource: {
        table: 'events',
        primaryKey: 'id',
        joins: [
          { table: 'users', on: 'events.organizer_id = users.id', type: 'left' }
        ]
      },
      fields: [
        { field: 'title', dbColumn: 'title', required: true, displayElement: 'h3', dataTestId: 'text-event-title' },
        { field: 'startDate', dbColumn: 'start_date', required: true, displayElement: 'span', dataTestId: 'text-event-date', formatRule: 'MMM dd' },
        { field: 'location', dbColumn: 'location', required: true, displayElement: 'span', dataTestId: 'text-event-location', fallbackValue: 'TBA', fallbackStrategy: 'placeholder' },
        { field: 'imageUrl', dbColumn: 'image_url', required: false, displayElement: 'img', dataTestId: 'img-event-cover' },
        { field: 'eventType', dbColumn: 'event_type', required: false, displayElement: 'Badge', dataTestId: 'badge-event-type' },
        { field: 'price', dbColumn: 'price', required: true, displayElement: 'span', dataTestId: 'text-event-price', fallbackValue: 0, fallbackStrategy: 'smart_default' },
        { field: 'organizerName', dbColumn: 'users.name', required: true, displayElement: 'span', dataTestId: 'text-organizer-name' }
      ],
      businessRules: ['Price 0 displays as Free', 'Past events show Ended badge'],
      successCriteria: { requiredFieldsComplete: 100, dataTestIdsPresent: true, displayElementsRendered: true }
    });

    // =========================================================
    // GROUP CARD - Groups List Component
    // =========================================================
    this.componentPRDs.set('group-card', {
      componentId: 'group-card',
      componentName: 'GroupCard',
      description: 'Group card in groups listing',
      route: '/groups',
      dataSource: {
        table: 'groups',
        primaryKey: 'id'
      },
      fields: [
        { field: 'name', dbColumn: 'name', required: true, displayElement: 'h3', dataTestId: 'text-group-name' },
        { field: 'description', dbColumn: 'description', required: false, displayElement: 'p', dataTestId: 'text-group-description' },
        { field: 'imageUrl', dbColumn: 'image_url', required: false, displayElement: 'img', dataTestId: 'img-group-cover' },
        { field: 'memberCount', dbColumn: 'member_count', required: true, displayElement: 'span', dataTestId: 'text-member-count', fallbackValue: 0, fallbackStrategy: 'smart_default' },
        { field: 'privacy', dbColumn: 'privacy', required: true, displayElement: 'Badge', dataTestId: 'badge-group-privacy', fallbackValue: 'public', fallbackStrategy: 'smart_default' }
      ],
      businessRules: ['Private groups require membership request', 'Show join/leave button based on membership'],
      successCriteria: { requiredFieldsComplete: 100, dataTestIdsPresent: true, displayElementsRendered: true }
    });

    // =========================================================
    // MARKETPLACE PRODUCT CARD
    // =========================================================
    this.componentPRDs.set('marketplace-product-card', {
      componentId: 'marketplace-product-card',
      componentName: 'MarketplaceProductCard',
      description: 'Product card in marketplace listing',
      route: '/marketplace',
      dataSource: {
        table: 'marketplace_products',
        primaryKey: 'id',
        joins: [
          { table: 'users', on: 'marketplace_products.seller_id = users.id', type: 'left' }
        ]
      },
      fields: [
        { field: 'name', dbColumn: 'name', required: true, displayElement: 'h3', dataTestId: 'text-product-name' },
        { field: 'price', dbColumn: 'price', required: true, displayElement: 'span', dataTestId: 'text-product-price', formatRule: 'currency' },
        { field: 'imageUrl', dbColumn: 'image_url', required: false, displayElement: 'img', dataTestId: 'img-product-photo' },
        { field: 'category', dbColumn: 'category', required: true, displayElement: 'Badge', dataTestId: 'badge-product-category' },
        { field: 'sellerName', dbColumn: 'users.name', required: true, displayElement: 'span', dataTestId: 'text-seller-name' },
        { field: 'rating', dbColumn: 'rating', required: false, displayElement: 'div', dataTestId: 'container-product-rating', fallbackValue: 0, fallbackStrategy: 'smart_default' },
        { field: 'inStock', dbColumn: 'in_stock', required: true, displayElement: 'Badge', dataTestId: 'badge-stock-status', fallbackValue: true, fallbackStrategy: 'smart_default' }
      ],
      businessRules: ['Out of stock items show disabled add to cart', 'Seller link to profile'],
      successCriteria: { requiredFieldsComplete: 100, dataTestIdsPresent: true, displayElementsRendered: true }
    });

    // =========================================================
    // NOTIFICATION ITEM
    // =========================================================
    this.componentPRDs.set('notification-item', {
      componentId: 'notification-item',
      componentName: 'NotificationItem',
      description: 'Individual notification in notifications panel',
      route: '/notifications',
      dataSource: {
        table: 'notifications',
        primaryKey: 'id',
        joins: [
          { table: 'users', on: 'notifications.actor_id = users.id', type: 'left' }
        ]
      },
      fields: [
        { field: 'type', dbColumn: 'type', required: true, displayElement: 'div', dataTestId: 'container-notification-icon' },
        { field: 'message', dbColumn: 'message', required: true, displayElement: 'p', dataTestId: 'text-notification-message' },
        { field: 'actorName', dbColumn: 'users.name', required: false, displayElement: 'span', dataTestId: 'text-actor-name' },
        { field: 'actorAvatar', dbColumn: 'users.profile_image', required: false, displayElement: 'img', dataTestId: 'img-actor-avatar' },
        { field: 'createdAt', dbColumn: 'created_at', required: true, displayElement: 'span', dataTestId: 'text-notification-time', formatRule: 'relative_time' },
        { field: 'isRead', dbColumn: 'is_read', required: true, displayElement: null, dataTestId: null, fallbackValue: false, fallbackStrategy: 'smart_default' }
      ],
      businessRules: ['Unread notifications highlighted', 'Click navigates to relevant content'],
      successCriteria: { requiredFieldsComplete: 100, dataTestIdsPresent: true, displayElementsRendered: true }
    });

    // =========================================================
    // MESSAGE THREAD ITEM
    // =========================================================
    this.componentPRDs.set('message-thread-item', {
      componentId: 'message-thread-item',
      componentName: 'MessageThreadItem',
      description: 'Message thread preview in messages list',
      route: '/messages',
      dataSource: {
        table: 'conversations',
        primaryKey: 'id',
        joins: [
          { table: 'users', on: 'conversations.participant_id = users.id', type: 'left' }
        ]
      },
      fields: [
        { field: 'participantName', dbColumn: 'users.name', required: true, displayElement: 'span', dataTestId: 'text-participant-name' },
        { field: 'participantAvatar', dbColumn: 'users.profile_image', required: false, displayElement: 'img', dataTestId: 'img-participant-avatar' },
        { field: 'lastMessage', dbColumn: 'last_message', required: false, displayElement: 'p', dataTestId: 'text-last-message' },
        { field: 'lastMessageTime', dbColumn: 'last_message_at', required: false, displayElement: 'span', dataTestId: 'text-message-time', formatRule: 'relative_time' },
        { field: 'unreadCount', dbColumn: 'unread_count', required: true, displayElement: 'Badge', dataTestId: 'badge-unread-count', fallbackValue: 0, fallbackStrategy: 'smart_default' }
      ],
      businessRules: ['Unread threads highlighted', 'Online status indicator'],
      successCriteria: { requiredFieldsComplete: 100, dataTestIdsPresent: true, displayElementsRendered: true }
    });

    // =========================================================
    // FRIEND CARD
    // =========================================================
    this.componentPRDs.set('friend-card', {
      componentId: 'friend-card',
      componentName: 'FriendCard',
      description: 'Friend/connection card in friends list',
      route: '/friends',
      dataSource: {
        table: 'users',
        primaryKey: 'id'
      },
      fields: [
        { field: 'name', dbColumn: 'name', required: true, displayElement: 'span', dataTestId: 'text-friend-name' },
        { field: 'username', dbColumn: 'username', required: true, displayElement: 'span', dataTestId: 'text-friend-username' },
        { field: 'profileImage', dbColumn: 'profile_image', required: false, displayElement: 'img', dataTestId: 'img-friend-avatar' },
        { field: 'tangoRoles', dbColumn: 'tango_roles', required: false, displayElement: 'div', dataTestId: 'container-friend-roles' },
        { field: 'location', dbColumn: 'location', required: false, displayElement: 'span', dataTestId: 'text-friend-location' },
        { field: 'mutualFriends', required: false, displayElement: 'span', dataTestId: 'text-mutual-friends', fallbackValue: 0, fallbackStrategy: 'smart_default' }
      ],
      businessRules: ['Show message button', 'Show remove friend option'],
      successCriteria: { requiredFieldsComplete: 100, dataTestIdsPresent: true, displayElementsRendered: true }
    });

    // =========================================================
    // TUTORIAL CARD
    // =========================================================
    this.componentPRDs.set('tutorial-card', {
      componentId: 'tutorial-card',
      componentName: 'TutorialCard',
      description: 'Tutorial video card in tutorials listing',
      route: '/tutorials',
      dataSource: {
        table: 'tutorials',
        primaryKey: 'id'
      },
      fields: [
        { field: 'title', dbColumn: 'title', required: true, displayElement: 'h3', dataTestId: 'text-tutorial-title' },
        { field: 'thumbnailUrl', dbColumn: 'thumbnail_url', required: false, displayElement: 'img', dataTestId: 'img-tutorial-thumbnail' },
        { field: 'duration', dbColumn: 'duration', required: false, displayElement: 'span', dataTestId: 'text-tutorial-duration', formatRule: 'duration' },
        { field: 'level', dbColumn: 'level', required: true, displayElement: 'Badge', dataTestId: 'badge-tutorial-level', fallbackValue: 'beginner', fallbackStrategy: 'smart_default' },
        { field: 'instructorName', dbColumn: 'instructor_name', required: false, displayElement: 'span', dataTestId: 'text-instructor-name' },
        { field: 'category', dbColumn: 'category', required: true, displayElement: 'Badge', dataTestId: 'badge-tutorial-category' }
      ],
      businessRules: ['Premium tutorials marked', 'Progress indicator for started tutorials'],
      successCriteria: { requiredFieldsComplete: 100, dataTestIdsPresent: true, displayElementsRendered: true }
    });

    // =========================================================
    // TRAVEL TRIP CARD
    // =========================================================
    this.componentPRDs.set('travel-trip-card', {
      componentId: 'travel-trip-card',
      componentName: 'TravelTripCard',
      description: 'Trip card in travel dashboard',
      route: '/travel',
      dataSource: {
        table: 'travel_plans',
        primaryKey: 'id'
      },
      fields: [
        { field: 'destination', dbColumn: 'destination', required: true, displayElement: 'h3', dataTestId: 'text-trip-destination' },
        { field: 'startDate', dbColumn: 'start_date', required: true, displayElement: 'span', dataTestId: 'text-trip-start', formatRule: 'MMM dd' },
        { field: 'endDate', dbColumn: 'end_date', required: true, displayElement: 'span', dataTestId: 'text-trip-end', formatRule: 'MMM dd' },
        { field: 'imageUrl', dbColumn: 'image_url', required: false, displayElement: 'img', dataTestId: 'img-trip-cover' },
        { field: 'status', dbColumn: 'status', required: true, displayElement: 'Badge', dataTestId: 'badge-trip-status', fallbackValue: 'planning', fallbackStrategy: 'smart_default' },
        { field: 'eventsCount', dbColumn: 'events_count', required: false, displayElement: 'span', dataTestId: 'text-events-count', fallbackValue: 0, fallbackStrategy: 'smart_default' }
      ],
      businessRules: ['Upcoming trips highlighted', 'Show event count for trip'],
      successCriteria: { requiredFieldsComplete: 100, dataTestIdsPresent: true, displayElementsRendered: true }
    });

    // =========================================================
    // SEARCH RESULT ITEM
    // =========================================================
    this.componentPRDs.set('search-result-item', {
      componentId: 'search-result-item',
      componentName: 'SearchResultItem',
      description: 'Search result item in search page',
      route: '/search',
      dataSource: {
        table: 'mixed',
        primaryKey: 'id'
      },
      fields: [
        { field: 'title', required: true, displayElement: 'h4', dataTestId: 'text-result-title' },
        { field: 'description', required: false, displayElement: 'p', dataTestId: 'text-result-description' },
        { field: 'type', required: true, displayElement: 'Badge', dataTestId: 'badge-result-type' },
        { field: 'imageUrl', required: false, displayElement: 'img', dataTestId: 'img-result-image' },
        { field: 'url', required: true, displayElement: 'a', dataTestId: 'link-result' }
      ],
      businessRules: ['Type indicates user/event/venue/group', 'Highlight matching text'],
      successCriteria: { requiredFieldsComplete: 100, dataTestIdsPresent: true, displayElementsRendered: true }
    });

    // =========================================================
    // CROWDFUNDING CAMPAIGN CARD
    // =========================================================
    this.componentPRDs.set('crowdfunding-campaign-card', {
      componentId: 'crowdfunding-campaign-card',
      componentName: 'CrowdfundingCampaignCard',
      description: 'Campaign card in crowdfunding dashboard',
      route: '/crowdfunding',
      dataSource: {
        table: 'crowdfunding_campaigns',
        primaryKey: 'id',
        joins: [
          { table: 'users', on: 'crowdfunding_campaigns.creator_id = users.id', type: 'left' }
        ]
      },
      fields: [
        { field: 'title', dbColumn: 'title', required: true, displayElement: 'h3', dataTestId: 'text-campaign-title' },
        { field: 'description', dbColumn: 'description', required: false, displayElement: 'p', dataTestId: 'text-campaign-description' },
        { field: 'imageUrl', dbColumn: 'image_url', required: false, displayElement: 'img', dataTestId: 'img-campaign-cover' },
        { field: 'goalAmount', dbColumn: 'goal_amount', required: true, displayElement: 'span', dataTestId: 'text-campaign-goal', formatRule: 'currency' },
        { field: 'currentAmount', dbColumn: 'current_amount', required: true, displayElement: 'span', dataTestId: 'text-campaign-raised', fallbackValue: 0, fallbackStrategy: 'smart_default' },
        { field: 'progress', required: true, displayElement: 'Progress', dataTestId: 'progress-campaign' },
        { field: 'backerCount', dbColumn: 'backer_count', required: true, displayElement: 'span', dataTestId: 'text-backer-count', fallbackValue: 0, fallbackStrategy: 'smart_default' },
        { field: 'endDate', dbColumn: 'end_date', required: true, displayElement: 'span', dataTestId: 'text-campaign-deadline' },
        { field: 'creatorName', dbColumn: 'users.name', required: true, displayElement: 'span', dataTestId: 'text-creator-name' }
      ],
      businessRules: ['Progress bar shows percentage funded', 'Ended campaigns show final status'],
      successCriteria: { requiredFieldsComplete: 100, dataTestIdsPresent: true, displayElementsRendered: true }
    });

    // =========================================================
    // CALENDAR EVENT ITEM
    // =========================================================
    this.componentPRDs.set('calendar-event-item', {
      componentId: 'calendar-event-item',
      componentName: 'CalendarEventItem',
      description: 'Event item in calendar view',
      route: '/calendar',
      dataSource: {
        table: 'events',
        primaryKey: 'id'
      },
      fields: [
        { field: 'title', dbColumn: 'title', required: true, displayElement: 'span', dataTestId: 'text-calendar-event-title' },
        { field: 'startTime', dbColumn: 'start_time', required: true, displayElement: 'span', dataTestId: 'text-calendar-event-time' },
        { field: 'location', dbColumn: 'location', required: false, displayElement: 'span', dataTestId: 'text-calendar-event-location' },
        { field: 'eventType', dbColumn: 'event_type', required: false, displayElement: null, dataTestId: null }
      ],
      businessRules: ['Color coded by event type', 'Click opens event details'],
      successCriteria: { requiredFieldsComplete: 100, dataTestIdsPresent: true, displayElementsRendered: true }
    });

    // =========================================================
    // ADMIN STATS CARD
    // =========================================================
    this.componentPRDs.set('admin-stats-card', {
      componentId: 'admin-stats-card',
      componentName: 'AdminStatsCard',
      description: 'Statistics card in admin dashboard',
      route: '/admin',
      dataSource: {
        table: 'system_stats',
        primaryKey: 'id'
      },
      fields: [
        { field: 'label', required: true, displayElement: 'span', dataTestId: 'text-stat-label' },
        { field: 'value', required: true, displayElement: 'span', dataTestId: 'text-stat-value' },
        { field: 'change', required: false, displayElement: 'span', dataTestId: 'text-stat-change' },
        { field: 'icon', required: false, displayElement: 'div', dataTestId: 'container-stat-icon' }
      ],
      businessRules: ['Positive change shows green', 'Negative change shows red'],
      successCriteria: { requiredFieldsComplete: 100, dataTestIdsPresent: true, displayElementsRendered: true }
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

    // =========================================================
    // MB.MD Q&A SESSION - COMPREHENSIVE PAGE PRDs
    // Replit AI → Mr. Blue Research Output
    // November 25, 2025
    // =========================================================

    // TEACHERS PAGE
    this.pagePRDs.set('teachers', {
      pageId: 'teachers',
      pageName: 'Teachers Page',
      route: '/teachers',
      description: 'Browse and discover tango teachers',
      components: ['teacher-card'],
      userJourney: [
        { step: 1, action: 'Load teachers page', expectedResult: 'Grid of teacher cards displayed', criticalPath: true },
        { step: 2, action: 'Filter by specialty', expectedResult: 'Results update to match filter', criticalPath: false },
        { step: 3, action: 'Click on teacher', expectedResult: 'Navigate to teacher profile', criticalPath: true }
      ]
    });

    // VENUES PAGE
    this.pagePRDs.set('venues', {
      pageId: 'venues',
      pageName: 'Venues Page',
      route: '/venues',
      description: 'Discover tango venues and dance studios',
      components: ['venue-card'],
      userJourney: [
        { step: 1, action: 'Load venues page', expectedResult: 'Grid of venue cards displayed', criticalPath: true },
        { step: 2, action: 'Filter by city', expectedResult: 'Results show venues in selected city', criticalPath: false },
        { step: 3, action: 'Click on venue', expectedResult: 'Navigate to venue details', criticalPath: true }
      ]
    });

    // EVENTS PAGE
    this.pagePRDs.set('events', {
      pageId: 'events',
      pageName: 'Events Page',
      route: '/events',
      description: 'Browse and discover tango events',
      components: ['event-card'],
      userJourney: [
        { step: 1, action: 'Load events page', expectedResult: 'Grid of event cards displayed with dates', criticalPath: true },
        { step: 2, action: 'Filter by event type', expectedResult: 'Results show only selected type', criticalPath: false },
        { step: 3, action: 'Click on event', expectedResult: 'Navigate to event details', criticalPath: true },
        { step: 4, action: 'Quick RSVP', expectedResult: 'RSVP status updates', criticalPath: true }
      ]
    });

    // GROUPS PAGE
    this.pagePRDs.set('groups', {
      pageId: 'groups',
      pageName: 'Groups Page',
      route: '/groups',
      description: 'Community groups for tango enthusiasts',
      components: ['group-card'],
      userJourney: [
        { step: 1, action: 'Load groups page', expectedResult: 'Grid of group cards displayed', criticalPath: true },
        { step: 2, action: 'Join public group', expectedResult: 'Membership confirmed', criticalPath: true },
        { step: 3, action: 'Create new group', expectedResult: 'Group creation form opens', criticalPath: false }
      ]
    });

    // MARKETPLACE PAGE
    this.pagePRDs.set('marketplace', {
      pageId: 'marketplace',
      pageName: 'Marketplace Page',
      route: '/marketplace',
      description: 'Buy and sell tango-related products',
      components: ['marketplace-product-card'],
      userJourney: [
        { step: 1, action: 'Load marketplace', expectedResult: 'Grid of products displayed', criticalPath: true },
        { step: 2, action: 'Add to cart', expectedResult: 'Cart updates with item', criticalPath: true },
        { step: 3, action: 'Filter by category', expectedResult: 'Results show only category', criticalPath: false },
        { step: 4, action: 'Checkout', expectedResult: 'Payment flow initiates', criticalPath: true }
      ]
    });

    // NOTIFICATIONS PAGE
    this.pagePRDs.set('notifications', {
      pageId: 'notifications',
      pageName: 'Notifications Page',
      route: '/notifications',
      description: 'View all notifications and alerts',
      components: ['notification-item'],
      userJourney: [
        { step: 1, action: 'Load notifications', expectedResult: 'List of notifications displayed', criticalPath: true },
        { step: 2, action: 'Click notification', expectedResult: 'Navigate to relevant content', criticalPath: true },
        { step: 3, action: 'Mark all read', expectedResult: 'All notifications marked as read', criticalPath: false }
      ]
    });

    // MESSAGES PAGE
    this.pagePRDs.set('messages', {
      pageId: 'messages',
      pageName: 'Messages Page',
      route: '/messages',
      description: 'Direct messaging with connections',
      components: ['message-thread-item'],
      userJourney: [
        { step: 1, action: 'Load messages', expectedResult: 'List of conversations displayed', criticalPath: true },
        { step: 2, action: 'Open conversation', expectedResult: 'Message thread opens', criticalPath: true },
        { step: 3, action: 'Send message', expectedResult: 'Message delivered', criticalPath: true },
        { step: 4, action: 'Start new conversation', expectedResult: 'User search opens', criticalPath: false }
      ]
    });

    // FRIENDS PAGE
    this.pagePRDs.set('friends', {
      pageId: 'friends',
      pageName: 'Friends Page',
      route: '/friends',
      description: 'Manage connections and friend requests',
      components: ['friend-card'],
      userJourney: [
        { step: 1, action: 'Load friends', expectedResult: 'List of friends displayed', criticalPath: true },
        { step: 2, action: 'View friend requests', expectedResult: 'Pending requests shown', criticalPath: true },
        { step: 3, action: 'Accept/reject request', expectedResult: 'Request processed', criticalPath: true }
      ]
    });

    // TUTORIALS PAGE
    this.pagePRDs.set('tutorials', {
      pageId: 'tutorials',
      pageName: 'Tutorials Page',
      route: '/tutorials',
      description: 'Learn tango with video tutorials',
      components: ['tutorial-card'],
      userJourney: [
        { step: 1, action: 'Load tutorials', expectedResult: 'Grid of tutorial cards displayed', criticalPath: true },
        { step: 2, action: 'Filter by level', expectedResult: 'Results match skill level', criticalPath: false },
        { step: 3, action: 'Play tutorial', expectedResult: 'Video player opens', criticalPath: true }
      ]
    });

    // TRAVEL DASHBOARD PAGE
    this.pagePRDs.set('travel', {
      pageId: 'travel',
      pageName: 'Travel Dashboard Page',
      route: '/travel',
      description: 'Plan tango trips and travel coordination',
      components: ['travel-trip-card'],
      userJourney: [
        { step: 1, action: 'Load travel dashboard', expectedResult: 'List of trips displayed', criticalPath: true },
        { step: 2, action: 'Create new trip', expectedResult: 'Trip planner opens', criticalPath: true },
        { step: 3, action: 'View trip details', expectedResult: 'Itinerary displayed', criticalPath: true }
      ]
    });

    // SEARCH PAGE
    this.pagePRDs.set('search', {
      pageId: 'search',
      pageName: 'Search Page',
      route: '/search',
      description: 'Search across all content types',
      components: ['search-result-item'],
      userJourney: [
        { step: 1, action: 'Enter search query', expectedResult: 'Results displayed', criticalPath: true },
        { step: 2, action: 'Filter by type', expectedResult: 'Results filtered by type', criticalPath: false },
        { step: 3, action: 'Click result', expectedResult: 'Navigate to item', criticalPath: true }
      ]
    });

    // CROWDFUNDING DASHBOARD PAGE
    this.pagePRDs.set('crowdfunding', {
      pageId: 'crowdfunding',
      pageName: 'Crowdfunding Dashboard Page',
      route: '/crowdfunding',
      description: 'Community crowdfunding campaigns',
      components: ['crowdfunding-campaign-card'],
      userJourney: [
        { step: 1, action: 'Load crowdfunding', expectedResult: 'Campaign cards displayed with progress', criticalPath: true },
        { step: 2, action: 'Back a campaign', expectedResult: 'Donation flow starts', criticalPath: true },
        { step: 3, action: 'Create campaign', expectedResult: 'Campaign form opens', criticalPath: false }
      ]
    });

    // CALENDAR PAGE
    this.pagePRDs.set('calendar', {
      pageId: 'calendar',
      pageName: 'Calendar Page',
      route: '/calendar',
      description: 'Personal event calendar',
      components: ['calendar-event-item'],
      userJourney: [
        { step: 1, action: 'Load calendar', expectedResult: 'Calendar view with events displayed', criticalPath: true },
        { step: 2, action: 'Navigate months', expectedResult: 'Calendar updates', criticalPath: true },
        { step: 3, action: 'Click on event', expectedResult: 'Event details shown', criticalPath: true }
      ]
    });

    // ADMIN DASHBOARD PAGE
    this.pagePRDs.set('admin', {
      pageId: 'admin',
      pageName: 'Admin Dashboard Page',
      route: '/admin',
      description: 'Administration and analytics dashboard',
      components: ['admin-stats-card'],
      userJourney: [
        { step: 1, action: 'Load admin dashboard', expectedResult: 'Stats cards displayed', criticalPath: true },
        { step: 2, action: 'View detailed analytics', expectedResult: 'Charts and graphs render', criticalPath: true },
        { step: 3, action: 'Moderate content', expectedResult: 'Moderation queue accessible', criticalPath: false }
      ]
    });

    // PROFILE PAGE
    this.pagePRDs.set('profile', {
      pageId: 'profile',
      pageName: 'Profile Page',
      route: '/profile/:username',
      description: 'User profile with posts and info',
      components: ['user-profile-header', 'post-item'],
      userJourney: [
        { step: 1, action: 'Load profile', expectedResult: 'Profile header with stats displayed', criticalPath: true },
        { step: 2, action: 'View posts', expectedResult: 'User posts listed', criticalPath: true },
        { step: 3, action: 'Follow/unfollow', expectedResult: 'Follow status updates', criticalPath: true },
        { step: 4, action: 'Send message', expectedResult: 'Message compose opens', criticalPath: false }
      ]
    });

    // DISCOVER PAGE
    this.pagePRDs.set('discover', {
      pageId: 'discover',
      pageName: 'Discover Page',
      route: '/discover',
      description: 'Discover new content and connections',
      components: ['event-card', 'friend-card', 'post-item'],
      userJourney: [
        { step: 1, action: 'Load discover', expectedResult: 'Curated content displayed', criticalPath: true },
        { step: 2, action: 'Explore recommendations', expectedResult: 'Navigate to recommended items', criticalPath: true }
      ]
    });

    // SETTINGS PAGE
    this.pagePRDs.set('settings', {
      pageId: 'settings',
      pageName: 'Settings Page',
      route: '/settings',
      description: 'User settings and preferences',
      components: [],
      userJourney: [
        { step: 1, action: 'Load settings', expectedResult: 'Settings sections displayed', criticalPath: true },
        { step: 2, action: 'Update profile', expectedResult: 'Changes saved', criticalPath: true },
        { step: 3, action: 'Change password', expectedResult: 'Password updated', criticalPath: true }
      ]
    });

    // COMMUNITY MAP PAGE
    this.pagePRDs.set('community-map', {
      pageId: 'community-map',
      pageName: 'Community Map Page',
      route: '/community-map',
      description: 'Global map of tango communities',
      components: [],
      userJourney: [
        { step: 1, action: 'Load map', expectedResult: 'Interactive map displayed', criticalPath: true },
        { step: 2, action: 'Click marker', expectedResult: 'Community popup opens', criticalPath: true },
        { step: 3, action: 'Filter by country', expectedResult: 'Map zooms to region', criticalPath: false }
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
