// ============================================================================
// ROUTE CONFIGURATION - Single Source of Truth
// ============================================================================
// MB.MD Phase 3: Breadcrumb System
// All routes defined here with metadata for automatic breadcrumb generation
// ============================================================================

export interface RouteConfig {
  path: string;
  label: string;
  parent?: string;
  icon?: string;
  requiresAuth?: boolean;
  category?: string;
}

// Single source of truth for all application routes
export const ROUTES: Record<string, RouteConfig> = {
  // ===== PUBLIC & AUTH =====
  home: { path: "/", label: "Home", category: "public" },
  login: { path: "/login", label: "Login", parent: "/", category: "auth" },
  register: { path: "/register", label: "Register", parent: "/", category: "auth" },
  about: { path: "/about", label: "About", parent: "/", category: "public" },
  pricing: { path: "/pricing", label: "Pricing", parent: "/", category: "public" },
  terms: { path: "/terms", label: "Terms of Service", parent: "/", category: "public" },
  privacy: { path: "/privacy", label: "Privacy Policy", parent: "/", category: "public" },
  contact: { path: "/contact", label: "Contact", parent: "/", category: "public" },

  // ===== FEED & SOCIAL =====
  feed: { path: "/feed", label: "Feed", parent: "/", requiresAuth: true, category: "social" },
  feedFollowing: { path: "/feed/following", label: "Following", parent: "/feed", requiresAuth: true, category: "social" },
  feedDiscover: { path: "/feed/discover", label: "Discover", parent: "/feed", requiresAuth: true, category: "social" },
  post: { path: "/post/:id", label: "Post", parent: "/feed", requiresAuth: true, category: "social" },
  search: { path: "/search", label: "Search", parent: "/", requiresAuth: true, category: "social" },
  notifications: { path: "/notifications", label: "Notifications", parent: "/", requiresAuth: true, category: "social" },
  messages: { path: "/messages", label: "Messages", parent: "/", requiresAuth: true, category: "social" },
  bookmarks: { path: "/bookmarks", label: "Bookmarks", parent: "/", requiresAuth: true, category: "social" },

  // ===== PROFILE =====
  profile: { path: "/profile", label: "Profile", parent: "/", requiresAuth: true, category: "profile" },
  profileUser: { path: "/profile/:username", label: "User Profile", parent: "/profile", requiresAuth: true, category: "profile" },
  profileEdit: { path: "/profile/edit", label: "Edit Profile", parent: "/profile", requiresAuth: true, category: "profile" },
  profileSettings: { path: "/profile/settings", label: "Settings", parent: "/profile", requiresAuth: true, category: "profile" },

  // ===== FRIENDS =====
  friends: { path: "/friends", label: "Friends", parent: "/", requiresAuth: true, category: "friends" },
  friendRequests: { path: "/friends/requests", label: "Requests", parent: "/friends", requiresAuth: true, category: "friends" },
  friendSuggestions: { path: "/friends/suggestions", label: "Suggestions", parent: "/friends", requiresAuth: true, category: "friends" },

  // ===== EVENTS =====
  events: { path: "/events", label: "Events", parent: "/", category: "events" },
  eventsCalendar: { path: "/events/calendar", label: "Calendar", parent: "/events", category: "events" },
  eventsMap: { path: "/events/map", label: "Map", parent: "/events", category: "events" },
  eventDetail: { path: "/events/:id", label: "Event Details", parent: "/events", category: "events" },
  eventsCreate: { path: "/events/create", label: "Create Event", parent: "/events", requiresAuth: true, category: "events" },
  eventsMyEvents: { path: "/events/my-events", label: "My Events", parent: "/events", requiresAuth: true, category: "events" },

  // ===== HOUSING =====
  housing: { path: "/housing", label: "Housing", parent: "/", category: "housing" },
  housingDetail: { path: "/housing/:id", label: "Listing Details", parent: "/housing", category: "housing" },
  housingCreate: { path: "/housing/create", label: "Create Listing", parent: "/housing", requiresAuth: true, category: "housing" },
  housingMyListings: { path: "/housing/my-listings", label: "My Listings", parent: "/housing", requiresAuth: true, category: "housing" },

  // ===== TALENT MATCH =====
  talent: { path: "/talent", label: "Talent Match", parent: "/", requiresAuth: true, category: "talent" },
  talentDashboard: { path: "/talent/dashboard", label: "Dashboard", parent: "/talent", requiresAuth: true, category: "talent" },
  talentProfile: { path: "/talent/profile", label: "My Profile", parent: "/talent", requiresAuth: true, category: "talent" },
  talentTasks: { path: "/talent/tasks", label: "Tasks", parent: "/talent", requiresAuth: true, category: "talent" },

  // ===== LIFE CEO =====
  lifeCeo: { path: "/life-ceo", label: "Life CEO", parent: "/", requiresAuth: true, category: "lifeCeo" },
  lifeCeoGoals: { path: "/life-ceo/goals", label: "Goals", parent: "/life-ceo", requiresAuth: true, category: "lifeCeo" },
  lifeCeoTasks: { path: "/life-ceo/tasks", label: "Tasks", parent: "/life-ceo", requiresAuth: true, category: "lifeCeo" },
  lifeCeoCalendar: { path: "/life-ceo/calendar", label: "Calendar", parent: "/life-ceo", requiresAuth: true, category: "lifeCeo" },

  // ===== MR BLUE AI =====
  mrBlue: { path: "/mr-blue", label: "Mr Blue AI", parent: "/", requiresAuth: true, category: "ai" },
  mrBlueHistory: { path: "/mr-blue/history", label: "History", parent: "/mr-blue", requiresAuth: true, category: "ai" },

  // ===== ADMIN =====
  admin: { path: "/admin", label: "Admin", parent: "/", requiresAuth: true, category: "admin" },
  adminUsers: { path: "/admin/users", label: "Users", parent: "/admin", requiresAuth: true, category: "admin" },
  adminContent: { path: "/admin/content", label: "Content", parent: "/admin", requiresAuth: true, category: "admin" },
};

// Helper: Get breadcrumb trail for a given path
export function getBreadcrumbs(currentPath: string): RouteConfig[] {
  const breadcrumbs: RouteConfig[] = [];
  
  // Find matching route (handle dynamic params)
  const route = Object.values(ROUTES).find(r => {
    if (r.path === currentPath) return true;
    // Match dynamic routes like /post/:id
    const regex = new RegExp('^' + r.path.replace(/:[^/]+/g, '[^/]+') + '$');
    return regex.test(currentPath);
  });
  
  if (!route) return breadcrumbs;
  
  // Build trail from current to root
  let current: RouteConfig | undefined = route;
  while (current) {
    breadcrumbs.unshift(current);
    current = current.parent ? ROUTES[Object.keys(ROUTES).find(k => ROUTES[k].path === current!.parent)!] : undefined;
  }
  
  return breadcrumbs;
}

// Helper: Get route by path
export function getRoute(path: string): RouteConfig | undefined {
  return Object.values(ROUTES).find(r => r.path === path);
}

// Helper: Get all routes in category
export function getRoutesByCategory(category: string): RouteConfig[] {
  return Object.values(ROUTES).filter(r => r.category === category);
}
