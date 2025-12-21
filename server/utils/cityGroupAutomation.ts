import { db } from "../db";
import { cities, cityMembers, notifications, users, groups } from "@shared/schema";
import { eq, and, ilike, or } from "drizzle-orm";
import { geocodingService } from "../services/GeocodingService";

export interface CityResult {
  cityId: number;
  citySlug: string;
  cityName: string;
  wasCreated: boolean;
  city: string;
  country: string;
  latitude?: number;
  longitude?: number;
  legacyGroupId?: number;
}

function createCitySlug(cityName: string): string {
  const ascii = cityName.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return ascii.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, '');
}

export async function ensureCityExists(
  city: string,
  country: string | null | undefined,
  creatorUserId: number
): Promise<CityResult | null> {
  if (!city) {
    console.log("[CityAutomation] Missing city, skipping");
    return null;
  }

  const normalizedCity = city.trim();
  let normalizedCountry = country?.trim() || '';
  
  if (!normalizedCountry) {
    console.log(`[CityAutomation] Country missing for ${normalizedCity}, checking user profile...`);
    const [user] = await db.select({ country: users.country }).from(users).where(eq(users.id, creatorUserId)).limit(1);
    if (user?.country) {
      normalizedCountry = user.country.trim();
      console.log(`[CityAutomation] Found country from user profile: ${normalizedCountry}`);
    }
  }
  
  let existingCity;
  if (normalizedCountry) {
    existingCity = await db
      .select()
      .from(cities)
      .where(
        and(
          ilike(cities.name, normalizedCity),
          ilike(cities.country, normalizedCountry)
        )
      )
      .limit(1);
  }
  
  if (!existingCity?.length) {
    existingCity = await db
      .select()
      .from(cities)
      .where(ilike(cities.name, normalizedCity))
      .limit(1);
  }

  if (existingCity && existingCity.length > 0) {
    const found = existingCity[0];
    console.log(`[CityAutomation] City already exists: ${found.name} (slug: ${found.slug})`);
    return {
      cityId: found.id,
      citySlug: found.slug,
      cityName: found.name,
      wasCreated: false,
      city: normalizedCity,
      country: normalizedCountry,
      legacyGroupId: found.legacyGroupId || undefined
    };
  }

  const slug = createCitySlug(normalizedCity);
  const locationStr = normalizedCountry ? `${normalizedCity}, ${normalizedCountry}` : normalizedCity;
  
  console.log(`[CityAutomation] Creating new city: ${normalizedCity} (slug: ${slug})`);

  let latitude: number | null = null;
  let longitude: number | null = null;
  
  try {
    console.log(`[CityAutomation] Geocoding ${locationStr}...`);
    const geoResult = await geocodingService.geocodeAddress(null, normalizedCity, normalizedCountry || null);
    if (geoResult) {
      latitude = geoResult.lat;
      longitude = geoResult.lng;
      console.log(`[CityAutomation] Geocoded: ${latitude}, ${longitude}`);
    }
  } catch (err: any) {
    console.error(`[CityAutomation] Geocoding error: ${err.message}`);
  }

  const [newCity] = await db
    .insert(cities)
    .values({
      slug: slug,
      name: normalizedCity,
      country: normalizedCountry || 'Unknown',
      description: `Welcome to the ${normalizedCity} Tango Community! Connect with dancers, find milongas, and discover the local tango scene.`,
      longDescription: `Welcome to the ${normalizedCity} Tango Community!\n\nThis city was automatically added when the first tango event was posted here. Join us to:\n\n- Discover local milongas and practicas\n- Connect with dancers in your area\n- Share event announcements\n- Find dance partners\n- Discuss the local tango scene`,
      latitude: latitude ? String(latitude) : null,
      longitude: longitude ? String(longitude) : null,
      memberCount: 1,
      isActive: true,
    })
    .returning();

  await db.insert(cityMembers).values({
    cityId: newCity.id,
    userId: creatorUserId,
    role: "admin",
    status: "active",
  });

  await db.insert(notifications).values({
    userId: creatorUserId,
    type: "city_created",
    title: "🎉 You started a community!",
    message: `Your event is the first in ${normalizedCity}! We've created the city community for local dancers to connect.`,
    data: JSON.stringify({
      cityId: newCity.id,
      citySlug: newCity.slug,
      cityName: newCity.name,
      city: normalizedCity,
      country: normalizedCountry
    }),
    actionUrl: `/cities/${newCity.slug}`,
    isRead: false,
  });

  console.log(`[CityAutomation] Successfully created city: ${newCity.name} (ID: ${newCity.id}, slug: ${newCity.slug})`);

  return {
    cityId: newCity.id,
    citySlug: newCity.slug,
    cityName: newCity.name,
    wasCreated: true,
    city: normalizedCity,
    country: normalizedCountry,
    latitude: latitude || undefined,
    longitude: longitude || undefined
  };
}

export async function ensureCityGroupExists(
  city: string,
  country: string | null | undefined,
  creatorUserId: number
): Promise<{ groupId: number; groupName: string; wasCreated: boolean; city: string; country: string; latitude?: number; longitude?: number } | null> {
  const result = await ensureCityExists(city, country, creatorUserId);
  if (!result) return null;
  
  return {
    groupId: result.legacyGroupId || result.cityId,
    groupName: result.cityName,
    wasCreated: result.wasCreated,
    city: result.city,
    country: result.country,
    latitude: result.latitude,
    longitude: result.longitude
  };
}

export async function linkEventToCity(
  eventId: number,
  cityId: number
): Promise<void> {
  console.log(`[CityAutomation] Linking event ${eventId} to city ${cityId}`);
}

export async function backfillCityForEvent(
  eventId: number,
  city: string,
  country: string,
  userId: number
): Promise<CityResult | null> {
  console.log(`[CityAutomation] Backfilling city for event ${eventId}`);
  return await ensureCityExists(city, country, userId);
}

export { ensureCityExists as default };
