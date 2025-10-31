import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq, and, gt, desc, asc, or, ilike, inArray, sql as sqlOp, lt, gte, lte } from "drizzle-orm";
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

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

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
  
  createPostComment(comment: InsertPostComment): Promise<SelectPostComment>;
  getPostComments(postId: number): Promise<SelectPostComment[]>;
  
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
  markAllNotificationsAsRead(userId: number): Promise<void>;
  
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
}

export const storage = new DbStorage();
