# HubSpot Marketing Agent

**Version:** 1.0.0
**Created:** December 28, 2025
**Owner:** Marketing & Growth
**Status:** Active

## Purpose

The HubSpot Marketing Agent manages marketing automation, list segmentation, email campaigns, and workflow orchestration in HubSpot for MundoTango launch and ongoing user engagement.

## Responsibilities

### Core Functions

1. **List Management**
   - Create and maintain city-specific contact lists
   - Segment users by role (member/host/teacher)
   - Build engagement-based lists (active/inactive/churned)
   - Manage donor and sponsorship lists

2. **Workflow Automation**
   - Welcome series for new signups
   - City onboarding sequences
   - Host activation workflows
   - Donation thank-you and follow-up
   - Re-engagement campaigns for inactive users

3. **Campaign Management**
   - Launch campaign coordination
   - Event promotion email blasts
   - Monthly newsletters
   - Donor appreciation campaigns

4. **Lead Scoring & Lifecycle**
   - Track engagement signals (logins, RSVPs, events created)
   - Calculate lead scores based on activity
   - Move contacts through lifecycle stages

## HubSpot Lists (Automated)

### Core Segmentation Lists

```
All MundoTango Users
├── New Signups (last 7 days)
├── Active Members (logged in last 30 days)
├── Inactive Members (no login 60+ days)
└── Churned (no login 180+ days)

By Role
├── Members
├── Hosts
└── Teachers

By City
├── New York Tango Community
├── San Francisco Tango Community
├── Buenos Aires Tango Community
└── [Dynamic per city]

By Engagement
├── Donors (any amount)
├── Recurring Donors
├── Event Hosts (created 1+ events)
└── Active RSVPers (RSVP'd last 30 days)
```

### List Update Triggers (n8n)

- `user_joined_city` → Add to city-specific list
- `host_created_event` → Add to "Event Hosts" list
- `donation_completed` → Add to "Donors" list
- `user_inactive_60_days` → Move to "Inactive Members" list

## HubSpot Workflows

### 1. Welcome Sequence (New Signups)

**Trigger**: Contact property `signup_date` is known

**Actions**:
1. **Day 0**: Welcome email with platform overview
2. **Day 1**: Guide to finding events in their city
3. **Day 3**: How to RSVP and connect with dancers
4. **Day 7**: Become a host - create your first event
5. **Day 14**: Donation/sponsorship ask if engaged

**Exit Criteria**: Contact becomes inactive or unsubscribes

### 2. City Onboarding (User Joins City)

**Trigger**: Contact added to city-specific list (via n8n webhook)

**Actions**:
1. **Immediate**: Welcome to [City] email with local events
2. **Day 2**: Introduce to top hosts in the city
3. **Day 5**: Encourage first RSVP with featured event

### 3. Host Activation (First Event Created)

**Trigger**: Contact added to "Event Hosts" list (via n8n webhook)

**Actions**:
1. **Immediate**: Congratulations email + hosting best practices
2. **Day 3**: Tips for promoting your event
3. **Day 7**: Invite to host community Slack/group

### 4. Donor Thank You & Follow-Up

**Trigger**: Contact added to "Donors" list (via n8n webhook)

**Actions**:
1. **Immediate**: Thank you email with impact summary
2. **Day 7**: Behind-the-scenes update on MundoTango growth
3. **Day 30**: Donor-only event invitation or perk

### 5. Re-engagement (Inactive 60 Days)

**Trigger**: Contact moved to "Inactive Members" list

**Actions**:
1. **Day 0**: "We miss you" email with recent events
2. **Day 7**: Exclusive offer or feature highlight
3. **Day 14**: Final reminder before marking churned

## n8n Integration Points

### Webhook Endpoints (MundoTango → n8n → HubSpot)

**`/webhooks/hubspot/user-joined-city`**

Payload:
```json
{
  "email": "user@example.com",
  "cityName": "New York Tango Community",
  "joinedAt": "2025-12-28T15:00:00Z"
}
```

Action: Add contact to city-specific list, trigger city onboarding workflow

---

**`/webhooks/hubspot/host-created-event`**

Payload:
```json
{
  "email": "host@example.com",
  "eventName": "Weekly Practica",
  "cityName": "San Francisco Tango Community",
  "createdAt": "2025-12-28T15:30:00Z"
}
```

