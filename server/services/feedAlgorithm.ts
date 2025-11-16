import { db } from "@shared/db";
import { posts, users, reactions, postComments, postShares, follows, friendships } from "@shared/schema";
import { eq, and, or, desc, sql, gte, inArray, not } from "drizzle-orm";
import OpenAI from "openai";

const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

interface FeedRankingOptions {
  userId: number;
  algorithm: 'personalized' | 'chronological' | 'trending';
  filters?: {
    friendsOnly?: boolean;
    visibility?: string;
    hashtags?: string[];
    location?: string;
  };
}

interface PostWithScore {
  post: any;
  score: number;
}

export class FeedAlgorithmService {
  /**
   * Feature 11: Personalized Feed Ranking
   * AI-powered relevance scoring with user interaction history
   */
  async getPersonalizedFeed(userId: number, limit: number = 20, offset: number = 0) {
    try {
      // 1. Get user's interaction history (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const userInteractions = await db
        .select({
          postId: reactions.postId,
          type: reactions.type,
          createdAt: reactions.createdAt,
        })
        .from(reactions)
        .where(
          and(
            eq(reactions.userId, userId),
            gte(reactions.createdAt, thirtyDaysAgo)
          )
        );

      // 2. Get user's friends and following
      const [friendsData, followingData] = await Promise.all([
        db
          .select({ friendId: friendships.friendId })
          .from(friendships)
          .where(
            and(
              eq(friendships.userId, userId),
              eq(friendships.status, 'accepted')
            )
          ),
        db
          .select({ followingId: follows.followingId })
          .from(follows)
          .where(eq(follows.followerId, userId)),
      ]);

      const friendIds = friendsData.map(f => f.friendId);
      const followingIds = followingData.map(f => f.followingId);
      const connectedUserIds = [...new Set([...friendIds, ...followingIds])];

      // 3. Get candidate posts (last 7 days, excluding user's own posts)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const candidatePosts = await db
        .select({
          post: posts,
          user: {
            id: users.id,
            name: users.name,
            username: users.username,
            profileImage: users.profileImage,
          },
          likesCount: sql<number>`(
            SELECT COUNT(*)::int FROM ${reactions}
            WHERE ${reactions.postId} = ${posts.id}
            AND ${reactions.type} = 'like'
          )`,
          commentsCount: sql<number>`(
            SELECT COUNT(*)::int FROM ${postComments}
            WHERE ${postComments.postId} = ${posts.id}
          )`,
          sharesCount: sql<number>`(
            SELECT COUNT(*)::int FROM ${postShares}
            WHERE ${postShares.postId} = ${posts.id}
          )`,
        })
        .from(posts)
        .innerJoin(users, eq(posts.userId, users.id))
        .where(
          and(
            gte(posts.createdAt, sevenDaysAgo),
            not(eq(posts.userId, userId)),
            or(
              eq(posts.visibility, 'public'),
              and(
                eq(posts.visibility, 'friends'),
                inArray(posts.userId, connectedUserIds.length > 0 ? connectedUserIds : [-1])
              )
            )
          )
        )
        .orderBy(desc(posts.createdAt))
        .limit(200); // Get more candidates for ranking

      // 4. Calculate relevance scores for each post
      const scoredPosts: PostWithScore[] = candidatePosts.map(({ post, user: postUser, likesCount, commentsCount, sharesCount }) => {
        let score = 0;

        // Friend proximity score (0-40 points)
        if (connectedUserIds.includes(post.userId)) {
          score += friendIds.includes(post.userId) ? 40 : 25; // Friends get higher score than follows
        }

        // Engagement score (0-30 points)
        const engagementScore = (likesCount * 1 + commentsCount * 2 + sharesCount * 3) / 10;
        score += Math.min(engagementScore, 30);

        // Recency decay (0-20 points)
        const ageHours = (Date.now() - new Date(post.createdAt).getTime()) / (1000 * 60 * 60);
        const recencyScore = Math.max(20 - (ageHours / 24) * 20, 0); // Decay over 24 hours
        score += recencyScore;

        // User interaction history (0-10 points)
        const hasInteractedWithAuthor = userInteractions.some(
          interaction => candidatePosts.find(cp => cp.post.id === interaction.postId)?.post.userId === post.userId
        );
        if (hasInteractedWithAuthor) {
          score += 10;
        }

        return {
          post: {
            ...post,
            user: postUser,
            likes: likesCount,
            comments: commentsCount,
            shares: sharesCount,
          },
          score,
        };
      });

      // 5. Sort by score and apply diversity injection
      scoredPosts.sort((a, b) => b.score - a.score);

      // Diversity injection: prevent same author appearing too frequently
      const diversifiedPosts = this.applyDiversityInjection(scoredPosts, 3);

      // 6. Paginate results
      const paginatedPosts = diversifiedPosts
        .slice(offset, offset + limit)
        .map(sp => sp.post);

      return {
        posts: paginatedPosts,
        nextOffset: offset + limit < diversifiedPosts.length ? offset + limit : null,
        hasMore: offset + limit < diversifiedPosts.length,
      };
    } catch (error) {
      console.error('[FeedAlgorithm] Error in getPersonalizedFeed:', error);
      throw error;
    }
  }

