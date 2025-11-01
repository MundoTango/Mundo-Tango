import { Router } from "express";
import { authenticateToken } from "../middleware/auth";
import { storage } from "../storage";
import { eq, ilike, or, and } from "drizzle-orm";
import { users, events, groups, communities } from "@shared/schema";

const router = Router();

/**
 * MENTION SEARCH API
 * Searches across @people, @events, @professional-groups, @city-groups
 */
router.get("/search", authenticateToken, async (req, res) => {
  try {
    const { query = "", type } = req.query;
    const searchQuery = String(query).toLowerCase();
    const limit = 10;

    const results: any[] = [];

    // Search @people (users)
    if (!type || type === "user") {
      const searchedUsers = await storage.searchUsers(searchQuery, limit);
      results.push(...searchedUsers.map((user: any) => ({
        id: user.id,
        type: "user" as const,
        name: user.name || user.username,
        username: user.username,
        avatar: user.profileImage,
        subtitle: user.bio || `@${user.username}`,
      })));
    }

    // Search @events
    if (!type || type === "event") {
      const searchedEvents = await storage.searchEvents(searchQuery, limit);
      results.push(...searchedEvents.map((event: any) => ({
        id: event.id,
        type: "event" as const,
        name: event.title,
        username: `event-${event.id}`,
        subtitle: `${event.city || "Global"} • ${new Date(event.startDate).toLocaleDateString()}`,
      })));
    }

    // Search @professional-groups (regular groups)
    if (!type || type === "professional-group") {
      const searchedGroups = await storage.searchGroups(searchQuery, limit);
      results.push(...searchedGroups.map((group: any) => ({
        id: group.id,
        type: "professional-group" as const,
        name: group.name,
        username: `group-${group.id}`,
        avatar: group.avatar,
        subtitle: `${group.memberCount} members • ${group.category || "General"}`,
      })));
    }

    // Search @city-groups (communities)
    if (!type || type === "city-group") {
      const searchedCommunities = await storage.searchCommunities(searchQuery, limit);
      results.push(...searchedCommunities.map((community: any) => ({
        id: community.id,
        type: "city-group" as const,
        name: community.name,
        username: `city-${community.id}`,
        avatar: community.coverPhotoUrl,
        subtitle: `${community.cityName} • ${community.memberCount || 0} members`,
      })));
    }

    // Sort by relevance (exact matches first, then alphabetical)
    results.sort((a, b) => {
      const aExact = a.name.toLowerCase() === searchQuery;
      const bExact = b.name.toLowerCase() === searchQuery;
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      return a.name.localeCompare(b.name);
    });

    res.json(results.slice(0, limit));
  } catch (error: any) {
    console.error("Mention search error:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET MENTIONED ENTITIES
 * Retrieves full data for mentioned entities in a post/comment
 */
router.post("/resolve", authenticateToken, async (req, res) => {
  try {
    const { mentions } = req.body; // Array of { type, id }
    
    const resolved = await Promise.all(
      mentions.map(async (mention: any) => {
        switch (mention.type) {
          case "user":
            const user = await storage.getUserById(mention.id);
            return user ? {
              type: "user",
              id: user.id,
              name: user.name || user.username,
              username: user.username,
              avatar: user.profileImage,
            } : null;

          case "event":
            const event = await storage.getEventById(mention.id);
            return event ? {
              type: "event",
              id: event.id,
              name: event.title,
              url: `/events/${event.id}`,
            } : null;

          case "professional-group":
            const group = await storage.getGroupById(mention.id);
            return group ? {
              type: "professional-group",
              id: group.id,
              name: group.name,
              url: `/groups/${group.id}`,
            } : null;

          case "city-group":
            const community = await storage.getCommunityById(mention.id);
            return community ? {
              type: "city-group",
              id: community.id,
              name: community.name,
              url: `/communities/${community.id}`,
            } : null;

          default:
            return null;
        }
      })
    );

    res.json(resolved.filter(Boolean));
  } catch (error: any) {
    console.error("Mention resolve error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
