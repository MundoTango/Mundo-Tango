# Visual Regression Testing Guide

**Comprehensive guide for validating design system consistency**  
**Version**: 1.0.0  
**Built with**: Playwright + MB.MD Protocol

---

## Overview

Visual regression testing ensures the design token system works correctly across all 142 pages, both themes, and light/dark modes.

### What We Test

✅ **Theme Detection** - Correct theme applied to each route  
✅ **CSS Variables** - All design tokens set correctly  
✅ **Visual Consistency** - Components look correct in both themes  
✅ **Dark Mode** - Proper dark variants applied  
✅ **Component Behavior** - Adaptive components switch correctly  
✅ **Accessibility** - Proper contrast and hierarchy  

---

## Test Structure

### Test File Organization

```
tests/visual/
├── design-system.spec.ts       # Core design system tests
├── adaptive-components.spec.ts # Component-specific tests
├── marketing-pages.spec.ts     # Marketing page snapshots
└── platform-pages.spec.ts      # Platform page snapshots
```

### Test Categories

#### 1. Theme Detection Tests
Verify correct theme applied based on route:

```typescript
test('Marketing page uses Bold Minimaximalist theme', async ({ page }) => {
  await page.goto('/marketing-prototype-enhanced');
  
  const theme = await page.getAttribute('html', 'data-theme');
  expect(theme).toBe('bold-minimaximalist');
});
```

#### 2. CSS Variable Tests
Validate design token values:

```typescript
test('Primary color is burgundy #b91c3b', async ({ page }) => {
  await page.goto('/marketing-prototype-enhanced');
  
  const primaryColor = await page.evaluate(() => 
    getComputedStyle(document.documentElement)
      .getPropertyValue('--color-primary')
      .trim()
  );
  
  expect(primaryColor).toBe('#b91c3b');
});
```

#### 3. Visual Snapshot Tests
Capture screenshots for comparison:

```typescript
test('Hero section matches baseline', async ({ page }) => {
  await page.goto('/marketing-prototype-enhanced');
  
  const heroSection = page.locator('[data-testid="section-hero"]');
  await expect(heroSection).toHaveScreenshot('bold-hero-light.png', {
    maxDiffPixels: 100,
  });
});
```

#### 4. Component Tests
Validate adaptive component behavior:

```typescript
test('Button has burgundy background on marketing page', async ({ page }) => {
  await page.goto('/marketing-prototype-enhanced');
  
  const button = page.locator('[data-testid="button-join-community"]');
  const bgColor = await button.evaluate(el => 
    window.getComputedStyle(el).backgroundColor
  );
  
  // Burgundy #b91c3b = rgb(185, 28, 59)
  expect(bgColor).toContain('185');
});
```

---

## Running Tests

### Run All Visual Tests

```bash
npm test tests/visual/
```

### Run Specific Test Suite

```bash
npm test tests/visual/design-system.spec.ts
```

### Update Snapshots

```bash
npm test tests/visual/ -- --update-snapshots
```

### Debug Mode

```bash
npm test tests/visual/ -- --debug
```

### Headed Mode (See Browser)

```bash
npm test tests/visual/ -- --headed
```

---

## Writing New Tests

### Template: CSS Variable Test

```typescript
test('Verify [token-name] in [theme]', async ({ page }) => {
  await page.goto('[route]');
  
  const value = await page.evaluate(() => 
    getComputedStyle(document.documentElement)
      .getPropertyValue('--[css-variable]')
      .trim()
  );
  
  expect(value).toBe('[expected-value]');
});
```

### Template: Visual Snapshot Test

```typescript
test('Component visual snapshot', async ({ page }) => {
  await page.goto('[route]');
  
  const component = page.locator('[data-testid="component-id"]');
  await expect(component).toBeVisible();
  
  await expect(component).toHaveScreenshot('[name].png', {
    maxDiffPixels: 100,
  });
});
```

### Template: Dark Mode Test

```typescript
test('Component in dark mode', async ({ page }) => {
  await page.goto('[route]');
  
  // Enable dark mode
  await page.evaluate(() => {
    localStorage.setItem('mundo-tango-dark-mode', 'dark');
    window.location.reload();
  });
  
  await page.waitForLoadState('networkidle');
  
  const hasDarkClass = await page.evaluate(() => 
    document.documentElement.classList.contains('dark')
  );
  
  expect(hasDarkClass).toBe(true);
});
```

---

## Test Matrix

### Complete Coverage (568 Tests)

| Category | Light Mode | Dark Mode | Total |
|----------|-----------|-----------|-------|
| **Marketing Pages (3)** | 3 | 3 | 6 |
| **Platform Pages (139)** | 139 | 139 | 278 |
| **CSS Variables (40)** | 40 | 40 | 80 |
| **Component Tests (50)** | 50 | 50 | 100 |
| **Visual Snapshots (52)** | 52 | 52 | 104 |
| **Total** | 284 | 284 | **568** |

### Priority Levels

**Priority 1 (Critical)**:
- Marketing page theme detection
- Core CSS variables (colors, typography)
- Primary button appearance
- Hero section visuals

