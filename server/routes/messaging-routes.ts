import { type Express } from "express";
import { db } from "../db";
import { socialMessages, users, groups, groupMembers } from "@shared/schema";
import { eq, and, or, desc, sql, inArray } from "drizzle-orm";
import { z } from "zod";
import logger from "../middleware/logger";

const sendMessageSchema = z.object({
  recipientId: z.number().optional(),
  recipientUsername: z.string().optional(),
  groupId: z.number().optional(),
  content: z.string().min(1),
  attachments: z.array(z.string()).optional(),
});

export function registerMessagingRoutes(app: Express) {
  // Get all conversations (threads)
  app.get("/api/messages/conversations", async (req, res) => {
    if (!req.user) return res.status(401).send("Unauthorized");

    try {
      logger.info("[Messaging] Fetching conversations", { userId: req.user.id });
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

      logger.debug("[Messaging] Conversations fetched", { count: conversations.length });
      res.json(conversations);
    } catch (error: any) {
      logger.error("[Messaging] Error fetching conversations", { error: error.message });
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

      logger.debug("[Messaging] Direct messages fetched", { count: messages.length });
      res.json(messages);
    } catch (error: any) {
      logger.error("[Messaging] Error fetching direct messages", { error: error.message });
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

      logger.debug("[Messaging] Group messages fetched", { groupId, messageCount: messages.length });
      res.json({
        group,
        members,
        messages,
      });
    } catch (error: any) {
      logger.error("[Messaging] Error fetching group messages", { error: error.message });
      res.status(500).send("Failed to fetch group messages");
    }
  });

  // Send a message
  app.post("/api/messages/send", async (req, res) => {
    if (!req.user) return res.status(401).send("Unauthorized");

    const validation = sendMessageSchema.safeParse(req.body);
    if (!validation.success) {
      logger.error("[Messaging] Validation failed", { error: validation.error, body: req.body });
      return res.status(400).json({ error: validation.error });
    }

    let { recipientId, recipientUsername, groupId, content, attachments } = validation.data;

    // If recipientId not provided but recipientUsername is, look up the user
    if (!recipientId && recipientUsername) {
      const recipientUser = await db.select().from(users)
        .where(or(
          eq(users.username, recipientUsername),
          eq(users.email, recipientUsername),
          eq(users.id, parseInt(recipientUsername) || 0)
        ))
        .limit(1);
      
      if (recipientUser.length > 0) {
        recipientId = recipientUser[0].id;
      }
    }

    if (!recipientId && !groupId) {
      return res.status(400).send("Must specify recipientId or groupId");
    }

    try {
      // Get recipient name for legacy fields
      let recipientName = "Unknown";
      if (recipientId) {
        const recipient = await db.select({ name: users.name, username: users.username })
          .from(users)
          .where(eq(users.id, recipientId))
          .limit(1);
        if (recipient.length > 0) {
          recipientName = recipient[0].name || recipient[0].username || "Unknown";
        }
      }

      logger.info("[Messaging] Sending message", { senderId: req.user.id, recipientId, groupId, content });
      const [message] = await db
        .insert(socialMessages)
        .values({
          // Legacy required fields
          userId: req.user.id,
          platform: "mt",
          friendName: recipientName,
          timestamp: new Date(),
          // New messaging fields  
          senderId: req.user.id,
          recipientId: recipientId || null,
          groupId: groupId || null,
          content,
          attachments: attachments || [],
          isRead: false,
        })
        .returning();

      logger.debug("[Messaging] Message sent successfully", { messageId: message.id });
      res.json(message);
    } catch (error: any) {
      logger.error("[Messaging] Error sending message", { error: error.message, stack: error.stack });
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

      logger.debug("[Messaging] Message marked as read", { messageId });
      res.json({ success: true });
    } catch (error: any) {
      logger.error("[Messaging] Error marking message as read", { error: error.message });
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

      logger.info("[Messaging] Message deleted", { messageId });
      res.json({ success: true });
    } catch (error: any) {
      logger.error("[Messaging] Error deleting message", { error: error.message });
      res.status(500).send("Failed to delete message");
    }
  });
}
