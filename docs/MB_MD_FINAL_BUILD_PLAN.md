# MB.MD FINAL BUILD PLAN - MUNDO TANGO COMPLETE
**Version:** ULTIMATE EXECUTION v1.0  
**Date:** November 17, 2025  
**Goal:** Build to First Facebook Message + All Mr Blue Features + Part 10 Complete  
**Methodology:** MB.MD v8.1 (Simultaneously, Recursively, Critically + Anti-Hallucination Framework)

---

## 🎯 MISSION

**Primary Deliverable:** Scott receives Facebook Messenger invite from admin@mundotango.life at sboddye@gmail.com

**Secondary Deliverable:** Complete Part 10 implementation for 47-page validation tour with Mr Blue

**Timeline:** 8-12 hours execution (parallel subagents)

---

## 📊 AVAILABLE RESOURCES

### ✅ API Keys Configured (24/60)
**Core Infrastructure:**
- ✅ DATABASE_URL (PostgreSQL)
- ✅ SESSION_SECRET
- ✅ SECRETS_ENCRYPTION_KEY

**AI Services:**
- ✅ OPENAI_API_KEY (GPT-4o)
- ✅ ANTHROPIC_API_KEY (Claude 3.5 Sonnet)
- ✅ GROQ_API_KEY (Llama 3.1)
- ✅ DAILY_API_KEY (Video calls)
- ✅ D_ID_API_KEY (Video avatars)
- ✅ ELEVENLABS_API_KEY (Voice cloning)

**Social & Communication:**
- ✅ FACEBOOK_APP_ID
- ✅ FACEBOOK_APP_SECRET
- ✅ FACEBOOK_ACCESS_TOKEN
- ✅ RESEND_API_KEY (Email service)

**Payments:**
- ✅ STRIPE_SECRET_KEY
- ✅ STRIPE_PUBLISHABLE_KEY
- ✅ TESTING_STRIPE_SECRET_KEY
- ✅ TESTING_VITE_STRIPE_PUBLIC_KEY

**Supabase:**
- ✅ SUPABASE_SERVICE_ROLE_KEY
- ✅ SUPABASE_URL
- ✅ VITE_SUPABASE_ANON_KEY
- ✅ VITE_SUPABASE_URL

**Testing:**
- ✅ TEST_ADMIN_EMAIL (admin@mundotango.life)
- ✅ TEST_ADMIN_PASSWORD (admin123)

### ❌ Missing API Keys (36/60) - Document for Later
- ❌ GOOGLE_GEMINI_API_KEY
- ❌ CLOUDINARY_* (3 keys)
- ❌ SENDGRID_API_KEY
- ❌ FACEBOOK_SBODDYE_USERNAME/PASSWORD
- ❌ FACEBOOK_MUNDOTANGO_USERNAME/PASSWORD
- ❌ TWILIO_* (3 keys)
- ❌ 27+ others from Parts 6-7

---

## 🏗️ BUILD ARCHITECTURE

### Phase 1: Foundation (2-3 hours)
**Goal:** Core systems working for Facebook invite

#### Subagent 1: Unified Mr Blue Interface (60 min)
**Priority:** P0 CRITICAL  
**Files:**
- `client/src/components/mr-blue/UnifiedMrBlue.tsx`
- `client/src/components/mr-blue/CommandCenter.tsx`
- `client/src/components/mr-blue/ThePlanView.tsx`
- `client/src/components/mr-blue/VisualEditorMode.tsx`
- `client/src/components/mr-blue/FocusMode.tsx`
- `client/src/contexts/MrBlueContext.tsx`

**Tasks:**
1. Create UnifiedMrBlue component (3 modes: Command Center, Plan, Visual Editor)
2. Integrate existing MrBlueStudio (8 tabs) into Command Center
3. Embed Visual Editor as mode (remove `?edit=true` route)
4. Integrate BlitzNow as Focus Mode card
5. Create ThePlanView component showing Part 10 roadmap
6. Add shared context for avatar state across modes
7. Update App.tsx to use `/mr-blue` route
8. Remove BlitzNowButton floating component

