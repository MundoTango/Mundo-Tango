import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import authRoutes from "./routes/auth";
import { authenticateToken, AuthRequest } from "./middleware/auth";
import { 
  insertPostSchema, 
  insertPostCommentSchema,
  insertEventSchema,
  insertEventRsvpSchema,
  insertGroupSchema,
  insertChatMessageSchema,
} from "@shared/schema";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";

const validateRequest = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ 
          message: "Validation error", 
          errors: validationError.toString() 
        });
      }
      next(error);
    }
  };
};

const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("Error:", err);
  
  if (err.name === "ZodError") {
    return res.status(400).json({ 
      message: "Validation error", 
      errors: err.errors 
    });
  }
  
  res.status(500).json({ 
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined
  });
};

export async function registerRoutes(app: Express): Promise<Server> {
  app.use("/api/auth", authRoutes);

  app.post("/api/posts", authenticateToken, validateRequest(insertPostSchema), async (req: AuthRequest, res: Response) => {
    try {
      const post = await storage.createPost({
        ...req.body,
        userId: req.userId!
      });
      res.status(201).json(post);
    } catch (error) {
      res.status(500).json({ message: "Failed to create post" });
    }
  });

  app.get("/api/posts", async (req: Request, res: Response) => {
    try {
      const { userId, limit = "20", offset = "0" } = req.query;
      const posts = await storage.getPosts({
        userId: userId ? parseInt(userId as string) : undefined,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string)
      });
      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch posts" });
    }
  });

  app.get("/api/posts/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const post = await storage.getPostById(id);
      
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      const comments = await storage.getPostComments(id);
      res.json({ ...post, comments });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch post" });
    }
  });

  app.put("/api/posts/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const post = await storage.getPostById(id);
      
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      if (post.userId !== req.userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const updated = await storage.updatePost(id, req.body);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Failed to update post" });
    }
  });

  app.delete("/api/posts/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const post = await storage.getPostById(id);
      
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      if (post.userId !== req.userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      await storage.deletePost(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete post" });
    }
  });

  app.post("/api/posts/:id/like", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const postId = parseInt(req.params.id);
      const isLiked = await storage.isPostLikedByUser(postId, req.userId!);
      
      if (isLiked) {
        await storage.unlikePost(postId, req.userId!);
        res.json({ liked: false });
      } else {
        await storage.likePost(postId, req.userId!);
        res.json({ liked: true });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to toggle like" });
    }
  });

  app.post("/api/posts/:id/comments", authenticateToken, validateRequest(insertPostCommentSchema.omit({ postId: true, userId: true })), async (req: AuthRequest, res: Response) => {
    try {
      const postId = parseInt(req.params.id);
      const comment = await storage.createPostComment({
        ...req.body,
        postId,
        userId: req.userId!
      });
      res.status(201).json(comment);
    } catch (error) {
      res.status(500).json({ message: "Failed to create comment" });
    }
  });

  app.get("/api/posts/:id/comments", async (req: Request, res: Response) => {
    try {
      const postId = parseInt(req.params.id);
      const comments = await storage.getPostComments(postId);
      res.json(comments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  app.post("/api/users/:id/follow", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const followingId = parseInt(req.params.id);
      
      if (followingId === req.userId) {
        return res.status(400).json({ message: "Cannot follow yourself" });
      }
      
      const result = await storage.followUser(req.userId!, followingId);
      
      if (!result) {
        return res.status(400).json({ message: "Already following this user" });
      }
      
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ message: "Failed to follow user" });
    }
  });

  app.delete("/api/users/:id/follow", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const followingId = parseInt(req.params.id);
      await storage.unfollowUser(req.userId!, followingId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to unfollow user" });
    }
  });

  app.get("/api/users/:id/followers", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      const followers = await storage.getFollowers(userId);
      res.json(followers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch followers" });
    }
  });

  app.get("/api/users/:id/following", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      const following = await storage.getFollowing(userId);
      res.json(following);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch following" });
    }
  });

  app.post("/api/events", authenticateToken, validateRequest(insertEventSchema.omit({ userId: true })), async (req: AuthRequest, res: Response) => {
    try {
      const event = await storage.createEvent({
        ...req.body,
        userId: req.userId!
      });
      res.status(201).json(event);
    } catch (error) {
      res.status(500).json({ message: "Failed to create event" });
    }
  });

  app.get("/api/events", async (req: Request, res: Response) => {
    try {
      const { city, eventType, startDate, endDate, limit = "20", offset = "0" } = req.query;
      const events = await storage.getEvents({
        city: city as string,
        eventType: eventType as string,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string)
      });
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  app.get("/api/events/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const event = await storage.getEventById(id);
      
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      res.json(event);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch event" });
    }
  });

  app.put("/api/events/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const event = await storage.getEventById(id);
      
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      if (event.userId !== req.userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const updated = await storage.updateEvent(id, req.body);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Failed to update event" });
    }
  });

  app.delete("/api/events/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const event = await storage.getEventById(id);
      
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      if (event.userId !== req.userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      await storage.deleteEvent(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete event" });
    }
  });

  app.post("/api/events/:id/rsvp", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const eventId = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!["going", "interested", "maybe"].includes(status)) {
        return res.status(400).json({ message: "Invalid RSVP status" });
      }
      
      const existing = await storage.getUserEventRsvp(eventId, req.userId!);
      
      if (existing) {
        const updated = await storage.updateEventRsvp(eventId, req.userId!, status);
        return res.json(updated);
      }
      
      const rsvp = await storage.createEventRsvp({
        eventId,
        userId: req.userId!,
        status
      });
      
      res.status(201).json(rsvp);
    } catch (error) {
      res.status(500).json({ message: "Failed to RSVP to event" });
    }
  });

  app.get("/api/events/:id/attendees", async (req: Request, res: Response) => {
    try {
      const eventId = parseInt(req.params.id);
      const attendees = await storage.getEventRsvps(eventId);
      res.json(attendees);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch attendees" });
    }
  });

  app.post("/api/groups", authenticateToken, validateRequest(insertGroupSchema.omit({ creatorId: true })), async (req: AuthRequest, res: Response) => {
    try {
      const group = await storage.createGroup({
        ...req.body,
        creatorId: req.userId!
      });
      
      await storage.joinGroup(group.id, req.userId!);
      
      res.status(201).json(group);
    } catch (error) {
      res.status(500).json({ message: "Failed to create group" });
    }
  });

  app.get("/api/groups", async (req: Request, res: Response) => {
    try {
      const { search, limit = "20", offset = "0" } = req.query;
      const groups = await storage.getGroups({
        search: search as string,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string)
      });
      res.json(groups);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch groups" });
    }
  });

  app.get("/api/groups/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const group = await storage.getGroupById(id);
      
      if (!group) {
        return res.status(404).json({ message: "Group not found" });
      }
      
      res.json(group);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch group" });
    }
  });

  app.post("/api/groups/:id/join", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const groupId = parseInt(req.params.id);
      const result = await storage.joinGroup(groupId, req.userId!);
      
      if (!result) {
        return res.status(400).json({ message: "Already a member of this group" });
      }
      
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ message: "Failed to join group" });
    }
  });

  app.delete("/api/groups/:id/leave", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const groupId = parseInt(req.params.id);
      await storage.leaveGroup(groupId, req.userId!);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to leave group" });
    }
  });

  app.get("/api/groups/:id/members", async (req: Request, res: Response) => {
    try {
      const groupId = parseInt(req.params.id);
      const members = await storage.getGroupMembers(groupId);
      res.json(members);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch members" });
    }
  });

  app.get("/api/messages/conversations", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const conversations = await storage.getUserConversations(req.userId!);
      res.json(conversations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });

  app.post("/api/messages/conversations", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const { userId: otherUserId } = req.body;
      
      if (!otherUserId) {
        return res.status(400).json({ message: "userId is required" });
      }
      
      const conversation = await storage.getOrCreateDirectConversation(req.userId!, otherUserId);
      res.status(201).json(conversation);
    } catch (error) {
      res.status(500).json({ message: "Failed to create conversation" });
    }
  });

  app.get("/api/messages/conversations/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const chatRoomId = parseInt(req.params.id);
      const { limit = "50", offset = "0" } = req.query;
      
      const messages = await storage.getChatRoomMessages(
        chatRoomId,
        parseInt(limit as string),
        parseInt(offset as string)
      );
      
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post("/api/messages/conversations/:id/messages", authenticateToken, validateRequest(insertChatMessageSchema.omit({ chatRoomId: true, userId: true })), async (req: AuthRequest, res: Response) => {
    try {
      const chatRoomId = parseInt(req.params.id);
      const message = await storage.sendMessage({
        ...req.body,
        chatRoomId,
        userId: req.userId!
      });
      res.status(201).json(message);
    } catch (error) {
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  app.put("/api/messages/conversations/:id/read", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const chatRoomId = parseInt(req.params.id);
      await storage.markConversationAsRead(chatRoomId, req.userId!);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to mark as read" });
    }
  });

  app.get("/api/notifications", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const { limit = "50" } = req.query;
      const notifications = await storage.getUserNotifications(req.userId!, parseInt(limit as string));
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.put("/api/notifications/:id/read", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      await storage.markNotificationAsRead(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  app.put("/api/notifications/read-all", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      await storage.markAllNotificationsAsRead(req.userId!);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to mark all notifications as read" });
    }
  });

  app.use(errorHandler);

  const httpServer = createServer(app);

  return httpServer;
}
