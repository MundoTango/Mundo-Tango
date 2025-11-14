# Wave 5: Unified Messaging Platform E2E Tests

## 📋 Overview

Comprehensive Playwright E2E test suite for the unified messaging platform integrating:
- **MT Internal Messages** (built-in)
- **Gmail** (via OAuth)
- **Facebook Messenger** (via Graph API)
- **Instagram Direct** (via Instagram API)
- **WhatsApp Business** (via WhatsApp Business API)

## 📁 Test File Location

```
tests/wave5-messages-platform.spec.ts
```

## 🔐 Test Credentials

**Admin User (used for ALL tests):**
- **Email:** `admin@mundotango.life`
- **Password:** `admin123`

## 🧪 Test Suites

### Suite 1: Unified Inbox (4 tests)
Tests the main inbox interface where all channels converge.

**Tests:**
1. ✅ Display unified inbox with all channels
2. ✅ Filter messages by channel
3. ✅ Search messages
4. ✅ Display message preview

**Key Features Tested:**
- Channel filter buttons (All, MT, Gmail, Facebook, Instagram, WhatsApp)
- Message list display
- Search functionality
- Message preview pane
- Badge counts per channel
- Screenshot: `unified-inbox.png`

---

### Suite 2: Channel Connections (4 tests)
Tests the channel management and OAuth connection flows.

**Tests:**
1. ✅ Display channel connection status
2. ✅ Connect new channel (OAuth mock)
3. ✅ Disconnect channel
4. ✅ Manual sync messages

**Key Features Tested:**
- All 5 channels displayed
- Connection status badges
- Connect/disconnect buttons
- OAuth flow initiation (mocked)
- Manual message synchronization
- Screenshot: `channel-connections.png`

---

### Suite 3: Message Templates (4 tests)
Tests template creation, editing, and variable insertion.

**Tests:**
1. ✅ Create new message template
2. ✅ Edit existing template
3. ✅ Delete template
4. ✅ Insert template variable

**Key Features Tested:**
- Template CRUD operations
- Variable insertion: `{{name}}`, `{{eventName}}`, `{{firstName}}`, etc.
- Multi-channel template support
- Public/private template toggle
- Screenshot: `template-created.png`

---

### Suite 4: Message Automations (4 tests)
Tests automation rules for auto-replies, scheduled sends, and routing.

**Tests:**
1. ✅ Create auto-reply automation
2. ✅ Create scheduled send automation
3. ✅ Enable/disable automation
4. ✅ Delete automation

**Key Features Tested:**
- Automation types: auto-reply, scheduled, routing
- Trigger configuration: new message, keyword, time-based
- Channel selection
- Active/inactive toggle
- Screenshot: `automation-created.png`

---

### Suite 5: Compose & Send Messages (4 tests)
Tests message composition, sending, and scheduling.

**Tests:**
1. ✅ Compose new message
2. ✅ Schedule message for later
3. ✅ Use template when composing
4. ✅ Cancel composition

**Key Features Tested:**
- Multi-channel compose
- Template insertion
- Scheduled delivery
- Date/time picker
- Form validation
- Send confirmation

---

### Integration Tests (2 tests)
End-to-end workflow validation.

**Tests:**
1. ✅ Complete workflow: Template → Compose → Send
2. ✅ Real-time message polling (30-second interval)

---

### Error Handling (3 tests)
Tests error states and validation.

**Tests:**
1. ✅ Handle connection failures gracefully
2. ✅ Validate compose form required fields
3. ✅ Validate template form required fields

---

## 📊 Test Statistics

| Metric | Count |
|--------|-------|
| **Total Test Suites** | 7 |
| **Total Tests** | 25 |
| **Lines of Code** | 957 |
| **Screenshots** | 3 |

## 🚀 Running the Tests

### Run All Tests (Headless)
```bash
npx playwright test tests/wave5-messages-platform.spec.ts
```

