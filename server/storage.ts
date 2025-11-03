import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq, and, gt, desc, asc, or, ilike, inArray, sql, lt, gte, lte, ne, notInArray } from "drizzle-orm";
import {
  users,
  refreshTokens,
  emailVerificationTokens,
  passwordResetTokens,
  twoFactorSecrets,
  posts,
  postLikes,
  postComments,
  follows,
  events,
  eventRsvps,
  groups,
  groupMembers,
  chatRooms,
  chatRoomUsers,
  chatMessages,
  notifications,
  savedPosts,
  friendRequests,
  friendships,
  friendshipActivities,
  friendshipMedia,
  moderationQueue,
  communities,
  communityMembers,
  workshops,
  reviews,
  liveStreams,
  media,
  activityLogs,
  blockedUsers,
  blockedContent,
  teachers,
  venues,
  tutorials,
  blogPosts,
  newsletterSubscriptions,
  bookings,
  payments,
  volunteers,
  resumes,
  clarifierSessions,
  tasks,
  assignments,
  lifeCeoDomains,
  lifeCeoGoals,
  lifeCeoTasks,
  lifeCeoMilestones,
  lifeCeoRecommendations,
  h2acMessages,
  memories,
  recommendations,
  roleInvitations,
  favorites,
  communityStats,
  type SelectUser,
  type InsertUser,
  type SelectRefreshToken,
  type InsertRefreshToken,
  type SelectEmailVerificationToken,
  type InsertEmailVerificationToken,
  type SelectPasswordResetToken,
  type InsertPasswordResetToken,
  type SelectTwoFactorSecret,
  type InsertTwoFactorSecret,
  type SelectPost,
  type InsertPost,
  type SelectPostLike,
  type InsertPostLike,
  type SelectPostComment,
  type InsertPostComment,
  type SelectFollow,
  type InsertFollow,
  type SelectEvent,
  type InsertEvent,
  type SelectEventRsvp,
  type InsertEventRsvp,
  type SelectGroup,
  type InsertGroup,
  type SelectGroupMember,
  type InsertGroupMember,
  type SelectChatRoom,
  type InsertChatRoom,
  type SelectChatRoomUser,
  type InsertChatRoomUser,
  type SelectChatMessage,
  type InsertChatMessage,
  type SelectNotification,
  type InsertNotification,
  type SelectMemory,
  type InsertMemory,
  type SelectRecommendation,
  type InsertRecommendation,
  type SelectRoleInvitation,
  type InsertRoleInvitation,
  type SelectFavorite,
  type InsertFavorite,
  type SelectCommunityStats,
  type InsertCommunityStats,
} from "@shared/schema";

// Platform independence tables
import {
  deployments,
  platformIntegrations,
  environmentVariables,
  previewDeployments,
  customDomains,
  analyticsEvents,
  teamMembers,
  costRecords,
  databaseBackups,
  cicdPipelines,
  cicdRuns,
  type Deployment,
  type InsertDeployment,
  type PlatformIntegration,
  type InsertPlatformIntegration,
  type EnvironmentVariable,
  type InsertEnvironmentVariable,
  type PreviewDeployment,
  type InsertPreviewDeployment,
} from "@shared/platform-schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set");
}

const sqlClient = neon(process.env.DATABASE_URL);
const db = drizzle(sqlClient);

export interface IStorage {
  getUserById(id: number): Promise<SelectUser | undefined>;
  getUserByEmail(email: string): Promise<SelectUser | undefined>;
  getUserByUsername(username: string): Promise<SelectUser | undefined>;
  createUser(user: InsertUser): Promise<SelectUser>;
  updateUser(id: number, data: Partial<SelectUser>): Promise<SelectUser | undefined>;
  updateUserPassword(id: number, hashedPassword: string): Promise<void>;
  
  createRefreshToken(token: InsertRefreshToken): Promise<SelectRefreshToken>;
  getRefreshToken(token: string): Promise<SelectRefreshToken | undefined>;
  deleteRefreshToken(token: string): Promise<void>;
  deleteUserRefreshTokens(userId: number): Promise<void>;
  
  createEmailVerificationToken(token: InsertEmailVerificationToken): Promise<SelectEmailVerificationToken>;
  getEmailVerificationToken(token: string): Promise<SelectEmailVerificationToken | undefined>;
  deleteEmailVerificationToken(token: string): Promise<void>;
  
  createPasswordResetToken(token: InsertPasswordResetToken): Promise<SelectPasswordResetToken>;
  getPasswordResetToken(token: string): Promise<SelectPasswordResetToken | undefined>;
  deletePasswordResetToken(token: string): Promise<void>;
  deleteUserPasswordResetTokens(userId: number): Promise<void>;
  
  createTwoFactorSecret(secret: InsertTwoFactorSecret): Promise<SelectTwoFactorSecret>;
  getTwoFactorSecret(userId: number): Promise<SelectTwoFactorSecret | undefined>;
  updateTwoFactorSecret(userId: number, secret: Partial<SelectTwoFactorSecret>): Promise<void>;
  deleteTwoFactorSecret(userId: number): Promise<void>;
  
  createPost(post: InsertPost): Promise<SelectPost>;
  getPostById(id: number): Promise<SelectPost | undefined>;
  getPosts(params: { userId?: number; limit?: number; offset?: number }): Promise<SelectPost[]>;
  updatePost(id: number, data: Partial<SelectPost>): Promise<SelectPost | undefined>;
  deletePost(id: number): Promise<void>;
  
  likePost(postId: number, userId: number): Promise<SelectPostLike | undefined>;
  unlikePost(postId: number, userId: number): Promise<void>;
  isPostLikedByUser(postId: number, userId: number): Promise<boolean>;
  savePost(postId: number, userId: number): Promise<void>;
  unsavePost(postId: number, userId: number): Promise<void>;
  
  createPostComment(comment: InsertPostComment): Promise<SelectPostComment>;
  getPostComments(postId: number): Promise<SelectPostComment[]>;
  
  getUserFriends(userId: number): Promise<any[]>;
  getFriendRequests(userId: number): Promise<any[]>;
  getFriendSuggestions(userId: number): Promise<any[]>;
  sendFriendRequest(data: { senderId: number; receiverId: number; [key: string]: any }): Promise<any>;
  acceptFriendRequest(requestId: number): Promise<void>;
  declineFriendRequest(requestId: number): Promise<void>;
  getMutualFriends(userId1: number, userId2: number): Promise<SelectUser[]>;
  getConnectionDegree(userId1: number, userId2: number): Promise<number | null>;
  snoozeFriendRequest(requestId: number, days: number): Promise<void>;
  removeFriend(userId: number, friendId: number): Promise<void>;
  
  // Communities
  getCommunityByCity(cityName: string): Promise<any | undefined>;
  createCommunity(data: { name: string; cityName: string; country: string; description?: string }): Promise<any>;
  getCommunityMembership(communityId: number, userId: number): Promise<any | undefined>;
  joinCommunity(communityId: number, userId: number): Promise<any>;

  // Workshops
  createWorkshop(workshop: any): Promise<any>;
  getWorkshops(params: { limit?: number; offset?: number }): Promise<any[]>;
  getWorkshopById(id: number): Promise<any | undefined>;
  updateWorkshop(id: number, data: any): Promise<any | undefined>;
  deleteWorkshop(id: number): Promise<void>;
  
  // Reviews
  createReview(review: any): Promise<any>;
  getReviews(params: { targetType?: string; targetId?: number; userId?: number; limit?: number; offset?: number }): Promise<any[]>;
  updateReview(id: number, data: any): Promise<any | undefined>;
  deleteReview(id: number): Promise<void>;
  
  // Live Streams
  createLiveStream(stream: any): Promise<any>;
  getLiveStreams(params: { isLive?: boolean; limit?: number }): Promise<any[]>;
  getLiveStreamById(id: number): Promise<any | undefined>;
  updateLiveStream(id: number, data: any): Promise<any | undefined>;
  deleteLiveStream(id: number): Promise<void>;
  
  // Media Gallery
  createMedia(media: any): Promise<any>;
  getUserMedia(userId: number, params: { type?: string; limit?: number; offset?: number }): Promise<any[]>;
  getMediaById(id: number): Promise<any | undefined>;
  updateMedia(id: number, data: any): Promise<any | undefined>;
  deleteMedia(id: number): Promise<void>;
  
  // Activity Logs
  createActivityLog(log: any): Promise<any>;
  getUserActivityLogs(userId: number, params: { limit?: number; offset?: number }): Promise<any[]>;
  
  // Blocked Users
  blockUser(userId: number, blockedUserId: number): Promise<any>;
  unblockUser(userId: number, blockedUserId: number): Promise<void>;
  getBlockedUsers(userId: number): Promise<any[]>;
  isUserBlocked(userId: number, blockedUserId: number): Promise<boolean>;
  
  // Blocked Content
  blockContent(userId: number, contentType: string, contentId: number, reason?: string): Promise<any>;
  unblockContent(userId: number, contentType: string, contentId: number): Promise<void>;
  getBlockedContent(userId: number): Promise<any[]>;
  
  // Teachers
  createTeacher(teacher: any): Promise<any>;
  getTeachers(params: { verified?: boolean; limit?: number; offset?: number }): Promise<any[]>;
  getTeacherById(id: number): Promise<any | undefined>;
  getTeacherByUserId(userId: number): Promise<any | undefined>;
  updateTeacher(id: number, data: any): Promise<any | undefined>;
  deleteTeacher(id: number): Promise<void>;
  
  // Venues
  createVenue(venue: any): Promise<any>;
  getVenues(params: { city?: string; verified?: boolean; limit?: number; offset?: number }): Promise<any[]>;
  getVenueById(id: number): Promise<any | undefined>;
  updateVenue(id: number, data: any): Promise<any | undefined>;
  deleteVenue(id: number): Promise<void>;
  
  // Tutorials
  createTutorial(tutorial: any): Promise<any>;
  getTutorials(params: { level?: string; limit?: number; offset?: number }): Promise<any[]>;
  getTutorialById(id: number): Promise<any | undefined>;
  updateTutorial(id: number, data: any): Promise<any | undefined>;
  deleteTutorial(id: number): Promise<void>;
  
  // Blog Posts
  createBlogPost(post: any): Promise<any>;
  getBlogPosts(params: { published?: boolean; authorId?: number; limit?: number; offset?: number }): Promise<any[]>;
  getBlogPostById(id: number): Promise<any | undefined>;
  getBlogPostBySlug(slug: string): Promise<any | undefined>;
  updateBlogPost(id: number, data: any): Promise<any | undefined>;
  deleteBlogPost(id: number): Promise<void>;
  
  // Newsletter Subscriptions
  createNewsletterSubscription(subscription: any): Promise<any>;
  getNewsletterSubscriptions(params: { subscribed?: boolean }): Promise<any[]>;
  updateNewsletterSubscription(email: string, data: any): Promise<any | undefined>;
  deleteNewsletterSubscription(email: string): Promise<void>;
  
  // Bookings
  createBooking(booking: any): Promise<any>;
  getBookingById(id: number): Promise<any | undefined>;
  getBookingByConfirmation(confirmationNumber: string): Promise<any | undefined>;
  getUserBookings(userId: number, params: { status?: string }): Promise<any[]>;
  updateBooking(id: number, data: any): Promise<any | undefined>;
  deleteBooking(id: number): Promise<void>;
  
  // Talent Match (Volunteers, Resumes, Clarifier, Tasks, Assignments)
  createVolunteer(volunteer: any): Promise<any>;
  getVolunteerById(id: number): Promise<any | undefined>;
  getVolunteerByUserId(userId: number): Promise<any | undefined>;
  
  createResume(resume: any): Promise<any>;
  getResumeByVolunteerId(volunteerId: number): Promise<any | undefined>;
  
