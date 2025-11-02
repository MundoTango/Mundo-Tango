# Design Token System Documentation

**Version**: 1.0.0  
**Last Updated**: November 2, 2025  
**Coverage**: Complete platform (142 pages)  
**Methodology**: MB.MD Protocol (Simultaneously, Recursively, Critically)

---

## Overview

The Mundo Tango design token system enables **instant theme switching** across the entire platform (142 pages) through a 3-layer token architecture. Change the entire platform theme by modifying a single constant.

### Architecture Highlights

- **3-Layer Token System**: Primitive → Semantic → Component
- **2 Visual Themes**: Bold Minimaximalist (marketing) + MT Ocean (platform)
- **Automatic Route Detection**: Theme switches based on URL
- **CSS Variable Runtime**: Instant theme changes without rebuild
- **Easily Changeable**: Add new themes by creating semantic token sets

---

## Layer 1: Primitive Tokens

**File**: `client/src/config/tokens/primitives.ts`

Raw design values that never reference other tokens. These are the foundation.

### Color Primitives

```typescript
burgundy: {
  700: '#b91c3b',  // PRIMARY - Bold Minimaximalist
}

turquoise: {
  500: '#14b8a6',  // PRIMARY - MT Ocean
}

purple: {
  500: '#8b5cf6',  // ACCENT - Both themes
}

gold: {
  500: '#f59e0b',  // WARMTH - Bold accent
}

cyan: {
  500: '#06b6d4',  // FRESHNESS - Ocean accent
}
```

### Spacing (8px Grid)

```typescript
space: {
  sm: '0.5rem',    // 8px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
}
```

### Typography Scale

```typescript
fontSize: {
  base: '1rem',     // 16px
  '2xl': '1.5rem',  // 24px
  '5xl': '3rem',    // 48px
  '7xl': '4.5rem',  // 72px
}

fontWeight: {
  normal: 400,
  semibold: 600,
  extrabold: 800,
  black: 900,
}
```

### Border Radius

```typescript
borderRadius: {
  sm: '0.125rem',   // 2px  - Sharp
  md: '0.375rem',   // 6px  - Bold theme
  '2xl': '1rem',    // 16px - Ocean theme
  '3xl': '1.5rem',  // 24px - Ocean cards
}
```

---

## Layer 2: Semantic Tokens

Theme-specific tokens that reference primitive tokens. These define the visual personality.

### Bold Minimaximalist Theme

**File**: `client/src/config/tokens/semantic-bold.ts`

```typescript
// BRAND COLORS
colorPrimary: primitiveTokens.burgundy[700],      // #b91c3b
colorSecondary: primitiveTokens.purple[500],      // #8b5cf6
colorAccent: primitiveTokens.gold[500],           // #f59e0b

// TYPOGRAPHY - HEAVY & DRAMATIC
fontWeightHeading: primitiveTokens.fontWeight.extrabold,  // 800
fontWeightBody: primitiveTokens.fontWeight.semibold,      // 600

// BORDER RADIUS - SHARP & CRISP
radiusCard: primitiveTokens.borderRadius.md,   // 6px

// SHADOWS - STRONG & DRAMATIC
shadowColor: 'rgba(185, 28, 59, 0.4)',  // Burgundy glow

// ANIMATIONS - FAST & ENERGETIC
transitionSpeed: primitiveTokens.transitionDuration.fast,  // 150ms
```

**Visual Characteristics**:
- **Passionate**: Burgundy conveys energy and passion
- **Bold**: Heavy typography (800-900 weight) commands attention
- **Crisp**: Sharp 6px corners feel modern and precise
- **Dramatic**: Strong burgundy shadows create depth
- **Fast**: 150ms animations feel snappy and responsive

### MT Ocean Theme

**File**: `client/src/config/tokens/semantic-ocean.ts`

```typescript
// BRAND COLORS
colorPrimary: primitiveTokens.turquoise[500],     // #14b8a6
colorSecondary: primitiveTokens.cyan[500],        // #06b6d4
colorAccent: primitiveTokens.teal[600],           // #0d9488

// TYPOGRAPHY - NORMAL & READABLE
fontWeightHeading: primitiveTokens.fontWeight.semibold,   // 600
fontWeightBody: primitiveTokens.fontWeight.normal,        // 400

// BORDER RADIUS - SOFT & ROUNDED
radiusCard: primitiveTokens.borderRadius['2xl'], // 16px

// SHADOWS - SOFT & GLASSMORPHIC
shadowColor: 'rgba(20, 184, 166, 0.15)',  // Turquoise glow

// GLASSMORPHIC PROPERTIES
glassBackground: 'rgba(255, 255, 255, 0.7)',
glassBackdropBlur: '20px',

// ANIMATIONS - SMOOTH & GRACEFUL
transitionSpeed: primitiveTokens.transitionDuration.slow,  // 300ms
```

