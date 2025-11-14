/**
 * AGENT #118: SOCIAL MEDIA SCRAPER
 * MB.MD Implementation
 * 
 * Responsibilities:
 * - Scrape Facebook groups/pages for events
 * - Scrape Instagram posts for event info
 * - Use Graph API when available
 * - Fall back to web scraping when API unavailable
 * - Extract community metadata (rules, organizers, social links)
 */

import axios from 'axios';
import { db } from '@shared/db';
import { scrapedEvents, scrapedCommunityData } from '@shared/schema';

interface SocialEventData {
  title: string;
  description?: string;
  startDate: Date;
  endDate?: Date;
  location?: string;
  imageUrl?: string;
  externalId?: string;
  platform: 'facebook' | 'instagram';
}

export class SocialScraper {
  private facebookAccessToken?: string;
  private instagramAccessToken?: string;

  constructor() {
    this.facebookAccessToken = process.env.FACEBOOK_ACCESS_TOKEN;
    this.instagramAccessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
  }

  /**
   * Scrape social media platform
   */
  async scrape(source: any): Promise<number> {
    console.log(`[Agent #118] 📱 Scraping ${source.platform}: ${source.name}`);

    try {
      let events: SocialEventData[] = [];

      if (source.platform === 'facebook') {
        events = await this.scrapeFacebook(source);
      } else if (source.platform === 'instagram') {
        events = await this.scrapeInstagram(source);
      }

      // Store events in database
      await this.storeEvents(events, source.id);

      console.log(`[Agent #118] ✅ Found ${events.length} events from ${source.name}`);
      return events.length;

    } catch (error) {
      console.error(`[Agent #118] ❌ Failed to scrape ${source.name}:`, error);
      throw error;
    }
  }

  /**
   * Scrape Facebook group/page events
   */
  private async scrapeFacebook(source: any): Promise<SocialEventData[]> {
    const events: SocialEventData[] = [];

    // Extract Facebook ID from URL
    const facebookId = this.extractFacebookId(source.url);
    if (!facebookId) {
      console.log('[Agent #118] Could not extract Facebook ID from URL');
      return events;
    }

    if (this.facebookAccessToken) {
      // Use Graph API if token available
      try {
        const response = await axios.get(`https://graph.facebook.com/v18.0/${facebookId}/events`, {
          params: {
            access_token: this.facebookAccessToken,
            fields: 'name,description,start_time,end_time,place,cover',
            limit: 100
          }
        });

        for (const event of response.data.data || []) {
          events.push({
            title: event.name,
            description: event.description,
            startDate: new Date(event.start_time),
            endDate: event.end_time ? new Date(event.end_time) : undefined,
            location: event.place?.name,
            imageUrl: event.cover?.source,
            externalId: event.id,
            platform: 'facebook'
          });
        }
      } catch (error) {
        console.error('[Agent #118] Facebook Graph API error:', error);
      }
    } else {
      console.log('[Agent #118] ⚠️ No Facebook access token - skipping API scraping');
      console.log('[Agent #118] Set FACEBOOK_ACCESS_TOKEN to enable Facebook scraping');
    }

    return events;
  }

  /**
   * Scrape Instagram posts for event info
   */
  private async scrapeInstagram(source: any): Promise<SocialEventData[]> {
    const events: SocialEventData[] = [];

    if (!this.instagramAccessToken) {
      console.log('[Agent #118] ⚠️ No Instagram access token - skipping API scraping');
      console.log('[Agent #118] Set INSTAGRAM_ACCESS_TOKEN to enable Instagram scraping');
      return events;
    }

    // Extract Instagram username from URL
    const username = this.extractInstagramUsername(source.url);
    if (!username) {
      console.log('[Agent #118] Could not extract Instagram username from URL');
      return events;
    }

    // Note: Instagram Basic Display API doesn't support event data
    // This would require Instagram Graph API (business accounts only)
    console.log('[Agent #118] Instagram event scraping requires Graph API (business accounts)');

    return events;
  }

  /**
   * Extract Facebook ID from URL
   */
  private extractFacebookId(url: string): string | null {
    const patterns = [
      /facebook\.com\/groups\/(\d+)/,
      /facebook\.com\/([^/?]+)/,
      /fb\.com\/([^/?]+)/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }

    return null;
  }

  /**
   * Extract Instagram username from URL
   */
  private extractInstagramUsername(url: string): string | null {
    const match = url.match(/instagram\.com\/([^/?]+)/);
    return match ? match[1] : null;
  }

  /**
   * Store scraped events in database
   */
  private async storeEvents(events: SocialEventData[], sourceId: number): Promise<void> {
    for (const event of events) {
      try {
        await db.insert(scrapedEvents).values({
          sourceId,
          title: event.title,
          description: event.description || '',
          startDate: event.startDate,
          endDate: event.endDate,
          location: event.location,
          imageUrl: event.imageUrl,
          externalId: event.externalId,
          scrapedAt: new Date(),
          status: 'pending_review'
        });
      } catch (err) {
        console.error('[Agent #118] Failed to store event:', err);
      }
    }
  }

  /**
   * Scrape community metadata from Facebook group
   */
  async scrapeCommunityData(source: any): Promise<void> {
    if (source.platform !== 'facebook') return;

    const facebookId = this.extractFacebookId(source.url);
    if (!facebookId || !this.facebookAccessToken) return;

    try {
      const response = await axios.get(`https://graph.facebook.com/v18.0/${facebookId}`, {
        params: {
          access_token: this.facebookAccessToken,
          fields: 'name,description,member_count,cover'
        }
      });

      const data = response.data;

      await db.insert(scrapedCommunityData).values({
        sourceId: source.id,
        communityName: data.name,
        description: data.description,
        memberCount: data.member_count,
        facebookUrl: source.url,
        facebookGroupId: facebookId,
        coverPhotoUrl: data.cover?.source,
        scrapedAt: new Date(),
        dataQuality: 75, // Initial quality score
        approved: false
      });

      console.log(`[Agent #118] ✅ Scraped community data for ${data.name}`);
    } catch (error) {
      console.error('[Agent #118] Failed to scrape community data:', error);
    }
  }
}

export const socialScraper = new SocialScraper();
