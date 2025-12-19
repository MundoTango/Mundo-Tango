# MUNDO TANGO - HYBRID BUILD ROADMAP
**Date:** November 17, 2025  
**Timeline:** 4-6 hours  
**Goal:** Facebook Messenger invite flow + 15 critical pages  
**Method:** MB.MD v8.1 parallel execution with verification gates

## EXECUTIVE SUMMARY

**User Decision:** Hybrid approach (C) selected
- Build critical pages needed for invite flow
- Implement Facebook Messenger integration using Graph API
- Send AI-generated personalized invite to sboddye via Messenger
- Proceed slowly with % updates to avoid Facebook spam detection

**Current Status:** 24% complete (12/50 pages functional)  
**Target:** 50% complete (25/50 pages functional) + invite sent

## PHASE 1: FACEBOOK MESSENGER SETUP (0% → 30%)
**Duration:** 90 minutes  
**Subagents:** 3 parallel

### Subagent 1A: Graph API Verification (10%)
**Status:** PENDING  
**Risk:** HIGH - Must not trigger Facebook spam detection

Tasks:
- ✅ Check existing Graph API credentials in secrets
- ✅ Verify admin@mundotango.life account access
- ✅ Check app approval status
- ⚠️  Test connection with single API call (SLOW)
- ⚠️  Verify rate limits (max 200 calls/hour for unapproved apps)
- ⚠️  Monitor for error codes (429 = rate limit, 190 = auth error)

**Safety Protocol:**
- Single test call only
- 10-second wait between calls
- Stop immediately if any error

### Subagent 1B: AI Invite Generator (20%)
**Status:** PENDING  
**Files:** `server/services/facebook/AIInviteGenerator.ts`

Tasks:
- Create OpenAI-powered message generator
- Analyze Scott's writing style from existing content
- Generate personalized invite template
- Include: friendship context, platform value (226+ events, 95 cities), call-to-action
- 100-150 words, authentic Scott voice
- Support variables: {friendName}, {relationship}, {closenessScore}

**Example Output:**
```
Hey [Friend Name]! 👋

I'm building Mundo Tango - a global platform connecting tango communities 
worldwide. We've already got 226+ events across 95 cities!

I'd love for you to be one of the first to join. Your perspective would be 
invaluable as we build this together.

Check it out: https://mundotango.life/invite/[CODE]

Looking forward to connecting!
- Scott
```

### Subagent 1C: Part 10 Database Schema (30%)
**Status:** PENDING  
**Files:** `shared/schema.ts`

Tasks:
- Add friendInvitations table (tracks invite status)
- Add socialMessages table (multi-platform data)
- Add friendCloseness table (closeness metrics 0-1000)
- Add professionalEndorsements table (skill endorsements)
- Add userBadges table (badge system)
- Add mrBlueTours table (tour tracking)
- Run `npm run db:push --force`
- Verify all tables created

**Schema Preview:**
```typescript
friendInvitations: {
  id, userId, friendName, friendEmail, platform (messenger/email),
  message, sentAt, status, inviteCode, closenessScore
}
```

## PHASE 2: CRITICAL PAGES (30% → 60%)
**Duration:** 120 minutes  
**Subagents:** 3 parallel

### Subagent 2A: User Profile System (40%)
**Status:** PENDING  
**Pages:** Profile, Privacy Settings, Notification Settings

Tasks:
- Complete ProfilePrototypePage.tsx (Part 4 features)
- Add tango roles selector (Dancer, Teacher, DJ, Organizer, Musician, Venue Owner)
- Add bio editor with i18n support
- Add profile photo upload
- Create PrivacySettingsPage.tsx (new)
- Create NotificationSettingsPage.tsx (new)
- Integrate with schema

### Subagent 2B: Friendship Pages (50%)
**Status:** PENDING  
**Pages:** Friends List, Friend Requests, Friend Detail

