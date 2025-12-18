/**
 * CITY GROUP ENRICHMENT SERVICE
 * MB.MD Implementation - Pattern 28 (Hierarchical Execution)
 * 
 * Responsibilities:
 * - Match scraped community data to city groups
 * - Merge community metadata into group About sections
 * - Handle deduplication of community data
 * - Update group statistics from scraped data
 */

import { db } from '@shared/db';
import { groups, scrapedCommunityData, eventScrapingSources } from '@shared/schema';
import { eq, and, ilike, or, sql, desc } from 'drizzle-orm';

interface CommunityEnrichmentData {
  description?: string;
  rules?: string[];
  organizers?: Array<{ name: string; role: string; contact?: string }>;
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    whatsapp?: string;
    youtube?: string;
    website?: string;
  };
  memberCount?: number;
  history?: string;
  culture?: string;
  dressCode?: string;
  etiquette?: string[];
  contactEmail?: string;
  contactPhone?: string;
}

export class CityGroupEnrichmentService {
  /**
   * Match scraped community data to a city group
   * Uses city name matching with fuzzy search
   */
  async matchCommunityToGroup(communityData: any): Promise<number | null> {
    console.log(`[CityGroupEnrichment] 🔍 Matching community: ${communityData.communityName}`);

    // Get the source to find city information
    const source = await db.query.eventScrapingSources.findFirst({
      where: eq(eventScrapingSources.id, communityData.sourceId)
    });

    if (!source?.city) {
      console.log(`[CityGroupEnrichment] ⚠️ No city found for source ${communityData.sourceId}`);
      return null;
    }

    // Find matching city group
    const cityGroup = await db.query.groups.findFirst({
      where: and(
        eq(groups.type, 'city'),
        or(
          ilike(groups.city, source.city),
          ilike(groups.name, `%${source.city}%`)
        )
      )
    });

    if (cityGroup) {
      console.log(`[CityGroupEnrichment] ✅ Matched to group: ${cityGroup.name} (ID: ${cityGroup.id})`);
      
      // Update the scraped community data with the group ID
      await db.update(scrapedCommunityData)
        .set({ cityGroupId: cityGroup.id })
        .where(eq(scrapedCommunityData.id, communityData.id));

      return cityGroup.id;
    }

    console.log(`[CityGroupEnrichment] ⚠️ No matching city group found for: ${source.city}`);
    return null;
  }

  /**
   * Enrich a city group's About section with scraped data
   * Merges new data intelligently without overwriting manually curated content
   */
  async enrichGroupAbout(groupId: number, data: CommunityEnrichmentData): Promise<void> {
    console.log(`[CityGroupEnrichment] 📝 Enriching group ID: ${groupId}`);

    const group = await db.query.groups.findFirst({
      where: eq(groups.id, groupId)
    });

    if (!group) {
      console.error(`[CityGroupEnrichment] ❌ Group not found: ${groupId}`);
      return;
    }

    // Build update object - only update fields that are empty or have lower quality data
    const updates: Record<string, any> = {};

    // Merge description (append if existing is short)
    if (data.description) {
      const existingDesc = group.description || '';
      if (existingDesc.length < 100 || !existingDesc) {
        updates.description = data.description;
      } else if (data.description.length > existingDesc.length * 1.5) {
        // If scraped description is significantly longer, use it
        updates.longDescription = data.description;
      }
    }

    // Merge rules (combine if different)
    if (data.rules && data.rules.length > 0) {
      const existingRules = group.rules ? group.rules.split('\n').filter(r => r.trim()) : [];
      const newRules = [...new Set([...existingRules, ...data.rules])];
      updates.rules = newRules.join('\n');
    }

    // Update social links in long description if empty
    if (data.socialLinks && !group.longDescription?.includes('facebook.com')) {
      const socialSection = this.formatSocialLinks(data.socialLinks);
      updates.longDescription = (group.longDescription || '') + '\n\n' + socialSection;
    }

    // Update member count if higher
    if (data.memberCount && (!group.memberCount || data.memberCount > group.memberCount)) {
      updates.memberCount = data.memberCount;
    }

    // Apply updates
    if (Object.keys(updates).length > 0) {
      updates.updatedAt = new Date();
      await db.update(groups)
        .set(updates)
        .where(eq(groups.id, groupId));

      console.log(`[CityGroupEnrichment] ✅ Updated group ${group.name} with ${Object.keys(updates).length} fields`);
    } else {
      console.log(`[CityGroupEnrichment] ℹ️ No updates needed for group ${group.name}`);
    }
  }

  /**
   * Format social links into a readable section
   */
  private formatSocialLinks(links: CommunityEnrichmentData['socialLinks']): string {
    if (!links) return '';

    const sections: string[] = ['## Social & Community Links'];

    if (links.facebook) sections.push(`- Facebook: ${links.facebook}`);
    if (links.instagram) sections.push(`- Instagram: ${links.instagram}`);
    if (links.whatsapp) sections.push(`- WhatsApp: ${links.whatsapp}`);
    if (links.youtube) sections.push(`- YouTube: ${links.youtube}`);
    if (links.website) sections.push(`- Website: ${links.website}`);

    return sections.length > 1 ? sections.join('\n') : '';
  }

