# Mundo Tango - Design Guidelines

## Design Approach

**Reference-Based Approach**: Draw inspiration from **Instagram** (visual social feeds), **LinkedIn** (community/events), and **Airbnb** (event discovery). The platform serves the global tango community, requiring elegant, passionate visual design that balances artistic expression with functional networking.

**Design Principles**:
1. **Passionate Elegance**: Reflect tango's sophisticated, emotional nature
2. **Community First**: Prioritize connection and discovery
3. **Content Showcase**: Visual-heavy design for event photography and dance content
4. **Global Accessibility**: Support 68 languages with clear visual hierarchy

## Color Palette

### Tango-Inspired Color System

The Mundo Tango color palette evokes the passion, elegance, and drama of Argentine tango while maintaining modern accessibility standards. All colors are defined using HSL format in CSS variables and work seamlessly in both light and dark modes.

### Primary Colors - Passionate Burgundy

**Purpose**: Primary actions, active states, brand identity, passion and energy

**Light Mode**: `350 70% 45%` - Deep burgundy red
- Use for: Primary buttons, active navigation items, links, important CTAs
- Examples: "Join Event" button, "Follow" button, active sidebar items

**Dark Mode**: `350 65% 50%` - Slightly lighter burgundy for visibility
- Maintains passion while ensuring readability on dark backgrounds

**When to Use Primary**:
- Main call-to-action buttons (Join, Follow, Attend, RSVP)
- Active/selected navigation states
- Important status indicators (Live events, Featured content)
- Links within body text
- Focus rings on interactive elements

**When NOT to Use Primary**:
- Large background areas (too intense)
- Body text (use foreground colors instead)
- Decorative elements (use accent or muted colors)

### Secondary Colors - Elegant Purple

**Purpose**: Secondary actions, elegance, nightlife atmosphere, sophistication

**Light Mode**: `275 55% 50%` - Deep violet purple
- Use for: Secondary buttons, badges, community indicators, premium features

**Dark Mode**: `275 50% 55%` - Adjusted for dark mode contrast
- Creates the sophisticated milonga nighttime atmosphere

**When to Use Secondary**:
- Secondary action buttons (Save, Share, Bookmark)
- Premium/featured badges
- Community role indicators (Organizer, Teacher)
- Section dividers or decorative accents
- Hover states for secondary elements

**When NOT to Use Secondary**:
- Primary CTAs (use primary instead)
- Error messages (use destructive)
- Success messages (use chart colors or muted)

### Accent Colors - Sophisticated Gold

**Purpose**: Highlights, achievements, premium content, warmth and sophistication

**Light Mode**: `40 85% 55%` - Warm golden amber
- Use for: Achievements, highlights, premium badges, featured content markers

**Dark Mode**: `40 80% 60%` - Brighter gold for visibility on dark backgrounds

**When to Use Accent**:
- Achievement badges and awards
- Featured/highlighted content markers
- Premium feature indicators
- Special event badges (festivals, championships)
- Star ratings and favorites
- Promotional elements

**When NOT to Use Accent**:
- Primary navigation (use primary instead)
- Body text (readability issues)
- Large background areas (too bright)

### Neutral Colors - Background & Text

**Background**: Light neutral tones in light mode, dark milonga atmosphere in dark mode
- Light mode: `0 0% 98%` - Soft white
- Dark mode: `240 6% 8%` - Deep charcoal with slight blue undertone

**Card/Container**: Elevated surfaces for content
- Light mode: `0 0% 96%` - Very light gray
- Dark mode: `240 5% 10%` - Slightly elevated dark surface

**Foreground (Text)**: High contrast for readability
- Light mode: `240 8% 12%` - Near black with slight blue
- Dark mode: `240 5% 92%` - Near white with slight blue

**Muted**: Secondary information, less important content
- Use for timestamps, meta information, placeholders
- Creates visual hierarchy without color

### Semantic Colors

**Destructive**: `0 72% 42%` - Red for errors, deletions, warnings
- Use sparingly for critical actions and error states