  createClarifierSession(session: any): Promise<any>;
  getClarifierSessionById(id: number): Promise<any | undefined>;
  updateClarifierSession(id: number, data: any): Promise<any | undefined>;
  
  createTask(task: any): Promise<any>;
  getAllTasks(): Promise<any[]>;
  getTaskById(id: number): Promise<any | undefined>;
  
  createAssignment(assignment: any): Promise<any>;
  getAssignmentsByVolunteerId(volunteerId: number): Promise<any[]>;
  getPendingAssignments(): Promise<any[]>;
  updateAssignment(id: number, data: any): Promise<any | undefined>;
  
  followUser(followerId: number, followingId: number): Promise<SelectFollow | undefined>;
  unfollowUser(followerId: number, followingId: number): Promise<void>;
  getFollowers(userId: number): Promise<SelectFollow[]>;
  getFollowing(userId: number): Promise<SelectFollow[]>;
  isFollowing(followerId: number, followingId: number): Promise<boolean>;
  
  createEvent(event: InsertEvent): Promise<SelectEvent>;
  getEventById(id: number): Promise<SelectEvent | undefined>;
  getEvents(params: { city?: string; eventType?: string; startDate?: Date; endDate?: Date; limit?: number; offset?: number }): Promise<SelectEvent[]>;
  updateEvent(id: number, data: Partial<SelectEvent>): Promise<SelectEvent | undefined>;
  deleteEvent(id: number): Promise<void>;
  
  createEventRsvp(rsvp: InsertEventRsvp): Promise<SelectEventRsvp | undefined>;
  getEventRsvps(eventId: number): Promise<SelectEventRsvp[]>;
  getUserEventRsvp(eventId: number, userId: number): Promise<SelectEventRsvp | undefined>;
  updateEventRsvp(eventId: number, userId: number, status: string): Promise<SelectEventRsvp | undefined>;
  
  createGroup(group: InsertGroup): Promise<SelectGroup>;
  getGroupById(id: number): Promise<SelectGroup | undefined>;
  getGroups(params: { search?: string; limit?: number; offset?: number }): Promise<SelectGroup[]>;
  
  // Search methods for @mentions autocomplete
  searchUsers(query: string, limit: number): Promise<any[]>;
  searchEvents(query: string, limit: number): Promise<any[]>;
  searchGroups(query: string, limit: number): Promise<any[]>;
  searchCommunities(query: string, limit: number): Promise<any[]>;
  getCommunityById(id: number): Promise<any | undefined>;
  updateGroup(id: number, data: Partial<SelectGroup>): Promise<SelectGroup | undefined>;
  deleteGroup(id: number): Promise<void>;
  
  joinGroup(groupId: number, userId: number): Promise<SelectGroupMember | undefined>;
  leaveGroup(groupId: number, userId: number): Promise<void>;
  getGroupMembers(groupId: number): Promise<SelectGroupMember[]>;
  isGroupMember(groupId: number, userId: number): Promise<boolean>;
  
  getUserConversations(userId: number): Promise<any[]>;
  getOrCreateDirectConversation(userId1: number, userId2: number): Promise<SelectChatRoom>;
  getChatRoomMessages(chatRoomId: number, limit?: number, offset?: number): Promise<SelectChatMessage[]>;
  sendMessage(message: InsertChatMessage): Promise<SelectChatMessage>;
  markConversationAsRead(chatRoomId: number, userId: number): Promise<void>;
  
  createNotification(notification: InsertNotification): Promise<SelectNotification>;
  getUserNotifications(userId: number, limit?: number): Promise<SelectNotification[]>;
  markNotificationAsRead(id: number): Promise<void>;
  
  // Life CEO System
  getAllLifeCeoDomains(): Promise<any[]>;
  getLifeCeoGoalsByUser(userId: number): Promise<any[]>;
  createLifeCeoGoal(goal: any): Promise<any>;
  updateLifeCeoGoal(id: number, data: any): Promise<any | undefined>;
  getLifeCeoTasksByUser(userId: number): Promise<any[]>;
  createLifeCeoTask(task: any): Promise<any>;
  updateLifeCeoTask(id: number, data: any): Promise<any | undefined>;
  getLifeCeoRecommendationsByUser(userId: number): Promise<any[]>;
  
  // Admin Dashboard
  getAdminStats(): Promise<any>;
  getModerationQueue(): Promise<any[]>;
  getRecentAdminActivity(): Promise<any[]>;
  markAllNotificationsAsRead(userId: number): Promise<void>;
  
  // Track 7: Memories
  createMemory(memory: InsertMemory): Promise<SelectMemory>;
  getMemoryById(id: number): Promise<SelectMemory | undefined>;
  getUserMemories(userId: number, params?: { type?: string; limit?: number; offset?: number }): Promise<SelectMemory[]>;
  updateMemory(id: number, data: Partial<SelectMemory>): Promise<SelectMemory | undefined>;
  deleteMemory(id: number): Promise<void>;
  
  // Track 7: Recommendations
  createRecommendation(recommendation: InsertRecommendation): Promise<SelectRecommendation>;
  getUserRecommendations(userId: number, params?: { targetType?: string; status?: string; limit?: number }): Promise<SelectRecommendation[]>;
  updateRecommendationStatus(id: number, status: string): Promise<SelectRecommendation | undefined>;
  deleteRecommendation(id: number): Promise<void>;
  
  // Track 7: Role Invitations
  createRoleInvitation(invitation: InsertRoleInvitation): Promise<SelectRoleInvitation>;
  getRoleInvitationById(id: number): Promise<SelectRoleInvitation | undefined>;
  getUserRoleInvitations(userId: number, params?: { status?: string; role?: string }): Promise<SelectRoleInvitation[]>;
  updateRoleInvitationStatus(id: number, status: string): Promise<SelectRoleInvitation | undefined>;
  deleteRoleInvitation(id: number): Promise<void>;
  
  // Track 7: Favorites
  createFavorite(favorite: InsertFavorite): Promise<SelectFavorite>;
  getUserFavorites(userId: number, params?: { targetType?: string; limit?: number; offset?: number }): Promise<SelectFavorite[]>;
  deleteFavorite(userId: number, targetType: string, targetId: number): Promise<void>;
  isFavorited(userId: number, targetType: string, targetId: number): Promise<boolean>;
  
  // Track 7: Community Stats
  createCommunityStats(stats: InsertCommunityStats): Promise<SelectCommunityStats>;
  getCommunityStatsByCity(city: string, country: string): Promise<SelectCommunityStats | undefined>;
  getAllCommunityStats(params?: { limit?: number; offset?: number }): Promise<SelectCommunityStats[]>;
  updateCommunityStats(id: number, data: Partial<SelectCommunityStats>): Promise<SelectCommunityStats | undefined>;
  
  // Platform Independence: Deployments
  createDeployment(deployment: InsertDeployment): Promise<Deployment>;
  getDeploymentById(id: number): Promise<Deployment | undefined>;
  getDeployments(params: { userId: number; type?: string; status?: string; limit?: number; offset?: number }): Promise<Deployment[]>;
  updateDeployment(id: number, data: Partial<Deployment>): Promise<Deployment | undefined>;
  deleteDeployment(id: number): Promise<void>;
  getDeploymentByVercelId(vercelDeploymentId: string): Promise<Deployment | undefined>;
  getDeploymentByRailwayId(railwayDeploymentId: string): Promise<Deployment | undefined>;
  
  // Platform Independence: Platform Integrations
  createPlatformIntegration(integration: InsertPlatformIntegration): Promise<PlatformIntegration>;
  getPlatformIntegration(userId: number, platform: string): Promise<PlatformIntegration | undefined>;
  updatePlatformIntegration(id: number, data: Partial<PlatformIntegration>): Promise<PlatformIntegration | undefined>;
  deletePlatformIntegration(id: number): Promise<void>;
  
  // Platform Independence: Environment Variables
  createEnvironmentVariable(envVar: InsertEnvironmentVariable): Promise<EnvironmentVariable>;
  getEnvironmentVariableById(id: number): Promise<EnvironmentVariable | undefined>;
  getEnvironmentVariables(params: { userId: number; environment?: string }): Promise<EnvironmentVariable[]>;
  updateEnvironmentVariable(id: number, data: Partial<EnvironmentVariable>): Promise<EnvironmentVariable | undefined>;
  deleteEnvironmentVariable(id: number): Promise<void>;
  
  // Platform Independence: Preview Deployments
  createPreviewDeployment(preview: InsertPreviewDeployment): Promise<PreviewDeployment>;
  getPreviewDeploymentById(id: number): Promise<PreviewDeployment | undefined>;
  getPreviewDeployments(params: { userId: number; status?: string }): Promise<PreviewDeployment[]>;
  updatePreviewDeployment(id: number, data: Partial<PreviewDeployment>): Promise<PreviewDeployment | undefined>;
  deletePreviewDeployment(id: number): Promise<void>;
  expirePreviewDeployment(id: number): Promise<void>;
  getExpiredPreviews(): Promise<PreviewDeployment[]>;
  
  // Platform Independence: Custom Domains (TIER 2.1)
  createCustomDomain(domain: any): Promise<any>;
  getCustomDomains(userId: number): Promise<any[]>;
  updateCustomDomain(id: number, userId: number, data: any): Promise<any | null>;
  deleteCustomDomain(id: number, userId: number): Promise<boolean>;
  
  // Platform Independence: Analytics Events (TIER 2.2)
  createAnalyticsEvent(event: any): Promise<any>;
  getAnalyticsEvents(params: { userId: number; eventType?: string; limit?: number }): Promise<any[]>;
  getAnalyticsSummary(userId: number, days?: number): Promise<any>;
  
  // Platform Independence: Team Members (TIER 2.3)
  createTeamMember(member: any): Promise<any>;
  getTeamMembers(ownerId: number): Promise<any[]>;
  updateTeamMember(id: number, ownerId: number, data: any): Promise<any | null>;
  deleteTeamMember(id: number, ownerId: number): Promise<boolean>;
  
  // Platform Independence: Cost Tracking (TIER 3.1)
  createCostRecord(cost: any): Promise<any>;
  getCostRecords(params: { userId: number; platform?: string; startDate?: Date; endDate?: Date }): Promise<any[]>;
  getCostSummary(userId: number, days?: number): Promise<any>;
  
  // Platform Independence: Database Backups (TIER 3.2)
  createDatabaseBackup(backup: any): Promise<any>;
  getDatabaseBackups(userId: number): Promise<any[]>;
  updateDatabaseBackup(id: number, userId: number, data: any): Promise<any | null>;
  deleteDatabaseBackup(id: number, userId: number): Promise<boolean>;
  
  // Platform Independence: CI/CD Pipelines (TIER 4)
  createCicdPipeline(pipeline: any): Promise<any>;
  getCicdPipelines(userId: number): Promise<any[]>;
  updateCicdPipeline(id: number, userId: number, data: any): Promise<any | null>;
  deleteCicdPipeline(id: number, userId: number): Promise<boolean>;
  createCicdRun(run: any): Promise<any>;
  getCicdRuns(pipelineId: number): Promise<any[]>;
  updateCicdRun(id: number, userId: number, data: any): Promise<any | null>;

  // Search
  search(query: string, userId: number): Promise<any[]>;

  // Admin
  getAdminStats(): Promise<any>;
  getModerationQueue(): Promise<any[]>;
  getRecentAdminActivity(): Promise<any[]>;
}

export class DbStorage implements IStorage {
  async getUserById(id: number): Promise<SelectUser | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<SelectUser | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<SelectUser | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(user: InsertUser): Promise<SelectUser> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  async updateUser(id: number, data: Partial<SelectUser>): Promise<SelectUser | undefined> {
    const result = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return result[0];
  }