### Run All Tests (Headed - See Browser)
```bash
npx playwright test tests/wave5-messages-platform.spec.ts --headed
```

### Run Specific Suite
```bash
# Unified Inbox tests only
npx playwright test tests/wave5-messages-platform.spec.ts -g "Suite 1: Unified Inbox"

# Channel Connections tests only
npx playwright test tests/wave5-messages-platform.spec.ts -g "Suite 2: Channel Connections"

# Templates tests only
npx playwright test tests/wave5-messages-platform.spec.ts -g "Suite 3: Message Templates"

# Automations tests only
npx playwright test tests/wave5-messages-platform.spec.ts -g "Suite 4: Message Automations"

# Compose tests only
npx playwright test tests/wave5-messages-platform.spec.ts -g "Suite 5: Compose"
```

### Run Specific Test
```bash
npx playwright test tests/wave5-messages-platform.spec.ts -g "should display unified inbox"
```

### Debug Mode
```bash
npx playwright test tests/wave5-messages-platform.spec.ts --debug
```

### Generate HTML Report
```bash
npx playwright test tests/wave5-messages-platform.spec.ts
npx playwright show-report
```

## 📸 Screenshots

Tests automatically generate screenshots at key states:

| Screenshot | Location | Description |
|------------|----------|-------------|
| `unified-inbox.png` | `test-results/` | Full unified inbox view with all channels |
| `channel-connections.png` | `test-results/` | Channel management page showing all 5 channels |
| `template-created.png` | `test-results/` | Successful template creation |
| `automation-created.png` | `test-results/` | Successful automation creation |

## 🎯 Test Coverage

### Pages Tested
- ✅ `/messages` - Unified Inbox
- ✅ `/messages/channels` - Channel Connections
- ✅ `/messages/templates` - Message Templates
- ✅ `/messages/automations` - Automations

### Components Tested
- ✅ `ComposeMessage.tsx`
- ✅ `UnifiedInbox.tsx`
- ✅ `ChannelConnections.tsx`
- ✅ `Templates.tsx`
- ✅ `Automations.tsx`

### API Endpoints Tested
- ✅ `POST /api/messages/send`
- ✅ `POST /api/messages/schedule`
- ✅ `GET /api/messages/unified`
- ✅ `GET /api/messages/channels`
- ✅ `POST /api/messages/channels/connect`
- ✅ `DELETE /api/messages/channels/:channel`
- ✅ `POST /api/messages/templates`
- ✅ `PATCH /api/messages/templates/:id`
- ✅ `DELETE /api/messages/templates/:id`
- ✅ `POST /api/messages/automations`
- ✅ `PATCH /api/messages/automations/:id`
- ✅ `DELETE /api/messages/automations/:id`

## 🧩 Mock Data Strategy

Tests use a seeding strategy for consistent test data:

```typescript
async function seedMockMessages(page: Page) {
  // Injects test mode flag
  await page.evaluate(() => {
    localStorage.setItem('test-mode', 'true');
  });
}
```

### Mock Message Channels
- **MT:** Internal platform messages
- **Gmail:** Email messages (OAuth mocked)
- **Facebook:** Messenger conversations (Graph API mocked)
- **Instagram:** Direct messages (IG API mocked)
- **WhatsApp:** Business messages (WhatsApp API mocked)

## ✅ Test Patterns Used

### Authentication
```typescript
async function loginAsAdmin(page: Page) {
  await navigateToPage(page, '/login');
  await fillForm(page, {
    'input-username': adminUser.email,
    'input-password': adminUser.password,
  });
  await submitForm(page, 'button-login');
  await page.waitForURL(/\/(feed|dashboard|messages)/);
}
```

### Form Submission
```typescript
await fillInput(page, 'input-template-name', 'Event Invitation');
await fillInput(page, 'textarea-template-body', 'Hello {{name}}!');
await submitForm(page, 'button-save-template');
```

