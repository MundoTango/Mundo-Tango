import { db } from "../db";
import { cities, cityMembers, notifications, users } from "@shared/schema";
import { eq, and, ilike, or, isNull } from "drizzle-orm";
import { geocodingService } from "../services/GeocodingService";

export interface CityResult {
  cityId: number;
  slug: string;
  cityName: string;
  wasCreated: boolean;
  country: string;
  latitude?: number;
  longitude?: number;
}

function toCitySlug(city: string): string {
  return city
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

export async function ensureCityExists(
  city: string,
  country: string | null | undefined,
  creatorUserId?: number
): Promise<CityResult | null> {
  if (!city) {
    console.log("[CityAutomation] Missing city, skipping");
    return null;
  }

  const normalizedCity = city.trim();
  let normalizedCountry = country?.trim() || '';
  
  // If country is missing and we have a user, try to get it from user's profile
  if (!normalizedCountry && creatorUserId) {
    console.log(`[CityAutomation] Country missing for ${normalizedCity}, checking user profile...`);
    const [user] = await db.select({ country: users.country }).from(users).where(eq(users.id, creatorUserId)).limit(1);
    if (user?.country) {
      normalizedCountry = user.country.trim();
      console.log(`[CityAutomation] Found country from user profile: ${normalizedCountry}`);
    }
  }
  
  const slug = toCitySlug(normalizedCity);
  
  // First, try to find existing city by slug
  let existingCity = await db
    .select()
    .from(cities)
    .where(eq(cities.slug, slug))
    .limit(1);

  // If not found by slug, try by name and country
  if (!existingCity?.length && normalizedCountry) {
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
  
  // If still not found, try by name only
  if (!existingCity?.length) {
    existingCity = await db
      .select()
      .from(cities)
      .where(ilike(cities.name, normalizedCity))
      .limit(1);
  }

  if (existingCity.length > 0) {
    console.log(`[CityAutomation] City already exists: ${existingCity[0].name} (slug: ${existingCity[0].slug})`);
    return {
      cityId: existingCity[0].id,
      slug: existingCity[0].slug,
      cityName: existingCity[0].name,
      wasCreated: false,
      country: normalizedCountry,
      latitude: existingCity[0].latitude ? parseFloat(existingCity[0].latitude) : undefined,
      longitude: existingCity[0].longitude ? parseFloat(existingCity[0].longitude) : undefined
    };
  }

  // Create new city
  const locationStr = normalizedCountry ? `${normalizedCity}, ${normalizedCountry}` : normalizedCity;
  
  console.log(`[CityAutomation] Creating new city: ${normalizedCity} (slug: ${slug})`);

  // Geocode the city to get coordinates for the community map
  let latitude: number | null = null;
  let longitude: number | null = null;
  
  try {
    console.log(`[CityAutomation] Geocoding ${locationStr}...`);
    const geoResult = await geocodingService.geocodeAddress(null, normalizedCity, normalizedCountry || null);
    if (geoResult) {
      latitude = geoResult.lat;
      longitude = geoResult.lng;
      console.log(`[CityAutomation] Geocoded: ${latitude}, ${longitude}`);
    } else {
      console.log(`[CityAutomation] Could not geocode ${locationStr}`);
    }
  } catch (err: any) {
    console.error(`[CityAutomation] Geocoding error: ${err.message}`);
  }

  const [newCity] = await db
    .insert(cities)
    .values({
      name: normalizedCity,
      slug: slug,
      country: normalizedCountry || null,
      description: `Welcome to the ${normalizedCity} Tango Community! Connect with dancers, find milongas, and discover the passionate tango scene in ${locationStr}.`,
      latitude: latitude ? String(latitude) : null,
      longitude: longitude ? String(longitude) : null,
      isActive: true,
      isFeatured: false,
    })
    .returning();

  // If we have a creator, add them as a city member
  if (creatorUserId) {
    await db.insert(cityMembers).values({
      cityId: newCity.id,
      userId: creatorUserId,
      role: "admin",
      status: "active",
    });

    await db.insert(notifications).values({
      userId: creatorUserId,
      type: "city_created",
      title: "You started a city community!",
      message: `Your event is the first in ${normalizedCity}! We've created the city community for local dancers to connect.`,
      data: JSON.stringify({
        cityId: newCity.id,
        cityName: newCity.name,
        slug: newCity.slug,
        country: normalizedCountry
      }),
      actionUrl: `/cities/${newCity.slug}`,
      isRead: false,
    });
  }

  console.log(`[CityAutomation] Successfully created city: ${normalizedCity} (ID: ${newCity.id}, slug: ${newCity.slug})`);

  return {
    cityId: newCity.id,
    slug: newCity.slug,
    cityName: newCity.name,
    wasCreated: true,
    country: normalizedCountry,
    latitude: latitude || undefined,
    longitude: longitude || undefined
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
  return ensureCityExists(city, country, userId);
}

// Legacy aliases for backward compatibility during migration
export const ensureCityGroupExists = ensureCityExists;
export const linkEventToCityGroup = linkEventToCity;
export const backfillCityGroupForEvent = backfillCityForEvent;
export type CityGroupResult = CityResult;
