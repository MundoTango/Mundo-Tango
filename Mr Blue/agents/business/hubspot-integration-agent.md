# HubSpot Integration Agent

**Version:** 1.0.0
**Created:** December 28, 2025
**Owner:** Business Operations
**Status:** Active

## Purpose

The HubSpot Integration Agent is responsible for synchronizing MundoTango user, city, donation, and event data with HubSpot CRM for marketing automation, campaign management, and customer relationship tracking.

## Responsibilities

### Core Functions
1. **Contact Management**
   - Create and update HubSpot contacts from MundoTango user signups
   - Maintain contact property mappings
   - Handle contact deduplication via email lookup
   - Sync contact lifecycle stages

2. **Deal Management**
   - Create deals for donations and sponsorships
   - Associate deals with contacts
   - Track deal stages and amounts
   - Maintain custom deal properties

3. **Data Integrity**
   - Ensure consistent data mapping between systems
   - Handle API errors gracefully with retry logic
   - Log all sync operations for audit trail
   - Prevent duplicate contact creation

4. **Integration Orchestration**
   - Coordinate with n8n for asynchronous marketing workflows
   - Trigger HubSpot list membership updates
   - Support webhook-driven property updates

## Data Mapping

### Contact Properties (MundoTango → HubSpot)

```
email          → email (primary key)
firstName      → firstname
lastName       → lastname
cityName       → city (custom property)
role           → mundotango_role (custom: member/host/teacher)
signupDate     → signup_date (custom)
signupSource   → "mundotango_app" (hardcoded)
```

### Deal Properties (Donations)

```
amount         → amount
currency       → deal_currency_code
donorEmail     → associated contact (lookup)
cityName       → city (custom property)
donationType   → donation_type (custom: one-time/recurring/sponsorship)
dealstage      → "closedwon" (immediate)
pipeline       → "MundoTango Donations" (custom pipeline)
```

## API Operations

### Contact Upsert Flow

1. **Search**: Query HubSpot for existing contact by email
2. **Decision**: 
   - If found: Update contact with latest properties
   - If not found: Create new contact
3. **Verify**: Confirm operation success, log result
4. **Error Handling**: Retry on transient failures (429, 5xx), log on permanent failures

### Deal Creation Flow

1. **Lookup Contact**: Find or create associated contact
2. **Create Deal**: Set properties and associate with contact
3. **Set Stage**: Mark as "closedwon" for completed donations
4. **Log**: Record deal ID and amount in app logs

## Integration Points

### In-App (Synchronous)
- **User Signup** → `server/services/hubspotContact.ts::upsertContactFromUser()`
- **Donation Complete** → `server/services/hubspotDeal.ts::createDonationDeal()`

### n8n Webhooks (Asynchronous)
- `/webhooks/hubspot/user-joined-city` → Add to city-specific list
- `/webhooks/hubspot/host-created-event` → Update `last_event_created` property
- `/webhooks/hubspot/donation-completed` → Add to "Donors" list

## Configuration

### Environment Variables
```
HUBSPOT_PRIVATE_APP_TOKEN        # Required, never commit
HUBSPOT_PORTAL_ID                # Optional, for reference
HUBSPOT_API_BASE_URL             # Default: https://api.hubapi.com
```

### SDK Setup
```typescript
import { Client } from '@hubspot/api-client';

const hubspotClient = new Client({
  accessToken: process.env.HUBSPOT_PRIVATE_APP_TOKEN,
});
```

## Error Handling & Retries

### Retry Logic
- **Rate Limits (429)**: Exponential backoff, max 3 retries
- **Server Errors (5xx)**: Linear backoff, max 2 retries
- **Client Errors (4xx)**: No retry, log for review

### Graceful Degradation
- HubSpot failures MUST NOT block core app functions (signup, donation)
- Log all failures for later batch reconciliation
- Optional: Queue failed syncs for background processing

## Testing Strategy

### Unit Tests
- Mock HubSpot SDK client
- Test contact upsert logic
- Test deal creation logic
- Verify error handling paths

### Integration Tests
- Use HubSpot sandbox environment
- Verify contact created with correct properties
- Verify deal created and associated with contact
- Test deduplication logic

### E2E Tests (Playwright)
- Run signup flow, verify HubSpot contact exists
- Run donation flow, verify HubSpot deal exists
- Use debug endpoint to query HubSpot

## Dependencies

- `@hubspot/api-client` (npm package)
- HubSpot Private App with scopes:
  - `crm.objects.contacts.read`
  - `crm.objects.contacts.write`
  - `crm.objects.companies.read`
  - `crm.objects.companies.write`
  - `crm.objects.deals.read`
  - `crm.objects.deals.write`

## Monitoring & Logging

### Key Metrics
- Contacts created per day
- Contacts updated per day
- Deals created per day
- API error rate
- Average API latency

### Log Events
- `hubspot_contact_created`: Log email, contact_id
- `hubspot_contact_updated`: Log email, contact_id, fields_changed
- `hubspot_deal_created`: Log deal_id, amount, contact_email
- `hubspot_api_error`: Log endpoint, status_code, error_message

## Related Agents

- **HubSpot Marketing Agent** (`hubspot-marketing-agent.md`): List management, workflows, campaigns
- **n8n Coordinator** (`/n8n/n8n-coordinator.md`): Orchestrates async webhooks
- **User Onboarding Agent** (`/agents/core/user-onboarding-agent.md`): Triggers initial contact sync

## Security & Compliance

- Access token stored in environment variables only
- Never log full contact details (PII)
- Support user data deletion requests (GDPR)
- Audit trail for all contact/deal modifications

## Future Enhancements

- **Bi-directional Sync**: Pull HubSpot contact updates back to MundoTango
- **Custom Objects**: Sync events as HubSpot custom objects
- **Engagement Tracking**: Log page views, email opens in HubSpot
- **Lead Scoring**: Calculate engagement score in HubSpot
- **Marketing Campaigns**: Track campaign ROI via HubSpot analytics

---

**Last Updated:** December 28, 2025  
**Maintained By:** MundoTango Development Team
