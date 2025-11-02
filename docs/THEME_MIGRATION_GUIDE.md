# Theme Migration Guide

**Comprehensive guide for migrating existing components to the design token system**  
**Version**: 1.0.0  
**Target Audience**: Developers refactoring 142 pages

---

## Overview

This guide walks through migrating existing Mundo Tango components from hardcoded styles to the new 3-layer design token system.

### Migration Benefits

✅ **Instant Theme Switching** - Change entire platform theme with one constant  
✅ **Consistent Visual Language** - All components use same design tokens  
✅ **Dark Mode Support** - Automatic light/dark variants  
✅ **Easy Customization** - Add new themes without touching components  
✅ **Better Maintenance** - Update design tokens instead of hunting through components

---

## Migration Strategy

### Phase 1: Setup (Already Complete)

- [x] Design token system created
- [x] ThemeProvider integrated into App.tsx
- [x] Adaptive components built
- [x] Documentation written

### Phase 2: Marketing Pages (3 pages)

Migrate `/marketing-prototype`, `/marketing-prototype-enhanced`, `/pricing`

**Timeline**: 1-2 hours per page  
**Priority**: HIGH (customer-facing)

### Phase 3: Core Platform Pages (20 pages)

Migrate `/feed`, `/memories`, `/profile`, `/messages`, etc.

**Timeline**: 30-60 minutes per page  
**Priority**: HIGH (daily usage)

### Phase 4: Admin & Utility Pages (119 pages)

Migrate remaining pages systematically

**Timeline**: 15-30 minutes per page  
**Priority**: MEDIUM

---

## Step-by-Step Migration

### Step 1: Identify Hardcoded Values

Search for hardcoded colors, font weights, border radii:

```bash
# Find hardcoded hex colors
grep -r "#b91c3b\|#8b5cf6\|#f59e0b\|#14b8a6" client/src/pages

# Find hardcoded font weights
grep -r "font-bold\|font-extrabold\|font-black" client/src/pages

# Find hardcoded border radius
grep -r "rounded-md\|rounded-lg\|rounded-xl" client/src/pages
```

### Step 2: Replace Buttons

**Before** (Hardcoded):
```tsx
<Button className="bg-[#b91c3b] font-bold rounded-md">
  Submit
</Button>
```

**After** (Token-based):
```tsx
<AdaptiveButton variant="primary">
  Submit
</AdaptiveButton>
```

**Or** (CSS Variables):
```tsx
<button className="bg-[var(--color-primary)] font-[var(--font-weight-body)] rounded-[var(--radius-button)]">
  Submit
</button>
```

### Step 3: Replace Cards

**Before**:
```tsx
<Card className="bg-white rounded-lg shadow-lg">
  <h3 className="font-bold text-2xl">{title}</h3>
  <p>{content}</p>
</Card>
```

**After**:
```tsx
<AdaptiveCard variant="solid">
  <h3 className="font-[var(--font-weight-heading)] text-[var(--font-size-h3)]">
    {title}
  </h3>
  <p className="font-[var(--font-weight-body)]">{content}</p>
</AdaptiveCard>
```

### Step 4: Replace Typography

**Before**:
```tsx
<h1 className="text-5xl font-extrabold">Main Title</h1>
<h2 className="text-3xl font-bold">Section Title</h2>
<p className="text-base font-semibold">Body text</p>
```

**After**:
```tsx
<AdaptiveH1>Main Title</AdaptiveH1>
<AdaptiveH2>Section Title</AdaptiveH2>
<AdaptiveBody>Body text</AdaptiveBody>
```

**Or**:
```tsx
<h1 className="text-[var(--font-size-h1)] font-[var(--font-weight-heading)]">
  Main Title
</h1>
<h2 className="text-[var(--font-size-h2)] font-[var(--font-weight-heading)]">
  Section Title
</h2>
<p className="text-[var(--font-size-body)] font-[var(--font-weight-body)]">
  Body text
</p>
```

### Step 5: Replace Colors

**Before**:
```tsx
<div className="bg-[#b91c3b] text-white border-2 border-[#8b5cf6]">
  Content
</div>
```

**After**:
```tsx
<div className="bg-[var(--color-primary)] text-white border-2 border-[var(--color-secondary)]">
  Content
</div>
```