  async updateUserPassword(id: number, hashedPassword: string): Promise<void> {
    await db
      .update(users)
      .set({ password: hashedPassword, updatedAt: new Date() })
      .where(eq(users.id, id));
  }

  async createRefreshToken(token: InsertRefreshToken): Promise<SelectRefreshToken> {
    const result = await db.insert(refreshTokens).values(token).returning();
    return result[0];
  }

  async getRefreshToken(token: string): Promise<SelectRefreshToken | undefined> {
    const result = await db
      .select()
      .from(refreshTokens)
      .where(and(
        eq(refreshTokens.token, token),
        gt(refreshTokens.expiresAt, new Date())
      ))
      .limit(1);
    return result[0];
  }

  async deleteRefreshToken(token: string): Promise<void> {
    await db.delete(refreshTokens).where(eq(refreshTokens.token, token));
  }

  async deleteUserRefreshTokens(userId: number): Promise<void> {
    await db.delete(refreshTokens).where(eq(refreshTokens.userId, userId));
  }

  async createEmailVerificationToken(token: InsertEmailVerificationToken): Promise<SelectEmailVerificationToken> {
    const result = await db.insert(emailVerificationTokens).values(token).returning();
    return result[0];
  }

  async getEmailVerificationToken(token: string): Promise<SelectEmailVerificationToken | undefined> {
    const result = await db
      .select()
      .from(emailVerificationTokens)
      .where(and(
        eq(emailVerificationTokens.token, token),
        gt(emailVerificationTokens.expiresAt, new Date())
      ))
      .limit(1);
    return result[0];
  }

  async deleteEmailVerificationToken(token: string): Promise<void> {
    await db.delete(emailVerificationTokens).where(eq(emailVerificationTokens.token, token));
  }

  async createPasswordResetToken(token: InsertPasswordResetToken): Promise<SelectPasswordResetToken> {
    const result = await db.insert(passwordResetTokens).values(token).returning();
    return result[0];
  }

  async getPasswordResetToken(token: string): Promise<SelectPasswordResetToken | undefined> {
    const result = await db
      .select()
      .from(passwordResetTokens)
      .where(and(
        eq(passwordResetTokens.token, token),
        gt(passwordResetTokens.expiresAt, new Date())
      ))
      .limit(1);
    return result[0];
  }

  async deletePasswordResetToken(token: string): Promise<void> {
    await db.delete(passwordResetTokens).where(eq(passwordResetTokens.token, token));
  }

