# Messaging Tables Documentation

## Overview
The messaging system provides real-time direct messaging, group chats, message reactions, and read receipts. This document covers 10+ tables powering the communication infrastructure.

## Table of Contents
- [Core Messaging Tables](#core-messaging-tables)
- [Real-Time Features](#real-time-features)
- [Notifications](#notifications)
- [Schemas & Types](#schemas--types)
- [H2AC Handoff Notes](#h2ac-handoff-notes)

---

## Core Messaging Tables

### 1. `chat_rooms`
Conversation containers (direct or group).

**Schema:**
```sql
CREATE TABLE chat_rooms (
  id SERIAL PRIMARY KEY,
  type VARCHAR DEFAULT 'direct' NOT NULL,  -- 'direct' | 'group'
  name TEXT,                               -- Group name (null for direct chats)
  avatar TEXT,                             -- Group avatar (null for direct chats)
  last_message_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Chat Room Types:**
```typescript
enum ChatRoomType {
  DIRECT = 'direct',    // 1-on-1 conversation
  GROUP = 'group'       // Multi-user group chat
}
```

**Direct Chat Creation:**
```typescript
// Create or get existing direct chat between two users
POST /api/messages/conversations
{
  participantId: 456  // User to chat with
}

// Backend logic
const createOrGetDirectChat = async (userId1: number, userId2: number) => {
  // Check if chat already exists
  const existing = await db.query.chatRooms.findFirst({
    where: and(
      eq(chatRooms.type, 'direct'),
      exists(
        db.select()
          .from(chatRoomUsers)
          .where(and(
            eq(chatRoomUsers.chatRoomId, chatRooms.id),
            eq(chatRoomUsers.userId, userId1)
          ))
      ),
      exists(
        db.select()
          .from(chatRoomUsers)
          .where(and(
            eq(chatRoomUsers.chatRoomId, chatRooms.id),
            eq(chatRoomUsers.userId, userId2)
          ))
      )
    )
  });
  
  if (existing) return existing;
  
  // Create new chat
  const chatRoom = await db.transaction(async (tx) => {
    const [room] = await tx.insert(chatRooms).values({
      type: 'direct'
    }).returning();
    
    // Add both participants
    await tx.insert(chatRoomUsers).values([
      { chatRoomId: room.id, userId: userId1 },
      { chatRoomId: room.id, userId: userId2 }
    ]);
    
    return room;
  });
  
  return chatRoom;
};
```

**Group Chat Creation:**
```typescript
POST /api/messages/groups
{
  name: "Tango Study Group",
  avatar: "https://...",
  participantIds: [123, 456, 789]
}

// Response
{
  id: 42,
  type: "group",
  name: "Tango Study Group",
  avatar: "https://...",
  participants: [
    { id: 123, name: "John Doe", role: "admin" },
    { id: 456, name: "Jane Smith", role: "member" }
  ],
  createdAt: "2025-11-02T10:00:00Z"
}
```

---

### 2. `chat_room_users`
Links users to chat rooms (participants).

**Schema:**
```sql
CREATE TABLE chat_room_users (
  id SERIAL PRIMARY KEY,
  chat_room_id INTEGER NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  last_read_at TIMESTAMP,
  joined_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(chat_room_id, user_id)
);

-- Indexes
CREATE INDEX chat_room_users_room_idx ON chat_room_users(chat_room_id);
CREATE INDEX chat_room_users_user_idx ON chat_room_users(user_id);
CREATE UNIQUE INDEX unique_chat_participant ON chat_room_users(chat_room_id, user_id);
```

**Get User's Conversations:**
```typescript
GET /api/messages/conversations

// SQL
SELECT cr.*,
  cru.last_read_at,
  cm.message as last_message,
  cm.created_at as last_message_at,
  COUNT(CASE WHEN cm.created_at > cru.last_read_at THEN 1 END) as unread_count
FROM chat_rooms cr
JOIN chat_room_users cru ON cru.chat_room_id = cr.id
LEFT JOIN chat_messages cm ON cm.chat_room_id = cr.id
WHERE cru.user_id = $1
GROUP BY cr.id, cru.last_read_at, cm.message, cm.created_at
ORDER BY cr.last_message_at DESC;

// Response
{
  conversations: [
    {
      id: 42,
      type: "direct",
      participant: {
        id: 456,
        name: "Jane Smith",
        profileImage: "..."
      },
      lastMessage: "See you at the milonga tonight!",
      lastMessageAt: "2025-11-02T14:30:00Z",
      unreadCount: 3
    }
  ]
}
```

---

### 3. `chat_messages`
Individual messages within chat rooms.

**Schema:**
```sql
CREATE TABLE chat_messages (
  id SERIAL PRIMARY KEY,
  chat_room_id INTEGER NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Message content
  message TEXT NOT NULL,
  
  -- Media attachments
  media_url TEXT,
  media_type VARCHAR,  -- 'image' | 'video' | 'file'
  
  -- Read receipts
  read_by TEXT[],  -- Array of user IDs who read the message
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX chat_messages_room_idx ON chat_messages(chat_room_id);
CREATE INDEX chat_messages_user_idx ON chat_messages(user_id);
CREATE INDEX chat_messages_created_at_idx ON chat_messages(created_at);
```

**Send Message:**
```typescript
POST /api/messages/conversations/:id/messages
{
  message: "See you at the milonga tonight!",
  mediaUrl: null  // Optional
}

// Backend
const sendMessage = async (chatRoomId: number, userId: number, content: string) => {
  // Create message
  const [message] = await db.insert(chatMessages).values({
    chatRoomId,
    userId,
    message: content,
    readBy: [userId]  // Sender auto-reads their own message
  }).returning();
  
  // Update chat room last_message_at
  await db.update(chatRooms)
    .set({ lastMessageAt: new Date() })
    .where(eq(chatRooms.id, chatRoomId));
  
  // Send WebSocket event to all participants
  const participants = await db.query.chatRoomUsers.findMany({
    where: eq(chatRoomUsers.chatRoomId, chatRoomId)
  });
  
  participants.forEach(participant => {
    if (participant.userId !== userId) {
      sendWebSocketEvent(participant.userId, {
        type: 'new_message',
        chatRoomId,
        message
      });
    }
  });
  
  return message;
};
```

**Get Conversation Messages:**
```typescript
GET /api/messages/conversations/:id?limit=50&before=123

// Pagination with cursor
SELECT cm.*,
  u.name as sender_name,
  u.profile_image as sender_image
FROM chat_messages cm
JOIN users u ON u.id = cm.user_id
WHERE cm.chat_room_id = $1
  AND cm.id < $2  -- Cursor-based pagination
ORDER BY cm.created_at DESC
LIMIT $3;
```

---

### 4. `message_reactions`
Emoji reactions to messages.

**Schema:**
```sql
CREATE TABLE message_reactions (
  id SERIAL PRIMARY KEY,
  message_id INTEGER NOT NULL REFERENCES chat_messages(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  emoji VARCHAR NOT NULL,  -- '❤️' | '👍' | '😂' | etc.
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  
  UNIQUE(message_id, user_id, emoji)
);

-- Indexes
CREATE INDEX message_reactions_message_idx ON message_reactions(message_id);
CREATE INDEX message_reactions_user_idx ON message_reactions(user_id);
CREATE UNIQUE INDEX unique_message_reaction ON message_reactions(message_id, user_id, emoji);
```

**Add Reaction:**
```typescript
POST /api/messages/:messageId/react
{
  emoji: "❤️"
}

// Response
{
  messageId: 123,
  reactions: [
    { emoji: "❤️", count: 3, users: [1, 5, 9] },
    { emoji: "👍", count: 1, users: [2] }
  ]
}
```

**Get Reactions for Message:**
```sql
SELECT emoji,
  COUNT(*) as count,
  ARRAY_AGG(user_id) as users
FROM message_reactions
WHERE message_id = $1
GROUP BY emoji;
```

---

## Real-Time Features

### WebSocket Integration

**Connection Setup:**
```typescript
// client/src/services/WebSocketService.ts
import { io } from 'socket.io-client';

class WebSocketService {
  private socket;
  
  connect(userId: number) {
    this.socket = io('wss://mundotango.com', {
      auth: { userId },
      transports: ['websocket']
    });
    
    this.socket.on('connect', () => {
      console.log('WebSocket connected');
    });
    
    this.socket.on('new_message', (data) => {
      this.handleNewMessage(data);
    });
    
    this.socket.on('message_read', (data) => {
      this.handleMessageRead(data);
    });
    
    this.socket.on('typing', (data) => {
      this.handleTypingIndicator(data);
    });
  }
  
  sendMessage(chatRoomId: number, message: string) {
    this.socket.emit('send_message', { chatRoomId, message });
  }
  
  markAsRead(chatRoomId: number) {
    this.socket.emit('mark_read', { chatRoomId });
  }
  
  startTyping(chatRoomId: number) {
    this.socket.emit('typing_start', { chatRoomId });
  }
  
  stopTyping(chatRoomId: number) {
    this.socket.emit('typing_stop', { chatRoomId });
  }
}
```

**Server WebSocket Handler:**
```typescript
// server/websocket.ts
import { Server } from 'socket.io';

export const setupWebSocket = (server) => {
  const io = new Server(server, {
    cors: { origin: '*' }
  });
  
  io.on('connection', (socket) => {
    const userId = socket.handshake.auth.userId;
    
    // Join user's personal room
    socket.join(`user:${userId}`);
    
    // Send message
    socket.on('send_message', async (data) => {
      const message = await storage.createMessage(data);
      
      // Broadcast to all participants
      const participants = await storage.getChatRoomParticipants(data.chatRoomId);
      participants.forEach(p => {
        io.to(`user:${p.userId}`).emit('new_message', {
          chatRoomId: data.chatRoomId,
          message
        });
      });
    });
    
    // Mark as read
    socket.on('mark_read', async (data) => {
      await storage.markConversationAsRead(data.chatRoomId, userId);
      
      // Notify sender
      io.to(`room:${data.chatRoomId}`).emit('message_read', {
        chatRoomId: data.chatRoomId,
        userId
      });
    });
    
    // Typing indicators
    socket.on('typing_start', (data) => {
      socket.to(`room:${data.chatRoomId}`).emit('typing', {
        chatRoomId: data.chatRoomId,
        userId,
        typing: true
      });
    });
    
    socket.on('typing_stop', (data) => {
      socket.to(`room:${data.chatRoomId}`).emit('typing', {
        chatRoomId: data.chatRoomId,
        userId,
        typing: false
      });
    });
  });
};
```

---

## Notifications

### 5. `notifications`
User notifications for various events.

**Schema:**
```sql
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Notification content
  type VARCHAR NOT NULL,  -- 'message' | 'friend_request' | 'event_rsvp' | etc.
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  
  -- Related entities
  related_id INTEGER,
  related_type VARCHAR,
  action_url TEXT,
  
  -- Status
  read BOOLEAN DEFAULT FALSE NOT NULL,
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX notifications_user_idx ON notifications(user_id);
CREATE INDEX notifications_read_idx ON notifications(read);
CREATE INDEX notifications_created_at_idx ON notifications(created_at);
```

**Notification Types:**
```typescript
type NotificationType =
  | 'message'              // New message received
  | 'friend_request'       // Friend request received
  | 'friend_accepted'      // Friend request accepted
  | 'event_rsvp'           // Someone RSVP'd to your event
  | 'event_reminder'       // Event starting soon
  | 'post_like'            // Someone liked your post
  | 'post_comment'         // Someone commented on your post
  | 'mention'              // You were mentioned
  | 'booking_confirmed';   // Booking confirmed
```

**Create Notification:**
```typescript
// Automatically create notification when message is sent
const sendMessageWithNotification = async (chatRoomId: number, senderId: number, message: string) => {
  // Send message
  const msg = await sendMessage(chatRoomId, senderId, message);
  
  // Get recipients
  const participants = await db.query.chatRoomUsers.findMany({
    where: and(
      eq(chatRoomUsers.chatRoomId, chatRoomId),
      ne(chatRoomUsers.userId, senderId)
    )
  });
  
  // Create notifications
  await db.insert(notifications).values(
    participants.map(p => ({
      userId: p.userId,
      type: 'message',
      title: `New message from ${senderName}`,
      message: message.substring(0, 100),
      relatedId: msg.id,
      relatedType: 'message',
      actionUrl: `/messages/${chatRoomId}`
    }))
  );
  
  return msg;
};
```

**Get Unread Notifications:**
```typescript
GET /api/notifications?unread=true

// Response
{
  notifications: [
    {
      id: 123,
      type: "message",
      title: "New message from Jane Smith",
      message: "See you at the milonga tonight!",
      actionUrl: "/messages/42",
      createdAt: "2025-11-02T14:30:00Z",
      read: false
    }
  ],
  unreadCount: 5
}
```

**Mark as Read:**
```typescript
PUT /api/notifications/:id/read

// Or mark all as read
PUT /api/notifications/read-all
```

---

## Read Receipts

### Marking Conversations as Read

**API Endpoint:**
```typescript
PUT /api/messages/conversations/:id/read

// Backend
const markAsRead = async (chatRoomId: number, userId: number) => {
  const now = new Date();
  
  // Update user's last_read_at
  await db.update(chatRoomUsers)
    .set({ lastReadAt: now })
    .where(and(
      eq(chatRoomUsers.chatRoomId, chatRoomId),
      eq(chatRoomUsers.userId, userId)
    ));
  
  // Update read_by on all messages
  await db.execute(sql`
    UPDATE chat_messages
    SET read_by = ARRAY_APPEND(read_by, ${userId})
    WHERE chat_room_id = ${chatRoomId}
      AND user_id != ${userId}
      AND NOT (${userId} = ANY(read_by))
  `);
};
```

**Display Read Receipts:**
```typescript
// In message list UI
{messages.map(msg => (
  <div key={msg.id}>
    <p>{msg.message}</p>
    {msg.userId === currentUserId && (
      <span className="read-status">
        {msg.readBy.length > 1 ? 'Read' : 'Sent'}
      </span>
    )}
  </div>
))}
```

---

## Schemas & Types

### TypeScript Types

```typescript
// From shared/schema.ts

export type SelectChatRoom = typeof chatRooms.$inferSelect;
export type InsertChatRoom = z.infer<typeof insertChatRoomSchema>;

export type SelectChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;

export type SelectMessageReaction = typeof messageReactions.$inferSelect;
export type InsertMessageReaction = z.infer<typeof insertMessageReactionSchema>;

export type SelectNotification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
```

---

## H2AC Handoff Notes

### 🔧 Manual Configuration Required

#### 1. Message Retention
**Human Decision Required:**
- How long to keep old messages?
- Auto-delete policy?

**Recommendation:**
```typescript
const MESSAGE_RETENTION = {
  keepForDays: 365,  // 1 year
  autoDelete: false,
  allowUserDeletion: true
};
```

#### 2. Group Chat Limits
**Human Decision Required:**
- Maximum participants per group?
- Who can create groups?
- Who can add members?

**Recommendation:**
```typescript
const GROUP_CHAT_LIMITS = {
  maxParticipants: 50,
  allowAllUsersToCreate: true,
  onlyAdminCanAddMembers: false
};
```

#### 3. Message Editing & Deletion
**Human Decision Required:**
- Allow message editing?
- Allow message deletion?
- Time limits?

**Recommendation:**
```typescript
const MESSAGE_MODIFICATION = {
  allowEditing: true,
  editTimeLimit: 15 * 60,  // 15 minutes
  allowDeletion: true,
  deleteTimeLimit: null,   // No limit
  showEditedIndicator: true
};
```

---

## Related Documentation
- [MESSAGING_SYSTEM.md](../features/MESSAGING_SYSTEM.md) - Feature implementation
- [MESSAGING_API.md](../api/MESSAGING_API.md) - API endpoints
- [USER_TABLES.md](./USER_TABLES.md) - User profiles

---

**Last Updated:** November 2, 2025  
**Maintained By:** ESA Documentation Agent (P89)