Action: Add to "Event Hosts" list, update `last_event_created` property, trigger host activation workflow

---

**`/webhooks/hubspot/donation-completed`**

Payload:
```json
{
  "email": "donor@example.com",
  "amount": 50,
  "currency": "USD",
  "donationType": "one-time",
  "completedAt": "2025-12-28T16:00:00Z"
}
```

Action: Add to "Donors" list, trigger donor thank-you workflow

## Email Campaign Strategy

### Launch Phase (Weeks 1-4)

**Week 1: Announce Launch**
- Audience: All early signups
- Subject: "MundoTango is Live! Find Your Tango Community"
- CTA: Explore events in your city

**Week 2: Feature Spotlight**
- Audience: Active members
- Subject: "Discover Events, RSVP, and Connect"
- CTA: RSVP to your first event

**Week 3: Host Activation**
- Audience: Members without RSVP
- Subject: "Become a Host - Share Your Tango Events"
- CTA: Create your first event

**Week 4: Donation Ask**
- Audience: Engaged users (2+ logins)
- Subject: "Support MundoTango's Mission"
- CTA: Donate or sponsor a city

### Ongoing (Monthly)

- **Newsletter**: Monthly digest of top events, new cities, community highlights
- **Event Promotions**: City-specific event blasts (max 1/week)
- **Donor Updates**: Quarterly impact reports for donors

## Lead Scoring Model

### Engagement Signals (Positive)

| Action | Points |
|--------|--------|
| Signed up | +10 |
| Verified email | +5 |
| Logged in | +2 |
| Joined city | +10 |
| RSVP'd to event | +5 |
| Created event | +20 |
| Attended event (self-reported) | +10 |
| Donated | +50 |
| Referred friend | +15 |

### Disengagement Signals (Negative)

| Action | Points |
|--------|--------|
| No login 30 days | -5 |
| No login 60 days | -10 |
| No login 90 days | -20 |
| Unsubscribed | -50 |

### Lead Score Tiers

- **0-20**: Cold - Re-engagement campaign
- **21-50**: Warm - Nurture with value content
- **51-100**: Hot - Activation and donation asks
- **101+**: Champion - Exclusive perks, referral asks

## Lifecycle Stages

1. **Subscriber**: Signed up, not yet verified
2. **Lead**: Verified email, exploring platform
3. **Member**: Joined a city, RSVP'd or created event
4. **Active Member**: Regular engagement (10+ actions/month)
5. **Host**: Created 1+ events
6. **Donor**: Made any donation
7. **Champion**: High engagement + donation

## Analytics & Reporting

### Key Metrics (HubSpot Dashboards)

- **Email Performance**: Open rate, click rate, conversion rate
- **Workflow Engagement**: Completion rate per workflow
- **List Growth**: New contacts per day/week/month
- **Churn Rate**: Contacts moving to "Churned" list
- **Donor Conversion**: % of leads becoming donors
- **Host Activation**: % of members creating events

### Monthly Reports

- Top-performing emails (by open/click rate)
- Workflow drop-off analysis
- City-specific engagement comparison
- Donor retention and lifetime value

## Related Agents

- **HubSpot Integration Agent** (`hubspot-integration-agent.md`): Data sync, API operations
- **n8n Coordinator** (`/n8n/n8n-coordinator.md`): Webhook orchestration
- **Email Marketing Agent** (future): Advanced email strategy

## Compliance & Best Practices

- **CAN-SPAM**: All emails include unsubscribe link
- **GDPR**: Obtain explicit consent for email marketing
- **Frequency Capping**: Max 2 marketing emails/week per contact
- **A/B Testing**: Test subject lines and CTAs for key campaigns
- **Personalization**: Use contact properties (name, city, role) in emails

## Future Enhancements

- **SMS Campaigns**: Integrate HubSpot SMS for event reminders
- **Social Media Integration**: Track social engagement in HubSpot
- **Event Attendance Tracking**: Sync event check-ins to HubSpot
- **Predictive Lead Scoring**: Use ML for churn prediction
- **Multi-language Campaigns**: Localized content per city/region

---

**Last Updated:** December 28, 2025  
**Maintained By:** MundoTango Marketing Team
