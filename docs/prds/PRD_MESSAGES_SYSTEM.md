# PRD: Messages System (Unified Messaging Platform)

**Version:** 1.0  
**Created:** November 30, 2025  
**Pattern Applied:** MB.MD v9.6 Pattern 28 - Hierarchical Execution  
**Priority:** P0 (Revenue-Critical)  
**Reference:** P0 #12-16: Messages Platform Backend

---

## 1. Overview

### 1.1 Purpose
The Messages System provides a unified messaging platform integrating Mundo Tango internal chat with external communication channels (Gmail, Facebook, Instagram, WhatsApp). It enables users to manage all their communications from a single inbox, with support for templates, automations, and scheduled messaging.

### 1.2 Business Value
- **User Retention:** Single inbox for all tango-related communications
- **Engagement:** Real-time messaging increases platform stickiness
- **Professional Tools:** Templates and automations for organizers/teachers
- **Revenue Potential:** Premium messaging features (automations, bulk messaging)

### 1.3 Key Metrics
- Messages sent per user per day
- Channel connection rate
- Response time average
- Template usage rate

---

## 2. Database Schema

### 2.1 Internal Messaging Tables

#### `chat_rooms`
Chat room/conversation containers.

| Column | Type | Description |
|--------|------|-------------|
| id | serial | Primary key |
| type | varchar | direct, group |
| name | text | Room name (for group chats) |
| createdBy | integer | FK to users.id |
| lastMessageAt | timestamp | Last activity |
| createdAt | timestamp | Creation date |

#### `chat_room_users`
Room participants.

| Column | Type | Description |
|--------|------|-------------|
| id | serial | Primary key |
| chatRoomId | integer | FK to chat_rooms.id |
| userId | integer | FK to users.id |
| lastReadAt | timestamp | Last read position |
| joinedAt | timestamp | Join date |

**Indexes:**
- `chat_room_users_room_idx` on chatRoomId
- `chat_room_users_user_idx` on userId
- `unique_chat_participant` UNIQUE on (chatRoomId, userId)

#### `chat_messages`
Individual messages.

| Column | Type | Description |
|--------|------|-------------|
| id | serial | Primary key |
| chatRoomId | integer | FK to chat_rooms.id |
| userId | integer | FK to users.id (sender) |
| message | text | Message content |
| mediaUrl | text | Attached media |
| mediaType | varchar | Media type |
| readBy | text[] | Array of user IDs who read |
| createdAt | timestamp | Send time |

**Indexes:**
- `chat_messages_room_idx` on chatRoomId
- `chat_messages_user_idx` on userId
- `chat_messages_created_at_idx` on createdAt
- `chat_messages_room_created_idx` on (chatRoomId, createdAt)
- `chat_messages_media_type_idx` on mediaType

### 2.2 External Channel Tables

#### `connected_channels`
External service connections.

| Column | Type | Description |
|--------|------|-------------|
| id | serial | Primary key |
| userId | integer | FK to users.id |
| channel | varchar | gmail, facebook, instagram, whatsapp |
| accessToken | varchar | OAuth access token (encrypted) |
| refreshToken | varchar | OAuth refresh token (encrypted) |
| accountId | varchar | External account ID |
| accountName | varchar | Display name |
| config | jsonb | Channel-specific settings |
| isActive | boolean | Connection status |
| lastSyncAt | timestamp | Last sync time |
| createdAt | timestamp | Connection date |

#### `external_messages`
Messages from external channels.

| Column | Type | Description |
|--------|------|-------------|
| id | serial | Primary key |
| userId | integer | FK to users.id |
| channel | varchar | Source channel |
| externalId | varchar | External message ID |
| from | varchar | Sender |
| to | varchar | Recipient |
| subject | varchar | Subject (email) |
| body | text | Message content |
| threadId | varchar | Thread/conversation ID |
| isRead | boolean | Read status |
| receivedAt | timestamp | Receive time |
| createdAt | timestamp | Sync time |

### 2.3 Automation Tables

