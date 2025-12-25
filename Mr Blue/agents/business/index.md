# Business Agents

**Invocation:** `use mb.md: agents:business`

---

## 💼 32 BUSINESS DOMAIN AGENTS

Revenue operations and business automation.

---

## MARKETPLACE AGENTS (9)

### MarketplaceOrchestrator
Coordinates all marketplace operations.

### DynamicPricingAgent
```typescript
interface DynamicPricingAgent {
  calculatePrice(item: Item, context: MarketContext): Price;
  analyzeDemand(category: string): DemandReport;
  suggestPricing(seller: Seller): PricingSuggestion[];
}
```

### FraudDetectionAgent
- Transaction anomaly detection
- User behavior analysis
- Payment pattern matching
- Chargeback prediction

### InventoryManager
- Stock tracking
- Availability updates
- Low stock alerts
- Reorder suggestions

### QualityAssurance
- Listing review
- Photo quality check
- Description validation
- Compliance verification

### RecommendationEngine
- Personalized suggestions
- Similar items
- Cross-selling
- Trending items

### ReviewAnalyzer
- Sentiment analysis
- Fake review detection
- Rating aggregation
- Feedback extraction

### SellerSupport
- Onboarding assistance
- Performance tracking
- Issue resolution
- Best practices

### TransactionMonitor
- Payment tracking
- Dispute management
- Refund processing
- Settlement tracking

---

## FINANCIAL AGENTS (7)

### FinancialOrchestrator
Coordinates all financial operations.

### PaymentProcessor
- Stripe integration
- Multi-currency support
- Payment methods
- Transaction logging

### SubscriptionManager
- Plan management
- Billing cycles
- Upgrade/downgrade
- Cancellation handling

### InvoiceGenerator
- Automatic invoicing
- PDF generation
- Email delivery
- Payment reminders

### RevenueTracker
- Income analytics
- Trend analysis
- Forecasting
- Goal tracking

### TaxCalculator
- Tax rate lookup
- Regional compliance
- Invoice adjustments
- Reporting

### RefundHandler
- Refund processing
- Partial refunds
- Credit issuance
- Policy enforcement

---

## SOCIAL MEDIA AGENTS (8)

### SocialOrchestrator
Coordinates all social media operations.

### ContentGenerator
```typescript
interface ContentGenerator {
  generate(topic: string, platform: Platform): Content;
  repurpose(content: Content, target: Platform): Content;
  schedule(content: Content, time: Date): void;
}
```

### PostScheduler
- Calendar management
- Optimal timing
- Queue management
- Batch posting

### EngagementAnalyzer
- Metrics tracking
- Audience insights
- Performance reports
- Competitor analysis

### CrossPlatformPoster
- Multi-platform posting
- Format adaptation
- Hashtag optimization
- Link tracking

### HashtagOptimizer
- Trending analysis
- Relevance scoring
- Performance tracking
- Suggestions

### InfluencerMatcher
- Profile analysis
- Audience matching
- Outreach templates
- Campaign tracking

### AnalyticsReporter
- Dashboard creation
- Automated reports
- KPI tracking
- Trend identification

---

## CROWDFUNDING AGENTS (5)

### CrowdfundingOrchestrator
Coordinates all crowdfunding operations.

### CampaignOptimizer
- Goal setting
- Milestone planning
- Content optimization
- A/B testing

### DonorEngagement
- Thank you messages
- Update notifications
- Reward fulfillment
- Re-engagement

### GoalTracker
- Progress monitoring
- Projection calculation
- Alert triggers
- Reporting

### RewardFulfillment
- Tier management
- Delivery tracking
- Status updates
- Issue resolution

---

## LEGAL AGENTS (3)

### LegalOrchestrator
Coordinates all legal operations.

### ContractReviewer
```typescript
interface ContractReviewer {
  review(document: Document): ReviewResult;
  flagRisks(document: Document): Risk[];
  suggestClauses(type: ContractType): Clause[];
}
```

### ComplianceChecker
- GDPR compliance
- Terms of service
- Privacy policy
- Regional regulations

---

## 🔧 INTEGRATION

All business agents integrate with:

- **Stripe** for payments
- **SendGrid** for emails
- **Twilio** for SMS
- **Analytics** for tracking

---

*Business automation. Revenue optimization.*
