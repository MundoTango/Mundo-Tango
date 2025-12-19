# UX Audit & Design System Enforcement

> Expert Lens: Davor Perhaj (UX/UI Design)
> Last Updated: December 7, 2025
> Purpose: Document UX findings and enforce design consistency

---

## Current Assessment

Per Davor's review, Mundo Tango has strong UX foundations:
- ✅ Detailed UX and theme audit reports exist
- ✅ Mobile responsiveness audits conducted
- ✅ Visual editor work in progress
- ⚠️ System feels "tool and agent-centric" vs "human-emotion-centric"
- ⚠️ Competing surfaces create visual hierarchy confusion

---

## Design System Constraints

### Typography (Enforced)

| Element | Font | Weight | Size | Color |
|---------|------|--------|------|-------|
| H1 (Hero) | Playfair Display | 700 | 4xl-5xl | `--foreground` |
| H2 (Section) | Playfair Display | 600 | 3xl-4xl | `--foreground` |
| H3 (Card) | Inter | 600 | xl-2xl | `--foreground` |
| Body | Inter | 400 | base | `--foreground` |
| Body Small | Inter | 400 | sm | `--muted-foreground` |
| Label | Inter | 500 | sm | `--muted-foreground` |

**Rule**: No ad-hoc font changes. All text uses Inter (body) or Playfair Display (headings).

---

### Colors (MT Ocean Theme)

| Token | Light Mode | Dark Mode | Usage |
|-------|-----------|-----------|-------|
| `--background` | #FAFAFA | #0A0A0F | Page backgrounds |
| `--foreground` | #171717 | #FAFAFA | Primary text |
| `--card` | #FFFFFF | #1A1A2E | Card backgrounds |
| `--primary` | #2563EB | #3B82F6 | CTAs, links |
| `--secondary` | #F1F5F9 | #1E293B | Secondary surfaces |
| `--accent` | #8B5CF6 | #A78BFA | Highlights |
| `--muted` | #F1F5F9 | #27272A | Disabled states |
| `--destructive` | #EF4444 | #DC2626 | Errors, delete |

**Rule**: No hex codes in components. Use CSS variables only.

---

### Spacing Grid (Tailwind Units)

| Name | Value | Usage |
|------|-------|-------|
| `space-1` | 4px | Icon padding |
| `space-2` | 8px | Inline elements |
| `space-3` | 12px | Small gaps |
| `space-4` | 16px | Component padding |
| `space-6` | 24px | Section gaps |
| `space-8` | 32px | Card padding |
| `space-12` | 48px | Section margins |
| `space-20` | 80px | Hero spacing |

**Rule**: Only use these spacing values. No arbitrary pixel values.

---

### Border Radius

| Name | Value | Usage |
|------|-------|-------|
| `rounded-sm` | 2px | Small elements |
| `rounded-md` | 6px | Buttons, inputs |
| `rounded-lg` | 8px | Cards |
| `rounded-xl` | 12px | Modals |
| `rounded-2xl` | 16px | Hero sections |
| `rounded-full` | 9999px | Avatars only |

**Rule**: Use `rounded-md` as default. Only avatars use `rounded-full`.

---

## Flagship Journey Focus

Per Davor's recommendation, prioritize these 2 journeys:

### Journey 1: "Onboard & Join Your First Milonga"

**Steps**:
1. Landing page (emotional hook)
2. Sign up (minimal friction)
3. Profile setup (dance level, styles)
4. City selection
5. Event discovery
6. First event RSVP
7. Success state (celebration)

**UX Requirements**:
- Max 3 clicks from landing to event RSVP
- Mobile-first (67% of tango dancers use mobile)
- Emotional copy, not technical jargon
- Progress indicator visible throughout

---

### Journey 2: "Share Your Tango Moment"

**Steps**:
1. Post creation (photo/video)
2. Location tagging
3. Partner tagging
4. Caption writing
5. Post to feed
6. Engagement (likes, comments)

**UX Requirements**:
- Instagram-familiar patterns
- Quick post (<30 seconds)
- Rich media preview
- Immediate gratification (animation on post)

---

## UX Debt Tracker

| Issue | Severity | Status | Fix ETA |
|-------|----------|--------|---------|
| Navigation has 15+ items | High | Open | Week 2 |
| Mr. Blue chat feels technical | Medium | Open | Week 3 |
| Profile completion flow unclear | Medium | Open | Week 2 |
| Event cards lack visual hierarchy | Low | Open | Week 4 |
| Mobile navbar overcrowded | High | Open | Week 1 |
| Housing section buried | Low | Deferred | N/A |

---

## Component Audit Results

### ✅ Compliant Components
- `Button` - Uses design tokens correctly
- `Card` - Proper spacing and borders
- `Avatar` - Correct radius and sizing
- `Input` - Consistent styling

### ⚠️ Needs Updates
- `SidebarMenuButton` - Custom hover states instead of `hover-elevate`
- `EventCard` - Inconsistent padding (mix of 4, 6, 8)
- `ProfileHeader` - Uses hardcoded colors
- `NotificationBadge` - Wrong border radius

### ❌ Non-Compliant
- `AdminDashboard` - Complete redesign needed
- `HousingCard` - Doesn't follow card pattern
- `MessageThread` - Custom styling throughout

---

## Interaction Patterns

### Hover States
**Use**: `hover-elevate` class (built into Tailwind config)
**Never**: Custom `hover:bg-*` except on non-interactive surfaces

### Active States
**Use**: `active-elevate-2` class
**Never**: Custom `active:scale-*` or `active:bg-*`

### Focus States
**Use**: `focus-visible:ring-2 focus-visible:ring-primary`
**Never**: Remove focus outlines

### Loading States
**Use**: Skeleton components with consistent animation
**Never**: Spinners without context text

---

## Mobile-First Checklist

For every new component:
- [ ] Works on 320px viewport (iPhone SE)
- [ ] Touch targets ≥44px
- [ ] No horizontal scroll
- [ ] Text readable without zoom
- [ ] Forms work with mobile keyboard
- [ ] Modals closable via swipe/tap

---

## Glassmorphic Treatment

For hero sections and overlays:
```css
backdrop-blur-md    /* or xl for stronger effect */
bg-white/10         /* light: 10-20%, dark: 5-10% */
border-white/20     /* subtle border */
rounded-2xl         /* large radius */
p-8 to p-12         /* generous padding */
```

---

## Emotional Design Principles

1. **Warmth over Efficiency**: Tango is emotional. UI should feel inviting, not clinical.
2. **Movement**: Subtle animations suggest the fluidity of dance.
3. **Community First**: Show people, faces, events prominently.
4. **Reduce Cognitive Load**: Hide complexity, surface joy.
5. **Celebrate Moments**: Success states should feel rewarding.

---

## Next Steps

### Week 1-2: Navigation Simplification
- Hide 80% of sidebar items for new users
- Progressive disclosure based on engagement level
- Clear "Tanda de 3" CTAs on every page

### Week 3-4: Hero Journey Polish
- Redesign onboarding flow
- Add emotional copy and imagery
- Implement progress indicators
- Mobile-first responsive fixes

---

*"Design is not just what it looks like. Design is how it feels."* — Steve Jobs
