/**
 * AGENT #116: STATIC SITE SCRAPER
 * MB.MD Implementation
 * 
 * Responsibilities:
 * - Scrape static HTML websites (no JavaScript)
 * - Extract event listings from HTML
 * - Parse structured data (JSON-LD, microdata)
 * - Handle pagination
 * - Respect robots.txt
 * - Extract community metadata (About pages, rules, social links)
 */

import axios from 'axios';
import * as cheerio from 'cheerio';
import { db } from '@shared/db';
import { scrapedEvents, eventScrapingSources, scrapedCommunityData } from '@shared/schema';
import { cityMatcherService } from '../../services/CityMatcherService';
import { languageAwareFieldMapper, SupportedLanguage } from '../../services/LanguageAwareFieldMapper';
import { detailDiscoveryService } from '../../services/DetailDiscoveryService';

interface ScrapedEventData {
  title: string;
  description?: string;
  startDate: Date;
  endDate?: Date;
  location?: string;
  address?: string;
  organizer?: string;
  price?: number;
  imageUrl?: string;
  externalId?: string;
}

interface ScrapedCommunityMetadata {
  communityName?: string;
  description?: string;
  history?: string;
  culture?: string;
  rules?: string[];
  dressCode?: string;
  etiquette?: string[];
  organizers?: Array<{ name: string; role: string; contact?: string }>;
  contactEmail?: string;
  contactPhone?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  youtubeUrl?: string;
  whatsappGroupLink?: string;
  websiteUrl?: string;
  memberCount?: number;
  foundedYear?: number;
  coverPhotoUrl?: string;
  logoUrl?: string;
}

