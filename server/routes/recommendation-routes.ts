/**
 * RECOMMENDATION ROUTES
 * MB.MD v8.0 - WEEK 9 DAY 3
 * 
 * API endpoints for AI-powered recommendations
 */

import { Router, type Response } from "express";
import { authenticateToken, AuthRequest } from "../middleware/auth";
import { RecommendationEngine } from "../services/RecommendationEngine";
import { db } from "@shared/db";
import { users, events, teachers, posts } from "@shared/schema";
import { eq, inArray } from "drizzle-orm";
import logger from "../middleware/logger";

const router = Router();

/**
 * GET /api/recommendations
 * Get all personalized recommendations (combined) with full entity data
 */
router.get("/", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const limit = parseInt(req.query.limit as string) || 5;

    const [friendRecs, eventRecs, teacherRecs, contentRecs] = await Promise.all([
      RecommendationEngine.recommendFriends(userId, limit),
      RecommendationEngine.recommendEvents(userId, limit),
      RecommendationEngine.recommendTeachers(userId, limit),
      RecommendationEngine.recommendContent(userId, limit),
    ]);

    // Fetch full entity data for each recommendation type
    const friendIds = friendRecs.map(r => r.id);
    const eventIds = eventRecs.map(r => r.id);
    const teacherIds = teacherRecs.map(r => r.id);
    const contentIds = contentRecs.map(r => r.id);

    const [friendUsers, eventData, teacherData, contentData] = await Promise.all([
      friendIds.length > 0 ? db.select({
        id: users.id,
        name: users.name,
        username: users.username,
        profileImage: users.profileImage,
        city: users.city,
        country: users.country,
        bio: users.bio
      }).from(users).where(inArray(users.id, friendIds)) : [],
      
      eventIds.length > 0 ? db.select({
        id: events.id,
        title: events.title,
        description: events.description,
        imageUrl: events.imageUrl,
        city: events.city,
        country: events.country,
        startDate: events.startDate,
        eventType: events.eventType
      }).from(events).where(inArray(events.id, eventIds)) : [],
      
      teacherIds.length > 0 ? db.select({
        id: teachers.id,
        name: teachers.name,
        bio: teachers.bio,
        profileImage: teachers.profileImage,
        city: teachers.city,
        country: teachers.country,
        specialties: teachers.specialties
      }).from(teachers).where(inArray(teachers.id, teacherIds)) : [],
      
      contentIds.length > 0 ? db.select({
        id: posts.id,
        content: posts.content,
        mediaUrls: posts.mediaUrls,
        userId: posts.userId,
        likesCount: posts.likesCount
      }).from(posts).where(inArray(posts.id, contentIds)) : []
    ]);

    // Get authors for content posts
    const authorIds = contentData.map(p => p.userId);
    const authors = authorIds.length > 0 ? await db.select({
      id: users.id,
      name: users.name,
      profileImage: users.profileImage
    }).from(users).where(inArray(users.id, authorIds)) : [];

    // Build complete recommendations with full data
    const recommendations = [
      ...friendRecs.map(rec => {
        const user = friendUsers.find(u => u.id === rec.id);
        return {
          id: rec.id,
          type: 'person' as const,
          title: user?.name || 'Unknown User',
          description: user?.bio || `Tango dancer from ${user?.city || 'somewhere beautiful'}`,
          imageUrl: user?.profileImage,
          score: rec.score,
          reason: rec.reasons?.[0] || 'Similar dance interests',
          metadata: {
            location: user?.city && user?.country ? `${user.city}, ${user.country}` : undefined,
            username: user?.username
          }
        };
      }),
      ...eventRecs.map(rec => {
        const event = eventData.find(e => e.id === rec.id);
        return {
          id: rec.id,
          type: 'event' as const,
          title: event?.title || 'Tango Event',
          description: event?.description?.substring(0, 200) || 'Join this exciting tango event',
          imageUrl: event?.imageUrl,
          score: rec.score,
          reason: rec.reasons?.[0] || 'Matches your interests',
          metadata: {
            location: event?.city && event?.country ? `${event.city}, ${event.country}` : undefined,
            date: event?.startDate ? new Date(event.startDate).toLocaleDateString() : undefined,
            eventType: event?.eventType
          }
        };
      }),
      ...teacherRecs.map(rec => {
        const teacher = teacherData.find(t => t.id === rec.id);
        return {
          id: rec.id,
          type: 'person' as const,
          title: teacher?.name || 'Tango Teacher',
          description: teacher?.bio?.substring(0, 200) || `Professional tango instructor from ${teacher?.city || 'the community'}`,
          imageUrl: teacher?.profileImage,
          score: rec.score,
          reason: rec.reasons?.[0] || 'Recommended teacher for your level',
          metadata: {
            location: teacher?.city && teacher?.country ? `${teacher.city}, ${teacher.country}` : undefined,
            specialties: teacher?.specialties?.join(', ')
          }
        };
      }),
      ...contentRecs.map(rec => {
        const post = contentData.find(p => p.id === rec.id);
        const author = authors.find(a => a.id === post?.userId);
        return {
          id: rec.id,
          type: 'content' as const,
          title: author?.name ? `Post by ${author.name}` : 'Community Post',
          description: post?.content?.substring(0, 200) || 'Check out this tango content',
          imageUrl: post?.mediaUrls?.[0] || author?.profileImage,
          score: rec.score,
          reason: rec.reasons?.[0] || 'Popular in your network',
          metadata: {
            followers: post?.likesCount || 0,
            authorName: author?.name
          }
        };
      }),
    ].sort((a, b) => b.score - a.score);

    res.json(recommendations);
  } catch (error) {
    console.error("[Recommendations] Combined recommendation error:", error);
    res.status(500).json({ message: "Failed to get recommendations" });
  }
});