### Step 6: Replace Shadows

**Before**:
```tsx
<div className="shadow-xl">Content</div>
```

**After**:
```tsx
<div className="shadow-[var(--shadow-xlarge)]">Content</div>
```

### Step 7: Replace Transitions

**Before**:
```tsx
<div className="transition-all duration-150">Content</div>
```

**After**:
```tsx
<div className="transition-all duration-[var(--transition-speed)]">Content</div>
```

**Or**:
```tsx
<div className="transition-all theme-transition">Content</div>
```

---

## Page-by-Page Migration Checklist

### Marketing Page Template

```tsx
// BEFORE
export default function MarketingPage() {
  return (
    <div className="min-h-screen bg-white">
      <section className="h-screen bg-gradient-to-br from-rose-600 to-purple-600">
        <h1 className="text-7xl font-black text-white">
          Title
        </h1>
        <Button className="bg-[#b91c3b] font-bold rounded-md px-8 py-3">
          CTA
        </Button>
      </section>
      
      <Card className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-3xl font-bold">Feature</h2>
      </Card>
    </div>
  );
}
```

```tsx
// AFTER
import { AdaptiveButton, AdaptiveCard, AdaptiveH1, AdaptiveH2 } from '@/components/adaptive';

export default function MarketingPage() {
  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <section className="h-screen bg-[var(--gradient-hero)]">
        <AdaptiveH1 className="text-white">
          Title
        </AdaptiveH1>
        <AdaptiveButton variant="primary" size="lg">
          CTA
        </AdaptiveButton>
      </section>
      
      <AdaptiveCard variant="solid">
        <AdaptiveH2>Feature</AdaptiveH2>
      </AdaptiveCard>
    </div>
  );
}
```

### Platform Page Template

```tsx
// BEFORE
export default function FeedPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <Card className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-xl font-semibold">Post Title</h3>
        <p className="text-gray-600">Post content</p>
        <Button variant="ghost" className="text-sm">
          Like
        </Button>
      </Card>
    </div>
  );
}
```

```tsx
// AFTER
import { AdaptiveCard, AdaptiveButton } from '@/components/adaptive';

export default function FeedPage() {
  return (
    <div className="min-h-screen bg-[var(--color-background)] p-[var(--spacing-page)]">
      <AdaptiveCard variant="glass">
        <h3 className="text-[var(--font-size-h3)] font-[var(--font-weight-subheading)]">
          Post Title
        </h3>
        <p className="text-[var(--color-text-secondary)]">Post content</p>
        <AdaptiveButton variant="ghost" size="sm">
          Like
        </AdaptiveButton>
      </AdaptiveCard>
    </div>
  );
}
```

---

## Common Migration Patterns

### Pattern 1: Theme-Specific Components

**Before**:
```tsx
const theme = getTheme();

<div className={theme === 'ocean' ? 'bg-cyan-500' : 'bg-rose-600'}>
```

**After**:
```tsx
<div className="bg-[var(--color-primary)]">
```

### Pattern 2: Gradient Backgrounds

**Before**:
```tsx
<div className="bg-gradient-to-r from-rose-600 to-purple-600">
```

**After**:
```tsx
<div className="bg-[var(--gradient-primary)]">
```

### Pattern 3: Conditional Styling

**Before**:
```tsx
import { useTheme } from '@/contexts/theme-context';

const { visualTheme } = useTheme();
const buttonClass = visualTheme === 'bold' ? 'font-extrabold' : 'font-semibold';
```

**After**:
```tsx
// No conditional needed!
<AdaptiveButton variant="primary">
```

---

## Testing Migration

### Visual Regression Test

After migrating a page, create a visual test:

```typescript
// tests/visual/migrated-page.spec.ts
import { test, expect } from '@playwright/test';

test('MigratedPage - Bold theme light mode', async ({ page }) => {
  await page.goto('/migrated-page');
  await expect(page).toHaveScreenshot('migrated-bold-light.png');
});

test('MigratedPage - Bold theme dark mode', async ({ page }) => {
  await page.goto('/migrated-page');
  await page.click('[aria-label="Toggle dark mode"]');
  await expect(page).toHaveScreenshot('migrated-bold-dark.png');
});

test('MigratedPage - Ocean theme light mode', async ({ page }) => {
  // Change route to platform page to test Ocean theme
  await page.goto('/feed'); // Then navigate to migrated page
  await expect(page).toHaveScreenshot('migrated-ocean-light.png');
});
```

