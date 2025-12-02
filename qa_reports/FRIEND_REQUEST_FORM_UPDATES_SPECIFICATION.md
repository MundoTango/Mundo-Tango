# Friend Request Form Updates Specification
## Detailed Requirements for Form Enhancement

**Date:** December 1, 2025  
**Status:** Ready for Implementation  
**Priority:** HIGH - Core Feature Enhancement  

---

## Current Form State vs. Target State

### CURRENT Implementation
```
✓ Modal opens with "Send Friend Request" title
✓ Personal Message field (required)
✓ "We danced together" checkbox (YES/NO)
✓ Conditional fields (dance location + memory)
✓ Media upload placeholder
✗ NO private note field
✗ NO "we've met" context selector
✗ Location picker NOT connected to database
✗ Media upload NOT using unified design
```

### TARGET Implementation
```
✓ REQUIRED: "How have we met?" selector (4 options)
✓ REQUIRED: Message textarea (personal story)
✓ REQUIRED: "Where did we meet?" picker (pulls from DB)
✓ OPTIONAL: Media uploads (unified design)
✓ OPTIONAL: Private note (requester-only memory)
✗ REMOVE: "We danced together" checkbox
```

---

## Field-by-Field Updates

### 1. "How Have We Met?" Context Selector
**Replaces:** "We danced together" checkbox  
**Type:** Radio button group / Button group  
**Options:**
- 📅 **At a tango event** → value: `'event'`
- 👥 **Through a community group** → value: `'group'`
- 📍 **Same city/location** → value: `'location'`
- 🔗 **Other connection** → value: `'other'`

**Styling:**
- Display as 2x2 button grid on desktop
- Highlight selected option with cyan border & background
- Non-selected: gray border, hover effect

**Conditional Logic:**
- When value is `'event'`, `'group'`, or `'location'` → Show "Where did we meet?" field
- When value is `'other'` → Hide location field

---

### 2. "Where Did We Meet?" Location Picker
**Type:** Input with autocomplete / Dropdown  
**Visibility:** Conditional (only when context != 'other')  
**Required:** YES (if visible)  
**Placeholder:** "Search events, groups, or cities..."  

**Data Sources (Priority Order):**
1. Events database → pull from `/api/events` or event index
2. City groups database → pull from `/api/groups` or groups index
3. Cities/Locations database → pull from locations index

**Implementation Notes:**
- Use existing unified location picker component if available
- If not, create queryable input that searches across all three data sources
- Return: `{ locationId, name, type: 'event'|'group'|'city' }`
- Show helper text: "Pulling from events database, groups, and location data"

---

### 3. "Tell Them Why You're Connecting" Message
**Type:** Textarea  
**Required:** YES  
**Min Length:** 1 character  
**Max Length:** 1000 characters (enforced in UI + backend)  
**Placeholder:** "Share a little story or reason why you'd like to connect..."  
**Current Status:** ✓ EXISTS (working correctly)  

**No Changes Needed** - This field is already implemented correctly.

---

### 4. "Add Photos/Videos" Media Upload
**Type:** File upload area (drag & drop + click)  
**Required:** NO (optional)  
**Max Files:** 10  
**Max Size per File:** 10MB  
**Accepted Types:** `.jpg, .jpeg, .png, .gif, .mp4, .mov`  

**Design Requirements:**
- Use **unified media upload component** (must match platform standards)
- Dashed border box with upload icon
- Text: "Click to upload media from that event"
- Subtext: "Max 10 files, 10MB each (using unified media design)"
- Show file count while uploading
- Handle drag & drop files

**Current Status:** ⚠️ Placeholder exists but needs real implementation

---

### 5. "🔒 Personal Reminder About This Person" Private Note
**Type:** Textarea  
**Required:** NO (optional)  
**Min Length:** 0 characters  
**Max Length:** 500 characters  
**Visibility:** **SENDER ONLY** - NEVER sent to recipient  
**Placeholder:** "Private note (only you can see) - helps you remember who this person is"  
**Label:** "🔒 Personal reminder about this person" (include lock emoji)
**Helper Text:** "This note is NEVER shared with the recipient"

**NEW FIELD - Must Add**