/**
 * GET /api/recommendations/stats
 * Get recommendation statistics
 */
router.get("/stats", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const [friendRecs, eventRecs] = await Promise.all([
      RecommendationEngine.recommendFriends(userId, 100),
      RecommendationEngine.recommendEvents(userId, 100),
    ]);

    const allScores = [...friendRecs.map(f => f.score), ...eventRecs.map(e => e.score)];
    const avgScore = allScores.length > 0 
      ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length) 
      : 0;

    res.json({
      newToday: Math.min(friendRecs.length + eventRecs.length, 15),
      avgScore,
      actedOn: 0,
      saved: 0
    });
  } catch (error) {
    console.error("[Recommendations] Stats error:", error);
    res.status(500).json({ message: "Failed to get recommendation stats" });
  }
});

/**
 * GET /api/recommendations/friends
 * Get personalized friend recommendations
 */
router.get("/friends", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const limit = parseInt(req.query.limit as string) || 10;

    const recommendations = await RecommendationEngine.recommendFriends(userId, limit);

    if (recommendations.length === 0) {
      return res.json([]);
    }

    // Fetch full user details for recommended IDs
    const recommendedIds = recommendations.map((r) => r.id);
    const recommendedUsers = await db
      .select({
        id: users.id,
        name: users.name,
        username: users.username,
        profileImage: users.profileImage,
        city: users.city,
        country: users.country,
        bio: users.bio,
        leaderLevel: users.leaderLevel,
        followerLevel: users.followerLevel,
        yearsOfDancing: users.yearsOfDancing
      })
      .from(users)
      .where(inArray(users.id, recommendedIds));

    // Merge scores with user details
    const results = recommendations.map((rec) => {
      const user = recommendedUsers.find((u) => u.id === rec.id);
      return {
        ...user,
        recommendationScore: rec.score,
        recommendationReasons: rec.reasons
      };
    });

    res.json(results);
  } catch (error) {
    console.error("[Recommendations] Friend recommendation error:", error);
    res.status(500).json({ message: "Failed to get friend recommendations" });
  }
});

/**
 * GET /api/recommendations/events
 * Get personalized event recommendations
 */
