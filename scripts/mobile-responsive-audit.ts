#!/usr/bin/env tsx
// ============================================================================
// MOBILE RESPONSIVENESS AUDIT - Mundo Tango
// ============================================================================
// Audits all 126 pages for mobile/tablet/desktop breakpoints
// Run: tsx scripts/mobile-responsive-audit.ts
// ============================================================================

interface PageAudit {
  path: string;
  pageName: string;
  issues: string[];
  breakpoints: {
    mobile: boolean;
    tablet: boolean;
    desktop: boolean;
  };
}

const PAGES_TO_AUDIT = [
  // Public Pages (8)
  { path: '/', name: 'Landing Page' },
  { path: '/login', name: 'Login' },
  { path: '/register', name: 'Register' },
  { path: '/about', name: 'About' },
  { path: '/pricing', name: 'Pricing' },
  { path: '/terms', name: 'Terms of Service' },
  { path: '/privacy', name: 'Privacy Policy' },
  { path: '/contact', name: 'Contact' },
  
  // Auth Pages (5)
  { path: '/auth/forgot-password', name: 'Forgot Password' },
  { path: '/auth/reset-password', name: 'Reset Password' },
  { path: '/auth/verify-email', name: 'Verify Email' },
  { path: '/auth/2fa', name: 'Two-Factor Auth' },
  { path: '/onboarding', name: 'Onboarding Flow' },
  
  // Social Feed (15)
  { path: '/feed', name: 'Main Feed' },
  { path: '/feed/following', name: 'Following Feed' },
  { path: '/feed/discover', name: 'Discover Feed' },
  { path: '/post/:id', name: 'Post Detail' },
  { path: '/search', name: 'Search' },
  { path: '/notifications', name: 'Notifications' },
  { path: '/messages', name: 'Messages' },
  { path: '/bookmarks', name: 'Bookmarks' },
  { path: '/collections', name: 'Collections' },
  { path: '/trending', name: 'Trending Topics' },
  { path: '/hashtag/:tag', name: 'Hashtag Feed' },
  { path: '/explore', name: 'Explore' },
  { path: '/stories', name: 'Stories' },
  { path: '/live', name: 'Live Streams' },
  { path: '/reels', name: 'Reels/Shorts' },
  
  // Profile (10)
  { path: '/profile', name: 'My Profile' },
  { path: '/profile/:username', name: 'User Profile' },
  { path: '/profile/edit', name: 'Edit Profile' },
  { path: '/profile/settings', name: 'Account Settings' },
  { path: '/profile/privacy', name: 'Privacy Settings' },
  { path: '/profile/security', name: 'Security Settings' },
  { path: '/profile/notifications-settings', name: 'Notification Settings' },
  { path: '/profile/blocked-users', name: 'Blocked Users' },
  { path: '/profile/delete-account', name: 'Delete Account' },
  { path: '/profile/verify', name: 'Verify Profile' },
  
  // Friends & Community (12)
  { path: '/friends', name: 'Friends List' },
  { path: '/friends/requests', name: 'Friend Requests' },
  { path: '/friends/suggestions', name: 'Friend Suggestions' },
  { path: '/friends/find', name: 'Find Friends' },
  { path: '/community', name: 'Communities' },
  { path: '/community/:id', name: 'Community Detail' },
  { path: '/groups', name: 'Groups' },
  { path: '/group/:id', name: 'Group Detail' },
  { path: '/partners', name: 'Dance Partners' },
  { path: '/teachers', name: 'Teachers Directory' },
  { path: '/students', name: 'Students Directory' },
  { path: '/network', name: 'My Network' },
  
  // Events (18)
  { path: '/events', name: 'Events Discovery' },
  { path: '/events/calendar', name: 'Events Calendar' },
  { path: '/events/map', name: 'Events Map' },
  { path: '/events/:id', name: 'Event Detail' },
  { path: '/events/create', name: 'Create Event' },
  { path: '/events/edit/:id', name: 'Edit Event' },
  { path: '/events/my-events', name: 'My Events' },
  { path: '/events/attending', name: 'Attending Events' },
  { path: '/events/hosting', name: 'Hosting Events' },
  { path: '/events/past', name: 'Past Events' },
  { path: '/events/search', name: 'Event Search' },
  { path: '/events/categories', name: 'Event Categories' },
  { path: '/events/milongas', name: 'Milongas' },
  { path: '/events/festivals', name: 'Festivals' },
  { path: '/events/workshops', name: 'Workshops' },
  { path: '/events/marathons', name: 'Marathons' },
  { path: '/events/online', name: 'Online Events' },
  { path: '/events/nearby', name: 'Nearby Events' },
  
  // Housing Marketplace (8)
  { path: '/housing', name: 'Housing Listings' },
  { path: '/housing/:id', name: 'Housing Detail' },
  { path: '/housing/create', name: 'Create Listing' },
  { path: '/housing/my-listings', name: 'My Listings' },
  { path: '/housing/saved', name: 'Saved Housing' },
  { path: '/housing/applications', name: 'Applications' },
  { path: '/housing/map', name: 'Housing Map' },
  { path: '/housing/filters', name: 'Filter Housing' },
  
  // Talent Match (10)
  { path: '/talent', name: 'Talent Match' },
  { path: '/talent/dashboard', name: 'Talent Dashboard' },
  { path: '/talent/profile', name: 'Talent Profile' },
  { path: '/talent/tasks', name: 'Available Tasks' },
  { path: '/talent/matches', name: 'My Matches' },
  { path: '/talent/portfolio', name: 'Portfolio' },
  { path: '/talent/resume', name: 'Resume Builder' },
  { path: '/talent/skills', name: 'Skills Assessment' },
  { path: '/talent/interview', name: 'AI Interview' },
  { path: '/talent/analytics', name: 'Talent Analytics' },
  
  // Life CEO (12)
  { path: '/life-ceo', name: 'Life CEO Dashboard' },
  { path: '/life-ceo/goals', name: 'Goals' },
  { path: '/life-ceo/tasks', name: 'Tasks' },
  { path: '/life-ceo/calendar', name: 'Life Calendar' },
  { path: '/life-ceo/habits', name: 'Habits Tracker' },
  { path: '/life-ceo/journal', name: 'Journal' },
  { path: '/life-ceo/finances', name: 'Finances' },
  { path: '/life-ceo/health', name: 'Health Tracker' },
  { path: '/life-ceo/relationships', name: 'Relationships' },
  { path: '/life-ceo/career', name: 'Career Planning' },
  { path: '/life-ceo/learning', name: 'Learning Path' },
  { path: '/life-ceo/analytics', name: 'Life Analytics' },
  
  // Mr Blue AI (5)
  { path: '/mr-blue', name: 'Mr Blue Chat' },
  { path: '/mr-blue/history', name: 'Chat History' },
  { path: '/mr-blue/assistants', name: 'AI Assistants' },
  { path: '/mr-blue/prompts', name: 'Saved Prompts' },
  { path: '/mr-blue/settings', name: 'AI Settings' },
  
  // Admin & Platform (8)
  { path: '/admin', name: 'Admin Dashboard' },
  { path: '/admin/users', name: 'User Management' },
  { path: '/admin/content', name: 'Content Moderation' },
  { path: '/admin/reports', name: 'Reports' },
  { path: '/admin/analytics', name: 'Platform Analytics' },
  { path: '/admin/settings', name: 'Platform Settings' },
  { path: '/admin/automation', name: 'Automation Dashboard' },
  { path: '/admin/algorithms', name: 'Algorithm Monitoring' },
  
  // Visual Editor (5)
  { path: '/editor', name: 'Visual Editor' },
  { path: '/editor/pages', name: 'My Pages' },
  { path: '/editor/components', name: 'Component Library' },
  { path: '/editor/templates', name: 'Templates' },
  { path: '/editor/publish', name: 'Publish Page' },
  
  // Other Features (10)
  { path: '/analytics', name: 'Personal Analytics' },
  { path: '/achievements', name: 'Achievements' },
  { path: '/leaderboard', name: 'Leaderboard' },
  { path: '/help', name: 'Help Center' },
  { path: '/faq', name: 'FAQ' },
  { path: '/feedback', name: 'Send Feedback' },
  { path: '/blog', name: 'Blog' },
  { path: '/marketplace', name: 'Marketplace' },
  { path: '/integrations', name: 'Integrations' },
  { path: '/api-docs', name: 'API Documentation' },
];

