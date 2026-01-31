/**
 * CITY GROUP DATA INGESTION SERVICE
 * MB.MD Protocol - Flow scraped community data INTO city groups
 * 
 * This service:
 * 1. Takes data from scrapedCommunityData and enriches city groups
 * 2. Auto-assigns cityscape cover photos to cities
 * 3. Builds comprehensive "About" sections from scraped data
 */

import { db } from "../db";
import { groups, scrapedCommunityData } from "@shared/schema";
import { eq, and, isNull } from "drizzle-orm";
import { cityscapeService } from "./cityscape-service";
import { getCityscapeImage, assignCityscapeToCommunity } from "../algorithms/cityCityscape";

export interface CityGroupEnrichmentResult {
  groupId: number;
  cityName: string;
  fieldsUpdated: string[];
  coverPhotoAssigned: boolean;
  aboutSectionBuilt: boolean;
  dataQualityScore: number;
}

export class CityGroupDataIngestionService {
  
  /**
   * Main entry point: Enrich a city group from all available scraped data
   */
  async enrichCityGroup(groupId: number): Promise<CityGroupEnrichmentResult> {
    const group = await db.query.groups.findFirst({
      where: eq(groups.id, groupId),
    });

    if (!group) {
      throw new Error(`Group ${groupId} not found`);
    }

    const cityName = group.city || group.name;
    const fieldsUpdated: string[] = [];
    let coverPhotoAssigned = false;
    let aboutSectionBuilt = false;

    // 1. Find all scraped community data linked to this city
    const scrapedData = await db.query.scrapedCommunityData.findMany({
      where: eq(scrapedCommunityData.cityGroupId, groupId),
    });

    // 2. Also find unlinked data that matches this city
    const unlinkedData = await db.query.scrapedCommunityData.findMany({
      where: and(
        isNull(scrapedCommunityData.cityGroupId),
        eq(scrapedCommunityData.approved, true)
      ),
    });

    // Filter unlinked data by city name match
    const matchingUnlinked = unlinkedData.filter(d => 
      d.communityName?.toLowerCase().includes(cityName.toLowerCase())
    );

    const allScrapedData = [...scrapedData, ...matchingUnlinked];

    // 3. Build comprehensive about section from scraped data
    const aboutSection = this.buildAboutSection(allScrapedData, cityName);
    if (aboutSection.description || aboutSection.longDescription) {
      aboutSectionBuilt = true;
    }

    // 4. Auto-assign cityscape cover photo if missing
    let coverPhotoUrl = group.coverImage;
    let coverPhotoCredit = null;
    
    if (!coverPhotoUrl) {
      const cityscapeResult = await this.assignCityscapeCoverPhoto(cityName);
      if (cityscapeResult) {
        coverPhotoUrl = cityscapeResult.url;
        coverPhotoCredit = cityscapeResult.credit;
        coverPhotoAssigned = true;
        fieldsUpdated.push('coverImage');
      }
    }

    // 5. Extract social links from scraped data
    const socialLinks = this.extractSocialLinks(allScrapedData);

    // 6. Extract rules and etiquette
    const rules = this.extractRules(allScrapedData);

    // 7. Calculate data quality score
    const dataQualityScore = this.calculateDataQuality(group, aboutSection, coverPhotoUrl, socialLinks);

    // 8. Update the group with enriched data
    const updateData: Record<string, any> = {};

    if (aboutSection.description && !group.description) {
      updateData.description = aboutSection.description;
      fieldsUpdated.push('description');
    }

    if (aboutSection.longDescription && !group.longDescription) {
      updateData.longDescription = aboutSection.longDescription;
      fieldsUpdated.push('longDescription');
    }

    if (coverPhotoUrl && !group.coverImage) {
      updateData.coverImage = coverPhotoUrl;
    }

    if (rules.length > 0 && !group.rules) {
      updateData.rules = rules.join('\n');
      fieldsUpdated.push('rules');
    }

    // Update group if we have data
    if (Object.keys(updateData).length > 0) {
      await db.update(groups)
        .set({
          ...updateData,
          updatedAt: new Date(),
        })
        .where(eq(groups.id, groupId));
    }

    // Link any matching unlinked scraped data to this group
    for (const data of matchingUnlinked) {
      await db.update(scrapedCommunityData)
        .set({ cityGroupId: groupId })
        .where(eq(scrapedCommunityData.id, data.id));
    }

    console.log(`[CityGroupIngestion] Enriched group ${groupId} (${cityName}):`, {
      fieldsUpdated,
      coverPhotoAssigned,
      aboutSectionBuilt,
      dataQualityScore,
    });

    return {
      groupId,
      cityName,
      fieldsUpdated,
      coverPhotoAssigned,
      aboutSectionBuilt,
      dataQualityScore,
    };
  }

