# PRD: Subscription Settings Tab

## Overview
Subscription and billing management interface for viewing plan details, managing payment methods, and accessing billing history.

## Features

### 1. Current Plan Display
- **Plan Badge**: Free / Pro / Enterprise with icon
- **Plan Benefits**: List of features included in current plan
- **Usage Metrics** (for applicable plans):
  - API calls used / limit
  - Storage used / limit
  - Events created / limit
- **Renewal Date**: Next billing date
- **Plan Status**: Active / Cancelled / Past Due / Trial

### 2. Plan Comparison
- **Upgrade Options**: Cards showing available plans
  - Free tier features
  - Pro tier features + price
  - Enterprise tier features + price
- **Monthly/Annual Toggle**: Show pricing for both periods
- **Upgrade/Downgrade Buttons**

### 3. Payment Methods
- **Saved Cards**: List of payment methods
  - Card brand icon (Visa, Mastercard, Amex)
  - Last 4 digits
  - Expiration date
  - Default indicator
- **Actions**:
  - Add new payment method
  - Set as default
  - Remove payment method
- **Billing Address**: Display/edit billing address

### 4. Billing History
- **Invoice List**: Paginated table
  - Invoice date
  - Description
  - Amount
  - Status (Paid, Pending, Failed)
  - Download PDF button
- **Filters**: Date range, status

### 5. Subscription Actions
- **Cancel Subscription**: 
  - Confirmation dialog
  - Reason selection (optional)
  - Show what features will be lost
  - Effective date
- **Resume Subscription**: If cancelled but not expired
- **Change Plan**: Upgrade or downgrade

### 6. Promo Codes
- **Apply Promo Code**: Input field + apply button
- **Active Promotions**: Show any applied discounts

### 7. Trial Information (if applicable)
- **Trial Status**: Days remaining
- **Trial Benefits**: What's included
- **Convert to Paid**: CTA button

## UI Components
- Plan comparison cards with feature lists
- Credit card display with brand icons
- Invoice table with pagination
- Progress bars for usage metrics
- Toggle switch for billing period
- Modal dialogs for payment method entry
- Confirmation dialogs for cancellation

## Stripe Integration
Uses existing Stripe integration:
- `stripe.customers.create/update`
- `stripe.subscriptions.create/update/cancel`
- `stripe.paymentMethods.list/attach/detach`
- `stripe.invoices.list`
- `stripe.checkout.sessions.create`

## API Endpoints
- `GET /api/subscription` - Current subscription details
- `POST /api/subscription/upgrade` - Upgrade plan
- `POST /api/subscription/downgrade` - Downgrade plan
- `POST /api/subscription/cancel` - Cancel subscription
- `POST /api/subscription/resume` - Resume cancelled subscription
- `GET /api/payment-methods` - List saved cards
- `POST /api/payment-methods` - Add new card
- `DELETE /api/payment-methods/:id` - Remove card
- `PATCH /api/payment-methods/:id/default` - Set default
- `GET /api/invoices` - Billing history
- `GET /api/invoices/:id/pdf` - Download invoice
- `POST /api/promo-code` - Apply promo code

## Database Schema
Uses existing Stripe-related columns:
- `stripeCustomerId`
- `stripeSubscriptionId`
- `subscriptionStatus`
- `subscriptionPlan`
- `subscriptionPeriodEnd`
- `trialEndsAt`
