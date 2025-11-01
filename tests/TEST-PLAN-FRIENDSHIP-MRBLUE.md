# MB.MD Test Plan: Friendship System + Mr. Blue

**Date:** November 1, 2025  
**Protocol:** MB.MD (Simultaneous, Recursive, Critical)  
**Scope:** Complete friendship system with dance stories + Mr. Blue video generation

---

## Test User Personas

### User 1: Alice Martinez (alice)
- **ID:** Will be created
- **Email:** alice@test.com
- **City:** Buenos Aires
- **Role:** Active dancer, sends friend requests
- **Dance Style:** Salon & Milonguero

### User 2: Bob Chen (bob)
- **ID:** Will be created
- **Email:** bob@test.com
- **City:** Barcelona
- **Role:** Receives requests, accepts some
- **Dance Style:** Nuevo & Vals

### User 3: Carol Silva (carol)
- **ID:** Will be created
- **Email:** carol@test.com
- **City:** Buenos Aires
- **Role:** Tests snooze and decline features
- **Dance Style:** Salon

### User 4: David Kim (david)
- **ID:** Will be created
- **Email:** david@test.com
- **City:** Tokyo
- **Role:** Tests 2nd degree connections (friend of Bob)
- **Dance Style:** Vals

### User 5: Eve Lopez (eve)
- **ID:** Will be created
- **Email:** eve@test.com
- **City:** Paris
- **Role:** Tests 3rd degree connections (friend of David)
- **Dance Style:** Milonguero

---

## Connection Network Map

```
Alice (Buenos Aires)
├── 1st Degree: Bob (accepted friend)
├── 1st Degree: Carol (accepted friend)
└── Pending: David

Bob (Barcelona)
├── 1st Degree: Alice (accepted friend)
├── 1st Degree: David (accepted friend)
└── 2nd Degree: Carol (via Alice)
└── 2nd Degree: Eve (via David)

Carol (Buenos Aires)
├── 1st Degree: Alice (accepted friend)
└── 2nd Degree: Bob (via Alice)

David (Tokyo)
├── 1st Degree: Bob (accepted friend)
├── 1st Degree: Eve (accepted friend)
└── 2nd Degree: Alice (via Bob)

Eve (Paris)
├── 1st Degree: David (accepted friend)
└── 3rd Degree: Alice (via David → Bob)
```

---

## Friendship System Tests

### Test Suite 1: Friend Request Flow (Basic)

**Test 1.1: Send Simple Friend Request**
```typescript
// User: Alice → Bob
Action: Alice sends friend request to Bob
Payload: {
  receiverId: bob.id,
  senderMessage: "Hi Bob! Met you at La Viruta last week. Great dancing!"
}
Expected:
  - Request created with status='pending'
  - Bob receives notification
  - Request appears in Bob's "Requests" tab
  - Alice's "Sent Requests" shows pending
```

**Test 1.2: Accept Friend Request**
```typescript
// User: Bob accepts Alice's request
Action: Bob clicks "Accept" on Alice's request
Payload: {
  response: "Thanks Alice! Would love to connect!"
}
Expected:
  - Request status → 'accepted'
  - TWO friendship records created (bidirectional)
    - friendships: (Alice → Bob) AND (Bob → Alice)
  - Both users' friend count increments
  - Both see each other in "All Friends" tab
  - closenessScore = 75 (default)
  - connectionDegree = 1 for both
  - Notification sent to Alice
```

**Test 1.3: Decline Friend Request**
```typescript
// User: Carol declines Alice's request
Action: Carol clicks "Decline" on Alice's request
Payload: {
  response: "Thanks, keeping my circle small for now"
}
Expected:
  - Request status → 'declined'
  - No friendship records created
  - Request removed from Carol's pending list
  - Alice receives notification (optional)
```

---

### Test Suite 2: Friend Request with Dance Story

**Test 2.1: Send Request with Dance Story**
```typescript
// User: Alice → Carol (they danced together)
Action: Alice sends request WITH dance story
Payload: {
  receiverId: carol.id,
  didWeDance: true,
  danceLocation: "Salon Canning, Buenos Aires",
  danceStory: "We danced a beautiful tanda to D'Arienzo! Your embrace was perfect.",
  senderMessage: "Would love to dance again soon!",
  senderPrivateNote: "Met at Sarah's birthday milonga",
  mediaUrls: ["https://example.com/photo1.jpg"]
}
Expected:
  - Request created with all dance fields populated
  - Carol sees dance story in request card
  - Media displayed in request
  - Private note NOT visible to Carol
  - Private note visible to Alice in her sent requests
```