  /**
   * Build comprehensive about section from multiple scraped sources
   */
  private buildAboutSection(scrapedData: any[], cityName: string): {
    description: string | null;
    longDescription: string | null;
  } {
    if (scrapedData.length === 0) {
      return {
        description: `Welcome to the ${cityName} tango community! Connect with local dancers, discover events, and immerse yourself in the local tango scene.`,
        longDescription: null,
      };
    }

    // Aggregate descriptions from all sources
    const descriptions = scrapedData
      .filter(d => d.description)
      .map(d => d.description);

    const histories = scrapedData
      .filter(d => d.history)
      .map(d => d.history);

    const cultures = scrapedData
      .filter(d => d.culture)
      .map(d => d.culture);

    const dressCodes = scrapedData
      .filter(d => d.dressCode)
      .map(d => d.dressCode);

    // Build short description (first 200 chars of best description)
    const bestDescription = descriptions[0] || 
      `Welcome to the ${cityName} tango community! Connect with local dancers and discover amazing events.`;
    
    const shortDescription = bestDescription.length > 200 
      ? bestDescription.substring(0, 197) + '...'
      : bestDescription;

    // Build long description with all sections
    const sections: string[] = [];

    if (descriptions.length > 0) {
      sections.push(`## About ${cityName} Tango\n\n${descriptions[0]}`);
    }

    if (histories.length > 0) {
      sections.push(`## History\n\n${histories[0]}`);
    }

    if (cultures.length > 0) {
      sections.push(`## Tango Culture\n\n${cultures[0]}`);
    }

    if (dressCodes.length > 0) {
      sections.push(`## Dress Code\n\n${dressCodes[0]}`);
    }

    const longDescription = sections.length > 0 ? sections.join('\n\n---\n\n') : null;

    return {
      description: shortDescription,
      longDescription,
    };
  }

  /**
   * Assign cityscape cover photo from Pexels/Unsplash or curated database
   */
  async assignCityscapeCoverPhoto(cityName: string): Promise<{
    url: string;
    credit: string;
    source: string;
  } | null> {
    // First try the curated database (fast, no API call)
    const curatedResult = assignCityscapeToCommunity(cityName);
    if (curatedResult.coverPhotoUrl) {
      return {
        url: curatedResult.coverPhotoUrl,
        credit: curatedResult.coverPhotoCredit,
        source: curatedResult.coverPhotoSource,
      };
    }

    // Then try the cityscape service (Pexels/Unsplash API)
    try {
      const apiResult = await cityscapeService.fetchCityscapePhoto(cityName);
      if (apiResult) {
        return {
          url: apiResult.url,
          credit: apiResult.credit,
          source: apiResult.source,
        };
      }
    } catch (error) {
      console.error(`[CityGroupIngestion] Failed to fetch cityscape for ${cityName}:`, error);
    }

    return null;
  }