**Visual Characteristics**:
- **Calm**: Turquoise creates trust and tranquility
- **Readable**: Normal 400 weight prioritizes long-form reading
- **Friendly**: 16px rounded corners feel approachable
- **Elegant**: Glassmorphic effects with soft shadows
- **Graceful**: 300ms animations feel smooth and polished

---

## Layer 3: Component Tokens

**File**: `client/src/config/tokens/components.ts`

Component-specific tokens using `{token}` syntax for semantic references. Resolved at runtime.

### Button Tokens

```typescript
button: {
  primary: {
    background: '{colorPrimary}',
    backgroundHover: '{colorPrimaryHover}',
    text: '{colorTextPrimaryDark}',
    borderRadius: '{radiusButton}',
    fontWeight: '{fontWeightBody}',
    shadow: '{shadowMedium}',
    transition: '{transitionSpeed}',
  },
}
```

**Resolves to**:
- **Bold theme**: Burgundy #b91c3b, 600 weight, 6px radius, 150ms
- **Ocean theme**: Turquoise #14b8a6, 400 weight, 16px radius, 300ms

### Card Tokens

```typescript
card: {
  glass: {
    background: '{glassBackground}',
    backdropFilter: 'blur({glassBackdropBlur})',
    borderRadius: '{radiusCard}',
    shadow: '{shadowLarge}',
  },
}
```

**Ocean theme only** - Glassmorphic cards with backdrop blur.

---

## Route-Based Theme Switching

**File**: `client/src/config/theme-routes.ts`

Themes automatically switch based on URL path.

### Marketing Routes (Bold Minimaximalist)

```typescript
const MARKETING_ROUTES = [
  '/marketing-prototype',
  '/pricing',
  '/landing',
];
```

**Visual**: Burgundy primary, 800 weight, 6px radius, strong shadows

### Platform Routes (MT Ocean)

```typescript
// All other routes default to MT Ocean
'/feed', '/memories', '/admin', '/messages', etc.
```

**Visual**: Turquoise primary, 400 weight, 16px radius, glassmorphic

### Usage

```typescript
import { getThemeForRoute } from '@/config/theme-routes';

const theme = getThemeForRoute('/marketing-prototype');
// Returns: 'bold-minimaximalist'

const theme2 = getThemeForRoute('/feed');
// Returns: 'mt-ocean'
```

---

## Theme Provider System

**File**: `client/src/contexts/theme-context.tsx`

React context that provides theme state and applies CSS variables.

### Features

1. **Automatic Route Detection**: Detects theme from URL
2. **Dark Mode Toggle**: Persists to localStorage
3. **CSS Variable Application**: Updates `:root` in real-time
4. **System Preference**: Detects `prefers-color-scheme`

### Usage in Components

```tsx
import { useTheme } from '@/contexts/theme-context';

function MyComponent() {
  const { visualTheme, darkMode, toggleDarkMode } = useTheme();
  
  return (
    <div>
      Current theme: {visualTheme}
      {/* 'bold-minimaximalist' or 'mt-ocean' */}
    </div>
  );
}
```

### CSS Variable Access

```css
.my-component {
  background: var(--color-primary);
  /* Bold: #b91c3b, Ocean: #14b8a6 */
  
  font-weight: var(--font-weight-heading);
  /* Bold: 800, Ocean: 600 */
  
  border-radius: var(--radius-card);
  /* Bold: 6px, Ocean: 16px */
  
  transition: all var(--transition-speed);
  /* Bold: 150ms, Ocean: 300ms */
}
```

---

## How to Change Themes

### Option 1: Switch Entire Platform Theme

Change ONE constant to switch all 142 pages:

```typescript
// client/src/config/theme-routes.ts

// Make entire platform use Bold theme
export function getThemeForRoute(pathname: string): VisualTheme {
  return 'bold-minimaximalist'; // Changed from 'mt-ocean'
}
```

### Option 2: Add New Theme

1. Create semantic tokens:

```typescript
// client/src/config/tokens/semantic-sunset.ts
export const sunsetTokens = {
  colorPrimary: primitiveTokens.orange[600],
  fontWeightHeading: primitiveTokens.fontWeight.bold,
  radiusCard: primitiveTokens.borderRadius.lg,
  transitionSpeed: primitiveTokens.transitionDuration.normal,
  // ... etc
};
```

2. Update theme context:

```typescript
// client/src/contexts/theme-context.tsx
const tokens = visualTheme === 'bold-minimaximalist' 
  ? boldMinimaximalistTokens 
  : visualTheme === 'sunset'
    ? sunsetTokens
    : mtOceanTokens;
```

