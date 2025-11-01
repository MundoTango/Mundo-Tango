# Mundo Tango E2E Test Suite

Comprehensive Playwright end-to-end tests covering all critical customer journeys for the Mundo Tango platform.

## Test Structure

```
tests/e2e/
├── fixtures/           # Test data generators and auth setup
├── helpers/           # Reusable test utilities
├── page-objects/      # Page object models (future)
└── *.spec.ts         # Test suites
```

## Test Suites

### 01 - Public Marketing (`01-public-marketing.spec.ts`)
- Navigation through public pages (Home, About, Pricing, FAQ, Contact, Dance Styles)
- Theme toggle functionality
- Login/Register navigation
- Consistent navbar across pages

### 02 - Registration & Auth (`02-registration-auth.spec.ts`)
- User registration flow
- Form validation
- Login/Logout functionality
- Invalid credentials handling

### 03 - Social Engagement (`03-social-engagement.spec.ts`)
- Creating posts
- Liking posts
- Commenting on posts
- @mentions autocomplete
- Sharing posts
- Bookmarking posts
- Nested comment replies

### 04 - Event Discovery (`04-event-discovery.spec.ts`)
- Browsing events
- Searching events
- Filtering by event type
- Viewing event details
- RSVP functionality
- Adding events to calendar
- Event comments

### 05 - Mr Blue AI Chat (`05-mr-blue-ai-chat.spec.ts`)
- Opening chat interface
- Sending messages
- Receiving AI responses (streaming)
- Multi-turn conversations
- Typing indicators
- Chat history persistence

### 06 - Housing Marketplace (`06-housing-marketplace.spec.ts`)
- Browsing listings
- Location search
- Price range filtering
- Viewing listing details
- Contacting landlords
- Saving listings
- Booking viewings

### 07 - Admin Dashboard (`07-admin-dashboard.spec.ts`)
- Accessing admin panel
- Viewing platform statistics
- Moderation queue
- Content moderation
- User management
- Activity logs
- Analytics export

### 08 - Profile Management (`08-profile-management.spec.ts`)
- Viewing profile
- Editing profile information
- Uploading avatar
- Privacy settings
- Activity log
- Password change
- Data download request

## Running Tests

### Run all tests
```bash
npx playwright test
```

### Run specific suite
```bash
npx playwright test tests/e2e/01-public-marketing.spec.ts
```

### Run in headed mode (see browser)
```bash
npx playwright test --headed
```

### Run in debug mode
```bash
npx playwright test --debug
```

### View test report
```bash
npx playwright show-report
```

## Test Configuration

See `playwright.config.ts` for:
- Base URL configuration
- Timeout settings
- Screenshot/video capture
- Reporter options
- Browser selection

## Test Data

Test data is generated dynamically using `nanoid` to ensure uniqueness:
- `generateTestUser()` - Creates unique test users
- `generateTestPost()` - Creates test posts
- `generateTestEvent()` - Creates test events
- `generateTestCommunity()` - Creates test communities
- `generateTestHousingListing()` - Creates test listings

## Test Helpers

Common utilities in `helpers/test-helpers.ts`:
- `waitForNetworkIdle()` - Wait for network activity to settle
- `fillForm()` - Fill multiple form fields
- `verifyToast()` - Check toast notifications
- `clickAndWait()` - Click and wait for navigation
- `takeScreenshot()` - Capture screenshots
- `waitForApiResponse()` - Wait for specific API calls

## CI/CD Integration

Tests are configured to run in CI with:
- Retry on failure (2 retries)
- Headless mode
- Video recording on failure
- HTML report generation

## Best Practices

1. **Isolation**: Each test is independent and creates its own test data
2. **Cleanup**: Tests use unique identifiers to avoid conflicts
3. **Reliability**: Proper waits for network and UI updates
4. **Screenshots**: Captured on failure for debugging
5. **Test IDs**: Use `data-testid` attributes for stable selectors

## Coverage

Current test coverage includes:
- ✅ Public marketing site
- ✅ User authentication
- ✅ Social features (posts, comments, likes)
- ✅ Event discovery and RSVP
- ✅ AI chat (Mr Blue)
- ✅ Housing marketplace
- ✅ Admin dashboard
- ✅ Profile management

## Future Enhancements

- Page Object Models for better maintainability
- Visual regression testing
- Performance testing with Lighthouse
- Mobile viewport tests
- Accessibility testing (ARIA, keyboard navigation)
- API contract testing
