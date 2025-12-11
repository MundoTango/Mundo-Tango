import { type Express } from "express";
import { db } from "../db";
import { socialMessages, users, groups, groupMembers } from "@shared/schema";
import { eq, and, or, desc, sql, inArray } from "drizzle-orm";
import { z } from "zod";

const sendMessageSchema = z.object({
  recipientId: z.number().optional(),
  groupId: z.number().optional(),
  content: z.string().min(1),
  attachments: z.array(z.string()).optional(),
});

export function registerMessagingRoutes(app: Express) {
  // Get all conversations (threads)
  app.get("/api/messages/conversations", async (req, res) => {
    if (!req.user) return res.status(401).send("Unauthorized");

    try {
      // Get direct message conversations
      const directMessages = await db
        .select({
          id: socialMessages.id,
          userId: socialMessages.senderId,
          userName: users.name,
          userImage: users.profileImage,
          lastMessage: socialMessages.content,
          timestamp: socialMessages.createdAt,
          isRead: socialMessages.isRead,
          type: sql<string>`'direct'`,
        })
        .from(socialMessages)
        .leftJoin(users, eq(socialMessages.senderId, users.id))
        .where(
          or(
            eq(socialMessages.senderId, req.user.id),
            eq(socialMessages.recipientId, req.user.id)
          )
        )
        .orderBy(desc(socialMessages.createdAt))
        .limit(50);

      // Get group conversations
      const userGroups = await db
        .select({
          id: groups.id,
          name: groups.name,
          image: groups.profileImage,
          lastMessage: sql<string>`''`,
          timestamp: groups.createdAt,
          isRead: sql<boolean>`true`,
          type: sql<string>`'group'`,
        })
        .from(groups)
        .innerJoin(groupMembers, eq(groupMembers.groupId, groups.id))
        .where(eq(groupMembers.userId, req.user.id));

      // Combine and deduplicate
      const conversations = [...directMessages, ...userGroups].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      res.json(conversations);
    } catch (error: any) {
      console.error("Error fetching conversations:", error);
      res.status(500).send("Failed to fetch conversations");
    }
  });

  // Get direct messages with a specific user
  app.get("/api/messages/direct/:userId", async (req, res) => {
    if (!req.user) return res.status(401).send("Unauthorized");

    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) return res.status(400).send("Invalid user ID");

    try {
      const messages = await db
        .select({
          id: socialMessages.id,
          senderId: socialMessages.senderId,
          senderName: users.name,
          senderImage: users.profileImage,
          content: socialMessages.content,
          attachments: socialMessages.attachments,
          isRead: socialMessages.isRead,
          createdAt: socialMessages.createdAt,
        })
        .from(socialMessages)
        .leftJoin(users, eq(socialMessages.senderId, users.id))
        .where(
          or(
            and(
              eq(socialMessages.senderId, req.user.id),
              eq(socialMessages.recipientId, userId)
            ),
            and(
              eq(socialMessages.senderId, userId),
              eq(socialMessages.recipientId, req.user.id)
            )
          )
        )
        .orderBy(socialMessages.createdAt);

      res.json(messages);
    } catch (error: any) {
      console.error("Error fetching direct messages:", error);
      res.status(500).send("Failed to fetch messages");
    }
  });

  // Get group messages
  app.get("/api/messages/group/:groupId", async (req, res) => {
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

      // Get messages
      const messages = await db
        .select({
          id: socialMessages.id,
          senderId: socialMessages.senderId,
          senderName: users.name,
          senderImage: users.profileImage,
          content: socialMessages.content,
          attachments: socialMessages.attachments,
          createdAt: socialMessages.createdAt,
        })
        .from(socialMessages)
        .leftJoin(users, eq(socialMessages.senderId, users.id))
        .where(eq(socialMessages.groupId, groupId))
        .orderBy(socialMessages.createdAt);

      res.json({
        group,
        members,
        messages,
      });
    } catch (error: any) {
      console.error("Error fetching group messages:", error);
      res.status(500).send("Failed to fetch group messages");
    }
  });

  // Send a message
  app.post("/api/messages/send", async (req, res) => {
    if (!req.user) return res.status(401).send("Unauthorized");

    const validation = sendMessageSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: validation.error });
    }

    const { recipientId, groupId, content, attachments } = validation.data;

    if (!recipientId && !groupId) {
      return res.status(400).send("Must specify recipientId or groupId");
    }

    try {
      const [message] = await db
        .insert(socialMessages)
        .values({
          senderId: req.user.id,
          recipientId: recipientId || null,
          groupId: groupId || null,
          content,
          attachments: attachments || [],
          isRead: false,
        })
        .returning();

      res.json(message);
    } catch (error: any) {
      console.error("Error sending message:", error);
      res.status(500).send("Failed to send message");
    }
  });

  // Mark message as read
  app.put("/api/messages/:id/read", async (req, res) => {
    if (!req.user) return res.status(401).send("Unauthorized");

    const messageId = parseInt(req.params.id);
    if (isNaN(messageId)) return res.status(400).send("Invalid message ID");

    try {
      await db
        .update(socialMessages)
        .set({ isRead: true })
        .where(
          and(
            eq(socialMessages.id, messageId),
            eq(socialMessages.recipientId, req.user.id)
          )
        );

      res.json({ success: true });
    } catch (error: any) {
      console.error("Error marking message as read:", error);
      res.status(500).send("Failed to mark message as read");
    }
  });

  // Delete a message
  app.delete("/api/messages/:id", async (req, res) => {
    if (!req.user) return res.status(401).send("Unauthorized");

    const messageId = parseInt(req.params.id);
    if (isNaN(messageId)) return res.status(400).send("Invalid message ID");

    try {
      await db
        .delete(socialMessages)
        .where(
          and(
            eq(socialMessages.id, messageId),
            eq(socialMessages.senderId, req.user.id)
          )
        );

      res.json({ success: true });
    } catch (error: any) {
      console.error("Error deleting message:", error);
      res.status(500).send("Failed to delete message");
    }
  });
}
