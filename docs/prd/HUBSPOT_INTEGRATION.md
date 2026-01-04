# HubSpot CRM Integration Plan

**Status:** Paused  
**Created:** January 4, 2026  
**Priority:** Medium

## Overview

Integrate HubSpot CRM to sync registered users in specific segments for marketing and outreach.

## User Segments

| Segment | Criteria | HubSpot Lifecycle |
|---------|----------|-------------------|
| Waitlisted | `waitlist = true` | Subscriber |
| Contributors | `interests` contains "nomad" | Evangelist |
| Released Users | `interests` contains "tango" (non-contributors) | Lead |

## User Fields to Sync

### Contact Identity
- `email`, `name`, `firstName`, `lastName`, `username`

### Location
- `city`, `state`, `country`, `countryCode`, `stateCode`
- `latitude`, `longitude`

### Tango Profile
- `tangoRoles` (dancer, teacher, DJ, organizer)
- `tangoStartYear`, `leaderLevel`, `followerLevel`
- `interests`, `specialties`

### Platform Status
- `waitlist`, `waitlistDate`
- `subscriptionTier`, `subscriptionStatus`
- `createdAt`, `lastLoginAt`
- `isVerified`, `customerJourneyState`

### Social & Contact
- `mobileNo`, `facebookUrl`, `socialLinks`
- `proPageSlug`

## Volunteer Data to Include

From `volunteerApplications` table (H2AC Program):
- `division` (foundation, core, business, intelligence, platform, extended)
- `preferredRole` (c_level, director, team_lead, expert_agent, individual_contributor)
- `skills`, `experience`
- `portfolioUrl`, `githubUrl`, `linkedinUrl`
- `hoursPerWeek`, `timezone`, `motivation`
- `matchScore`, `suggestedTasks`, `status`

From `volunteers` table (Talent Match):
- `skills`, `availability`, `hoursPerWeek`, `profile`

## HubSpot Custom Properties to Create

- `tango_roles` (multi-select)
- `tango_start_year` (number)
- `interests` (multi-select)
- `waitlist_status` (boolean)
- `waitlist_date` (date)
- `subscription_tier` (dropdown)
- `customer_journey_state` (dropdown)
- `platform_username` (text)
- `volunteer_division` (dropdown)
- `volunteer_role` (dropdown)
- `volunteer_skills` (multi-select)
- `volunteer_hours_weekly` (number)
- `volunteer_match_score` (number)
- `volunteer_status` (dropdown)

## Task List

1. [ ] Create `mr-blue-brain/agents/integrations/hubspotagent.md` with full HubSpot intelligence
2. [ ] Set up HubSpot connector via OAuth integration
3. [ ] Build sync service at `server/services/hubspot/hubspotSync.ts`
4. [ ] Add volunteer data JOIN - merge volunteerApplications and volunteers with user profiles
5. [ ] Register HubSpot agent with Agent Registry
6. [ ] Create admin API endpoint for manual syncs
7. [ ] Add auto-sync hooks on registration, waitlist changes, volunteer updates
8. [ ] Test with existing users (e.g., Aleksandra Plochocka - waitlisted + talent-pipeline)
9. [ ] Update replit.md with integration documentation

## Sync Query Logic

```sql
SELECT u.*, va.*, v.*
FROM users u
LEFT JOIN volunteer_applications va ON va.user_id = u.id
LEFT JOIN volunteers v ON v.user_id = u.id
WHERE u.waitlist = true 
   OR 'nomad' = ANY(u.interests) 
   OR 'tango' = ANY(u.interests)
```

## Files to Create/Modify

- `mr-blue-brain/agents/integrations/hubspotagent.md` - Agent spec
- `server/services/hubspot/hubspotSync.ts` - Sync service
- `server/routes/admin/hubspot.ts` - Admin endpoints
- `server/services/agent-registry` - Register agent
- `replit.md` - Documentation

## Test Case

**Aleksandra Plochocka**
- Waitlisted: Yes
- On talent-pipeline: Yes
- Expected HubSpot sync: Full user profile + volunteer application data