**Test 2.2: Accept Request with Dance Story**
```typescript
// User: Carol accepts Alice's request (with story)
Action: Carol clicks "Accept"
Payload: {
  response: "Yes! That tanda was amazing. Let's dance again!"
}
Expected:
  - Friendship created with initial closenessScore = 80 (higher because danced together)
  - Media copied to friendshipMedia table with phase='acceptance'
  - Dance story preserved in request history
  - Both can view dance story in friendship timeline
```

---

### Test Suite 3: Snooze Functionality

**Test 3.1: Snooze Friend Request**
```typescript
// User: Carol snoozes Bob's request
Action: Carol clicks "Snooze" → selects "7 days"
Expected:
  - Request status → 'snoozed'
  - snoozedUntil = now + 7 days
  - snoozedCount = 1
  - Request hidden from pending list
  - Request reappears after 7 days
```

**Test 3.2: Multiple Snoozes**
```typescript
// User: Carol snoozes same request 3 times
Action: Snooze → 7 days, then again, then again
Expected:
  - snoozedCount increments: 1 → 2 → 3
  - After 3 snoozes, "Snooze" button disabled
  - Must accept or decline
```

---

### Test Suite 4: Mutual Friends

**Test 4.1: Calculate Mutual Friends**
```typescript
// Setup: Alice ←→ Bob, Alice ←→ Carol, Bob ←→ David
// Query: Alice views Bob's profile
Expected:
  - Shows "1 mutual friend" (Carol)
  - Displays Carol's profile in "Mutual Friends" section
```

**Test 4.2: Update Mutual Friends**
```typescript
// Action: Carol sends request to Bob, Bob accepts
Expected:
  - Alice ↔ Bob mutual friends: 1 → 2 (Carol + new connection)
  - Mutual friend count updates in real-time
```

---

### Test Suite 5: Connection Degrees

**Test 5.1: 1st Degree (Direct Friends)**
```typescript
// Alice ←→ Bob (accepted friends)
Expected:
  - Alice views Bob → shows "1st" badge (pink-rose gradient)
  - Bob views Alice → shows "1st" badge
  - connectionDegree = 1 in database
  - Full profile access for both
```

**Test 5.2: 2nd Degree (Friend of Friend)**
```typescript
// Alice ←→ Bob ←→ David
// Alice and David NOT direct friends
Expected:
  - Alice views David → shows "2nd" badge (blue-cyan gradient)
  - David views Alice → shows "2nd" badge
  - Calculated via: Alice's friends → Bob's friends → David
  - Limited profile access (no phone, email)
  - Can send friend request
```

**Test 5.3: 3rd Degree (Extended Network)**
```typescript
// Alice ←→ Bob ←→ David ←→ Eve
// Alice and Eve NOT 1st or 2nd degree
Expected:
  - Alice views Eve → shows "3rd" badge (purple-indigo gradient)
  - Eve views Alice → shows "3rd" badge
  - Calculated via: 3-hop path
  - Very limited profile access
  - Can send friend request
```

**Test 5.4: Not Connected**
```typescript
// Alice views completely unconnected user
Expected:
  - No badge shown
  - connectionDegree = -1
  - Public profile only
  - Can send friend request
```

---

### Test Suite 6: Closeness Score

**Test 6.1: Initial Score**
```typescript
// Alice and Bob become friends
Expected:
  - closenessScore = 75 (default)
  - No shared activities yet
```

**Test 6.2: Score Increases - Shared Events**
```typescript
// Both Alice and Bob RSVP to "Milonga at Salon Canning"
Action: Both users click "Going" on same event
Expected:
  - closenessScore: 75 → 80 (+5 for shared event)
  - friendshipActivities log created:
    - type: 'event_attended_together'
    - metadata: { eventId: 123 }
```