**Chart Colors**: Data visualization with tango-inspired hues
1. `350 70% 40%` - Burgundy (matches primary)
2. `275 60% 50%` - Purple (matches secondary)
3. `40 80% 55%` - Gold (matches accent)
4. `320 65% 48%` - Rose/magenta
5. `15 75% 50%` - Warm orange-red

### Color Usage Guidelines

**Hierarchy of Importance**:
1. **Primary (Burgundy)**: Most important actions - "Join this event"
2. **Secondary (Purple)**: Supporting actions - "Save for later"
3. **Accent (Gold)**: Highlights and achievements - "Featured organizer"
4. **Muted**: Less important info - "Posted 2 hours ago"

**Contrast Requirements**:
- All text must meet WCAG AA standards (4.5:1 minimum)
- Primary, secondary, and accent colors provide sufficient contrast on both light and dark backgrounds
- Use foreground color variants (e.g., `primary-foreground`) for text on colored backgrounds

**Dark Mode Strategy - Milonga Atmosphere**:
The dark mode creates an intimate, nighttime milonga (tango dance hall) atmosphere:
- Deep, rich backgrounds evoke the dimmed lights of a dance hall
- Burgundy and purple colors create romantic, passionate mood
- Gold accents shine like candlelight or stage lights
- Subtle blue undertones in neutrals add sophistication

**Color Combinations**:
- ✅ Primary button on card background
- ✅ Secondary badge on sidebar background
- ✅ Accent highlight on muted background
- ✅ Primary with primary-foreground text
- ❌ Primary text on secondary background (contrast issues)
- ❌ Accent text on primary background (readability issues)

**Accessibility Notes**:
- Never use color alone to convey information
- Include icons or text labels with colored elements
- Test all color combinations with contrast checkers
- Provide alternative visual indicators (icons, patterns, shapes)

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

**Spacing Scale** (defined in CSS variable `--spacing: 0.25rem` = 4px):
- **xs**: 0.5 (2px) - Minimal spacing, tight layouts
- **sm**: 1 (4px) - Small spacing, compact UI elements
- **md**: 2 (8px) - Medium spacing, standard padding between related items
- **lg**: 4 (16px) - Large spacing, section padding
- **xl**: 6 (24px) - Extra large, major section breaks
- **2xl**: 8 (32px) - Component-level spacing
- **3xl**: 12 (48px) - Page-level spacing

**Spacing Conventions**:
- Component padding: p-4 to p-8
- Section spacing: py-12 to py-24
- Card spacing: p-6
- Grid gaps: gap-4 to gap-6
- Button padding: px-6 (horizontal)
- Form field spacing: space-y-4
- List item spacing: space-y-2 to space-y-3

**Border Radius** (defined in CSS variable `--radius: .5rem` = 8px):
- **sm**: 0.1875rem (3px) - Subtle rounding for small elements
- **md**: 0.375rem (6px) - Standard rounding for most components
- **lg**: 0.5625rem (9px) - Larger cards and containers
- **rounded**: 0.5rem (8px) - Default radius
- **rounded-full**: Perfect circles (avatars, icon buttons)
- **rounded-xl**: Extra large for hero sections and modals

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

## Shadow System

Mundo Tango uses a sophisticated shadow system to create depth and hierarchy. Shadows are subtle yet effective, evoking the dramatic lighting of a tango performance.

**Shadow Scale** (defined in CSS variables):
- **shadow-2xs**: Minimal depth - Subtle borders on flat elements
- **shadow-xs**: Very subtle - Hover states on cards
- **shadow-sm**: Subtle elevation - Default cards and panels
- **shadow** (default): Standard elevation - Interactive cards, dropdowns
- **shadow-md**: Moderate elevation - Floating elements, active cards
- **shadow-lg**: Strong elevation - Modals, important notifications
- **shadow-xl**: Maximum elevation - Full-screen overlays
- **shadow-2xl**: Extreme elevation - Critical alerts, hero elements