Tasks:
- Complete FriendsPrototypePage.tsx
- Complete FriendRequestsPage.tsx
- Create FriendDetailPage.tsx (closeness metrics display)
- Add "Send Invite" button to Friends page
- Add friendship questionnaire form (when met, where met, our story)
- Show closeness score (0-1000)

### Subagent 2C: Events & Community (60%)
**Status:** PENDING  
**Pages:** Event Calendar, Event Detail, Community Map

Tasks:
- Complete CalendarPage.tsx (React Big Calendar)
- Complete CreateEventPage.tsx
- Add event RSVP functionality
- Add event check-in endpoint
- Complete CommunityWorldMapPage.tsx
- Display 226+ events across 95 cities
- Add event filters (city, date, type)

## PHASE 3: MESSENGER INTEGRATION (60% → 85%)
**Duration:** 90 minutes  
**Subagents:** 2 parallel

### Subagent 3A: Facebook Messenger Service (75%)
**Status:** PENDING  
**Files:** `server/services/facebook/FacebookMessengerService.ts`

Tasks:
- Create Graph API client wrapper
- Implement sendMessage() function
- Add rate limiting (5 invites/day Phase 1)
- Add retry logic with exponential backoff (3 retries max)
- ⚠️  Test with admin@mundotango.life account (1 test message only)
- Log all API calls for monitoring
- Add error handling (429, 190, network errors)

**Safety Protocol:**
- Wait 10 seconds between API calls
- Max 1 test message
- Monitor response codes
- Stop on any error

### Subagent 3B: Invite Sender UI (85%)
**Status:** PENDING  
**Files:** `client/src/components/facebook/InviteSender.tsx`

Tasks:
- Create invite sender interface component
- Preview generated AI message
- Show send progress (0% → 100%)
- Display success/error states
- Add "Send via Messenger" button
- Add to Friends page
- Real-time status updates

## PHASE 4: TESTING & SENDING (85% → 100%)
**Duration:** 60 minutes

### Step 4A: E2E Testing (90%)
**Status:** PENDING

Tasks:
- ⚠️  Test Graph API connection (SLOW, single call)
- Generate AI invite message for sboddye
- Preview message in UI
- Test invite code generation
- Verify database records created
- Check LSP diagnostics (0 errors)
- Verify workflow running

### Step 4B: Send Invite (95%)
**Status:** PENDING  
**CRITICAL:** Requires user approval before execution

Tasks:
1. Generate personalized invite for sboddye (10%)
2. Show preview to user for approval (20%)
3. **PAUSE** - Get user confirmation (30%)
4. Send via Facebook Messenger API (40%)
5. Monitor delivery status (60%)
6. Wait 10 seconds for delivery (80%)
7. Verify no spam flags (90%)
8. Update database status (95%)

**User Approval Required Before Send**

### Step 4C: Verification (100%)
**Status:** PENDING

Tasks:
- User confirms receipt in Facebook Messenger
- Update replit.md with completion
- Document lessons learned in mb.md
- Update gap analysis (24% → 50%)
- Prepare roadmap for full 50-page build

## CRITICAL PAGES FOR INVITE FLOW (15 TOTAL)

1. ✅ **Home Feed** - Already working (FeedPrototypePage.tsx)
2. ⚠️  **User Profile** - Needs Part 4 features (ProfilePrototypePage.tsx)
3. ❌ **Privacy Settings** - New page required
4. ❌ **Notification Settings** - New page required
5. ⚠️  **Friends List** - Needs completion (FriendsPrototypePage.tsx)
6. ⚠️  **Friend Requests** - Needs completion (FriendRequestsPage.tsx)
7. ❌ **Friend Detail** - New page (closeness metrics)
8. ⚠️  **Event Calendar** - Needs completion (CalendarPage.tsx)
9. ⚠️  **Event Detail** - Needs RSVP/check-in
10. ❌ **Invite Sender** - New component
11. ⚠️  **Community Map** - Needs completion (CommunityWorldMapPage.tsx)
12. ⚠️  **Search** - Needs completion (SearchPage.tsx)
13. ⚠️  **Messaging** - Already exists (UnifiedInbox), needs testing
14. ⚠️  **Subscription Plans** - Already exists, needs testing
15. ✅ **Mr Blue Chat** - Already working (MrBlueChatPage.tsx)

