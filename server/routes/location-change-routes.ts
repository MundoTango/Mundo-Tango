import { Router, type Response } from "express";
import { authenticateToken, AuthRequest } from "../middleware/auth";
import { storage, db } from "../storage";
import { groups, groupMembers } from "@shared/schema";
import { eq, and, ilike, sql } from "drizzle-orm";
import { geocodingService } from "../services/GeocodingService";

const router = Router();

const CITYSCAPE_IMAGES: Record<string, string> = {
  'buenos aires': 'https://images.unsplash.com/photo-1589909202802-8f4aadce1849?w=800&q=80',
  'new york': 'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=800&q=80',
  'paris': 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80',
  'london': 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80',
  'tokyo': 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80',
  'barcelona': 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&q=80',
  'berlin': 'https://images.unsplash.com/photo-1560969184-10fe8719e047?w=800&q=80',
  'san francisco': 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&q=80',
  'los angeles': 'https://images.unsplash.com/photo-1580655653885-65763b2597d0?w=800&q=80',
  'miami': 'https://images.unsplash.com/photo-1506966953602-c20cc11f75e3?w=800&q=80',
  'sydney': 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800&q=80',
  'melbourne': 'https://images.unsplash.com/photo-1514395462725-fb4566210144?w=800&q=80',
  'amsterdam': 'https://images.unsplash.com/photo-1468436139062-f60a71c5c892?w=800&q=80',
  'rome': 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&q=80',
  'madrid': 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800&q=80',
  'lisbon': 'https://images.unsplash.com/photo-1536663815808-535e2280d2c2?w=800&q=80',
  'montevideo': 'https://images.unsplash.com/photo-1597376537717-c99e19cd0b0e?w=800&q=80',
  'mexico city': 'https://images.unsplash.com/photo-1585464231875-d9ef1f5ad396?w=800&q=80',
  'chicago': 'https://images.unsplash.com/photo-1494522855154-9297ac14b55f?w=800&q=80',
  'toronto': 'https://images.unsplash.com/photo-1517090504586-fde19ea6066f?w=800&q=80',
};

const DEFAULT_CITYSCAPE = 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&q=80';

function getCityscapeImage(cityName: string): string {
  const normalizedCity = cityName.toLowerCase().trim();
  return CITYSCAPE_IMAGES[normalizedCity] || DEFAULT_CITYSCAPE;
}

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
        
        // Geocode the city to get coordinates for the world map
        let latitude: string | null = null;
        let longitude: string | null = null;
        try {
          const geoResult = await geocodingService.geocodeAddress(null, newCity, newCountry || null);
          if (geoResult) {
            latitude = String(geoResult.lat);
            longitude = String(geoResult.lng);
            console.log(`[LocationChangeEffects] Geocoded ${newCity}: ${latitude}, ${longitude}`);
          }
        } catch (geoErr) {
          console.warn(`[LocationChangeEffects] Geocoding failed for ${newCity}:`, geoErr);
        }
        
        const [newGroup] = await db.insert(groups).values({
          name: newCity,
          slug: `city-${slug}-${Date.now()}`,
          description: `Welcome to the ${newCity} tango community! Connect with local dancers, find events, and share your tango journey.`,
          type: 'city',
          city: newCity,
          country: newCountry || null,
          latitude,
          longitude,
          visibility: 'public',
          joinApproval: true,
          allowEvents: true,
          allowPosts: true,
          allowDiscussions: true,
          createdBy: userId,
          ownerId: userId,
          memberCount: 1,
          coverImage: getCityscapeImage(newCity),
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

    const localEvents = await eventRepository.getEvents({ city: newCity, limit: 5 });

    const nearbyDancers = await storage.countUsersByCity(newCity);

    const nearbyVenues = await storage.countVenuesByCity(newCity);

    await storage.createNotification({
      userId,
      type: "location_change",
      title: `Welcome to ${newCity}!`,
      message: `You're now connected with the ${newCity} tango community.`,
      data: { city: newCity, country: newCountry, previousCity, previousCountry },
      actionUrl: autoJoinedGroup ? `/groups/${autoJoinedGroup.groupId}` : `/groups?city=${encodeURIComponent(newCity)}`,
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