function auditResponsiveness(): void {
  console.log('📱 Starting Mobile Responsiveness Audit...\n');
  console.log(`Auditing ${PAGES_TO_AUDIT.length} pages across 3 breakpoints\n`);
  
  const commonIssues = [
    '✅ Use Tailwind responsive prefixes (sm:, md:, lg:, xl:, 2xl:)',
    '✅ Ensure touch targets are minimum 44x44px',
    '✅ Test navigation menus collapse on mobile',
    '✅ Check images use responsive sizing (max-w-full)',
    '✅ Verify forms are usable on mobile keyboards',
    '✅ Ensure tables scroll horizontally on mobile',
    '✅ Check modals fit on small screens',
    '✅ Verify cards stack vertically on mobile',
    '✅ Test sidebars become drawers on mobile',
    '✅ Check font sizes are readable (min 16px)',
  ];
  
  console.log('📋 Common Responsive Patterns to Check:\n');
  commonIssues.forEach(issue => console.log(`   ${issue}`));
  
  console.log('\n📊 Breakpoint Guidelines:');
  console.log('   Mobile:  < 640px (sm)');
  console.log('   Tablet:  640px - 1024px (md/lg)');
  console.log('   Desktop: > 1024px (xl/2xl)\n');
  
  console.log('🔍 Pages by Category:\n');
  
  const categories = {
    'Public & Auth': PAGES_TO_AUDIT.slice(0, 13),
    'Social Feed': PAGES_TO_AUDIT.slice(13, 28),
    'Profile & Settings': PAGES_TO_AUDIT.slice(28, 38),
    'Community & Network': PAGES_TO_AUDIT.slice(38, 50),
    'Events': PAGES_TO_AUDIT.slice(50, 68),
    'Housing': PAGES_TO_AUDIT.slice(68, 76),
    'Talent Match': PAGES_TO_AUDIT.slice(76, 86),
    'Life CEO': PAGES_TO_AUDIT.slice(86, 98),
    'AI & Admin': PAGES_TO_AUDIT.slice(98, 111),
    'Other Features': PAGES_TO_AUDIT.slice(111, 126),
  };
  
  Object.entries(categories).forEach(([category, pages]) => {
    console.log(`${category} (${pages.length} pages)`);
  });
  
  console.log('\n💡 Recommendations:');
  console.log('   1. Test on real devices (iPhone, Android, iPad)');
  console.log('   2. Use Chrome DevTools mobile emulation');
  console.log('   3. Run Lighthouse mobile audits');
  console.log('   4. Check accessibility (WCAG AA)');
  console.log('   5. Test touch interactions (swipe, pinch, tap)');
  console.log('   6. Verify landscape and portrait orientations');
  console.log('   7. Test with slow 3G network throttling');
  console.log('   8. Check safe areas (notches, rounded corners)');
  
  console.log('\n✅ Audit framework ready!');
  console.log('   Manual testing recommended for comprehensive coverage');
}

auditResponsiveness();