#### Subagent 2: Facebook Messenger Integration (75 min)
**Priority:** P0 CRITICAL  
**Files:**
- `server/services/facebook/FacebookMessengerService.ts`
- `server/services/facebook/AIInviteGenerator.ts`
- `server/routes/facebook-messenger-routes.ts`
- `shared/schema.ts` (friendInvitations table)
- `client/src/components/facebook/InviteSender.tsx`

**Tasks:**
1. Create FacebookMessengerService with Graph API integration
2. Build AIInviteGenerator using OpenAI to analyze Scott's style
3. Create friendInvitations table in schema
4. Add API routes: POST /api/facebook/send-invite
5. Build InviteSender UI component
6. Generate AI-powered personalized invite message
7. Send test message to sboddye@gmail.com via admin@mundotango.life account
8. Add rate limiting (5 invites/day Phase 1)

**AI Message Generation:**
```typescript
const prompt = `
You are Mr. Blue, Scott Russell's AI assistant. Generate a warm, personalized 
Facebook Messenger invitation to Mundo Tango for ${friendName}.

Scott's Context:
- Founder of Mundo Tango, global tango platform
- Teaching tango in South Korea
- Passionate about connecting tango communities worldwide

Friend Context:
- Name: ${friendName}
- Relationship: ${relationship}
- Mutual interests: ${interests}
- Closeness score: ${closenessScore}/1000

Generate a 100-150 word invitation that:
1. Feels authentic to Scott's voice
2. References shared tango experiences if applicable
3. Highlights platform value (226+ events, 95 cities)
4. Includes personal touch
5. Ends with clear call-to-action

Tone: Friendly, enthusiastic, authentic Scott
Format: Plain text, ready to send via Messenger
`;
```

#### Subagent 3: Part 10 Database Schema (45 min)
**Priority:** P0 CRITICAL  
**Files:**
- `shared/schema.ts`

**Tasks:**
1. Add all Part 10 tables:
   - friendInvitations (invite tracking)
   - socialMessages (multi-platform data)
   - friendCloseness (closeness metrics)
   - professionalEndorsements (reputation system)
   - userBadges (badge system)
   - mrBlueTours (tour tracking)
   - tourSentiment (sentiment analysis)
2. Run `npm run db:push --force`
3. Verify all tables created

---

### Phase 2: Mr Blue Features (3-4 hours)
**Goal:** All 8 Mr Blue systems + Part 10 features working

#### Subagent 4: The Plan Roadmap Integration (60 min)
**Priority:** P0 CRITICAL  
**Files:**
- `server/services/mrBlue/PlanTrackerService.ts`
- `server/routes/mr-blue-plan-routes.ts`
- `client/src/components/mr-blue/PlanRoadmap.tsx`

**Tasks:**
1. Parse MB_MD_FINAL_PLAN.md into structured data
2. Create planProgress table
3. Build PlanTrackerService to track page validation
4. Create API endpoints: GET /api/plan/roadmap, POST /api/plan/validate-page
5. Build PlanRoadmap component showing 47 pages
6. Add progress tracking UI
7. Integrate with ThePlanView

#### Subagent 5: Multi-Platform Data Integration (90 min)
**Priority:** P1 HIGH  
**Files:**
- `server/services/facebook/MultiPlatformScraper.ts`
- `server/services/facebook/ClosenessCalculator.ts`
- `server/routes/social-integration-routes.ts`

**Tasks:**
1. Build MultiPlatformScraper (Facebook only for now)
2. Implement ClosenessCalculator algorithm
3. Create socialMessages table
4. Create friendCloseness table
5. Add API endpoints for manual data import
6. Build UI for Scott to upload Facebook DYI data
7. Calculate closeness scores
8. Display top friends ranked by closeness

#### Subagent 6: Professional Reputation System (75 min)
**Priority:** P1 HIGH  
**Files:**
- `server/services/reputation/ReputationService.ts`
- `server/routes/reputation-routes.ts`
- `client/src/components/reputation/EndorsementCard.tsx`
- `client/src/pages/ReputationProfile.tsx`