3. Add to route config:

```typescript
export type VisualTheme = 'bold-minimaximalist' | 'mt-ocean' | 'sunset';
```

### Option 3: Per-Route Theme Override

```typescript
// client/src/config/theme-routes.ts
export function getThemeForRoute(pathname: string): VisualTheme {
  if (pathname.startsWith('/admin')) return 'sunset';
  if (isMarketingRoute(pathname)) return 'bold-minimaximalist';
  return 'mt-ocean';
}
```

---

## Testing Theme System

### Visual Regression Tests

**File**: `tests/visual/design-system.spec.ts`

```typescript
test('Marketing page uses Bold theme', async ({ page }) => {
  await page.goto('/marketing-prototype');
  
  const theme = await page.getAttribute('html', 'data-theme');
  expect(theme).toBe('bold-minimaximalist');
  
  const primaryColor = await page.evaluate(() => 
    getComputedStyle(document.documentElement).getPropertyValue('--color-primary')
  );
  expect(primaryColor).toContain('#b91c3b');
});
```

### Design Verification

```typescript
test('Bold theme has correct font weight', async ({ page }) => {
  await page.goto('/marketing-prototype');
  
  const headingWeight = await page.evaluate(() => 
    getComputedStyle(document.documentElement).getPropertyValue('--font-weight-heading')
  );
  expect(headingWeight).toBe('800');
});
```

---

## Best Practices

### DO ✅

- Use semantic tokens in components, never primitive tokens
- Reference CSS variables for dynamic theming: `var(--color-primary)`
- Test theme switching on representative pages
- Keep token names consistent across themes
- Document new tokens with visual characteristics

### DON'T ❌

- Hardcode colors: `#b91c3b` (use `var(--color-primary)`)
- Reference primitives directly in components
- Create one-off color values outside token system
- Forget to update dark mode variants
- Skip visual regression testing after theme changes

---

## Theme Comparison

| Property | Bold Minimaximalist | MT Ocean |
|----------|---------------------|----------|
| **Primary Color** | #b91c3b (Burgundy) | #14b8a6 (Turquoise) |
| **Heading Weight** | 800 (Extrabold) | 600 (Semibold) |
| **Body Weight** | 600 (Semibold) | 400 (Normal) |
| **Card Radius** | 6px (Sharp) | 16px (Rounded) |
| **Shadow Style** | Strong burgundy glow | Soft turquoise glow |
| **Transition Speed** | 150ms (Fast) | 300ms (Smooth) |
| **Special Effect** | Dramatic shadows | Glassmorphic blur |
| **Use Case** | Marketing (3 pages) | Platform (139 pages) |
| **Feel** | Passionate, Bold, Energetic | Calm, Friendly, Elegant |

---

## Migration Guide

### Converting Existing Components

**Before** (Hardcoded):
```tsx
<button 
  className="bg-[#b91c3b] font-bold rounded-md transition-all duration-150"
>
  Submit
</button>
```

**After** (Token-based):
```tsx
<button 
  className="bg-[var(--color-primary)] font-[var(--font-weight-body)] rounded-[var(--radius-button)] transition-all duration-[var(--transition-speed)]"
>
  Submit
</button>
```

**Better** (Adaptive Component):
```tsx
<AdaptiveButton variant="primary">
  Submit
</AdaptiveButton>
```

---

## Troubleshooting

### Theme Not Switching

1. Check `data-theme` attribute on `<html>`:
```javascript
console.log(document.documentElement.getAttribute('data-theme'));
```

2. Verify CSS variables applied:
```javascript
console.log(getComputedStyle(document.documentElement).getPropertyValue('--color-primary'));
```

3. Confirm route detection:
```typescript
import { getThemeForRoute } from '@/config/theme-routes';
console.log(getThemeForRoute(window.location.pathname));
```

### Colors Not Updating

Check if component uses hardcoded values instead of CSS variables:
```bash
# Search for hardcoded hex colors
grep -r "#b91c3b" client/src/pages
```

---

## Resources

- **Primitive Tokens**: `client/src/config/tokens/primitives.ts`
- **Bold Theme**: `client/src/config/tokens/semantic-bold.ts`
- **Ocean Theme**: `client/src/config/tokens/semantic-ocean.ts`
- **Component Tokens**: `client/src/config/tokens/components.ts`
- **Theme Provider**: `client/src/contexts/theme-context.tsx`
- **Route Config**: `client/src/config/theme-routes.ts`
- **Visual Tests**: `tests/visual/design-system.spec.ts`

---

**Built with MB.MD Protocol** 🎨  
*Simultaneously • Recursively • Critically*
