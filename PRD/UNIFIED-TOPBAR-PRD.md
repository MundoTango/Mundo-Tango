# Unified Top Bar PRD

**Version:** 1.0  
**Status:** Active  
**Last Updated:** November 27, 2025

---

## 1. Overview

The Unified Top Bar (UnifiedTopBar) is the primary navigation header for the Mundo Tango platform, serving as the entry point for user interactions across the entire application. It combines branding, global search, notifications, messaging, user profile management, and theme toggling in a single, responsive header optimized for both desktop and mobile experiences.

**Design Theme:** MT Ocean - Gradient blues (#40E0D0 to #1E90FF) with ocean-inspired accents and pulsing animations for active states.

---

## 2. Architecture

### Component Structure
```
AppLayout (client/src/components/AppLayout.tsx)
├── UnifiedTopBar (fixed height: 64px / h-16)
│   └── Menu Button toggles sidebar state
└── Content Area (flex layout, below top bar)
    ├── Sidebar (persistent, w-64)
    │   └── Navigation, user stats, menu items
    └── Main Content (flex-1, expands to fill)
        └── Route pages (children)

UnifiedTopBar (client/src/components/navigation/UnifiedTopBar.tsx)
├── Left Section
│   ├── Menu Button (toggles persistent sidebar)
│   └── Brand Logo
├── Center Section
│   └── InlineSearchInput (Desktop only)
├── Right Section
│   ├── Search Icon (Mobile only)
│   ├── Language Selector (Desktop only)
│   ├── Theme Toggle
│   ├── Favorites Link (Desktop only)
│   ├── Messages Button (with badge)
│   ├── Notifications Dropdown (with badge)
│   └── User Profile Dropdown
```

### Layout Structure
```
┌─────────────────────────────────────┐
│      Unified Top Bar (h-16)         │ Always visible
├──────────────┬──────────────────────┤
│              │                      │
│   Sidebar    │   Main Content       │
│  (w-64px)    │   (flex-1)           │ Three-tier view below top bar
│              │                      │
│ Persistent   │  Page Routes         │
│              │                      │
└──────────────┴──────────────────────┘
```

### Dependencies
- **UI Components:** Button, Avatar, DropdownMenu, Badge (shadcn/ui)
- **Icons:** lucide-react (Menu, Search, Bell, MessageSquare, Heart, etc.)
- **Routing:** wouter (Link component)
- **State Management:** React hooks (useState, useCallback, useEffect)
- **Data Fetching:** @tanstack/react-query (useQuery)
- **i18n:** react-i18next
- **Theme:** Custom theme hook (use-theme)
- **Auth:** Custom AuthContext (useAuth)

---

## 3. Components & Features

### 3.1 Left Section

#### Menu Button
- **Trigger:** Mobile viewports (showMenuButton prop)
- **Icon:** Menu (lucide-react)
- **Color:** MT Ocean teal (#40E0D0)
- **Behavior:** Toggles sidebar pop-out drawer
- **Data-testid:** `button-menu-toggle`
- **Classes:** `hover-elevate` for subtle hover effects

#### Brand Logo
- **Elements:**
  - Gradient box (MT logo in white on turquoise-to-blue gradient)
  - "Mundo Tango" text (gradient text, hidden on mobile)
- **Gradient:** 135deg from #40E0D0 to #1E90FF
- **Link:** Routes to home page `/`
- **Data-testid:** `link-logo`
- **Responsive:** Text hidden on small screens (< 640px)

---

### 3.2 Center Section

#### Inline Search Input (Desktop Only)
- **Component:** InlineSearchInput.tsx
- **Visibility:** Desktop screens only (hidden on md: breakpoint)
- **Features:**
  - Real-time search across posts, events, users, groups
  - Authentication required (uses Bearer token)
  - Dropdown showing 5 results per category
  - Click-to-navigate to selected item
  - Keyboard dismissible
- **API Endpoint:** `/api/user/global-search?q={query}`
- **Width:** max-w-2xl for optimal readability

---

### 3.3 Right Section

#### Search Icon (Mobile Only)
- **Visibility:** Mobile screens only (hidden on md: breakpoint)
- **Link:** Routes to `/search` page
- **Icon:** Search (lucide-react)
- **Data-testid:** `button-search-mobile`
- **Behavior:** Full search page experience on mobile

#### Language Selector (Desktop Only)
- **Component:** LanguageSelectorButton
- **Visibility:** Desktop only (hidden on mobile)
- **Feature:** i18next language switching
- **Current Support:** 68 languages

#### Theme Toggle
- **Icons:** Moon (light mode), Sun (dark mode)
- **Hook:** useTheme()
- **Behavior:** Toggles between light and dark themes
- **Data-testid:** `button-theme-toggle`
- **Persistence:** localStorage sync

#### Favorites Link (Desktop Only)
- **Icon:** Heart (lucide-react)
- **Route:** `/favorites`
- **Visibility:** Desktop only (hidden on mobile)
- **Data-testid:** `button-favorites`

#### Messages Button
- **Icon:** MessageSquare (lucide-react)
- **Route:** `/messages`
- **Badge:**
  - Shows count if messageCount > 0
  - Gradient background (MT Ocean)
  - Animated pulse effect
  - Max display: "9+"
- **Color Animation:** Icon turns teal when messageCount > 0
- **Data-testid:** `button-messages`

#### Notifications Dropdown
- **Icon:** Bell (lucide-react)
- **Badge System:**
  - Shows count if notificationCount > 0
  - PulseIcon wrapper for animated effect
  - Gradient background and shadow
  - Max display: "9+"
- **Dropdown Content:**
  - Header: "Recent Alerts"
  - List of recent notifications (max 5 visible)
  - Each item shows: title, message, timestamp
  - Unread indicator (teal dot)
  - "See All Notifications" link at bottom
  - Empty state with link to all notifications
- **Styling:** w-96 max-h-96 responsive (80-96 on mobile)
- **Data-testid:** `button-notifications`, `notification-item-{idx}`, `menu-item-see-all-notifications`

#### User Profile Dropdown
- **Trigger:** Avatar with chevron
- **Avatar:** User profile image with fallback initials
- **Header Section:**
  - User name
  - Username (@handle)
  - Admin badge (if applicable, with gradient styling)
- **Menu Items:**
  - Profile → `/profile`
  - Settings → `/settings`
  - Admin Access → `/admin` (conditional)
  - Help & Support → `/help`
  - Logout → handleLogout()
- **Styling:**
  - Logout item: red text with hover background
  - 264px width for comfortable spacing
- **Data-testids:** 
  - `button-user-menu`
  - `text-user-name`
  - `text-user-username`
  - `menu-item-profile`
  - `menu-item-settings`
  - `menu-item-admin`
  - `menu-item-help`
  - `menu-item-logout`

---

## 4. Data Flow

### Queries
```typescript
// Fetch current user info
useQuery({ queryKey: ['/api/auth/me'] })

// Fetch user profile
useQuery({ queryKey: ['/api/user/profile'] })

// Fetch unread message count
useQuery({ queryKey: ['/api/messages/unread-count'] })

// Fetch unread notification count
useQuery({ queryKey: ['/api/notifications/unread-count'] })

// Fetch recent notifications (max 5)
useQuery({ queryKey: ['/api/notifications/recent'] })
```

### Subscriptions
- Real-time message count updates via WebSocket
- Real-time notification updates via WebSocket

---

## 5. Responsive Breakpoints

| Screen Size | Hidden Elements | Visible Elements |
|---|---|---|
| Mobile (<640px) | Language selector, Favorites, Brand text | Menu button, Search icon, Theme, Messages, Notifications, User menu |
| Tablet (640px-1023px) | Language selector, Favorites, Center search | Menu button, Search icon, Theme, Messages, Notifications, User menu |
| Desktop (1024px+) | Menu button, Search icon | All except menu button & search icon |

---

## 6. Styling & Theme

### Colors (MT Ocean Theme)
- **Primary:** #40E0D0 (Turquoise)
- **Secondary:** #1E90FF (Dodger Blue)
- **Gradient:** `linear-gradient(135deg, #40E0D0 0%, #1E90FF 100%)`
- **Dark Mode:** Automatic via Tailwind dark: prefix

### Utilities
- **Hover Effect:** `hover-elevate` class for subtle elevation
- **Animations:** Pulse on badges (animate-pulse)
- **Spacing:** Container mx-auto px-4, gap-4 between sections

### Height
- Fixed: h-16 (64px)
- Padding top on page content: pt-16

---

## 7. Interactions & Behaviors

### Menu Toggle
- Toggles sidebar drawer visibility
- State managed by AppLayout parent
- Icon color: MT Ocean teal

### Search
- Desktop: Real-time dropdown with results
- Mobile: Full page navigation
- Authentication: Requires Bearer token in Authorization header

### Notifications
- Click item → Navigate to relevant page
- Unread dot indicates new notifications
- Max 5 recent shown, "See All" link for full list

### Messages
- Badge count auto-updates
- Icon color changes on new messages

### User Profile
- Dropdown closes after selection
- Admin badge visible to admin users
- Logout triggers auth context cleanup

### Theme Toggle
- Persists in localStorage
- Updates document.documentElement class

---

## 8. Accessibility

- All buttons have descriptive data-testid attributes
- Semantic HTML with proper ARIA labels
- Keyboard navigation for dropdowns
- Color contrast meets WCAG standards
- Icons paired with text labels in dropdowns
- Focus states visible on all interactive elements

---

## 9. Performance

### Optimizations
- Memoized component (export default memo(UnifiedTopBar))
- useCallback for event handlers
- Lazy loading for heavy components (LanguageSelectorButton)
- Debounced search input
- Query caching via React Query

### Render Triggers
- User data changes (profile, admin status)
- Message/notification count updates
- Theme toggle
- Window resize (responsive breakpoints)

---

## 10. Error Handling

### Fallbacks
- Missing profile image → Avatar with initials fallback
- Failed queries → Empty states (0 messages, 0 notifications)
- Network error → Toast notification to user
- Failed logout → Error toast with retry option

---

## 11. API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/auth/me` | Current user info |
| GET | `/api/user/profile` | User profile details |
| GET | `/api/messages/unread-count` | Unread message count |
| GET | `/api/notifications/unread-count` | Unread notification count |
| GET | `/api/notifications/recent` | Recent notifications (max 5) |
| GET | `/api/user/global-search?q=query` | Search posts, events, users, groups |
| POST | `/api/auth/logout` | User logout |

---

## 12. Test Cases

### Functional Tests
- [ ] Menu button appears on mobile, hidden on desktop
- [ ] Menu toggle opens/closes sidebar drawer
- [ ] Brand logo routes to home page
- [ ] Search bar accepts input and shows results (desktop)
- [ ] Search results clickable and navigable
- [ ] Language selector changes UI language
- [ ] Theme toggle switches between light/dark mode
- [ ] Messages badge shows/hides with count
- [ ] Notifications badge shows/hides with count
- [ ] User dropdown shows correct user info
- [ ] Admin badge appears for admin users
- [ ] Logout clears auth state and redirects to login

### Responsive Tests
- [ ] Mobile (320px): All essential controls visible
- [ ] Tablet (768px): Language selector hidden
- [ ] Desktop (1024px): Center search visible, menu button hidden

### Visual Tests
- [ ] MT Ocean gradient colors consistent
- [ ] Badges pulse animation smooth
- [ ] Icons render correctly
- [ ] Spacing/alignment consistent across breakpoints
- [ ] Dark mode colors have proper contrast

### Integration Tests
- [ ] Real-time message count updates
- [ ] Real-time notification updates
- [ ] WebSocket connection established
- [ ] Search query validation and sanitization

---

## 13. Future Enhancements

- [ ] Search autocomplete with recent queries
- [ ] Notification filtering/categories
- [ ] Custom notification sounds
- [ ] Quick actions menu
- [ ] Keyboard shortcuts (CMD+K for search)
- [ ] Profile quick preview on hover
- [ ] Voice search integration
- [ ] Notification preferences quick access

---

## 14. Related Components

- **AppLayout.tsx** - Parent component managing sidebar state
- **Sidebar.tsx** - Navigation drawer triggered by menu button
- **InlineSearchInput.tsx** - Search component for desktop
- **LanguageSelectorButton.tsx** - i18n language selector
- **PulseIcon.tsx** - Pulse animation wrapper for badges

---

## 15. File References

- **Component:** `client/src/components/navigation/UnifiedTopBar.tsx`
- **Styles:** Tailwind CSS + MT Ocean theme variables in `index.css`
- **Tests:** `tests/e2e/topbar.spec.ts` (to be created)