**Shadow Usage Guidelines**:
- Use sparingly - too many shadows create visual clutter
- Increase shadow on hover to indicate interactivity
- Modal/dialog backgrounds should use lg or xl shadows
- Cards use sm shadow by default, md on hover
- Floating action buttons use lg shadow
- Dark mode shadows are stronger (higher opacity) for better visibility

**When to Use Shadows**:
- Cards that need to stand out from the background
- Interactive elements to show they're clickable
- Modals and overlays to show hierarchy
- Dropdown menus and popovers
- Buttons on image backgrounds (subtle shadow + backdrop blur)

**When NOT to Use Shadows**:
- Elements with sufficient border contrast
- Flat design sections
- Text elements
- Icons (use subtle background instead)

## Icon System

**Icon Library**: Lucide React - Consistent, clean, and modern icon set

**Icon Usage Guidelines**:
- **Size Scale**:
  - xs: 12px - Small badges, inline indicators
  - sm: 16px - Secondary actions, list items
  - md: 20px - Default buttons, navigation
  - lg: 24px - Primary actions, page headers
  - xl: 32px - Feature highlights, empty states

**Icon Patterns**:
- **Navigation**: Use outline style icons for consistency
- **Actions**: Pair icons with text labels for clarity
  - ✅ `<Heart className="w-4 h-4" /> Like`
  - ❌ Just icon without label (except for common actions)
- **Status Indicators**: Use filled icons for active states
  - Heart outline (not liked) → Heart filled (liked)
  - Star outline → Star filled (favorited)
- **Color**: Icons inherit text color by default, use color classes sparingly
  - Primary actions: text-primary
  - Destructive: text-destructive
  - Muted info: text-muted-foreground

**Common Icons**:
- Heart: Likes, favorites
- MessageCircle: Comments, messages
- Share2: Share functionality
- Calendar: Events, dates
- MapPin: Locations
- Users: Communities, groups
- User: Profile, account
- Bell: Notifications
- Search: Search functionality
- Plus: Create new content
- Music2: Tango music, playlists
- Camera: Photo uploads

**Icon + Text Alignment**:
```jsx
// Good - Icon and text aligned with gap
<Button className="gap-2">
  <Plus className="w-4 h-4" />
  Create Event
</Button>

// Good - Icon-only with proper size
<Button size="icon">
  <Bell className="w-5 h-5" />
</Button>
```

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

## Tango-Themed Visual Language

### Design Philosophy

The Mundo Tango design system embodies the essence of Argentine tango - a dance of passion, connection, elegance, and drama. Every design decision reflects these core values:

**Passionate but Elegant**:
- Bold burgundy primary color conveys passion without being overwhelming
- Sophisticated purple adds elegance and refinement
- Gold accents provide luxury touches sparingly
- Clean typography maintains professionalism

**Social and Welcoming**:
- Generous white space creates breathing room
- Clear visual hierarchy guides users naturally
- Warm, inviting color palette encourages interaction
- Accessible design ensures inclusivity for global community

**Professional yet Artistic**:
- Structured grid layouts provide organization
- High-quality imagery showcases the art form
- Typography mixes serif (artistic) with sans-serif (professional)
- Consistent spacing and alignment maintain polish

**Night-Time Milonga Atmosphere** (Dark Mode):
- Deep, rich backgrounds evoke intimate dance hall lighting
- Burgundy and purple create romantic, evening ambiance
- Gold accents shine like candlelight or stage lighting
- Subtle shadows add depth and drama
- Blue-tinted neutrals add sophistication

### Visual Metaphors

**Connection & Movement**:
- Fluid transitions between pages (like dance movements)
- Smooth animations (subtle, never jarring)
- Connected visual elements (similar to dance partners)
- Cards and containers flow naturally down the page

**Intimacy & Community**:
- Dark mode creates intimate, close-quarters feeling
- Rounded corners soften interactions
- Avatar-first design emphasizes people and connections
- Group indicators (event attendees, community members) show togetherness

