# FACEBOOK SAFE IMPLEMENTATION PLAN
**Date:** November 17, 2025  
**Method:** MB.MD Safety Protocol + 6-Phase Approach  
**Timeline:** 90 minutes total  
**Goal:** Send single test invite to sboddye via Facebook Messenger

## REVISED APPROACH (After Safety Research)

### WHAT CHANGED FROM ORIGINAL PLAN

**BEFORE (Naive Approach):**
- ❌ Direct implementation without research
- ❌ No token validation
- ❌ No rate limit monitoring
- ❌ No safety checks
- ❌ Risk of permanent Facebook ban

**AFTER (Safety-First Approach):**
- ✅ Comprehensive safety research complete (5 parallel searches)
- ✅ Code audit identifying 7 critical gaps
- ✅ 6-phase implementation with user approval gates
- ✅ Token validation mandatory
- ✅ Rate limit monitoring on every call
- ✅ Recursive monitoring system for long-term compliance
- ✅ Zero tolerance for policy violations

## 6-PHASE SAFE IMPLEMENTATION

### Phase A: Token Validation (0% → 10%)
**Duration:** 20 minutes  
**Risk:** ZERO (read-only)  
**User Approval:** Not required

**Tasks:**
1. Fix P0 issues in FacebookMessengerService.ts:
   - Update env var reference (FACEBOOK_PAGE_ACCESS_TOKEN)
   - Add validateToken() function
   - Add debug_token API call
2. Test token validation
3. **CHECKPOINT:** Report token status to user
4. **STOP if token invalid** - user must regenerate

**Success Criteria:**
- ✅ Token validation function works
- ✅ Token is valid (is_valid = true)
- ✅ Token not expired (expires_at check)
- ✅ Correct app_id returned

### Phase B: Connection Test (10% → 25%)
**Duration:** 15 minutes  
**Risk:** VERY LOW (single read-only call)  
**User Approval:** Not required

**Tasks:**
1. Add P1 safety features:
   - X-App-Usage header parsing
   - Rate limit logging
   - Spam error detection
   - 10-second delays (not needed for read-only)
2. Call verifyConnection() once
3. Parse rate limit headers
4. **CHECKPOINT:** Report rate limit usage to user
5. **STOP if usage >50%**

**Success Criteria:**
- ✅ Connection verified
- ✅ Page info retrieved
- ✅ Rate limit usage <50%
- ✅ Headers parsed correctly

### Phase C: Message Generation (25% → 50%)
**Duration:** 20 minutes  
**Risk:** ZERO (no API calls, AI only)  
**User Approval:** Required for message content

**Tasks:**
1. Generate personalized invite for sboddye using AIInviteGenerator
2. Include platform stats (226+ events, 95 cities)
3. Personalize based on Scott's voice
4. Show preview to user
5. **CHECKPOINT:** Get user approval of message
6. **STOP if user rejects** - regenerate

**Success Criteria:**
- ✅ Message generated (100-150 words)
- ✅ Authentic Scott voice
- ✅ Platform stats included
- ✅ Clear call-to-action
- ✅ User approves message

### Phase D: Tester Role Verification (50% → 60%)
**Duration:** 10 minutes  
**Risk:** ZERO (manual check)  
**User Approval:** Required - user must add sboddye

**Tasks:**
1. User goes to Facebook App Dashboard
2. User navigates to Roles > Testers
3. User adds sboddye's Facebook ID
4. User confirms addition
5. **CHECKPOINT:** User confirms sboddye is Tester
6. **STOP if not added** - cannot send without Tester role

**Success Criteria:**
- ✅ sboddye added as Tester
- ✅ User confirms via screenshot or verbal
- ✅ Documented in audit log

### Phase E: Single Test Send (60% → 95%)
**Duration:** 15 minutes  
**Risk:** LOW (single message to Tester)  
**User Approval:** REQUIRED - explicit confirmation

**CRITICAL: User must explicitly approve before this phase**

**Tasks:**
1. Final user confirmation: "Ready to send test invite?"
2. Send message with ALL safety features:
   - Token validation check
   - Rate limit check (<75%)
   - Spam error monitoring
   - 10-second delay after send
   - Header parsing
3. Monitor response in real-time
4. Log full response
5. Parse rate limit headers
6. **CHECKPOINT:** Report send status to user
7. Wait for user to check Messenger

**Success Criteria:**
- ✅ Message sent successfully (messageId returned)
- ✅ No error codes
- ✅ Rate limit usage remains <75%
- ✅ No spam flags
- ✅ Headers parsed correctly

### Phase F: Verification (95% → 100%)
**Duration:** 10 minutes  
**Risk:** ZERO

**Tasks:**
1. User checks sboddye Messenger account
2. User confirms message received
3. User confirms message looks good
4. Document success
5. Update replit.md
6. **COMPLETE**

**Success Criteria:**
- ✅ User confirms receipt
- ✅ Message displays correctly
- ✅ Invite link works
- ✅ No spam in Messenger folder
- ✅ Documentation updated

## SAFETY CHECKPOINTS

### Automatic STOP Conditions
- ❌ Token invalid or expired
- ❌ Rate limit usage >90%
- ❌ Any spam error detected (#368, #551)
- ❌ User does not approve message
- ❌ Tester role not added
- ❌ User does not approve send

### User Approval Required At:
1. **Phase C End:** Approve generated message content
2. **Phase D End:** Confirm Tester role added
3. **Phase E Start:** Final approval to send

## ESTIMATED TIMELINE

- **Phase A:** 20 min → 10% (Token validation)
- **Phase B:** 15 min → 25% (Connection test)
- **Phase C:** 20 min → 50% (Message generation)
- **Phase D:** 10 min → 60% (Tester role)
- **Phase E:** 15 min → 95% (Send test)
- **Phase F:** 10 min → 100% (Verification)

**TOTAL:** 90 minutes

## SUCCESS DEFINITION

**Technical:**
- Token validated and valid
- Connection established
- Rate limits monitored
- Message sent successfully
- No errors encountered

**Business:**
- sboddye receives invite
- Message is personalized
- Invite link works
- No spam flags

**Safety:**
- All protocols followed
- Zero policy violations
- Account in good standing
- Full audit trail

## NEXT STEPS AFTER COMPLETION

1. Document learnings in mb.md
2. Update replit.md with completion
3. Build recursive monitoring system (BullMQ cron jobs)
4. Continue with Phase 2 (15 critical pages)
5. Full 50-page build (future session)

---

**Current Status:** Ready to begin Phase A (Token Validation)  
**Blocking:** None - can proceed  
**User Action Required:** Approval at 3 checkpoints (message, tester, send)
