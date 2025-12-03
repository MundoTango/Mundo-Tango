# Payment System Integration Guide

## Customer Segments: All Tango Roles

MundoTango serves the **entire tango ecosystem**, not just dancers:

### Primary Roles:
1. **Dancers** (Social & Professional)
   - Find events, partners, communities
   - Track dance journey
   - Connect with other dancers

2. **Teachers/Instructors**
   - Manage classes and workshops
   - Promote teaching services
   - Build student communities

3. **DJs & Musicians**
   - Promote gigs and performances  
   - Share tango music
   - Connect with organizers

4. **Event Organizers/Promoters**
   - Create and manage events
   - Promote milongas, festivals
   - Sell tickets and manage RSVPs

5. **Venue Owners**
   - List spaces for tango events
   - Manage bookings
   - Connect with organizers

6. **Designers (Shoes/Clothing)**
   - Showcase tango products
   - Connect with community
   - Sell tango merchandise

7. **Photographers/Videographers**
   - Share tango content
   - Promote services
   - Build portfolios

## Pricing Tier Updates

Update tier descriptions to reflect all roles:

### Free Tier
**For**: Casual community members (all roles)
- Browse events and venues
- Connect with the tango community
- Basic profile

### Pro Tier ($9.99/month)
**For**: Active participants (dancers, DJs, photographers)
- Unlimited event access
- Advanced search
- Priority notifications  
- Remove ads
- Custom profile themes

### Teacher Tier ($29.99/month)  
**For**: Professionals (teachers, organizers, venue owners, DJs)
- Everything in Pro
- Create unlimited events
- Promote classes & workshops
- Analytics dashboard
- Student/customer management
- Custom booking page
- Revenue tracking
- Priority support

## Integration Steps

### 1. Update Pricing Tier Names (Optional)
Consider renaming to be more inclusive:
- Free → Free (keep as is)
- Pro → **Community Pro** or keep as **Pro**
- Teacher → **Professional** (covers teachers, organizers, DJs, venues)

### 2. Integrate PaymentOrchestrator

Update `server/routes/pricing-routes.ts`:

```typescript
import { PaymentOrchestrator } from '../services/payments/core/PaymentOrchestrator';
import { CurrencyManager, Currency } from '../services/payments/core/CurrencyManager';

const paymentOrchestrator = new PaymentOrchestrator();
const currencyManager = new CurrencyManager();

// Replace existing /checkout-session route
router.post('/checkout-session', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { tierId, billingInterval = 'monthly', promoCode } = req.body;

    if (!tierId) {
      return res.status(400).json({ message: 'tierId is required' });
    }

    // Get tier details
    const [tier] = await db.select().from(pricingTiers).where(eq(pricingTiers.id, tierId)).limit(1);
    
    if (!tier) {
      return res.status(404).json({ message: 'Tier not found' });
    }

    // Calculate amount (Stripe uses cents)
    const amount = billingInterval === 'annual' 
      ? (tier.annualPrice || tier.monthlyPrice * 12) * 100
      : tier.monthlyPrice * 100;

    // Process payment through orchestrator
    const result = await paymentOrchestrator.processPayment({
      userId: req.userId,
      amount,
      currency: 'USD', // Phase 1: USD only, Phase 4: detect from user location
      tierId,
      billingInterval,
      metadata: {
        tierName: tier.name,
        tierDisplayName: tier.displayName,
        promoCode: promoCode || null
      }
    });

    if (result.success) {
      // Record checkout session in database
      const [checkoutSession] = await db
        .insert(checkoutSessions)
        .values({
          userId: req.userId,
          stripeSessionId: result.transactionId || '',
          tierId,
          priceId: billingInterval === 'annual' ? tier.stripeAnnualPriceId : tier.stripeMonthlyPriceId,
          billingInterval,
          amount: amount / 100,
          status: 'pending',
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          successUrl: `${req.headers.origin}/upgrade/success`,
          cancelUrl: `${req.headers.origin}/upgrade/cancelled`,
          metadata: result
        })
        .returning();

      // Track upgrade event
      await db.insert(upgradeEvents).values({
        userId: req.userId,
        eventType: 'checkout_created',
        currentTier: 'free',
        targetTier: tier.name,
        conversionCompleted: false,
        checkoutSessionId: result.transactionId,
        metadata: { gateway: result.gateway }
      });

      res.json({
        success: true,
        sessionId: result.transactionId,
        url: result.checkoutUrl,
        gateway: result.gateway,
        checkoutSession
      });
    } else {
      res.status(500).json({
        success: false,
        message: result.error || 'Payment processing failed'
      });
    }

  } catch (error: any) {
    console.error('Checkout session error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Error creating checkout session' 
    });
  }
});
```

