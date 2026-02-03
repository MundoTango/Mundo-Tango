import { db } from "../core/connection";
import {
  groups,
  groupMembers,
  groupPosts,
  communities,
  communityMembers,
  groupCategories,
  groupInvites,
  communityStats,
  type InsertGroup,
  type SelectGroup,
  type InsertGroupMember,
  type SelectGroupMember,
  type InsertGroupPost,
  type SelectGroupPost,
  type InsertCommunity,
  type SelectCommunity,
  type InsertCommunityMember,
  type SelectCommunityMember,
} from "@shared/schema";
import { eq, and, desc, asc, like, inArray, sql } from "drizzle-orm";

// ============================================
// CUSTOM ERROR CLASSES
// ============================================

export class GroupRepositoryError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'GroupRepositoryError';
  }
}

export class GroupValidationError extends GroupRepositoryError {
  constructor(message: string, details?: unknown) {
    super(message, 'VALIDATION_ERROR', details);
    this.name = 'GroupValidationError';
  }
}

export class GroupDatabaseError extends GroupRepositoryError {
  constructor(message: string, details?: unknown) {
    super(message, 'DATABASE_ERROR', details);
    this.name = 'GroupDatabaseError';
  }
}

// ============================================
// VALIDATION HELPERS
// ============================================

const validateId = (id: number, entityName: string = 'ID'): void => {
  if (!Number.isFinite(id) || !Number.isInteger(id) || id <= 0) {
    throw new GroupValidationError(`Invalid ${entityName}: ${id}. Must be a positive integer.`);
  }
};

const validateGroupInput = (group: InsertGroup): void => {
  if (!group.name || typeof group.name !== 'string' || group.name.trim().length === 0) {
    throw new GroupValidationError('Group name is required and must be a non-empty string.');
  }
  
  if (!group.slug || typeof group.slug !== 'string' || group.slug.trim().length === 0) {
    throw new GroupValidationError('Group slug is required and must be a non-empty string.');
  }
  
  if (!group.createdBy || !Number.isInteger(group.createdBy) || group.createdBy <= 0) {
    throw new GroupValidationError('createdBy is required and must be a positive integer.');
  }
  
  const validTypes = ['city', 'interest', 'professional', 'private', 'public'];
  if (group.type && !validTypes.includes(group.type)) {
    throw new GroupValidationError(`Invalid group type: ${group.type}. Must be one of: ${validTypes.join(', ')}`);
  }
};

const validateGroupPostInput = (post: InsertGroupPost): void => {
  if (!post.groupId || !Number.isInteger(post.groupId) || post.groupId <= 0) {
    throw new GroupValidationError('groupId is required and must be a positive integer.');
  }
  
  if (!post.authorId || !Number.isInteger(post.authorId) || post.authorId <= 0) {
    throw new GroupValidationError('authorId is required and must be a positive integer.');
  }
  
  if (!post.content || typeof post.content !== 'string' || post.content.trim().length === 0) {
    throw new GroupValidationError('Post content is required and must be a non-empty string.');
  }
};

/**
 * GroupRepository - Handles all group and community related database operations
 * Migrated from DbStorage class as part of Sprint 2.1
 * 
 * Manages:
 * - Group CRUD operations
 * - Group membership (join, leave, ban)
 * - Group posts and comments
 * - Group categories and organization
 * - Group invitations
 * - Communities (city-based groups)
 * - Community statistics
 * 
 * @see server/storage.ts (legacy DbStorage class)
 */
export class GroupRepository {
  // ============================================
  // GROUP CRUD OPERATIONS
  // ============================================

  async createGroup(groupData: InsertGroup): Promise<SelectGroup> {
    validateGroupInput(groupData);
    try {
      const [group] = await db.insert(groups).values(groupData).returning();
      return group;
    } catch (error) {
      throw new GroupDatabaseError('Failed to create group', error);
    }
  }

  async getGroupById(id: number): Promise<SelectGroup | undefined> {
    validateId(id, 'group ID');
    try {
      const [group] = await db
        .select()
        .from(groups)
        .where(eq(groups.id, id))
        .limit(1);
      return group;
    } catch (error) {
      throw new GroupDatabaseError('Failed to get group by ID', error);
    }
  }

  async getGroupBySlug(slug: string): Promise<SelectGroup | undefined> {
    const [group] = await db
      .select()
      .from(groups)
      .where(eq(groups.slug, slug))
      .limit(1);
    return group;
  }

