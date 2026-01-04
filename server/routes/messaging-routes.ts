import { type Express, Response } from "express";
import { db } from "../db";
import { directMessages, users, groups, groupMembers, groupMessages } from "@shared/schema";
import { eq, and, or, desc, sql } from "drizzle-orm";
import { z } from "zod";
import { authenticateToken, AuthRequest } from "../middleware/auth";
import { notificationService } from "../services/notification-service";

const sendMessageSchema = z.object({
  recipientId: z.number().optional(),
  groupId: z.number().optional(),
  content: z.string().min(1),
});

export function registerMessagingRoutes(app: Express) {
  app.get("/api/messages/unread-count", authenticateToken, async (req: AuthRequest, res: Response) => {
    if (!req.user) return res.status(401).send("Unauthorized");
    try {
      const result = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(directMessages)
        .where(
          and(
            eq(directMessages.recipientId, req.user.id),
            eq(directMessages.isRead, false)
          )
        );
      
      const unreadCount = result[0]?.count || 0;
      console.log(`[Messaging] Unread count for user ${req.user.id}: ${unreadCount}`);
      res.json({ count: unreadCount });
    } catch (error) {
      console.error("Error fetching unread count:", error);
      res.status(500).send("Failed to fetch unread count");
    }
  });

  app.get("/api/messages/unread-count", authenticateToken, async (req: AuthRequest, res: Response) => {
    if (!req.user) return res.status(401).send("Unauthorized");
    try {
      const result = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(directMessages)
        .where(
          and(
            eq(directMessages.recipientId, req.user.id),
            eq(directMessages.isRead, false)
          )
        );
      
      const unreadCount = result[0]?.count || 0;
      console.log(`[Messaging] Unread count for user ${req.user.id}: ${unreadCount}`);
      res.json({ count: unreadCount });
    } catch (error) {
      console.error("Error fetching unread count:", error);
      res.status(500).send("Failed to fetch unread count");
    }
  });

  app.get("/api/messages/conversations", authenticateToken, async (req: AuthRequest, res: Response) => {
    if (!req.user) return res.status(401).send("Unauthorized");

    try {
      // Find all conversations involving the user
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
        .orderBy(desc(directMessages.createdAt));

      const conversationMap = new Map<number, any>();
      
      for (const msg of dms) {
        const partnerId = msg.senderId === req.user.id ? msg.recipientId : msg.senderId;
        if (!conversationMap.has(partnerId)) {
          conversationMap.set(partnerId, {
            id: msg.id,
            userId: partnerId,
            lastMessage: msg.content,
            timestamp: msg.createdAt,
            // A conversation is unread if the latest message was sent TO the user and is NOT read
            isRead: msg.senderId === req.user.id ? true : msg.isRead,
            type: 'direct',
            channel: 'mt'
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

      const senderIds = Array.from(new Set(messages.map(m => m.senderId)));
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

      if (!group) {
        return res.status(404).send("Group not found");
      }

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

      // Fetch actual group messages
      const messages = await db
        .select({
          id: groupMessages.id,
          senderId: groupMessages.senderId,
          content: groupMessages.content,
          mediaUrl: groupMessages.mediaUrl,
          mediaType: groupMessages.mediaType,
          isPinned: groupMessages.isPinned,
          createdAt: groupMessages.createdAt,
          senderName: users.name,
          senderImage: users.profileImage,
        })
        .from(groupMessages)
        .leftJoin(users, eq(groupMessages.senderId, users.id))
        .where(eq(groupMessages.groupId, groupId))
        .orderBy(groupMessages.createdAt);

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

      // Send notification to recipient
      try {
        await notificationService.notifyNewMessage(recipientId!, req.user.id, content);
      } catch (notifError) {
        console.error("Error sending message notification:", notifError);
      }

      res.json(message);
    } catch (error: any) {
      console.error("Error sending message:", error);
      res.status(500).send("Failed to send message");
    }
  };

  // Register both endpoints - frontend uses send-direct, keep send for backwards compatibility
  app.post("/api/messages/send", authenticateToken, sendDirectMessageHandler);
  app.post("/api/messages/send-direct", authenticateToken, sendDirectMessageHandler);

  // Send group message
  app.post("/api/messages/group/:groupId", authenticateToken, async (req: AuthRequest, res: Response) => {
    if (!req.user) return res.status(401).send("Unauthorized");

    const groupId = parseInt(req.params.groupId);
    if (isNaN(groupId)) return res.status(400).send("Invalid group ID");

    const { content } = req.body;
    if (!content || typeof content !== 'string') {
      return res.status(400).send("Content is required");
    }

    try {
      // Verify membership
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

      // Get group info for notifications
      const [group] = await db
        .select({ name: groups.name })
        .from(groups)
        .where(eq(groups.id, groupId))
        .limit(1);

      if (!group) {
        return res.status(404).send("Group not found");
      }

      // Insert message
      const [message] = await db
        .insert(groupMessages)
        .values({
          groupId,
          senderId: req.user.id,
          content,
        })
        .returning();

      // Send notifications to other group members
      try {
        const members = await db
          .select({ userId: groupMembers.userId })
          .from(groupMembers)
          .where(eq(groupMembers.groupId, groupId));

        for (const member of members) {
          if (member.userId !== req.user.id) {
            await notificationService.notifyGroupMessage(
              member.userId,
              req.user.id,
              groupId,
              group?.name || 'Group',
              content
            );
          }
        }
      } catch (notifError) {
        console.error("Error sending group message notifications:", notifError);
      }

      res.json(message);
    } catch (error: any) {
      console.error("Error sending group message:", error);
      res.status(500).send("Failed to send group message");
    }
  });

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

  // Mark all messages from a specific sender as read
  app.post("/api/messages/mark-read", authenticateToken, async (req: AuthRequest, res: Response) => {
    if (!req.user) return res.status(401).send("Unauthorized");

    const { senderId } = req.body;
    if (!senderId) return res.status(400).send("Sender ID is required");

    try {
      await db
        .update(directMessages)
        .set({ isRead: true })
        .where(
          and(
            eq(directMessages.senderId, senderId),
            eq(directMessages.recipientId, req.user.id),
            eq(directMessages.isRead, false)
          )
        );

      res.json({ success: true });
    } catch (error: any) {
      console.error("Error marking messages as read:", error);
      res.status(500).send("Failed to mark messages as read");
    }
  });

  // PRO Contact Form - Routes contact form submissions to PRO user's inbox
  const proContactSchema = z.object({
    proUserId: z.number(),
    name: z.string().min(1),
    email: z.string().email(),
    phone: z.string().optional(),
    message: z.string().min(1),
  });

  app.post("/api/pro/contact", async (req, res) => {
    try {
      const validation = proContactSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.errors });
      }

      const { proUserId, name, email, phone, message } = validation.data;

      // Verify the PRO user exists
      const [proUser] = await db
        .select({ id: users.id, name: users.name })
        .from(users)
        .where(eq(users.id, proUserId))
        .limit(1);

      if (!proUser) {
        return res.status(404).send("PRO user not found");
      }

      // SECURITY: Always use guest contact user for anonymous submissions
      // This prevents impersonation attacks where attacker could submit another user's email
      // The contact details (name, email, phone) are preserved in the message body
      let [guestUser] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, 'guest-contact@mundotango.life'))
        .limit(1);

      if (!guestUser) {
        const [newGuestUser] = await db.insert(users).values({
          email: 'guest-contact@mundotango.life',
          username: 'guest-contact',
          name: 'Guest Contact',
          password: 'no-login',
          roleLevel: 0,
          isEmailVerified: true,
        }).returning();
        guestUser = { id: newGuestUser.id };
      }
      const senderId = guestUser.id;

      // Format message with contact details
      const formattedMessage = `📧 **PRO Page Contact Form**

**From:** ${name}
**Email:** ${email}${phone ? `\n**Phone:** ${phone}` : ''}

---

${message}`;

      // Create direct message to PRO user
      const [dm] = await db
        .insert(directMessages)
        .values({
          senderId,
          recipientId: proUserId,
          content: formattedMessage,
          isRead: false,
        })
        .returning();

      // Send notification to PRO user
      try {
        await notificationService.notifyNewMessage(proUserId, senderId, formattedMessage.substring(0, 100));
      } catch (notifError) {
        console.error("Error sending PRO contact notification:", notifError);
      }

      res.json({ success: true, messageId: dm.id });
    } catch (error: any) {
      console.error("Error processing PRO contact form:", error);
      res.status(500).send("Failed to send message");
    }
  });
}