### Design Verification Test

```typescript
test('Verify design tokens applied', async ({ page }) => {
  await page.goto('/migrated-page');
  
  const primaryColor = await page.evaluate(() => 
    getComputedStyle(document.documentElement).getPropertyValue('--color-primary')
  );
  
  // Should be burgundy on marketing pages
  expect(primaryColor.trim()).toBe('#b91c3b');
});
```

---

## Migration Progress Tracking

### Create Migration Tracker

```markdown
# Migration Progress

## Marketing Pages (3)
- [x] /marketing-prototype-enhanced
- [ ] /marketing-prototype
- [ ] /pricing

## Core Platform (20)
- [ ] /feed
- [ ] /memories
- [ ] /profile
- [ ] /messages
...

## Admin & Utility (119)
- [ ] /admin/dashboard
- [ ] /admin/users
...
```

### Migration Metrics

Track:
- Pages migrated
- Components refactored
- Lines of code reduced
- Bundle size change
- Performance impact

---

## Troubleshooting

### Issue: Colors Not Showing

**Problem**: Colors appear as `var(--color-primary)` literal text  
**Solution**: Verify ThemeProvider wraps entire app in App.tsx

```tsx
// App.tsx
<ThemeProvider>
  <Router />
</ThemeProvider>
```

### Issue: Wrong Theme on Page

**Problem**: Marketing page shows Ocean theme  
**Solution**: Add route to `MARKETING_ROUTES` in `theme-routes.ts`

```typescript
export const MARKETING_ROUTES = [
  '/marketing-prototype',
  '/pricing',
  '/your-new-marketing-page', // Add here
];
```

### Issue: Glassmorphic Not Working

**Problem**: Glass cards appear solid on Ocean theme  
**Solution**: Check for `overflow-hidden` blocking backdrop-blur

```tsx
// ❌ Wrong
<AdaptiveCard variant="glass" className="overflow-hidden">

// ✅ Correct
<AdaptiveCard variant="glass">
```

### Issue: Font Weight Not Changing

**Problem**: Heading weight stays same on both themes  
**Solution**: Use CSS variable, not Tailwind utility

```tsx
// ❌ Wrong
<h1 className="font-extrabold">

// ✅ Correct
<h1 className="font-[var(--font-weight-heading)]">
```

---

## Best Practices

### DO ✅

- **Migrate systematically** - One page at a time
- **Test both themes** - Marketing (Bold) and Platform (Ocean)
- **Test dark mode** - Both light and dark variants
- **Create visual tests** - Catch regressions early
- **Update documentation** - Keep COMPONENT_SHOWCASE.md current
- **Use adaptive components** - Don't reinvent the wheel

### DON'T ❌

- **Rush migration** - Take time to test thoroughly
- **Skip visual tests** - You'll regret it later
- **Mix old and new** - Complete one page before moving on
- **Forget dark mode** - Always test both variants
- **Hardcode theme logic** - Let design tokens handle it

---

## Resources

- **Design Tokens**: `docs/DESIGN_TOKEN_SYSTEM.md`
- **Usage Guide**: `docs/THEME_USAGE_GUIDE.md`
- **Component Showcase**: `docs/COMPONENT_SHOWCASE.md`
- **Visual Tests**: `tests/visual/design-system.spec.ts`

---

## Need Help?

**Common Questions**:

Q: Which components should I migrate first?  
A: Start with marketing pages (customer-facing), then core platform pages

Q: How long does migration take per page?  
A: Marketing pages: 1-2 hours, Platform pages: 30-60 min, Utility pages: 15-30 min

Q: Should I use adaptive components or CSS variables?  
A: Use adaptive components for common UI elements, CSS variables for custom styling

Q: What about existing shadcn components?  
A: Keep using them! Just replace hardcoded styles with design tokens

---

**Built with MB.MD Protocol** 🎨  
*Simultaneously • Recursively • Critically*
