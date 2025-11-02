# Messaging API Documentation

## Overview
Real-time messaging system for private conversations and group chats. Supports WebSocket notifications, read receipts, typing indicators, and message reactions.

**Base URL:** `/api/messages`

**Authentication:** JWT Bearer token required for all endpoints

**Rate Limits:**
- Send Message: 60 requests/minute
- Create Conversation: 20 requests/hour
- Mark as Read: 100 requests/minute
- Other: 60 requests/minute

**WebSocket URL:** `wss://api.mundotango.com/ws/notifications`

---

## Table of Contents
1. [Conversation Management](#conversation-management)
2. [Message Operations](#message-operations)
3. [Real-Time Features](#real-time-features)
4. [Read Receipts](#read-receipts)
5. [Message Reactions](#message-reactions)
6. [WebSocket Integration](#websocket-integration)

---

## Conversation Management

### Get User Conversations
```
GET /api/messages/conversations
```

Get all conversations for the authenticated user with unread counts.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
[
  {
    "id": 42,
    "type": "direct",
    "participant": {
      "id": 456,
      "name": "Maria Rodriguez",
      "username": "maria_tango",
      "profileImage": "https://...",
      "isOnline": true
    },
    "lastMessage": {
      "id": 789,
      "userId": 456,
      "message": "See you at the milonga tonight!",
      "createdAt": "2025-11-02T14:30:00.000Z"
    },
    "lastMessageAt": "2025-11-02T14:30:00.000Z",
    "lastReadAt": "2025-11-02T14:00:00.000Z",
    "unreadCount": 3,
    "createdAt": "2025-10-15T10:00:00.000Z"
  },
  {
    "id": 43,
    "type": "group",
    "name": "Buenos Aires Tango Dancers",
    "avatar": "https://...",
    "participantCount": 12,
    "lastMessage": {
      "id": 790,
      "userId": 457,
      "user": {
        "name": "Carlos Martinez"
      },
      "message": "Who's going to the workshop tomorrow?",
      "createdAt": "2025-11-02T13:15:00.000Z"
    },
    "unreadCount": 7,
    "createdAt": "2025-10-20T11:00:00.000Z"
  }
]
```

**Conversation Types:**
- `direct` - 1-on-1 private conversation
- `group` - Multi-user group chat

**cURL Example:**
```bash
curl -X GET https://api.mundotango.com/api/messages/conversations \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**TypeScript Example:**
```typescript
import { useQuery } from '@tanstack/react-query';

const useConversations = () => {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: () => 
      fetch('/api/messages/conversations', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      }).then(r => r.json()),
  });
};
```

---

### Create Direct Conversation
```
POST /api/messages/conversations
```

Create a new direct conversation or retrieve existing one.

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "userId": 456
}
```

**Response (201 Created):**
```json
{
  "id": 42,
  "type": "direct",
  "participant": {
    "id": 456,
    "name": "Maria Rodriguez",
    "username": "maria_tango",
    "profileImage": "https://..."
  },
  "createdAt": "2025-11-02T10:00:00.000Z"
}
```

**Auto-Deduplication:**
If a direct conversation already exists between the two users, the existing conversation is returned instead of creating a duplicate.

**Error Responses:**
- `400 Bad Request` - userId is required
- `401 Unauthorized` - Missing/invalid token
- `404 Not Found` - User doesn't exist
- `500 Internal Server Error`

---

### Create Group Conversation
```
POST /api/messages/groups
```

Create a new group chat.

**Request Body:**
```json
{
  "name": "Buenos Aires Tango Dancers",
  "avatar": "https://example.com/groups/avatar.jpg",
  "participantIds": [123, 456, 789]
}
```

**Response (201 Created):**
```json
{
  "id": 43,
  "type": "group",
  "name": "Buenos Aires Tango Dancers",
  "avatar": "https://example.com/groups/avatar.jpg",
  "participants": [
    {
      "id": 123,
      "name": "John Doe",
      "role": "admin"
    },
    {
      "id": 456,
      "name": "Maria Rodriguez",
      "role": "member"
    },
    {
      "id": 789,
      "name": "Carlos Martinez",
      "role": "member"
    }
  ],
  "createdAt": "2025-11-02T10:00:00.000Z"
}
```

**Participant Roles:**
- `admin` - Can manage group settings and members
- `member` - Regular participant

**Error Responses:**
- `400 Bad Request` - Invalid participant IDs or missing name
- `401 Unauthorized` - Missing/invalid token
- `500 Internal Server Error`

---

## Message Operations

### Get Conversation Messages
```
GET /api/messages/conversations/:id
```

Get messages for a specific conversation with pagination.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `limit` (optional): Messages per page (default: 50, max: 100)
- `offset` (optional): Pagination offset (default: 0)
- `before` (optional): Get messages before this message ID (cursor pagination)

**Response (200 OK):**
```json
[
  {
    "id": 789,
    "chatRoomId": 42,
    "userId": 456,
    "user": {
      "id": 456,
      "name": "Maria Rodriguez",
      "username": "maria_tango",
      "profileImage": "https://..."
    },
    "message": "See you at the milonga tonight!",
    "mediaUrl": null,
    "mediaType": null,
    "readBy": [123, 456],
    "reactions": [
      {
        "emoji": "❤️",
        "count": 2,
        "users": [123, 789]
      }
    ],
    "createdAt": "2025-11-02T14:30:00.000Z"
  },
  {
    "id": 788,
    "chatRoomId": 42,
    "userId": 123,
    "user": {
      "id": 123,
      "name": "John Doe",
      "profileImage": "https://..."
    },
    "message": "Looking forward to it! What time are you planning to arrive?",
    "readBy": [123, 456],
    "createdAt": "2025-11-02T14:15:00.000Z"
  }
]
```

**Cursor-Based Pagination:**
For real-time chat, use `before` parameter with the oldest message ID to load earlier messages:
```
GET /api/messages/conversations/42?before=788&limit=50
```

**Error Responses:**
- `401 Unauthorized` - Missing/invalid token
- `403 Forbidden` - User not a conversation participant
- `404 Not Found` - Conversation doesn't exist
- `500 Internal Server Error`

---

### Send Message
```
POST /api/messages/conversations/:id/messages
```

Send a message to a conversation.

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "message": "See you at the milonga tonight!",
  "mediaUrl": null,
  "mediaType": null
}
```

**Message with Media:**
```json
{
  "message": "Check out this video from last night's milonga!",
  "mediaUrl": "https://storage.example.com/videos/milonga-123.mp4",
  "mediaType": "video"
}
```

**Media Types:**
- `image` - Photo attachment
- `video` - Video attachment
- `file` - Document/file attachment

**Response (201 Created):**
```json
{
  "id": 789,
  "chatRoomId": 42,
  "userId": 123,
  "message": "See you at the milonga tonight!",
  "mediaUrl": null,
  "mediaType": null,
  "readBy": [123],
  "createdAt": "2025-11-02T14:30:00.000Z"
}
```

**Real-Time Delivery:**
When a message is sent, all conversation participants receive a WebSocket notification:
```json
{
  "type": "new_message",
  "chatRoomId": 42,
  "message": {
    "id": 789,
    "userId": 123,
    "message": "See you at the milonga tonight!",
    "createdAt": "2025-11-02T14:30:00.000Z"
  }
}
```

**Error Responses:**
- `400 Bad Request` - Empty message
- `401 Unauthorized` - Missing/invalid token
- `403 Forbidden` - User not a conversation participant
- `404 Not Found` - Conversation doesn't exist
- `413 Payload Too Large` - Media file exceeds 50MB limit
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error`

**cURL Example:**
```bash
curl -X POST https://api.mundotango.com/api/messages/conversations/42/messages \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{"message": "See you at the milonga tonight!"}'
```

---

## Read Receipts

### Mark Conversation as Read
```
PUT /api/messages/conversations/:id/read
```

Mark all messages in a conversation as read.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (204 No Content)**

**Read Receipt Behavior:**
- Updates `lastReadAt` timestamp for the user
- Reduces unread count to 0 for this conversation
- Broadcasts read receipt to other participants via WebSocket

**WebSocket Notification:**
```json
{
  "type": "message_read",
  "chatRoomId": 42,
  "userId": 123,
  "readAt": "2025-11-02T14:35:00.000Z"
}
```

**Error Responses:**
- `401 Unauthorized` - Missing/invalid token
- `403 Forbidden` - User not a conversation participant
- `404 Not Found` - Conversation doesn't exist
- `500 Internal Server Error`

---

## Message Reactions

### Add Reaction
```
POST /api/messages/:messageId/reaction
```

Add an emoji reaction to a message.

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "emoji": "❤️"
}
```

**Supported Emojis:**
Common reactions: ❤️ 👍 😂 😮 😢 🔥 🎉 👏

**Response (200 OK):**
```json
{
  "messageId": 789,
  "reactions": [
    {
      "emoji": "❤️",
      "count": 3,
      "users": [123, 456, 789],
      "reacted": true
    },
    {
      "emoji": "👍",
      "count": 1,
      "users": [456],
      "reacted": false
    }
  ]
}
```

**Toggle Behavior:**
- If user hasn't reacted with this emoji: Add reaction
- If user already reacted with this emoji: Remove reaction

**Error Responses:**
- `400 Bad Request` - Invalid emoji
- `401 Unauthorized` - Missing/invalid token
- `404 Not Found` - Message doesn't exist
- `500 Internal Server Error`

---

### Remove Reaction
```
DELETE /api/messages/:messageId/reaction/:emoji
```

Remove a reaction from a message.

**Response (204 No Content)**

---

## WebSocket Integration

### Connection Setup

**Connect to WebSocket:**
```javascript
const ws = new WebSocket('wss://api.mundotango.com/ws/notifications?userId=123');

ws.onopen = () => {
  console.log('WebSocket connected');
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  handleWebSocketEvent(data);
};

ws.onerror = (error) => {
  console.error('WebSocket error:', error);
};
```

**Event Types:**
- `connected` - Connection established
- `new_message` - New message received
- `message_read` - Messages marked as read
- `typing` - Typing indicator update
- `reaction_added` - Reaction added to message

---

### Typing Indicators

**Broadcast Typing Start:**
```javascript
ws.send(JSON.stringify({
  type: 'typing_start',
  chatRoomId: 42
}));
```

**Broadcast Typing Stop:**
```javascript
ws.send(JSON.stringify({
  type: 'typing_stop',
  chatRoomId: 42
}));
```

**Receive Typing Updates:**
```json
{
  "type": "typing",
  "chatRoomId": 42,
  "userId": 456,
  "username": "maria_tango",
  "typing": true
}
```

**TypeScript Example:**
```typescript
import { useEffect, useState } from 'react';

const useTypingIndicator = (chatRoomId: number) => {
  const [typingUsers, setTypingUsers] = useState<number[]>([]);

  useEffect(() => {
    const ws = new WebSocket(`wss://api.mundotango.com/ws/notifications?userId=${userId}`);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'typing' && data.chatRoomId === chatRoomId) {
        if (data.typing) {
          setTypingUsers(prev => [...prev, data.userId]);
        } else {
          setTypingUsers(prev => prev.filter(id => id !== data.userId));
        }
      }
    };

    return () => ws.close();
  }, [chatRoomId]);

  const broadcastTyping = (isTyping: boolean) => {
    ws.send(JSON.stringify({
      type: isTyping ? 'typing_start' : 'typing_stop',
      chatRoomId
    }));
  };

  return { typingUsers, broadcastTyping };
};
```

---

## Database Schema

**Chat Rooms Table:**
```sql
CREATE TABLE chat_rooms (
  id SERIAL PRIMARY KEY,
  type VARCHAR DEFAULT 'direct' NOT NULL,  -- 'direct' | 'group'
  name TEXT,
  avatar TEXT,
  last_message_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Chat Room Users (Participants):**
```sql
CREATE TABLE chat_room_users (
  id SERIAL PRIMARY KEY,
  chat_room_id INTEGER NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  last_read_at TIMESTAMP,
  joined_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(chat_room_id, user_id)
);

CREATE INDEX chat_room_users_room_idx ON chat_room_users(chat_room_id);
CREATE INDEX chat_room_users_user_idx ON chat_room_users(user_id);
```

**Chat Messages:**
```sql
CREATE TABLE chat_messages (
  id SERIAL PRIMARY KEY,
  chat_room_id INTEGER NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  media_url TEXT,
  media_type VARCHAR,
  read_by TEXT[],
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX chat_messages_room_idx ON chat_messages(chat_room_id);
CREATE INDEX chat_messages_created_at_idx ON chat_messages(created_at);
```

**Message Reactions:**
```sql
CREATE TABLE message_reactions (
  id SERIAL PRIMARY KEY,
  message_id INTEGER NOT NULL REFERENCES chat_messages(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  emoji VARCHAR NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(message_id, user_id, emoji)
);

CREATE INDEX message_reactions_message_idx ON message_reactions(message_id);
```

---

## H2AC Handoff Notes

### 🔧 Manual Configuration Required
- **WebSocket Server**: Configure WebSocket server with proper CORS
- **Media Storage**: Set up S3/Cloudinary for message attachments
- **Push Notifications**: Configure Firebase/APNS for mobile notifications
- **Message Encryption**: Optional end-to-end encryption

### ✅ Auto-Configured Features
- Direct messaging (1-on-1)
- Group chat creation
- Real-time message delivery via WebSockets
- Read receipts
- Typing indicators
- Message reactions
- Unread message counts

### 🧪 Testing Recommendations
1. Create direct conversations between users
2. Test real-time message delivery
3. Verify typing indicators work correctly
4. Test read receipts update properly
5. Verify message reactions (add/remove)
6. Test group chat with 3+ participants
7. Verify unread counts update correctly

### 📊 Key Metrics to Track
- Messages sent per user
- Average response time
- Conversation creation rate
- Group chat participation
- Message delivery success rate
- WebSocket connection uptime

### 🔒 Security Notes
- Rate limit message sends to prevent spam
- Validate user is conversation participant before allowing access
- Sanitize message content to prevent XSS attacks
- WebSocket connections require authentication
- Consider message retention policies (90-day deletion)
