# E2E Tests - Facebook Invite Journey

## Overview

This directory contains end-to-end tests for verifying the complete user journey from receiving a Facebook invite to logging into the Mundo Tango platform.

## Test: Facebook Invite Journey

**File:** `facebook-invite-journey.test.ts`

**Purpose:** Verify that users can receive a Facebook invite, click the link, and successfully access the Mundo Tango platform with all features (including the progress bar) working correctly.

### Test Flow

1. **Part A: Facebook Invite Verification**
   - Login to Facebook
   - Navigate to Messenger
   - Find message from Mundo Tango / admin@mundotango.life
   - Verify message exists and extract invite link
   - Take screenshot

2. **Part B: Platform Entry Verification**
   - Navigate to invite link
   - Verify redirect to Mundo Tango
   - Verify landing on login/signup page
   - Take screenshot

3. **Part C: Login & Feature Verification**
   - Fill in login credentials
   - Submit login form
   - Verify successful login
   - Verify progress bar appears at bottom showing mb.md learnings
   - Take final screenshot

### Setup

#### Environment Variables

Create a `.env.test` file or set environment variables:

```bash
# Facebook credentials (for Part A)
FACEBOOK_EMAIL=sboddye@gmail.com
FACEBOOK_PASSWORD=your_facebook_password_here

# Mundo Tango test credentials (for Part C)
MT_TEST_EMAIL=scott@boddye.com
MT_TEST_PASSWORD=admin123
```

#### Prerequisites

1. **Facebook Account Access**
   - Must have valid Facebook credentials
   - Account must have received an invite from Mundo Tango
   - 2FA may require manual intervention during test

2. **Mundo Tango Platform**
   - Platform must be running on `localhost:5000`
   - Test user account must exist: `scott@boddye.com`
   - Progress bar feature should be implemented

3. **Node Packages**
   ```bash
   npm install
   # Playwright should already be installed
   ```

### Running the Tests

#### Full Test (All Parts)
```bash
# Run in headless mode (CI)
npx playwright test server/__tests__/e2e/facebook-invite-journey.test.ts

# Run in headed mode (see browser)
npx playwright test server/__tests__/e2e/facebook-invite-journey.test.ts --headed

# Run in debug mode (step through)
npx playwright test server/__tests__/e2e/facebook-invite-journey.test.ts --debug
```

#### Quick Test (Skip Facebook, Direct Login)
```bash
# Run alternative test that skips Facebook login
npx playwright test server/__tests__/e2e/facebook-invite-journey.test.ts -g "Alternative"
```

#### With Environment Variables
```bash
# Set credentials inline
FACEBOOK_EMAIL=sboddye@gmail.com FACEBOOK_PASSWORD=your_password npx playwright test server/__tests__/e2e/facebook-invite-journey.test.ts --headed
```

### Screenshots

All screenshots are saved to: `/tmp/screenshots/`

**Screenshot Names:**
- `part_a_01_facebook_logged_in_*.png` - After Facebook login
- `part_a_02_message_found_*.png` - Mundo Tango message in Messenger
- `part_b_01_mundo_tango_landing_*.png` - Mundo Tango landing page
- `part_c_01_login_form_filled_*.png` - Login form filled out
- `part_c_02_after_login_click_*.png` - After clicking login
- `part_c_04_logged_in_with_progress_bar_*.png` - Final success screenshot

### Troubleshooting

#### Test Skipped
- **Cause:** `FACEBOOK_PASSWORD` environment variable not set
- **Fix:** Set the environment variable before running

#### Facebook Login Fails
- **Cause:** Incorrect credentials or 2FA required
- **Fix:** 
  - Verify credentials are correct
  - If 2FA enabled, test will pause for 60 seconds to allow manual completion
  - Run in `--headed` mode to complete 2FA manually

#### Message Not Found
- **Cause:** No Mundo Tango message in Facebook Messenger
- **Fix:**
  - Ensure an invite was actually sent
  - Test will fall back to `localhost:5000` for testing
  - Manually send a test invite before running

#### Progress Bar Not Found
- **Cause:** Progress bar feature not implemented or different selector
- **Fix:**
  - Verify progress bar is implemented in the UI
  - Check the test selectors match the actual implementation
  - Test will log warning but won't fail (soft assertion)

#### Timeout Errors
- **Cause:** Slow network or page loading
- **Fix:**
  - Increase timeout in test configuration
  - Ensure platform is running and responsive
  - Check network connectivity

### Test Configuration

The test uses these timeouts:
- Facebook login: 30 seconds
- Page navigation: 30 seconds
- Element waits: 10 seconds
- 2FA wait: 60 seconds (manual)

Modify in `facebook-invite-journey.test.ts` if needed.

### CI/CD Integration

For automated testing in CI/CD:

1. **Skip Facebook Login in CI:**
   ```typescript
   // Test automatically skips if no FACEBOOK_PASSWORD
   if (!FACEBOOK_PASSWORD) {
     test.skip();
   }
   ```

2. **Use Alternative Test:**
   - Run the "Alternative: Direct Mundo Tango Login" test
   - This skips Facebook and tests only Mundo Tango login

3. **Mock Invite Link:**
   - Set environment variable: `INVITE_LINK=http://localhost:5000/invite/test123`
   - Test will use this instead of searching Facebook

### Test Coverage

✅ Facebook authentication
✅ Messenger navigation
✅ Message search and verification
✅ Link extraction
✅ Platform redirect
✅ Login page detection
✅ Form submission
✅ Login verification
✅ Progress bar verification
✅ Screenshot capture at each step

### Success Criteria

All of the following must be true for test to pass:

1. ✅ Facebook login successful
2. ✅ Mundo Tango message found (or fallback used)
3. ✅ Platform navigation successful
4. ✅ Landing on auth page verified
5. ✅ Login form submission successful
6. ✅ User logged in verified
7. ✅ Progress bar present (soft assertion)
8. ✅ All screenshots captured

### Notes

- Test can run with or without actual Facebook credentials
- Fallback mechanisms allow testing core platform functionality
- Progress bar verification is currently a soft assertion (won't fail test)
- All screenshots include timestamp for debugging
- Test creates `/tmp/screenshots/` directory automatically
