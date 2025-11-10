import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import authRoutes from "./routes/auth";
import deploymentsRoutes from "./routes/deployments";
import secretsRoutes from "./routes/secrets";
import previewsRoutes from "./routes/previews";
import platformAllRoutes from "./routes/platform-all";
import webhooksRoutes from "./routes/webhooks";
import { createTalentMatchRoutes } from "./talent-match-routes";
import { createAIChatRoutes } from "./ai-chat-routes";
import queuesRoutes from "./routes/queues";
import mentionRoutes from "./routes/mention-routes";
import lifeCeoRoutes from "./routes/life-ceo-routes";
import adminRoutes from "./routes/admin-routes";
import { createFriendsRoutes } from "./routes/friends-routes";
import { createAnalyticsRoutes } from "./routes/analytics-routes";
import { createBookmarkRoutes } from "./routes/bookmark-routes";
import avatarRoutes from "./routes/avatarRoutes";
import videoRoutes from "./routes/videoRoutes";
import mrblueVideoRoutes from "./routes/mrblue-video-routes";
import mrBlueRoutes from "./routes/mrBlue";
import mrBlueEnhancedRoutes from "./routes/mr-blue-enhanced";
import visualEditorRoutes from "./routes/visualEditor";
import whisperRoutes from "./routes/whisper";
import openaiRealtimeRoutes from "./routes/openai-realtime";
import realtimeVoiceRoutes, { initRealtimeVoiceWebSocket } from "./routes/realtimeVoice";
import rbacRoutes from "./routes/rbac-routes";
import featureFlagsRoutes from "./routes/feature-flags-routes";
import pricingRoutes from "./routes/pricing-routes";
import planRoutes from "./routes/plan-routes";
import syncRoutes from "./routes/sync-routes";
import selfHealingRoutes from "./routes/self-healing-routes";
import agentHealthRoutes from "./routes/agent-health-routes";
import predictiveContextRoutes from "./routes/predictive-context-routes";
import aiEnhanceRoutes from "./routes/ai-enhance";
import userSearchRoutes from "./routes/user-search";
import locationSearchRoutes from "./routes/location-search";
import housingRoutes from "./routes/housing-routes";
import livestreamRoutes from "./routes/livestream-routes";
import marketplaceRoutes from "./routes/marketplace-routes";
import subscriptionRoutes from "./routes/subscription-routes";
import reviewRoutes from "./routes/review-routes";
import mediaRoutes from "./routes/media-routes";
import leaderboardRoutes from "./routes/leaderboard-routes";
import blogRoutes from "./routes/blog-routes";
import teacherRoutes from "./routes/teacher-routes";
import venueRoutes from "./routes/venue-routes";
import workshopRoutes from "./routes/workshop-routes";
import musicRoutes from "./routes/music-routes";
import { authenticateToken, AuthRequest, requireRoleLevel } from "./middleware/auth";
import { wsNotificationService } from "./services/websocket-notification-service";
import { 
  insertPostSchema, 
  insertPostCommentSchema,
  insertEventSchema,
  insertEventRsvpSchema,
  insertGroupSchema,
  insertChatMessageSchema,
  savedPosts,
  posts,
  reactions,
  postShares,
  postReports,
  commentLikes,
  postComments,
  agentHealth,
  users,
  events,
  travelPlans,
  travelPlanItems,
  contactSubmissions,
  insertTravelPlanSchema,
  insertContactSubmissionSchema,
} from "@shared/schema";
import { 
  esaAgents,
  agentTasks,
  agentCommunications
} from "@shared/platform-schema";
import { db } from "@shared/db";
import { eq, and, or, desc, sql, isNotNull, gte } from "drizzle-orm";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import { cityscapeService } from "./services/cityscape-service";

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