#### `message_templates`
Reusable message templates.

| Column | Type | Description |
|--------|------|-------------|
| id | serial | Primary key |
| userId | integer | FK to users.id |
| name | varchar | Template name |
| subject | varchar | Subject template |
| body | text | Body template |
| channels | text[] | Compatible channels |
| variables | jsonb | Template variables |
| isPublic | boolean | Shared template |
| createdAt | timestamp | Creation date |

#### `message_automations`
Automation rules.

| Column | Type | Description |
|--------|------|-------------|
| id | serial | Primary key |
| userId | integer | FK to users.id |
| name | varchar | Automation name |
| channel | varchar | Target channel |
| automationType | varchar | auto-reply, scheduled, routing |
| triggerConditions | jsonb | When to trigger |
| action | jsonb | What action to take |
| templateId | integer | FK to message_templates.id |
| isActive | boolean | Active status |
| createdAt | timestamp | Creation date |

#### `scheduled_messages`
Messages scheduled for future delivery.

| Column | Type | Description |
|--------|------|-------------|
| id | serial | Primary key |
| userId | integer | FK to users.id |
| channel | varchar | Delivery channel |
| to | varchar | Recipient |
| subject | varchar | Subject |
| body | text | Message content |
| scheduledFor | timestamp | Delivery time |
| status | varchar | pending, sent, failed, cancelled |
| createdAt | timestamp | Creation date |

---

## 3. API Endpoints

### 3.1 Channel Management (5 endpoints)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/messages/channels/connect` | Yes | Connect external channel |
| GET | `/api/messages/channels` | Yes | List connected channels |
| DELETE | `/api/messages/channels/:channel` | Yes | Disconnect channel |
| POST | `/api/messages/sync` | Yes | Manual sync from channels |
| GET | `/api/messages/unread-count` | Yes | Get unread message count |

### 3.2 Messaging (2 endpoints)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/messages/unified` | Yes | Unified inbox |
| POST | `/api/messages/send` | Yes | Send message to any channel |
| POST | `/api/messages/schedule` | Yes | Schedule message |

### 3.3 Templates (3 endpoints)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/messages/templates` | Yes | List templates |
| POST | `/api/messages/templates` | Yes | Create template |
| DELETE | `/api/messages/templates/:id` | Yes | Delete template |

### 3.4 Automations (4 endpoints)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/messages/automations` | Yes | List automations |
| POST | `/api/messages/automations` | Yes | Create automation |
| PATCH | `/api/messages/automations/:id` | Yes | Update automation |
| DELETE | `/api/messages/automations/:id` | Yes | Delete automation |

---

## 4. Frontend Pages

### 4.1 Page Inventory

| Page | Path | Purpose |
|------|------|---------|
| MessagesPage | `/messages` | Inbox and conversation list |
| MessagesDetailPage | `/messages/:id` | Conversation view |
| MessagesPrototypePage | `/messages/prototype` | Design prototype |
| MessageThreads | `/messages/threads` | Thread view |

### 4.2 Key UI Components

#### Inbox
```
data-testid="messages-container"
data-testid="conversation-{id}"
data-testid="button-new-message"
data-testid="badge-unread-count"
```

#### Compose
```
data-testid="input-recipient"
data-testid="textarea-message"
data-testid="button-send"
```

#### Conversation
```
data-testid="message-{id}"
data-testid="button-conversation-menu"
data-testid="button-delete-conversation"
data-testid="button-confirm-delete"
```

---

## 5. User Flows

### 5.1 View Inbox Flow
```
1. Navigate to /messages
2. View unified inbox
3. See unread count badge
4. Filter by channel (MT, Gmail, Facebook, etc.)
5. Search messages
6. Click conversation to open
```

### 5.2 Send Message Flow
```
1. Click "New Message"
2. Search/select recipient
3. Type message
4. Optionally attach media
5. Optionally use template
6. Click Send
7. Message delivered (real-time)
```

