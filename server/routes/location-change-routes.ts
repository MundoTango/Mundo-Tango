import { Router, type Response } from "express";
import { authenticateToken, AuthRequest } from "../middleware/auth";
import { storage, db } from "../storage";
import { groups, groupMembers } from "@shared/schema";
import { eq, and, ilike, sql } from "drizzle-orm";

const router = Router();

router.post("/change-effects", authenticateToken, async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  const { previousCity, previousCountry, newCity, newCountry } = req.body;

  if (!newCity) {
    return res.status(400).json({ error: "newCity is required" });
  }

  try {
    console.log(`[LocationChangeEffects] Processing for user ${userId}: ${previousCity || 'unknown'} -> ${newCity}`);

    let autoJoinedGroup = null;
    const cityGroups = await db
      .select({
        group: groups,
        memberCount: sql<number>`(
          SELECT COUNT(*)::int 
          FROM ${groupMembers} 
          WHERE ${groupMembers.groupId} = ${groups.id}
          AND ${groupMembers.status} = 'active'
        )`.as("member_count"),
      })
      .from(groups)
      .where(and(eq(groups.type, "city"), ilike(groups.city, newCity)))
      .limit(1);

    if (cityGroups.length > 0) {
      const group = cityGroups[0].group;
      try {
        await storage.joinGroup(group.id, userId);
        autoJoinedGroup = { 
          groupId: group.id, 
          groupName: group.name,
          memberCount: cityGroups[0].memberCount || 0
        };
        console.log(`[LocationChangeEffects] User ${userId} auto-joined group ${group.id} (${group.name})`);
      } catch (joinError: any) {
        if (joinError?.message?.includes("already") || joinError?.code === "23505") {
          autoJoinedGroup = { 
            groupId: group.id, 
            groupName: group.name,
            alreadyMember: true,
            memberCount: cityGroups[0].memberCount || 0
          };
          console.log(`[LocationChangeEffects] User ${userId} already member of group ${group.id}`);
        } else {
          console.error(`[LocationChangeEffects] Failed to join group:`, joinError);
        }
      }
    } else {
      // Auto-create city group if none exists
      console.log(`[LocationChangeEffects] No city group found for ${newCity}, creating new group...`);
      try {
        const slug = newCity.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const [newGroup] = await db.insert(groups).values({
          name: newCity,
          slug: `city-${slug}-${Date.now()}`,
          description: `Welcome to the ${newCity} tango community! Connect with local dancers, find events, and share your tango journey.`,
          type: 'city',
          city: newCity,
          country: newCountry || null,
          visibility: 'public',
          joinApproval: 'open',
          allowEvents: true,
          allowPosts: true,
          allowDiscussions: true,
          createdBy: userId,
          ownerId: userId,
          memberCount: 1,
        }).returning();

        if (newGroup) {
          // Auto-join the creator to the new group
          await storage.joinGroup(newGroup.id, userId);
          autoJoinedGroup = {
            groupId: newGroup.id,
            groupName: newGroup.name,
            memberCount: 1,
            created: true
          };
          console.log(`[LocationChangeEffects] Created and joined new city group: ${newGroup.id} (${newGroup.name})`);
        }
      } catch (createError) {
        console.error(`[LocationChangeEffects] Failed to create city group:`, createError);
      }
    }

    const suggestedGroupsRaw = await db
      .select({
        group: groups,
        memberCount: sql<number>`(
          SELECT COUNT(*)::int 
          FROM ${groupMembers} 
          WHERE ${groupMembers.groupId} = ${groups.id}
          AND ${groupMembers.status} = 'active'
        )`.as("member_count"),
      })
      .from(groups)
      .where(
        and(
          eq(groups.type, "city"),
          newCountry ? ilike(groups.country, newCountry) : undefined
        )
      )
      .limit(5);

    const suggestedGroups = suggestedGroupsRaw.map((g) => ({
      id: g.group.id,
      name: g.group.name,
      city: g.group.city,
      memberCount: g.memberCount || 0,
    }));

    const localEvents = await storage.getEvents({ city: newCity, limit: 5 });

    const nearbyDancers = await storage.countUsersByCity(newCity);

    const nearbyVenues = await storage.countVenuesByCity(newCity);

    await storage.createNotification({
      userId,
      type: "location_change",
      title: `Welcome to ${newCity}!`,
      message: `You're now connected with the ${newCity} tango community.`,
      data: { city: newCity, country: newCountry, previousCity, previousCountry },
    });

    const response = {
      autoJoinedGroup,
      suggestedGroups,
      localEvents: localEvents?.slice(0, 5).map((e) => ({
        id: e.id,
        title: e.title,
        date: e.startTime,
        city: e.city,
        eventType: e.eventType,
      })) || [],
      nearbyDancers: nearbyDancers || 0,
      nearbyVenues: nearbyVenues || 0,
      welcomeMessage: `Welcome to ${newCity}! Connect with local dancers and discover upcoming events.`,
    };

    console.log(`[LocationChangeEffects] Response:`, JSON.stringify(response, null, 2));
    res.json(response);
  } catch (error) {
    console.error("[LocationChangeEffects] Error:", error);
    res.status(500).json({ error: "Failed to process location change effects" });
  }
});

export default router;
