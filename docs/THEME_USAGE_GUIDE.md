# Theme Usage Guide

**Version**: 1.0.0  
**Audience**: Developers implementing features across 142 pages  
**Status**: Production-ready

---

## Quick Start

### Using Adaptive Components

The easiest way to build theme-aware UI is using adaptive components:

```tsx
import { AdaptiveButton } from '@/components/adaptive/AdaptiveButton';
import { AdaptiveCard } from '@/components/adaptive/AdaptiveCard';
import { AdaptiveH1, AdaptiveBody } from '@/components/adaptive/AdaptiveHeading';

function MyPage() {
  return (
    <AdaptiveCard variant="glass">
      <AdaptiveH1>Welcome to Mundo Tango</AdaptiveH1>
      <AdaptiveBody>
        This content automatically adapts to Bold or Ocean theme
      </AdaptiveBody>
      <AdaptiveButton variant="primary">
        Get Started
      </AdaptiveButton>
    </AdaptiveCard>
  );
}
```

**Result**:
- On `/marketing-prototype`: Burgundy button, 800 weight heading, 6px radius
- On `/feed`: Turquoise button, 600 weight heading, 16px radius, glassmorphic card

---

## Using CSS Variables Directly

For custom components, use CSS variables:

```tsx
function CustomComponent() {
  return (
    <div 
      className="
        bg-[var(--color-primary)]
        text-white
        font-[var(--font-weight-heading)]
        rounded-[var(--radius-card)]
        p-[var(--spacing-card)]
        shadow-[var(--shadow-medium)]
        transition-all duration-[var(--transition-speed)]
      "
    >
      <h2 className="text-[var(--font-size-h2)]">
        Custom Component
      </h2>
    </div>
  );
}
```

**Available CSS Variables**:

### Colors
```css
--color-primary         /* Burgundy or Turquoise */
--color-secondary       /* Purple or Cyan */
--color-accent          /* Gold or Teal */
--color-primary-hover
--color-secondary-hover
--color-accent-hover

--color-background      /* Light/dark aware */
--color-surface
--color-text-primary
--color-text-secondary
--color-text-muted
```

### Typography
```css
--font-weight-heading   /* 800 or 600 */
--font-weight-subheading
--font-weight-body
--font-weight-caption

--font-size-hero
--font-size-h1
--font-size-h2
--font-size-h3
--font-size-body
--font-size-caption

--line-height-heading
--line-height-body
```

### Spacing
```css
--spacing-base          /* 8px or 16px */
--spacing-card          /* 16px or 24px */
--spacing-section
--spacing-page
```

### Border Radius
```css
--radius-base
--radius-card           /* 6px or 16px */
--radius-button         /* 6px or 16px */
--radius-input
```

### Shadows
```css
--shadow-color          /* Burgundy or Turquoise tint */
--shadow-small
--shadow-medium
--shadow-large
--shadow-xlarge
```

### Glassmorphic (Ocean Only)
```css
--glass-background
--glass-backdrop-blur
--glass-border
```

### Gradients
```css
--gradient-primary
--gradient-hero
--gradient-accent
```

### Animations
```css
--transition-speed      /* 150ms or 300ms */
--transition-speed-slow
--animation-curve
```

---

## Accessing Theme Context

Use the theme hook to react to theme changes:

```tsx
import { useTheme } from '@/contexts/theme-context';

function ThemeAwareComponent() {
  const { visualTheme, darkMode, toggleDarkMode } = useTheme();
  
  const isBold = visualTheme === 'bold-minimaximalist';
  const isOcean = visualTheme === 'mt-ocean';
  
  return (
    <div>
      <p>Current theme: {visualTheme}</p>
      <p>Dark mode: {darkMode}</p>
      
      {isBold && (
        <div>
          This only shows on marketing pages
        </div>
      )}
      
      {isOcean && (
        <div className="backdrop-blur-xl">
          This glassmorphic effect only shows on platform pages
        </div>
      )}
      
      <button onClick={toggleDarkMode}>
        Toggle Dark Mode
      </button>
    </div>
  );
}
```

---

## Page-Specific Examples

### Marketing Page (Bold Minimaximalist)