**Test 6.3: Score Increases - Messages**
```typescript
// Alice sends 5 messages to Bob
Action: Direct messages sent
Expected:
  - closenessScore: 80 → 85 (+5 for messages, max +10/month)
  - Each message logs activity: 'message_sent'
```

**Test 6.4: Score Increases - Post Likes**
```typescript
// Bob likes 3 of Alice's posts
Action: Click like on posts
Expected:
  - closenessScore: 85 → 91 (+6 for likes, max +10/month)
  - Activities logged: 'post_liked'
```

**Test 6.5: Score Decreases - No Interaction**
```typescript
// Simulate 30 days of no interaction
Action: Advance system time 30 days
Expected:
  - closenessScore: 91 → 86 (-5 for 30 days)
  - No new activities logged
```

**Test 6.6: Dance Together Bonus**
```typescript
// Alice and Bob log a dance at milonga
Action: Both check-in and mark "danced together"
Expected:
  - closenessScore: 86 → 96 (+10 for dancing)
  - Activity: 'dance_together'
```

---

### Test Suite 7: Remove Friend

**Test 7.1: Unfriend User**
```typescript
// User: Alice removes Bob
Action: Alice clicks "Remove Friend" on Bob
Expected:
  - BOTH friendship records deleted
    - friendships: (Alice → Bob) deleted
    - friendships: (Bob → Alice) deleted
  - Friend request status unchanged (stays 'accepted' for history)
  - Both users' friend count decrements
  - No longer appear in each other's friend lists
  - connectionDegree reverts to calculated (becomes 2nd if mutual friends)
```

---

### Test Suite 8: Friend Suggestions

**Test 8.1: Suggest Based on Mutual Friends**
```typescript
// Alice has friends: Bob, Carol
// Bob has friends: Alice, David
// Expected for Alice: Suggest David (mutual with Bob)
Expected:
  - David appears in Alice's "Suggestions"
  - Shows "1 mutual friend (Bob)"
  - Shows connection path: Alice → Bob → David
```

**Test 8.2: Suggest Based on Location**
```typescript
// Alice is in Buenos Aires
// Carol is in Buenos Aires
// Not friends yet
Expected:
  - Carol appears in Alice's suggestions
  - Reason: "Same city (Buenos Aires)"
```

**Test 8.3: Exclude Already Friends**
```typescript
// Alice already friends with Bob
Expected:
  - Bob NOT in Alice's suggestions
  - Only shows non-friends
```

---

### Test Suite 9: MT Ocean Theme UI

**Test 9.1: Glassmorphic Cards**
```typescript
// Visual verification
Expected:
  - All friend cards have:
    - backdrop-blur-xl effect
    - bg-white/70 dark:bg-slate-900/70
    - border-white/50 dark:border-cyan-500/30
    - Gradient top border (cyan→blue→teal)
  - Hover: gradient glow appears
```

**Test 9.2: Connection Badges**
```typescript
// Visual verification
Expected:
  - 1st degree: bg-gradient from-pink-500 to-rose-500
  - 2nd degree: bg-gradient from-blue-400 to-cyan-400
  - 3rd degree: bg-gradient from-purple-400 to-indigo-400
  - Badges display: "1st", "2nd", "3rd"
```

**Test 9.3: Animated Background**
```typescript
// Visual verification
Expected:
  - Gradient background: cyan-50 → blue-100 → teal-100
  - Three floating orbs animating
  - Grid pattern overlay
```

---

## Mr. Blue Video Generation Tests

### Test Suite 10: Video Studio Page

**Test 10.1: Page Loads**
```typescript
Action: Navigate to /video-studio
Expected:
  - Page loads without errors
  - Three tabs visible: Text-to-Video, Image-to-Video, Quick Actions
  - Forms render correctly
  - API key configured (checked via backend)
```

**Test 10.2: Text-to-Video Generation**
```typescript
Action: 
  1. Click "Text-to-Video" tab
  2. Enter prompt: "Mr. Blue waving hello to camera"
  3. Select aspect ratio: "16:9"
  4. Click "Generate Video"
Expected:
  - API request sent to /api/videos/generate/text
  - Returns generationId
  - Status changes: pending → queued → dreaming
  - Polls every 5 seconds
  - After 2-3 minutes: status → completed
  - Video player appears with URL
  - Download button enabled
```