**Database Schema:**
```typescript
interface FriendRequest {
  recipientUserId: string;
  senderUserId: string;
  // Visible to recipient:
  howWeMetContext: 'event' | 'group' | 'location' | 'other';
  whereWeMetId?: string; // reference to event/group/location
  personalMessage: string;
  mediaIds?: string[];
  // PRIVATE - Visible to sender ONLY:
  senderPrivateNote: string; // NEW FIELD
  // Metadata:
  createdAt: Date;
  status: 'pending' | 'accepted' | 'rejected';
}
```

**API Requirement:**
- When fetching friend requests for sender → INCLUDE `senderPrivateNote`
- When fetching friend requests for recipient → EXCLUDE `senderPrivateNote`
- Backend MUST filter this field based on user context

---

## Form Submission Flow

### Before Submit - Validation
1. ✓ "How have we met?" - Must be selected (not null)
2. ✓ "Where did we meet?" - Required if context != 'other'
3. ✓ "Tell them why" - Message required, min 1 char
4. ? Media - Optional, if provided validate file sizes
5. ? Private note - Optional, no validation needed

### Submit Handler
```typescript
const handleSubmit = async (formData) => {
  const payload = {
    recipientUserId,
    howWeMetContext: formData.context,
    whereWeMetId: formData.locationId, // null if context == 'other'
    personalMessage: formData.message.trim(),
    mediaIds: formData.uploadedMediaIds || [],
    senderPrivateNote: formData.privateNote.trim() || '',
  };
  
  // POST to /api/friends/requests
  const response = await fetch('/api/friends/requests', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  
  if (response.ok) {
    toast('✨ Friend request sent!');
    onClose();
  }
};
```

---

## UI Layout (Desktop)
```
┌──────────────────────────────────────┐
│  Connect with Barcelona Tester       │
├──────────────────────────────────────┤
│                                      │
│  How have we met? *                  │
│  ┌─────────────────┬─────────────────┐│
│  │ 📅 At a tango   │ 👥 Community  ││
│  │ event           │ group          ││
│  ├─────────────────┼─────────────────┤│
│  │ 📍 Same city    │ 🔗 Other       ││
│  │ location        │ connection     ││
│  └─────────────────┴─────────────────┘│
│                                      │
│  Where did we meet? *                │
│  [Search events, groups, cities...] │
│  Pulling from events database...   │
│                                      │
│  Tell them why you're connecting * │
│  [Write message here...]           │
│  [████████] 45/1000 chars          │
│                                      │
│  Add photos/videos (optional)        │
│  [📸 Click to upload]              │
│  Max 10 files, 10MB each           │
│                                      │
│  🔒 Personal reminder about person  │
│  [Write private note...]           │
│  [████] 12/500 chars              │
│  This note is NEVER shared       │
│                                      │
│  [Cancel]  [✨ Send Request]        │
└──────────────────────────────────────┘
```

---

## Files to Modify

1. **client/src/components/FriendRequestModal.tsx** (or similar)
   - Update form fields
   - Add new state for private note
   - Update styling

2. **server/routes/friends-routes.ts**
   - Update POST `/api/friends/requests` to accept new fields
   - Add validation for whereWeMetId based on context
   - Store `senderPrivateNote` in database
   - Filter response: exclude `senderPrivateNote` for recipients

3. **Database schema** (Drizzle migration if needed)
   - Add `senderPrivateNote: string` column to friend_requests table
   - Make it nullable or default empty string
   - Index: none needed (only sender can query)

4. **Frontend API hooks** (useQuery/useMutation)
   - Update mutation to include new fields
   - Update query selector to handle private note

---

## Testing Checklist

- [ ] Context selector displays all 4 options
- [ ] Selecting context updates UI
- [ ] Location picker shows/hides based on context
- [ ] Location picker returns correct data
- [ ] Message field accepts 1000+ characters
- [ ] Private note field accepts 500+ characters
- [ ] Media upload handles 10 files
- [ ] Submit button disabled until message filled
- [ ] Submit creates friend request
- [ ] Sender sees private note
- [ ] Recipient doesn't see private note
- [ ] Toast notification shows on success
- [ ] Form clears after successful submit
- [ ] Modal closes after successful submit

---

## Notes

- The "We danced together" checkbox is REMOVED entirely
- All users (not just dancers) can now use the form
- Private notes provide CRM-like functionality for users to track why they want to connect
- Location picker integration is critical for mapping events/groups to specific locations
- Media upload must use unified design for consistency