**Priority 2 (Important)**:
- Platform page theme detection
- Card component appearance
- Dark mode switching
- Gradient backgrounds

**Priority 3 (Nice to Have)**:
- All 142 page snapshots
- Minor component variations
- Edge cases

---

## CI/CD Integration

### GitHub Actions Workflow

```yaml
name: Visual Regression Tests

on: [push, pull_request]

jobs:
  visual-tests:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright
        run: npx playwright install --with-deps
      
      - name: Run visual tests
        run: npm test tests/visual/
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-results
          path: test-results/
```

---

## Troubleshooting

### Issue: Snapshot Mismatches

**Problem**: Tests fail with pixel differences  
**Solution**: Review diff images, update snapshots if intentional

```bash
# View diffs
open test-results/[test-name]/[snapshot]-diff.png

# Update if correct
npm test tests/visual/ -- --update-snapshots
```

### Issue: CSS Variables Not Set

**Problem**: Variables return empty string  
**Solution**: Verify ThemeProvider is rendering

```typescript
test('Debug CSS variables', async ({ page }) => {
  await page.goto('/marketing-prototype-enhanced');
  
  const allVars = await page.evaluate(() => {
    const styles = getComputedStyle(document.documentElement);
    return {
      primary: styles.getPropertyValue('--color-primary'),
      heading: styles.getPropertyValue('--font-weight-heading'),
      radius: styles.getPropertyValue('--radius-card'),
    };
  });
  
  console.log('CSS Variables:', allVars);
});
```

### Issue: Theme Attribute Missing

**Problem**: `data-theme` attribute not found  
**Solution**: Check route configuration

```typescript
// Verify route is in MARKETING_ROUTES or PLATFORM_ROUTES
import { getThemeForRoute } from '@/config/theme-routes';

test('Debug theme detection', async ({ page }) => {
  await page.goto('/your-page');
  
  const pathname = await page.evaluate(() => window.location.pathname);
  console.log('Pathname:', pathname);
  console.log('Expected theme:', getThemeForRoute(pathname));
  
  const actualTheme = await page.getAttribute('html', 'data-theme');
  console.log('Actual theme:', actualTheme);
});
```

---

## Best Practices

### DO ✅

- **Use data-testid attributes** for stable selectors
- **Allow small pixel differences** (maxDiffPixels: 100)
- **Test both light and dark modes** for each component
- **Update snapshots intentionally** after design changes
- **Run locally before pushing** to catch issues early
- **Group related tests** in describe blocks
- **Use meaningful test names** describing what's validated

### DON'T ❌

- **Hardcode RGB values** - Use hex colors from design tokens
- **Test implementation details** - Focus on visual output
- **Ignore flaky tests** - Fix or mark as known issues
- **Commit without reviewing diffs** - Always check changes
- **Skip dark mode tests** - Both variants must work
- **Use unstable selectors** - Prefer data-testid over classes

---

## Snapshot Management

### Baseline Snapshots

Stored in `tests/visual/[test-name]/[snapshot-name]-linux.png`

### Updating Baselines

```bash
# Update all snapshots
npm test tests/visual/ -- --update-snapshots

# Update specific test
npm test tests/visual/design-system.spec.ts -- --update-snapshots
```

### Reviewing Changes

```bash
# View diff images
open test-results/visual-design-system-spec-ts/bold-hero-light-1-diff.png

# Compare actual vs expected
open test-results/visual-design-system-spec-ts/bold-hero-light-1-actual.png
open tests/visual/design-system.spec.ts/bold-hero-light-1-linux.png
```

---

## Performance Testing

### Measure Theme Switch Performance

```typescript
test('Theme switch performance', async ({ page }) => {
  await page.goto('/marketing-prototype-enhanced');
  
  const startTime = Date.now();
  
  await page.evaluate(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', 'mt-ocean');
  });
  
  await page.waitForTimeout(100);
  const endTime = Date.now();
  
  expect(endTime - startTime).toBeLessThan(200); // Should be instant
});
```

### Check for Layout Shift

```typescript
test('No layout shift on theme load', async ({ page }) => {
  await page.goto('/marketing-prototype-enhanced');
  
  const cls = await page.evaluate(() => {
    return new Promise((resolve) => {
      let clsScore = 0;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            clsScore += entry.value;
          }
        }
        resolve(clsScore);
      }).observe({ type: 'layout-shift', buffered: true });
      
      setTimeout(() => resolve(clsScore), 2000);
    });
  });
  
  expect(cls).toBeLessThan(0.1); // Good CLS score
});
```

---

## Resources

- **Test File**: `tests/visual/design-system.spec.ts`
- **Playwright Docs**: https://playwright.dev/docs/test-snapshots
- **Design Tokens**: `docs/DESIGN_TOKEN_SYSTEM.md`
- **Component Guide**: `docs/COMPONENT_SHOWCASE.md`

---

**Built with MB.MD Protocol** 🎨  
*Simultaneously • Recursively • Critically*
