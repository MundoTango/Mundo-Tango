# Event Scraping Sources Guide

## Overview

Mundo Tango uses an automated event scraping system to gather tango events from websites worldwide. This guide explains how to add new event sources and how the automatic scraping workflow operates.

## How Event Sources Work

### Source Types

The platform supports several types of event sources:

| Platform Type | Description | Scraper Agent |
|--------------|-------------|---------------|
| `website` | Standard HTML websites | Agent #116 (Static) |
| `facebook` | Facebook event pages | Agent #118 (Social) |
| `instagram` | Instagram profiles | Agent #118 (Social) |
| `eventbrite` | Eventbrite listings | Agent #117 (JS) |
| `meetup` | Meetup.com groups | Agent #117 (JS) |
| `rss` | RSS/Atom feeds | RSS Feed Service |
| `user_suggested` | User-submitted sites (pending approval) | N/A until approved |

### Scraping Agents

- **Agent #115 (Orchestrator)**: Coordinates all scraping operations
- **Agent #116 (Static Scraper)**: Handles standard HTML websites
- **Agent #117 (JS Scraper)**: Uses Playwright for JavaScript-heavy sites
- **Agent #118 (Social Scraper)**: Handles social media platforms
- **Agent #119 (Deduplicator)**: Merges duplicate events using AI

---

## Adding New Event Sources

### Method 1: User Suggestion (Public)

Users can suggest new event sources through the platform:

1. Navigate to event discovery or onboarding flow
2. Submit a website URL with city information
3. Source is saved as `platform: "user_suggested"` with `isActive: false`
4. Admin notification is sent automatically
5. Admin reviews and approves/rejects the source

**API Endpoint:**
```
POST /api/public-stats/event-sources/suggest
Body: {
  "city": "Buenos Aires",
  "country": "Argentina",
  "url": "https://example-tango-events.com",
  "name": "Example Tango Events" (optional)
}
```

### Method 2: Admin Direct Addition

Admins can add sources directly through the admin panel:

1. Log in as admin/super_admin
2. Navigate to `/admin/scraping`
3. Use the "Add Source" functionality
4. Configure:
   - Name: Display name for the source
   - URL: Website URL to scrape
   - Platform: Type of source (website, rss, etc.)
   - City/Country: Location information
   - Scraper Type: Which agent should handle it

### Method 3: Database Population Script

For bulk additions, use the community population script:

```bash
npx tsx server/scripts/populateTangoCommunities.ts
```

This script adds 226+ verified tango communities and event sources worldwide.

---

## Admin Approval Workflow

### Viewing Pending Sources

**Admin Panel:** Navigate to `/admin/scraping` to see pending sources.

**API Endpoint:**
```
GET /api/admin/scraping/pending-sources
Response: {
  "pendingSources": [...],
  "count": 5
}
```

### Approving a Source

When a source is approved:
1. `isActive` is set to `true`
2. `platform` is updated from `user_suggested` to the appropriate type (e.g., `website`)
3. Source becomes eligible for scraping in the next orchestration cycle

**API Endpoint:**
```
POST /api/admin/scraping/sources/:id/review
Body: {
  "action": "approve",
  "name": "Updated Source Name" (optional),
  "platform": "website" (optional, defaults to "website")
}
```

### Rejecting a Source

Rejected sources are deleted from the database.

**API Endpoint:**
```
POST /api/admin/scraping/sources/:id/review
Body: {
  "action": "reject"
}
```

---

## Automatic Scraping Flow

### Orchestration Cycle

The scraping orchestrator (Agent #115) runs periodically to:

1. **Fetch Active Sources**: Query all sources where `isActive = true`
2. **Group by Platform**: Organize sources by scraper type
3. **Parallel Execution**: Run multiple scrapers simultaneously
4. **Update Timestamps**: Record `lastScrapedAt` for each source
5. **Deduplication**: Agent #119 merges duplicate events
6. **Auto-Create Cities**: Create city groups for new locations

### Triggering Scraping Manually

**Admin Endpoints:**
```
POST /api/admin/trigger-scraping
POST /api/admin/scraping/trigger
```

### Priority Scrapers

High-value sources run every cycle:
- **HoyMilonga**: Major tango event listings
- **TangoCat**: International tango festivals
- **TangoFestivals.net**: Festival calendar

---

## Database Schema

### eventScrapingSources Table

| Column | Type | Description |
|--------|------|-------------|
| id | serial | Primary key |
| name | varchar | Display name |
| url | varchar | Source URL |
| platform | varchar | Source type (website, facebook, etc.) |
| scraperType | varchar | Which agent handles scraping |
| city | varchar | Target city |
| country | varchar | Target country |
| isActive | boolean | Whether source is scraped |
| lastScrapedAt | timestamp | Last successful scrape |
| totalEventsScraped | integer | Total events found |
| priority | varchar | Scraping priority level |
| rssUrl | varchar | RSS feed URL (if applicable) |
| createdAt | timestamp | When source was added |
| updatedAt | timestamp | Last modification |

---

## Best Practices

### When Adding Sources

1. **Verify URL**: Ensure the website is accessible and contains event data
2. **Check Duplicates**: Avoid adding sources that overlap with existing ones
3. **Set Location**: Always specify city and country for proper grouping
4. **Choose Platform**: Select the appropriate platform type for the scraper

### For User-Suggested Sources

1. **Review URL Safety**: Check for malicious or inappropriate content
2. **Verify Event Content**: Confirm the site actually lists tango events
3. **Update Platform Type**: Change from `user_suggested` to the correct type
4. **Consider Priority**: Set priority for high-value sources

---

## Monitoring & Debugging

### Check Scraping Status
```
GET /api/admin/scraping-status
```

### View Scraped Events
```
GET /api/admin/scraping/community-data
```

### Server Logs

Look for these log prefixes:
- `[Agent #115]` - Orchestrator messages
- `[Agent #116]` - Static scraper
- `[Agent #117]` - JS scraper
- `[Agent #118]` - Social scraper
- `[Agent #119]` - Deduplication

---

## Related Documentation

- `docs/ARCHITECTURE.md` - System architecture
- `docs/AI_COST_BUDGET.md` - AI agent cost management
- `server/agents/scraping/` - Scraper implementations