### Channel Selection
```typescript
await page.getByTestId('select-channel').click();
await page.getByTestId('option-channel-mt').click();
```

### Assertions
```typescript
await expect(page.getByTestId('button-compose')).toBeVisible();
await expect(searchInput).toHaveValue('test');
```

## 🔍 Data Test IDs

All interactive elements have `data-testid` attributes for reliable testing:

### Buttons
- `button-compose`
- `button-send`
- `button-schedule`
- `button-cancel`
- `button-filter-{channel}` (all, mt, gmail, facebook, instagram, whatsapp)
- `button-create-template`
- `button-save-template`
- `button-create-automation`
- `button-save-automation`
- `button-connect-{channel}`
- `button-disconnect-{channel}`

### Inputs
- `input-search`
- `input-to`
- `input-subject`
- `textarea-body`
- `input-template-name`
- `textarea-template-body`
- `input-automation-name`

### Selects
- `select-channel`
- `select-template`
- `select-automation-type`
- `select-trigger`

### Cards
- `channel-card-{channel}` (mt, gmail, facebook, instagram, whatsapp)
- `compose-message-card`

### Badges
- `badge-count-{channel}`

## 🐛 Debugging Tips

### View Test Execution
```bash
npx playwright test tests/wave5-messages-platform.spec.ts --headed --debug
```

### Slow Down Execution
Add to test:
```typescript
await page.waitForTimeout(2000); // 2 second pause
```

### Console Logs
Tests include helpful console output:
```
✓ Unified inbox displays all channel filters
✓ Message list and preview pane visible
✓ Channel filtering works correctly
```

### Check Network Calls
```typescript
page.on('request', request => console.log('>>', request.method(), request.url()));
page.on('response', response => console.log('<<', response.status(), response.url()));
```

## 🎬 Video Recording

Failed tests automatically record video:
- Location: `test-videos/`
- Format: `.webm`
- Resolution: 1920x1080

## 📝 Test Reports

### HTML Report
```bash
npx playwright show-report
```

### JSON Report
```
test-results/results.json
```

## ⚠️ Known Limitations

1. **OAuth Flows:** External OAuth (Gmail, Facebook, Instagram, WhatsApp) are mocked in tests. Real OAuth requires actual credentials.

2. **External API Calls:** Tests don't make real API calls to Gmail/Facebook/Instagram/WhatsApp APIs. These are mocked.

3. **Message Seeding:** Currently uses client-side mock data. Production would use API-based seeding.

4. **Real-time Polling:** Tests verify polling doesn't break, but don't verify actual message updates from external sources.

## 🔄 CI/CD Integration

Tests are configured for CI environments:

```yaml
# .github/workflows/playwright.yml
- name: Run Wave 5 Messaging Tests
  run: npx playwright test tests/wave5-messages-platform.spec.ts
  
- name: Upload Test Results
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: test-results/
```

## 📚 Related Documentation

- [Unified Inbox Documentation](../client/src/pages/messages/UnifiedInbox.tsx)
- [Channel Connections Documentation](../client/src/pages/messages/ChannelConnections.tsx)
- [Templates Documentation](../client/src/pages/messages/Templates.tsx)
- [Automations Documentation](../client/src/pages/messages/Automations.tsx)
- [Backend Routes](../server/routes/messages-routes.ts)

## 🎯 Success Criteria

All tests should:
- ✅ Pass consistently
- ✅ Complete within 5 minutes total
- ✅ Generate screenshots at key states
- ✅ Not leave test data in database
- ✅ Handle network delays gracefully
- ✅ Validate form inputs properly
- ✅ Mock external OAuth flows

## 📧 Support

For issues or questions about these tests:
1. Check test output logs
2. Review screenshot artifacts
3. Check video recordings of failures
4. Verify test data was seeded correctly

---

**Created:** January 2025  
**Last Updated:** January 2025  
**Test Framework:** Playwright  
**Node Version:** 18+  
**Status:** ✅ Complete
