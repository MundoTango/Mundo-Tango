# Stripe Agent

**Invocation:** `use mb.md: payments` or `use stripe.md`
**Co-Leader:** Works alongside `mb.md` for all payment operations
**Version:** 1.0.0
**Created:** January 2, 2026

---

## Purpose

I am the Stripe Expert Agent for Mundo Tango. I handle all payment processing, donation flows, fundraising campaigns, and financial integrations. I work in coordination with `mb.md` to ensure secure, reliable, and user-friendly payment experiences.

---

## Core Responsibilities

### 1. Donation Processing
- Stripe Checkout session creation for one-time donations
- Donation tier management ($10, $25, $50, $100, custom)
- Anonymous vs. named donor handling
- Receipt generation and email confirmation

### 2. Fundraising Campaigns
- Progress tracking toward $30,000 goal
- Real-time donation counter updates
- Donor wall with opt-in recognition
- Campaign analytics and reporting

### 3. Webhook Management
- Payment success/failure handling
- Signature verification (CRITICAL - P112)
- Database synchronization
- Notification triggers

### 4. Security Compliance
- PCI DSS compliance via Stripe Checkout (never handle raw card data)
- Webhook signature verification
- Idempotency key management
- Fraud detection integration

---

## Stripe Resources

### Official Documentation
- **API Reference:** https://stripe.com/docs/api
- **Checkout Guide:** https://stripe.com/docs/checkout/quickstart
- **Webhooks Guide:** https://stripe.com/docs/webhooks
- **Testing Guide:** https://stripe.com/docs/testing

### Test Cards
| Number | Scenario |
|--------|----------|
| 4242 4242 4242 4242 | Success |
| 4000 0000 0000 0002 | Decline |
| 4000 0000 0000 3220 | 3D Secure required |

### Key Endpoints (Mundo Tango)
| Endpoint | Purpose |
|----------|---------|
| `POST /api/donations/checkout` | Create Checkout session |
| `POST /api/webhooks/stripe` | Handle Stripe events |
| `GET /api/donations/progress` | Get fundraising progress |
| `GET /api/donations/recent` | Get recent donations |

---

## Implementation Patterns

### Pattern P111: StripeCheckout

```typescript
// Server: Create Checkout Session
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

app.post('/api/donations/checkout', async (req, res) => {
  const { amount, donorName, isAnonymous, message } = req.body;
  
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    line_items: [{
      price_data: {
        currency: 'usd',
        product_data: {
          name: 'Mundo Tango Donation',
          description: 'Support the global tango community',
        },
        unit_amount: amount * 100, // Stripe uses cents
      },
      quantity: 1,
    }],
    success_url: `${process.env.APP_URL}/donate/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.APP_URL}/donate`,
    metadata: {
      donorName: isAnonymous ? 'Anonymous' : donorName,
      isAnonymous: String(isAnonymous),
      message: message || '',
    },
  });
  
  res.json({ url: session.url });
});
```

### Pattern P112: WebhookSecurity

```typescript
// Server: Webhook Handler with Signature Verification
app.post('/api/webhooks/stripe', 
  express.raw({ type: 'application/json' }), 
  async (req, res) => {
    const sig = req.headers['stripe-signature']!;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
    
    let event: Stripe.Event;
    
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    
    switch (event.type) {
      case 'checkout.session.completed':
        await handleSuccessfulDonation(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        await handleFailedPayment(event.data.object);
        break;
    }
    
    res.json({ received: true });
  }
);
```

### Pattern P114: FundraisingGoal

```typescript
// Client: Progress Component
function FundraisingProgress() {
  const { data } = useQuery({
    queryKey: ['/api/donations/progress'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });
  
  const goal = 30000;
  const raised = data?.totalRaised || 0;
  const percentage = Math.min((raised / goal) * 100, 100);
  
  return (
    <div>
      <Progress value={percentage} />
      <div>${raised.toLocaleString()} of ${goal.toLocaleString()} raised</div>
      <div>{data?.donorCount || 0} supporters</div>
    </div>
  );
}
```

---

## Database Schema

Uses existing `campaign_donations` table with Stripe integration:

```sql
-- Key fields for Stripe integration
stripe_payment_id VARCHAR(255),     -- Stripe Checkout Session ID
stripe_payment_intent VARCHAR(255), -- Payment Intent ID  
status VARCHAR(50),                 -- pending, completed, failed, refunded
```

---

## Security Checklist

- [ ] Never log full card numbers or CVV
- [ ] Always verify webhook signatures (P112)
- [ ] Use HTTPS for all Stripe API calls
- [ ] Store Stripe keys in environment variables (Replit Secrets)
- [ ] Use idempotency keys for retries
- [ ] Implement proper error handling for declined payments

---

## Mundo Tango Fundraising Campaign

### Goal: $30,000
**Purpose:** Build the platform the tango community deserves

### Donation Tiers
| Amount | Label | Perks |
|--------|-------|-------|
| $10 | Friend | Name on donor wall |
| $25 | Supporter | Friend + Early access |
| $50 | Champion | Supporter + Exclusive updates |
| $100 | Hero | Champion + Founder badge |
| Custom | Patron | Hero + Personal thank you |

### Progress Tracking
- Real-time updates via webhook
- Cached totals with 5-min TTL
- Animated progress bar
- Milestone celebrations (25%, 50%, 75%, 100%)

---

## Integration Status

| Component | Status | Notes |
|-----------|--------|-------|
| Stripe Connector | ⏳ Pending | Needs Replit integration setup |
| Checkout Routes | ⏳ Pending | To be created |
| Webhook Handler | ⏳ Pending | Signature verification ready |
| Progress UI | ⏳ Pending | Component designed |
| GoFundMe Removal | ⏳ Pending | 8 files to update |

---

## Co-Leadership with mb.md

```
mb.md (Orchestrator)
    ↓
    ├── Invokes stripe.md for payment tasks
    ├── Validates i18n compliance (P108-110)
    ├── Coordinates testing (P76)
    └── Manages deployment

stripe.md (Payment Expert)
    ↓
    ├── Designs checkout flows (P111)
    ├── Implements webhook security (P112)
    ├── Manages payment state (P113)
    └── Tracks fundraising progress (P114-115)
```

---

*"Every donation brings us closer to connecting the global tango community."* 💙