router.get("/events", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const limit = parseInt(req.query.limit as string) || 10;

    const recommendations = await RecommendationEngine.recommendEvents(userId, limit);

    if (recommendations.length === 0) {
      return res.json([]);
    }

    // Fetch full event details for recommended IDs
    const recommendedIds = recommendations.map((r) => r.id);
    const recommendedEvents = await db
      .select({
        id: events.id,
        title: events.title,
        slug: events.slug,
        description: events.description,
        eventType: events.eventType,
        startDate: events.startDate,
        endDate: events.endDate,
        location: events.location,
        city: events.city,
        country: events.country,
        imageUrl: events.imageUrl,
        isPaid: events.isPaid,
        price: events.price,
        currentAttendees: events.currentAttendees,
        maxAttendees: events.maxAttendees,
        danceStyles: events.danceStyles
      })
      .from(events)
      .where(inArray(events.id, recommendedIds));

    // Merge scores with event details
    const results = recommendations.map((rec) => {
      const event = recommendedEvents.find((e) => e.id === rec.id);
      return {
        ...event,
        recommendationScore: rec.score,
        recommendationReasons: rec.reasons
      };
    });

    res.json(results);
  } catch (error) {
    console.error("[Recommendations] Event recommendation error:", error);
    res.status(500).json({ message: "Failed to get event recommendations" });
  }
});

/**
 * GET /api/recommendations/teachers
 * Get personalized teacher recommendations
 */
router.get("/teachers", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const limit = parseInt(req.query.limit as string) || 10;

    const recommendations = await RecommendationEngine.recommendTeachers(userId, limit);

    if (recommendations.length === 0) {
      return res.json([]);
    }

    // Fetch full teacher details for recommended IDs
    const recommendedIds = recommendations.map((r) => r.id);
    const recommendedTeachers = await db
      .select({
        id: teachers.id,
        userId: teachers.userId,
        name: teachers.name,
        bio: teachers.bio,
        city: teachers.city,
        country: teachers.country,
        specialties: teachers.specialties,
        yearsTeaching: teachers.yearsTeaching,
        averageRating: teachers.averageRating,
        totalReviews: teachers.totalReviews,
        profileImage: teachers.profileImage,
        videoUrls: teachers.videoUrls
      })
      .from(teachers)
      .where(inArray(teachers.id, recommendedIds));

    // Merge scores with teacher details
    const results = recommendations.map((rec) => {
      const teacher = recommendedTeachers.find((t) => t.id === rec.id);
      return {
        ...teacher,
        recommendationScore: rec.score,
        recommendationReasons: rec.reasons
      };
    });

    res.json(results);
  } catch (error) {
    console.error("[Recommendations] Teacher recommendation error:", error);
    res.status(500).json({ message: "Failed to get teacher recommendations" });
  }
});

/**
 * GET /api/recommendations/content
 * Get personalized content/post recommendations
 */
router.get("/content", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const limit = parseInt(req.query.limit as string) || 20;

    const recommendations = await RecommendationEngine.recommendContent(userId, limit);

    if (recommendations.length === 0) {
      return res.json([]);
    }

    // Fetch full post details for recommended IDs
    const recommendedIds = recommendations.map((r) => r.id);
    const recommendedPosts = await db
      .select({
        id: posts.id,
        userId: posts.userId,
        content: posts.content,
        mediaUrls: posts.mediaUrls,
        groupId: posts.groupId,
        createdAt: posts.createdAt,
        likesCount: posts.likesCount,
        commentsCount: posts.commentsCount,
        sharesCount: posts.sharesCount,
        visibility: posts.visibility
      })
      .from(posts)
      .where(inArray(posts.id, recommendedIds));

    // Get user details for post authors
    const authorIds = recommendedPosts.map((p) => p.userId);
    const authors = await db
      .select({
        id: users.id,
        name: users.name,
        username: users.username,
        profileImage: users.profileImage
      })
      .from(users)
      .where(inArray(users.id, authorIds));

    // Merge scores with post details
    const results = recommendations.map((rec) => {
      const post = recommendedPosts.find((p) => p.id === rec.id);
      const author = authors.find((a) => a.id === post?.userId);
      return {
        ...post,
        author,
        recommendationScore: rec.score,
        recommendationReasons: rec.reasons
      };
    });

    res.json(results);
  } catch (error) {
    console.error("[Recommendations] Content recommendation error:", error);
    res.status(500).json({ message: "Failed to get content recommendations" });
  }
});

export default router;
