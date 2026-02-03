/**
 * CITY DATA MIGRATION SERVICE
 * MB.MD Implementation - Pattern: Bulk Data Remediation
 * December 21, 2025
 * 
 * Fixes city data quality issues:
 * - Adds cover images from stock library
 * - Generates rich descriptions
 * - Links events to city groups
 * - Updates statistics
 */

import { db } from '@shared/db';
import { groups, events } from '@shared/schema';
import { eq, sql, ilike, count, and, or } from 'drizzle-orm';

interface CityStockImage {
  slug: string;
  imageUrl: string;
  attribution?: string;
}

const CITY_COVER_IMAGES: CityStockImage[] = [
  { slug: 'buenos-aires', imageUrl: 'https://images.unsplash.com/photo-1612294037637-ec328d0e075e?w=1200', attribution: 'Unsplash' },
  { slug: 'new-york', imageUrl: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=1200', attribution: 'Unsplash' },
  { slug: 'san-francisco', imageUrl: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=1200', attribution: 'Unsplash' },
  { slug: 'berlin', imageUrl: 'https://images.unsplash.com/photo-1560969184-10fe8719e047?w=1200', attribution: 'Unsplash' },
  { slug: 'paris', imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200', attribution: 'Unsplash' },
  { slug: 'london', imageUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200', attribution: 'Unsplash' },
  { slug: 'athens', imageUrl: 'https://images.unsplash.com/photo-1555993539-1732b0258235?w=1200', attribution: 'Unsplash' },
  { slug: 'istanbul', imageUrl: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1200', attribution: 'Unsplash' },
  { slug: 'miami', imageUrl: 'https://images.unsplash.com/photo-1533106497176-45ae19e68ba2?w=1200', attribution: 'Unsplash' },
  { slug: 'denver', imageUrl: 'https://images.unsplash.com/photo-1619856699906-09e1f58c98b1?w=1200', attribution: 'Unsplash' },
  { slug: 'los-angeles', imageUrl: 'https://images.unsplash.com/photo-1534190760961-74e8c1c5c3da?w=1200', attribution: 'Unsplash' },
  { slug: 'chicago', imageUrl: 'https://images.unsplash.com/photo-1494522855154-9297ac14b55f?w=1200', attribution: 'Unsplash' },
  { slug: 'sao-paulo', imageUrl: 'https://images.unsplash.com/photo-1543059080-f9b1272213d5?w=1200', attribution: 'Unsplash' },
  { slug: 'montevideo', imageUrl: 'https://images.unsplash.com/photo-1617483068820-cd1f3c08c1eb?w=1200', attribution: 'Unsplash' },
  { slug: 'tokyo', imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1200', attribution: 'Unsplash' },
  { slug: 'amsterdam', imageUrl: 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=1200', attribution: 'Unsplash' },
  { slug: 'barcelona', imageUrl: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=1200', attribution: 'Unsplash' },
  { slug: 'melbourne', imageUrl: 'https://images.unsplash.com/photo-1514395462725-fb4566210144?w=1200', attribution: 'Unsplash' },
  { slug: 'seattle', imageUrl: 'https://images.unsplash.com/photo-1502175353174-a7a70e73b362?w=1200', attribution: 'Unsplash' },
  { slug: 'portland', imageUrl: 'https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=1200', attribution: 'Unsplash' },
];

const FALLBACK_TANGO_IMAGE = 'https://images.unsplash.com/photo-1545959570-a94084071b5d?w=1200'; // Tango dancers

interface MigrationResult {
  cityId: number;
  cityName: string;
  actions: string[];
  success: boolean;
  error?: string;
}

export class CityDataMigrationService {
  /**
   * Get cover image for a city
   */
  static getCoverImage(cityName: string, slug: string): string {
    // Try exact slug match
    const exactMatch = CITY_COVER_IMAGES.find(c => c.slug === slug);
    if (exactMatch) return exactMatch.imageUrl;

    // Try city name match
    const nameMatch = CITY_COVER_IMAGES.find(c => 
      cityName.toLowerCase().includes(c.slug.replace('-', ' ')) ||
      c.slug.includes(cityName.toLowerCase().replace(' ', '-'))
    );
    if (nameMatch) return nameMatch.imageUrl;

    // Return fallback tango image
    return FALLBACK_TANGO_IMAGE;
  }

  /**
   * Generate rich description for a city
   */
  static generateDescription(cityName: string, country: string | null, eventCount: number): string {
    const countryText = country ? ` in ${country}` : '';
    
    if (eventCount > 100) {
      return `Welcome to the vibrant tango community of ${cityName}${countryText}! With over ${eventCount} events, this city is a major hub for Argentine tango. Discover milongas, workshops, festivals, and connect with passionate dancers from around the world.`;
    } else if (eventCount > 20) {
      return `Join the growing tango community in ${cityName}${countryText}. With ${eventCount} upcoming events, you'll find regular milongas, classes, and opportunities to dance and learn. Connect with local and visiting tangueros in this welcoming community.`;
    } else if (eventCount > 0) {
      return `Discover tango in ${cityName}${countryText}. Whether you're a local or visiting, explore ${eventCount} upcoming events and connect with fellow dancers who share your passion for Argentine tango.`;
    }
    
    return `Welcome to the tango community of ${cityName}${countryText}. Connect with dancers, find events, and share your love of Argentine tango with our growing community.`;
  }

  /**
   * Get event count for a city
   */
  static async getEventCount(cityName: string): Promise<number> {
    const result = await db.select({
      count: count(),
    }).from(events).where(
      or(
        ilike(events.city, cityName),
        ilike(events.city, `%${cityName}%`)
      )
    );
    return result[0]?.count || 0;
  }

  /**
   * Migrate a single city's data
   */
  static async migrateCity(groupId: number): Promise<MigrationResult> {
    const group = await db.query.groups.findFirst({
      where: eq(groups.id, groupId),
    });

    if (!group) {
      return { cityId: groupId, cityName: 'Unknown', actions: [], success: false, error: 'City not found' };
    }

    const cityName = group.city || group.name || 'Unknown';
    const actions: string[] = [];
    const updates: Record<string, any> = {};

    try {
      // 1. Fix cover image if missing
      if (!group.coverImage || group.coverImage.trim() === '') {
        const slug = (group.city || group.name || '').toLowerCase().replace(/\s+/g, '-');
        const coverImage = this.getCoverImage(cityName, slug);
        updates.coverImage = coverImage;
        actions.push(`Added cover image: ${coverImage.substring(0, 50)}...`);
      }

      // 2. Fix description if generic or missing
      const isGenericDesc = !group.description || 
        group.description.includes('Connect with fellow tangueros') ||
        group.description.length < 100;

      if (isGenericDesc) {
        const eventCount = await this.getEventCount(cityName);
        const newDescription = this.generateDescription(cityName, group.country, eventCount);
        updates.description = newDescription;
        actions.push(`Generated rich description (${eventCount} events)`);
      }

      // 3. Update event count stat
      const eventCount = await this.getEventCount(cityName);
      if (eventCount > 0) {
        updates.eventCount = eventCount;
        actions.push(`Updated event count: ${eventCount}`);
      }

      // Apply updates
      if (Object.keys(updates).length > 0) {
        updates.updatedAt = new Date();
        await db.update(groups)
          .set(updates)
          .where(eq(groups.id, groupId));
      }

      console.log(`[CityMigration] ✅ ${cityName}: ${actions.length} actions`);

      return { cityId: groupId, cityName, actions, success: true };

    } catch (error: any) {
      console.error(`[CityMigration] ❌ ${cityName}:`, error);
      return { cityId: groupId, cityName, actions, success: false, error: error.message };
    }
  }

  /**
   * Migrate all cities with issues
   */
  static async migrateAllCities(): Promise<{
    processed: number;
    successful: number;
    failed: number;
    results: MigrationResult[];
  }> {
    console.log('[CityMigration] 🚀 Starting bulk city migration...');

    // Get all city groups
    const cityGroups = await db.select({
      id: groups.id,
      name: groups.name,
      city: groups.city,
      coverImage: groups.coverImage,
      description: groups.description,
    }).from(groups).where(eq(groups.type, 'city'));

    const results: MigrationResult[] = [];
    let successful = 0;
    let failed = 0;

    for (const group of cityGroups) {
      const needsMigration = 
        !group.coverImage || 
        !group.description || 
        group.description.includes('Connect with fellow tangueros');

      if (needsMigration) {
        const result = await this.migrateCity(group.id);
        results.push(result);
        if (result.success) successful++;
        else failed++;
      }
    }

    console.log(`[CityMigration] ✅ Complete: ${results.length} processed, ${successful} successful, ${failed} failed`);

    return {
      processed: results.length,
      successful,
      failed,
      results,
    };
  }

  /**
   * Create city groups for cities that only exist in events table
   */
  static async createMissingCityGroups(): Promise<{
    created: number;
    cities: string[];
  }> {
    console.log('[CityMigration] 🏙️ Finding cities without groups...');

    // Get all unique cities from events
    const eventCities = await db.selectDistinct({
      city: events.city,
      country: events.country,
    }).from(events).where(sql`${events.city} IS NOT NULL AND ${events.city} != ''`);

    // Get existing city groups
    const existingGroups = await db.select({
      city: groups.city,
      name: groups.name,
    }).from(groups).where(eq(groups.type, 'city'));

    const existingCities = new Set(existingGroups.map(g => (g.city || g.name || '').toLowerCase()));

    // Find missing cities
    const missingCities = eventCities.filter(e => 
      e.city && !existingCities.has(e.city.toLowerCase())
    );

    console.log(`[CityMigration] Found ${missingCities.length} cities without groups`);

    const createdCities: string[] = [];

    for (const { city, country } of missingCities) { // Process all missing cities
      if (!city) continue;

      try {
        const eventCount = await this.getEventCount(city);
        const slug = city.toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')
          + '-tango';
        const coverImage = this.getCoverImage(city, slug);
        const description = this.generateDescription(city, country, eventCount);

        await db.insert(groups).values({
          name: `${city} Tango Community`,
          slug,
          city,
          country: country || null,
          type: 'city',
          coverImage,
          description,
          visibility: 'public',
          isPrivate: false,
          joinApproval: false,
          eventCount,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        createdCities.push(city);
        console.log(`[CityMigration] ✅ Created city group: ${city}`);
      } catch (error: any) {
        if (error.code === '23505') {
          console.log(`[CityMigration] ⚠️ Skipping ${city} - already exists`);
        } else {
          console.error(`[CityMigration] ❌ Failed to create ${city}:`, error.message);
        }
      }
    }

    return {
      created: createdCities.length,
      cities: createdCities,
    };
  }
}
