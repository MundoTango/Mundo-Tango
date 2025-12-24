# Marketing Screenshots Automation

Automated screenshot generation for Mundo Tango platform marketing materials using Playwright.

## Overview

This test suite automatically captures high-quality screenshots of all major platform features for use in:
- Marketing materials and presentations
- Social media content
- Documentation and user guides
- Product demos and walkthroughs

## Features Captured

### Hero Images (1920x800)
- **Memory Feed**: Social timeline with posts, memories, and interactions
- **Events Discovery**: Browse 739+ tango events worldwide
  - List view with filters
  - Calendar view
  - Interactive map view
- **Housing Marketplace**: Find tango-friendly accommodations
- **Community Feed**: Connect with the global tango community
- **Pro/Organizer Network**: Directory of teachers, DJs, and organizers
- **Groups/Communities**: Join tango communities worldwide
- **User Profile**: Personal dashboard and activity

### Feature Screenshots
- Events browsing (list, calendar, map views)
- Housing search with filters
- Pro network directory
- Group pages and community listings
- Social feed interactions
- Profile dashboards
- Friends network management
- Messaging interface
- Leaderboard and rankings

### AI Assistant
- Mr. Blue chat interface
- Life CEO goal tracking dashboard

### Mobile Views
- Mobile feed (375x812)
- Mobile events list
- Mobile navigation menu

### Demo Flows
- Event discovery workflow (multi-step)
- Housing search workflow
- Social connection workflow

## Prerequisites

### 1. Install Dependencies

```bash
npm install -D @playwright/test
npx playwright install
```

This installs:
- Playwright Test runner
- Chromium, Firefox, and WebKit browsers
- Browser dependencies

### 2. Environment Setup

Create a `.env` file in the root directory (optional):

```bash
BASE_URL=https://mundo-tango.vercel.app
# Or use your local development URL:
# BASE_URL=http://localhost:3000
```

## Usage

### Run All Screenshot Tests

```bash
npx playwright test tests/marketing-screenshots.spec.ts
```

### Run Specific Test Suites

```bash
# Hero images only
npx playwright test tests/marketing-screenshots.spec.ts -g "Hero Images"

# Feature screenshots only
npx playwright test tests/marketing-screenshots.spec.ts -g "Feature Screenshots"

# Mobile views only
npx playwright test tests/marketing-screenshots.spec.ts -g "Mobile Views"

# Demo flows only
npx playwright test tests/marketing-screenshots.spec.ts -g "Demo Flows"
```

### Run on Specific Browser

```bash
# Desktop Chrome (default)
npx playwright test --project=chromium

# Mobile Chrome
npx playwright test --project="Mobile Chrome"
```

### Run with UI Mode (Interactive)

```bash
npx playwright test tests/marketing-screenshots.spec.ts --ui
```

This opens an interactive UI where you can:
- Watch tests execute in real-time
- Debug failures
- Inspect screenshots
- Time-travel through test steps

## Output

### Screenshot Location

All screenshots are saved to:
```
marketing-assets/screenshots/
```

The directory structure:
```
marketing-assets/
└── screenshots/
    ├── hero-feed.png
    ├── hero-events-list.png
    ├── hero-events-calendar.png
    ├── hero-events-map.png
    ├── hero-housing-listings.png
    ├── hero-community-feed.png
    ├── hero-pro-network.png
    ├── hero-groups.png
    ├── hero-profile.png
    ├── feature-events-list.png
    ├── feature-events-calendar.png
    ├── feature-events-map.png
    ├── feature-housing-search.png
    ├── feature-pro-directory.png
    ├── feature-groups-list.png
    ├── feature-group-detail.png
    ├── feature-social-feed.png
    ├── feature-profile-dashboard.png
    ├── feature-friends-network.png
    ├── feature-messaging.png
    ├── feature-leaderboard.png
    ├── feature-mrblue-chat.png
    ├── feature-life-ceo.png
    ├── mobile-feed.png
    ├── mobile-events.png
    ├── mobile-navigation.png
    ├── demo-events-step1.png
    ├── demo-events-step2-detail.png
    ├── demo-housing-step1.png
    ├── demo-housing-step2-filtered.png
    ├── demo-social-step1-feed.png
    └── demo-social-step2-profile.png
```

### Screenshot Specifications

- **Hero Images**: 1920x800 (optimized for landing pages)
- **Feature Screenshots**: Full viewport or specific dimensions
- **Mobile Screenshots**: 375x812 (iPhone dimensions)
- **Format**: PNG (high quality, transparent backgrounds where applicable)

## Customization

### Modify Screenshot Dimensions

Edit the `clip` parameter in the test file:

```typescript
await page.screenshot({
  path: path.join(SCREENSHOTS_DIR, 'my-screenshot.png'),
  clip: { x: 0, y: 80, width: 1920, height: 900 }, // Customize here
});
```

### Add New Screenshots

1. Open `tests/marketing-screenshots.spec.ts`
2. Add a new test in the appropriate `test.describe` block:

```typescript
test('New Feature Screenshot', async ({ page }) => {
  await page.goto(`${BASE_URL}/new-feature`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  await page.screenshot({
    path: path.join(SCREENSHOTS_DIR, 'new-feature.png'),
  });
  console.log('✅ Captured: new-feature.png');
});
```

### Change Base URL

Option 1: Environment variable
```bash
BASE_URL=https://your-url.com npx playwright test
```

Option 2: Update `playwright.config.ts`
```typescript
use: {
  baseURL: 'https://your-url.com',
}
```

## Troubleshooting

### Screenshots are blank or loading

**Solution**: Increase wait times in the test:
```typescript
await page.waitForTimeout(3000); // Wait longer for content to load
```

### Element not found errors

**Solution**: Update selectors in the test file to match current DOM structure:
```typescript
// Old
await page.click('.old-selector');

// New - use more robust selectors
await page.click('[data-testid="element-id"]');
await page.click('text=Button Text');
```

### Tests timing out

**Solution**: Increase timeout in `playwright.config.ts`:
```typescript
use: {
  actionTimeout: 30000, // 30 seconds
  navigationTimeout: 60000, // 60 seconds
}
```

### Screenshots include unwanted elements

**Solution**: Hide elements with CSS before screenshot:
```typescript
// Hide cookie banner, chat widgets, etc.
await page.addStyleTag({
  content: '.cookie-banner, .chat-widget { display: none !important; }'
});
```

## CI/CD Integration

### GitHub Actions Example

Create `.github/workflows/screenshots.yml`:

```yaml
name: Generate Marketing Screenshots

on:
  workflow_dispatch: # Manual trigger
  schedule:
    - cron: '0 0 * * 0' # Weekly on Sunday

jobs:
  screenshots:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npx playwright install --with-deps
      - run: npx playwright test tests/marketing-screenshots.spec.ts
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: marketing-screenshots
          path: marketing-assets/screenshots/
          retention-days: 30
```

## Best Practices

1. **Run regularly**: Schedule weekly screenshot generation to keep marketing materials up-to-date
2. **Review before use**: Always review screenshots for quality and accuracy
3. **Version control**: Commit screenshots to track visual changes over time
4. **Optimize images**: Compress screenshots before using in web content
5. **Document changes**: Update this README when adding new screenshot tests

## Support

For issues or questions:
- Review Playwright documentation: https://playwright.dev/docs/intro
- Check test execution logs for error details
- Contact the development team

## Related Files

- `playwright.config.ts` - Playwright configuration
- `tests/marketing-screenshots.spec.ts` - Test suite
- `MARKETING_CONTENT_MASTER.md` - Marketing content and copy
- `package.json` - Project dependencies