**Elegance & Sophistication**:
- Generous use of negative space
- High-quality imagery with proper aspect ratios
- Refined color palette (no harsh, bright colors)
- Subtle shadows and depth (never overdone)
- Premium typography with proper hierarchy

### Component Personality

**Buttons**:
- Primary (Burgundy): Bold, confident - "Join the dance"
- Secondary (Purple): Supportive, elegant - "Explore more"
- Accent (Gold): Special, premium - "Featured event"
- Ghost: Subtle, non-intrusive - "Additional options"

**Cards**:
- Event cards: Showcase imagery first (the visual appeal of tango)
- Community cards: Emphasize membership and belonging
- Post cards: Focus on content and conversation
- Profile cards: Highlight personality and achievements

**Typography Voice**:
- Playfair Display (headlines): Artistic, expressive, emotional
- Inter (body): Clear, accessible, friendly
- Cinzel (accents): Premium, special occasions only
- All maintain readability while adding personality

### Emotional Design Principles

**Create Anticipation**:
- Featured events highlighted with gold accents
- Hover states that invite interaction
- Loading animations that feel purposeful
- Preview thumbnails that entice clicks

**Build Trust**:
- Consistent patterns throughout
- Clear visual feedback for all actions
- Professional polish in every detail
- Accessible and inclusive design

**Evoke Passion**:
- High-quality event photography
- Burgundy for important actions (passion-driven)
- Dark mode for immersive evening atmosphere
- Vibrant but tasteful color usage

**Foster Connection**:
- People-first design (avatars, names prominent)
- Clear social indicators (likes, comments, attendees)
- Easy-to-find messaging and community features
- Welcoming color palette and generous spacing

### Implementation Checklist

When designing any new feature or page:

✅ **Color Usage**:
- [ ] Primary burgundy for main CTAs only
- [ ] Secondary purple for supporting actions
- [ ] Gold accent used sparingly for highlights
- [ ] Sufficient contrast in both light and dark modes
- [ ] Foreground variants used for text on colored backgrounds

✅ **Typography**:
- [ ] Playfair Display for emotional headlines only
- [ ] Inter for all body text and UI
- [ ] Proper hierarchy (H1 → H2 → H3 progression)
- [ ] Consistent line heights and letter spacing
- [ ] Text color hierarchy (foreground → muted-foreground)

✅ **Spacing**:
- [ ] Consistent use of spacing scale (4px, 8px, 16px, 24px)
- [ ] Adequate padding in all containers (minimum p-4)
- [ ] Proper gaps in grids and flex layouts
- [ ] Sufficient touch targets (minimum 44px)

✅ **Components**:
- [ ] Use Shadcn UI components as base
- [ ] Apply hover-elevate and active-elevate-2 classes
- [ ] Icons from lucide-react with proper sizing
- [ ] Consistent border radius (rounded-md default)
- [ ] Appropriate shadows for depth

✅ **Imagery**:
- [ ] High-quality tango event photos
- [ ] Proper aspect ratios (16:9 events, 21:9 banners)
- [ ] Dark overlays on hero images for text readability
- [ ] Lazy loading for performance
- [ ] Alt text for accessibility

✅ **Interactions**:
- [ ] Subtle hover states (no dramatic transformations)
- [ ] Clear focus indicators for keyboard navigation
- [ ] Loading states for all async operations
- [ ] Success/error feedback for user actions
- [ ] Smooth transitions (300ms max)

✅ **Accessibility**:
- [ ] WCAG AA color contrast (4.5:1 minimum)
- [ ] Keyboard navigation support
- [ ] Screen reader labels on all interactive elements
- [ ] No color-only information conveyance
- [ ] Proper heading hierarchy

This design system creates a visually sophisticated, highly functional platform that honors tango culture while providing modern social networking capabilities. Every color, shadow, spacing decision, and interaction is intentionally crafted to evoke the passion, elegance, and community spirit of Argentine tango.