## SUCCESS CRITERIA

### Technical
- ✅ All 15 pages accessible in browser
- ✅ User can navigate complete invite flow
- ✅ AI message generation working (OpenAI)
- ✅ Facebook Messenger API integration functional
- ✅ 0 LSP errors
- ✅ Workflow running successfully
- ✅ All database tables created

### Business
- ✅ Invite sent to sboddye via Facebook Messenger
- ✅ No Facebook spam flags triggered
- ✅ Message authentic to Scott's voice
- ✅ User confirms invite received
- ✅ Invite code valid and unique

### Quality
- ✅ 95/100 quality score (current: 100/100 after security fixes)
- ✅ All routes tested
- ✅ Error handling robust
- ✅ Logging comprehensive

## FACEBOOK SAFETY PROTOCOLS

### 1. Rate Limiting
- Max 1 test message during development
- Max 1 production invite to sboddye
- Wait 10 seconds between API calls
- Monitor for 429 (rate limit) errors
- Exponential backoff: 10s → 30s → 90s

### 2. Progress Updates (User Requested)
- Report % every major step
- Pause before sending actual invite
- Get user confirmation before Facebook API calls
- Real-time status in UI

### 3. Error Handling
- Retry with exponential backoff (3 max)
- Log all errors with timestamps
- Stop immediately if spam flag detected (code 368)
- Graceful degradation (offer manual copy if API fails)

### 4. API Call Monitoring
```typescript
// Log format
{
  timestamp: '2025-11-17T10:30:00Z',
  action: 'send_message',
  recipient: 'sboddye',
  status: 'success',
  responseCode: 200,
  messageId: 'mid.xxx'
}
```

## REMAINING WORK (POST-INVITE)

### Missing Pages (35/50 = 70%)
- City Groups
- Professional Groups
- Custom Groups
- Housing Marketplace (3 pages)
- Comments System
- Memory Feed implementation
- Compliance Center
- ESA Mind Dashboard
- Project Tracker
- Translation Management
- Multi-platform scraping UI
- Closeness Metrics Dashboard
- Professional Reputation Page
- Mr Blue Tours
- Mr Blue Suggestions
- AI Help Button

### Missing Features from Part 10
- Facebook scraping service
- Instagram integration
- WhatsApp integration
- Professional score calculation
- Scott's writing style analyzer
- Auto-generated friendship requests
- Batch invitation scheduling
- Badge system (4 types)
- 68-language switcher
- Self-healing tour overlay

**DEFER TO NEXT SESSION:** Full 50-page build (8-12 hours)

## VERIFICATION GATES

### After Phase 1 (30%)
- [ ] LSP diagnostics show 0 errors
- [ ] Workflow running successfully
- [ ] Database tables created
- [ ] Graph API test call successful
- [ ] AI message generation working

### After Phase 2 (60%)
- [ ] All 15 pages render in browser
- [ ] Navigation between pages works
- [ ] Forms submit successfully
- [ ] Data persists to database
- [ ] No console errors

### After Phase 3 (85%)
- [ ] Messenger service functional
- [ ] Test message sent successfully
- [ ] No Facebook errors
- [ ] Invite UI displays correctly
- [ ] Progress tracking accurate

### After Phase 4 (100%)
- [ ] Invite sent to sboddye
- [ ] User confirms receipt
- [ ] No spam flags
- [ ] Database updated
- [ ] Documentation complete

## TIMELINE BREAKDOWN

- **Phase 1 (Setup):** 90 minutes → 30% complete
- **Phase 2 (Pages):** 120 minutes → 60% complete  
- **Phase 3 (Integration):** 90 minutes → 85% complete
- **Phase 4 (Send):** 60 minutes → 100% complete

**TOTAL:** 6 hours (360 minutes)

**Progress Updates:** Every 30 minutes + before each Facebook API call
