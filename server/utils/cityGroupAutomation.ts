import { db } from "../db";
import { groups, groupMembers, notifications } from "@shared/schema";
import { eq, and, ilike } from "drizzle-orm";

export interface CityGroupResult {
  groupId: number;
  groupName: string;
  wasCreated: boolean;
  city: string;
  country: string;
}

export async function ensureCityGroupExists(
  city: string,
  country: string,
  creatorUserId: number
): Promise<CityGroupResult | null> {
  if (!city || !country) {
    console.log("[CityGroupAutomation] Missing city or country, skipping");
    return null;
  }

  const normalizedCity = city.trim();
  const normalizedCountry = country.trim();
  
  const existingGroup = await db
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

  const slug = `${normalizedCity.toLowerCase().replace(/\s+/g, "-")}-tango-community`;
  const groupName = `${normalizedCity} Tango Community`;
  
  console.log(`[CityGroupAutomation] Creating new city group: ${groupName}`);

  const [newGroup] = await db
    .insert(groups)
    .values({
      name: groupName,
      slug: slug,
      description: `The official tango community group for dancers in ${normalizedCity}, ${normalizedCountry}. Connect with local milongas, workshops, and fellow dancers.`,
      longDescription: `Welcome to the ${normalizedCity} Tango Community! This group was automatically created when the first tango event was posted in ${normalizedCity}. Join us to:\n\n- Discover local milongas and practicas\n- Connect with dancers in your area\n- Share event announcements\n- Find dance partners\n- Discuss the local tango scene`,
      type: "city",
      visibility: "public",
      city: normalizedCity,
      country: normalizedCountry,
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
    country: normalizedCountry
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
