# Messages Page Design Specification

**Version:** 1.0.0 | **Updated:** December 21, 2025 | **Status:** Active  
**Owner Agent:** MessagesPageAgent | **Invocation:** `use mb.md: pages:messages`

---

## 1. Overview

The Unified Inbox provides a Messenger-style messaging experience, aggregating conversations from multiple channels (Mundo Tango, Gmail, Facebook, Instagram, WhatsApp) into a single interface.

**Component:** `client/src/pages/messages/UnifiedInbox.tsx` (919 lines)

### MB.MD References
- **Agent:** `use mb.md: agents:page` → MessagesPageAgent
- **Operations:** `use mb.md: operations` → 10-step workflow
- **Patterns:** `use mb.md: patterns:core` → Pattern #8 (Communication)

---

## 2. Data Architecture

### 2.1 Messages Table

```sql
messages (
  id: serial PRIMARY KEY,
  senderId: integer REFERENCES users(id),
  receiverId: integer REFERENCES users(id),
  content: text NOT NULL,
  channel: varchar DEFAULT 'mt',
  isRead: boolean DEFAULT false,
  isOutgoing: boolean,
  attachments: jsonb,
  reactions: jsonb,
  threadId: integer,
  createdAt: timestamp,
  readAt: timestamp
)
```

### 2.2 Channel Types

| Channel | Code | Integration |
|---------|------|-------------|
| Mundo Tango | `mt` | Native |
| Gmail | `gmail` | Google API |
| Facebook | `facebook` | Meta API |
| Instagram | `instagram` | Meta API |
| WhatsApp | `whatsapp` | Meta API |

---

## 3. URL Routing

| Pattern | Access | Behavior |
|---------|--------|----------|
| `/messages` | Authenticated | Unified inbox |
| `/messages/inbox` | Authenticated | Alias |
| `/messages/direct` | Authenticated | Direct messages only |
| `/messages/:conversationId` | Authenticated | Specific conversation |

---

## 4. Page Structure

### 4.1 Layout Diagram (3-Column)

```
┌────────────────────────────────────────────────────────────┐
│  CHANNEL BAR                                               │
│  [All] [MT] [Gmail] [FB] [IG] [WA]                        │
├───────────────┬────────────────────────────────────────────┤
│ CONVERSATION  │  MESSAGE THREAD                            │
│ LIST          │  ┌──────────────────────────────────────┐ │
│ ┌───────────┐ │  │  [Avatar] Sender Name                │ │
│ │ User 1    │ │  │  Message content here...             │ │
│ │ Preview.. │ │  │  10:30 AM ✓✓                         │ │
│ ├───────────┤ │  ├──────────────────────────────────────┤ │
│ │ User 2    │ │  │  [Avatar] You                        │ │
│ │ Preview.. │ │  │  Your reply message...               │ │
│ └───────────┘ │  │  10:32 AM ✓✓                         │ │
│               │  └──────────────────────────────────────┘ │
│  [+ Compose]  │  ┌──────────────────────────────────────┐ │
│               │  │ [📷] [Type message...] [Send →]      │ │
│               │  └──────────────────────────────────────┘ │
└───────────────┴────────────────────────────────────────────┘
```

---

## 5. Component Specifications

### 5.1 Channel Filter Bar

| Channel | Color | Icon |
|---------|-------|------|
| All | Primary | MessageCircle |
| Mundo Tango | Primary | Logo |
| Gmail | #EA4335 | Mail |
| Facebook | #1877F2 | SiFacebook |
| Instagram | #E4405F | SiInstagram |
| WhatsApp | #25D366 | SiWhatsapp |

### 5.2 Conversation List

| Element | Content | Styling |
|---------|---------|---------|
| Avatar | User photo | 40x40 rounded |
| Name | Display name | font-medium |
| Preview | Last message | text-muted truncate |
| Time | Relative time | text-xs |
| Unread badge | Count | Badge variant |
| Pin indicator | Pin icon | If pinned |

### 5.3 Message Bubbles

| Type | Styling | Position |
|------|---------|----------|
| Incoming | bg-muted | Left aligned |
| Outgoing | bg-primary text-primary-foreground | Right aligned |
| With gradient | from-blue-500 to-blue-600 | Right aligned |

### 5.4 Reactions

| Reaction | Icon | Color |
|----------|------|-------|
| Love | Heart | #EF4444 |
| Passion | Flame | #F97316 |
| Joy | Smile | #FBBF24 |
| Wow | Eye | #3B82F6 |
| Music | Music | #A855F7 |
| Inspiration | Lightbulb | #10B981 |