**Test 10.3: Image-to-Video Generation**
```typescript
Action:
  1. Click "Image-to-Video" tab
  2. Enter image URL: https://example.com/mr-blue.jpg
  3. Enter motion: "gentle nod and smile"
  4. Select aspect ratio: "16:9"
  5. Click "Generate Video"
Expected:
  - API request sent to /api/videos/generate/image
  - Same flow as text-to-video
  - Completed video shows animated image
```

**Test 10.4: Quick Action - Mr. Blue Intro**
```typescript
Action:
  1. Click "Quick Actions" tab
  2. Click "Generate Mr. Blue Introduction"
Expected:
  - Auto-sends pre-configured prompt
  - No form filling required
  - Same generation flow
  - Completes with intro video
```

**Test 10.5: Status Polling**
```typescript
Action: Generate video, observe status updates
Expected:
  - Status checks every 5 seconds
  - UI updates: "Pending" → "Queued" → "Dreaming..." → "Completed!"
  - Progress indicator shows
  - Stops polling when completed or failed
```

**Test 10.6: Download Video**
```typescript
Action: Click "Download Video" when completed
Expected:
  - POST /api/videos/download/:id
  - Video saved to /client/public/videos/mr-blue-{id}.mp4
  - Success toast appears
  - Shows local file path
```

**Test 10.7: Error Handling**
```typescript
Action: Submit invalid request (missing required field)
Expected:
  - Validation error displayed
  - Form doesn't submit
  - Error message clear and helpful
```

---

## Integration Tests

### Test Suite 11: Full Friendship Journey

**Test 11.1: Complete Flow**
```typescript
Scenario: Alice and Bob complete friendship cycle
Steps:
  1. Alice registers → creates account
  2. Bob registers → creates account
  3. Alice searches for Bob → finds profile
  4. Alice sends friend request with dance story
  5. Bob receives request → sees dance story
  6. Bob accepts → friendship created
  7. Both RSVP to event → closeness +5
  8. Alice messages Bob → closeness +1
  9. Bob likes Alice's post → closeness +2
  10. Both view friendship dashboard → score = 83
  11. Both see "1st" badge
  12. Alice views Carol (Bob's friend) → sees "2nd" badge
Expected: All steps complete without errors, UI updates correctly
```

---

## Performance Tests

### Test Suite 12: Load & Performance

**Test 12.1: Large Friend List**
```typescript
Setup: User with 200 friends
Action: Load /friends page
Expected:
  - Page loads in < 2 seconds
  - Pagination works
  - 20 friends per page
  - Search filters correctly
```

**Test 12.2: Connection Degree Calculation**
```typescript
Setup: Complex network (50 users, 200 connections)
Action: Calculate 2nd/3rd degree for user
Expected:
  - Calculation completes in < 500ms
  - Accurate results
  - No duplicate connections
```

---

## Test Execution Order (MB.MD)

### Phase 1: Setup (PARALLEL)
- Create 5 test users (Alice, Bob, Carol, David, Eve)
- Verify database schema migrated
- Verify API endpoints exist

### Phase 2: Basic Flow (SEQUENTIAL)
- Test 1.1 → 1.2 → 1.3 (basic request flow)
- Test 2.1 → 2.2 (dance story)

### Phase 3: Advanced Features (PARALLEL)
- Test 3.x (snooze) + Test 4.x (mutual) + Test 5.x (degrees)

### Phase 4: Algorithms (SEQUENTIAL)
- Test 6.1 → 6.6 (closeness score progression)

### Phase 5: Mr. Blue (PARALLEL)
- All Test 10.x simultaneously

### Phase 6: Integration (CRITICAL)
- Test 11.1 (full journey)
- Test 12.x (performance)

---

## Success Criteria

✅ **All tests pass** (100% pass rate required)  
✅ **No LSP errors** in codebase  
✅ **Database migrated** without data loss  
✅ **MT Ocean Theme** applied consistently  
✅ **Performance** meets targets (< 2s page load, < 500ms calculations)  
✅ **Mr. Blue videos** generate successfully  
✅ **Connection degrees** calculate accurately  
✅ **Closeness scores** update correctly  

---

**Document Status:** Test Plan Complete  
**Next:** Execute MB.MD build simultaneously
