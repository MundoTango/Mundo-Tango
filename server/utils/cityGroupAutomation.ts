import { db } from "../db";
import { groups, groupMembers, notifications, users } from "@shared/schema";
import { eq, and, ilike, or, isNull } from "drizzle-orm";
import { geocodingService } from "../services/GeocodingService";

export interface CityGroupResult {
  groupId: number;
  groupName: string;
  wasCreated: boolean;
  city: string;
  country: string;
  latitude?: number;
  longitude?: number;
}

export async function ensureCityGroupExists(
  city: string,
  country: string | null | undefined,
  creatorUserId: number
): Promise<CityGroupResult | null> {
  if (!city) {
    console.log("[CityGroupAutomation] Missing city, skipping");
    return null;
  }

  const normalizedCity = city.trim();
  let normalizedCountry = country?.trim() || '';
  
  // If country is missing, try to get it from user's profile
  if (!normalizedCountry) {
    console.log(`[CityGroupAutomation] Country missing for ${normalizedCity}, checking user profile...`);
    const [user] = await db.select({ country: users.country }).from(users).where(eq(users.id, creatorUserId)).limit(1);
    if (user?.country) {
      normalizedCountry = user.country.trim();
      console.log(`[CityGroupAutomation] Found country from user profile: ${normalizedCountry}`);
    }
  }
  
  // First, try to find existing group by city (and country if available)
  let existingGroup;
  if (normalizedCountry) {
    existingGroup = await db
      .select()
      .from(groups)
      .where(
        and(
          ilike(groups.city, normalizedCity),
          ilike(groups.country, normalizedCountry),
          eq(groups.type, "city")
        )
      )
      .limit(1);
  }
  
  // If no country or no match with country, try city-only match
  if (!existingGroup?.length) {
    existingGroup = await db
      .select()
      .from(groups)
      .where(
        and(
          ilike(groups.city, normalizedCity),
          eq(groups.type, "city")
        )
      )
      .limit(1);
  }

  if (existingGroup.length > 0) {
    console.log(`[CityGroupAutomation] City group already exists: ${existingGroup[0].name}`);
    return {
      groupId: existingGroup[0].id,
      groupName: existingGroup[0].name,
      wasCreated: false,
      city: normalizedCity,
      country: normalizedCountry
    };
  }

  // Create ASCII-safe slug (normalize diacritics: Málaga -> malaga, Bogotá -> bogota)
  const asciiCity = normalizedCity.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const slug = `${asciiCity.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, '')}-tango-community`;
  const groupName = `${normalizedCity} Tango Community`;
  const locationStr = normalizedCountry ? `${normalizedCity}, ${normalizedCountry}` : normalizedCity;
  
  console.log(`[CityGroupAutomation] Creating new city group: ${groupName}`);

  // Geocode the city to get coordinates for the community map
  let latitude: number | null = null;
  let longitude: number | null = null;
  
  try {
    console.log(`[CityGroupAutomation] Geocoding ${locationStr}...`);
    const geoResult = await geocodingService.geocodeAddress(null, normalizedCity, normalizedCountry || null);
    if (geoResult) {
      latitude = geoResult.lat;
      longitude = geoResult.lng;
      console.log(`[CityGroupAutomation] Geocoded: ${latitude}, ${longitude}`);
    } else {
      console.log(`[CityGroupAutomation] Could not geocode ${locationStr}`);
    }
  } catch (err: any) {
    console.error(`[CityGroupAutomation] Geocoding error: ${err.message}`);
  }

  const [newGroup] = await db
    .insert(groups)
    .values({
      name: groupName,
      slug: slug,
      description: `The official tango community group for dancers in ${locationStr}. Connect with local milongas, workshops, and fellow dancers.`,
      longDescription: `Welcome to the ${normalizedCity} Tango Community! This group was automatically created when the first tango event was posted in ${normalizedCity}. Join us to:\n\n- Discover local milongas and practicas\n- Connect with dancers in your area\n- Share event announcements\n- Find dance partners\n- Discuss the local tango scene`,
      type: "city",
      visibility: "public",
      city: normalizedCity,
      country: normalizedCountry || null,
      latitude: latitude ? String(latitude) : null,
      longitude: longitude ? String(longitude) : null,
      memberCount: 1,
      createdBy: creatorUserId,
      ownerId: creatorUserId,
      isPrivate: false,
      joinApproval: false,
    })
    .returning();

  await db.insert(groupMembers).values({
    groupId: newGroup.id,
    userId: creatorUserId,
    role: "admin",
    status: "active",
  });

  await db.insert(notifications).values({
    userId: creatorUserId,
    type: "city_group_created",
    title: "🎉 You started a community!",
    message: `Your event is the first in ${normalizedCity}! We've created the "${groupName}" for local dancers to connect.`,
    data: JSON.stringify({
      groupId: newGroup.id,
      groupName: newGroup.name,
      city: normalizedCity,
      country: normalizedCountry
    }),
    actionUrl: `/groups/${newGroup.id}`,
    isRead: false,
  });

  console.log(`[CityGroupAutomation] Successfully created city group: ${groupName} (ID: ${newGroup.id})`);

  return {
    groupId: newGroup.id,
    groupName: newGroup.name,
    wasCreated: true,
    city: normalizedCity,
    country: normalizedCountry,
    latitude: latitude || undefined,
    longitude: longitude || undefined
  };
}

export async function linkEventToCityGroup(
  eventId: number,
  groupId: number
): Promise<void> {
  console.log(`[CityGroupAutomation] Linking event ${eventId} to city group ${groupId}`);
}

export async function backfillCityGroupForEvent(
  eventId: number,
  city: string,
  country: string,
  userId: number
): Promise<CityGroupResult | null> {
  console.log(`[CityGroupAutomation] Backfilling city group for event ${eventId}`);
  return await ensureCityGroupExists(city, country, userId);
}