const createPostBodySchema = insertPostSchema.omit({ userId: true });
const createCommentBodySchema = insertPostCommentSchema.omit({ userId: true, postId: true });

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
  // Phase 1 & 2 Deployment Blocker Routes
  app.use("/api/rbac", rbacRoutes);
  app.use("/api/feature-flags", featureFlagsRoutes);
  app.use("/api/pricing", pricingRoutes);
  
  // Phase 3 Deployment Blocker Routes
  app.use("/api/plan", planRoutes);
  app.use("/api/sync", syncRoutes);
  app.use("/api/admin/self-healing", selfHealingRoutes);
  
  // Phase 4 Deployment Blocker Routes
  app.use("/api/agents", agentHealthRoutes);
  app.use("/api/predictive", predictiveContextRoutes);
  
  // Existing routes
  app.use("/api/auth", authRoutes);
  app.use("/api/deployments", deploymentsRoutes);
  app.use("/api/secrets", secretsRoutes);
  app.use("/api/previews", previewsRoutes);
  app.use("/api/platform", platformAllRoutes);
  app.use("/api/webhooks", webhooksRoutes);
  app.use("/api/v1", createTalentMatchRoutes(storage));
  app.use("/api/v1", createAIChatRoutes());
  app.use("/api/queues", queuesRoutes);
  app.use("/api/mentions", mentionRoutes);
  app.use("/api/life-ceo", lifeCeoRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api", createFriendsRoutes(storage));
  app.use("/api", createAnalyticsRoutes(storage));
  app.use("/api", createBookmarkRoutes(storage));
  app.use("/api/avatar", avatarRoutes);
  app.use("/api/videos", videoRoutes);
  app.use("/api/mrblue", mrblueVideoRoutes);
  app.use("/api/mrblue", mrBlueRoutes);
  app.use(mrBlueEnhancedRoutes); // Enhanced Mr. Blue with troubleshooting KB
  app.use("/api/visual-editor", authenticateToken, visualEditorRoutes);
  app.use("/api/whisper", authenticateToken, whisperRoutes);
  app.use("/api/realtime", authenticateToken, realtimeVoiceRoutes);
  app.use("/api/openai-realtime", authenticateToken, openaiRealtimeRoutes);
  app.use("/api/ai", aiEnhanceRoutes);
  app.use("/api/user", userSearchRoutes);
  app.use("/api/locations", locationSearchRoutes);
  
  // Phase B: New feature routes
  app.use("/api/housing", housingRoutes);
  app.use("/api/livestreams", livestreamRoutes);
  app.use("/api/marketplace", marketplaceRoutes);
  app.use("/api/subscriptions", subscriptionRoutes);
  
  // Phase D: Community & Engagement Systems
  app.use("/api/reviews", reviewRoutes);
  app.use("/api/media", mediaRoutes);
  app.use("/api/leaderboard", leaderboardRoutes);
  app.use("/api/blog", blogRoutes);
  
  // Phase E: Professional Tools Routes
  app.use("/api/teachers", teacherRoutes);
  app.use("/api/venues", venueRoutes);
  app.use("/api/workshops", workshopRoutes);
  app.use("/api/music", musicRoutes);

  app.post("/api/posts", authenticateToken, validateRequest(createPostBodySchema), async (req: AuthRequest, res: Response) => {
    try {
      const post = await storage.createPost({
        ...req.body,
        userId: req.userId!
      });

      // NEW: Handle canonical mention format @user:user_123:maria
      const mentionIds = req.body.mentions || [];
      const mentionedGroups: Array<{ id: number; type: string }> = [];
      const mentionedUsers: number[] = [];

      // Parse mention IDs to extract user IDs and group IDs
      for (const mentionId of mentionIds) {
        if (typeof mentionId !== 'string') continue;
        
        if (mentionId.startsWith('user_')) {
          // Extract numeric user ID from "user_123" format
          const userId = parseInt(mentionId.replace('user_', ''));
          if (!isNaN(userId) && userId !== req.userId) {
            mentionedUsers.push(userId);
          }
        } else if (mentionId.startsWith('group_')) {
          const groupId = parseInt(mentionId.replace('group_', ''));
          if (!isNaN(groupId)) {
            mentionedGroups.push({ id: groupId, type: 'professional-group' });
          }
        } else if (mentionId.startsWith('city_')) {
          const cityId = parseInt(mentionId.replace('city_', ''));
          if (!isNaN(cityId)) {
            mentionedGroups.push({ id: cityId, type: 'city-group' });
          }
        }
      }

      // Send mention notifications to users
      const author = await storage.getUserById(req.userId!);
      for (const mentionedUserId of mentionedUsers) {
        try {
          await storage.createNotification({
            userId: mentionedUserId,
            type: 'mention',
            title: 'You were mentioned',
            message: `${author?.name || 'Someone'} mentioned you in a post`,
            data: JSON.stringify({ postId: post.id, relatedType: 'post' }),
            actionUrl: `/feed#post-${post.id}`,
            isRead: false
          });
          
          // Real-time Socket.io notification
          wsNotificationService.sendNotification(mentionedUserId, {
            type: 'mention',
            title: 'You were mentioned',
            message: `${author?.name || 'Someone'} mentioned you in a post`,
            postId: post.id,
            authorName: author?.name,
            authorAvatar: author?.profileImage,
          });
        } catch (error) {
          console.error(`Failed to send notification to user ${mentionedUserId}:`, error);
        }
      }

      // Auto-post to mentioned groups
      if (mentionedGroups.length > 0) {
        const user = await storage.getUserById(req.userId!);
        const userCity = user?.city || post.location;
        
        for (const group of mentionedGroups) {
          try {
            // Determine if user is a resident or visitor
            let postType = 'visitor';
            
            if (group.type === 'city-group') {
              // For city groups, check if user's city matches the group city
              const groupData = await storage.getGroupById(group.id);
              if (groupData && userCity) {
                const cityMatch = userCity.toLowerCase().includes(groupData.city?.toLowerCase() || '') ||
                                 (groupData.city?.toLowerCase() || '').includes(userCity.toLowerCase());
                postType = cityMatch ? 'resident' : 'visitor';
              }
            } else {
              // For professional groups, consider members as residents
              const isMember = await storage.isGroupMember(group.id, req.userId!);
              postType = isMember ? 'resident' : 'visitor';
            }
            
            // Create group post
            await storage.createGroupPost({
              groupId: group.id,
              authorId: req.userId!,
              content: req.body.content,
              mediaUrls: req.body.imageUrls || [],
              mediaType: req.body.imageUrls && req.body.imageUrls.length > 0 ? 'image' : undefined,
              postType: postType,
              isApproved: true, // Auto-approve posts from mentions
            });
            
            console.log(`[Auto-Post] ✅ Posted to ${group.type} "${group.name}" as ${postType}`);
          } catch (error) {
            console.error(`[Auto-Post] Failed to post to group ${group.id}:`, error);
          }
        }
      }

      if (post.location) {
        const cityName = cityscapeService.parseCityFromLocation(post.location);
        
        if (cityName) {
          const existingCommunities = await storage.getGroups({ search: cityName, limit: 10, offset: 0 });
          const cityExists = existingCommunities.some(
            c => c.name.toLowerCase() === cityName.toLowerCase()
          );

          if (!cityExists) {
            console.log(`[City Auto-Creation] Creating new city: ${cityName}`);
            
            const cityscapePhoto = await cityscapeService.fetchCityscapePhoto(cityName);
            
            const newCityCommunity = await storage.createGroup({
              name: cityName,
              description: `The official ${cityName} tango community. Connect with dancers, teachers, and events in your city.`,
              type: "city",
              creatorId: req.userId!,
              coverImage: cityscapePhoto?.url || "",
              city: cityName,
            });

            await storage.joinGroup(newCityCommunity.id, req.userId!);
            
            console.log(`[City Auto-Creation] ✅ Created ${cityName} community (ID: ${newCityCommunity.id})`);
          }
        }
      }

      // Fetch the full post with user data populated (including role)
      const fullPost = await storage.getPostById(post.id);
      res.status(201).json(fullPost);
    } catch (error) {
      console.error("[POST /api/posts] Error:", error);
      res.status(500).json({ message: "Failed to create post" });
    }
  });

  app.get("/api/posts", async (req: Request & { userId?: number }, res: Response) => {
    try {
      const { userId, limit = "20", offset = "0" } = req.query;
      const currentUserId = req.userId; // From auth middleware if authenticated
      const posts = await storage.getPosts({
        userId: userId ? parseInt(userId as string) : undefined,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        currentUserId: currentUserId,
      });
      
      // Enrich posts with group type information for proper color rendering
      const { enrichPostContentWithGroupTypes } = await import("./utils/enrich-mentions");
      const enrichedPosts = await Promise.all(
        posts.map(async (post: any) => ({
          ...post,
          content: await enrichPostContentWithGroupTypes(post.content),
        }))
      );
      
      res.json(enrichedPosts);
    } catch (error) {
      console.error("[GET /api/posts] Error fetching posts:", error);
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

  app.patch("/api/posts/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
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
      await storage.likePost(postId, req.userId!);
      res.json({ liked: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to like post" });
    }
  });

  app.delete("/api/posts/:id/like", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const postId = parseInt(req.params.id);
      await storage.unlikePost(postId, req.userId!);
      res.json({ liked: false });
    } catch (error) {
      res.status(500).json({ message: "Failed to unlike post" });
    }
  });

  // REACTIONS - 13 reaction types
  app.post("/api/posts/:id/react", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const postId = parseInt(req.params.id);
      const { reactionType } = req.body;
      
      if (!reactionType) {
        return res.status(400).json({ message: "Reaction type is required" });
      }

      // Remove any existing reaction
      await db.delete(reactions).where(
        and(
          eq(reactions.postId, postId),
          eq(reactions.userId, req.userId!)
        )
      );

      // Add new reaction if not removing
      if (reactionType !== '') {
        await db.insert(reactions).values({
          postId,
          userId: req.userId!,
          reactionType,
        });

        // Send notification to post author
        const post = await storage.getPostById(postId);
        if (post && post.userId !== req.userId) {
          await storage.createNotification({
            userId: post.userId,
            type: 'reaction',
            title: 'New reaction',
            message: `Someone reacted ${reactionType} to your post`,
            data: JSON.stringify({ postId }),
            actionUrl: `/feed#post-${postId}`,
            isRead: false
          });
        }
      }

      res.json({ reacted: reactionType !== '' });
    } catch (error) {
      console.error('React to post error:', error);
      res.status(500).json({ message: "Failed to react to post" });
    }
  });

  // SHARE - 3 share types: timeline, comment, link
  app.post("/api/posts/:id/share", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const postId = parseInt(req.params.id);
      const { shareType, comment } = req.body;
      
      if (!shareType || !['timeline', 'comment', 'link'].includes(shareType)) {
        return res.status(400).json({ message: "Valid share type is required" });
      }

      if (shareType !== 'link') {
        await db.insert(postShares).values({
          postId,
          userId: req.userId!,
          shareType,
          comment: comment || null,
        });

        // Send notification to post author
        const post = await storage.getPostById(postId);
        if (post && post.userId !== req.userId) {
          await storage.createNotification({
            userId: post.userId,
            type: 'share',
            title: 'Post shared',
            message: `Someone shared your post${comment ? ' with a comment' : ''}`,
            data: JSON.stringify({ postId }),
            actionUrl: `/feed#post-${postId}`,
            isRead: false
          });
        }
      }

      res.json({ shared: true });
    } catch (error) {
      console.error('Share post error:', error);
      res.status(500).json({ message: "Failed to share post" });
    }
  });

  // COMMENT LIKES
  app.post("/api/comments/:id/like", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const commentId = parseInt(req.params.id);
      
      await db.transaction(async (tx) => {
        // Check if already liked
        const existing = await tx.select().from(commentLikes)
          .where(and(
            eq(commentLikes.commentId, commentId),
            eq(commentLikes.userId, req.userId!)
          ))
          .limit(1);

        if (existing.length === 0) {
          // Add like
          await tx.insert(commentLikes).values({
            commentId,
            userId: req.userId!,
          });

          // Send notification to comment author
          const comment = await tx.select().from(postComments)
            .where(eq(postComments.id, commentId))
            .limit(1);
          
          if (comment[0] && comment[0].userId !== req.userId) {
            await storage.createNotification({
              userId: comment[0].userId,
              type: 'comment_like',
              title: 'Comment liked',
              message: 'Someone liked your comment',
              data: JSON.stringify({ commentId }),
              isRead: false
            });
          }
        } else {
          // Remove like
          await tx.delete(commentLikes).where(
            and(
              eq(commentLikes.commentId, commentId),
              eq(commentLikes.userId, req.userId!)
            )
          );
        }
      });

      res.json({ success: true });
    } catch (error) {
      console.error('Like comment error:', error);
      res.status(500).json({ message: "Failed to like comment" });
    }
  });

  app.post("/api/posts/:id/save", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const postId = parseInt(req.params.id);
      await storage.savePost(postId, req.userId!);
      res.json({ saved: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to save post" });
    }
  });

  app.delete("/api/posts/:id/save", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const postId = parseInt(req.params.id);
      await storage.unsavePost(postId, req.userId!);
      res.json({ saved: false });
    } catch (error) {
      res.status(500).json({ message: "Failed to unsave post" });
    }
  });

  app.post("/api/posts/:id/report", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const postId = parseInt(req.params.id);
      const { reason, details } = req.body;
      
      if (!reason) {
        return res.status(400).json({ message: "Reason is required" });
      }
      
      await storage.reportPost({
        contentType: "post",
        contentId: postId,
        reporterId: req.userId!,
        reason,
        details: details || null,
      });
      
      res.status(201).json({ message: "Report submitted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to submit report" });
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
      console.error("Create comment error:", error);
      res.status(500).json({ message: "Failed to create comment", error: error instanceof Error ? error.message : String(error) });
    }
  });

  app.get("/api/posts/:id/comments", async (req: Request, res: Response) => {
    try {
      const postId = parseInt(req.params.id);
      const comments = await storage.getPostComments(postId);
      res.json(comments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ message: "Failed to fetch comments", error: error instanceof Error ? error.message : String(error) });
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

  app.get("/api/users/:id", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUserById(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
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
      
      const params: any = {
        limit: parseInt(limit as string),
        offset: parseInt(offset as string)
      };
      
      if (city) params.city = city as string;
      if (eventType) params.eventType = eventType as string;
      if (startDate) params.startDate = new Date(startDate as string);
      if (endDate) params.endDate = new Date(endDate as string);
      
      const events = await storage.getEvents(params);
      res.json({ events, total: events.length });
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  app.get("/api/events/my-rsvps", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const rsvps = await storage.getUserRsvps(req.userId!);
      res.json(rsvps);
    } catch (error) {
      console.error("Get user RSVPs error:", error);
      res.status(500).json({ message: "Failed to fetch user RSVPs" });
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

  app.post("/api/groups", authenticateToken, validateRequest(insertGroupSchema.omit({ createdBy: true, ownerId: true })), async (req: AuthRequest, res: Response) => {
    try {
      const group = await storage.createGroup({
        ...req.body,
        createdBy: req.userId!,
        ownerId: req.userId!
      });
      
      await storage.joinGroup(group.id, req.userId!);
      
      res.status(201).json(group);
    } catch (error) {
      console.error("Create group error:", error);
      res.status(500).json({ message: "Failed to create group", error: error instanceof Error ? error.message : 'Unknown error' });
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
      console.error("Error fetching groups:", error);
      res.status(500).json({ message: "Failed to fetch groups" });
    }
  });

  app.get("/api/groups/:id", async (req: Request, res: Response) => {
    try {
      const param = req.params.id;
      let group: any;
      
      // Check if param is a number or a slug
      if (/^\d+$/.test(param)) {
        // It's a numeric ID
        group = await storage.getGroupById(parseInt(param));
      } else {
        // It's a slug
        group = await storage.getGroupBySlug(param);
      }
      
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

  app.get("/api/groups/:id/membership", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const groupId = parseInt(req.params.id);
      const isMember = await storage.isGroupMember(groupId, req.userId!);
      res.json({ isMember });
    } catch (error) {
      res.status(500).json({ message: "Failed to check membership" });
    }
  });

  app.get("/api/messages/conversations", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const conversations = await storage.getUserConversations(req.userId!);
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
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

  app.post("/api/notifications/read-all", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      await storage.markAllNotificationsAsRead(req.userId!);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to mark all notifications as read" });
    }
  });

  // Friends endpoints
  app.get("/api/friends", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const friends = await storage.getUserFriends(req.userId!);
      res.json(friends);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch friends" });
    }
  });

  app.get("/api/friends/requests", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const requests = await storage.getFriendRequests(req.userId!);
      res.json(requests);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch friend requests" });
    }
  });

  app.get("/api/friends/suggestions", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const suggestions = await storage.getFriendSuggestions(req.userId!);
      res.json(suggestions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch friend suggestions" });
    }
  });

  app.post("/api/friends/requests", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const { userId } = req.body;
      const result = await storage.sendFriendRequest(req.userId!, userId);
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ message: "Failed to send friend request" });
    }
  });

  app.post("/api/friends/requests/:id/accept", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const requestId = parseInt(req.params.id);
      await storage.acceptFriendRequest(requestId);
      res.json({ accepted: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to accept friend request" });
    }
  });

  app.delete("/api/friends/requests/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const requestId = parseInt(req.params.id);
      await storage.declineFriendRequest(requestId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to decline friend request" });
    }
  });

  app.post("/api/friends/request/:userId", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const receiverId = parseInt(req.params.userId);
      const result = await storage.sendFriendRequest(req.userId!, receiverId);
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ message: "Failed to send friend request" });
    }
  });

  app.post("/api/friends/requests/:id/reject", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const requestId = parseInt(req.params.id);
      await storage.declineFriendRequest(requestId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to reject friend request" });
    }
  });

  app.delete("/api/friends/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const friendId = parseInt(req.params.id);
      await storage.removeFriend(req.userId!, friendId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to remove friend" });
    }
  });

  app.get("/api/friends/mutual/:userId", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const mutualFriends = await storage.getMutualFriends(req.userId!, userId);
      res.json(mutualFriends);
    } catch (error) {
      console.error("[GET /api/friends/mutual/:userId] Error:", error);
      res.status(500).json({ message: "Failed to fetch mutual friends" });
    }
  });

  app.get("/api/friends/friendship/:friendId/stats", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const friendId = parseInt(req.params.friendId);
      const stats = await storage.getFriendshipStats(req.userId!, friendId);
      
      if (!stats) {
        return res.status(404).json({ message: "Friendship not found" });
      }
      
      res.json(stats);
    } catch (error) {
      console.error("[GET /api/friends/friendship/:friendId/stats] Error:", error);
      res.status(500).json({ message: "Failed to fetch friendship stats" });
    }
  });

  app.patch("/api/notifications/:id/read", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const notificationId = parseInt(req.params.id);
      await storage.markNotificationAsRead(notificationId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  app.post("/api/notifications/mark-all-read", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      await storage.markAllNotificationsAsRead(req.userId!);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to mark all notifications as read" });
    }
  });

  app.delete("/api/notifications/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const notificationId = parseInt(req.params.id);
      await storage.deleteNotification(notificationId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete notification" });
    }
  });

  app.post("/api/communities/auto-join", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const { cityName, country } = req.body;
      
      let community = await storage.getCommunityByCity(cityName);
      
      if (!community) {
        // Import cityscape system
        const { assignCityscapeToCommunity } = await import('./algorithms/cityCityscape');
        const cityscapeData = assignCityscapeToCommunity(cityName);
        
        community = await storage.createCommunity({
          name: `${cityName} Tango Community`,
          cityName,
          country,
          description: `Connect with tango dancers in ${cityName}`,
          ...cityscapeData
        });
      }
      
      const existingMembership = await storage.getCommunityMembership(community.id, req.userId!);
      if (!existingMembership) {
        await storage.joinCommunity(community.id, req.userId!);
      }
      
      res.json(community);
    } catch (error) {
      console.error("Auto-join community error:", error);
      res.status(500).json({ message: "Failed to join community" });
    }
  });

  app.post("/api/users/me/photo", authenticateToken, async (req: any, res: Response) => {
    try {
      res.json({ imageUrl: "https://via.placeholder.com/400" });
    } catch (error) {
      res.status(500).json({ message: "Photo upload failed" });
    }
  });

  // Search endpoint
  app.get("/api/search", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const query = req.query.q as string || "";
      if (query.length < 2) {
        return res.json([]);
      }
      const results = await storage.search(query, req.userId!);
      res.json(results);
    } catch (error) {
      res.status(500).json({ message: "Search failed" });
    }
  });

  // Admin endpoints
  app.get("/api/admin/stats", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch admin stats" });
    }
  });

  app.get("/api/admin/moderation-queue", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const queue = await storage.getModerationQueue();
      res.json(queue);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch moderation queue" });
    }
  });

  app.get("/api/admin/activity", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const activity = await storage.getRecentAdminActivity();
      res.json(activity);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch activity" });
    }
  });

  // ============================================================================
  // TRACK 6: NEW API ROUTES FOR 8 PAGES
  // ============================================================================

  // 1. MEMORIES API (GET, POST)
  // Uses media table for personal memories
  app.get("/api/memories", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const { limit = "20", offset = "0", filter = "all" } = req.query;
      const userId = req.userId!;
      
      let params: any = {
        type: filter === "all" ? undefined : filter === "photos" ? "image" : filter,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string)
      };
      
      const memories = await storage.getUserMedia(userId, params);
      res.json({ memories, total: memories.length });
    } catch (error) {
      console.error("Get memories error:", error);
      res.status(500).json({ message: "Failed to fetch memories" });
    }
  });

  app.post("/api/memories", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const memory = await storage.createMedia({
        ...req.body,
        userId: req.userId!
      });
      res.status(201).json(memory);
    } catch (error) {
      console.error("Create memory error:", error);
      res.status(500).json({ message: "Failed to create memory" });
    }
  });

  // 2. RECOMMENDATIONS API (GET)
  // Returns personalized recommendations based on user preferences
  app.get("/api/recommendations", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const { type = "events", limit = "10" } = req.query;
      const userId = req.userId!;
      
      let recommendations: any[] = [];
      const limitNum = parseInt(limit as string);
      
      // Use existing recommendation algorithms based on type
      switch (type) {
        case "events":
          const events = await storage.getEvents({ limit: limitNum, offset: 0 });
          recommendations = events.map(e => ({ ...e, recommendationType: "event" }));
          break;
        case "people":
          const suggestions = await storage.getFriendSuggestions(userId);
          recommendations = suggestions.slice(0, limitNum).map((s: any) => ({ ...s, recommendationType: "person" }));
          break;
        case "venues":
          const venues = await storage.getVenues({ limit: limitNum, offset: 0 });
          recommendations = venues.map(v => ({ ...v, recommendationType: "venue" }));
          break;
        case "content":
          const posts = await storage.getPosts({ limit: limitNum, offset: 0 });
          recommendations = posts.map(p => ({ ...p, recommendationType: "content" }));
          break;
        default:
          recommendations = [];
      }
      
      res.json({ recommendations, type, count: recommendations.length });
    } catch (error) {
      console.error("Get recommendations error:", error);
      res.status(500).json({ message: "Failed to fetch recommendations" });
    }
  });

  // 3. COMMUNITY MAP API (GET)
  // Returns global community data with city markers and member counts
  app.get("/api/community-map", async (req: Request, res: Response) => {
    try {
      const { region } = req.query;
      
      let communities: any[];
      if (region) {
        communities = await storage.searchCommunities(region as string, 100);
      } else {
        const groups = await storage.getGroups({ search: "", limit: 100, offset: 0 });
        communities = groups.filter((g: any) => g.groupType === "city");
      }
      
      // Get active events per city
      const events = await storage.getEvents({ limit: 100, offset: 0 });
      
      const communityData = communities.map(community => {
        const cityEvents = events.filter((e: any) => 
          e.city?.toLowerCase() === community.city?.toLowerCase()
        );
        
        return {
          id: community.id,
          name: community.name,
          city: community.city,
          country: community.country,
          memberCount: community.memberCount || 0,
          activeEvents: cityEvents.length,
          coverPhoto: community.coverPhoto,
          coordinates: {
            lat: 0, // Would need geocoding service
            lng: 0
          }
        };
      });
      
      res.json({ communities: communityData, total: communityData.length });
    } catch (error) {
      console.error("Get community map error:", error);
      res.status(500).json({ message: "Failed to fetch community map data" });
    }
  });

  // 4. INVITATIONS API (GET, POST, PUT)
  // For role invitations (e.g., admin, volunteer, team member invitations)
  app.get("/api/invitations", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.userId!;
      
      // Get friend requests as invitations (can be extended for role-based invitations)
      const invitations = await storage.getFriendRequests(userId);
      
      res.json({ invitations, total: invitations.length });
    } catch (error) {
      console.error("Get invitations error:", error);
      res.status(500).json({ message: "Failed to fetch invitations" });
    }
  });

  app.post("/api/invitations", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const { receiverId, message, invitationType = "friend" } = req.body;
      
      if (!receiverId) {
        return res.status(400).json({ message: "receiverId is required" });
      }
      
      const invitation = await storage.sendFriendRequest({
        senderId: req.userId!,
        receiverId,
        senderMessage: message || "",
        status: "pending"
      });
      
      res.status(201).json(invitation);
    } catch (error) {
      console.error("Create invitation error:", error);
      res.status(500).json({ message: "Failed to create invitation" });
    }
  });

  app.put("/api/invitations/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const invitationId = parseInt(req.params.id);
      const { action } = req.body; // "accept" or "decline"
      
      if (!action || !["accept", "decline"].includes(action)) {
        return res.status(400).json({ message: "action must be 'accept' or 'decline'" });
      }
      
      if (action === "accept") {
        await storage.acceptFriendRequest(invitationId);
      } else {
        await storage.declineFriendRequest(invitationId);
      }
      
      res.json({ message: `Invitation ${action}ed successfully` });
    } catch (error) {
      console.error("Update invitation error:", error);
      res.status(500).json({ message: "Failed to update invitation" });
    }
  });

  // 5. FAVORITES API (GET, POST, DELETE)
  // For bookmarked content (posts, events, people, venues)
  app.get("/api/favorites", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const { category = "all" } = req.query;
      const userId = req.userId!;
      
      // For now, returns saved posts (can be extended for other content types)
      const savedPostsData = await db
        .select({
          id: savedPosts.id,
          postId: savedPosts.postId,
          createdAt: savedPosts.createdAt,
          post: posts
        })
        .from(savedPosts)
        .leftJoin(posts, eq(savedPosts.postId, posts.id))
        .where(eq(savedPosts.userId, userId))
        .orderBy(desc(savedPosts.createdAt));
      
      const favorites = savedPostsData.map(sp => ({
        ...sp.post,
        favoriteId: sp.id,
        favoritedAt: sp.createdAt,
        category: "post"
      }));
      
      res.json({ favorites, total: favorites.length });
    } catch (error) {
      console.error("Get favorites error:", error);
      res.status(500).json({ message: "Failed to fetch favorites" });
    }
  });

  app.post("/api/favorites", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const { contentType, contentId } = req.body;
      
      if (!contentType || !contentId) {
        return res.status(400).json({ message: "contentType and contentId are required" });
      }
      
      // For posts
      if (contentType === "post") {
        await storage.savePost(contentId, req.userId!);
      }
      
      res.status(201).json({ message: "Added to favorites" });
    } catch (error) {
      console.error("Add favorite error:", error);
      res.status(500).json({ message: "Failed to add favorite" });
    }
  });

  app.delete("/api/favorites/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const favoriteId = parseInt(req.params.id);
      const { contentType = "post" } = req.query;
      
      if (contentType === "post") {
        // Get the saved post to find postId
        const savedPost = await db
          .select()
          .from(savedPosts)
          .where(and(eq(savedPosts.id, favoriteId), eq(savedPosts.userId, req.userId!)))
          .limit(1);
        
        if (savedPost[0]) {
          await storage.unsavePost(savedPost[0].postId, req.userId!);
        }
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Remove favorite error:", error);
      res.status(500).json({ message: "Failed to remove favorite" });
    }
  });

  // 6. ESA FRAMEWORK STATUS API (GET) - Admin only
  // Returns ESA framework overview with 105 agents, health metrics, certification levels
  app.get("/api/platform/esa", authenticateToken, requireRoleLevel(7), async (req: AuthRequest, res: Response) => {
    try {
      // Get all ESA agents
      const agents = await db
        .select()
        .from(esaAgents)
        .orderBy(esaAgents.agentCode);
      
      // Get agent health metrics
      const healthMetrics = await db
        .select()
        .from(agentHealth)
        .orderBy(desc(agentHealth.lastCheckAt));
      
      // Calculate summary metrics
      const totalAgents = agents.length;
      const certifiedAgents = agents.filter(a => a.certificationLevel && a.certificationLevel > 0).length;
      const activeAgents = agents.filter(a => a.status === "active").length;
      
      const healthByStatus = {
        healthy: healthMetrics.filter(h => h.status === "healthy").length,
        degraded: healthMetrics.filter(h => h.status === "degraded").length,
        failing: healthMetrics.filter(h => h.status === "failing").length,
        offline: healthMetrics.filter(h => h.status === "offline").length
      };
      
      res.json({
        framework: "ESA",
        totalAgents,
        activeAgents,
        certifiedAgents,
        healthMetrics: healthByStatus,
        agents: agents.map(a => ({
          agentCode: a.agentCode,
          agentName: a.agentName,
          agentType: a.agentType,
          status: a.status,
          certificationLevel: a.certificationLevel,
          tasksCompleted: a.tasksCompleted,
          lastActiveAt: a.lastActiveAt
        }))
      });
    } catch (error) {
      console.error("Get ESA framework error:", error);
      res.status(500).json({ message: "Failed to fetch ESA framework status" });
    }
  });

  // 7. ESA TASKS API (GET, POST, PUT) - Admin only
  app.get("/api/platform/esa/tasks", authenticateToken, requireRoleLevel(7), async (req: AuthRequest, res: Response) => {
    try {
      const { agentId, status, limit = "50" } = req.query;
      
      let query = db.select().from(agentTasks);
      const conditions = [];
      
      if (agentId) {
        conditions.push(eq(agentTasks.agentId, parseInt(agentId as string)));
      }
      if (status) {
        conditions.push(eq(agentTasks.status, status as string));
      }
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions)) as any;
      }
      
      const tasks = await query
        .orderBy(desc(agentTasks.createdAt))
        .limit(parseInt(limit as string));
      
      res.json({ tasks, total: tasks.length });
    } catch (error) {
      console.error("Get ESA tasks error:", error);
      res.status(500).json({ message: "Failed to fetch ESA tasks" });
    }
  });

  app.post("/api/platform/esa/tasks", authenticateToken, requireRoleLevel(7), async (req: AuthRequest, res: Response) => {
    try {
      const { agentId, taskType, title, description, priority = "medium" } = req.body;
      
      if (!agentId || !taskType || !title) {
        return res.status(400).json({ message: "agentId, taskType, and title are required" });
      }
      
      const task = await db.insert(agentTasks).values({
        agentId,
        taskType,
        title,
        description,
        priority,
        status: "pending"
      }).returning();
      
      res.status(201).json(task[0]);
    } catch (error) {
      console.error("Create ESA task error:", error);
      res.status(500).json({ message: "Failed to create ESA task" });
    }
  });

  app.put("/api/platform/esa/tasks/:id", authenticateToken, requireRoleLevel(7), async (req: AuthRequest, res: Response) => {
    try {
      const taskId = parseInt(req.params.id);
      const { status, result, errorMessage } = req.body;
      
      const updateData: any = { updatedAt: new Date() };
      if (status) updateData.status = status;
      if (result) updateData.result = result;
      if (errorMessage) updateData.errorMessage = errorMessage;
      
      if (status === "completed") {
        updateData.completedAt = new Date();
      }
      if (status === "in_progress" && !req.body.startedAt) {
        updateData.startedAt = new Date();
      }
      
      const task = await db
        .update(agentTasks)
        .set(updateData)
        .where(eq(agentTasks.id, taskId))
        .returning();
      
      if (!task[0]) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      res.json(task[0]);
    } catch (error) {
      console.error("Update ESA task error:", error);
      res.status(500).json({ message: "Failed to update ESA task" });
    }
  });

  // 8. ESA COMMUNICATIONS API (GET) - Admin only
  app.get("/api/platform/esa/communications", authenticateToken, requireRoleLevel(7), async (req: AuthRequest, res: Response) => {
    try {
      const { agentId, messageType, limit = "50" } = req.query;
      
      let query = db.select().from(agentCommunications);
      const conditions = [];
      
      if (agentId) {
        const agentIdNum = parseInt(agentId as string);
        conditions.push(
          or(
            eq(agentCommunications.fromAgentId, agentIdNum),
            eq(agentCommunications.toAgentId, agentIdNum)
          )!
        );
      }
      if (messageType) {
        conditions.push(eq(agentCommunications.communicationType, messageType as string));
      }
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions)) as any;
      }
      
      const communications = await query
        .orderBy(desc(agentCommunications.createdAt))
        .limit(parseInt(limit as string));
      
      res.json({ communications, total: communications.length });
    } catch (error) {
      console.error("Get ESA communications error:", error);
      res.status(500).json({ message: "Failed to fetch ESA communications" });
    }
  });

  app.use(errorHandler);

  const httpServer = createServer(app);

  wsNotificationService.initialize(httpServer);
  console.log("[WebSocket] Notification service initialized on /ws/notifications");

  // Initialize Realtime Voice WebSocket
  initRealtimeVoiceWebSocket(httpServer);
  console.log("[WebSocket] Realtime Voice service initialized on /ws/realtime");

  // ============================================================================
  // GROUPS - Additional routes (main routes are above around line 579)
  // ============================================================================

  // Get Group by ID
  app.get("/api/groups/:id", async (req: Request, res: Response) => {
    try {
      const group = await storage.getGroupById(parseInt(req.params.id));
      if (!group) return res.status(404).json({ message: "Group not found" });
      res.json(group);
    } catch (error) {
      console.error("Get group error:", error);
      res.status(500).json({ message: "Failed to fetch group" });
    }
  });

  // Search Groups
  app.get("/api/groups", async (req: Request, res: Response) => {
    try {
      const { search, limit, offset } = req.query;
      const groups = await storage.getGroups({
        search: search as string,
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined,
      });
      res.json(groups);
    } catch (error) {
      console.error("Search groups error:", error);
      res.status(500).json({ message: "Failed to search groups" });
    }
  });

  // Update Group
  app.put("/api/groups/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const group = await storage.updateGroup(parseInt(req.params.id), req.body);
      if (!group) return res.status(404).json({ message: "Group not found" });
      res.json(group);
    } catch (error) {
      console.error("Update group error:", error);
      res.status(500).json({ message: "Failed to update group" });
    }
  });

  // Delete Group
  app.delete("/api/groups/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      await storage.deleteGroup(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      console.error("Delete group error:", error);
      res.status(500).json({ message: "Failed to delete group" });
    }
  });

  // Get Suggested Groups
  app.get("/api/groups/suggested/for-user", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const { limit } = req.query;
      const groups = await storage.getSuggestedGroups(req.user!.id, limit ? parseInt(limit as string) : 10);
      res.json(groups);
    } catch (error) {
      console.error("Get suggested groups error:", error);
      res.status(500).json({ message: "Failed to fetch suggested groups" });
    }
  });

  // Join Group
  app.post("/api/groups/:id/join", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const member = await storage.joinGroup(parseInt(req.params.id), req.user!.id);
      res.status(201).json(member);
    } catch (error) {
      console.error("Join group error:", error);
      res.status(500).json({ message: "Failed to join group" });
    }
  });

  // Leave Group
  app.post("/api/groups/:id/leave", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      await storage.leaveGroup(parseInt(req.params.id), req.user!.id);
      res.status(204).send();
    } catch (error) {
      console.error("Leave group error:", error);
      res.status(500).json({ message: "Failed to leave group" });
    }
  });

  // Get Group Members
  app.get("/api/groups/:id/members", async (req: Request, res: Response) => {
    try {
      const members = await storage.getGroupMembers(parseInt(req.params.id));
      res.json(members);
    } catch (error) {
      console.error("Get group members error:", error);
      res.status(500).json({ message: "Failed to fetch group members" });
    }
  });

  // Update Group Member
  app.put("/api/groups/:groupId/members/:userId", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const member = await storage.updateGroupMember(
        parseInt(req.params.groupId),
        parseInt(req.params.userId),
        req.body
      );
      if (!member) return res.status(404).json({ message: "Member not found" });
      res.json(member);
    } catch (error) {
      console.error("Update group member error:", error);
      res.status(500).json({ message: "Failed to update member" });
    }
  });

  // Ban Group Member
  app.post("/api/groups/:groupId/members/:userId/ban", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      await storage.banGroupMember(parseInt(req.params.groupId), parseInt(req.params.userId));
      res.status(204).send();
    } catch (error) {
      console.error("Ban group member error:", error);
      res.status(500).json({ message: "Failed to ban member" });
    }
  });

  // Send Group Invite
  app.post("/api/groups/:id/invites", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const invite = await storage.sendGroupInvite({
        groupId: parseInt(req.params.id),
        inviterId: req.user!.id,
        inviteeId: req.body.inviteeId,
        message: req.body.message,
      });
      res.status(201).json(invite);
    } catch (error) {
      console.error("Send group invite error:", error);
      res.status(500).json({ message: "Failed to send invite" });
    }
  });

  // Get User's Group Invites
  app.get("/api/groups/invites/my-invites", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const invites = await storage.getUserGroupInvites(req.user!.id);
      res.json(invites);
    } catch (error) {
      console.error("Get group invites error:", error);
      res.status(500).json({ message: "Failed to fetch invites" });
    }
  });

  // Accept Group Invite
  app.post("/api/groups/invites/:id/accept", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      await storage.acceptGroupInvite(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      console.error("Accept group invite error:", error);
      res.status(500).json({ message: "Failed to accept invite" });
    }
  });

  // Decline Group Invite
  app.post("/api/groups/invites/:id/decline", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      await storage.declineGroupInvite(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      console.error("Decline group invite error:", error);
      res.status(500).json({ message: "Failed to decline invite" });
    }
  });

  // Create Group Post
  app.post("/api/groups/:id/posts", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const post = await storage.createGroupPost({
        groupId: parseInt(req.params.id),
        authorId: req.user!.id,
        ...req.body,
      });
      res.status(201).json(post);
    } catch (error) {
      console.error("Create group post error:", error);
      res.status(500).json({ message: "Failed to create post" });
    }
  });

  // Get Group Posts
  app.get("/api/groups/:id/posts", async (req: Request, res: Response) => {
    try {
      const { limit, offset } = req.query;
      const posts = await storage.getGroupPosts(parseInt(req.params.id), {
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined,
      });
      res.json(posts);
    } catch (error) {
      console.error("Get group posts error:", error);
      res.status(500).json({ message: "Failed to fetch posts" });
    }
  });

  // Update Group Post
  app.put("/api/groups/posts/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const post = await storage.updateGroupPost(parseInt(req.params.id), req.body);
      if (!post) return res.status(404).json({ message: "Post not found" });
      res.json(post);
    } catch (error) {
      console.error("Update group post error:", error);
      res.status(500).json({ message: "Failed to update post" });
    }
  });

  // Delete Group Post
  app.delete("/api/groups/posts/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      await storage.deleteGroupPost(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      console.error("Delete group post error:", error);
      res.status(500).json({ message: "Failed to delete post" });
    }
  });

  // Pin Group Post
  app.post("/api/groups/posts/:id/pin", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      await storage.pinGroupPost(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      console.error("Pin group post error:", error);
      res.status(500).json({ message: "Failed to pin post" });
    }
  });

  // Unpin Group Post
  app.post("/api/groups/posts/:id/unpin", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      await storage.unpinGroupPost(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      console.error("Unpin group post error:", error);
      res.status(500).json({ message: "Failed to unpin post" });
    }
  });

  // Approve Group Post
  app.post("/api/groups/posts/:id/approve", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      await storage.approveGroupPost(parseInt(req.params.id), req.user!.id);
      res.status(204).send();
    } catch (error) {
      console.error("Approve group post error:", error);
      res.status(500).json({ message: "Failed to approve post" });
    }
  });

  // Get Group Categories
  app.get("/api/groups/categories", async (req: Request, res: Response) => {
    try {
      const categories = await storage.getGroupCategories();
      res.json(categories);
    } catch (error) {
      console.error("Get group categories error:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Create Group Category
  app.post("/api/groups/categories", authenticateToken, requireRoleLevel(7), async (req: AuthRequest, res: Response) => {
    try {
      const category = await storage.createGroupCategory(req.body);
      res.status(201).json(category);
    } catch (error) {
      console.error("Create group category error:", error);
      res.status(500).json({ message: "Failed to create category" });
    }
  });

  // Assign Category to Group
  app.post("/api/groups/:groupId/categories/:categoryId", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      await storage.assignGroupCategory(parseInt(req.params.groupId), parseInt(req.params.categoryId));
      res.status(204).send();
    } catch (error) {
      console.error("Assign group category error:", error);
      res.status(500).json({ message: "Failed to assign category" });
    }
  });

  // Remove Category from Group
  app.delete("/api/groups/:groupId/categories/:categoryId", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      await storage.removeGroupCategory(parseInt(req.params.groupId), parseInt(req.params.categoryId));
      res.status(204).send();
    } catch (error) {
      console.error("Remove group category error:", error);
      res.status(500).json({ message: "Failed to remove category" });
    }
  });

  // Get Groups by Category
  app.get("/api/groups/categories/:id/groups", async (req: Request, res: Response) => {
    try {
      const groups = await storage.getGroupsByCategory(parseInt(req.params.id));
      res.json(groups);
    } catch (error) {
      console.error("Get groups by category error:", error);
      res.status(500).json({ message: "Failed to fetch groups" });
    }
  });

  // ============================================================================
  // EVENTS - COMPREHENSIVE API ROUTES
  // ============================================================================

  // Search Events (Enhanced)
  app.get("/api/events/search", async (req: Request, res: Response) => {
    try {
      const { query, eventType, city, startDate, endDate, musicStyle, limit, offset } = req.query;
      const events = await storage.searchEvents({
        query: query as string,
        eventType: eventType as string,
        city: city as string,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        musicStyle: musicStyle as string,
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined,
      });
      res.json(events);
    } catch (error) {
      console.error("Search events error:", error);
      res.status(500).json({ message: "Failed to search events" });
    }
  });

  // Update Event
  app.put("/api/events/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const event = await storage.updateEvent(parseInt(req.params.id), req.body);
      if (!event) return res.status(404).json({ message: "Event not found" });
      res.json(event);
    } catch (error) {
      console.error("Update event error:", error);
      res.status(500).json({ message: "Failed to update event" });
    }
  });

  // Delete Event
  app.delete("/api/events/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      await storage.deleteEvent(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      console.error("Delete event error:", error);
      res.status(500).json({ message: "Failed to delete event" });
    }
  });

  // Check-in Event Attendee
  app.post("/api/events/:eventId/rsvps/:userId/check-in", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const rsvp = await storage.checkInEventAttendee(parseInt(req.params.eventId), parseInt(req.params.userId));
      if (!rsvp) return res.status(404).json({ message: "RSVP not found" });
      res.json(rsvp);
    } catch (error) {
      console.error("Check-in attendee error:", error);
      res.status(500).json({ message: "Failed to check-in attendee" });
    }
  });

  // Add to Waitlist
  app.post("/api/events/:id/waitlist", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const rsvp = await storage.addToWaitlist(parseInt(req.params.id), req.user!.id, req.body.guestCount);
      res.status(201).json(rsvp);
    } catch (error) {
      console.error("Add to waitlist error:", error);
      res.status(500).json({ message: "Failed to add to waitlist" });
    }
  });

  // Get Event Waitlist
  app.get("/api/events/:id/waitlist", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const waitlist = await storage.getEventWaitlist(parseInt(req.params.id));
      res.json(waitlist);
    } catch (error) {
      console.error("Get waitlist error:", error);
      res.status(500).json({ message: "Failed to fetch waitlist" });
    }
  });

  // Upload Event Photo
  app.post("/api/events/:id/photos", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const photo = await storage.uploadEventPhoto({
        eventId: parseInt(req.params.id),
        uploaderId: req.user!.id,
        ...req.body,
      });
      res.status(201).json(photo);
    } catch (error) {
      console.error("Upload event photo error:", error);
      res.status(500).json({ message: "Failed to upload photo" });
    }
  });

  // Get Event Photos
  app.get("/api/events/:id/photos", async (req: Request, res: Response) => {
    try {
      const photos = await storage.getEventPhotos(parseInt(req.params.id));
      res.json(photos);
    } catch (error) {
      console.error("Get event photos error:", error);
      res.status(500).json({ message: "Failed to fetch photos" });
    }
  });

  // Delete Event Photo
  app.delete("/api/events/photos/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      await storage.deleteEventPhoto(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      console.error("Delete event photo error:", error);
      res.status(500).json({ message: "Failed to delete photo" });
    }
  });

  // Feature Event Photo
  app.post("/api/events/photos/:id/feature", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      await storage.featureEventPhoto(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      console.error("Feature event photo error:", error);
      res.status(500).json({ message: "Failed to feature photo" });
    }
  });

  // Unfeature Event Photo
  app.post("/api/events/photos/:id/unfeature", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      await storage.unfeatureEventPhoto(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      console.error("Unfeature event photo error:", error);
      res.status(500).json({ message: "Failed to unfeature photo" });
    }
  });

  // Create Event Comment
  app.post("/api/events/:id/comments", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const comment = await storage.createEventComment({
        eventId: parseInt(req.params.id),
        userId: req.user!.id,
        content: req.body.content,
        parentCommentId: req.body.parentCommentId,
      });
      res.status(201).json(comment);
    } catch (error) {
      console.error("Create event comment error:", error);
      res.status(500).json({ message: "Failed to create comment" });
    }
  });

  // Get Event Comments
  app.get("/api/events/:id/comments", async (req: Request, res: Response) => {
    try {
      const comments = await storage.getEventComments(parseInt(req.params.id));
      res.json(comments);
    } catch (error) {
      console.error("Get event comments error:", error);
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  // Update Event Comment
  app.put("/api/events/comments/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const comment = await storage.updateEventComment(parseInt(req.params.id), req.body.content);
      if (!comment) return res.status(404).json({ message: "Comment not found" });
      res.json(comment);
    } catch (error) {
      console.error("Update event comment error:", error);
      res.status(500).json({ message: "Failed to update comment" });
    }
  });

  // Delete Event Comment
  app.delete("/api/events/comments/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      await storage.deleteEventComment(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      console.error("Delete event comment error:", error);
      res.status(500).json({ message: "Failed to delete comment" });
    }
  });

  // Create Event Reminder
  app.post("/api/events/rsvps/:rsvpId/reminders", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const reminder = await storage.createEventReminder({
        rsvpId: parseInt(req.params.rsvpId),
        ...req.body,
      });
      res.status(201).json(reminder);
    } catch (error) {
      console.error("Create event reminder error:", error);
      res.status(500).json({ message: "Failed to create reminder" });
    }
  });

  // Get Event Reminders
  app.get("/api/events/rsvps/:rsvpId/reminders", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const reminders = await storage.getEventReminders(parseInt(req.params.rsvpId));
      res.json(reminders);
    } catch (error) {
      console.error("Get event reminders error:", error);
      res.status(500).json({ message: "Failed to fetch reminders" });
    }
  });

  // ============================================================================
  // HOUSING SYSTEM ROUTES (Wave 8D)
  // ============================================================================

  // Get Housing Listings (with filtering)
  app.get("/api/housing/listings", async (req: Request, res: Response) => {
    try {
      const params = {
        city: req.query.city as string,
        country: req.query.country as string,
        hostId: req.query.hostId ? parseInt(req.query.hostId as string) : undefined,
        status: req.query.status as string,
        propertyTypes: req.query.propertyTypes ? JSON.parse(req.query.propertyTypes as string) : undefined,
        minPrice: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
        maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
        bedrooms: req.query.bedrooms ? parseInt(req.query.bedrooms as string) : undefined,
        bathrooms: req.query.bathrooms ? parseInt(req.query.bathrooms as string) : undefined,
        maxGuests: req.query.maxGuests ? parseInt(req.query.maxGuests as string) : undefined,
        amenities: req.query.amenities ? JSON.parse(req.query.amenities as string) : undefined,
        friendsOnly: req.query.friendsOnly === 'true',
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
        offset: req.query.offset ? parseInt(req.query.offset as string) : 0,
      };
      
      const listings = await storage.getHousingListings(params);
      res.json(listings);
    } catch (error) {
      console.error("Get housing listings error:", error);
      res.status(500).json({ message: "Failed to fetch housing listings" });
    }
  });

  // Get Housing Listing by ID
  app.get("/api/housing/listings/:id", async (req: Request, res: Response) => {
    try {
      const listing = await storage.getHousingListingById(parseInt(req.params.id));
      if (!listing) {
        return res.status(404).json({ message: "Housing listing not found" });
      }
      res.json(listing);
    } catch (error) {
      console.error("Get housing listing error:", error);
      res.status(500).json({ message: "Failed to fetch housing listing" });
    }
  });

  // Create Housing Listing
  app.post("/api/housing/listings", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const listing = await storage.createHousingListing({
        hostId: req.user!.id,
        ...req.body,
      });
      res.status(201).json(listing);
    } catch (error) {
      console.error("Create housing listing error:", error);
      res.status(500).json({ message: "Failed to create housing listing" });
    }
  });

  // Update Housing Listing
  app.put("/api/housing/listings/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const listing = await storage.updateHousingListing(parseInt(req.params.id), req.body);
      if (!listing) {
        return res.status(404).json({ message: "Housing listing not found" });
      }
      res.json(listing);
    } catch (error) {
      console.error("Update housing listing error:", error);
      res.status(500).json({ message: "Failed to update housing listing" });
    }
  });

  // Delete Housing Listing
  app.delete("/api/housing/listings/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      await storage.deleteHousingListing(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      console.error("Delete housing listing error:", error);
      res.status(500).json({ message: "Failed to delete housing listing" });
    }
  });

  // Get Housing Bookings
  app.get("/api/housing/bookings", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const params = {
        listingId: req.query.listingId ? parseInt(req.query.listingId as string) : undefined,
        guestId: req.query.guestId ? parseInt(req.query.guestId as string) : undefined,
        status: req.query.status as string,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
        offset: req.query.offset ? parseInt(req.query.offset as string) : 0,
      };
      
      const bookings = await storage.getHousingBookings(params);
      res.json(bookings);
    } catch (error) {
      console.error("Get housing bookings error:", error);
      res.status(500).json({ message: "Failed to fetch housing bookings" });
    }
  });

  // Create Housing Booking
  app.post("/api/housing/bookings", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const booking = await storage.createHousingBooking({
        guestId: req.user!.id,
        ...req.body,
      });
      res.status(201).json(booking);
    } catch (error) {
      console.error("Create housing booking error:", error);
      res.status(500).json({ message: "Failed to create housing booking" });
    }
  });

  // Update Housing Booking
  app.put("/api/housing/bookings/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const booking = await storage.updateHousingBooking(parseInt(req.params.id), req.body);
      if (!booking) {
        return res.status(404).json({ message: "Housing booking not found" });
      }
      res.json(booking);
    } catch (error) {
      console.error("Update housing booking error:", error);
      res.status(500).json({ message: "Failed to update housing booking" });
    }
  });

  // Delete Housing Booking
  app.delete("/api/housing/bookings/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      await storage.deleteHousingBooking(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      console.error("Delete housing booking error:", error);
      res.status(500).json({ message: "Failed to delete housing booking" });
    }
  });

  // ============================================================================
  // PHASE H: COMMUNITY MAP, TRAVEL PLANNER, CONTACT FORM (10 endpoints)
  // ============================================================================

  // 1. GET /api/community/locations - Get all community locations with stats
  app.get("/api/community/locations", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const locations = await db.select({
        id: users.id,
        city: users.city,
        country: users.country,
        memberCount: sql<number>`count(distinct ${users.id})::int`,
        activeEvents: sql<number>`count(distinct ${events.id})::int`,
        venues: sql<number>`0`,
        isActive: sql<boolean>`true`,
      })
      .from(users)
      .leftJoin(events, eq(events.userId, users.id))
      .where(and(
        isNotNull(users.city),
        isNotNull(users.country),
        eq(users.isActive, true)
      ))
      .groupBy(users.city, users.country, users.id);

      const groupedLocations = locations.reduce((acc: any[], loc) => {
        const key = `${loc.city}-${loc.country}`;
        const existing = acc.find(l => `${l.city}-${l.country}` === key);
        if (existing) {
          existing.memberCount += 1;
          existing.activeEvents += loc.activeEvents;
        } else {
          acc.push({
            id: loc.id,
            city: loc.city,
            country: loc.country,
            coordinates: { lat: 0, lng: 0 },
            memberCount: 1,
            activeEvents: loc.activeEvents,
            venues: 0,
            isActive: true
          });
        }
        return acc;
      }, []);

      res.json(groupedLocations);
    } catch (error) {
      console.error("Get community locations error:", error);
      res.status(500).json({ message: "Failed to fetch community locations" });
    }
  });

  // 2. GET /api/community/stats - Get global community statistics
  app.get("/api/community/stats", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const stats = await db.select({
        totalMembers: sql<number>`count(distinct ${users.id})::int`,
        countries: sql<number>`count(distinct ${users.country})::int`,
        cities: sql<number>`count(distinct ${users.city})::int`,
        activeEvents: sql<number>`count(distinct ${events.id})::int`,
      })
      .from(users)
      .leftJoin(events, eq(events.userId, users.id))
      .where(eq(users.isActive, true));

      res.json({
        totalCities: stats[0]?.cities || 0,
        countries: stats[0]?.countries || 0,
        totalMembers: stats[0]?.totalMembers || 0,
        activeEvents: stats[0]?.activeEvents || 0,
        totalVenues: 0
      });
    } catch (error) {
      console.error("Get community stats error:", error);
      res.status(500).json({ message: "Failed to fetch community stats" });
    }
  });

  // 3. GET /api/travel/trips - Get user's travel plans
  app.get("/api/travel/trips", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const trips = await db.select()
        .from(travelPlans)
        .where(eq(travelPlans.userId, req.user!.id))
        .orderBy(desc(travelPlans.createdAt));
      res.json(trips);
    } catch (error) {
      console.error("Get travel trips error:", error);
      res.status(500).json({ message: "Failed to fetch travel trips" });
    }
  });

  // 4. POST /api/travel/trips - Create new travel plan
  app.post("/api/travel/trips", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const { city, country, startDate, endDate, tripDuration, budget, interests, travelStyle, status, notes } = req.body;
      
      if (!city || !startDate || !endDate || !tripDuration) {
        return res.status(400).json({ message: "Missing required fields: city, startDate, endDate, tripDuration" });
      }

      const [trip] = await db.insert(travelPlans)
        .values({
          userId: req.user!.id,
          city,
          country: country || "",
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          tripDuration,
          budget: budget || "",
          interests: interests || [],
          travelStyle: travelStyle || "",
          status: status || "planning",
          notes: notes || ""
        })
        .returning();
      res.status(201).json(trip);
    } catch (error) {
      console.error("Create travel trip error:", error);
      res.status(500).json({ message: "Failed to create travel trip" });
    }
  });

  // 5. GET /api/travel/trips/:id - Get travel plan details
  app.get("/api/travel/trips/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const [trip] = await db.select()
        .from(travelPlans)
        .where(and(
          eq(travelPlans.id, parseInt(req.params.id)),
          eq(travelPlans.userId, req.user!.id)
        ));

      if (!trip) {
        return res.status(404).json({ message: "Travel trip not found" });
      }

      const items = await db.select()
        .from(travelPlanItems)
        .where(eq(travelPlanItems.travelPlanId, trip.id));

      res.json({ ...trip, items });
    } catch (error) {
      console.error("Get travel trip details error:", error);
      res.status(500).json({ message: "Failed to fetch travel trip details" });
    }
  });

  // 6. PATCH /api/travel/trips/:id - Update travel plan
  app.patch("/api/travel/trips/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const [trip] = await db.update(travelPlans)
        .set({ ...req.body, updatedAt: new Date() })
        .where(and(
          eq(travelPlans.id, parseInt(req.params.id)),
          eq(travelPlans.userId, req.user!.id)
        ))
        .returning();

      if (!trip) {
        return res.status(404).json({ message: "Travel trip not found" });
      }

      res.json(trip);
    } catch (error) {
      console.error("Update travel trip error:", error);
      res.status(500).json({ message: "Failed to update travel trip" });
    }
  });

  // 7. DELETE /api/travel/trips/:id - Delete travel plan
  app.delete("/api/travel/trips/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      await db.delete(travelPlans)
        .where(and(
          eq(travelPlans.id, parseInt(req.params.id)),
          eq(travelPlans.userId, req.user!.id)
        ));
      res.status(204).send();
    } catch (error) {
      console.error("Delete travel trip error:", error);
      res.status(500).json({ message: "Failed to delete travel trip" });
    }
  });

  // 8. GET /api/travel/destinations - Get suggested destinations (mock data for now)
  app.get("/api/travel/destinations", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const destinations = [
        { id: 1, name: "Buenos Aires, Argentina", description: "The birthplace of tango", image: "", popularity: 95 },
        { id: 2, name: "Montevideo, Uruguay", description: "Traditional milongas and festivals", image: "", popularity: 85 },
        { id: 3, name: "Paris, France", description: "European tango capital", image: "", popularity: 80 },
        { id: 4, name: "Istanbul, Turkey", description: "Growing tango scene", image: "", popularity: 70 },
        { id: 5, name: "Barcelona, Spain", description: "Vibrant tango community", image: "", popularity: 75 }
      ];
      res.json(destinations);
    } catch (error) {
      console.error("Get destinations error:", error);
      res.status(500).json({ message: "Failed to fetch destinations" });
    }
  });

  // 9. GET /api/travel/packages - Get travel packages based on events
  app.get("/api/travel/packages", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const packages = await db.select({
        id: events.id,
        title: events.title,
        location: events.location,
        startDate: events.startDate,
        endDate: events.endDate,
        description: events.description,
        price: events.price,
        category: events.category
      })
      .from(events)
      .where(and(
        eq(events.eventType, "festival"),
        gte(events.startDate, new Date())
      ))
      .orderBy(events.startDate)
      .limit(10);

      res.json(packages);
    } catch (error) {
      console.error("Get travel packages error:", error);
      res.status(500).json({ message: "Failed to fetch travel packages" });
    }
  });

  // 10. POST /api/contact - Submit contact form
  app.post("/api/contact", async (req: Request, res: Response) => {
    try {
      const validation = insertContactSubmissionSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid contact form data", errors: validation.error });
      }

      const [submission] = await db.insert(contactSubmissions)
        .values(validation.data)
        .returning();

      res.status(201).json({ 
        message: "Contact form submitted successfully", 
        id: submission.id 
      });
    } catch (error) {
      console.error("Submit contact form error:", error);
      res.status(500).json({ message: "Failed to submit contact form" });
    }
  });

  return httpServer;
}
