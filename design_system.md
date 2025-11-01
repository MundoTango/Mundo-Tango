# Mundo Tango Design System Guide

## Overview

This comprehensive guide explains how to customize the Mundo Tango platform's visual design, including colors, spacing, typography, and component patterns. Whether you want to adjust the ocean theme, change accent colors, or modify spacing, this guide provides step-by-step instructions.

---

## Table of Contents

1. [Color System](#color-system)
2. [Theme Customization](#theme-customization)
3. [Typography](#typography)
4. [Spacing System](#spacing-system)
5. [Component Patterns](#component-patterns)
6. [Quick Changes Guide](#quick-changes-guide)

---

## Color System

### MT Ocean Theme Architecture

Mundo Tango uses a **MT Ocean Theme** with a turquoise → cobalt blue gradient palette. All colors are defined as CSS custom properties in `client/src/index.css`.

### Color Token Format

**Important**: When defining colors in `index.css` that will be used by Tailwind, use the **H S% L%** format (space-separated with percentages):

```css
/* CORRECT */
--primary: 177 72% 56%;

/* WRONG */
--primary: hsl(177, 72%, 56%);
```

Then reference in `tailwind.config.ts` like this:

```typescript
primary: "hsl(var(--primary) / <alpha-value>)"
```

### Core Color Tokens

Located in `client/src/index.css`:

```css
/* PRIMARY COLORS - MT Ocean Theme */
--primary: 177 72% 56%;              /* Turquoise - main brand color */
--primary-foreground: 0 0% 100%;     /* White text on primary */

--secondary: 210 100% 56%;           /* Dodger Blue - secondary accent */
--secondary-foreground: 0 0% 100%;   /* White text on secondary */

--accent: 218 100% 34%;              /* Cobalt Blue - accent color */
--accent-foreground: 0 0% 100%;      /* White text on accent */

/* BACKGROUNDS */
--background: 0 0% 98%;              /* Light mode: Off-white */
--foreground: 218 20% 12%;           /* Light mode: Dark blue-gray text */

--card: 0 0% 96%;                    /* Card background */
--card-foreground: 218 20% 15%;      /* Card text color */

/* SIDEBAR */
--sidebar: 195 40% 94%;              /* Sidebar background */
--sidebar-foreground: 218 20% 18%;  /* Sidebar text */
--sidebar-primary: 177 72% 45%;      /* Sidebar primary color */
```

### Dark Mode Colors

Dark mode colors are defined under `.dark` class:

```css
.dark {
  --background: 218 30% 8%;          /* Dark navy */
  --foreground: 0 0% 95%;            /* Light text */
  
  --card: 218 25% 12%;               /* Dark card background */
  --card-foreground: 0 0% 95%;       /* Light card text */
  
  --primary: 177 72% 56%;            /* Same turquoise (works in dark) */
  --secondary: 210 100% 56%;         /* Same dodger blue */
  --accent: 218 100% 45%;            /* Slightly brighter cobalt */
}
```

---

## Theme Customization

### How to Change Primary Color

**Goal**: Change the main brand color from turquoise to another color.

1. **Open** `client/src/index.css`
2. **Find** the `:root` section
3. **Modify** `--primary`:

```css
/* Example: Change to purple */
:root {
  --primary: 280 75% 60%;  /* Purple: H=280, S=75%, L=60% */
}
```

4. **Optionally adjust dark mode** to ensure it looks good:

```css
.dark {
  --primary: 280 75% 65%;  /* Slightly lighter for dark backgrounds */
}
```

5. **Save** - Changes apply automatically!

### How to Change the Ocean Gradient

The ocean gradient is used in hero sections and special cards.

**Location**: Custom CSS classes in `client/src/index.css`

```css
.ocean-gradient {
  background: linear-gradient(135deg, 
    hsl(177, 72%, 56%) 0%,    /* Turquoise */
    hsl(210, 100%, 56%) 50%,  /* Dodger Blue */
    hsl(218, 100%, 34%) 100%  /* Cobalt Blue */
  );
}
```

**To change**:
1. Update the three color stops with your desired gradient
2. Example - Sunset theme:

```css
.ocean-gradient {
  background: linear-gradient(135deg, 
    hsl(30, 100%, 60%) 0%,    /* Orange */
    hsl(340, 100%, 55%) 50%,  /* Pink */
    hsl(280, 75%, 45%) 100%   /* Purple */
  );
}
```

### How to Adjust Color Vibrancy

If colors feel too muted or too bright, adjust the **Saturation (S%)** and **Lightness (L%)** values:

- **More vibrant**: Increase S% (e.g., `72%` → `85%`)
- **Less vibrant**: Decrease S% (e.g., `72%` → `60%`)
- **Lighter**: Increase L% (e.g., `56%` → `65%`)
- **Darker**: Decrease L% (e.g., `56%` → `45%`)

Example:

```css
/* Original */
--primary: 177 72% 56%;

/* More vibrant and slightly lighter */
--primary: 177 85% 60%;
```

---

## Typography

### Font Families

Defined in `client/src/index.css`:

```css
--font-sans: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
--font-serif: "Playfair Display", Georgia, serif;
--font-mono: Menlo, Monaco, "Courier New", monospace;
--font-accent: Cinzel, serif;  /* For headings and special text */
```

### Font Scale

```css
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px - body text */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px - h3 */
--text-3xl: 1.875rem;  /* 30px - h2 */
--text-4xl: 2.25rem;   /* 36px - h1 */
```

### How to Change Base Font

1. **Open** `client/src/index.css`
2. **Update** `--font-sans`:

```css
--font-sans: "Your Font", Inter, sans-serif;
```

3. **Import the font** (if using Google Fonts) in `client/index.html`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Your+Font:wght@400;500;600;700&display=swap" rel="stylesheet">
```

---

## Spacing System

### Base Spacing Scale (4px grid)

```css
--spacing: 0.25rem;  /* 4px base unit */
```

Tailwind spacing classes follow this scale:
- `space-1` = 0.25rem (4px)
- `space-2` = 0.5rem (8px)
- `space-4` = 1rem (16px)
- `space-6` = 1.5rem (24px)
- `space-8` = 2rem (32px)
- `space-12` = 3rem (48px)

### How to Adjust Global Spacing

**Scenario**: You want more breathing room across the entire platform.

**Solution**: Increase padding in key components.

Example - Adjust card padding globally:

1. **Open** `client/src/index.css`
2. **Add** a custom utility class:

```css
@layer utilities {
  .card-padding-default {
    padding: 1.5rem;  /* Increased from 1rem */
  }
}
```

3. **Apply** to `<Card>` components or modify the Card component directly.

---

## Component Patterns

### Glass Card Effect

The "glassmorphism" effect is used throughout the platform:

```css
.glass-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15);
}
```

**Dark mode version**:

```css
.dark .glass-card {
  background: rgba(30, 41, 59, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
```

### Button Variants

Buttons automatically adapt to their background using elevation utilities:

- `variant="default"` - Primary colored button
- `variant="secondary"` - Secondary colored button
- `variant="outline"` - Outlined button
- `variant="ghost"` - No background, subtle hover
- `size="sm"` - Small (min-h-8)
- `size="default"` - Default (min-h-9)
- `size="lg"` - Large (min-h-10)
- `size="icon"` - Square icon button (h-9 w-9)

### Elevation System

Hover and active states use automatic elevation:

```tsx
<Card className="hover-elevate active-elevate-2">
  {/* Content */}
</Card>
```

- `hover-elevate` - Subtle background lightening on hover
- `active-elevate-2` - More dramatic effect on click

**Note**: These work with ANY background color and adapt to light/dark mode automatically.

---

## Quick Changes Guide

### 1. Change Primary Brand Color

**File**: `client/src/index.css`

```css
:root {
  --primary: 280 75% 60%;  /* Your color in H S% L% format */
}
```

### 2. Adjust Spacing Tightness

**Scenario**: Design feels too cramped

**Solution**: Increase padding in components

```tsx
// Before
<Card className="p-4">

// After
<Card className="p-6">
```

### 3. Change Sidebar Width

**File**: Any page using `FeedLeftSidebar` or `FeedRightSidebar`

```tsx
// In component
<aside className="w-[280px]">  {/* Change this width */}
```

Or make it responsive:

```tsx
<aside className="w-[240px] lg:w-[280px] xl:w-[320px]">
```

### 4. Modify Event Card Styling

**File**: `client/src/components/FeedRightSidebar.tsx`

Update the event card classes:

```tsx
<div className="p-3 rounded-lg hover-elevate cursor-pointer border">
  {/* Add more padding, change border, etc. */}
</div>
```

### 5. Change Post Tag Badge Colors

**File**: Component that displays post tags

```tsx
<Badge 
  variant="secondary"  // Try: default, secondary, outline, destructive
  className="bg-primary/10 text-primary"  // Custom colors
>
  {tag}
</Badge>
```

### 6. Adjust Dark Mode Contrast

**File**: `client/src/index.css`

```css
.dark {
  --background: 218 30% 8%;     /* Darker: decrease L% */
  --foreground: 0 0% 95%;       /* Brighter text: increase L% */
  --card: 218 25% 12%;          /* Adjust card contrast */
}
```

### 7. Change Border Radius (Roundness)

**File**: `client/src/index.css`

```css
:root {
  --radius: 0.5rem;  /* Default: 8px */
  /* Try: 0.25rem (4px), 1rem (16px), etc. */
}
```

Affects all `rounded-md` elements globally.

### 8. Modify Tag Button Icons

**File**: `client/src/pages/FeedPage.tsx` (post creation section)

```tsx
const tags = [
  { name: "Milonga", icon: "🪭", color: "bg-red-500/10 text-red-600" },
  { name: "Práctica", icon: "💃", color: "bg-purple-500/10 text-purple-600" },
  // Change icons and colors here
];
```

---

## Component File Locations

Quick reference for where to edit specific UI components:

- **Left Sidebar**: `client/src/components/FeedLeftSidebar.tsx`
- **Right Sidebar**: `client/src/components/FeedRightSidebar.tsx`
- **Global Topbar**: `client/src/components/GlobalTopbar.tsx`
- **Mr Blue Widget**: `client/src/components/MrBlueWidget.tsx`
- **Feed Page**: `client/src/pages/FeedPage.tsx`
- **Theme Colors**: `client/src/index.css`
- **Tailwind Config**: `tailwind.config.ts`

---

## Best Practices

### 1. Always Use Design Tokens

❌ **Don't**:
```tsx
<div className="bg-[#40E0D0]">
```

✅ **Do**:
```tsx
<div className="bg-primary">
```

### 2. Test Light + Dark Mode

After any color change, test both modes:

```tsx
// Add theme toggle to test quickly
<ThemeToggle />
```

### 3. Use Semantic Color Names

When adding new colors, use semantic names:

```css
/* Good */
--success: 142 71% 45%;
--warning: 38 92% 50%;
--danger: 0 72% 42%;

/* Bad */
--green: 142 71% 45%;
--yellow: 38 92% 50%;
```

### 4. Maintain Contrast Ratios

Ensure text meets WCAG AA standards (4.5:1 for normal text):

- Light text on dark backgrounds
- Dark text on light backgrounds
- Test with browser dev tools accessibility checker

---

## Troubleshooting

### Colors Not Updating

1. **Check** you used the correct format (H S% L%, not hsl())
2. **Clear** browser cache (Cmd+Shift+R or Ctrl+Shift+R)
3. **Restart** the dev server: `npm run dev`

### Dark Mode Looks Wrong

1. **Verify** you defined the color in both `:root` and `.dark`
2. **Check** that dark mode is enabled (toggle in UI)
3. **Test** contrast - dark mode needs higher contrast often

### Components Not Applying New Styles

1. **Check** CSS specificity - inline styles override classes
2. **Verify** Tailwind classes are generated (check dev console)
3. **Review** component's `className` prop isn't being overridden

---

## Support

For questions about the design system:
- Reference the **Universal Design Guidelines** in the development docs
- Check `client/src/index.css` for all available CSS custom properties
- Review component examples in the codebase

---

**Last Updated**: MB.MD Wave 6 - November 1, 2025
