# Scott's 50-Page Manual Test Plan
**Created by:** PageAuditAgent (Mr. Blue Agent #8)  
**Date:** November 22, 2025 00:14 UTC  
**Method:** Manual browser navigation with ProactiveErrorDetector monitoring  
**Status:** Stripe config blocked automated testing - manual approach required

---

## How to Execute This Plan

### Setup (1 minute)
1. Open browser to Mundo Tango (already logged in as User ID 168)
2. ProactiveErrorDetector is already monitoring (active in logs)
3. The Plan Progress Bar is visible at bottom of screen

### Test Process (30 minutes)
1. Navigate to each page listed below (in order)
2. Wait 3-5 seconds on each page
3. ProactiveErrorDetector auto-captures any errors
4. Check The Plan Progress Bar for real-time tracking
5. Mark pages complete as you go

### What Gets Monitored Automatically
- ✅ JavaScript errors (ProactiveErrorDetector)
- ✅ HTTP errors (HttpInterceptor)
- ✅ Component health (ComponentHealthMonitor)
- ✅ Console warnings
- ✅ Network failures

---

## The 50 Pages (10 Phases)

### PHASE 1: Core Platform (6 pages)
**Testing: Basic navigation, profiles, settings**

| # | Page Name | Route | Test Actions |
|---|-----------|-------|--------------|
| 1 | Dashboard / Home Feed | `/dashboard` | Check feed loads, posts visible, can create post |
| 2 | User Profile | `/profile` | View profile, check photo upload button, bio editor |
| 3 | Profile Settings | `/settings` | Edit profile info, change password form visible |
| 4 | Privacy & Security | `/settings/privacy` | Privacy settings, data controls |
| 5 | Notification Settings | `/settings/notifications` | Email preferences, push controls |
| 6 | Search & Discover | `/search` | Search bar works, filters apply |

**Expected Time:** 6-8 minutes

---

### PHASE 2: Social Features (6 pages)
**Testing: Friendships, posts, comments**

| # | Page Name | Route | Test Actions |
|---|-----------|-------|--------------|
| 7 | Friendship System | `/friends` | Friends list displays, closeness scores |
| 8 | Friendship Requests | `/friends/requests` | Send/accept requests |
| 9 | Friendship Pages | `/friendship` | Detailed friendship view |
| 10 | Memory Feed | `/memories` | Memories display chronologically |
| 11 | Post Creator | `/feed` | Create post, upload images, tag friends |
| 12 | Comments System | `/feed` | Add comments, reply, like/react |

**Expected Time:** 6-8 minutes

---

### PHASE 3: Communities & Events (10 pages)
**Testing: Maps, groups, events**

| # | Page Name | Route | Test Actions |
|---|-----------|-------|--------------|
| 13 | Community Map (Tango Map) | `/community/map` | Map renders, markers visible |
| 14 | City Groups | `/groups` | City groups listed, join/leave |
| 15 | Professional Groups | `/groups` | Professional groups, role access |
| 16 | Custom Groups | `/groups` | Create custom group |
| 17 | Event Calendar | `/events` | Calendar view, events display |
| 18 | Event Discovery | `/events` | Search events, filters work |
| 19 | Event Details | `/events/:id` | Event details, RSVP |
| 20 | Event Creation | `/events/create` | Create event form |
| 21 | Workshop Management | `/workshops` | Workshops listed |
| 22 | Workshop Details | `/workshops/:id` | Workshop details |

**Expected Time:** 10-12 minutes

---

### PHASE 4: Messaging (4 pages)
**Testing: Direct messages, conversations**

| # | Page Name | Route | Test Actions |
|---|-----------|-------|--------------|
| 23 | Direct Messages | `/messages` | Message list, conversations |
| 24 | Message Thread | `/messages/:id` | Open conversation, send message |
| 25 | Group Conversations | `/messages/groups` | Group chats |
| 26 | Message Search | `/messages/search` | Search messages |

**Expected Time:** 4-5 minutes

---

### PHASE 5: Tango Resources (6 pages)
**Testing: Teachers, venues, music**

| # | Page Name | Route | Test Actions |
|---|-----------|-------|--------------|
| 27 | Teacher Directory | `/teachers` | Teachers listed, search works |
| 28 | Teacher Profile | `/teachers/:id` | Teacher details, reviews |
| 29 | Venue Directory | `/venues` | Venues listed, map view |
| 30 | Venue Details | `/venues/:id` | Venue details, schedule |
| 31 | Music Library | `/music` | Music tracks, playlists |
| 32 | Dance Styles | `/styles` | Tango styles, tutorials |

**Expected Time:** 6-7 minutes

---

### PHASE 6: Commerce (4 pages)
**Testing: Subscriptions, marketplace**

| # | Page Name | Route | Test Actions |
|---|-----------|-------|--------------|
| 33 | Pricing Plans | `/pricing` | Plans visible, features listed |
| 34 | Subscription Management | `/subscription` | Current plan, upgrade options |
| 35 | Marketplace | `/marketplace` | Products listed, search |
| 36 | Product Details | `/marketplace/:id` | Product details, buy button |

**Expected Time:** 4-5 minutes

---

### PHASE 7: AI Features (5 pages)
**Testing: Mr. Blue, LIFE CEO**

| # | Page Name | Route | Test Actions |
|---|-----------|-------|--------------|
| 37 | Mr. Blue Chat | `/mr-blue-chat` | ✅ VALIDATED (375 lines, working) |
| 38 | Visual Editor | `/visual-editor` or `/` | ✅ VALIDATED (316 lines, conversation #20083) |
| 39 | LIFE CEO | `/life-ceo` | AI coach interface |
| 40 | Talent Match | `/talent-match` | Volunteer matching |
| 41 | AI Settings | `/ai-settings` | AI preferences |

**Expected Time:** 5-6 minutes  
**Note:** Pages 37 & 38 already validated by code review

---

### PHASE 8: Admin (4 pages)
**Testing: Admin dashboard, moderation**

| # | Page Name | Route | Test Actions |
|---|-----------|-------|--------------|
| 42 | Admin Dashboard | `/admin/dashboard` | Analytics, stats |
| 43 | User Management | `/admin/users` | User list, search |
| 44 | Content Moderation | `/admin/moderation` | Flagged content |
| 45 | Platform Analytics | `/admin/analytics` | Charts, metrics |

**Expected Time:** 4-5 minutes

---

### PHASE 9: Specialized (3 pages)
**Testing: Live streams, stories, leaderboard**

| # | Page Name | Route | Test Actions |
|---|-----------|-------|--------------|
| 46 | Live Streams | `/live` | Streams listed, join stream |
| 47 | Stories | `/stories` | Stories feed, create story |
| 48 | Leaderboard | `/leaderboard` | Rankings, scores |

**Expected Time:** 3-4 minutes

---

### PHASE 10: Legal & Support (2 pages)
**Testing: Documentation, policies**

| # | Page Name | Route | Test Actions |
|---|-----------|-------|--------------|
| 49 | Help Center | `/help` | FAQs, search |
| 50 | Privacy Policy | `/privacy` | Policy displays |

**Expected Time:** 2-3 minutes

---

## Progress Tracking

### Real-Time Monitoring
**The Plan Progress Bar** (bottom of screen):
- Shows X/50 pages tested
- Current page being tested
- Completion percentage
- Auto-updates every 5 seconds

**ProactiveErrorDetector** (background):
- Capturing all JavaScript errors
- HTTP errors logged
- Component health checks
- Sends batches to Mr. Blue API

### Expected Results
- **Pages with no errors:** Green checkmark ✅
- **Pages with minor warnings:** Yellow warning ⚠️
- **Pages with errors:** Red X ❌

### Known Issues (Skip These)
1. **Location Search:** Nominatim API returns 503 (external service down)
2. **UnifiedLocationPicker:** Health check fails due to location API

---

## Agent Support

### During Testing
**Agents Running:**
- ✅ ProactiveErrorDetector - Auto-capturing errors
- ✅ HttpInterceptor - Monitoring HTTP calls
- ✅ ComponentHealthMonitor - Health checks every 60s
- ✅ ErrorAnalysisAgent - Analyzing patterns
- ✅ SolutionSuggesterAgent - Suggesting fixes

**If You See an Error:**
1. Don't panic - agents are already analyzing it
2. Continue to next page
3. Check Error Analysis Panel (if visible)
4. Agents will escalate critical issues automatically

### After Testing
**Review Results:**
1. Check The Plan Progress Bar (final %)
2. View error summary in Agent Orchestration Panel
3. Review ProactiveErrorDetector logs
4. Generate final validation report

---

## Expected Outcomes

### Best Case (Target)
- 45-48/50 pages pass (90-96%)
- 2-5 pages with minor warnings
- 0-2 pages with errors

### Acceptable Case
- 40-45/50 pages pass (80-90%)
- 5-8 pages with warnings
- 2-5 pages with errors

### Needs Work Case
- <40/50 pages pass (<80%)
- >10 pages with errors
- Critical features broken

---

## Post-Test Actions

### If 90%+ Pass
✅ **READY FOR BETA DEPLOYMENT**
1. Deploy to 10-25 beta testers
2. Monitor with ProactiveErrorDetector
3. Fix any discovered issues
4. Expand to 50-100 users

### If 80-90% Pass
⚠️ **FIX TOP ISSUES FIRST**
1. Review top 5 error patterns
2. Deploy fixes
3. Re-test failed pages
4. Then proceed to beta

### If <80% Pass
❌ **NEEDS MORE WORK**
1. Analyze all error patterns
2. Prioritize critical fixes
3. Re-test all pages
4. Consider delaying beta

---

## Agent Report Template

After testing, PageAuditAgent will generate:

```markdown
# Scott's 50-Page Tour: Final Results

**Completion:** X/50 pages (XX%)
**Pass:** XX pages
**Warning:** XX pages
**Fail:** XX pages

**Top 5 Issues:**
1. [Error pattern] - XX occurrences
2. [Error pattern] - XX occurrences
3. [Error pattern] - XX occurrences
4. [Error pattern] - XX occurrences
5. [Error pattern] - XX occurrences

**Recommendations:**
- [Action 1]
- [Action 2]
- [Action 3]

**Beta Readiness:** READY / FIX ISSUES / NOT READY
```

---

**Generated by:** PageAuditAgent (Mr. Blue Agent #8)  
**Monitoring:** ProactiveErrorDetector, HttpInterceptor, ComponentHealthMonitor  
**Estimated Time:** 30-40 minutes  
**Ready to Start:** ✅ YES - Server running, agents active, user logged in