**Tasks:**
1. Create professionalEndorsements table
2. Build ReputationService
3. Add endpoints: POST /api/endorsements, GET /api/reputation/:userId
4. Calculate professional scores (0-100)
5. Build endorsement UI
6. Create reputation profile page
7. Add skill endorsement system
8. Display "Tango résumé"

---

### Phase 3: Part 10 Pages (2-3 hours)
**Goal:** All 47 pages implemented for Scott's validation tour

#### Subagent 7: Core Pages (90 min)
**Batch Implementation:**
1. Dashboard/Home Feed - enhance existing
2. User Profile Page - add Part 10 features
3. Profile Settings - add all 50+ settings
4. Privacy & Security - GDPR controls
5. Search & Discover - closeness-based
6. Friendship System - multi-platform
7. Friendship Requests - AI-powered
8. Friendship Pages - detailed closeness view
9. Memory Feed - timeline of interactions
10. Post Creator - tango-themed

#### Subagent 8: Community & Events Pages (75 min)
**Batch Implementation:**
11. Community Map (Tango Map)
12. City Groups
13. Professional Groups
14. Custom Groups
15. Event Calendar
16. Event Creation
17. Event RSVP & Check-in
18. Housing Marketplace
19. Housing Listings
20. Housing Search

#### Subagent 9: Messaging & Payments (60 min)
**Batch Implementation:**
21. All-in-One Messaging
22. Direct Messages
23. Group Chats
24. Message Threads
25. Subscription Plans
26. Payment Integration (Stripe test mode)
27. Billing History
28. Invoice Management

#### Subagent 10: Admin & Mr Blue Pages (75 min)
**Batch Implementation:**
29. Admin Dashboard
30. User Management
31. Content Moderation
32. Analytics & Insights
33. ESA Mind Dashboard
34. Visual Editor (embedded mode)
35. Project Tracker
36. Compliance Center
37. Mr. Blue Chat Interface
38. Mr. Blue 3D Avatar
39. Mr. Blue Video Avatar (D-ID)
40. Mr. Blue Tours System
41. Mr. Blue Suggestions
42. AI Help Button
43. Language Switcher (i18n)
44. Translation Management
45. Badge System
46. Invitation Progress Tracker
47. Closeness Metrics Dashboard

---

### Phase 4: Testing & Validation (1-2 hours)
**Goal:** Verify all 47 pages work with admin@mundotango.life account

#### Test Plan:
1. **Login Test**: admin@mundotango.life / admin123
2. **Mr Blue Tour**: Start The Plan, navigate all 47 pages
3. **Facebook Invite**: Generate and send invite to sboddye@gmail.com
4. **Closeness Metrics**: Verify calculation works
5. **Professional Reputation**: Create test endorsements
6. **All 8 Mr Blue Systems**: Video, Chat, Vibe Code, Voice, Messenger, Memory, 3D Creator, AI Video
7. **Visual Editor**: Test conversational editing
8. **Subscription Flow**: Test Stripe test mode
9. **Multi-Platform Data**: Upload Facebook DYI data
10. **E2E Validation**: All critical user flows

---

## 📋 EXECUTION STRATEGY (MB.MD v8.1)

### Simultaneously (Parallel Execution)
- **10 subagents** working in parallel
- Each subagent handles 1-5 pages
- Zero idle time for main agent
- Main agent coordinates + builds shared components

### Recursively (Deep Implementation)
- Not just UI shells - full functionality
- Database migrations complete
- API endpoints tested
- Error handling comprehensive
- Security best practices enforced

### Critically (Quality Obsession)
**10-Layer Quality Pipeline:**
1. ✅ Pre-Flight: Search existing code
2. ✅ LSP Check: Zero TypeScript errors
3. ✅ Schema Validation: Database safety
4. ✅ API Testing: All endpoints work
5. ✅ UI Testing: All pages render
6. ✅ Integration Testing: Systems connect
7. ✅ Security Review: OWASP compliance
8. ✅ Performance: <200ms response times
9. ✅ Accessibility: WCAG 2.1 AA
10. ✅ E2E Testing: Complete user flows

