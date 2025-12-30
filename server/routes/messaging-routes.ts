import { type Express, Response } from "express";
import { db } from "../db";
import { directMessages, users, groups, groupMembers } from "@shared/schema";
import { eq, and, or, desc, sql } from "drizzle-orm";
import { z } from "zod";
import { authenticateToken, AuthRequest } from "../middleware/auth";

const sendMessageSchema = z.object({
  recipientId: z.number().optional(),
  groupId: z.number().optional(),
  content: z.string().min(1),
});

export function registerMessagingRoutes(app: Express) {
  app.get("/api/messages/conversations", authenticateToken, async (req: AuthRequest, res: Response) => {
    if (!req.user) return res.status(401).send("Unauthorized");

    try {
      const dms = await db
        .select({
          id: directMessages.id,
          senderId: directMessages.senderId,
          recipientId: directMessages.recipientId,
          content: directMessages.content,
          isRead: directMessages.isRead,
          createdAt: directMessages.createdAt,
        })
        .from(directMessages)
        .where(
          or(
            eq(directMessages.senderId, req.user.id),
            eq(directMessages.recipientId, req.user.id)
          )
        )
        .orderBy(desc(directMessages.createdAt))
        .limit(100);

      const conversationMap = new Map<number, any>();
      
      for (const msg of dms) {
        const partnerId = msg.senderId === req.user.id ? msg.recipientId : msg.senderId;
        if (!conversationMap.has(partnerId)) {
          conversationMap.set(partnerId, {
            id: msg.id,
            userId: partnerId,
            lastMessage: msg.content,
            timestamp: msg.createdAt,
            isRead: msg.senderId !== req.user.id ? msg.isRead : true,
            type: 'direct',
          });
        }
      }

      const partnerIds = Array.from(conversationMap.keys());
      if (partnerIds.length > 0) {
        const partners = await db
          .select({ id: users.id, name: users.name, profileImage: users.profileImage })
          .from(users)
          .where(sql`${users.id} IN (${sql.join(partnerIds.map(id => sql`${id}`), sql`, `)})`);

        for (const partner of partners) {
          const conv = conversationMap.get(partner.id);
          if (conv) {
            conv.userName = partner.name;
            conv.userImage = partner.profileImage;
          }
        }
      }

      const userGroups = await db
        .select({
          id: groups.id,
          name: groups.name,
          image: groups.coverImage,
          timestamp: groups.createdAt,
        })
        .from(groups)
        .innerJoin(groupMembers, eq(groupMembers.groupId, groups.id))
        .where(eq(groupMembers.userId, req.user.id));

      const groupConversations = userGroups.map(g => ({
        id: g.id,
        name: g.name,
        image: g.image,
        lastMessage: '',
        timestamp: g.timestamp,
        isRead: true,
        type: 'group',
      }));

      const allConversations = [
        ...Array.from(conversationMap.values()),
        ...groupConversations
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      res.json(allConversations);
    } catch (error: any) {
      console.error("Error fetching conversations:", error);
      res.status(500).send("Failed to fetch conversations");
    }
  });

  app.get("/api/messages/direct/:userId", authenticateToken, async (req: AuthRequest, res: Response) => {
    if (!req.user) return res.status(401).send("Unauthorized");

    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) return res.status(400).send("Invalid user ID");

    try {
      const messages = await db
        .select({
          id: directMessages.id,
          senderId: directMessages.senderId,
          content: directMessages.content,
          mediaUrl: directMessages.mediaUrl,
          mediaType: directMessages.mediaType,
          isRead: directMessages.isRead,
          createdAt: directMessages.createdAt,
        })
        .from(directMessages)
        .where(
          or(
            and(
              eq(directMessages.senderId, req.user.id),
              eq(directMessages.recipientId, userId)
            ),
            and(
              eq(directMessages.senderId, userId),
              eq(directMessages.recipientId, req.user.id)
            )
          )
        )
        .orderBy(directMessages.createdAt);

      const senderIds = [...new Set(messages.map(m => m.senderId))];
      const senderMap = new Map<number, any>();
      
      if (senderIds.length > 0) {
        const senders = await db
          .select({ id: users.id, name: users.name, profileImage: users.profileImage })
          .from(users)
          .where(sql`${users.id} IN (${sql.join(senderIds.map(id => sql`${id}`), sql`, `)})`);
        
        for (const sender of senders) {
          senderMap.set(sender.id, sender);
        }
      }

      const enrichedMessages = messages.map(msg => ({
        ...msg,
        senderName: senderMap.get(msg.senderId)?.name,
        senderImage: senderMap.get(msg.senderId)?.profileImage,
      }));

      res.json(enrichedMessages);
    } catch (error: any) {
      console.error("Error fetching direct messages:", error);
      res.status(500).send("Failed to fetch messages");
    }
  });

  app.get("/api/messages/group/:groupId", authenticateToken, async (req: AuthRequest, res: Response) => {
    if (!req.user) return res.status(401).send("Unauthorized");

    const groupId = parseInt(req.params.groupId);
    if (isNaN(groupId)) return res.status(400).send("Invalid group ID");

    try {
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

      const [group] = await db
        .select()
        .from(groups)
        .where(eq(groups.id, groupId))
        .limit(1);

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
        messages: [],
      });
    } catch (error: any) {
      console.error("Error fetching group messages:", error);
      res.status(500).send("Failed to fetch group messages");
    }
  });

  // Handler for sending direct messages
  const sendDirectMessageHandler = async (req: AuthRequest, res: Response) => {
    if (!req.user) return res.status(401).send("Unauthorized");

    const validation = sendMessageSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: validation.error });
    }

    const { recipientId, groupId, content } = validation.data;

    if (!recipientId && !groupId) {
      return res.status(400).send("Must specify recipientId or groupId");
    }

    if (groupId) {
      return res.status(501).send("Group messages not yet implemented");
    }

    try {
      const [message] = await db
        .insert(directMessages)
        .values({
          senderId: req.user.id,
          recipientId: recipientId!,
          content,
          isRead: false,
        })
        .returning();

      res.json(message);
    } catch (error: any) {
      console.error("Error sending message:", error);
      res.status(500).send("Failed to send message");
    }
  };

  // Register both endpoints - frontend uses send-direct, keep send for backwards compatibility
  app.post("/api/messages/send", authenticateToken, sendDirectMessageHandler);
  app.post("/api/messages/send-direct", authenticateToken, sendDirectMessageHandler);

  app.put("/api/messages/:id/read", authenticateToken, async (req: AuthRequest, res: Response) => {
    if (!req.user) return res.status(401).send("Unauthorized");

    const messageId = parseInt(req.params.id);
    if (isNaN(messageId)) return res.status(400).send("Invalid message ID");

    try {
      await db
        .update(directMessages)
        .set({ isRead: true })
        .where(
          and(
            eq(directMessages.id, messageId),
            eq(directMessages.recipientId, req.user.id)
          )
        );

      res.json({ success: true });
    } catch (error: any) {
      console.error("Error marking message as read:", error);
      res.status(500).send("Failed to mark message as read");
    }
  });

  app.delete("/api/messages/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
    if (!req.user) return res.status(401).send("Unauthorized");

    const messageId = parseInt(req.params.id);
    if (isNaN(messageId)) return res.status(400).send("Invalid message ID");

    try {
      await db
        .delete(directMessages)
        .where(
          and(
            eq(directMessages.id, messageId),
            eq(directMessages.senderId, req.user.id)
          )
        );

      res.json({ success: true });
    } catch (error: any) {
      console.error("Error deleting message:", error);
      res.status(500).send("Failed to delete message");
    }
  });
}
