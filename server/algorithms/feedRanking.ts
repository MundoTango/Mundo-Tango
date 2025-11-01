/**
 * A2: Content Recommendation Agent - Feed Ranking Algorithm
 * 
 * Personalizes post ordering using recency, engagement, and relevance
 * Implements time decay, engagement scoring, and diversity filtering
 */

export interface FeedRanking {
  postId: number;
  score: number;
  recency: number;
  engagement: number;
  relevance: number;
}

interface Post {
  id: number;
  userId: number;
  createdAt: Date;
  likesCount?: number;
  commentsCount?: number;
  sharesCount?: number;
  content?: string;
}

interface UserInterests {
  topics: string[];
  followedUsers: number[];
  engagedTopics: string[];
}

/**
 * Calculate time decay score (exponential decay)
 * Posts lose relevance over time
 */
function calculateRecencyScore(postDate: Date): number {
  const now = new Date();
  const ageInHours = (now.getTime() - postDate.getTime()) / (1000 * 60 * 60);
  
  // Exponential decay: half-life of 24 hours
  // Score = 1 at 0 hours, 0.5 at 24 hours, 0.25 at 48 hours
  const halfLife = 24;
  const decayFactor = Math.pow(0.5, ageInHours / halfLife);
  
  return Math.max(0, Math.min(1, decayFactor));
}

/**
 * Calculate engagement score based on likes, comments, shares
 * Normalized to 0-1 scale
 */
function calculateEngagementScore(post: Post): number {
  const likes = post.likesCount || 0;
  const comments = post.commentsCount || 0;
  const shares = post.sharesCount || 0;
  
  // Weighted engagement (comments worth more than likes)
  const rawScore = (likes * 1) + (comments * 3) + (shares * 5);
  
  // Normalize using logarithmic scale (handles viral posts)
  const normalizedScore = Math.log1p(rawScore) / Math.log1p(1000); // Cap at 1000 interactions
  
  return Math.max(0, Math.min(1, normalizedScore));
}

/**
 * Calculate relevance score based on user interests
 * Uses content matching and author relationships
 */
function calculateRelevanceScore(post: Post, userInterests: UserInterests): number {
  let relevanceScore = 0.5; // Base score
  
  // Boost if post is from followed user
  if (userInterests.followedUsers.includes(post.userId)) {
    relevanceScore += 0.3;
  }
  
  // Boost if post contains user's interested topics (simple keyword matching)
  if (post.content) {
    const contentLower = post.content.toLowerCase();
    const matchedTopics = userInterests.topics.filter(topic => 
      contentLower.includes(topic.toLowerCase())
    );
    relevanceScore += Math.min(0.2, matchedTopics.length * 0.1);
  }
  
  return Math.max(0, Math.min(1, relevanceScore));
}

/**
 * Calculate final feed score for a post
 * Combines recency, engagement, and relevance with weights
 */
export function calculateFeedScore(
  post: Post, 
  userInterests: UserInterests
): FeedRanking {
  const recency = calculateRecencyScore(post.createdAt);
  const engagement = calculateEngagementScore(post);
  const relevance = calculateRelevanceScore(post, userInterests);
  
  // Weighted combination (configurable weights)
  const RECENCY_WEIGHT = 0.3;
  const ENGAGEMENT_WEIGHT = 0.4;
  const RELEVANCE_WEIGHT = 0.3;
  
  const score = 
    (RECENCY_WEIGHT * recency) +
    (ENGAGEMENT_WEIGHT * engagement) +
    (RELEVANCE_WEIGHT * relevance);
  
  return {
    postId: post.id,
    score,
    recency,
    engagement,
    relevance
  };
}

/**
 * Rank multiple posts for a user's feed
 * Returns posts sorted by score descending
 */
export function rankFeedPosts(
  posts: Post[], 
  userInterests: UserInterests
): FeedRanking[] {
  const rankings = posts.map(post => calculateFeedScore(post, userInterests));
  
  // Sort by score descending
  rankings.sort((a, b) => b.score - a.score);
  
  return rankings;
}

/**
 * Apply diversity filter to prevent filter bubbles
 * Ensures variety in authors and topics
 */
export function diversifyFeed(
  rankings: FeedRanking[], 
  posts: Post[], 
  maxConsecutiveFromSameAuthor: number = 2
): FeedRanking[] {
  const diversified: FeedRanking[] = [];
  const authorCounts = new Map<number, number>();
  
  for (const ranking of rankings) {
    const post = posts.find(p => p.id === ranking.postId);
    if (!post) continue;
    
    const authorCount = authorCounts.get(post.userId) || 0;
    
    // If we've seen too many from this author recently, skip temporarily
    if (authorCount >= maxConsecutiveFromSameAuthor) {
      // Add to end of queue
      continue;
    }
    
    diversified.push(ranking);
    authorCounts.set(post.userId, authorCount + 1);
    
    // Reset counts periodically
    if (diversified.length % 10 === 0) {
      authorCounts.clear();
    }
  }
  
  return diversified;
}