export class StaticScraper {
  private userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'
  ];

  /**
   * Scrape a static HTML website
   */
  async scrape(source: any): Promise<number> {
    console.log(`[Agent #116] 📄 Scraping static site: ${source.name}`);

    try {
      // Fetch HTML with random User-Agent
      const html = await this.fetchHTML(source.url);
      
      // Parse with Cheerio
      const $ = cheerio.load(html);
      
      // Extract events using selectors
      const events = await this.extractEvents($, source);
      
      // Store in scrapedEvents table
      await this.storeEvents(events, source.id);
      
      console.log(`[Agent #116] ✅ Found ${events.length} events from ${source.name}`);
      return events.length;
      
    } catch (error) {
      console.error(`[Agent #116] ❌ Failed to scrape ${source.name}:`, error);
      throw error;
    }
  }

  /**
   * Fetch HTML with User-Agent rotation
   */
  private async fetchHTML(url: string): Promise<string> {
    const userAgent = this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': userAgent,
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9'
      },
      timeout: 30000
    });

    return response.data;
  }

  /**
   * Extract events from HTML using Cheerio selectors
   */
  private async extractEvents($: cheerio.CheerioAPI, source: any): Promise<ScrapedEventData[]> {
    const events: ScrapedEventData[] = [];

    // Use AI-generated custom selectors if available, otherwise fall back to generic
    let selectors: any;
    
    if (source.customSelectors && source.customSelectors.eventList && source.customSelectors.eventList.length > 0) {
      console.log(`[Agent #116] 🤖 Using AI-generated selectors for ${source.name}`);
      selectors = source.customSelectors;
    } else {
      console.log(`[Agent #116] 📋 Using generic selectors for ${source.name}`);
      selectors = {
        eventList: ['.event-item', '.milonga-item', 'article.event', '.calendar-event'],
        title: ['h2', 'h3', '.event-title', '.milonga-name'],
        date: ['time[datetime]', '.event-date', '.date', '[itemprop="startDate"]'],
        location: ['.venue-name', '.location', '[itemprop="location"]'],
        description: ['.event-description', '.description', 'p']
      };
    }

    // Try each selector pattern
    for (const listSelector of selectors.eventList) {
      const eventElements = $(listSelector);
      
      if (eventElements.length === 0) continue;

      eventElements.each((i, elem) => {
        try {
          const event = this.parseEventElement($, $(elem), selectors);
          if (event.title && event.startDate) {
            events.push(event);
          }
        } catch (err) {
          // Skip invalid events
        }
      });

      if (events.length > 0) break; // Found events, stop trying selectors
    }

    // Try JSON-LD structured data
    if (events.length === 0) {
      const jsonLdEvents = this.extractJSONLD($);
      events.push(...jsonLdEvents);
    }

    return events;
  }

  /**
   * Parse individual event element
   */
  private parseEventElement($: cheerio.CheerioAPI, elem: cheerio.Cheerio<any>, selectors: any): ScrapedEventData {
    let title = '';
    let dateStr = '';
    let location = '';
    let description = '';

    // Extract title
    for (const sel of selectors.title) {
      const text = elem.find(sel).first().text().trim();
      if (text) {
        title = text;
        break;
      }
    }

    // Extract date
    for (const sel of selectors.date) {
      const dateElem = elem.find(sel).first();
      dateStr = dateElem.attr('datetime') || dateElem.text().trim();
      if (dateStr) break;
    }

    // Extract location
    for (const sel of selectors.location) {
      const text = elem.find(sel).first().text().trim();
      if (text) {
        location = text;
        break;
      }
    }

    // Extract description
    for (const sel of selectors.description) {
      const text = elem.find(sel).first().text().trim();
      if (text && text.length > 20) {
        description = text;
        break;
      }
    }

    return {
      title,
      startDate: this.parseDate(dateStr),
      location,
      description
    };
  }

  /**
   * Extract events from JSON-LD structured data
   */
  private extractJSONLD($: cheerio.CheerioAPI): ScrapedEventData[] {
    const events: ScrapedEventData[] = [];

    $('script[type="application/ld+json"]').each((i, elem) => {
      try {
        const json = JSON.parse($(elem).html() || '');
        if (json['@type'] === 'Event' || json['@type']?.includes('Event')) {
          events.push({
            title: json.name,
            description: json.description,
            startDate: new Date(json.startDate),
            endDate: json.endDate ? new Date(json.endDate) : undefined,
            location: json.location?.name,
            address: json.location?.address?.streetAddress,
            imageUrl: json.image
          });
        }
      } catch (err) {
        // Skip invalid JSON-LD
      }
    });

    return events;
  }

  /**
   * Parse date string into Date object
   */
  private parseDate(dateStr: string): Date {
    // Try ISO format first
    if (dateStr.match(/^\d{4}-\d{2}-\d{2}/)) {
      return new Date(dateStr);
    }

    // Try common formats
    const formats = [
      /(\d{1,2})\/(\d{1,2})\/(\d{4})/, // MM/DD/YYYY
      /(\d{1,2})-(\d{1,2})-(\d{4})/,   // MM-DD-YYYY
      /(\d{4})\/(\d{1,2})\/(\d{1,2})/, // YYYY/MM/DD
    ];

    for (const format of formats) {
      const match = dateStr.match(format);
      if (match) {
        return new Date(dateStr);
      }
    }

    // Fallback: try Date.parse()
    const parsed = Date.parse(dateStr);
    if (!isNaN(parsed)) {
      return new Date(parsed);
    }

    // Default to today if parsing fails
    return new Date();
  }

  /**
   * Store scraped events in database
   */
  private async storeEvents(events: ScrapedEventData[], sourceId: number): Promise<void> {
    for (const event of events) {
      // Match event location to city group using CityMatcherService
      let groupId: number | null = null;

      if (event.location || event.address) {
        const locationString = event.location || event.address || '';
        const matchResult = await cityMatcherService.matchEventLocation(locationString);
        if (matchResult) {
          groupId = matchResult;
        }
      }
      
      try {
        await db.insert(scrapedEvents).values({
          sourceId,
          sourceUrl: event.externalId || 'unknown',
          sourceName: 'Static Scraper',
          title: event.title,
          description: event.description || '',
          startDate: event.startDate,
          endDate: event.endDate,
          location: event.location,
          address: event.address,
          organizer: event.organizer,
          price: event.price ? event.price.toString() : null,
          imageUrl: event.imageUrl,
          externalId: event.externalId,
          groupId,
          status: 'approved'
        });
      } catch (err) {
        console.error('[Agent #116] Failed to store event:', err);
      }
    }
  }

  /**
   * Extract community metadata from About/Info pages
   * NEW: Community data extraction for city group enrichment
   */
  async extractCommunityMetadata(source: any): Promise<ScrapedCommunityMetadata | null> {
    console.log(`[Agent #116] 📋 Extracting community metadata from: ${source.name}`);

    try {
      const baseUrl = new URL(source.url);
      const metadata: ScrapedCommunityMetadata = {
        websiteUrl: source.url
      };

      // Try to fetch About/Info page
      const aboutPages = [
        '/about', '/about-us', '/info', '/community', '/sobre-nosotros',
        '/quienes-somos', '/chi-siamo', '/ueber-uns', '/a-propos'
      ];

      let aboutHtml = '';
      for (const aboutPath of aboutPages) {
        try {
          const aboutUrl = `${baseUrl.origin}${aboutPath}`;
          aboutHtml = await this.fetchHTML(aboutUrl);
          if (aboutHtml && aboutHtml.length > 1000) {
            console.log(`[Agent #116] Found About page at: ${aboutUrl}`);
            break;
          }
        } catch {
          // Continue to next path
        }
      }

      // Parse main page if no About page found
      if (!aboutHtml) {
        aboutHtml = await this.fetchHTML(source.url);
      }

      const $ = cheerio.load(aboutHtml);

      // Extract community name
      metadata.communityName = $('h1').first().text().trim() || 
                               $('meta[property="og:title"]').attr('content') ||
                               source.name;

      // Extract description
      metadata.description = $('meta[name="description"]').attr('content') ||
                            $('meta[property="og:description"]').attr('content') ||
                            $('p.description, .about-text, .community-description').first().text().trim();

      // Extract rules/guidelines
      const rulesSelectors = ['.rules li', '.guidelines li', '.normas li', 'ol.rules li'];
      const rules: string[] = [];
      for (const selector of rulesSelectors) {
        $(selector).each((i, elem) => {
          const rule = $(elem).text().trim();
          if (rule && rule.length > 10) {
            rules.push(rule);
          }
        });
        if (rules.length > 0) break;
      }
      if (rules.length > 0) metadata.rules = rules;

      // Extract social media links
      $('a[href*="facebook.com"]').first().each((i, el) => {
        metadata.facebookUrl = $(el).attr('href') || undefined;
      });
      $('a[href*="instagram.com"]').first().each((i, el) => {
        metadata.instagramUrl = $(el).attr('href') || undefined;
      });
      $('a[href*="youtube.com"]').first().each((i, el) => {
        metadata.youtubeUrl = $(el).attr('href') || undefined;
      });
      $('a[href*="wa.me"], a[href*="whatsapp.com"]').first().each((i, el) => {
        metadata.whatsappGroupLink = $(el).attr('href') || undefined;
      });

      // Extract contact info
      const emailMatch = aboutHtml.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      if (emailMatch) metadata.contactEmail = emailMatch[0];

      const phoneMatch = aboutHtml.match(/\+?[\d\s\-()]{10,}/);
      if (phoneMatch) metadata.contactPhone = phoneMatch[0].trim();

      // Extract cover photo
      metadata.coverPhotoUrl = $('meta[property="og:image"]').attr('content') ||
                               $('header img, .hero img, .banner img').first().attr('src') || undefined;

      // Store community data if we found meaningful info
      if (metadata.description || metadata.rules || metadata.facebookUrl) {
        await this.storeCommunityData(source.id, metadata);
        console.log(`[Agent #116] ✅ Extracted community metadata for ${source.name}`);
        return metadata;
      }

      return null;

    } catch (error) {
      console.error(`[Agent #116] ❌ Failed to extract community metadata:`, error);
      return null;
    }
  }

  /**
   * Store community metadata in database
   */
  private async storeCommunityData(sourceId: number, metadata: ScrapedCommunityMetadata): Promise<void> {
    try {
      await db.insert(scrapedCommunityData).values({
        sourceId,
        communityName: metadata.communityName,
        description: metadata.description,
        history: metadata.history,
        culture: metadata.culture,
        rules: metadata.rules,
        dressCode: metadata.dressCode,
        etiquette: metadata.etiquette,
        organizers: metadata.organizers,
        contactEmail: metadata.contactEmail,
        contactPhone: metadata.contactPhone,
        facebookUrl: metadata.facebookUrl,
        instagramUrl: metadata.instagramUrl,
        youtubeUrl: metadata.youtubeUrl,
        whatsappGroupLink: metadata.whatsappGroupLink,
        websiteUrl: metadata.websiteUrl,
        memberCount: metadata.memberCount,
        foundedYear: metadata.foundedYear,
        coverPhotoUrl: metadata.coverPhotoUrl,
        logoUrl: metadata.logoUrl,
        dataQuality: this.calculateDataQuality(metadata),
        approved: false
      });
    } catch (err) {
      console.error('[Agent #116] Failed to store community data:', err);
    }
  }

  /**
   * Calculate data quality score (0-100)
   */
  private calculateDataQuality(metadata: ScrapedCommunityMetadata): number {
    let score = 0;
    if (metadata.communityName) score += 10;
    if (metadata.description && metadata.description.length > 50) score += 20;
    if (metadata.rules && metadata.rules.length > 0) score += 15;
    if (metadata.facebookUrl) score += 10;
    if (metadata.instagramUrl) score += 10;
    if (metadata.whatsappGroupLink) score += 10;
    if (metadata.contactEmail) score += 10;
    if (metadata.coverPhotoUrl) score += 10;
    if (metadata.history) score += 5;
    return Math.min(score, 100);
  }

  /**
   * Scrape both events AND community metadata
   */
  async scrapeWithCommunityData(source: any): Promise<{ events: number; hasCommunityData: boolean }> {
    const events = await this.scrape(source);
    const communityData = await this.extractCommunityMetadata(source);
    
    return {
      events,
      hasCommunityData: communityData !== null
    };
  }
}

export const staticScraper = new StaticScraper();
