# Mundo Tango - Design Guidelines

## Design Approach

**Reference-Based Approach**: Draw inspiration from **Instagram** (visual social feeds), **LinkedIn** (community/events), and **Airbnb** (event discovery). The platform serves the global tango community, requiring elegant, passionate visual design that balances artistic expression with functional networking.

**Design Principles**:
1. **Passionate Elegance**: Reflect tango's sophisticated, emotional nature
2. **Community First**: Prioritize connection and discovery
3. **Content Showcase**: Visual-heavy design for event photography and dance content
4. **Global Accessibility**: Support 68 languages with clear visual hierarchy

## Typography

**Font Families** (via Google Fonts CDN):
- **Headlines**: Playfair Display (serif) - weights 400, 600, 700
- **Body/UI**: Inter (sans-serif) - weights 400, 500, 600, 700
- **Accent**: Cinzel (decorative serif for special elements) - weight 400

**Hierarchy**:
- Hero Headlines: 3xl to 6xl (48-60px desktop)
- Page Titles: 2xl to 3xl (30-36px)
- Section Headers: xl to 2xl (24-30px)
- Card Titles: lg to xl (18-24px)
- Body Text: base (16px)
- Captions/Meta: sm (14px)
- Small Labels: xs (12px)

## Layout System

**Spacing Units**: Use Tailwind units of **2, 3, 4, 6, 8, 12, 16, 20, 24** for consistent rhythm
- Component padding: p-4 to p-8
- Section spacing: py-12 to py-24
- Card spacing: p-6
- Grid gaps: gap-4 to gap-6

**Container System**:
- Max width: max-w-7xl for main content
- Feed content: max-w-4xl centered
- Form containers: max-w-2xl
- Full-width: Event grids, image galleries

**Grid Layouts**:
- Events grid: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- Community cards: grid-cols-1 md:grid-cols-2
- Post feed: Single column, max-w-2xl centered
- Profile sections: 2-column layout (sidebar + content)

## Component Library

### Navigation
**Top Navigation Bar**:
- Fixed header with logo (left), search bar (center), user menu (right)
- Height: h-16
- Icons from Heroicons (outline style)
- Notification badges with count indicators
- Dropdown menus for user profile, messages, notifications

**Mobile Navigation**:
- Bottom tab bar with 5 primary actions
- Floating action button for "Create Post/Event"

### Cards & Containers

**Post Card**:
- User avatar (left), name/timestamp (top)
- Content area with text, images (full-width within card)
- Interaction bar: Like, Comment, Share icons with counts
- Comments section collapsible
- Spacing: p-6, rounded-xl borders

**Event Card**:
- Featured image (16:9 ratio, rounded-t-xl)
- Event details: title (bold), date/time with icon, location with icon
- Attendee count with avatar stack (max 5 visible)
- "Interested" and "Going" buttons
- Hover: subtle lift effect (shadow increase)

**Community Card**:
- Banner image (21:9 ratio)
- Community icon overlay (rounded-full, border)
- Member count, post count badges
- "Join" button prominent
- Preview of recent activity (3 latest posts thumbnails)

### Forms & Inputs

**Text Inputs**:
- Height: h-12
- Rounded: rounded-lg
- Border weight: border-2
- Focus: ring-2 offset-2
- Label above input with font-medium

**Buttons**:
- Primary: h-12, px-6, rounded-lg, font-semibold
- Secondary: Same size, outlined variant
- Icon buttons: w-10 h-10, rounded-full
- Buttons on images: backdrop-blur-md, semi-transparent background, NO custom hover states

**Select Dropdowns**:
- Match text input styling
- Chevron icon on right
- Custom styled options menu

### Feed & Timeline
- Infinite scroll with loading indicator
- Story/highlight bar at top (horizontal scroll)
- Filter tabs (All, Following, Events, Communities)
- Sticky filters on scroll

### Messaging Interface
- 3-column layout (conversations list, active chat, profile sidebar)
- Message bubbles: rounded-2xl, max-w-md
- Timestamp below bubble group
- Typing indicators with animated dots
- Voice message waveform visualization

### Overlays & Modals
- Full-screen modals on mobile
- Centered modals on desktop (max-w-2xl)
- Backdrop: backdrop-blur-sm with semi-transparent overlay
- Slide-up animation on mobile
- Close button: top-right, rounded-full

## Images

**Hero Section**:
- **Large hero image required**: Full-width, h-96 on desktop, h-64 on mobile
- Feature: Tango dancers in elegant pose (romantic, passionate composition)
- Overlay: Dark gradient from bottom (for text readability)
- Content overlay: Headline in white Playfair Display, CTA buttons with backdrop-blur-md

**Event Images**:
- High-quality tango event photography
- Aspect ratio: 16:9 for cards, 21:9 for banners
- Object-fit: cover with proper centering

**Profile Images**:
- Avatar: rounded-full, border-4
- Cover photo: 21:9 ratio, subtle overlay for profile info

**Feed Images**:
- Support multiple images (grid layout: 2-column for 2-4 images)
- Lightbox viewer on click
- Lazy loading with blur placeholder

**Community Banners**:
- Vibrant tango scenes, dance floors, milongas
- Consistent 21:9 ratio across all communities

## Animations

**Subtle Micro-interactions** (use sparingly):
- Button press: scale-95 on active
- Card hover: Slight elevation (shadow-md to shadow-lg)
- Like animation: Heart fills with scale bounce (once)
- Page transitions: Fade-in content (300ms)
- Loading states: Skeleton screens, pulse animation

**NO animations for**:
- Background elements
- Decorative elements
- Text (except necessary loading states)

## Accessibility

- Minimum touch target: 44px × 44px
- Focus indicators: ring-2 with offset on all interactive elements
- ARIA labels on icon-only buttons
- Keyboard navigation support (Tab, Enter, Esc)
- Alt text for all images
- Color contrast: WCAG AA minimum (4.5:1 for text)
- Screen reader announcements for dynamic content updates

## Responsive Behavior

**Breakpoints**:
- Mobile: < 768px (single column, bottom nav)
- Tablet: 768px - 1024px (2-column grids)
- Desktop: > 1024px (3-column grids, sidebar layouts)

**Mobile Optimizations**:
- Collapsible navigation drawer
- Full-screen modals
- Sticky CTAs at bottom
- Swipe gestures for image galleries
- Reduced padding (p-4 instead of p-6)

## Special Features

**Event Discovery Page**:
- Map view toggle (full-width map with event pins)
- Filter sidebar: Date range, location, dance style
- Featured events carousel at top
- Grid view with infinite scroll

**Community Feed**:
- Trending topics sidebar
- Suggested communities widget
- Member spotlight section

**Profile Pages**:
- Cover photo + avatar
- Stats bar (Posts, Events Attended, Followers)
- Tabbed content (Posts, Photos, Events, About)
- Edit profile button for own profile

**Search Interface**:
- Universal search bar (top nav)
- Results grouped by type (People, Events, Communities, Posts)
- Recent searches quick access
- Advanced filter panel

This design system creates a visually sophisticated, highly functional platform that honors tango culture while providing modern social networking capabilities.