---

## 6. Interactive Elements

### 6.1 Compose Modal

```typescript
<ComposeMessage
  isOpen={showCompose}
  onClose={() => setShowCompose(false)}
  onSend={handleSend}
/>
```

### 6.2 Image Uploader

```typescript
<ImageGalleryUploader
  images={attachedImages}
  onImagesChange={setAttachedImages}
  maxImages={10}
/>
```

### 6.3 Reaction Selector

```typescript
<ReactionSelector
  reactions={REACTION_TYPES}
  onSelect={handleReaction}
  messageId={message.id}
/>
```

---

## 7. API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/messages/unified` | GET | All messages, filterable |
| `/api/messages/channels` | GET | Connected channels |
| `/api/messages/:id` | GET | Single conversation |
| `/api/messages/send` | POST | Send new message |
| `/api/messages/:id/read` | PUT | Mark as read |
| `/api/messages/:id/react` | POST | Add reaction |

---

## 8. Real-Time Features

### 8.1 Polling

```typescript
const { data: messages } = useQuery({
  queryKey: ["/api/messages/unified", filters],
  refetchInterval: 30000, // 30 second polling
});
```

### 8.2 Optimistic Updates

| Action | Behavior |
|--------|----------|
| Send message | Immediately show in thread |
| Mark read | Immediately update badge |
| Add reaction | Immediately show reaction |

---

## 9. Permissions Matrix

| Action | Member | Admin |
|--------|--------|-------|
| View inbox | Yes | Yes |
| Send message | Yes | Yes |
| Connect Gmail | Yes | Yes |
| Connect Facebook | Yes | Yes |
| Delete conversation | Yes | Yes |
| View all users' messages | No | Yes |

---

## 10. Mobile Responsiveness

| Breakpoint | Layout |
|------------|--------|
| < 640px | Single column, slide panels |
| 640-1024px | Two columns |
| > 1024px | Three columns |

### Mobile Navigation

| State | View |
|-------|------|
| Default | Conversation list |
| Selected | Message thread (full screen) |
| Back | Return to list |

---

## 11. Internationalization

- Message timestamps localized
- Channel labels translated
- UI strings via i18next
- RTL support for Arabic/Hebrew

---

## 12. Analytics Tracking

| Event | Trigger | Data |
|-------|---------|------|
| `inbox_view` | Page load | channel_filter |
| `message_sent` | Send click | channel, has_media |
| `message_read` | Conversation opened | conversation_id |
| `channel_switch` | Filter change | from_channel, to_channel |

---

## 13. Related Pages

| Page | Relationship |
|------|--------------|
| `/profile/:id` | Message from profile |
| `/groups/:id` | Group chat link |
| `/settings/integrations` | Channel connections |

---

## 14. Component Files

| File | Purpose |
|------|---------|
| `client/src/pages/messages/UnifiedInbox.tsx` | Main inbox |
| `client/src/pages/messages/DirectMessages.tsx` | MT-only messages |
| `client/src/components/messages/ComposeMessage.tsx` | New message modal |
| `client/src/components/ui/ReactionSelector.tsx` | Reaction picker |
| `client/src/components/feed/ImageGalleryUploader.tsx` | Image attachments |

---

## 15. Test Scenarios

### 15.1 E2E Tests

```
1. [New Context] Create browser context
2. [Browser] Login as admin@mundotango.life
3. [Browser] Navigate to /messages
4. [Verify] Assert conversation list visible
5. [Browser] Click first conversation
6. [Verify] Assert message thread loads
7. [Browser] Type "Test message" in input
8. [Browser] Click send button
9. [Verify] Assert message appears in thread
```

### 15.2 Channel Filter Test

```
1. [Browser] Navigate to /messages
2. [Browser] Click "Gmail" channel filter
3. [Verify] Assert only Gmail messages shown
4. [Browser] Click "All" filter
5. [Verify] Assert all messages shown
```

---

## 16. Performance

| Metric | Target | Optimization |
|--------|--------|--------------|
| Initial load | < 1s | Paginated messages |
| Send message | < 200ms | Optimistic updates |
| Switch conversation | < 300ms | Cached messages |

---

## 17. Future Enhancements

| Priority | Enhancement | Status |
|----------|-------------|--------|
| P1 | WebSocket real-time | Planned |
| P1 | Read receipts | Active |
| P2 | Voice messages | Planned |
| P2 | Video messages | Backlog |
| P3 | Message scheduling | Backlog |

---

*Every message. Every channel. One inbox.*