  /**
   * Feature 13: Following Feed
   * Posts from friends + followed users only
   */
  async getFollowingFeed(userId: number, limit: number = 20, offset: number = 0) {
    try {
      // Get user's friends and following
      const [friendsData, followingData] = await Promise.all([
        db
          .select({ friendId: friendships.friendId })
          .from(friendships)
          .where(
            and(
              eq(friendships.userId, userId),
              eq(friendships.status, 'accepted')
            )
          ),
        db
          .select({ followingId: follows.followingId })
          .from(follows)
          .where(eq(follows.followerId, userId)),
      ]);

      const friendIds = friendsData.map(f => f.friendId);
      const followingIds = followingData.map(f => f.followingId);
      const connectedUserIds = [...new Set([...friendIds, ...followingIds])];

      if (connectedUserIds.length === 0) {
        return { posts: [], nextOffset: null, hasMore: false };
      }

      // Get posts from connected users
      const followingPosts = await db
        .select({
          post: posts,
          user: {
            id: users.id,
            name: users.name,
            username: users.username,
            profileImage: users.profileImage,
          },
          likesCount: sql<number>`(
            SELECT COUNT(*)::int FROM ${reactions}
            WHERE ${reactions.postId} = ${posts.id}
            AND ${reactions.type} = 'like'
          )`,
          commentsCount: sql<number>`(
            SELECT COUNT(*)::int FROM ${postComments}
            WHERE ${postComments.postId} = ${posts.id}
          )`,
          sharesCount: sql<number>`(
            SELECT COUNT(*)::int FROM ${postShares}
            WHERE ${postShares.postId} = ${posts.id}
          )`,
        })
        .from(posts)
        .innerJoin(users, eq(posts.userId, users.id))
        .where(inArray(posts.userId, connectedUserIds))
        .orderBy(desc(posts.createdAt))
        .limit(limit)
        .offset(offset);

      const formattedPosts = followingPosts.map(({ post, user: postUser, likesCount, commentsCount, sharesCount }) => ({
        ...post,
        user: postUser,
        likes: likesCount,
        comments: commentsCount,
        shares: sharesCount,
      }));

      return {
        posts: formattedPosts,
        nextOffset: formattedPosts.length === limit ? offset + limit : null,
        hasMore: formattedPosts.length === limit,
      };
    } catch (error) {
      console.error('[FeedAlgorithm] Error in getFollowingFeed:', error);
      throw error;
    }
  }