### 5.3 Connect Channel Flow
```
1. Go to /messages/settings
2. Click "Connect Channel"
3. Select channel (Gmail, Facebook, etc.)
4. Complete OAuth flow
5. Authorize MT access
6. Channel connected
7. Initial sync runs
8. Messages appear in unified inbox
```

### 5.4 Create Automation Flow
```
1. Navigate to /messages/automations
2. Click "New Automation"
3. Select type (auto-reply, scheduled, routing)
4. Configure trigger conditions
5. Select or create template
6. Activate automation
7. Automation runs on matching messages
```

---

## 6. Channel Integrations

### 6.1 Supported Channels

| Channel | Protocol | Features |
|---------|----------|----------|
| MT Internal | WebSocket | Real-time chat, group chats |
| Gmail | OAuth 2.0 + Gmail API | Send/receive emails, threads |
| Facebook | Graph API | Messenger conversations |
| Instagram | Instagram Messaging API | DMs |
| WhatsApp | Business API + Webhooks | Business messaging |

### 6.2 OAuth Flows

**Gmail:**
- OAuth 2.0 with Google API
- Scopes: gmail.readonly, gmail.send, gmail.modify
- Token refresh handling

**Facebook/Instagram:**
- Graph API OAuth
- Page access tokens
- Conversation management

**WhatsApp:**
- Business API credentials
- Webhook setup for incoming messages
- Business phone number verification

---

## 7. Real-time Features

### 7.1 WebSocket Support
- Real-time message delivery for MT internal chat
- Online/offline status
- Typing indicators
- Read receipts

### 7.2 Sync Behavior
- Manual sync trigger via API
- Background sync job (periodic)
- Webhook listeners for external channels
- Last sync timestamp tracking

---

## 8. Automation Types

| Type | Description | Trigger |
|------|-------------|---------|
| auto-reply | Automatic response | Incoming message matches conditions |
| scheduled | Send at specific time | Time-based |
| routing | Forward/route messages | Source/content matching |
| out-of-office | Vacation responder | All incoming during period |

---

## 9. E2E Test Coverage

### 9.1 Test File
`tests/e2e/core-journeys/messages-complete-journey.spec.ts` (38 lines)

### 9.2 Test Cases

| Test | Coverage |
|------|----------|
| View messages inbox | Inbox display |
| Start new conversation | Compose and send |
| Send message in conversation | Reply functionality |
| Delete conversation | Delete with confirmation |

---

## 10. Security Considerations

### 10.1 Token Storage
- Access tokens encrypted at rest
- Refresh tokens encrypted
- Tokens never exposed in API responses

### 10.2 OAuth Best Practices
- Token revocation on disconnect
- Scope minimization
- Regular token refresh

### 10.3 Message Privacy
- Messages belong to user only
- No cross-user message access
- Audit logging for compliance

---

## 11. Performance Requirements

- Inbox load: < 2 seconds
- Message send: < 1 second (real-time)
- Sync operation: < 30 seconds for 100 messages
- WebSocket latency: < 100ms

---

## 12. Cross-System Wirings

| System | Integration Point |
|--------|-------------------|
| Users | Sender/recipient references |
| Notifications | New message alerts |
| Events | Event-related messages |
| Groups | Group chat integration |
| Mr. Blue AI | AI assistant conversations |
| LIFE CEO AI | AI coaching conversations |

---

## 13. Related AI Systems

### 13.1 Mr. Blue Conversations
- `mr_blue_conversations` - AI assistant chat history
- `mr_blue_messages` - Individual AI messages

### 13.2 LIFE CEO Chat
- `life_ceo_conversations` - Coaching sessions
- `life_ceo_chat_messages` - Domain-specific advice

### 13.3 H2AC Messages
- Agent-to-agent communications
- Human-to-agent escalations

---

## 14. Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-11-30 | Initial PRD creation |

---

*Generated by Mr. Blue Agent Squad 1 (PRD Writers)*
*Pattern Applied: MB.MD v9.6 - Hierarchical Execution*