---

## 🎯 SUCCESS CRITERIA

### Primary Deliverable (P0 CRITICAL):
- ✅ Scott receives Facebook Messenger invite at sboddye@gmail.com
- ✅ Invite is AI-generated, personalized, authentic to Scott's voice
- ✅ Invite sent from admin@mundotango.life Facebook account
- ✅ Message includes: platform value, personal touch, clear CTA
- ✅ Tracking recorded in friendInvitations table

### Secondary Deliverable (P0 CRITICAL):
- ✅ Unified Mr Blue interface at /mr-blue (3 modes working)
- ✅ All 8 Mr Blue systems accessible from Command Center
- ✅ The Plan view shows 47 pages from Part 10
- ✅ Visual Editor embedded as mode (not separate route)
- ✅ BlitzNow integrated as Focus Mode
- ✅ Avatar state shared across all modes
- ✅ 0 LSP errors
- ✅ Workflow running successfully

### Part 10 Complete (P1 HIGH):
- ✅ All 47 pages implemented
- ✅ Each page testable by Scott
- ✅ Mr Blue guides Scott page-by-page
- ✅ Progress tracking shows completion percentage
- ✅ Multi-platform data integration working
- ✅ Professional reputation system functional
- ✅ Closeness metrics calculated
- ✅ Badge system operational
- ✅ AI invite generation working
- ✅ E2E tests pass for all critical flows

---

## 📝 MISSING API KEYS - DOCUMENT FOR LATER

### Skip for Now (Build with Mocks/Free Tier):
- ❌ GOOGLE_GEMINI_API_KEY → Use OpenAI instead
- ❌ CLOUDINARY_* → Use local file storage
- ❌ SENDGRID_API_KEY → Use Resend (available)
- ❌ FACEBOOK_SBODDYE_USERNAME/PASSWORD → Use manual DYI upload
- ❌ FACEBOOK_MUNDOTANGO_USERNAME/PASSWORD → Use Graph API with ACCESS_TOKEN
- ❌ TWILIO_* → Skip SMS, use email only

---

## 🚀 DEPLOYMENT CHECKLIST

### Pre-Execution:
- [x] 24 API keys verified
- [x] Database connected
- [x] Part 10 analyzed
- [x] Invite message strategy defined
- [x] Subagent tasks outlined

### During Execution:
- [ ] 10 subagents launched in parallel
- [ ] Database schema updated
- [ ] All API routes created
- [ ] All UI pages built
- [ ] LSP errors = 0
- [ ] Workflow restarted

### Post-Execution:
- [ ] E2E tests pass
- [ ] Facebook invite sent successfully
- [ ] Scott receives message
- [ ] All 47 pages accessible
- [ ] Mr Blue tour functional
- [ ] Quality score 95+/100

---

## 🎉 FINAL DELIVERABLE

**Scott's First Experience:**
1. Opens Facebook Messenger
2. Sees message from admin@mundotango.life:
   ```
   Hey [Friend Name],

   [AI-generated personalized message based on closeness analysis, 
   shared tango experiences, and Scott's authentic voice. 100-150 words.
   References specific mutual memories if available. Highlights Mundo 
   Tango's value (226+ events, 95 cities). Ends with warm invitation 
   to join the global tango community.]

   Join me at Mundo Tango: [invite link]

   Looking forward to dancing with you again! 💃🕺

   Scott
   ```
3. Clicks link, creates account
4. Sees Mr Blue welcome tour
5. Scott logs in at /mr-blue
6. Starts The Plan validation
7. Goes page-by-page through all 47 pages
8. Confirms everything works

---

**Status:** READY FOR EXECUTION  
**Timeline:** 8-12 hours  
**Methodology:** MB.MD v8.1 (Parallel, Recursive, Critical)  
**Quality Target:** 95+/100  

**LET'S BUILD! 🚀**