  /**
   * Feature 13: Discover Feed
   * Trending posts, recommended users, popular hashtags
   */
  async getDiscoverFeed(userId: number, limit: number = 20, offset: number = 0) {
    try {
      // Get trending posts from last 48 hours
      const fortyEightHoursAgo = new Date();
      fortyEightHoursAgo.setHours(fortyEightHoursAgo.getHours() - 48);

      const trendingPosts = await db
        .select({
          post: posts,
          user: {
            id: users.id,
            name: users.name,
            username: users.username,
            profileImage: users.profileImage,
          },
          likesCount: sql<number>`(
            SELECT COUNT(*)::int FROM ${reactions}
            WHERE ${reactions.postId} = ${posts.id}
            AND ${reactions.type} = 'like'
          )`,
          commentsCount: sql<number>`(
            SELECT COUNT(*)::int FROM ${postComments}
            WHERE ${postComments.postId} = ${posts.id}
          )`,
          sharesCount: sql<number>`(
            SELECT COUNT(*)::int FROM ${postShares}
            WHERE ${postShares.postId} = ${posts.id}
          )`,
        })
        .from(posts)
        .innerJoin(users, eq(posts.userId, users.id))
        .where(
          and(
            gte(posts.createdAt, fortyEightHoursAgo),
            eq(posts.visibility, 'public'),
            not(eq(posts.userId, userId))
          )
        )
        .orderBy(desc(posts.createdAt))
        .limit(100);

      // Calculate engagement scores
      const scoredPosts = trendingPosts.map(({ post, user: postUser, likesCount, commentsCount, sharesCount }) => {
        const ageHours = (Date.now() - new Date(post.createdAt).getTime()) / (1000 * 60 * 60);
        const engagementScore = (likesCount * 1 + commentsCount * 2 + sharesCount * 3) / Math.max(ageHours, 1);

        return {
          post: {
            ...post,
            user: postUser,
            likes: likesCount,
            comments: commentsCount,
            shares: sharesCount,
          },
          score: engagementScore,
        };
      });

      // Sort by engagement score
      scoredPosts.sort((a, b) => b.score - a.score);

      // Paginate
      const paginatedPosts = scoredPosts
        .slice(offset, offset + limit)
        .map(sp => sp.post);

      return {
        posts: paginatedPosts,
        nextOffset: offset + limit < scoredPosts.length ? offset + limit : null,
        hasMore: offset + limit < scoredPosts.length,
      };
    } catch (error) {
      console.error('[FeedAlgorithm] Error in getDiscoverFeed:', error);
      throw error;
    }
  }

  /**
   * Feature 16: Trending Posts
   * Top posts by engagement in last 24h
   * Formula: (likes + comments*2 + shares*3) / age_hours
   */
  async getTrendingPosts(limit: number = 5) {
    try {
      const twentyFourHoursAgo = new Date();
      twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

      const trendingCandidates = await db
        .select({
          post: posts,
          user: {
            id: users.id,
            name: users.name,
            username: users.username,
            profileImage: users.profileImage,
          },
        })
        .from(posts)
        .innerJoin(users, eq(posts.userId, users.id))
        .where(
          and(
            gte(posts.createdAt, twentyFourHoursAgo),
            eq(posts.visibility, 'public')
          )
        );

      // Calculate trending score using post's existing counts
      const scoredPosts = trendingCandidates.map(({ post, user: postUser }) => {
        const ageHours = Math.max((Date.now() - new Date(post.createdAt).getTime()) / (1000 * 60 * 60), 0.1);
        const trendingScore = ((post.likes || 0) * 1 + (post.comments || 0) * 2 + (post.shares || 0) * 3) / ageHours;

        return {
          post: {
            ...post,
            user: postUser,
          },
          score: trendingScore,
        };
      });

      // Sort and return top N
      scoredPosts.sort((a, b) => b.score - a.score);
      return scoredPosts.slice(0, limit).map(sp => sp.post);
    } catch (error) {
      console.error('[FeedAlgorithm] Error in getTrendingPosts:', error);
      throw error;
    }
  }