```tsx
// pages/MarketingPrototypeEnhanced.tsx
import { AdaptiveButton, AdaptiveCard, AdaptiveH1 } from '@/components/adaptive';

export default function MarketingPage() {
  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center">
        <div className="absolute inset-0 bg-[var(--gradient-hero)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        <div className="relative z-10 text-center px-4">
          <AdaptiveH1 className="text-white mb-6">
            WHERE TANGO MEETS COMMUNITY
          </AdaptiveH1>
          
          <AdaptiveButton variant="primary" size="lg">
            Join the Community
          </AdaptiveButton>
        </div>
      </section>
      
      {/* Features */}
      <section className="py-[var(--spacing-section)]">
        <div className="grid grid-cols-3 gap-[var(--spacing-card)]">
          <AdaptiveCard variant="solid">
            <h3 className="font-[var(--font-weight-heading)] text-[var(--font-size-h3)]">
              Feature 1
            </h3>
          </AdaptiveCard>
          {/* More cards... */}
        </div>
      </section>
    </div>
  );
}
```

**Characteristics**:
- Heavy 800 weight headings
- Burgundy #b91c3b primary buttons
- 6px sharp corners
- Strong burgundy shadows
- Fast 150ms transitions
- Dramatic gradients

### Platform Page (MT Ocean)

```tsx
// pages/MemoriesPage.tsx
import { AdaptiveCard, AdaptiveButton } from '@/components/adaptive';

export default function MemoriesPage() {
  return (
    <div className="min-h-screen bg-[var(--color-background)] p-[var(--spacing-page)]">
      <div className="max-w-4xl mx-auto space-y-[var(--spacing-card)]">
        {/* Glassmorphic Post Card */}
        <AdaptiveCard variant="glass">
          <div className="flex items-center gap-4">
            <img 
              src="/avatar.jpg"
              className="w-12 h-12 rounded-full"
            />
            <div>
              <h3 className="font-[var(--font-weight-heading)] text-[var(--font-size-h3)]">
                User Name
              </h3>
              <p className="text-[var(--color-text-muted)] text-[var(--font-size-caption)]">
                2 hours ago
              </p>
            </div>
          </div>
          
          <p className="mt-4 font-[var(--font-weight-body)]">
            Just had an amazing tango experience!
          </p>
          
          <div className="mt-4 flex gap-2">
            <AdaptiveButton variant="ghost" size="sm">
              Like
            </AdaptiveButton>
            <AdaptiveButton variant="ghost" size="sm">
              Comment
            </AdaptiveButton>
          </div>
        </AdaptiveCard>
      </div>
    </div>
  );
}
```

**Characteristics**:
- Normal 400 weight body text
- Turquoise #14b8a6 primary buttons
- 16px rounded corners
- Glassmorphic cards with backdrop blur
- Soft turquoise shadows
- Smooth 300ms transitions

---

## Common Patterns

### Hero Section with Gradient

```tsx
<section className="relative h-screen overflow-hidden">
  {/* Gradient Background */}
  <div className="absolute inset-0 bg-[var(--gradient-hero)]" />
  
  {/* Dark Wash for Text Readability */}
  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
  
  {/* Content */}
  <div className="relative z-10 flex items-center justify-center h-full text-white text-center">
    <AdaptiveH1 className="text-white">
      Hero Title
    </AdaptiveH1>
  </div>
</section>
```

### Glassmorphic Card (Ocean Only)

```tsx
function GlassCard() {
  return (
    <AdaptiveCard variant="glass" className="relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[var(--gradient-primary)]" />
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        <h3>Glassmorphic Card</h3>
        <p>This card has a blurred background</p>
      </div>
    </AdaptiveCard>
  );
}
```

### Theme-Specific Icons

```tsx
import { Sparkles, Waves } from 'lucide-react';
import { useTheme } from '@/contexts/theme-context';

function ThemedIcon() {
  const { visualTheme } = useTheme();
  
  return visualTheme === 'bold-minimaximalist' 
    ? <Sparkles className="text-[var(--color-accent)]" />
    : <Waves className="text-[var(--color-primary)]" />;
}
```

### Dark Mode Toggle

```tsx
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/contexts/theme-context';

function DarkModeToggle() {
  const { darkMode, toggleDarkMode } = useTheme();
  
  return (
    <button
      onClick={toggleDarkMode}
      className="p-2 rounded-[var(--radius-button)] hover:bg-[var(--color-surface)]"
      aria-label="Toggle dark mode"
    >
      {darkMode === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}
```