  async getGroups(params: {
    limit?: number;
    offset?: number;
    cityId?: number;
  }): Promise<SelectGroup[]> {
    const { limit = 50, offset = 0, cityId } = params;
    
    let query = db.select().from(groups);
    
    if (cityId) {
      query = query.where(eq(groups.cityId, cityId));
    }
    
    return await query
      .orderBy(desc(groups.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async updateGroup(
    id: number,
    data: Partial<SelectGroup>
  ): Promise<SelectGroup | undefined> {
    const [updated] = await db
      .update(groups)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(groups.id, id))
      .returning();
    return updated;
  }

  async deleteGroup(id: number): Promise<void> {
    await db.delete(groups).where(eq(groups.id, id));
  }

  async searchGroups(searchTerm: string, limit = 20): Promise<SelectGroup[]> {
    return await db
      .select()
      .from(groups)
      .where(like(groups.name, `%${searchTerm}%`))
      .orderBy(desc(groups.memberCount))
      .limit(limit);
  }

  async getSuggestedGroups(
    userId: number,
    limit = 10
  ): Promise<SelectGroup[]> {
    // Get groups user is not already a member of
    const userGroupIds = await db
      .select({ groupId: groupMembers.groupId })
      .from(groupMembers)
      .where(eq(groupMembers.userId, userId));

    const excludeIds = userGroupIds.map((g) => g.groupId);

    let query = db
      .select()
      .from(groups)
      .orderBy(desc(groups.memberCount));

    if (excludeIds.length > 0) {
      query = query.where(sql`${groups.id} NOT IN ${excludeIds}`);
    }

    return await query.limit(limit);
  }

  // ============================================
  // GROUP MEMBERSHIP
  // ============================================

  async joinGroup(userId: number, groupId: number): Promise<SelectGroupMember> {
    const [member] = await db
      .insert(groupMembers)
      .values({
        userId,
        groupId,
        role: "member",
        joinedAt: new Date(),
      })
      .returning();

    // Increment member count
    await db
      .update(groups)
      .set({
        memberCount: sql`${groups.memberCount} + 1`,
      })
      .where(eq(groups.id, groupId));

    return member;
  }

  async leaveGroup(userId: number, groupId: number): Promise<void> {
    await db
      .delete(groupMembers)
      .where(and(eq(groupMembers.userId, userId), eq(groupMembers.groupId, groupId)));

    // Decrement member count
    await db
      .update(groups)
      .set({
        memberCount: sql`${groups.memberCount} - 1`,
      })
      .where(eq(groups.id, groupId));
  }

  async getGroupMembers(groupId: number): Promise<SelectGroupMember[]> {
    return await db
      .select()
      .from(groupMembers)
      .where(eq(groupMembers.groupId, groupId))
      .orderBy(asc(groupMembers.joinedAt));
  }

  async isGroupMember(userId: number, groupId: number): Promise<boolean> {
    const [member] = await db
      .select()
      .from(groupMembers)
      .where(and(eq(groupMembers.userId, userId), eq(groupMembers.groupId, groupId)))
      .limit(1);
    return !!member;
  }

  async updateGroupMember(
    userId: number,
    groupId: number,
    data: Partial<SelectGroupMember>
  ): Promise<SelectGroupMember | undefined> {
    const [updated] = await db
      .update(groupMembers)
      .set(data)
      .where(and(eq(groupMembers.userId, userId), eq(groupMembers.groupId, groupId)))
      .returning();
    return updated;
  }

  async banGroupMember(userId: number, groupId: number): Promise<void> {
    await db
      .update(groupMembers)
      .set({ status: "banned" })
      .where(and(eq(groupMembers.userId, userId), eq(groupMembers.groupId, groupId)));
  }

  // ============================================
  // GROUP POSTS
  // ============================================

  async createGroupPost(postData: InsertGroupPost): Promise<SelectGroupPost> {
    const [post] = await db.insert(groupPosts).values(postData).returning();
    return post;
  }

  async getGroupPostById(id: number): Promise<SelectGroupPost | undefined> {
    const [post] = await db
      .select()
      .from(groupPosts)
      .where(eq(groupPosts.id, id))
      .limit(1);
    return post;
  }

  async getGroupPosts(groupId: number, params: {
    limit?: number;
    offset?: number;
  }): Promise<SelectGroupPost[]> {
    const { limit = 50, offset = 0 } = params;
    
    return await db
      .select()
      .from(groupPosts)
      .where(eq(groupPosts.groupId, groupId))
      .orderBy(desc(groupPosts.isPinned), desc(groupPosts.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async updateGroupPost(
    id: number,
    data: Partial<SelectGroupPost>
  ): Promise<SelectGroupPost | undefined> {
    const [updated] = await db
      .update(groupPosts)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(groupPosts.id, id))
      .returning();
    return updated;
  }

  async deleteGroupPost(id: number): Promise<void> {
    await db.delete(groupPosts).where(eq(groupPosts.id, id));
  }

  async approveGroupPost(id: number): Promise<SelectGroupPost | undefined> {
    const [approved] = await db
      .update(groupPosts)
      .set({ status: "approved", updatedAt: new Date() })
      .where(eq(groupPosts.id, id))
      .returning();
    return approved;
  }

  async pinGroupPost(id: number): Promise<SelectGroupPost | undefined> {
    const [pinned] = await db
      .update(groupPosts)
      .set({ isPinned: true, updatedAt: new Date() })
      .where(eq(groupPosts.id, id))
      .returning();
    return pinned;
  }

  async unpinGroupPost(id: number): Promise<SelectGroupPost | undefined> {
    const [unpinned] = await db
      .update(groupPosts)
      .set({ isPinned: false, updatedAt: new Date() })
      .where(eq(groupPosts.id, id))
      .returning();
    return unpinned;
  }

  // ============================================
  // GROUP CATEGORIES
  // ============================================

  async createGroupCategory(categoryData: any): Promise<any> {
    const [category] = await db
      .insert(groupCategories)
      .values(categoryData)
      .returning();
    return category;
  }

  async getGroupCategories(): Promise<any[]> {
    return await db.select().from(groupCategories).orderBy(asc(groupCategories.name));
  }

  async getGroupsByCategory(categoryId: number): Promise<SelectGroup[]> {
    return await db
      .select()
      .from(groups)
      .where(eq(groups.categoryId, categoryId))
      .orderBy(desc(groups.memberCount));
  }

  async assignGroupCategory(groupId: number, categoryId: number): Promise<void> {
    await db
      .update(groups)
      .set({ categoryId })
      .where(eq(groups.id, groupId));
  }

  async removeGroupCategory(groupId: number): Promise<void> {
    await db
      .update(groups)
      .set({ categoryId: null })
      .where(eq(groups.id, groupId));
  }

  // ============================================
  // GROUP INVITES
  // ============================================

  async sendGroupInvite(inviteData: any): Promise<any> {
    const [invite] = await db.insert(groupInvites).values(inviteData).returning();
    return invite;
  }

  async getGroupInvites(groupId: number): Promise<any[]> {
    return await db
      .select()
      .from(groupInvites)
      .where(eq(groupInvites.groupId, groupId))
      .orderBy(desc(groupInvites.createdAt));
  }

  async getUserGroupInvites(userId: number): Promise<any[]> {
    return await db
      .select()
      .from(groupInvites)
      .where(and(
        eq(groupInvites.inviteeId, userId),
        eq(groupInvites.status, "pending")
      ))
      .orderBy(desc(groupInvites.createdAt));
  }

  async acceptGroupInvite(inviteId: number): Promise<void> {
    const [invite] = await db
      .update(groupInvites)
      .set({ status: "accepted" })
      .where(eq(groupInvites.id, inviteId))
      .returning();

    if (invite) {
      await this.joinGroup(invite.inviteeId, invite.groupId);
    }
  }

  async declineGroupInvite(inviteId: number): Promise<void> {
    await db
      .update(groupInvites)
      .set({ status: "declined" })
      .where(eq(groupInvites.id, inviteId));
  }

  // ============================================
  // COMMUNITIES
  // ============================================

  async createCommunity(communityData: InsertCommunity): Promise<SelectCommunity> {
    const [community] = await db
      .insert(communities)
      .values(communityData)
      .returning();
    return community;
  }

  async getCommunityById(id: number): Promise<SelectCommunity | undefined> {
    const [community] = await db
      .select()
      .from(communities)
      .where(eq(communities.id, id))
      .limit(1);
    return community;
  }

  async getCommunityByCity(cityId: number): Promise<SelectCommunity | undefined> {
    const [community] = await db
      .select()
      .from(communities)
      .where(eq(communities.cityId, cityId))
      .limit(1);
    return community;
  }

  async joinCommunity(
    userId: number,
    communityId: number
  ): Promise<SelectCommunityMember> {
    const [member] = await db
      .insert(communityMembers)
      .values({
        userId,
        communityId,
        joinedAt: new Date(),
      })
      .returning();

    // Increment member count
    await db
      .update(communities)
      .set({
        memberCount: sql`${communities.memberCount} + 1`,
      })
      .where(eq(communities.id, communityId));

    return member;
  }

  async getCommunityMembership(
    userId: number,
    communityId: number
  ): Promise<SelectCommunityMember | undefined> {
    const [member] = await db
      .select()
      .from(communityMembers)
      .where(
        and(
          eq(communityMembers.userId, userId),
          eq(communityMembers.communityId, communityId)
        )
      )
      .limit(1);
    return member;
  }

  // ============================================
  // COMMUNITY STATS
  // ============================================

  async createCommunityStats(statsData: any): Promise<any> {
    const [stats] = await db
      .insert(communityStats)
      .values(statsData)
      .returning();
    return stats;
  }

  async getCommunityStatsByCity(cityId: number): Promise<any | undefined> {
    const [stats] = await db
      .select()
      .from(communityStats)
      .where(eq(communityStats.cityId, cityId))
      .limit(1);
    return stats;
  }

  async getAllCommunityStats(): Promise<any[]> {
    return await db
      .select()
      .from(communityStats)
      .orderBy(desc(communityStats.totalMembers));
  }

  async updateCommunityStats(cityId: number, data: any): Promise<any | undefined> {
    const [updated] = await db
      .update(communityStats)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(communityStats.cityId, cityId))
      .returning();
    return updated;
  }
}

// Export singleton instance
export const groupRepository = new GroupRepository();
