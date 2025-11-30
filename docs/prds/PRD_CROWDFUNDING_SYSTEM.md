# PRD: Crowdfunding System

**Version:** 1.0  
**Created:** November 30, 2025  
**Pattern Applied:** MB.MD v9.6 Pattern 28 - Hierarchical Execution  
**Priority:** P0 (Revenue-Critical)  
**Source:** Reverse-engineered from E2E tests, database schema, API routes

---

## 1. Overview

### 1.1 Purpose
The Crowdfunding System provides GoFundMe-style fundraising capabilities for the tango community. It enables creators to launch campaigns for events, community projects, equipment, travel, and emergencies. The system includes AI-powered features for campaign optimization, success prediction, fraud detection, and donor engagement.

### 1.2 Business Value
- **Revenue Stream:** Platform commission on successful campaigns
- **Community Enablement:** Fund tango events, workshops, community projects
- **Creator Support:** AI tools for campaign optimization and donor management
- **Trust Building:** Fraud detection protects platform reputation

### 1.3 Key Metrics
- Total funds raised (monthly/yearly)
- Campaign success rate
- Average donation size
- Donor retention rate

---

## 2. Database Schema

### 2.1 Core Tables

#### `funding_campaigns`
Primary table for crowdfunding campaigns.

| Column | Type | Description |
|--------|------|-------------|
| id | serial | Primary key |
| userId | integer | FK to users.id (campaign creator) |
| title | varchar(255) | Campaign title |
| description | text | Full description |
| shortDescription | varchar(500) | Preview text |
| category | varchar | travel, emergency, event, equipment, community |
| coverImageUrl | varchar | Cover image |
| goalAmount | numeric(10,2) | Funding goal |
| currentAmount | numeric(10,2) | Current raised |
| currency | varchar | Currency code |
| donorCount | integer | Number of donors |
| status | varchar | draft, active, paused, completed, cancelled |
| endDate | timestamp | Campaign end date |
| createdAt | timestamp | Creation date |
| updatedAt | timestamp | Last update |

**Indexes:**
- `funding_campaigns_user_idx` on userId
- `funding_campaigns_status_idx` on status
- `funding_campaigns_category_idx` on category
- `funding_campaigns_created_at_idx` on createdAt

#### `campaign_donations`
Records of donations to campaigns.

| Column | Type | Description |
|--------|------|-------------|
| id | serial | Primary key |
| campaignId | integer | FK to funding_campaigns.id |
| donorUserId | integer | FK to users.id (nullable for anonymous) |
| amount | numeric(10,2) | Donation amount |
| currency | varchar | Currency code |
| tipAmount | numeric(10,2) | Optional platform tip |
| isAnonymous | boolean | Anonymous donation flag |
| displayName | varchar | Display name if anonymous |
| message | text | Donor message |
| stripePaymentId | varchar | Stripe payment reference |
| status | varchar | pending, completed, refunded |
| donatedAt | timestamp | Donation timestamp |
| refundStatus | varchar | Refund status if applicable |

**Indexes:**
- `campaign_donations_campaign_idx` on campaignId
- `campaign_donations_donor_idx` on donorUserId
- `campaign_donations_donated_at_idx` on donatedAt

#### `campaign_updates`
Campaign progress updates and announcements.

| Column | Type | Description |
|--------|------|-------------|
| id | serial | Primary key |
| campaignId | integer | FK to funding_campaigns.id |
| title | varchar | Update title |
| content | text | Update content |
| mediaUrls | jsonb | Attached media |
| createdAt | timestamp | Publication date |

---

## 3. API Endpoints

### 3.1 Campaign Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/crowdfunding/campaigns` | No | List campaigns with filters |
| GET | `/api/crowdfunding/campaigns/:id` | No | Get single campaign |
| POST | `/api/crowdfunding/campaigns` | Yes | Create new campaign |
| PATCH | `/api/crowdfunding/campaigns/:id` | Yes | Update campaign (owner only) |
| DELETE | `/api/crowdfunding/campaigns/:id` | Yes | Delete campaign (owner only) |
| POST | `/api/crowdfunding/campaigns/:id/donate` | Yes | Make donation |
| GET | `/api/crowdfunding/my-campaigns` | Yes | Get creator's campaigns |

### 3.2 AI Agent Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/crowdfunding/predict-success` | Yes | AI success prediction |
| POST | `/api/crowdfunding/optimize` | Yes | AI campaign optimization |
| GET | `/api/crowdfunding/:id/fraud-score` | Yes | Fraud risk assessment |
| POST | `/api/crowdfunding/:id/thank-you` | Yes | Generate thank-you messages |

---

## 4. Frontend Pages

### 4.1 Page Inventory

| Page | Path | Purpose |
|------|------|---------|
| Dashboard | `/crowdfunding/dashboard` | Campaign overview |
| Create | `/crowdfunding/create` | Campaign creation wizard |
| Campaign Detail | `/crowdfunding/campaign/:id` | Public campaign page |
| My Campaigns | `/crowdfunding/my` | Creator's campaign list |