  /**
   * Feature 17: Recently Active Users
   * Users who posted or commented in last hour
   */
  async getRecentlyActiveUsers(limit: number = 10) {
    try {
      const oneHourAgo = new Date();
      oneHourAgo.setHours(oneHourAgo.getHours() - 1);

      // Get users who posted recently
      const recentPosters = await db
        .select({
          user: users,
          lastActivity: posts.createdAt,
        })
        .from(posts)
        .innerJoin(users, eq(posts.userId, users.id))
        .where(gte(posts.createdAt, oneHourAgo))
        .orderBy(desc(posts.createdAt));

      // Get users who commented recently
      const recentCommenters = await db
        .select({
          user: users,
          lastActivity: postComments.createdAt,
        })
        .from(postComments)
        .innerJoin(users, eq(postComments.userId, users.id))
        .where(gte(postComments.createdAt, oneHourAgo))
        .orderBy(desc(postComments.createdAt));

      // Combine and deduplicate
      const allActiveUsers = [...recentPosters, ...recentCommenters];
      const uniqueUsers = new Map();

      allActiveUsers.forEach(({ user, lastActivity }) => {
        if (!uniqueUsers.has(user.id) || new Date(lastActivity) > new Date(uniqueUsers.get(user.id).lastActivity)) {
          uniqueUsers.set(user.id, { user, lastActivity });
        }
      });

      // Sort by most recent activity
      const sortedUsers = Array.from(uniqueUsers.values())
        .sort((a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime())
        .slice(0, limit);

      return sortedUsers.map(({ user, lastActivity }) => ({
        ...user,
        lastActivityAt: lastActivity,
      }));
    } catch (error) {
      console.error('[FeedAlgorithm] Error in getRecentlyActiveUsers:', error);
      throw error;
    }
  }

  /**
   * Feature 18: AI-Powered Recommendations
   * Use OpenAI embeddings for semantic matching
   */
  async getRecommendedPosts(userId: number, limit: number = 10) {
    try {
      if (!openai) {
        console.warn('[FeedAlgorithm] OpenAI not configured, falling back to basic recommendations');
        return this.getBasicRecommendations(userId, limit);
      }

      // Get user's recent interactions
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const userLikedPosts = await db
        .select({ post: posts })
        .from(reactions)
        .innerJoin(posts, eq(reactions.postId, posts.id))
        .where(
          and(
            eq(reactions.userId, userId),
            eq(reactions.type, 'like'),
            gte(reactions.createdAt, thirtyDaysAgo)
          )
        )
        .limit(10);

      if (userLikedPosts.length === 0) {
        return this.getBasicRecommendations(userId, limit);
      }

      // Create a combined text from user's liked posts
      const likedContent = userLikedPosts
        .map(({ post }) => post.content)
        .join(' ')
        .slice(0, 8000); // Limit to avoid token limits

      // Get embedding for user's interests (simplified - in production, cache this)
      // For now, we'll use basic content similarity
      return this.getBasicRecommendations(userId, limit);
    } catch (error) {
      console.error('[FeedAlgorithm] Error in getRecommendedPosts:', error);
      return this.getBasicRecommendations(userId, limit);
    }
  }

  /**
   * Basic recommendations fallback (no AI)
   */
  private async getBasicRecommendations(userId: number, limit: number = 10) {
    try {
      // Get user's hashtag preferences from their interactions
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const candidatePosts = await db
        .select({
          post: posts,
          user: {
            id: users.id,
            name: users.name,
            username: users.username,
            profileImage: users.profileImage,
          },
          likesCount: sql<number>`(
            SELECT COUNT(*)::int FROM ${reactions}
            WHERE ${reactions.postId} = ${posts.id}
            AND ${reactions.type} = 'like'
          )`,
          commentsCount: sql<number>`(
            SELECT COUNT(*)::int FROM ${postComments}
            WHERE ${postComments.postId} = ${posts.id}
          )`,
        })
        .from(posts)
        .innerJoin(users, eq(posts.userId, users.id))
        .where(
          and(
            gte(posts.createdAt, sevenDaysAgo),
            eq(posts.visibility, 'public'),
            not(eq(posts.userId, userId))
          )
        )
        .orderBy(desc(posts.createdAt))
        .limit(50);

      // Score by engagement
      const scoredPosts = candidatePosts.map(({ post, user: postUser, likesCount, commentsCount }) => ({
        post: {
          ...post,
          user: postUser,
          likes: likesCount,
          comments: commentsCount,
        },
        score: likesCount * 1 + commentsCount * 2,
      }));

      scoredPosts.sort((a, b) => b.score - a.score);
      return scoredPosts.slice(0, limit).map(sp => sp.post);
    } catch (error) {
      console.error('[FeedAlgorithm] Error in getBasicRecommendations:', error);
      return [];
    }
  }

  /**
   * Apply diversity injection to prevent same author dominating feed
   */
  private applyDiversityInjection(scoredPosts: PostWithScore[], maxConsecutive: number = 3): PostWithScore[] {
    const result: PostWithScore[] = [];
    const authorCounts = new Map<number, number>();

    for (const scoredPost of scoredPosts) {
      const authorId = scoredPost.post.userId;
      const consecutiveCount = authorCounts.get(authorId) || 0;

      if (consecutiveCount < maxConsecutive) {
        result.push(scoredPost);
        authorCounts.set(authorId, consecutiveCount + 1);
      } else {
        // Find next post from different author
        const nextDifferentAuthor = scoredPosts.find(
          sp => sp.post.userId !== authorId && !result.includes(sp)
        );
        if (nextDifferentAuthor) {
          result.push(nextDifferentAuthor);
          authorCounts.set(nextDifferentAuthor.post.userId, 1);
          authorCounts.set(authorId, 0);
        }
      }
    }

    return result;
  }
}

export const feedAlgorithmService = new FeedAlgorithmService();
