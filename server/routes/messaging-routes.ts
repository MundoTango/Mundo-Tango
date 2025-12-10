import { type Express, Response } from "express";
import { db } from "../db";
import { chatMessages, chatRooms, chatRoomUsers, users, groups, groupMembers } from "@shared/schema";
import { eq, and, or, desc, sql, inArray } from "drizzle-orm";
import { z } from "zod";
import { authenticateToken, AuthRequest } from "../middleware/auth";

const sendMessageSchema = z.object({
  recipientId: z.number().optional(),
  chatRoomId: z.number().optional(),
  groupId: z.number().optional(),
  content: z.string().min(1),
  mediaUrl: z.string().optional(),
  mediaType: z.string().optional(),
});

export function registerMessagingRoutes(app: Express) {
  // Get all conversations (threads) - using chatRooms for direct & groups for group chats
  app.get("/api/chat/conversations", authenticateToken, async (req: AuthRequest, res: Response) => {
    if (!req.user) return res.status(401).send("Unauthorized");

    try {
      console.log("[messaging] Fetching conversations for user:", req.user.id);
      
      // Step 1: Get chat rooms - using raw SQL to avoid Drizzle issues
      const userChatRoomsResult = await db.execute(sql`
        SELECT cr.id, cr.type, cr.name, cr.avatar, cr.last_message_at
        FROM chat_rooms cr
        INNER JOIN chat_room_users cru ON cru.chat_room_id = cr.id
        WHERE cru.user_id = ${req.user.id}
        ORDER BY cr.last_message_at DESC NULLS LAST
        LIMIT 50
      `);
      
      console.log("[messaging] Found chat rooms:", userChatRoomsResult.rows?.length || 0);
      const userChatRooms = (userChatRoomsResult.rows || []) as any[];

      // Step 2: Get group conversations from groups table
      const userGroupsResult = await db.execute(sql`
        SELECT g.id, g.name, g.image_url as avatar, g.created_at
        FROM groups g
        INNER JOIN group_members gm ON gm.group_id = g.id
        WHERE gm.user_id = ${req.user.id}
      `);
      
      console.log("[messaging] Found user groups:", userGroupsResult.rows?.length || 0);
      const userGroups = (userGroupsResult.rows || []) as any[];

      // Step 3: Build conversations from chat rooms
      const chatRoomConversations = await Promise.all(
        userChatRooms.map(async (room) => {
          // Get participants - alias columns to camelCase for frontend
          const participantsResult = await db.execute(sql`
            SELECT u.id, u.name, u.profile_image as "profileImage"
            FROM chat_room_users cru
            INNER JOIN users u ON u.id = cru.user_id
            WHERE cru.chat_room_id = ${room.id} AND cru.user_id != ${req.user!.id}
          `);
          const participants = (participantsResult.rows || []) as Array<{
            id: number;
            name: string;
            profileImage: string | null;
          }>;

          // Get latest message
          const latestMessageResult = await db.execute(sql`
            SELECT message, user_id as sender_id, created_at
            FROM chat_messages
            WHERE chat_room_id = ${room.id}
            ORDER BY created_at DESC
            LIMIT 1
          `);
          const latestMessage = (latestMessageResult.rows || [])[0] as any;

          return {
            id: room.id,
            type: room.type || "direct",
            name: room.name || participants.map((p) => p.name).join(", ") || "Conversation",
            avatar: room.avatar || (participants[0]?.profileImage || null),
            participants,
            lastMessage: latestMessage?.message || null,
            lastMessageAt: latestMessage?.created_at || room.last_message_at,
            unreadCount: 0,
          };
        })
      );

      // Step 4: Build group conversations
      const groupConversations = userGroups.map((group) => ({
        id: `group-${group.id}`,
        type: "group",
        name: group.name,
        avatar: group.avatar,
        participants: [],
        lastMessage: null,
        lastMessageAt: group.created_at,
        unreadCount: 0,
      }));

      // Combine and sort by last message time
      const allConversations = [...chatRoomConversations, ...groupConversations].sort(
        (a, b) => {
          const aTime = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
          const bTime = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
          return bTime - aTime;
        }
      );

      console.log("[messaging] Total conversations:", allConversations.length);
      res.json(allConversations);
    } catch (error: any) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ error: "Failed to fetch conversations", details: error.message });
    }
  });

  // Get messages for a specific chat room
  app.get("/api/chat/room/:roomId", authenticateToken, async (req: AuthRequest, res: Response) => {
    if (!req.user) return res.status(401).send("Unauthorized");

    const roomId = parseInt(req.params.roomId);
    if (isNaN(roomId)) return res.status(400).send("Invalid room ID");

    try {
      // Verify user is a member of the room
      const membership = await db
        .select()
        .from(chatRoomUsers)
        .where(
          and(
            eq(chatRoomUsers.chatRoomId, roomId),
            eq(chatRoomUsers.userId, req.user.id)
          )
        )
        .limit(1);

      if (membership.length === 0) {
        return res.status(403).send("Not a member of this chat room");
      }

      // Get messages with sender info
      const messages = await db
        .select({
          id: chatMessages.id,
          senderId: chatMessages.userId,
          senderName: users.name,
          senderImage: users.profileImage,
          message: chatMessages.message,
          mediaUrl: chatMessages.mediaUrl,
          mediaType: chatMessages.mediaType,
          createdAt: chatMessages.createdAt,
          isOwn: sql<boolean>`${chatMessages.userId} = ${req.user.id}`,
        })
        .from(chatMessages)
        .leftJoin(users, eq(users.id, chatMessages.userId))
        .where(eq(chatMessages.chatRoomId, roomId))
        .orderBy(chatMessages.createdAt)
        .limit(100);

      // Update last read
      await db
        .update(chatRoomUsers)
        .set({ lastReadAt: new Date() })
        .where(
          and(
            eq(chatRoomUsers.chatRoomId, roomId),
            eq(chatRoomUsers.userId, req.user.id)
          )
        );

      res.json(messages);
    } catch (error: any) {
      console.error("Error fetching room messages:", error);
      res.status(500).json({ error: "Failed to fetch messages", details: error.message });
    }
  });

  // Get or create direct message room with a user
  app.get("/api/chat/direct/:userId", authenticateToken, async (req: AuthRequest, res: Response) => {
    if (!req.user) return res.status(401).send("Unauthorized");

    const otherUserId = parseInt(req.params.userId);
    if (isNaN(otherUserId)) return res.status(400).send("Invalid user ID");

    try {
      // Find existing direct chat room between these users
      const existingRoom = await db.execute(sql`
        SELECT cr.id 
        FROM chat_rooms cr
        INNER JOIN chat_room_users cru1 ON cru1.chat_room_id = cr.id AND cru1.user_id = ${req.user.id}
        INNER JOIN chat_room_users cru2 ON cru2.chat_room_id = cr.id AND cru2.user_id = ${otherUserId}
        WHERE cr.type = 'direct'
        AND (SELECT COUNT(*) FROM chat_room_users WHERE chat_room_id = cr.id) = 2
        LIMIT 1
      `);

      let roomId: number;

      if (existingRoom.rows && existingRoom.rows.length > 0) {
        roomId = (existingRoom.rows[0] as any).id;
      } else {
        // Create new direct chat room
        const [newRoom] = await db
          .insert(chatRooms)
          .values({
            type: "direct",
            lastMessageAt: new Date(),
          })
          .returning();

        roomId = newRoom.id;

        // Add both users to the room
        await db.insert(chatRoomUsers).values([
          { chatRoomId: roomId, userId: req.user.id },
          { chatRoomId: roomId, userId: otherUserId },
        ]);
      }

      // Get messages
      const messages = await db
        .select({
          id: chatMessages.id,
          senderId: chatMessages.userId,
          senderName: users.name,
          senderImage: users.profileImage,
          message: chatMessages.message,
          mediaUrl: chatMessages.mediaUrl,
          mediaType: chatMessages.mediaType,
          createdAt: chatMessages.createdAt,
          isOwn: sql<boolean>`${chatMessages.userId} = ${req.user.id}`,
        })
        .from(chatMessages)
        .leftJoin(users, eq(users.id, chatMessages.userId))
        .where(eq(chatMessages.chatRoomId, roomId))
        .orderBy(chatMessages.createdAt)
        .limit(100);

      // Get other user info
      const [otherUser] = await db
        .select({
          id: users.id,
          name: users.name,
          profileImage: users.profileImage,
        })
        .from(users)
        .where(eq(users.id, otherUserId))
        .limit(1);

      res.json({
        roomId,
        otherUser,
        messages,
      });
    } catch (error: any) {
      console.error("Error fetching direct messages:", error);
      res.status(500).json({ error: "Failed to fetch messages", details: error.message });
    }
  });

  // Get group messages
  app.get("/api/chat/group/:groupId", authenticateToken, async (req: AuthRequest, res: Response) => {
    if (!req.user) return res.status(401).send("Unauthorized");

    const groupId = parseInt(req.params.groupId);
    if (isNaN(groupId)) return res.status(400).send("Invalid group ID");

    try {
      // Verify user is a member of the group
      const membership = await db
        .select()
        .from(groupMembers)
        .where(
          and(
            eq(groupMembers.groupId, groupId),
            eq(groupMembers.userId, req.user.id)
          )
        )
        .limit(1);

      if (membership.length === 0) {
        return res.status(403).send("Not a member of this group");
      }

      // Get group details
      const [group] = await db
        .select()
        .from(groups)
        .where(eq(groups.id, groupId))
        .limit(1);

      // Get group members
      const members = await db
        .select({
          id: users.id,
          name: users.name,
          profileImage: users.profileImage,
          role: groupMembers.role,
        })
        .from(groupMembers)
        .leftJoin(users, eq(groupMembers.userId, users.id))
        .where(eq(groupMembers.groupId, groupId));

      res.json({
        group,
        members,
        messages: [], // Group messages would need a separate table
      });
    } catch (error: any) {
      console.error("Error fetching group messages:", error);
      res.status(500).json({ error: "Failed to fetch group messages", details: error.message });
    }
  });

  // Send a message
  app.post("/api/chat/send", authenticateToken, async (req: AuthRequest, res: Response) => {
    if (!req.user) return res.status(401).send("Unauthorized");

    const validation = sendMessageSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: validation.error });
    }

    const { recipientId, chatRoomId, content, mediaUrl, mediaType } = validation.data;

    try {
      let roomId = chatRoomId;

      // If recipientId is provided, get or create direct chat room
      if (recipientId && !chatRoomId) {
        const existingRoom = await db.execute(sql`
          SELECT cr.id 
          FROM chat_rooms cr
          INNER JOIN chat_room_users cru1 ON cru1.chat_room_id = cr.id AND cru1.user_id = ${req.user.id}
          INNER JOIN chat_room_users cru2 ON cru2.chat_room_id = cr.id AND cru2.user_id = ${recipientId}
          WHERE cr.type = 'direct'
          AND (SELECT COUNT(*) FROM chat_room_users WHERE chat_room_id = cr.id) = 2
          LIMIT 1
        `);

        if (existingRoom.rows && existingRoom.rows.length > 0) {
          roomId = (existingRoom.rows[0] as any).id;
        } else {
          // Create new direct chat room
          const [newRoom] = await db
            .insert(chatRooms)
            .values({
              type: "direct",
              lastMessageAt: new Date(),
            })
            .returning();

          roomId = newRoom.id;

          // Add both users to the room
          await db.insert(chatRoomUsers).values([
            { chatRoomId: roomId, userId: req.user.id },
            { chatRoomId: roomId, userId: recipientId },
          ]);
        }
      }

      if (!roomId) {
        return res.status(400).send("Must specify recipientId or chatRoomId");
      }

      // Insert message
      const [message] = await db
        .insert(chatMessages)
        .values({
          chatRoomId: roomId,
          userId: req.user.id,
          message: content,
          mediaUrl: mediaUrl || null,
          mediaType: mediaType || null,
        })
        .returning();

      // Update room's last message time
      await db
        .update(chatRooms)
        .set({ lastMessageAt: new Date() })
        .where(eq(chatRooms.id, roomId));

      // Get sender info
      const [sender] = await db
        .select({
          name: users.name,
          profileImage: users.profileImage,
        })
        .from(users)
        .where(eq(users.id, req.user.id))
        .limit(1);

      res.json({
        ...message,
        senderName: sender.name,
        senderImage: sender.profileImage,
        isOwn: true,
      });
    } catch (error: any) {
      console.error("Error sending message:", error);
      res.status(500).json({ error: "Failed to send message", details: error.message });
    }
  });

  // Mark messages as read
  app.put("/api/chat/room/:roomId/read", authenticateToken, async (req: AuthRequest, res: Response) => {
    if (!req.user) return res.status(401).send("Unauthorized");

    const roomId = parseInt(req.params.roomId);
    if (isNaN(roomId)) return res.status(400).send("Invalid room ID");

    try {
      await db
        .update(chatRoomUsers)
        .set({ lastReadAt: new Date() })
        .where(
          and(
            eq(chatRoomUsers.chatRoomId, roomId),
            eq(chatRoomUsers.userId, req.user.id)
          )
        );

      res.json({ success: true });
    } catch (error: any) {
      console.error("Error marking messages as read:", error);
      res.status(500).json({ error: "Failed to mark messages as read", details: error.message });
    }
  });

  // Delete a message
  app.delete("/api/chat/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
    if (!req.user) return res.status(401).send("Unauthorized");

    const messageId = parseInt(req.params.id);
    if (isNaN(messageId)) return res.status(400).send("Invalid message ID");

    try {
      await db
        .delete(chatMessages)
        .where(
          and(
            eq(chatMessages.id, messageId),
            eq(chatMessages.userId, req.user.id)
          )
        );

      res.json({ success: true });
    } catch (error: any) {
      console.error("Error deleting message:", error);
      res.status(500).json({ error: "Failed to delete message", details: error.message });
    }
  });
}
