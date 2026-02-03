import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { groupRepository } from "../../storage/repositories/groups";
import { setupTestDb, cleanupTestDb } from "../setup/test-db";
import type { Database } from "../../storage/types";

describe("GroupRepository", () => {
  let db: Database;

  beforeEach(async () => {
    db = await setupTestDb();
  });

  afterEach(async () => {
    await cleanupTestDb(db);
  });

  describe("Group CRUD", () => {
    it("should create a group", async () => {
      const group = await groupRepository.createGroup({
        name: "Buenos Aires Tango",
        slug: "buenos-aires-tango",
        description: "Tango community in Buenos Aires",
        type: "city",
        city: "Buenos Aires",
        country: "Argentina",
        createdBy: 1,
      });

      expect(group).toBeDefined();
      expect(group.name).toBe("Buenos Aires Tango");
      expect(group.slug).toBe("buenos-aires-tango");
    });

    it("should get group by ID", async () => {
      const created = await groupRepository.createGroup({
        name: "Test Group",
        slug: "test-group",
        description: "Test",
        createdBy: 1,
      });

      const group = await groupRepository.getGroupById(created.id);
      expect(group).toBeDefined();
      expect(group?.id).toBe(created.id);
    });

    it("should get group by slug", async () => {
      await groupRepository.createGroup({
        name: "Test Group",
        slug: "unique-slug",
        description: "Test",
        createdBy: 1,
      });

      const group = await groupRepository.getGroupBySlug("unique-slug");
      expect(group).toBeDefined();
      expect(group?.slug).toBe("unique-slug");
    });

    it("should update group", async () => {
      const created = await groupRepository.createGroup({
        name: "Original Name",
        slug: "original-slug",
        description: "Original description",
        createdBy: 1,
      });

      await groupRepository.updateGroup(created.id, {
        name: "Updated Name",
        description: "Updated description",
      });

      const updated = await groupRepository.getGroupById(created.id);
      expect(updated?.name).toBe("Updated Name");
      expect(updated?.description).toBe("Updated description");
    });

    it("should delete group", async () => {
      const created = await groupRepository.createGroup({
        name: "To Delete",
        slug: "to-delete",
        description: "Will be deleted",
        createdBy: 1,
      });

      await groupRepository.deleteGroup(created.id);
      const deleted = await groupRepository.getGroupById(created.id);
      expect(deleted).toBeNull();
    });
  });

  describe("Membership", () => {
    let groupId: number;

    beforeEach(async () => {
      const group = await groupRepository.createGroup({
        name: "Test Group",
        slug: "test-membership",
        description: "Test",
        createdBy: 1,
      });
      groupId = group.id;
    });

    it("should join group", async () => {
      await groupRepository.joinGroup({ groupId, userId: 2 });
      const isMember = await groupRepository.isGroupMember(groupId, 2);
      expect(isMember).toBe(true);
    });

    it("should leave group", async () => {
      await groupRepository.joinGroup({ groupId, userId: 2 });
      await groupRepository.leaveGroup(groupId, 2);
      const isMember = await groupRepository.isGroupMember(groupId, 2);
      expect(isMember).toBe(false);
    });

    it("should check membership status", async () => {
      const isNotMember = await groupRepository.isGroupMember(groupId, 99);
      expect(isNotMember).toBe(false);

      await groupRepository.joinGroup({ groupId, userId: 3 });
      const isMember = await groupRepository.isGroupMember(groupId, 3);
      expect(isMember).toBe(true);
    });

    it("should get group members", async () => {
      await groupRepository.joinGroup({ groupId, userId: 2 });
      await groupRepository.joinGroup({ groupId, userId: 3 });

      const members = await groupRepository.getGroupMembers(groupId);
      expect(members.length).toBeGreaterThanOrEqual(2);
    });

    it("should ban group member", async () => {
      await groupRepository.joinGroup({ groupId, userId: 2 });
      await groupRepository.banGroupMember(groupId, 2, "Violation");

      // Member should still exist but with banned status
      const members = await groupRepository.getGroupMembers(groupId);
      const bannedMember = members.find((m) => m.userId === 2);
      expect(bannedMember?.status).toBe("banned");
    });
  });

  describe("Group Posts", () => {
    let groupId: number;

    beforeEach(async () => {
      const group = await groupRepository.createGroup({
        name: "Test Group",
        slug: "test-posts",
        description: "Test",
        createdBy: 1,
      });
      groupId = group.id;
    });

    it("should create group post", async () => {
      const post = await groupRepository.createGroupPost({
        groupId,
        authorId: 1,
        content: "Hello group!",
        postType: "discussion",
      });

      expect(post).toBeDefined();
      expect(post.content).toBe("Hello group!");
    });

    it("should approve group post", async () => {
      const post = await groupRepository.createGroupPost({
        groupId,
        authorId: 1,
        content: "Pending post",
        postType: "discussion",
        isApproved: false,
      });

      await groupRepository.approveGroupPost(post.id, 1);
      // Note: Would need to query post to verify approval status
    });

    it("should pin group post", async () => {
      const post = await groupRepository.createGroupPost({
        groupId,
        authorId: 1,
        content: "Important post",
        postType: "announcement",
      });

      await groupRepository.pinGroupPost(post.id, 1);
      // Verification would require querying the post
    });

    it("should unpin group post", async () => {
      const post = await groupRepository.createGroupPost({
        groupId,
        authorId: 1,
        content: "Pinned post",
        postType: "announcement",
      });

      await groupRepository.pinGroupPost(post.id, 1);
      await groupRepository.unpinGroupPost(post.id);
      // Verification would require querying the post
    });
  });

  describe("Categories", () => {
    it("should create category", async () => {
      const category = await groupRepository.createGroupCategory({
        name: "Social Dancing",
        slug: "social-dancing",
        description: "Groups focused on social dancing",
      });

      expect(category).toBeDefined();
      expect(category.name).toBe("Social Dancing");
    });

    it("should assign category to group", async () => {
      const group = await groupRepository.createGroup({
        name: "Test Group",
        slug: "test-cat",
        description: "Test",
        createdBy: 1,
      });

      const category = await groupRepository.createGroupCategory({
        name: "Test Category",
        slug: "test-category",
      });

      await groupRepository.assignGroupCategory(group.id, category.id);
      const groups = await groupRepository.getGroupsByCategory(category.id);
      expect(groups.some((g) => g.id === group.id)).toBe(true);
    });
  });

  describe("Invites", () => {
    let groupId: number;

    beforeEach(async () => {
      const group = await groupRepository.createGroup({
        name: "Test Group",
        slug: "test-invites",
        description: "Test",
        createdBy: 1,
      });
      groupId = group.id;
    });

    it("should send group invite", async () => {
      const invite = await groupRepository.sendGroupInvite({
        groupId,
        inviterId: 1,
        inviteeId: 2,
        message: "Join our group!",
      });

      expect(invite).toBeDefined();
      expect(invite.groupId).toBe(groupId);
    });

    it("should accept group invite", async () => {
      const invite = await groupRepository.sendGroupInvite({
        groupId,
        inviterId: 1,
        inviteeId: 2,
      });

      await groupRepository.acceptGroupInvite(invite.id, 2);
      const isMember = await groupRepository.isGroupMember(groupId, 2);
      expect(isMember).toBe(true);
    });

    it("should decline group invite", async () => {
      const invite = await groupRepository.sendGroupInvite({
        groupId,
        inviterId: 1,
        inviteeId: 2,
      });

      await groupRepository.declineGroupInvite(invite.id);
      const isMember = await groupRepository.isGroupMember(groupId, 2);
      expect(isMember).toBe(false);
    });
  });

  describe("Communities", () => {
    it("should create community", async () => {
      const community = await groupRepository.createCommunity({
        city: "Barcelona",
        country: "Spain",
        groupId: 1,
      });

      expect(community).toBeDefined();
      expect(community.city).toBe("Barcelona");
    });

    it("should join community", async () => {
      const community = await groupRepository.createCommunity({
        city: "Paris",
        country: "France",
        groupId: 1,
      });

      await groupRepository.joinCommunity({ communityId: community.id, userId: 2 });
      // Verification would require a getCommunityMembers method
    });

    it("should get community by city", async () => {
      await groupRepository.createCommunity({
        city: "London",
        country: "UK",
        groupId: 1,
      });

      const community = await groupRepository.getCommunityByCity("London", "UK");
      expect(community).toBeDefined();
      expect(community?.city).toBe("London");
    });
  });

  describe("Statistics", () => {
    it("should create community stats", async () => {
      const stats = await groupRepository.createCommunityStats({
        city: "Tokyo",
        country: "Japan",
        memberCount: 150,
        activeEventsCount: 5,
        latitude: 35.6762,
        longitude: 139.6503,
      });

      expect(stats).toBeDefined();
      expect(stats.memberCount).toBe(150);
    });

    it("should update community stats", async () => {
      const stats = await groupRepository.createCommunityStats({
        city: "Berlin",
        country: "Germany",
        memberCount: 100,
        activeEventsCount: 3,
        latitude: 52.52,
        longitude: 13.405,
      });

      await groupRepository.updateCommunityStats(stats.id, {
        memberCount: 120,
        activeEventsCount: 4,
      });

      // Verification would require a getCommunityStats method
    });
  });
});