### 4.2 Key UI Components

#### Campaign Creation
```
data-testid="input-campaign-title"
data-testid="input-goal-amount"
data-testid="button-submit-campaign"
data-testid="success-factors"
data-testid="optimal-goal-amount"
data-testid="optimal-duration"
data-testid="funding-timeline-prediction"
```

#### AI Optimization
```
data-testid="campaign-optimization-results"
data-testid="story-quality-score"
data-testid="title-suggestions"
data-testid="image-quality-assessment"
data-testid="reward-tier-optimization"
data-testid="update-frequency-recommendations"
data-testid="ab-testing-suggestions"
```

#### Campaign Management
```
data-testid="campaign-status"
data-testid="campaign-title"
data-testid="campaign-description"
data-testid="funding-progress"
data-testid="funding-progress-bar"
data-testid="donor-count"
data-testid="total-raised"
data-testid="my-campaigns-list"
data-testid="campaign-card-{id}"
```

#### Donations
```
data-testid="button-donate"
data-testid="donation-confirmation"
data-testid="thank-you-message"
data-testid="thank-you-messages"
data-testid="messages-one-time-donors"
data-testid="messages-recurring-donors"
data-testid="messages-whale-donors"
```

#### Fraud Detection
```
data-testid="fraud-risk-score"
```

---

## 5. User Flows

### 5.1 Campaign Creation Flow
```
1. Navigate to /crowdfunding/create
2. Enter campaign details (title, description, goal)
3. Add reward tiers (name, amount, description)
4. Click AI success prediction
5. Review optimization recommendations
6. Apply AI suggestions
7. Submit campaign for review
8. Wait for AI QA approval
9. Campaign published (status: active)
```

### 5.2 Donation Flow
```
1. Navigate to /crowdfunding/campaign/:id
2. View campaign details and progress
3. Select donation amount
4. Enter payment details (Stripe)
5. Optional: Add message, remain anonymous
6. Submit donation
7. View confirmation and thank-you message
8. Donation reflected in campaign totals
```

### 5.3 Campaign Management Flow
```
1. Navigate to /crowdfunding/my
2. View campaigns list
3. Click campaign to view details
4. Check funding progress
5. Pause campaign if needed
6. Resume campaign
7. Add updates with media
8. Generate AI thank-you messages
9. Send bulk thank-you to donors
10. Close campaign early if goal reached
```

---

## 6. AI Features

### 6.1 Success Prediction (AI Agent)
- Success probability percentage (0-100%)
- Success factors analysis
- Optimal goal amount recommendation
- Optimal duration recommendation
- Funding timeline prediction

### 6.2 Campaign Optimization (AI Agent)
- Story quality score
- Title improvement suggestions
- Image quality assessment
- Reward tier optimization
- Update frequency recommendations
- A/B testing suggestions

### 6.3 Donor Engagement (AI Agent)
- Segmented thank-you message generation:
  - One-time donors
  - Recurring donors
  - Whale donors (high-value)
- Bulk message sending capability

### 6.4 Fraud Detection (AI Agent)
- Risk score calculation (0-100)
- High-risk flagging (>70 triggers manual review)
- Pattern detection for suspicious campaigns

---

## 7. Campaign Statuses

| Status | Description |
|--------|-------------|
| draft | Not yet published |
| active | Live and accepting donations |
| paused | Temporarily suspended by creator |
| completed | Successfully funded or ended |
| cancelled | Cancelled by creator |

---

## 8. E2E Test Coverage

### 8.1 Test File
`tests/e2e/06-crowdfunding-system.spec.ts` (338 lines)

### 8.2 Test Suites

| Suite | Tests | Coverage |
|-------|-------|----------|
| Campaign Creation & Optimization | 3 | Create with reward tiers, success prediction, AI optimization |
| Donations & Engagement | 3 | Stripe donation, thank-you messages, campaign updates |
| Fraud Detection & Management | 3 | Suspicious campaign detection, pause/resume, close early |
| Performance & Usability | 4 | Page load times, data persistence, form validation |

---

## 9. Performance Requirements

- All crowdfunding pages: < 3 seconds load time
- Campaign creation: Responsive form validation
- AI predictions: < 20 seconds response time
- Payment processing: Standard Stripe SLA

---

## 10. Cross-System Wirings

| System | Integration Point |
|--------|-------------------|
| Users | Campaign creator, donor references |
| Payments (Stripe) | Donation processing |
| Notifications | Donation alerts, milestone updates |
| Revenue Sharing | Platform commission tracking |

---

## 11. Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-11-30 | Initial PRD creation (reverse-engineered) |

---

*Generated by Mr. Blue Agent Squad 1 (PRD Writers)*
*Pattern Applied: MB.MD v9.6 - Hierarchical Execution*