  async deleteUserPasswordResetTokens(userId: number): Promise<void> {
    await db.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, userId));
  }

  async createTwoFactorSecret(secret: InsertTwoFactorSecret): Promise<SelectTwoFactorSecret> {
    const result = await db.insert(twoFactorSecrets).values(secret).returning();
    return result[0];
  }

  async getTwoFactorSecret(userId: number): Promise<SelectTwoFactorSecret | undefined> {
    const result = await db
      .select()
      .from(twoFactorSecrets)
      .where(eq(twoFactorSecrets.userId, userId))
      .limit(1);
    return result[0];
  }

  async updateTwoFactorSecret(userId: number, secret: Partial<SelectTwoFactorSecret>): Promise<void> {
    await db
      .update(twoFactorSecrets)
      .set(secret)
      .where(eq(twoFactorSecrets.userId, userId));
  }

  async deleteTwoFactorSecret(userId: number): Promise<void> {
    await db.delete(twoFactorSecrets).where(eq(twoFactorSecrets.userId, userId));
  }

  async createPost(post: InsertPost): Promise<SelectPost> {
    const result = await db.insert(posts).values(post).returning();
    return result[0];
  }

  async getPostById(id: number): Promise<SelectPost | undefined> {
    const result = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
    return result[0];
  }

  async getPosts(params: { userId?: number; limit?: number; offset?: number }): Promise<SelectPost[]> {
    let query = db.select().from(posts);
    
    if (params.userId) {
      query = query.where(eq(posts.userId, params.userId)) as any;
    }
    
    query = query.orderBy(desc(posts.createdAt)) as any;
    
    if (params.limit) {
      query = query.limit(params.limit) as any;
    }
    
    if (params.offset) {
      query = query.offset(params.offset) as any;
    }
    
    return await query;
  }

  async updatePost(id: number, data: Partial<SelectPost>): Promise<SelectPost | undefined> {
    const result = await db
      .update(posts)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(posts.id, id))
      .returning();
    return result[0];
  }

  async deletePost(id: number): Promise<void> {
    await db.delete(posts).where(eq(posts.id, id));
  }

  async likePost(postId: number, userId: number): Promise<SelectPostLike | undefined> {
    try {
      const result = await db.insert(postLikes).values({ postId, userId }).returning();
      await db.update(posts).set({ likes: sqlOp`${posts.likes} + 1` }).where(eq(posts.id, postId));
      return result[0];
    } catch (error) {
      return undefined;
    }
  }

  async unlikePost(postId: number, userId: number): Promise<void> {
    await db.delete(postLikes).where(and(eq(postLikes.postId, postId), eq(postLikes.userId, userId)));
    await db.update(posts).set({ likes: sqlOp`GREATEST(${posts.likes} - 1, 0)` }).where(eq(posts.id, postId));
  }

  async isPostLikedByUser(postId: number, userId: number): Promise<boolean> {
    const result = await db
      .select()
      .from(postLikes)
      .where(and(eq(postLikes.postId, postId), eq(postLikes.userId, userId)))
      .limit(1);
    return result.length > 0;
  }

  async savePost(postId: number, userId: number): Promise<void> {
    try {
      await db.insert(savedPosts).values({ postId, userId });
    } catch (error) {
      // Ignore duplicate saves
    }
  }

  async unsavePost(postId: number, userId: number): Promise<void> {
    await db.delete(savedPosts).where(and(eq(savedPosts.postId, postId), eq(savedPosts.userId, userId)));
  }

  async reportPost(report: { contentType: string; contentId: number; reporterId: number; reason: string; details: string | null }): Promise<void> {
    await db.insert(moderationQueue).values(report);
  }

  async createPostComment(comment: InsertPostComment): Promise<SelectPostComment> {
    const result = await db.insert(postComments).values(comment).returning();
    await db.update(posts).set({ comments: sqlOp`${posts.comments} + 1` }).where(eq(posts.id, comment.postId));
    return result[0];
  }

  async getPostComments(postId: number): Promise<SelectPostComment[]> {
    return await db.select().from(postComments).where(eq(postComments.postId, postId)).orderBy(asc(postComments.createdAt));
  }

  async followUser(followerId: number, followingId: number): Promise<SelectFollow | undefined> {
    try {
      const result = await db.insert(follows).values({ followerId, followingId }).returning();
      return result[0];
    } catch (error) {
      return undefined;
    }
  }

  async unfollowUser(followerId: number, followingId: number): Promise<void> {
    await db.delete(follows).where(and(eq(follows.followerId, followerId), eq(follows.followingId, followingId)));
  }

  async getFollowers(userId: number): Promise<SelectFollow[]> {
    return await db.select().from(follows).where(eq(follows.followingId, userId));
  }

  async getFollowing(userId: number): Promise<SelectFollow[]> {
    return await db.select().from(follows).where(eq(follows.followerId, userId));
  }

  async isFollowing(followerId: number, followingId: number): Promise<boolean> {
    const result = await db
      .select()
      .from(follows)
      .where(and(eq(follows.followerId, followerId), eq(follows.followingId, followingId)))
      .limit(1);
    return result.length > 0;
  }

  async getUserFriends(userId: number): Promise<any[]> {
    const friendshipsData = await db
      .select({
        id: users.id,
        name: users.name,
        username: users.username,
        email: users.email,
        profileImage: users.profileImage,
        bio: users.bio,
        city: users.city,
        closenessScore: friendships.closenessScore,
        connectionDegree: friendships.connectionDegree,
        lastInteractionAt: friendships.lastInteractionAt,
      })
      .from(friendships)
      .leftJoin(users, eq(friendships.friendId, users.id))
      .where(eq(friendships.userId, userId));
    
    return friendshipsData;
  }

  async getFriendRequests(userId: number): Promise<any[]> {
    const pending = await db
      .select({
        id: friendRequests.id,
        senderId: friendRequests.senderId,
        receiverId: friendRequests.receiverId,
        senderMessage: friendRequests.senderMessage,
        receiverMessage: friendRequests.receiverMessage,
        didWeDance: friendRequests.didWeDance,
        danceLocation: friendRequests.danceLocation,
        danceStory: friendRequests.danceStory,
        mediaUrls: friendRequests.mediaUrls,
        status: friendRequests.status,
        createdAt: friendRequests.createdAt,
        respondedAt: friendRequests.respondedAt,
        senderName: users.name,
        senderUsername: users.username,
        senderEmail: users.email,
        senderProfileImage: users.profileImage,
        senderBio: users.bio,
        senderCity: users.city,
      })
      .from(friendRequests)
      .leftJoin(users, eq(friendRequests.senderId, users.id))
      .where(
        and(
          eq(friendRequests.receiverId, userId),
          eq(friendRequests.status, 'pending')
        )
      );
    
    return pending.map(row => ({
      id: row.id,
      senderId: row.senderId,
      receiverId: row.receiverId,
      senderMessage: row.senderMessage,
      receiverMessage: row.receiverMessage,
      didWeDance: row.didWeDance,
      danceLocation: row.danceLocation,
      danceStory: row.danceStory,
      mediaUrls: row.mediaUrls,
      status: row.status,
      createdAt: row.createdAt,
      respondedAt: row.respondedAt,
      sender: {
        id: row.senderId,
        name: row.senderName,
        username: row.senderUsername,
        email: row.senderEmail,
        profileImage: row.senderProfileImage,
        bio: row.senderBio,
        city: row.senderCity,
      }
    }));
  }

  async getFriendSuggestions(userId: number): Promise<any[]> {
    const myFriends = await db.select({ friendId: friendships.friendId })
      .from(friendships)
      .where(eq(friendships.userId, userId));
    const friendIds = myFriends.map(f => f.friendId);
    
    if (friendIds.length === 0) {
      const rawUsers = await db.select().from(users).where(ne(users.id, userId)).limit(10);
      
      const suggestions = rawUsers.map((u: any) => ({
        id: u.id,
        name: u.name,
        username: u.username,
        email: u.email,
        profileImage: u.profileImage,
        bio: u.bio,
        city: u.city,
      }));
      return suggestions;
    }
    
    const rawSuggestions = await db.select()
      .from(users)
      .where(
        and(
          notInArray(users.id, friendIds),
          ne(users.id, userId)
        )
      )
      .limit(10);
    
    const suggestions = rawSuggestions.map((u: any) => ({
      id: u.id,
      name: u.name,
      username: u.username,
      email: u.email,
      profileImage: u.profileImage,
      bio: u.bio,
      city: u.city,
    }));
    
    return suggestions;
  }

  async sendFriendRequest(data: any): Promise<any> {
    try {
      const result = await db.insert(friendRequests).values({
        senderId: data.senderId,
        receiverId: data.receiverId,
        senderMessage: data.senderMessage || 'Hi! Let\'s connect!',
        senderPrivateNote: data.senderPrivateNote,
        didWeDance: data.didWeDance || false,
        danceLocation: data.danceLocation,
        danceEventId: data.danceEventId,
        danceStory: data.danceStory,
        mediaUrls: data.mediaUrls,
        status: 'pending',
      }).returning();
      return result[0];
    } catch (error) {
      throw new Error('Friend request already exists');
    }
  }

  async acceptFriendRequest(requestId: number): Promise<void> {
    const request = await db.select({
      id: friendRequests.id,
      senderId: friendRequests.senderId,
      receiverId: friendRequests.receiverId,
      didWeDance: friendRequests.didWeDance,
    }).from(friendRequests).where(eq(friendRequests.id, requestId)).limit(1);
    if (!request[0]) throw new Error('Request not found');
    
    const { senderId, receiverId, didWeDance } = request[0];
    const initialScore = didWeDance ? 80 : 75;
    
    await db.update(friendRequests)
      .set({ 
        status: 'accepted', 
        respondedAt: new Date()
      })
      .where(eq(friendRequests.id, requestId));
    
    await db.insert(friendships).values([
      { userId: senderId, friendId: receiverId, closenessScore: initialScore },
      { userId: receiverId, friendId: senderId, closenessScore: initialScore },
    ]);
  }

  async declineFriendRequest(requestId: number): Promise<void> {
    await db
      .update(friendRequests)
      .set({ status: 'declined', respondedAt: new Date() })
      .where(eq(friendRequests.id, requestId));
  }

  async snoozeFriendRequest(requestId: number, days: number): Promise<void> {
    const snoozedUntil = new Date();
    snoozedUntil.setDate(snoozedUntil.getDate() + days);
    
    await db.update(friendRequests)
      .set({ 
        status: 'snoozed',
        snoozedUntil,
      })
      .where(eq(friendRequests.id, requestId));
  }

  async getMutualFriends(userId1: number, userId2: number): Promise<any[]> {
    const user1Friends = await db.select({ friendId: friendships.friendId })
      .from(friendships)
      .where(eq(friendships.userId, userId1));
    
    const user2Friends = await db.select({ friendId: friendships.friendId })
      .from(friendships)
      .where(eq(friendships.userId, userId2));
    
    const user1FriendIds = user1Friends.map(f => f.friendId);
    const user2FriendIds = user2Friends.map(f => f.friendId);
    const mutualIds = user1FriendIds.filter(id => user2FriendIds.includes(id));
    
    if (mutualIds.length === 0) return [];
    
    const rawMutuals = await db.select().from(users).where(inArray(users.id, mutualIds));
    
    return rawMutuals.map((u: any) => ({
      id: u.id,
      name: u.name,
      username: u.username,
      email: u.email,
      profileImage: u.profileImage,
      bio: u.bio,
      city: u.city,
    }));
  }

  async calculateClosenessScore(friendshipId: number): Promise<number> {
    const friendship = await db.select({
      id: friendships.id,
      userId: friendships.userId,
      friendId: friendships.friendId,
      closenessScore: friendships.closenessScore,
      connectionDegree: friendships.connectionDegree,
      lastInteractionAt: friendships.lastInteractionAt,
      createdAt: friendships.createdAt,
      updatedAt: friendships.updatedAt,
    }).from(friendships).where(eq(friendships.id, friendshipId)).limit(1);
    if (!friendship[0]) return 0;
    
    let score = 75;
    
    const activities = await db.select({
      id: friendshipActivities.id,
      friendshipId: friendshipActivities.friendshipId,
      activityType: friendshipActivities.activityType,
      metadata: friendshipActivities.metadata,
      createdAt: friendshipActivities.createdAt,
    })
      .from(friendshipActivities)
      .where(eq(friendshipActivities.friendshipId, friendshipId));
    
    const eventCount = activities.filter(a => a.activityType === 'event_attended_together').length;
    const messageCount = activities.filter(a => a.activityType === 'message_sent').length;
    const danceCount = activities.filter(a => a.activityType === 'dance_together').length;
    
    score += Math.min(eventCount * 5, 25);
    score += Math.min(messageCount, 10);
    score += Math.min(danceCount * 10, 20);
    
    const daysSinceInteraction = friendship[0].lastInteractionAt 
      ? Math.floor((Date.now() - new Date(friendship[0].lastInteractionAt).getTime()) / (1000 * 60 * 60 * 24))
      : 0;
    
    if (daysSinceInteraction > 90) score -= 15;
    else if (daysSinceInteraction > 30) score -= 5;
    
    score = Math.max(0, Math.min(100, score));
    
    await db.update(friendships)
      .set({ closenessScore: score })
      .where(eq(friendships.id, friendshipId));
    
    return score;
  }

  async getConnectionDegree(userId1: number, userId2: number): Promise<number | null> {
    if (userId1 === userId2) return 0;
    
    const directFriendship = await db.select({ id: friendships.id })
      .from(friendships)
      .where(and(eq(friendships.userId, userId1), eq(friendships.friendId, userId2)))
      .limit(1);
    if (directFriendship.length > 0) return 1;
    
    const user1Friends = await db.select({ friendId: friendships.friendId })
      .from(friendships)
      .where(eq(friendships.userId, userId1));
    const user1FriendIds = user1Friends.map(f => f.friendId);
    
    if (user1FriendIds.length === 0) return -1;
    
    const secondDegree = await db.select({ id: friendships.id })
      .from(friendships)
      .where(
        and(
          inArray(friendships.userId, user1FriendIds),
          eq(friendships.friendId, userId2)
        )
      )
      .limit(1);
    if (secondDegree.length > 0) return 2;
    
    const secondDegreeFriends = await db.select({ friendId: friendships.friendId })
      .from(friendships)
      .where(inArray(friendships.userId, user1FriendIds));
    const secondDegreeIds = secondDegreeFriends.map(f => f.friendId);
    
    if (secondDegreeIds.length === 0) return -1;
    
    const thirdDegree = await db.select({ id: friendships.id })
      .from(friendships)
      .where(
        and(
          inArray(friendships.userId, secondDegreeIds),
          eq(friendships.friendId, userId2)
        )
      )
      .limit(1);
    if (thirdDegree.length > 0) return 3;
    
    return null;
  }

  async logFriendshipActivity(friendshipId: number, activityType: string, metadata?: any): Promise<void> {
    await db.insert(friendshipActivities).values({
      friendshipId,
      activityType,
      metadata: metadata ? JSON.stringify(metadata) : null,
    });
    
    await db.update(friendships)
      .set({ lastInteractionAt: new Date() })
      .where(eq(friendships.id, friendshipId));
  }

  async removeFriend(userId: number, friendId: number): Promise<void> {
    await db.delete(friendships).where(
      or(
        and(eq(friendships.userId, userId), eq(friendships.friendId, friendId)),
        and(eq(friendships.userId, friendId), eq(friendships.friendId, userId))
      )
    );
    await db.delete(friendRequests).where(
      or(
        and(eq(friendRequests.senderId, userId), eq(friendRequests.receiverId, friendId)),
        and(eq(friendRequests.senderId, friendId), eq(friendRequests.receiverId, userId))
      )
    );
  }

  async deleteNotification(notificationId: number): Promise<void> {
    await db.delete(notifications).where(eq(notifications.id, notificationId));
  }

  // Communities
  async getCommunityByCity(cityName: string): Promise<any | undefined> {
    const result = await db.select().from(communities).where(eq(communities.cityName, cityName)).limit(1);
    return result[0];
  }

  async createCommunity(data: { name: string; cityName: string; country: string; description?: string }): Promise<any> {
    const result = await db.insert(communities).values(data).returning();
    return result[0];
  }

  async getCommunityMembership(communityId: number, userId: number): Promise<any | undefined> {
    const result = await db.select().from(communityMembers)
      .where(and(eq(communityMembers.communityId, communityId), eq(communityMembers.userId, userId)))
      .limit(1);
    return result[0];
  }

  async joinCommunity(communityId: number, userId: number): Promise<any> {
    const result = await db.insert(communityMembers).values({ communityId, userId }).returning();
    return result[0];
  }

  // Workshops
  async createWorkshop(workshop: any): Promise<any> {
    const result = await db.insert(workshops).values(workshop).returning();
    return result[0];
  }

  async getWorkshops(params: { limit?: number; offset?: number }): Promise<any[]> {
    return await db.select().from(workshops).limit(params.limit || 10).offset(params.offset || 0);
  }

  async getWorkshopById(id: number): Promise<any | undefined> {
    const result = await db.select().from(workshops).where(eq(workshops.id, id)).limit(1);
    return result[0];
  }

  async updateWorkshop(id: number, data: any): Promise<any | undefined> {
    const result = await db.update(workshops).set(data).where(eq(workshops.id, id)).returning();
    return result[0];
  }

  async deleteWorkshop(id: number): Promise<void> {
    await db.delete(workshops).where(eq(workshops.id, id));
  }

  // Reviews
  async createReview(review: any): Promise<any> {
    const result = await db.insert(reviews).values(review).returning();
    return result[0];
  }

  async getReviews(params: { targetType?: string; targetId?: number; userId?: number; limit?: number; offset?: number }): Promise<any[]> {
    let conditions = [];
    if (params.targetType) conditions.push(eq(reviews.targetType, params.targetType));
    if (params.targetId) conditions.push(eq(reviews.targetId, params.targetId));
    if (params.userId) conditions.push(eq(reviews.userId, params.userId));
    
    return await db
      .select()
      .from(reviews)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .limit(params.limit || 10)
      .offset(params.offset || 0);
  }

  async updateReview(id: number, data: any): Promise<any | undefined> {
    const result = await db.update(reviews).set(data).where(eq(reviews.id, id)).returning();
    return result[0];
  }

  async deleteReview(id: number): Promise<void> {
    await db.delete(reviews).where(eq(reviews.id, id));
  }

  // Live Streams
  async createLiveStream(stream: any): Promise<any> {
    const result = await db.insert(liveStreams).values(stream).returning();
    return result[0];
  }

  async getLiveStreams(params: { isLive?: boolean; limit?: number }): Promise<any[]> {
    let query = db.select().from(liveStreams);
    if (params.isLive !== undefined) {
      query = query.where(eq(liveStreams.isLive, params.isLive)) as any;
    }
    return await query.limit(params.limit || 10);
  }

  async getLiveStreamById(id: number): Promise<any | undefined> {
    const result = await db.select().from(liveStreams).where(eq(liveStreams.id, id)).limit(1);
    return result[0];
  }

  async updateLiveStream(id: number, data: any): Promise<any | undefined> {
    const result = await db.update(liveStreams).set(data).where(eq(liveStreams.id, id)).returning();
    return result[0];
  }

  async deleteLiveStream(id: number): Promise<void> {
    await db.delete(liveStreams).where(eq(liveStreams.id, id));
  }

  // Media Gallery
  async createMedia(mediaItem: any): Promise<any> {
    const result = await db.insert(media).values(mediaItem).returning();
    return result[0];
  }

  async getUserMedia(userId: number, params: { type?: string; limit?: number; offset?: number }): Promise<any[]> {
    let conditions = [eq(media.userId, userId)];
    if (params.type) conditions.push(eq(media.type, params.type));
    
    return await db
      .select()
      .from(media)
      .where(and(...conditions))
      .limit(params.limit || 10)
      .offset(params.offset || 0);
  }

  async getMediaById(id: number): Promise<any | undefined> {
    const result = await db.select().from(media).where(eq(media.id, id)).limit(1);
    return result[0];
  }

  async updateMedia(id: number, data: any): Promise<any | undefined> {
    const result = await db.update(media).set(data).where(eq(media.id, id)).returning();
    return result[0];
  }

  async deleteMedia(id: number): Promise<void> {
    await db.delete(media).where(eq(media.id, id));
  }

  // Activity Logs
  async createActivityLog(log: any): Promise<any> {
    const result = await db.insert(activityLogs).values(log).returning();
    return result[0];
  }

  async getUserActivityLogs(userId: number, params: { limit?: number; offset?: number }): Promise<any[]> {
    return await db
      .select()
      .from(activityLogs)
      .where(eq(activityLogs.userId, userId))
      .orderBy(desc(activityLogs.createdAt))
      .limit(params.limit || 20)
      .offset(params.offset || 0);
  }

  // Blocked Users
  async blockUser(userId: number, blockedUserId: number): Promise<any> {
    try {
      const result = await db.insert(blockedUsers).values({ userId, blockedUserId }).returning();
      return result[0];
    } catch (error) {
      throw new Error('User already blocked');
    }
  }

  async unblockUser(userId: number, blockedUserId: number): Promise<void> {
    await db.delete(blockedUsers).where(and(eq(blockedUsers.userId, userId), eq(blockedUsers.blockedUserId, blockedUserId)));
  }

  async getBlockedUsers(userId: number): Promise<any[]> {
    return await db.select().from(blockedUsers).where(eq(blockedUsers.userId, userId));
  }

  async isUserBlocked(userId: number, blockedUserId: number): Promise<boolean> {
    const result = await db
      .select()
      .from(blockedUsers)
      .where(and(eq(blockedUsers.userId, userId), eq(blockedUsers.blockedUserId, blockedUserId)))
      .limit(1);
    return result.length > 0;
  }

  // Blocked Content
  async blockContent(userId: number, contentType: string, contentId: number, reason?: string): Promise<any> {
    const result = await db.insert(blockedContent).values({ userId, contentType, contentId, reason }).returning();
    return result[0];
  }

  async unblockContent(userId: number, contentType: string, contentId: number): Promise<void> {
    await db
      .delete(blockedContent)
      .where(and(eq(blockedContent.userId, userId), eq(blockedContent.contentType, contentType), eq(blockedContent.contentId, contentId)));
  }

  async getBlockedContent(userId: number): Promise<any[]> {
    return await db.select().from(blockedContent).where(eq(blockedContent.userId, userId));
  }

  // Teachers
  async createTeacher(teacher: any): Promise<any> {
    const result = await db.insert(teachers).values(teacher).returning();
    return result[0];
  }

  async getTeachers(params: { verified?: boolean; limit?: number; offset?: number }): Promise<any[]> {
    let query = db.select().from(teachers);
    if (params.verified !== undefined) {
      query = query.where(eq(teachers.verified, params.verified)) as any;
    }
    return await query.limit(params.limit || 10).offset(params.offset || 0);
  }

  async getTeacherById(id: number): Promise<any | undefined> {
    const result = await db.select().from(teachers).where(eq(teachers.id, id)).limit(1);
    return result[0];
  }

  async getTeacherByUserId(userId: number): Promise<any | undefined> {
    const result = await db.select().from(teachers).where(eq(teachers.userId, userId)).limit(1);
    return result[0];
  }

  async updateTeacher(id: number, data: any): Promise<any | undefined> {
    const result = await db.update(teachers).set(data).where(eq(teachers.id, id)).returning();
    return result[0];
  }

  async deleteTeacher(id: number): Promise<void> {
    await db.delete(teachers).where(eq(teachers.id, id));
  }

  // Venues
  async createVenue(venue: any): Promise<any> {
    const result = await db.insert(venues).values(venue).returning();
    return result[0];
  }

  async getVenues(params: { city?: string; verified?: boolean; limit?: number; offset?: number }): Promise<any[]> {
    let conditions = [];
    if (params.city) conditions.push(eq(venues.city, params.city));
    if (params.verified !== undefined) conditions.push(eq(venues.verified, params.verified));
    
    return await db
      .select()
      .from(venues)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .limit(params.limit || 10)
      .offset(params.offset || 0);
  }

  async getVenueById(id: number): Promise<any | undefined> {
    const result = await db.select().from(venues).where(eq(venues.id, id)).limit(1);
    return result[0];
  }

  async updateVenue(id: number, data: any): Promise<any | undefined> {
    const result = await db.update(venues).set(data).where(eq(venues.id, id)).returning();
    return result[0];
  }

  async deleteVenue(id: number): Promise<void> {
    await db.delete(venues).where(eq(venues.id, id));
  }

  // Tutorials
  async createTutorial(tutorial: any): Promise<any> {
    const result = await db.insert(tutorials).values(tutorial).returning();
    return result[0];
  }

  async getTutorials(params: { level?: string; limit?: number; offset?: number }): Promise<any[]> {
    let query = db.select().from(tutorials);
    if (params.level) {
      query = query.where(eq(tutorials.level, params.level)) as any;
    }
    return await query.limit(params.limit || 10).offset(params.offset || 0);
  }

  async getTutorialById(id: number): Promise<any | undefined> {
    const result = await db.select().from(tutorials).where(eq(tutorials.id, id)).limit(1);
    return result[0];
  }

  async updateTutorial(id: number, data: any): Promise<any | undefined> {
    const result = await db.update(tutorials).set(data).where(eq(tutorials.id, id)).returning();
    return result[0];
  }

  async deleteTutorial(id: number): Promise<void> {
    await db.delete(tutorials).where(eq(tutorials.id, id));
  }

  // Blog Posts
  async createBlogPost(post: any): Promise<any> {
    const result = await db.insert(blogPosts).values(post).returning();
    return result[0];
  }

  async getBlogPosts(params: { published?: boolean; authorId?: number; limit?: number; offset?: number }): Promise<any[]> {
    let conditions = [];
    if (params.published !== undefined) conditions.push(eq(blogPosts.published, params.published));
    if (params.authorId) conditions.push(eq(blogPosts.authorId, params.authorId));
    
    return await db
      .select()
      .from(blogPosts)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(blogPosts.createdAt))
      .limit(params.limit || 10)
      .offset(params.offset || 0);
  }

  async getBlogPostById(id: number): Promise<any | undefined> {
    const result = await db.select().from(blogPosts).where(eq(blogPosts.id, id)).limit(1);
    return result[0];
  }

  async getBlogPostBySlug(slug: string): Promise<any | undefined> {
    const result = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug)).limit(1);
    return result[0];
  }

  async updateBlogPost(id: number, data: any): Promise<any | undefined> {
    const result = await db.update(blogPosts).set(data).where(eq(blogPosts.id, id)).returning();
    return result[0];
  }

  async deleteBlogPost(id: number): Promise<void> {
    await db.delete(blogPosts).where(eq(blogPosts.id, id));
  }

  // Newsletter Subscriptions
  async createNewsletterSubscription(subscription: any): Promise<any> {
    const result = await db.insert(newsletterSubscriptions).values(subscription).returning();
    return result[0];
  }

  async getNewsletterSubscriptions(params: { subscribed?: boolean }): Promise<any[]> {
    let query = db.select().from(newsletterSubscriptions);
    if (params.subscribed !== undefined) {
      query = query.where(eq(newsletterSubscriptions.subscribed, params.subscribed)) as any;
    }
    return await query;
  }

  async updateNewsletterSubscription(email: string, data: any): Promise<any | undefined> {
    const result = await db.update(newsletterSubscriptions).set(data).where(eq(newsletterSubscriptions.email, email)).returning();
    return result[0];
  }

  async deleteNewsletterSubscription(email: string): Promise<void> {
    await db.delete(newsletterSubscriptions).where(eq(newsletterSubscriptions.email, email));
  }

  // Bookings
  async createBooking(booking: any): Promise<any> {
    const result = await db.insert(bookings).values(booking).returning();
    return result[0];
  }

  async getBookingById(id: number): Promise<any | undefined> {
    const result = await db.select().from(bookings).where(eq(bookings.id, id)).limit(1);
    return result[0];
  }

  async getBookingByConfirmation(confirmationNumber: string): Promise<any | undefined> {
    const result = await db.select().from(bookings).where(eq(bookings.confirmationNumber, confirmationNumber)).limit(1);
    return result[0];
  }

  async getUserBookings(userId: number, params: { status?: string }): Promise<any[]> {
    let conditions = [eq(bookings.userId, userId)];
    if (params.status) conditions.push(eq(bookings.status, params.status));
    
    return await db
      .select()
      .from(bookings)
      .where(and(...conditions))
      .orderBy(desc(bookings.createdAt));
  }

  async updateBooking(id: number, data: any): Promise<any | undefined> {
    const result = await db.update(bookings).set(data).where(eq(bookings.id, id)).returning();
    return result[0];
  }

  async deleteBooking(id: number): Promise<void> {
    await db.delete(bookings).where(eq(bookings.id, id));
  }

  // Talent Match - Volunteers
  async createVolunteer(volunteer: any): Promise<any> {
    const result = await db.insert(volunteers).values(volunteer).returning();
    return result[0];
  }

  async getVolunteerById(id: number): Promise<any | undefined> {
    const result = await db.select().from(volunteers).where(eq(volunteers.id, id)).limit(1);
    return result[0];
  }

  async getVolunteerByUserId(userId: number): Promise<any | undefined> {
    const result = await db.select().from(volunteers).where(eq(volunteers.userId, userId)).limit(1);
    return result[0];
  }

  // Talent Match - Resumes
  async createResume(resume: any): Promise<any> {
    const result = await db.insert(resumes).values(resume).returning();
    return result[0];
  }

  async getResumeByVolunteerId(volunteerId: number): Promise<any | undefined> {
    const result = await db.select().from(resumes).where(eq(resumes.volunteerId, volunteerId)).limit(1);
    return result[0];
  }

  // Talent Match - Clarifier Sessions
  async createClarifierSession(session: any): Promise<any> {
    const result = await db.insert(clarifierSessions).values(session).returning();
    return result[0];
  }

  async getClarifierSessionById(id: number): Promise<any | undefined> {
    const result = await db.select().from(clarifierSessions).where(eq(clarifierSessions.id, id)).limit(1);
    return result[0];
  }

  async updateClarifierSession(id: number, data: any): Promise<any | undefined> {
    const result = await db.update(clarifierSessions).set(data).where(eq(clarifierSessions.id, id)).returning();
    return result[0];
  }

  // Talent Match - Tasks
  async createTask(task: any): Promise<any> {
    const result = await db.insert(tasks).values(task).returning();
    return result[0];
  }

  async getAllTasks(): Promise<any[]> {
    return await db.select().from(tasks).orderBy(desc(tasks.createdAt));
  }

  async getTaskById(id: number): Promise<any | undefined> {
    const result = await db.select().from(tasks).where(eq(tasks.id, id)).limit(1);
    return result[0];
  }

  // Talent Match - Assignments
  async createAssignment(assignment: any): Promise<any> {
    const result = await db.insert(assignments).values(assignment).returning();
    return result[0];
  }

  async getAssignmentsByVolunteerId(volunteerId: number): Promise<any[]> {
    return await db
      .select()
      .from(assignments)
      .where(eq(assignments.volunteerId, volunteerId))
      .orderBy(desc(assignments.createdAt));
  }

  async getPendingAssignments(): Promise<any[]> {
    return await db
      .select()
      .from(assignments)
      .where(eq(assignments.status, 'pending'))
      .orderBy(desc(assignments.createdAt));
  }

  async updateAssignment(id: number, data: any): Promise<any | undefined> {
    const result = await db.update(assignments).set(data).where(eq(assignments.id, id)).returning();
    return result[0];
  }

  async createEvent(event: InsertEvent): Promise<SelectEvent> {
    const result = await db.insert(events).values(event).returning();
    return result[0];
  }

  async getEventById(id: number): Promise<SelectEvent | undefined> {
    const result = await db.select().from(events).where(eq(events.id, id)).limit(1);
    return result[0];
  }

  async getEvents(params: { city?: string; eventType?: string; startDate?: Date; endDate?: Date; limit?: number; offset?: number }): Promise<SelectEvent[]> {
    let conditions = [];
    
    if (params.city) {
      conditions.push(eq(events.city, params.city));
    }
    
    if (params.eventType) {
      conditions.push(eq(events.eventType, params.eventType));
    }
    
    if (params.startDate) {
      conditions.push(gte(events.startDate, params.startDate));
    }
    
    if (params.endDate) {
      conditions.push(lte(events.startDate, params.endDate));
    }
    
    let query = db.select().from(events);
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }
    
    query = query.orderBy(asc(events.startDate)) as any;
    
    if (params.limit) {
      query = query.limit(params.limit) as any;
    }
    
    if (params.offset) {
      query = query.offset(params.offset) as any;
    }
    
    return await query;
  }

  async updateEvent(id: number, data: Partial<SelectEvent>): Promise<SelectEvent | undefined> {
    const result = await db
      .update(events)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(events.id, id))
      .returning();
    return result[0];
  }

  async deleteEvent(id: number): Promise<void> {
    await db.delete(events).where(eq(events.id, id));
  }

  async createEventRsvp(rsvp: InsertEventRsvp): Promise<SelectEventRsvp | undefined> {
    try {
      const result = await db.insert(eventRsvps).values(rsvp).returning();
      return result[0];
    } catch (error) {
      return undefined;
    }
  }

  async getEventRsvps(eventId: number): Promise<SelectEventRsvp[]> {
    return await db.select().from(eventRsvps).where(eq(eventRsvps.eventId, eventId));
  }

  async getUserEventRsvp(eventId: number, userId: number): Promise<SelectEventRsvp | undefined> {
    const result = await db
      .select()
      .from(eventRsvps)
      .where(and(eq(eventRsvps.eventId, eventId), eq(eventRsvps.userId, userId)))
      .limit(1);
    return result[0];
  }

  async updateEventRsvp(eventId: number, userId: number, status: string): Promise<SelectEventRsvp | undefined> {
    const result = await db
      .update(eventRsvps)
      .set({ status })
      .where(and(eq(eventRsvps.eventId, eventId), eq(eventRsvps.userId, userId)))
      .returning();
    return result[0];
  }

  async createGroup(group: InsertGroup): Promise<SelectGroup> {
    const result = await db.insert(groups).values(group).returning();
    return result[0];
  }

  async getGroupById(id: number): Promise<SelectGroup | undefined> {
    const result = await db.select().from(groups).where(eq(groups.id, id)).limit(1);
    return result[0];
  }

  async getGroups(params: { search?: string; limit?: number; offset?: number }): Promise<SelectGroup[]> {
    let query = db.select().from(groups);
    
    if (params.search) {
      query = query.where(or(ilike(groups.name, `%${params.search}%`), ilike(groups.description, `%${params.search}%`))) as any;
    }
    
    query = query.orderBy(desc(groups.createdAt)) as any;
    
    if (params.limit) {
      query = query.limit(params.limit) as any;
    }
    
    if (params.offset) {
      query = query.offset(params.offset) as any;
    }
    
    return await query;
  }

  async updateGroup(id: number, data: Partial<SelectGroup>): Promise<SelectGroup | undefined> {
    const result = await db
      .update(groups)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(groups.id, id))
      .returning();
    return result[0];
  }

  async deleteGroup(id: number): Promise<void> {
    await db.delete(groups).where(eq(groups.id, id));
  }

  async joinGroup(groupId: number, userId: number): Promise<SelectGroupMember | undefined> {
    try {
      const result = await db.insert(groupMembers).values({ groupId, userId }).returning();
      await db.update(groups).set({ memberCount: sqlOp`${groups.memberCount} + 1` }).where(eq(groups.id, groupId));
      return result[0];
    } catch (error) {
      return undefined;
    }
  }

  async leaveGroup(groupId: number, userId: number): Promise<void> {
    await db.delete(groupMembers).where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, userId)));
    await db.update(groups).set({ memberCount: sqlOp`GREATEST(${groups.memberCount} - 1, 0)` }).where(eq(groups.id, groupId));
  }

  async getGroupMembers(groupId: number): Promise<SelectGroupMember[]> {
    return await db.select().from(groupMembers).where(eq(groupMembers.groupId, groupId));
  }

  async isGroupMember(groupId: number, userId: number): Promise<boolean> {
    const result = await db
      .select()
      .from(groupMembers)
      .where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, userId)))
      .limit(1);
    return result.length > 0;
  }

  async getUserConversations(userId: number): Promise<any[]> {
    const userRooms = await db
      .select()
      .from(chatRoomUsers)
      .where(eq(chatRoomUsers.userId, userId));
    
    const roomIds = userRooms.map(r => r.chatRoomId);
    
    if (roomIds.length === 0) {
      return [];
    }
    
    const rooms = await db
      .select()
      .from(chatRooms)
      .where(inArray(chatRooms.id, roomIds))
      .orderBy(desc(chatRooms.lastMessageAt));
    
    return rooms;
  }

  async getOrCreateDirectConversation(userId1: number, userId2: number): Promise<SelectChatRoom> {
    const userRooms1 = await db
      .select()
      .from(chatRoomUsers)
      .where(eq(chatRoomUsers.userId, userId1));
    
    const userRooms2 = await db
      .select()
      .from(chatRoomUsers)
      .where(eq(chatRoomUsers.userId, userId2));
    
    const commonRoomIds = userRooms1
      .map(r => r.chatRoomId)
      .filter(id => userRooms2.some(r => r.chatRoomId === id));
    
    if (commonRoomIds.length > 0) {
      const existingRoom = await db
        .select()
        .from(chatRooms)
        .where(and(eq(chatRooms.id, commonRoomIds[0]), eq(chatRooms.type, "direct")))
        .limit(1);
      
      if (existingRoom[0]) {
        return existingRoom[0];
      }
    }
    
    const newRoom = await db.insert(chatRooms).values({ type: "direct" }).returning();
    await db.insert(chatRoomUsers).values([
      { chatRoomId: newRoom[0].id, userId: userId1 },
      { chatRoomId: newRoom[0].id, userId: userId2 }
    ]);
    
    return newRoom[0];
  }

  async getChatRoomMessages(chatRoomId: number, limit?: number, offset?: number): Promise<SelectChatMessage[]> {
    let query = db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.chatRoomId, chatRoomId))
      .orderBy(desc(chatMessages.createdAt));
    
    if (limit) {
      query = query.limit(limit) as any;
    }
    
    if (offset) {
      query = query.offset(offset) as any;
    }
    
    return await query;
  }

  async sendMessage(message: InsertChatMessage): Promise<SelectChatMessage> {
    const result = await db.insert(chatMessages).values(message).returning();
    await db
      .update(chatRooms)
      .set({ lastMessageAt: new Date() })
      .where(eq(chatRooms.id, message.chatRoomId));
    return result[0];
  }

  async markConversationAsRead(chatRoomId: number, userId: number): Promise<void> {
    await db
      .update(chatRoomUsers)
      .set({ lastReadAt: new Date() })
      .where(and(eq(chatRoomUsers.chatRoomId, chatRoomId), eq(chatRoomUsers.userId, userId)));
  }

  async createNotification(notification: InsertNotification): Promise<SelectNotification> {
    const result = await db.insert(notifications).values(notification).returning();
    return result[0];
  }

  async getUserNotifications(userId: number, limit?: number): Promise<SelectNotification[]> {
    let query = db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
    
    if (limit) {
      query = query.limit(limit) as any;
    }
    
    return await query;
  }

  async markNotificationAsRead(id: number): Promise<void> {
    await db.update(notifications).set({ read: true }).where(eq(notifications.id, id));
  }

  async markAllNotificationsAsRead(userId: number): Promise<void> {
    await db.update(notifications).set({ read: true }).where(eq(notifications.userId, userId));
  }

  // Platform Independence: Deployments
  async createDeployment(deployment: InsertDeployment): Promise<Deployment> {
    const result = await db.insert(deployments).values(deployment).returning();
    return result[0];
  }

  async getDeploymentById(id: number): Promise<Deployment | undefined> {
    const result = await db.select().from(deployments).where(eq(deployments.id, id)).limit(1);
    return result[0];
  }

  async getDeployments(params: { userId: number; type?: string; status?: string; limit?: number; offset?: number }): Promise<Deployment[]> {
    const conditions = [eq(deployments.userId, params.userId)];
    
    if (params.type) {
      conditions.push(eq(deployments.type, params.type));
    }
    if (params.status) {
      conditions.push(eq(deployments.status, params.status));
    }
    
    let query = db.select().from(deployments).where(and(...conditions)).orderBy(desc(deployments.createdAt));
    
    if (params.limit) {
      query = query.limit(params.limit) as any;
    }
    if (params.offset) {
      query = query.offset(params.offset) as any;
    }
    
    return await query;
  }

  async updateDeployment(id: number, data: Partial<Deployment>): Promise<Deployment | undefined> {
    const result = await db
      .update(deployments)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(deployments.id, id))
      .returning();
    return result[0];
  }

  async deleteDeployment(id: number): Promise<void> {
    await db.delete(deployments).where(eq(deployments.id, id));
  }

  async getDeploymentByVercelId(vercelDeploymentId: string): Promise<Deployment | undefined> {
    const result = await db.select().from(deployments).where(eq(deployments.vercelDeploymentId, vercelDeploymentId)).limit(1);
    return result[0];
  }

  async getDeploymentByRailwayId(railwayDeploymentId: string): Promise<Deployment | undefined> {
    const result = await db.select().from(deployments).where(eq(deployments.railwayDeploymentId, railwayDeploymentId)).limit(1);
    return result[0];
  }

  // Platform Independence: Platform Integrations
  async createPlatformIntegration(integration: InsertPlatformIntegration): Promise<PlatformIntegration> {
    const result = await db.insert(platformIntegrations).values(integration).returning();
    return result[0];
  }

  async getPlatformIntegration(userId: number, platform: string): Promise<PlatformIntegration | undefined> {
    const result = await db
      .select()
      .from(platformIntegrations)
      .where(and(eq(platformIntegrations.userId, userId), eq(platformIntegrations.platform, platform)))
      .limit(1);
    return result[0];
  }

  async updatePlatformIntegration(id: number, data: Partial<PlatformIntegration>): Promise<PlatformIntegration | undefined> {
    const result = await db
      .update(platformIntegrations)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(platformIntegrations.id, id))
      .returning();
    return result[0];
  }

  async deletePlatformIntegration(id: number): Promise<void> {
    await db.delete(platformIntegrations).where(eq(platformIntegrations.id, id));
  }

  // Platform Independence: Environment Variables
  async createEnvironmentVariable(envVar: InsertEnvironmentVariable): Promise<EnvironmentVariable> {
    const result = await db.insert(environmentVariables).values(envVar).returning();
    return result[0];
  }

  async getEnvironmentVariableById(id: number): Promise<EnvironmentVariable | undefined> {
    const result = await db.select().from(environmentVariables).where(eq(environmentVariables.id, id)).limit(1);
    return result[0];
  }

  async getEnvironmentVariables(params: { userId: number; environment?: string }): Promise<EnvironmentVariable[]> {
    const conditions = [eq(environmentVariables.userId, params.userId)];
    
    if (params.environment) {
      conditions.push(eq(environmentVariables.environment, params.environment));
    }
    
    return await db
      .select()
      .from(environmentVariables)
      .where(and(...conditions))
      .orderBy(asc(environmentVariables.key));
  }

  async updateEnvironmentVariable(id: number, data: Partial<EnvironmentVariable>): Promise<EnvironmentVariable | undefined> {
    const result = await db
      .update(environmentVariables)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(environmentVariables.id, id))
      .returning();
    return result[0];
  }

  async deleteEnvironmentVariable(id: number): Promise<void> {
    await db.delete(environmentVariables).where(eq(environmentVariables.id, id));
  }

  // Platform Independence: Preview Deployments
  async createPreviewDeployment(preview: InsertPreviewDeployment): Promise<PreviewDeployment> {
    const result = await db.insert(previewDeployments).values(preview).returning();
    return result[0];
  }

  async getPreviewDeploymentById(id: number): Promise<PreviewDeployment | undefined> {
    const result = await db.select().from(previewDeployments).where(eq(previewDeployments.id, id)).limit(1);
    return result[0];
  }

  async getPreviewDeployments(params: { userId: number; status?: string }): Promise<PreviewDeployment[]> {
    const conditions = [eq(previewDeployments.userId, params.userId)];
    if (params.status) {
      conditions.push(eq(previewDeployments.status, params.status));
    }
    return await db.select().from(previewDeployments).where(and(...conditions)).orderBy(desc(previewDeployments.createdAt));
  }

  async updatePreviewDeployment(id: number, data: Partial<PreviewDeployment>): Promise<PreviewDeployment | undefined> {
    const result = await db
      .update(previewDeployments)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(previewDeployments.id, id))
      .returning();
    return result[0];
  }

  async deletePreviewDeployment(id: number): Promise<void> {
    await db.delete(previewDeployments).where(eq(previewDeployments.id, id));
  }

  async expirePreviewDeployment(id: number): Promise<void> {
    await db
      .update(previewDeployments)
      .set({ status: 'expired', expiredAt: new Date(), updatedAt: new Date() })
      .where(eq(previewDeployments.id, id));
  }

  async getExpiredPreviews(): Promise<PreviewDeployment[]> {
    return await db
      .select()
      .from(previewDeployments)
      .where(and(
        eq(previewDeployments.status, 'active'),
        lt(previewDeployments.expiresAt, new Date())
      ));
  }

  // TIER 2.1: Custom Domains
  async createCustomDomain(domain: any): Promise<any> {
    const result = await db.insert(customDomains).values(domain).returning();
    return result[0];
  }

  async getCustomDomains(userId: number): Promise<any[]> {
    return await db.select().from(customDomains).where(eq(customDomains.userId, userId)).orderBy(desc(customDomains.createdAt));
  }

  async updateCustomDomain(id: number, userId: number, data: any): Promise<any | null> {
    const result = await db.update(customDomains).set({ ...data, updatedAt: new Date() }).where(and(eq(customDomains.id, id), eq(customDomains.userId, userId))).returning();
    return result[0] || null;
  }

  async deleteCustomDomain(id: number, userId: number): Promise<boolean> {
    const result = await db.delete(customDomains).where(and(eq(customDomains.id, id), eq(customDomains.userId, userId))).returning();
    return result.length > 0;
  }

  // TIER 2.2: Analytics Events
  async createAnalyticsEvent(event: any): Promise<any> {
    const result = await db.insert(analyticsEvents).values(event).returning();
    return result[0];
  }

  async getAnalyticsEvents(params: { userId: number; eventType?: string; limit?: number }): Promise<any[]> {
    const conditions = [eq(analyticsEvents.userId, params.userId)];
    if (params.eventType) conditions.push(eq(analyticsEvents.eventType, params.eventType));
    
    let query = db.select().from(analyticsEvents).where(and(...conditions)) as any;
    query = query.orderBy(desc(analyticsEvents.timestamp)) as any;
    if (params.limit) query = query.limit(params.limit) as any;
    
    return await query;
  }

  async getAnalyticsSummary(userId: number, days: number = 30): Promise<any> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const events = await db
      .select()
      .from(analyticsEvents)
      .where(and(
        eq(analyticsEvents.userId, userId),
        gte(analyticsEvents.timestamp, startDate)
      ));
    
    return {
      totalEvents: events.length,
      eventsByType: events.reduce((acc: any, e: any) => {
        acc[e.eventType] = (acc[e.eventType] || 0) + 1;
        return acc;
      }, {}),
    };
  }

  // TIER 2.3: Team Members
  async createTeamMember(member: any): Promise<any> {
    const result = await db.insert(teamMembers).values(member).returning();
    return result[0];
  }

  async getTeamMembers(ownerId: number): Promise<any[]> {
    return await db.select().from(teamMembers).where(eq(teamMembers.ownerId, ownerId)).orderBy(desc(teamMembers.createdAt));
  }

  async updateTeamMember(id: number, ownerId: number, data: any): Promise<any | null> {
    const result = await db.update(teamMembers).set({ ...data, updatedAt: new Date() }).where(and(eq(teamMembers.id, id), eq(teamMembers.ownerId, ownerId))).returning();
    return result[0] || null;
  }

  async deleteTeamMember(id: number, ownerId: number): Promise<boolean> {
    const result = await db.delete(teamMembers).where(and(eq(teamMembers.id, id), eq(teamMembers.ownerId, ownerId))).returning();
    return result.length > 0;
  }

  // TIER 3.1: Cost Tracking
  async createCostRecord(cost: any): Promise<any> {
    const result = await db.insert(costRecords).values(cost).returning();
    return result[0];
  }

  async getCostRecords(params: { userId: number; platform?: string; startDate?: Date; endDate?: Date }): Promise<any[]> {
    const conditions = [eq(costRecords.userId, params.userId)];
    if (params.platform) conditions.push(eq(costRecords.platform, params.platform));
    if (params.startDate) conditions.push(gte(costRecords.billingPeriodStart, params.startDate));
    if (params.endDate) conditions.push(lte(costRecords.billingPeriodEnd, params.endDate));
    
    return await db.select().from(costRecords).where(and(...conditions)).orderBy(desc(costRecords.billingPeriodStart));
  }

  async getCostSummary(userId: number, days: number = 30): Promise<any> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const costs = await db
      .select()
      .from(costRecords)
      .where(and(
        eq(costRecords.userId, userId),
        gte(costRecords.billingPeriodStart, startDate)
      ));
    
    const totalCost = costs.reduce((sum: number, c: any) => sum + c.amount, 0);
    const byPlatform = costs.reduce((acc: any, c: any) => {
      acc[c.platform] = (acc[c.platform] || 0) + c.amount;
      return acc;
    }, {});
    
    return { totalCost, byPlatform, costRecords: costs };
  }

  // TIER 3.2: Database Backups
  async createDatabaseBackup(backup: any): Promise<any> {
    const result = await db.insert(databaseBackups).values(backup).returning();
    return result[0];
  }

  async getDatabaseBackups(userId: number): Promise<any[]> {
    return await db.select().from(databaseBackups).where(eq(databaseBackups.userId, userId)).orderBy(desc(databaseBackups.createdAt));
  }

  async updateDatabaseBackup(id: number, userId: number, data: any): Promise<any | null> {
    const result = await db.update(databaseBackups).set(data).where(and(eq(databaseBackups.id, id), eq(databaseBackups.userId, userId))).returning();
    return result[0] || null;
  }

  async deleteDatabaseBackup(id: number, userId: number): Promise<boolean> {
    const result = await db.delete(databaseBackups).where(and(eq(databaseBackups.id, id), eq(databaseBackups.userId, userId))).returning();
    return result.length > 0;
  }

  // TIER 4: CI/CD Pipelines
  async createCicdPipeline(pipeline: any): Promise<any> {
    const result = await db.insert(cicdPipelines).values(pipeline).returning();
    return result[0];
  }

  async getCicdPipelines(userId: number): Promise<any[]> {
    return await db.select().from(cicdPipelines).where(eq(cicdPipelines.userId, userId)).orderBy(desc(cicdPipelines.createdAt));
  }

  async updateCicdPipeline(id: number, userId: number, data: any): Promise<any | null> {
    const result = await db.update(cicdPipelines).set({ ...data, updatedAt: new Date() }).where(and(eq(cicdPipelines.id, id), eq(cicdPipelines.userId, userId))).returning();
    return result[0] || null;
  }

  async deleteCicdPipeline(id: number, userId: number): Promise<boolean> {
    const result = await db.delete(cicdPipelines).where(and(eq(cicdPipelines.id, id), eq(cicdPipelines.userId, userId))).returning();
    return result.length > 0;
  }

  async createCicdRun(run: any): Promise<any> {
    const result = await db.insert(cicdRuns).values(run).returning();
    return result[0];
  }

  async getCicdRuns(pipelineId: number): Promise<any[]> {
    return await db.select().from(cicdRuns).where(eq(cicdRuns.pipelineId, pipelineId)).orderBy(desc(cicdRuns.createdAt));
  }

  async updateCicdRun(id: number, userId: number, data: any): Promise<any | null> {
    const result = await db.update(cicdRuns).set(data).where(and(eq(cicdRuns.id, id), eq(cicdRuns.userId, userId))).returning();
    return result[0] || null;
  }

  // Search implementation
  async search(query: string, userId: number): Promise<any[]> {
    const lowerQuery = `%${query.toLowerCase()}%`;
    const results: any[] = [];

    // Search users
    const userResults = await db.select({
      id: users.id,
      type: sql<string>`'user'`,
      title: users.username,
      subtitle: users.email,
      image: users.profileImage,
      url: sql<string>`'/profile/' || ${users.id}`,
    }).from(users).where(
      or(
        ilike(users.username, lowerQuery),
        ilike(users.email, lowerQuery),
        ilike(users.name, lowerQuery)
      )
    ).limit(5);
    results.push(...userResults);

    // Search posts
    const postResults = await db.select({
      id: posts.id,
      type: sql<string>`'post'`,
      title: posts.content,
      subtitle: users.username,
      image: users.profileImage,
      url: sql<string>`'/feed#post-' || ${posts.id}`,
    }).from(posts)
      .leftJoin(users, eq(posts.userId, users.id))
      .where(ilike(posts.content, lowerQuery))
      .limit(5);
    results.push(...postResults);

    // Search events
    const eventResults = await db.select({
      id: events.id,
      type: sql<string>`'event'`,
      title: events.title,
      subtitle: events.location,
      image: events.imageUrl,
      url: sql<string>`'/events/' || ${events.id}`,
    }).from(events)
      .where(
        or(
          ilike(events.title, lowerQuery),
          ilike(events.description, lowerQuery),
          ilike(events.location, lowerQuery)
        )
      )
      .limit(5);
    results.push(...eventResults);

    // Search groups
    const groupResults = await db.select({
      id: groups.id,
      type: sql<string>`'group'`,
      title: groups.name,
      subtitle: groups.description,
      image: groups.avatar,
      url: sql<string>`'/groups/' || ${groups.id}`,
    }).from(groups)
      .where(
        or(
          ilike(groups.name, lowerQuery),
          ilike(groups.description, lowerQuery)
        )
      )
      .limit(5);
    results.push(...groupResults);

    return results;
  }

  // Admin stats implementation
  async getAdminStats(): Promise<any> {
    const [totalUsersResult] = await db.select({ count: sql<number>`count(*)` }).from(users);
    const [activeUsersResult] = await db.select({ count: sql<number>`count(*)` })
      .from(users)
      .where(gte(users.updatedAt, new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)));
    const [totalPostsResult] = await db.select({ count: sql<number>`count(*)` }).from(posts);
    const [totalEventsResult] = await db.select({ count: sql<number>`count(*)` }).from(events);
    const [pendingReportsResult] = await db.select({ count: sql<number>`count(*)` })
      .from(moderationQueue)
      .where(eq(moderationQueue.status, 'pending'));
    const [resolvedReportsResult] = await db.select({ count: sql<number>`count(*)` })
      .from(moderationQueue)
      .where(eq(moderationQueue.status, 'resolved'));

    return {
      totalUsers: totalUsersResult.count,
      activeUsers: activeUsersResult.count,
      totalPosts: totalPostsResult.count,
      totalEvents: totalEventsResult.count,
      pendingReports: pendingReportsResult.count,
      resolvedReports: resolvedReportsResult.count,
      userGrowth: 12.5,
      engagementRate: 67.3,
    };
  }

  // Moderation queue implementation
  async getModerationQueue(): Promise<any[]> {
    const queue = await db.select({
      id: moderationQueue.id,
      type: moderationQueue.contentType,
      reportedBy: users.username,
      reason: moderationQueue.reason,
      status: moderationQueue.status,
      createdAt: moderationQueue.createdAt,
      contentPreview: moderationQueue.details,
    })
    .from(moderationQueue)
    .leftJoin(users, eq(moderationQueue.reporterId, users.id))
    .where(eq(moderationQueue.status, 'pending'))
    .orderBy(desc(moderationQueue.createdAt))
    .limit(20);

    return queue.map((item) => ({
      ...item,
      createdAt: item.createdAt?.toISOString() || new Date().toISOString(),
      contentPreview: item.contentPreview || 'No preview available',
    }));
  }

  // Recent admin activity implementation  
  async getRecentAdminActivity(): Promise<any[]> {
    const activities = await db.select({
      id: activityLogs.id,
      userId: activityLogs.userId,
      type: activityLogs.type,
      user: users.username,
      text: activityLogs.text,
      time: activityLogs.time,
      createdAt: activityLogs.createdAt,
    })
    .from(activityLogs)
    .leftJoin(users, eq(activityLogs.userId, users.id))
    .orderBy(desc(activityLogs.createdAt))
    .limit(15);

    return activities.map((activity) => ({
      ...activity,
      timestamp: activity.time || new Date().toISOString(),
      action: activity.text || `performed ${activity.type}`,
    }));
  }

  // @mentions search implementations
  async searchUsers(query: string, limit: number): Promise<any[]> {
    const lowerQuery = `%${query.toLowerCase()}%`;
    const results = await db.select({
      id: users.id,
      username: users.username,
      name: users.name,
      bio: users.bio,
      profileImage: users.profileImage,
    })
    .from(users)
    .where(
      or(
        ilike(users.username, lowerQuery),
        ilike(users.name, lowerQuery),
        ilike(users.email, lowerQuery)
      )
    )
    .limit(limit);
    
    return results;
  }

  async searchEvents(query: string, limit: number): Promise<any[]> {
    const lowerQuery = `%${query.toLowerCase()}%`;
    const results = await db.select({
      id: events.id,
      title: events.title,
      city: events.city,
      startDate: events.startDate,
    })
    .from(events)
    .where(
      or(
        ilike(events.title, lowerQuery),
        ilike(events.description, lowerQuery),
        ilike(events.city, lowerQuery)
      )
    )
    .limit(limit);
    
    return results;
  }

  async searchGroups(query: string, limit: number): Promise<any[]> {
    const lowerQuery = `%${query.toLowerCase()}%`;
    const results = await db.execute(sql`
      SELECT 
        id,
        name,
        image_url as avatar,
        type as category,
        member_count as "memberCount"
      FROM groups
      WHERE 
        name ILIKE ${lowerQuery} OR
        description ILIKE ${lowerQuery} OR
        type ILIKE ${lowerQuery}
      LIMIT ${limit}
    `);
    
    return results.rows || [];
  }

  async searchCommunities(query: string, limit: number): Promise<any[]> {
    const lowerQuery = `%${query.toLowerCase()}%`;
    const results = await db.select({
      id: communities.id,
      name: communities.name,
      cityName: communities.cityName,
      coverPhotoUrl: communities.coverPhotoUrl,
      memberCount: communities.memberCount,
    })
    .from(communities)
    .where(
      or(
        ilike(communities.name, lowerQuery),
        ilike(communities.cityName, lowerQuery),
        ilike(communities.description, lowerQuery)
      )
    )
    .limit(limit);
    
    return results;
  }

  async getCommunityById(id: number): Promise<any | undefined> {
    const result = await db.select().from(communities).where(eq(communities.id, id)).limit(1);
    return result[0];
  }

  // ========================================================================
  // LIFE CEO SYSTEM METHODS
  // ========================================================================

  async getAllLifeCeoDomains(): Promise<any[]> {
    return await db.select().from(lifeCeoDomains);
  }

  async getLifeCeoGoalsByUser(userId: number): Promise<any[]> {
    return await db.select()
      .from(lifeCeoGoals)
      .where(eq(lifeCeoGoals.userId, userId))
      .orderBy(desc(lifeCeoGoals.createdAt));
  }

  async createLifeCeoGoal(goal: any): Promise<any> {
    const result = await db.insert(lifeCeoGoals).values(goal).returning();
    return result[0];
  }

  async updateLifeCeoGoal(id: number, data: any): Promise<any | undefined> {
    const result = await db.update(lifeCeoGoals)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(lifeCeoGoals.id, id))
      .returning();
    return result[0];
  }

  async getLifeCeoTasksByUser(userId: number): Promise<any[]> {
    return await db.select()
      .from(lifeCeoTasks)
      .where(eq(lifeCeoTasks.userId, userId))
      .orderBy(asc(lifeCeoTasks.dueDate));
  }

  async createLifeCeoTask(task: any): Promise<any> {
    const result = await db.insert(lifeCeoTasks).values(task).returning();
    return result[0];
  }

  async updateLifeCeoTask(id: number, data: any): Promise<any | undefined> {
    const result = await db.update(lifeCeoTasks)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(lifeCeoTasks.id, id))
      .returning();
    return result[0];
  }

  async getLifeCeoRecommendationsByUser(userId: number): Promise<any[]> {
    return await db.select()
      .from(lifeCeoRecommendations)
      .where(
        and(
          eq(lifeCeoRecommendations.userId, userId),
          eq(lifeCeoRecommendations.status, 'pending')
        )
      )
      .orderBy(desc(lifeCeoRecommendations.createdAt));
  }

  // ========================================================================
  // TRACK 7: MEMORIES METHODS
  // ========================================================================

  async createMemory(memory: InsertMemory): Promise<SelectMemory> {
    const result = await db.insert(memories).values(memory).returning();
    return result[0];
  }

  async getMemoryById(id: number): Promise<SelectMemory | undefined> {
    const result = await db.select().from(memories).where(eq(memories.id, id)).limit(1);
    return result[0];
  }

  async getUserMemories(userId: number, params?: { type?: string; limit?: number; offset?: number }): Promise<SelectMemory[]> {
    const { type, limit = 50, offset = 0 } = params || {};
    
    let query = db.select().from(memories).where(eq(memories.userId, userId));
    
    if (type) {
      query = query.where(and(eq(memories.userId, userId), eq(memories.type, type)));
    }
    
    const result = await query
      .orderBy(desc(memories.date))
      .limit(limit)
      .offset(offset);
    
    return result;
  }

  async updateMemory(id: number, data: Partial<SelectMemory>): Promise<SelectMemory | undefined> {
    const result = await db
      .update(memories)
      .set(data)
      .where(eq(memories.id, id))
      .returning();
    return result[0];
  }

  async deleteMemory(id: number): Promise<void> {
    await db.delete(memories).where(eq(memories.id, id));
  }

  // ========================================================================
  // TRACK 7: RECOMMENDATIONS METHODS
  // ========================================================================

  async createRecommendation(recommendation: InsertRecommendation): Promise<SelectRecommendation> {
    const result = await db.insert(recommendations).values(recommendation).returning();
    return result[0];
  }

  async getUserRecommendations(userId: number, params?: { targetType?: string; status?: string; limit?: number }): Promise<SelectRecommendation[]> {
    const { targetType, status = 'pending', limit = 20 } = params || {};
    
    let conditions = [eq(recommendations.userId, userId)];
    
    if (status) {
      conditions.push(eq(recommendations.status, status));
    }
    
    if (targetType) {
      conditions.push(eq(recommendations.targetType, targetType));
    }
    
    const result = await db.select()
      .from(recommendations)
      .where(and(...conditions))
      .orderBy(desc(recommendations.score))
      .limit(limit);
    
    return result;
  }

  async updateRecommendationStatus(id: number, status: string): Promise<SelectRecommendation | undefined> {
    const result = await db
      .update(recommendations)
      .set({ status })
      .where(eq(recommendations.id, id))
      .returning();
    return result[0];
  }

  async deleteRecommendation(id: number): Promise<void> {
    await db.delete(recommendations).where(eq(recommendations.id, id));
  }

  // ========================================================================
  // TRACK 7: ROLE INVITATIONS METHODS
  // ========================================================================

  async createRoleInvitation(invitation: InsertRoleInvitation): Promise<SelectRoleInvitation> {
    const result = await db.insert(roleInvitations).values(invitation).returning();
    return result[0];
  }

  async getRoleInvitationById(id: number): Promise<SelectRoleInvitation | undefined> {
    const result = await db.select().from(roleInvitations).where(eq(roleInvitations.id, id)).limit(1);
    return result[0];
  }

  async getUserRoleInvitations(userId: number, params?: { status?: string; role?: string }): Promise<SelectRoleInvitation[]> {
    const { status, role } = params || {};
    
    let conditions = [eq(roleInvitations.inviteeId, userId)];
    
    if (status) {
      conditions.push(eq(roleInvitations.status, status));
    }
    
    if (role) {
      conditions.push(eq(roleInvitations.role, role));
    }
    
    const result = await db.select()
      .from(roleInvitations)
      .where(and(...conditions))
      .orderBy(desc(roleInvitations.createdAt));
    
    return result;
  }

  async updateRoleInvitationStatus(id: number, status: string): Promise<SelectRoleInvitation | undefined> {
    const result = await db
      .update(roleInvitations)
      .set({ status, respondedAt: new Date() })
      .where(eq(roleInvitations.id, id))
      .returning();
    return result[0];
  }

  async deleteRoleInvitation(id: number): Promise<void> {
    await db.delete(roleInvitations).where(eq(roleInvitations.id, id));
  }

  // ========================================================================
  // TRACK 7: FAVORITES METHODS
  // ========================================================================

  async createFavorite(favorite: InsertFavorite): Promise<SelectFavorite> {
    const result = await db.insert(favorites).values(favorite).returning();
    return result[0];
  }

  async getUserFavorites(userId: number, params?: { targetType?: string; limit?: number; offset?: number }): Promise<SelectFavorite[]> {
    const { targetType, limit = 50, offset = 0 } = params || {};
    
    let conditions = [eq(favorites.userId, userId)];
    
    if (targetType) {
      conditions.push(eq(favorites.targetType, targetType));
    }
    
    const result = await db.select()
      .from(favorites)
      .where(and(...conditions))
      .orderBy(desc(favorites.createdAt))
      .limit(limit)
      .offset(offset);
    
    return result;
  }

  async deleteFavorite(userId: number, targetType: string, targetId: number): Promise<void> {
    await db.delete(favorites).where(
      and(
        eq(favorites.userId, userId),
        eq(favorites.targetType, targetType),
        eq(favorites.targetId, targetId)
      )
    );
  }

  async isFavorited(userId: number, targetType: string, targetId: number): Promise<boolean> {
    const result = await db.select()
      .from(favorites)
      .where(
        and(
          eq(favorites.userId, userId),
          eq(favorites.targetType, targetType),
          eq(favorites.targetId, targetId)
        )
      )
      .limit(1);
    
    return result.length > 0;
  }

  // ========================================================================
  // TRACK 7: COMMUNITY STATS METHODS
  // ========================================================================

  async createCommunityStats(stats: InsertCommunityStats): Promise<SelectCommunityStats> {
    const result = await db.insert(communityStats).values(stats).returning();
    return result[0];
  }

  async getCommunityStatsByCity(city: string, country: string): Promise<SelectCommunityStats | undefined> {
    const result = await db.select()
      .from(communityStats)
      .where(
        and(
          eq(communityStats.city, city),
          eq(communityStats.country, country)
        )
      )
      .limit(1);
    
    return result[0];
  }

  async getAllCommunityStats(params?: { limit?: number; offset?: number }): Promise<SelectCommunityStats[]> {
    const { limit = 100, offset = 0 } = params || {};
    
    const result = await db.select()
      .from(communityStats)
      .orderBy(desc(communityStats.memberCount))
      .limit(limit)
      .offset(offset);
    
    return result;
  }

  async updateCommunityStats(id: number, data: Partial<SelectCommunityStats>): Promise<SelectCommunityStats | undefined> {
    const result = await db
      .update(communityStats)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(communityStats.id, id))
      .returning();
    return result[0];
  }
}

export const storage = new DbStorage();
