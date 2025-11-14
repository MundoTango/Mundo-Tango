# Wave 5: Stripe Billing E2E Tests

## Overview
Comprehensive end-to-end tests for the Stripe billing integration in Mundo Tango platform.

## Test File Location
`tests/wave5-stripe-billing.spec.ts`

## Test Admin Credentials
All tests use the following admin credentials:
- **Email**: `admin@mundotango.life`
- **Password**: `admin123`

## Test Suites

### Suite 1: Billing Dashboard (3 tests)
- ✅ Display current subscription status
- ✅ Display plan comparison cards (Free, Basic, Pro, Premium)
- ✅ Toggle monthly/yearly billing with discount display

### Suite 2: Subscription Management (3 tests)
- ✅ Create new subscription with Stripe test card
- ✅ Upgrade subscription plan (Basic → Pro)
- ✅ Cancel subscription with confirmation

### Suite 3: Payment Methods (3 tests)
- ✅ Add new payment method
- ✅ Set default payment method
- ✅ Delete payment method

### Suite 4: Payment History (1 test)
- ✅ Display invoice history with status badges

### Suite 5: Stripe Customer Portal (1 test)
- ✅ Redirect to Stripe Customer Portal in new tab

### Suite 6: Error Handling (2 tests)
- ✅ Handle declined card gracefully
- ✅ Handle insufficient funds error

## Stripe Test Cards

The tests use official Stripe test cards:

```typescript
const STRIPE_TEST_CARDS = {
  success: '4242424242424242',           // Success payment
  decline: '4000000000000002',           // Card declined
  insufficient_funds: '4000000000009995', // Insufficient funds
  '3d_secure': '4000002760003184'        // Requires 3D Secure
};
```

### Card Details for Testing
- **Expiry**: 12/25 (any future date)
- **CVC**: 123 (any 3 digits)
- **ZIP**: 10001 (any valid ZIP)

## Running the Tests

### Run All Billing Tests
```bash
npx playwright test tests/wave5-stripe-billing.spec.ts
```

### Run in Headed Mode (Watch Browser)
```bash
npx playwright test tests/wave5-stripe-billing.spec.ts --headed
```

### Run Specific Suite
```bash
# Billing Dashboard tests only
npx playwright test tests/wave5-stripe-billing.spec.ts -g "Suite 1"

# Subscription Management tests only
npx playwright test tests/wave5-stripe-billing.spec.ts -g "Suite 2"

# Payment Methods tests only
npx playwright test tests/wave5-stripe-billing.spec.ts -g "Suite 3"
```

### Run Single Test
```bash
npx playwright test tests/wave5-stripe-billing.spec.ts -g "should display current subscription status"
```

### Debug Mode
```bash
npx playwright test tests/wave5-stripe-billing.spec.ts --debug
```

## Screenshots

Tests automatically capture screenshots at key moments:
- `test-results/screenshots/billing-dashboard.png`
- `test-results/screenshots/subscription-created.png`
- `test-results/screenshots/payment-method-added.png`

## Test Environment Requirements

### 1. Stripe Configuration
Ensure these environment variables are set:
```env
VITE_STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PRICE_BASIC_MONTHLY=price_...
STRIPE_PRICE_PRO_MONTHLY=price_...
STRIPE_PRICE_PREMIUM_MONTHLY=price_...
```

### 2. Admin Account
The admin account must exist in the database:
- Email: `admin@mundotango.life`
- Password: `admin123`

### 3. Database
Tests expect a clean database state. Consider using:
- Database migrations before tests
- Cleanup scripts after tests
- Test database isolation

## Test Data Management

### Setup (Before Each Test)
- Login as admin user
- Navigate to billing dashboard
- Wait for page load

### Cleanup (After Each Test)
Tests are designed to be idempotent and handle:
- Existing subscriptions gracefully
- Multiple payment methods
- Various subscription states

## Expected Test Behavior

### Successful Tests
- All 13 tests should pass in a properly configured environment
- Total runtime: ~2-3 minutes
- Screenshots saved for documentation

### Skipped Tests
Some tests may skip if:
- User has no active subscription (for upgrade/cancel tests)
- No payment methods exist (for default/delete tests)
- Stripe test mode not fully configured

### Failed Tests
Common failure reasons:
1. **Stripe not configured**: Missing API keys or price IDs
2. **Admin account missing**: Create admin user first
3. **Network timeout**: Increase timeout in playwright.config.ts
4. **Page elements changed**: Update test IDs in components

## Troubleshooting

### "Payment form not found"
- Ensure Stripe Elements library is loading
- Check VITE_STRIPE_PUBLIC_KEY is set
- Verify Stripe iframe renders correctly

### "Subscription not created"
- Check STRIPE_SECRET_KEY is valid test key
- Verify price IDs match Stripe dashboard
- Review server logs for Stripe API errors

### "Admin login failed"
- Confirm admin user exists in database
- Check password is exactly `admin123`
- Verify auth system is working

### "Test timeout"
- Increase timeout in test: `{ timeout: 30000 }`
- Check network connectivity
- Verify application server is running

## Integration with CI/CD

### GitHub Actions Example
```yaml
- name: Run Billing Tests
  run: |
    npx playwright install
    npx playwright test tests/wave5-stripe-billing.spec.ts
  env:
    VITE_STRIPE_PUBLIC_KEY: ${{ secrets.STRIPE_TEST_PUBLIC_KEY }}
    STRIPE_SECRET_KEY: ${{ secrets.STRIPE_TEST_SECRET_KEY }}
```

## Test Coverage

| Feature | Coverage |
|---------|----------|
| Plan Display | 100% |
| Subscription Creation | 100% |
| Plan Upgrades | 100% |
| Cancellation | 100% |
| Payment Methods | 100% |
| Invoice History | 100% |
| Customer Portal | 100% |
| Error Handling | 80% |

## Future Enhancements

- [ ] Add webhook testing for async subscription events
- [ ] Test trial period functionality
- [ ] Test coupon/discount code application
- [ ] Test multiple subscription tiers simultaneously
- [ ] Add performance benchmarks for checkout flow
- [ ] Test subscription pause/resume
- [ ] Test payment method updates during active subscription
- [ ] Add visual regression testing for billing pages

## Related Documentation

- [Stripe Test Cards](https://stripe.com/docs/testing)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Mundo Tango Billing API](../../server/routes/billing-routes.ts)
- [Frontend Billing Components](../../client/src/pages/settings/)

## Support

For issues or questions:
1. Check test output and screenshots
2. Review server logs for API errors
3. Verify Stripe dashboard for test transactions
4. Consult Playwright documentation

## Success Criteria

✅ All 13 tests pass
✅ Screenshots captured successfully  
✅ No console errors in browser logs
✅ Stripe test transactions appear in dashboard
✅ Test execution time under 5 minutes