### 3. Add Currency Conversion Endpoint (Phase 4)

```typescript
// Convert price to user's preferred currency
router.post('/convert-price', optionalAuth, async (req, res) => {
  try {
    const { amount, fromCurrency = 'USD', toCurrency } = req.body;

    if (!amount || !toCurrency) {
      return res.status(400).json({ message: 'amount and toCurrency required' });
    }

    const result = await currencyManager.convert({
      amount,
      fromCurrency: fromCurrency as Currency,
      toCurrency: toCurrency as Currency
    });

    res.json({
      success: true,
      ...result,
      formattedAmount: currencyManager.formatAmount(result.convertedAmount, toCurrency as Currency)
    });

  } catch (error: any) {
    console.error('Currency conversion error:', error);
    res.status(500).json({ message: error.message });
  }
});
```

### 4. Update Frontend Pricing Copy

Update `client/src/pages/Pricing.tsx` (or equivalent):

```typescript
const tiers = [
  {
    name: 'Free',
    price: '$0',
    interval: 'forever',
    description: 'Perfect for exploring the tango community',
    features: [
      'Browse events and venues',
      'Connect with dancers, teachers, and DJs',
      'Join up to 3 groups',
      'Basic profile',
      'Access to public content'
    ],
    cta: 'Get Started',
    highlighted: false
  },
  {
    name: 'Pro',
    price: '$9.99',
    interval: 'month',
    description: 'For active dancers and community members',
    features: [
      'Everything in Free',
      'Unlimited group memberships',
      'Advanced event search',
      'Priority notifications',
      'Remove ads',
      'Custom profile themes',
      'Download music tracks',
      'Access to premium tutorials'
    ],
    cta: 'Start Free Trial',
    highlighted: true
  },
  {
    name: 'Professional',
    price: '$29.99',
    interval: 'month',
    description: 'For teachers, organizers, DJs, and venue owners',
    features: [
      'Everything in Pro',
      'Create unlimited events',
      'Promote classes & workshops',
      'Manage students/attendees',
      'Analytics dashboard',
      'Custom booking page',
      'Revenue tracking',
      'Venue management tools',
      'DJ setlist features',
      'Priority support'
    ],
    cta: 'Start Professional',
    highlighted: false
  }
];
```

## Testing Checklist

- [ ] Update tier descriptions to reflect all tango roles
- [ ] Integrate PaymentOrchestrator in pricing-routes.ts
- [ ] Test USD payment flow end-to-end
- [ ] Verify Stripe webhook handling
- [ ] Test with Stripe test cards
- [ ] Check database transaction recording
- [ ] Verify upgrade event tracking
- [ ] Test promo code application
- [ ] Confirm email notifications
- [ ] Test subscription management

## Phase 2+ Features

### Role-Specific Features to Add:

**Teachers**:
- Class scheduling
- Student progress tracking  
- Video lesson uploads

**Organizers**:
- Ticket sales
- RSVP management
- Email campaigns

**DJs**:
- Music library management
- Setlist creation
- Track sharing

**Venues**:
- Booking calendar
- Space photos/videos
- Capacity management

**Designers**:
- Product catalog
- E-commerce integration
- Custom shop page