  /**
   * Extract social links from scraped data
   */
  private extractSocialLinks(scrapedData: any[]): {
    facebook?: string;
    instagram?: string;
    youtube?: string;
    whatsapp?: string;
    website?: string;
  } {
    const links: Record<string, string> = {};

    for (const data of scrapedData) {
      if (data.facebookUrl && !links.facebook) links.facebook = data.facebookUrl;
      if (data.instagramUrl && !links.instagram) links.instagram = data.instagramUrl;
      if (data.youtubeUrl && !links.youtube) links.youtube = data.youtubeUrl;
      if (data.whatsappGroupLink && !links.whatsapp) links.whatsapp = data.whatsappGroupLink;
      if (data.websiteUrl && !links.website) links.website = data.websiteUrl;
    }

    return links;
  }

  /**
   * Extract rules and etiquette from scraped data
   */
  private extractRules(scrapedData: any[]): string[] {
    const allRules: Set<string> = new Set();
    const allEtiquette: Set<string> = new Set();

    for (const data of scrapedData) {
      if (data.rules && Array.isArray(data.rules)) {
        data.rules.forEach((r: string) => allRules.add(r));
      }
      if (data.etiquette && Array.isArray(data.etiquette)) {
        data.etiquette.forEach((e: string) => allEtiquette.add(e));
      }
    }

    return [...allRules, ...allEtiquette];
  }

  /**
   * Calculate data quality score (0-100)
   */
  private calculateDataQuality(
    group: any,
    aboutSection: { description: string | null; longDescription: string | null },
    coverPhoto: string | null,
    socialLinks: Record<string, string>
  ): number {
    let score = 0;

    // Basic fields (40 points)
    if (group.name) score += 10;
    if (aboutSection.description) score += 15;
    if (aboutSection.longDescription) score += 15;

    // Cover photo (20 points)
    if (coverPhoto) score += 20;

    // Social links (20 points, 5 each)
    if (socialLinks.facebook) score += 5;
    if (socialLinks.instagram) score += 5;
    if (socialLinks.youtube) score += 5;
    if (socialLinks.website) score += 5;

    // Additional metadata (20 points)
    if (group.city) score += 5;
    if (group.country) score += 5;
    if (group.rules) score += 5;
    if (group.memberCount > 0) score += 5;

    return Math.min(100, score);
  }

  /**
   * Batch enrich all city groups that are missing data
   */
  async enrichAllCityGroups(): Promise<{
    processed: number;
    enriched: number;
    errors: number;
    results: CityGroupEnrichmentResult[];
  }> {
    const cityGroups = await db.query.groups.findMany({
      where: eq(groups.type, 'city'),
    });

    let enriched = 0;
    let errors = 0;
    const results: CityGroupEnrichmentResult[] = [];

    for (const group of cityGroups) {
      try {
        const result = await this.enrichCityGroup(group.id);
        results.push(result);
        if (result.fieldsUpdated.length > 0 || result.coverPhotoAssigned) {
          enriched++;
        }
      } catch (error) {
        console.error(`[CityGroupIngestion] Error enriching group ${group.id}:`, error);
        errors++;
      }
    }

    console.log(`[CityGroupIngestion] Batch enrichment complete:`, {
      processed: cityGroups.length,
      enriched,
      errors,
    });

    return {
      processed: cityGroups.length,
      enriched,
      errors,
      results,
    };
  }

  /**
   * Auto-assign cityscape to a newly created city group
   * Called from group creation flow
   */
  async onCityGroupCreated(groupId: number, cityName: string): Promise<void> {
    console.log(`[CityGroupIngestion] New city group created: ${cityName} (ID: ${groupId})`);
    
    // Immediately assign cityscape cover photo
    const cityscape = await this.assignCityscapeCoverPhoto(cityName);
    
    if (cityscape) {
      await db.update(groups)
        .set({
          coverImage: cityscape.url,
          updatedAt: new Date(),
        })
        .where(eq(groups.id, groupId));
      
      console.log(`[CityGroupIngestion] Auto-assigned cityscape to ${cityName}: ${cityscape.url}`);
    }

    // Also try to enrich with any existing scraped data
    await this.enrichCityGroup(groupId);
  }
}

export const cityGroupDataIngestionService = new CityGroupDataIngestionService();
