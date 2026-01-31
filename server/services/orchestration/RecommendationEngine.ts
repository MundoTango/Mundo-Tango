/**
 * RECOMMENDATION ENGINE
 * MB.MD v8.0 - WEEK 9 DAY 3
 * 
 * Comprehensive recommendation system using:
 * - Collaborative filtering (similar user behavior)
 * - Content-based filtering (user preferences)
 * - ML scoring with weighted factors
 * - Real-time data integration
 */

import { db } from "@shared/db";
import {
  users,
  friendships,
  events,
  eventRsvps,
  posts,
  follows,
  groups,
  groupMembers,
  teachers,
  reviews,
  userSkills,
  profileViews
} from "@shared/schema";
import { eq, and, desc, sql, inArray, ne, gte, or } from "drizzle-orm";

export interface RecommendationScore {
  id: number;
  score: number;
  reasons: string[];
}

export class RecommendationEngine {
  /**
   * FRIEND RECOMMENDATIONS
   * Factors:
   * - Mutual friends (40% weight)
   * - Similar dance level (20% weight)
   * - Same city/country (20% weight)
   * - Attended same events (15% weight)
   * - Similar interests (5% weight)
   */
  static async recommendFriends(
    userId: number,
    limit: number = 10
  ): Promise<RecommendationScore[]> {
    try {
      // Get user's profile
      const [userProfile] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!userProfile) {
        return [];
      }

      // Get existing friends (to exclude)
      const existingFriendships = await db
        .select({ friendId: friendships.friendId })
        .from(friendships)
        .where(
          and(
            eq(friendships.userId, userId),
            eq(friendships.status, "accepted")
          )
        );

      const existingFriendIds = existingFriendships.map((f) => f.friendId);
      const excludeIds = [...existingFriendIds, userId];

      // Get potential friends
      const candidates = await db
        .select({
          id: users.id,
          name: users.name,
          username: users.username,
          profileImage: users.profileImage,
          city: users.city,
          country: users.country,
          leaderLevel: users.leaderLevel,
          followerLevel: users.followerLevel,
          interests: users.interests
        })
        .from(users)
        .where(
          and(
            sql`${users.id} NOT IN (${sql.join(excludeIds, sql`, `)})`,
            eq(users.isActive, true)
          )
        )
        .limit(100);

      // Calculate mutual friends
      const mutualFriendsMap = new Map<number, number>();
      for (const candidate of candidates) {
        const mutualFriends = await db
          .select({ count: sql<number>`count(*)::int` })
          .from(friendships)
          .where(
            and(
              eq(friendships.userId, candidate.id),
              eq(friendships.status, "accepted"),
              sql`${friendships.friendId} IN (${sql.join(existingFriendIds, sql`, `)})`
            )
          );

        mutualFriendsMap.set(candidate.id, mutualFriends[0]?.count || 0);
      }

      // Get events attended by user
      const userEvents = await db
        .select({ eventId: eventRsvps.eventId })
        .from(eventRsvps)
        .where(
          and(
            eq(eventRsvps.userId, userId),
            eq(eventRsvps.status, "going")
          )
        );

      const userEventIds = userEvents.map((e) => e.eventId);

      // Calculate scores for each candidate
      const scoredCandidates: RecommendationScore[] = [];

      for (const candidate of candidates) {
        let score = 0;
        const reasons: string[] = [];

        // 1. Mutual friends (40% weight, max 40 points)
        const mutualCount = mutualFriendsMap.get(candidate.id) || 0;
        const mutualScore = Math.min(mutualCount * 8, 40);
        score += mutualScore;
        if (mutualCount > 0) {
          reasons.push(`${mutualCount} mutual friend${mutualCount > 1 ? "s" : ""}`);
        }

        // 2. Similar dance level (20% weight, max 20 points)
        const avgUserLevel = (userProfile.leaderLevel + userProfile.followerLevel) / 2;
        const avgCandidateLevel = (candidate.leaderLevel + candidate.followerLevel) / 2;
        const levelDiff = Math.abs(avgUserLevel - avgCandidateLevel);
        const levelScore = Math.max(0, 20 - levelDiff * 4);
        score += levelScore;
        if (levelScore > 10) {
          reasons.push("Similar dance level");
        }

        // 3. Same location (20% weight, max 20 points)
        let locationScore = 0;
        if (candidate.city === userProfile.city && candidate.country === userProfile.country) {
          locationScore = 20;
          reasons.push(`Lives in ${candidate.city}`);
        } else if (candidate.country === userProfile.country) {
          locationScore = 10;
          reasons.push(`Lives in ${candidate.country}`);
        }
        score += locationScore;

        // 4. Attended same events (15% weight, max 15 points)
        if (userEventIds.length > 0) {
          const sharedEvents = await db
            .select({ count: sql<number>`count(*)::int` })
            .from(eventRsvps)
            .where(
              and(
                eq(eventRsvps.userId, candidate.id),
                sql`${eventRsvps.eventId} IN (${sql.join(userEventIds, sql`, `)})`
              )
            );

          const sharedCount = sharedEvents[0]?.count || 0;
          const eventScore = Math.min(sharedCount * 5, 15);
          score += eventScore;
          if (sharedCount > 0) {
            reasons.push(`Attended ${sharedCount} same event${sharedCount > 1 ? "s" : ""}`);
          }
        }

        // 5. Similar interests (5% weight, max 5 points)
        const userInterests = userProfile.interests || [];
        const candidateInterests = candidate.interests || [];
        const sharedInterests = userInterests.filter((i) =>
          candidateInterests.includes(i)
        );
        const interestScore = Math.min(sharedInterests.length * 2.5, 5);
        score += interestScore;
        if (sharedInterests.length > 0) {
          reasons.push(`${sharedInterests.length} shared interest${sharedInterests.length > 1 ? "s" : ""}`);
        }

        if (score > 0) {
          scoredCandidates.push({
            id: candidate.id,
            score: Math.round(score * 10) / 10,
            reasons
          });
        }
      }

      // Sort by score and return top recommendations
      return scoredCandidates
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
    } catch (error) {
      console.error("[RecommendationEngine] Friend recommendation error:", error);
      return [];
    }
  }

  /**
   * EVENT RECOMMENDATIONS
   * Factors:
   * - User's city/country (30% weight)
   * - Friends attending (25% weight)
   * - Past event attendance (20% weight)
   * - Dance style match (15% weight)
   * - Event popularity (10% weight)
   */
  static async recommendEvents(
    userId: number,
    limit: number = 10
  ): Promise<RecommendationScore[]> {
    try {
      // Get user's profile
      const [userProfile] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!userProfile) {
        return [];
      }

      // Get user's existing RSVPs
      const existingRsvps = await db
        .select({ eventId: eventRsvps.eventId })
        .from(eventRsvps)
        .where(eq(eventRsvps.userId, userId));

      const existingEventIds = existingRsvps.map((r) => r.eventId);

      // Get upcoming events (exclude already RSVP'd)
      const upcomingEvents = await db
        .select({
          id: events.id,
          title: events.title,
          city: events.city,
          country: events.country,
          danceStyles: events.danceStyles,
          startDate: events.startDate,
          currentAttendees: events.currentAttendees
        })
        .from(events)
        .where(
          and(
            gte(events.startDate, new Date()),
            eq(events.status, "published"),
            existingEventIds.length > 0
              ? sql`${events.id} NOT IN (${sql.join(existingEventIds, sql`, `)})`
              : undefined
          )
        )
        .limit(100);

      // Get user's friends
      const friends = await db
        .select({ friendId: friendships.friendId })
        .from(friendships)
        .where(
          and(
            eq(friendships.userId, userId),
            eq(friendships.status, "accepted")
          )
        );

      const friendIds = friends.map((f) => f.friendId);

      // Get user's past event categories
      const pastEventTypes = await db
        .select({
          eventType: events.eventType,
          count: sql<number>`count(*)::int`
        })
        .from(eventRsvps)
        .innerJoin(events, eq(eventRsvps.eventId, events.id))
        .where(eq(eventRsvps.userId, userId))
        .groupBy(events.eventType);

      const preferredTypes = pastEventTypes
        .sort((a, b) => b.count - a.count)
        .slice(0, 3)
        .map((p) => p.eventType);

      // Calculate scores
      const scoredEvents: RecommendationScore[] = [];

      for (const event of upcomingEvents) {
        let score = 0;
        const reasons: string[] = [];

        // 1. Same city/country (30% weight, max 30 points)
        if (event.city === userProfile.city && event.country === userProfile.country) {
          score += 30;
          reasons.push(`In ${event.city}`);
        } else if (event.country === userProfile.country) {
          score += 15;
          reasons.push(`In ${event.country}`);
        }

        // 2. Friends attending (25% weight, max 25 points)
        if (friendIds.length > 0) {
          const friendsAttending = await db
            .select({ count: sql<number>`count(*)::int` })
            .from(eventRsvps)
            .where(
              and(
                eq(eventRsvps.eventId, event.id),
                sql`${eventRsvps.userId} IN (${sql.join(friendIds, sql`, `)})`
              )
            );

          const friendCount = friendsAttending[0]?.count || 0;
          const friendScore = Math.min(friendCount * 8, 25);
          score += friendScore;
          if (friendCount > 0) {
            reasons.push(`${friendCount} friend${friendCount > 1 ? "s" : ""} attending`);
          }
        }

        // 3. Matches past event preferences (20% weight, max 20 points)
        const eventType = event.danceStyles?.[0] || "";
        if (preferredTypes.includes(eventType)) {
          score += 20;
          reasons.push(`Matches your interests`);
        }

        // 4. Dance style match (15% weight, max 15 points)
        const userInterests = userProfile.interests || [];
        const eventStyles = event.danceStyles || [];
        const matchingStyles = userInterests.filter((i) =>
          eventStyles.includes(i)
        );
        const styleScore = Math.min(matchingStyles.length * 7.5, 15);
        score += styleScore;
        if (matchingStyles.length > 0) {
          reasons.push(`${matchingStyles[0]} event`);
        }

        // 5. Event popularity (10% weight, max 10 points)
        const attendees = event.currentAttendees || 0;
        const popularityScore = Math.min(attendees * 0.5, 10);
        score += popularityScore;
        if (attendees > 10) {
          reasons.push(`${attendees} attending`);
        }

        if (score > 0) {
          scoredEvents.push({
            id: event.id,
            score: Math.round(score * 10) / 10,
            reasons
          });
        }
      }

      // Sort by score and return top recommendations
      return scoredEvents
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
    } catch (error) {
      console.error("[RecommendationEngine] Event recommendation error:", error);
      return [];
    }
  }

  /**
   * TEACHER RECOMMENDATIONS
   * Factors:
   * - Same city/country (35% weight)
   * - Dance level compatibility (25% weight)
   * - Specialization match (20% weight)
   * - Reviews/ratings (15% weight)
   * - Profile completeness (5% weight)
   */
  static async recommendTeachers(
    userId: number,
    limit: number = 10
  ): Promise<RecommendationScore[]> {
    try {
      // Get user's profile
      const [userProfile] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!userProfile) {
        return [];
      }

      // Get all teachers (users with teacher role or teacher profiles)
      const teacherProfiles = await db
        .select({
          id: teachers.id,
          userId: teachers.userId,
          city: teachers.city,
          country: teachers.country,
          specialties: teachers.specialties,
          yearsTeaching: teachers.yearsTeaching,
          averageRating: teachers.averageRating,
          totalReviews: teachers.totalReviews
        })
        .from(teachers)
        .where(eq(teachers.isActive, true))
        .limit(100);

      const scoredTeachers: RecommendationScore[] = [];

      for (const teacher of teacherProfiles) {
        let score = 0;
        const reasons: string[] = [];

        // 1. Same city/country (35% weight, max 35 points)
        if (teacher.city === userProfile.city && teacher.country === userProfile.country) {
          score += 35;
          reasons.push(`Located in ${teacher.city}`);
        } else if (teacher.country === userProfile.country) {
          score += 17;
          reasons.push(`Located in ${teacher.country}`);
        }

        // 2. Dance level compatibility (25% weight, max 25 points)
        const avgUserLevel = (userProfile.leaderLevel + userProfile.followerLevel) / 2;
        const teachingLevel = teacher.yearsTeaching || 0;
        let levelScore = 0;
        if (avgUserLevel < 3 && teachingLevel >= 2) {
          levelScore = 25; // Beginners match with experienced teachers
          reasons.push("Great for beginners");
        } else if (avgUserLevel >= 3 && teachingLevel >= 5) {
          levelScore = 25; // Advanced match with senior teachers
          reasons.push("Advanced instruction");
        } else if (teachingLevel >= 3) {
          levelScore = 15;
        }
        score += levelScore;

        // 3. Specialization match (20% weight, max 20 points)
        const userInterests = userProfile.interests || [];
        const teacherSpecialties = teacher.specialties || [];
        const matchingSpecialties = userInterests.filter((i) =>
          teacherSpecialties.includes(i)
        );
        const specialtyScore = Math.min(matchingSpecialties.length * 10, 20);
        score += specialtyScore;
        if (matchingSpecialties.length > 0) {
          reasons.push(`Teaches ${matchingSpecialties[0]}`);
        }

        // 4. Reviews/ratings (15% weight, max 15 points)
        const rating = teacher.averageRating || 0;
        const reviewCount = teacher.totalReviews || 0;
        const ratingScore = (rating / 5) * 10; // Max 10 points for 5 stars
        const reviewScore = Math.min(reviewCount * 0.5, 5); // Max 5 points for review count
        score += ratingScore + reviewScore;
        if (rating >= 4.5) {
          reasons.push(`${rating.toFixed(1)}⭐ rating`);
        }

        // 5. Profile completeness (5% weight, max 5 points)
        let completeness = 0;
        if (teacher.city) completeness += 1;
        if (teacher.specialties && teacher.specialties.length > 0) completeness += 2;
        if (teacher.yearsTeaching && teacher.yearsTeaching > 0) completeness += 2;
        score += completeness;

        if (score > 0) {
          scoredTeachers.push({
            id: teacher.id,
            score: Math.round(score * 10) / 10,
            reasons
          });
        }
      }

      // Sort by score and return top recommendations
      return scoredTeachers
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
    } catch (error) {
      console.error("[RecommendationEngine] Teacher recommendation error:", error);
      return [];
    }
  }

  /**
   * CONTENT RECOMMENDATIONS (Posts)
   * Factors:
   * - Posts from friends (40% weight)
   * - Posts from followed users (25% weight)
   * - Posts in joined groups (20% weight)
   * - Popular posts (10% weight)
   * - Recent posts (5% weight)
   */
  static async recommendContent(
    userId: number,
    limit: number = 20
  ): Promise<RecommendationScore[]> {
    try {
      // Get user's friends
      const friends = await db
        .select({ friendId: friendships.friendId })
        .from(friendships)
        .where(
          and(
            eq(friendships.userId, userId),
            eq(friendships.status, "accepted")
          )
        );

      const friendIds = friends.map((f) => f.friendId);

      // Get users the person follows
      const following = await db
        .select({ followingId: follows.followingId })
        .from(follows)
        .where(eq(follows.followerId, userId));

      const followingIds = following.map((f) => f.followingId);

      // Get user's groups
      const userGroups = await db
        .select({ groupId: groupMembers.groupId })
        .from(groupMembers)
        .where(eq(groupMembers.userId, userId));

      const groupIds = userGroups.map((g) => g.groupId);

      // Get recent posts (from last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentPosts = await db
        .select({
          id: posts.id,
          userId: posts.userId,
          groupId: posts.groupId,
          createdAt: posts.createdAt,
          likesCount: posts.likesCount,
          commentsCount: posts.commentsCount
        })
        .from(posts)
        .where(
          and(
            gte(posts.createdAt, thirtyDaysAgo),
            ne(posts.userId, userId)
          )
        )
        .limit(200);

      const scoredPosts: RecommendationScore[] = [];

      for (const post of recentPosts) {
        let score = 0;
        const reasons: string[] = [];

        // 1. Posts from friends (40% weight, max 40 points)
        if (friendIds.includes(post.userId)) {
          score += 40;
          reasons.push("From a friend");
        }

        // 2. Posts from followed users (25% weight, max 25 points)
        if (followingIds.includes(post.userId)) {
          score += 25;
          reasons.push("From someone you follow");
        }

        // 3. Posts in joined groups (20% weight, max 20 points)
        if (post.groupId && groupIds.includes(post.groupId)) {
          score += 20;
          reasons.push("From your group");
        }

        // 4. Popular posts (10% weight, max 10 points)
        const engagement = (post.likesCount || 0) + (post.commentsCount || 0) * 2;
        const popularityScore = Math.min(engagement * 0.5, 10);
        score += popularityScore;
        if (engagement > 10) {
          reasons.push("Popular post");
        }

        // 5. Recent posts (5% weight, max 5 points)
        const hoursSincePost = (Date.now() - post.createdAt.getTime()) / (1000 * 60 * 60);
        const recencyScore = Math.max(0, 5 - hoursSincePost / 24);
        score += recencyScore;

        if (score > 0) {
          scoredPosts.push({
            id: post.id,
            score: Math.round(score * 10) / 10,
            reasons
          });
        }
      }

      // Sort by score and return top recommendations
      return scoredPosts
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
    } catch (error) {
      console.error("[RecommendationEngine] Content recommendation error:", error);
      return [];
    }
  }
}