  /**
   * Process all pending scraped community data
   * Auto-matches and enriches city groups
   */
  async processAllPendingCommunityData(): Promise<{
    processed: number;
    matched: number;
    enriched: number;
  }> {
    console.log('[CityGroupEnrichment] 🚀 Processing all pending community data...');

    // Get all unapproved scraped community data
    const pendingData = await db.query.scrapedCommunityData.findMany({
      where: and(
        eq(scrapedCommunityData.approved, false),
        sql`${scrapedCommunityData.cityGroupId} IS NULL`
      ),
      orderBy: desc(scrapedCommunityData.scrapedAt)
    });

    console.log(`[CityGroupEnrichment] Found ${pendingData.length} pending community records`);

    let matched = 0;
    let enriched = 0;

    for (const data of pendingData) {
      // Match to city group
      const groupId = await this.matchCommunityToGroup(data);

      if (groupId) {
        matched++;

        // Enrich the group with scraped data
        await this.enrichGroupAbout(groupId, {
          description: data.description || undefined,
          rules: data.rules || undefined,
          organizers: data.organizers as any || undefined,
          socialLinks: {
            facebook: data.facebookUrl || undefined,
            instagram: data.instagramUrl || undefined,
            whatsapp: data.whatsappGroupLink || undefined,
            youtube: data.youtubeUrl || undefined,
            website: data.websiteUrl || undefined
          },
          memberCount: data.memberCount || undefined,
          history: data.history || undefined,
          culture: data.culture || undefined,
          dressCode: data.dressCode || undefined,
          etiquette: data.etiquette || undefined,
          contactEmail: data.contactEmail || undefined,
          contactPhone: data.contactPhone || undefined
        });

        enriched++;

        // Mark as approved (auto-enriched)
        await db.update(scrapedCommunityData)
          .set({ 
            approved: true,
            lastUpdated: new Date()
          })
          .where(eq(scrapedCommunityData.id, data.id));
      }
    }

    console.log(`[CityGroupEnrichment] ✅ Complete: ${pendingData.length} processed, ${matched} matched, ${enriched} enriched`);

    return {
      processed: pendingData.length,
      matched,
      enriched
    };
  }

  /**
   * Merge new scraped data with existing community data
   * Handles deduplication and quality scoring
   */
  async mergeNewData(existing: any, scraped: any): Promise<void> {
    console.log(`[CityGroupEnrichment] 🔄 Merging data for source ${scraped.sourceId}`);

    // Calculate data quality score (0-100)
    const qualityScore = this.calculateDataQuality(scraped);

    // Only merge if new data has higher quality
    if (qualityScore > (existing.dataQuality || 0)) {
      await db.update(scrapedCommunityData)
        .set({
          communityName: scraped.communityName || existing.communityName,
          description: scraped.description || existing.description,
          rules: [...new Set([...(existing.rules || []), ...(scraped.rules || [])])],
          organizers: this.mergeOrganizers(existing.organizers, scraped.organizers),
          facebookUrl: scraped.facebookUrl || existing.facebookUrl,
          instagramUrl: scraped.instagramUrl || existing.instagramUrl,
          whatsappGroupLink: scraped.whatsappGroupLink || existing.whatsappGroupLink,
          memberCount: Math.max(existing.memberCount || 0, scraped.memberCount || 0),
          dataQuality: qualityScore,
          lastUpdated: new Date()
        })
        .where(eq(scrapedCommunityData.id, existing.id));

      console.log(`[CityGroupEnrichment] ✅ Merged with quality score: ${qualityScore}`);
    } else {
      console.log(`[CityGroupEnrichment] ℹ️ Skipping merge - existing quality (${existing.dataQuality}) >= new (${qualityScore})`);
    }
  }

  /**
   * Calculate data quality score based on completeness
   */
  private calculateDataQuality(data: any): number {
    let score = 0;
    const weights = {
      description: 20,
      rules: 15,
      organizers: 15,
      facebookUrl: 10,
      instagramUrl: 10,
      whatsappGroupLink: 10,
      memberCount: 10,
      history: 5,
      culture: 5
    };

    for (const [field, weight] of Object.entries(weights)) {
      if (data[field] && (Array.isArray(data[field]) ? data[field].length > 0 : true)) {
        score += weight;
      }
    }

    return Math.min(score, 100);
  }

  /**
   * Merge organizer lists, avoiding duplicates
   */
  private mergeOrganizers(existing: any[], incoming: any[]): any[] {
    const existingMap = new Map((existing || []).map(o => [o.name, o]));
    
    for (const org of (incoming || [])) {
      if (!existingMap.has(org.name)) {
        existingMap.set(org.name, org);
      }
    }

    return Array.from(existingMap.values());
  }

  /**
   * Get enrichment statistics
   */
  async getEnrichmentStats(): Promise<{
    totalCommunityRecords: number;
    matchedToGroups: number;
    pendingApproval: number;
    avgDataQuality: number;
  }> {
    const allData = await db.query.scrapedCommunityData.findMany();

    const matched = allData.filter(d => d.cityGroupId !== null).length;
    const pending = allData.filter(d => !d.approved).length;
    const avgQuality = allData.reduce((sum, d) => sum + (d.dataQuality || 0), 0) / (allData.length || 1);

    return {
      totalCommunityRecords: allData.length,
      matchedToGroups: matched,
      pendingApproval: pending,
      avgDataQuality: Math.round(avgQuality)
    };
  }
}

export const cityGroupEnrichmentService = new CityGroupEnrichmentService();
