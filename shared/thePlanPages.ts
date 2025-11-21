/**
 * THE PLAN: Scott's First-Time Login Self-Healing Tour
 * Based on ULTIMATE_ZERO_TO_DEPLOY_PART_10
 * 50 pages across 10 phases for comprehensive platform validation
 */

export interface PlanPageChecklistItem {
  label: string;
  status: 'pass' | 'fail' | 'pending';
  docReference?: string;
}

export interface PlanPage {
  id: number;
  name: string;
  phase: string;
  route: string;
  checklist: PlanPageChecklistItem[];
}

export const THE_PLAN_PAGES: PlanPage[] = [
  // ==========================================
  // PHASE 1: CORE PLATFORM (Parts 1-3)
  // ==========================================
  {
    id: 1,
    name: 'Dashboard / Home Feed',
    phase: 'Core Platform',
    route: '/dashboard',
    checklist: [
      { label: 'Feed loads with posts', status: 'pending', docReference: 'Part 1-3' },
      { label: 'Post creation works', status: 'pending' },
      { label: 'Notifications visible', status: 'pending' },
      { label: 'Navigation responsive', status: 'pending' }
    ]
  },
  {
    id: 2,
    name: 'User Profile Page',
    phase: 'Core Platform',
    route: '/profile',
    checklist: [
      { label: 'Profile photo upload', status: 'pending', docReference: 'Part 4, Section 3.2' },
      { label: 'Bio editor with i18n', status: 'pending' },
      { label: 'Tango roles selector', status: 'pending' },
      { label: 'Social links display', status: 'pending' },
      { label: 'Professional score visible', status: 'pending' }
    ]
  },
  {
    id: 3,
    name: 'Profile Settings',
    phase: 'Core Platform',
    route: '/settings',
    checklist: [
      { label: 'Edit profile info', status: 'pending' },
      { label: 'Update tango experience', status: 'pending' },
      { label: 'Change password', status: 'pending' },
      { label: 'Account preferences', status: 'pending' }
    ]
  },
  {
    id: 4,
    name: 'Privacy & Security',
    phase: 'Core Platform',
    route: '/settings/privacy',
    checklist: [
      { label: 'Privacy settings configured', status: 'pending' },
      { label: 'Data visibility controls', status: 'pending' },
      { label: 'Account security options', status: 'pending' }
    ]
  },
  {
    id: 5,
    name: 'Notification Settings',
    phase: 'Core Platform',
    route: '/settings/notifications',
    checklist: [
      { label: 'Email preferences', status: 'pending' },
      { label: 'Push notification controls', status: 'pending' },
      { label: 'Notification frequency', status: 'pending' }
    ]
  },
  {
    id: 6,
    name: 'Search & Discover',
    phase: 'Core Platform',
    route: '/search',
    checklist: [
      { label: 'User search works', status: 'pending' },
      { label: 'Event search functional', status: 'pending' },
      { label: 'Group discovery', status: 'pending' },
      { label: 'Filters apply correctly', status: 'pending' }
    ]
  },

  // ==========================================
  // PHASE 2: SOCIAL FEATURES (Part 4)
  // ==========================================
  {
    id: 7,
    name: 'Friendship System',
    phase: 'Social Features',
    route: '/friends',
    checklist: [
      { label: 'Friends list displays', status: 'pending', docReference: 'Part 4' },
      { label: 'Closeness scores visible', status: 'pending' },
      { label: 'Connection degrees shown', status: 'pending' }
    ]
  },
  {
    id: 8,
    name: 'Friendship Requests',
    phase: 'Social Features',
    route: '/friends/requests',
    checklist: [
      { label: 'Send friend request', status: 'pending' },
      { label: 'Accept/decline requests', status: 'pending' },
      { label: 'Request notifications', status: 'pending' }
    ]
  },
  {
    id: 9,
    name: 'Friendship Pages',
    phase: 'Social Features',
    route: '/friendship',
    checklist: [
      { label: 'Detailed friendship view', status: 'pending' },
      { label: 'Shared memories visible', status: 'pending' },
      { label: 'Interaction history', status: 'pending' }
    ]
  },
  {
    id: 10,
    name: 'Memory Feed',
    phase: 'Social Features',
    route: '/memories',
    checklist: [
      { label: 'Memories display chronologically', status: 'pending' },
      { label: 'Photo/video memories', status: 'pending' },
      { label: 'Memory sharing works', status: 'pending' }
    ]
  },
  {
    id: 11,
    name: 'Post Creator',
    phase: 'Social Features',
    route: '/feed',
    checklist: [
      { label: 'Create text post', status: 'pending' },
      { label: 'Upload images/videos', status: 'pending' },
      { label: 'Tag friends', status: 'pending' },
      { label: 'Set post visibility', status: 'pending' }
    ]
  },
  {
    id: 12,
    name: 'Comments System',
    phase: 'Social Features',
    route: '/feed',
    checklist: [
      { label: 'Add comments to posts', status: 'pending' },
      { label: 'Reply to comments', status: 'pending' },
      { label: 'Like/react to comments', status: 'pending' }
    ]
  },

  // ==========================================
  // PHASE 3: COMMUNITIES & EVENTS (Part 5)
  // ==========================================
  {
    id: 13,
    name: 'Community Map (Tango Map)',
    phase: 'Communities & Events',
    route: '/community/map',
    checklist: [
      { label: 'World map renders', status: 'pending', docReference: 'Part 5' },
      { label: 'Communities plotted correctly', status: 'pending' },
      { label: 'Interactive markers', status: 'pending' },
      { label: 'Filtering by location', status: 'pending' }
    ]
  },
  {
    id: 14,
    name: 'City Groups',
    phase: 'Communities & Events',
    route: '/groups',
    checklist: [
      { label: 'City groups listed', status: 'pending' },
      { label: 'Join/leave groups', status: 'pending' },
      { label: 'Group feed displays', status: 'pending' }
    ]
  },
  {
    id: 15,
    name: 'Professional Groups',
    phase: 'Communities & Events',
    route: '/groups',
    checklist: [
      { label: 'Professional groups visible', status: 'pending' },
      { label: 'Role-based access', status: 'pending' },
      { label: 'Professional discussions', status: 'pending' }
    ]
  },
  {
    id: 16,
    name: 'Custom Groups',
    phase: 'Communities & Events',
    route: '/groups',
    checklist: [
      { label: 'Create custom group', status: 'pending' },
      { label: 'Set group privacy', status: 'pending' },
      { label: 'Invite members', status: 'pending' }
    ]
  },
  {
    id: 17,
    name: 'Event Calendar',
    phase: 'Communities & Events',
    route: '/events',
    checklist: [
      { label: 'Calendar view functional', status: 'pending' },
      { label: 'Events display correctly', status: 'pending' },
      { label: 'Filter by date/type', status: 'pending' }
    ]
  },
  {
    id: 18,
    name: 'Event Creation',
    phase: 'Communities & Events',
    route: '/events/create',
    checklist: [
      { label: 'Create new event', status: 'pending' },
      { label: 'Set event details', status: 'pending' },
      { label: 'Upload event image', status: 'pending' },
      { label: 'Set location/venue', status: 'pending' }
    ]
  },
  {
    id: 19,
    name: 'Event RSVP & Check-in',
    phase: 'Communities & Events',
    route: '/events',
    checklist: [
      { label: 'RSVP to events', status: 'pending' },
      { label: 'Check-in system works', status: 'pending' },
      { label: 'Attendee list visible', status: 'pending' }
    ]
  },

  // ==========================================
  // PHASE 4: HOUSING & CLASSIFIEDS (Part 6)
  // ==========================================
  {
    id: 20,
    name: 'Housing Marketplace',
    phase: 'Housing & Classifieds',
    route: '/housing',
    checklist: [
      { label: 'Browse housing listings', status: 'pending', docReference: 'Part 6' },
      { label: 'Filter by location/price', status: 'pending' },
      { label: 'View listing details', status: 'pending' }
    ]
  },
  {
    id: 21,
    name: 'Housing Listings Creation',
    phase: 'Housing & Classifieds',
    route: '/housing/create',
    checklist: [
      { label: 'Create new listing', status: 'pending' },
      { label: 'Upload property images', status: 'pending' },
      { label: 'Set pricing/availability', status: 'pending' }
    ]
  },
  {
    id: 22,
    name: 'Housing Search & Filters',
    phase: 'Housing & Classifieds',
    route: '/housing',
    checklist: [
      { label: 'Advanced search works', status: 'pending' },
      { label: 'Price range filtering', status: 'pending' },
      { label: 'Location-based search', status: 'pending' }
    ]
  },

  // ==========================================
  // PHASE 5: MESSAGING (Part 7)
  // ==========================================
  {
    id: 23,
    name: 'All-in-One Messaging',
    phase: 'Messaging',
    route: '/messages',
    checklist: [
      { label: 'Message inbox loads', status: 'pending', docReference: 'Part 7' },
      { label: 'Real-time updates', status: 'pending' },
      { label: 'Unread count accurate', status: 'pending' }
    ]
  },
  {
    id: 24,
    name: 'Direct Messages',
    phase: 'Messaging',
    route: '/messages',
    checklist: [
      { label: 'Send direct message', status: 'pending' },
      { label: 'Receive messages', status: 'pending' },
      { label: 'Message history', status: 'pending' }
    ]
  },
  {
    id: 25,
    name: 'Group Chats',
    phase: 'Messaging',
    route: '/messages',
    checklist: [
      { label: 'Create group chat', status: 'pending' },
      { label: 'Add/remove participants', status: 'pending' },
      { label: 'Group message history', status: 'pending' }
    ]
  },
  {
    id: 26,
    name: 'Message Threads',
    phase: 'Messaging',
    route: '/messages',
    checklist: [
      { label: 'Thread conversations', status: 'pending' },
      { label: 'Reply to specific messages', status: 'pending' },
      { label: 'Thread notifications', status: 'pending' }
    ]
  },

  // ==========================================
  // PHASE 6: SUBSCRIPTIONS & PAYMENTS (Part 8)
  // ==========================================
  {
    id: 27,
    name: 'Subscription Plans',
    phase: 'Subscriptions & Payments',
    route: '/pricing',
    checklist: [
      { label: 'Plans display correctly', status: 'pending', docReference: 'Part 8' },
      { label: 'Feature comparison visible', status: 'pending' },
      { label: 'Pricing accurate', status: 'pending' }
    ]
  },
  {
    id: 28,
    name: 'Payment Integration (Stripe)',
    phase: 'Subscriptions & Payments',
    route: '/pricing',
    checklist: [
      { label: 'Stripe checkout works', status: 'pending' },
      { label: 'Payment processing', status: 'pending' },
      { label: 'Subscription activation', status: 'pending' }
    ]
  },
  {
    id: 29,
    name: 'Billing History',
    phase: 'Subscriptions & Payments',
    route: '/settings/billing',
    checklist: [
      { label: 'Past invoices visible', status: 'pending' },
      { label: 'Download receipts', status: 'pending' },
      { label: 'Payment history accurate', status: 'pending' }
    ]
  },
  {
    id: 30,
    name: 'Invoice Management',
    phase: 'Subscriptions & Payments',
    route: '/settings/billing',
    checklist: [
      { label: 'View invoice details', status: 'pending' },
      { label: 'Print/download invoices', status: 'pending' },
      { label: 'Invoice search/filter', status: 'pending' }
    ]
  },

  // ==========================================
  // PHASE 7: ADMIN TOOLS (Part 9)
  // ==========================================
  {
    id: 31,
    name: 'Admin Dashboard',
    phase: 'Admin Tools',
    route: '/admin/dashboard',
    checklist: [
      { label: 'Admin panel accessible', status: 'pending', docReference: 'Part 9' },
      { label: 'Platform statistics visible', status: 'pending' },
      { label: 'Real-time metrics', status: 'pending' }
    ]
  },
  {
    id: 32,
    name: 'User Management',
    phase: 'Admin Tools',
    route: '/admin/users',
    checklist: [
      { label: 'User list displays', status: 'pending' },
      { label: 'Edit user details', status: 'pending' },
      { label: 'Suspend/activate users', status: 'pending' }
    ]
  },
  {
    id: 33,
    name: 'Content Moderation',
    phase: 'Admin Tools',
    route: '/admin/moderation',
    checklist: [
      { label: 'Flagged content visible', status: 'pending' },
      { label: 'Approve/reject content', status: 'pending' },
      { label: 'Moderation queue works', status: 'pending' }
    ]
  },
  {
    id: 34,
    name: 'Analytics & Insights',
    phase: 'Admin Tools',
    route: '/admin/analytics',
    checklist: [
      { label: 'User analytics display', status: 'pending' },
      { label: 'Engagement metrics', status: 'pending' },
      { label: 'Growth trends visible', status: 'pending' }
    ]
  },
  {
    id: 35,
    name: 'ESA Mind Dashboard',
    phase: 'Admin Tools',
    route: '/admin/esa-mind',
    checklist: [
      { label: 'Agent status dashboard', status: 'pending' },
      { label: '1,218 agents listed', status: 'pending' },
      { label: 'Agent health metrics', status: 'pending' }
    ]
  },
  {
    id: 36,
    name: 'Visual Editor',
    phase: 'Admin Tools',
    route: '/visual-editor',
    checklist: [
      { label: 'Visual editor loads', status: 'pending' },
      { label: 'Live preview works', status: 'pending' },
      { label: 'Element selection functional', status: 'pending' }
    ]
  },
  {
    id: 37,
    name: 'Project Tracker (Agent #65)',
    phase: 'Admin Tools',
    route: '/admin/project-tracker',
    checklist: [
      { label: 'Project list displays', status: 'pending' },
      { label: 'Task tracking works', status: 'pending' },
      { label: 'Agent #65 operational', status: 'pending' }
    ]
  },
  {
    id: 38,
    name: 'Compliance Center (TrustCloud)',
    phase: 'Admin Tools',
    route: '/admin/compliance',
    checklist: [
      { label: 'Compliance dashboard loads', status: 'pending' },
      { label: 'GDPR tools functional', status: 'pending' },
      { label: 'Audit logs visible', status: 'pending' }
    ]
  },

  // ==========================================
  // PHASE 8: MR. BLUE FEATURES
  // ==========================================
  {
    id: 39,
    name: 'Mr. Blue Chat Interface',
    phase: 'Mr. Blue Features',
    route: '/mr-blue/chat',
    checklist: [
      { label: 'Chat interface loads', status: 'pending', docReference: 'Mr. Blue Handoff' },
      { label: 'AI responses functional', status: 'pending' },
      { label: 'Context awareness works', status: 'pending' }
    ]
  },
  {
    id: 40,
    name: 'Mr. Blue 3D Avatar',
    phase: 'Mr. Blue Features',
    route: '/mr-blue/chat',
    checklist: [
      { label: '3D avatar renders', status: 'pending' },
      { label: 'Avatar animations smooth', status: 'pending' },
      { label: 'Lip sync works', status: 'pending' }
    ]
  },
  {
    id: 41,
    name: 'Mr. Blue Video Avatar (D-ID)',
    phase: 'Mr. Blue Features',
    route: '/mr-blue/chat',
    checklist: [
      { label: 'D-ID video integration', status: 'pending' },
      { label: 'Video avatar playback', status: 'pending' },
      { label: 'Stream quality acceptable', status: 'pending' }
    ]
  },
  {
    id: 42,
    name: 'Mr. Blue Tours System',
    phase: 'Mr. Blue Features',
    route: '/mr-blue/tours',
    checklist: [
      { label: 'Tour system functional', status: 'pending' },
      { label: 'Guided walkthroughs work', status: 'pending' },
      { label: 'Step-by-step navigation', status: 'pending' }
    ]
  },
  {
    id: 43,
    name: 'Mr. Blue Suggestions',
    phase: 'Mr. Blue Features',
    route: '/mr-blue/chat',
    checklist: [
      { label: 'AI suggestions appear', status: 'pending' },
      { label: 'Context-aware recommendations', status: 'pending' },
      { label: 'Actionable suggestions', status: 'pending' }
    ]
  },
  {
    id: 44,
    name: 'AI Help Button',
    phase: 'Mr. Blue Features',
    route: '/mr-blue/chat',
    checklist: [
      { label: 'Help button accessible', status: 'pending' },
      { label: 'Quick help responses', status: 'pending' },
      { label: 'Context help works', status: 'pending' }
    ]
  },

  // ==========================================
  // PHASE 9: INTERNATIONALIZATION (Part 9)
  // ==========================================
  {
    id: 45,
    name: 'Language Switcher (68 languages)',
    phase: 'Internationalization',
    route: '/settings',
    checklist: [
      { label: 'Language switcher visible', status: 'pending', docReference: 'Part 9' },
      { label: '68 languages available', status: 'pending' },
      { label: 'Language change applies', status: 'pending' }
    ]
  },
  {
    id: 46,
    name: 'Translation Management',
    phase: 'Internationalization',
    route: '/admin/translations',
    checklist: [
      { label: 'Translation editor works', status: 'pending' },
      { label: 'Missing translations flagged', status: 'pending' },
      { label: 'Export/import translations', status: 'pending' }
    ]
  },

  // ==========================================
  // PHASE 10: SOCIAL DATA INTEGRATION (Part 10)
  // ==========================================
  {
    id: 47,
    name: 'Multi-Platform Scraping Setup',
    phase: 'Social Data Integration',
    route: '/admin/scraping',
    checklist: [
      { label: 'Scraping dashboard loads', status: 'pending', docReference: 'Part 10' },
      { label: 'Facebook scraping configured', status: 'pending' },
      { label: 'Instagram integration works', status: 'pending' }
    ]
  },
  {
    id: 48,
    name: 'Closeness Metrics Dashboard',
    phase: 'Social Data Integration',
    route: '/analytics/closeness',
    checklist: [
      { label: 'Closeness scores display', status: 'pending' },
      { label: 'Metrics visualization', status: 'pending' },
      { label: 'Historical data visible', status: 'pending' }
    ]
  },
  {
    id: 49,
    name: 'Professional Reputation Page',
    phase: 'Social Data Integration',
    route: '/profile/reputation',
    checklist: [
      { label: 'Reputation score visible', status: 'pending' },
      { label: 'Reviews display correctly', status: 'pending' },
      { label: 'Professional metrics accurate', status: 'pending' }
    ]
  },
  {
    id: 50,
    name: 'Invitation System',
    phase: 'Social Data Integration',
    route: '/invitations',
    checklist: [
      { label: 'Invitation page loads', status: 'pending' },
      { label: 'Send invitations works', status: 'pending' },
      { label: 'Track invitation status', status: 'pending' }
    ]
  }
];

export const getTotalPages = () => THE_PLAN_PAGES.length;

export const getPageById = (id: number) => 
  THE_PLAN_PAGES.find(page => page.id === id);

export const getPagesByPhase = (phase: string) => 
  THE_PLAN_PAGES.filter(page => page.phase === phase);

export const getPhases = () => 
  Array.from(new Set(THE_PLAN_PAGES.map(page => page.phase)));