---

## Testing Your Components

### Visual Verification

1. **Test both themes**:
   - Navigate to `/marketing-prototype` (Bold)
   - Navigate to `/feed` (Ocean)
   - Verify colors, weights, radii match

2. **Test dark mode**:
   - Toggle dark mode on both themes
   - Verify contrast and readability

3. **Check CSS variables**:
```javascript
// In browser console
const root = document.documentElement;
console.log(getComputedStyle(root).getPropertyValue('--color-primary'));
// Bold: "#b91c3b", Ocean: "#14b8a6"
```

### Automated Tests

```typescript
// tests/components/AdaptiveButton.spec.ts
import { test, expect } from '@playwright/test';

test('AdaptiveButton uses burgundy on marketing page', async ({ page }) => {
  await page.goto('/marketing-prototype');
  
  const button = page.locator('[data-testid="button-join"]');
  const bgColor = await button.evaluate(el => 
    getComputedStyle(el).backgroundColor
  );
  
  // Burgundy #b91c3b = rgb(185, 28, 59)
  expect(bgColor).toBe('rgb(185, 28, 59)');
});

test('AdaptiveButton uses turquoise on platform page', async ({ page }) => {
  await page.goto('/feed');
  
  const button = page.locator('[data-testid="button-post"]');
  const bgColor = await button.evaluate(el => 
    getComputedStyle(el).backgroundColor
  );
  
  // Turquoise #14b8a6 = rgb(20, 184, 166)
  expect(bgColor).toBe('rgb(20, 184, 166)');
});
```

---

## Best Practices

### DO ✅

- **Use adaptive components** for common UI elements
- **Reference CSS variables** for custom styling
- **Test both themes** during development
- **Check dark mode** variants
- **Use semantic naming** (primary, secondary) not colors (burgundy, turquoise)
- **Leverage gradients** for visual interest
- **Apply proper contrast** for accessibility

### DON'T ❌

- **Hardcode colors**: `bg-[#b91c3b]` → Use `bg-[var(--color-primary)]`
- **Hardcode font weights**: `font-bold` → Use `font-[var(--font-weight-heading)]`
- **Assume theme**: Check `visualTheme` if theme-specific logic needed
- **Break glassmorphic effect**: Don't add `overflow-hidden` to glass cards
- **Forget dark mode**: Always test both light and dark variants
- **Mix themes**: Don't use Bold styles on Ocean pages or vice versa

---

## Troubleshooting

### Colors not changing

**Problem**: Component stays burgundy on Ocean pages  
**Solution**: Make sure using CSS variables, not hardcoded colors

```tsx
// ❌ Wrong
<div className="bg-[#b91c3b]">

// ✅ Correct
<div className="bg-[var(--color-primary)]">
```

### Font weight not adapting

**Problem**: Headings always bold on Ocean pages  
**Solution**: Use variable font weight

```tsx
// ❌ Wrong
<h1 className="font-extrabold">

// ✅ Correct
<h1 className="font-[var(--font-weight-heading)]">
```

### Glassmorphic effect not showing

**Problem**: Glass card looks solid  
**Solution**: Check for `overflow-hidden` blocking backdrop-blur

```tsx
// ❌ Wrong
<AdaptiveCard variant="glass" className="overflow-hidden">

// ✅ Correct
<AdaptiveCard variant="glass">
```

### Theme not switching on route change

**Problem**: Still shows Bold theme on `/feed`  
**Solution**: Verify route in `MARKETING_ROUTES` config

```typescript
// client/src/config/theme-routes.ts
export const MARKETING_ROUTES = [
  '/marketing-prototype',
  '/pricing',
  '/landing',
  // '/feed' should NOT be here
];
```

---

## Resources

- **Component Examples**: `docs/COMPONENT_SHOWCASE.md`
- **Token Reference**: `docs/DESIGN_TOKEN_SYSTEM.md`
- **Migration Guide**: `docs/THEME_MIGRATION_GUIDE.md`
- **Visual Tests**: `tests/visual/design-system.spec.ts`

---

**Built with MB.MD Protocol** 🎨  
*Simultaneously • Recursively • Critically*
