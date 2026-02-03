import { db } from '../../database';
import { ProfileDeduplicationService } from './ProfileDeduplicationService';
import { CityAutoCreationService } from './CityAutoCreationService';

export interface VendorData {
  name: string;
  website?: string;
  email?: string;
  phone?: string;
  facebook_url?: string;
  instagram_handle?: string;
  description?: string;
  city_id?: number;
  source: string;
  source_url: string;
}

export interface VendorScraperResult {
  vendorId: number;
  created: boolean;
  matched: boolean;
  existingUserId?: number;
}

export class VendorScraperService {
  private profileDeduplicationService: ProfileDeduplicationService;
  private cityAutoCreationService: CityAutoCreationService;

  constructor() {
    this.profileDeduplicationService = new ProfileDeduplicationService();
    this.cityAutoCreationService = new CityAutoCreationService();
  }

  /**
   * Extract vendor data from event listing
   */
  async extractVendorFromEvent(event: any): Promise<VendorData | null> {
    try {
      // Extract organizer info from event
      const vendorData: VendorData = {
        name: event.organizer_name || event.venue_name,
        website: event.organizer_website || event.venue_website,
        email: event.organizer_email,
        phone: event.organizer_phone,
        facebook_url: event.organizer_facebook,
        instagram_handle: event.organizer_instagram,
        description: event.organizer_description,
        city_id: event.city_id,
        source: event.source || 'unknown',
        source_url: event.url || '',
      };

      // Validate minimum required data
      if (!vendorData.name) {
        return null;
      }

      return vendorData;
    } catch (error) {
      console.error('Error extracting vendor from event:', error);
      return null;
    }
  }

  /**
   * Create or match vendor profile
   */
  async processVendor(vendorData: VendorData): Promise<VendorScraperResult> {
    try {
      // Check if vendor already exists by name + city
      const existingVendor = await this.findExistingVendor(vendorData);

      if (existingVendor) {
        // Update existing vendor data if new info is available
        await this.updateVendorData(existingVendor.id, vendorData);

        return {
          vendorId: existingVendor.id,
          created: false,
          matched: true,
          existingUserId: existingVendor.id,
        };
      }

      // Check for potential duplicate profiles
      const potentialMatches = await this.findPotentialMatches(vendorData);

      if (potentialMatches.length > 0) {
        // Create as found_user for manual review/claiming
        const foundUserId = await this.createFoundUser(vendorData);

        // Create claim requests for high-confidence matches
        for (const match of potentialMatches) {
          if (match.confidence >= 0.85) {
            await this.profileDeduplicationService.createClaimRequest(
              foundUserId,
              match.userId,
              match.matchType,
              match.evidence,
              match.confidence
            );
          }
        }

        return {
          vendorId: foundUserId,
          created: true,
          matched: true,
          existingUserId: potentialMatches[0]?.userId,
        };
      }

      // No matches - create new vendor/user
      const newVendorId = await this.createVendor(vendorData);

      return {
        vendorId: newVendorId,
        created: true,
        matched: false,
      };
    } catch (error) {
      console.error('Error processing vendor:', error);
      throw error;
    }
  }

  /**
   * Batch process vendors from multiple events
   */
  async batchProcessVendors(events: any[]): Promise<VendorScraperResult[]> {
    const results: VendorScraperResult[] = [];

    for (const event of events) {
      try {
        const vendorData = await this.extractVendorFromEvent(event);

        if (vendorData) {
          const result = await this.processVendor(vendorData);
          results.push(result);

          // Associate vendor with event
          await this.linkVendorToEvent(result.vendorId, event.id);
        }
      } catch (error) {
        console.error(`Error processing vendor for event ${event.id}:`, error);
      }
    }

    return results;
  }

  // Private helper methods

  private async findExistingVendor(vendorData: VendorData): Promise<any> {
    // Check by website (most reliable)
    if (vendorData.website) {
      const result = await db.query(
        'SELECT id FROM users WHERE website = $1 AND is_vendor = true',
        [vendorData.website]
      );
      if (result.rows.length > 0) return result.rows[0];
    }

    // Check by Facebook URL
    if (vendorData.facebook_url) {
      const result = await db.query(
        'SELECT id FROM users WHERE found_facebook_url = $1 OR facebook_url = $1',
        [vendorData.facebook_url]
      );
      if (result.rows.length > 0) return result.rows[0];
    }

    // Check by email
    if (vendorData.email) {
      const result = await db.query(
        'SELECT id FROM users WHERE email = $1 OR found_email = $1',
        [vendorData.email]
      );
      if (result.rows.length > 0) return result.rows[0];
    }

    return null;
  }

  private async findPotentialMatches(
    vendorData: VendorData
  ): Promise<Array<{ userId: number; matchType: string; confidence: number; evidence: any }>> {
    const matches = [];

    // Search by name + city
    if (vendorData.city_id) {
      const result = await db.query(
        `
        SELECT id, display_name FROM users
        WHERE city_id = $1 AND similarity(display_name, $2) > 0.7
        ORDER BY similarity(display_name, $2) DESC
        LIMIT 5
        `,
        [vendorData.city_id, vendorData.name]
      );

      for (const row of result.rows) {
        matches.push({
          userId: row.id,
          matchType: 'name_city',
          confidence: 0.75,
          evidence: { name: vendorData.name, city_id: vendorData.city_id },
        });
      }
    }

    return matches;
  }

  private async createFoundUser(vendorData: VendorData): Promise<number> {
    const result = await db.query(
      `
      INSERT INTO users (
        display_name, found_email, found_facebook_url, found_instagram_handle,
        website, city_id, bio, is_vendor, created_via_scraping, scraping_source
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, true, true, $8)
      RETURNING id
      `,
      [
        vendorData.name,
        vendorData.email,
        vendorData.facebook_url,
        vendorData.instagram_handle,
        vendorData.website,
        vendorData.city_id,
        vendorData.description,
        vendorData.source,
      ]
    );

    return result.rows[0].id;
  }

  private async createVendor(vendorData: VendorData): Promise<number> {
    const result = await db.query(
      `
      INSERT INTO users (
        display_name, email, facebook_url, instagram_handle,
        website, city_id, bio, is_vendor, created_via_scraping, scraping_source
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, true, true, $8)
      RETURNING id
      `,
      [
        vendorData.name,
        vendorData.email,
        vendorData.facebook_url,
        vendorData.instagram_handle,
        vendorData.website,
        vendorData.city_id,
        vendorData.description,
        vendorData.source,
      ]
    );

    return result.rows[0].id;
  }

  private async updateVendorData(vendorId: number, vendorData: VendorData): Promise<void> {
    // Only update fields that are currently null
    await db.query(
      `
      UPDATE users
      SET
        found_email = COALESCE(found_email, email, $1),
        found_facebook_url = COALESCE(found_facebook_url, facebook_url, $2),
        found_instagram_handle = COALESCE(found_instagram_handle, instagram_handle, $3),
        website = COALESCE(website, $4),
        bio = COALESCE(bio, $5),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
      `,
      [
        vendorData.email,
        vendorData.facebook_url,
        vendorData.instagram_handle,
        vendorData.website,
        vendorData.description,
        vendorId,
      ]
    );
  }

  private async linkVendorToEvent(vendorId: number, eventId: number): Promise<void> {
    await db.query(
      `
      UPDATE events
      SET organizer_user_id = $1
      WHERE id = $2
      `,
      [vendorId, eventId]
    );
  }
}
