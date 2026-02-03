/**
 * RSS FEED SERVICE
 * TRACK E - RSS Feed Scraping Capability
 * 
 * Responsibilities:
 * - Parse RSS/Atom feeds using built-in XML parsing (via cheerio)
 * - Extract event data: title, date, location, description, link
 * - Normalize to ScrapedEvent format
 * - Handle various RSS and Atom feed formats
 */

import axios from 'axios';
import * as cheerio from 'cheerio';
import { db } from '@shared/db';
import { scrapedEvents, eventScrapingSources } from '@shared/schema';
import { eq } from 'drizzle-orm';

export interface ScrapedEvent {
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
  link?: string;
}

interface RSSFeedResult {
  success: boolean;
  eventsCount: number;
  events: ScrapedEvent[];
  feedTitle?: string;
  feedDescription?: string;
  error?: string;
}

export class RSSFeedService {
  private userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'MundoTango RSS Reader/1.0 (+https://mundotango.app)'
  ];

  /**
   * Fetch and parse an RSS/Atom feed
   */
  async parseFeed(feedUrl: string): Promise<RSSFeedResult> {
    console.log(`[RSSFeedService] 📡 Parsing feed: ${feedUrl}`);

    try {
      const xml = await this.fetchFeed(feedUrl);
      const $ = cheerio.load(xml, { xmlMode: true });

      const isAtom = $('feed').length > 0;
      const isRSS = $('rss').length > 0 || $('channel').length > 0;

      if (!isAtom && !isRSS) {
        return {
          success: false,
          eventsCount: 0,
          events: [],
          error: 'Invalid feed format: Neither RSS nor Atom detected'
        };
      }

      const feedInfo = this.extractFeedInfo($, isAtom);
      const events = isAtom ? this.parseAtomFeed($) : this.parseRSSFeed($);

      console.log(`[RSSFeedService] ✅ Parsed ${events.length} events from ${feedInfo.title || feedUrl}`);

      return {
        success: true,
        eventsCount: events.length,
        events,
        feedTitle: feedInfo.title,
        feedDescription: feedInfo.description
      };

    } catch (error: any) {
      console.error(`[RSSFeedService] ❌ Failed to parse feed:`, error.message);
      return {
        success: false,
        eventsCount: 0,
        events: [],
        error: error.message || 'Failed to parse feed'
      };
    }
  }

  /**
   * Fetch feed XML content
   */
  private async fetchFeed(url: string): Promise<string> {
    const userAgent = this.userAgents[Math.floor(Math.random() * this.userAgents.length)];

    const response = await axios.get(url, {
      headers: {
        'User-Agent': userAgent,
        'Accept': 'application/rss+xml, application/atom+xml, application/xml, text/xml, */*',
        'Accept-Language': 'en-US,en;q=0.9'
      },
      timeout: 30000,
      responseType: 'text'
    });

    return response.data;
  }

  /**
   * Extract feed-level metadata
   */
  private extractFeedInfo($: cheerio.CheerioAPI, isAtom: boolean): { title?: string; description?: string } {
    if (isAtom) {
      return {
        title: $('feed > title').first().text().trim() || undefined,
        description: $('feed > subtitle').first().text().trim() || undefined
      };
    } else {
      return {
        title: $('channel > title').first().text().trim() || undefined,
        description: $('channel > description').first().text().trim() || undefined
      };
    }
  }

  /**
   * Parse RSS 2.0 feed items
   */
  private parseRSSFeed($: cheerio.CheerioAPI): ScrapedEvent[] {
    const events: ScrapedEvent[] = [];

    $('item').each((i, elem) => {
      try {
        const event = this.parseRSSItem($, $(elem));
        if (event) {
          events.push(event);
        }
      } catch (err) {
        console.warn(`[RSSFeedService] ⚠️ Failed to parse RSS item ${i}:`, err);
      }
    });

    return events;
  }

  /**
   * Parse a single RSS item into ScrapedEvent format
   */
  private parseRSSItem($: cheerio.CheerioAPI, item: cheerio.Cheerio<any>): ScrapedEvent | null {
    const title = item.find('title').first().text().trim();
    if (!title) return null;

    const description = item.find('description').first().text().trim() ||
                       item.find('content\\:encoded').first().text().trim();
    
    const link = item.find('link').first().text().trim() ||
                item.find('guid').first().text().trim();

    const pubDate = item.find('pubDate').first().text().trim();
    const dcDate = item.find('dc\\:date').first().text().trim();
    
    const startDate = this.parseEventDate(pubDate || dcDate, title, description);
    
    const imageUrl = this.extractImageFromContent(description) ||
                    item.find('enclosure[type^="image"]').attr('url') ||
                    item.find('media\\:content[medium="image"]').attr('url') ||
                    item.find('media\\:thumbnail').attr('url');

    const author = item.find('author').first().text().trim() ||
                  item.find('dc\\:creator').first().text().trim();

    const categories = item.find('category').map((i, el) => $(el).text().trim()).get();
    
    const location = this.extractLocation(title, description, categories);

    const guid = item.find('guid').first().text().trim();
    const externalId = guid || link || `rss-${this.hashString(title + startDate.toISOString())}`;

    return {
      title,
      description: this.cleanHTML(description),
      startDate,
      location,
      organizer: author || undefined,
      imageUrl: imageUrl || undefined,
      link: link || undefined,
      externalId
    };
  }

  /**
   * Parse Atom feed entries
   */
  private parseAtomFeed($: cheerio.CheerioAPI): ScrapedEvent[] {
    const events: ScrapedEvent[] = [];

    $('entry').each((i, elem) => {
      try {
        const event = this.parseAtomEntry($, $(elem));
        if (event) {
          events.push(event);
        }
      } catch (err) {
        console.warn(`[RSSFeedService] ⚠️ Failed to parse Atom entry ${i}:`, err);
      }
    });

    return events;
  }

  /**
   * Parse a single Atom entry into ScrapedEvent format
   */
  private parseAtomEntry($: cheerio.CheerioAPI, entry: cheerio.Cheerio<any>): ScrapedEvent | null {
    const title = entry.find('title').first().text().trim();
    if (!title) return null;

    const summary = entry.find('summary').first().text().trim();
    const content = entry.find('content').first().text().trim();
    const description = content || summary;

    const link = entry.find('link[rel="alternate"]').attr('href') ||
                entry.find('link').first().attr('href');

    const published = entry.find('published').first().text().trim();
    const updated = entry.find('updated').first().text().trim();
    
    const startDate = this.parseEventDate(published || updated, title, description);

    const imageUrl = this.extractImageFromContent(content || summary) ||
                    entry.find('media\\:content[medium="image"]').attr('url') ||
                    entry.find('media\\:thumbnail').attr('url');

    const author = entry.find('author > name').first().text().trim();

    const categories = entry.find('category').map((i, el) => $(el).attr('term') || $(el).text().trim()).get();
    
    const location = this.extractLocation(title, description, categories);

    const id = entry.find('id').first().text().trim();
    const externalId = id || link || `atom-${this.hashString(title + startDate.toISOString())}`;

    return {
      title,
      description: this.cleanHTML(description),
      startDate,
      location,
      organizer: author || undefined,
      imageUrl: imageUrl || undefined,
      link: link || undefined,
      externalId
    };
  }

  /**
   * Parse date from various formats, with fallback to current date
   * Also attempts to extract event-specific dates from title/description
   */
  private parseEventDate(dateStr: string, title: string, description: string): Date {
    if (dateStr) {
      const parsed = new Date(dateStr);
      if (!isNaN(parsed.getTime())) {
        return parsed;
      }
    }

    const combinedText = `${title} ${description}`;
    
    const datePatterns = [
      /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/,
      /(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/,
      /(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{4})/i,
      /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{1,2}),?\s+(\d{4})/i
    ];

    for (const pattern of datePatterns) {
      const match = combinedText.match(pattern);
      if (match) {
        const parsed = new Date(match[0]);
        if (!isNaN(parsed.getTime())) {
          return parsed;
        }
      }
    }

    return new Date();
  }

  /**
   * Extract location from text content
   */
  private extractLocation(title: string, description: string, categories: string[]): string | undefined {
    const combinedText = `${title} ${description} ${categories.join(' ')}`;

    const locationPatterns = [
      /(?:at|@|location:|venue:)\s*([^,.\n]+)/i,
      /(?:in|en)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/,
    ];

    for (const pattern of locationPatterns) {
      const match = combinedText.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    return undefined;
  }

  /**
   * Extract first image URL from HTML content
   */
  private extractImageFromContent(html: string): string | undefined {
    if (!html) return undefined;

    const imgMatch = html.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (imgMatch && imgMatch[1]) {
      return imgMatch[1];
    }

    return undefined;
  }

  /**
   * Clean HTML tags from text
   */
  private cleanHTML(html: string): string {
    if (!html) return '';
    
    return html
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 5000);
  }

  /**
   * Simple string hash for generating IDs
   */
  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Scrape events from an RSS source and store in database
   */
  async scrapeRSSSource(source: any): Promise<number> {
    if (!source.rssUrl) {
      console.log(`[RSSFeedService] ⚠️ No RSS URL for source: ${source.name}`);
      return 0;
    }

    console.log(`[RSSFeedService] 🔄 Scraping RSS feed for: ${source.name}`);

    const result = await this.parseFeed(source.rssUrl);

    if (!result.success || result.events.length === 0) {
      console.log(`[RSSFeedService] ⚠️ No events found for: ${source.name}`);
      return 0;
    }

    let storedCount = 0;

    for (const event of result.events) {
      try {
        await db.insert(scrapedEvents).values({
          sourceUrl: event.link || source.rssUrl,
          sourceName: source.name,
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
          status: 'approved'
        }).onConflictDoNothing();
        
        storedCount++;
      } catch (err: any) {
        if (!err.message?.includes('duplicate')) {
          console.error(`[RSSFeedService] ❌ Failed to store event:`, err.message);
        }
      }
    }

    await db.update(eventScrapingSources)
      .set({
        lastScrapedAt: new Date(),
        totalEventsScraped: (source.totalEventsScraped || 0) + storedCount,
        updatedAt: new Date()
      })
      .where(eq(eventScrapingSources.id, source.id));

    console.log(`[RSSFeedService] ✅ Stored ${storedCount} events from: ${source.name}`);
    return storedCount;
  }

  /**
   * Add a new RSS feed source
   */
  async addRSSSource(data: {
    name: string;
    rssUrl: string;
    websiteUrl?: string;
    country?: string;
    city?: string;
  }): Promise<{ success: boolean; source?: any; error?: string }> {
    console.log(`[RSSFeedService] ➕ Adding RSS source: ${data.name}`);

    try {
      const feedResult = await this.parseFeed(data.rssUrl);
      
      if (!feedResult.success) {
        return {
          success: false,
          error: `Invalid RSS feed: ${feedResult.error}`
        };
      }

      const [source] = await db.insert(eventScrapingSources).values({
        name: data.name,
        url: data.websiteUrl || data.rssUrl,
        rssUrl: data.rssUrl,
        platform: 'rss',
        country: data.country,
        city: data.city,
        isActive: true,
        scrapeFrequency: 'daily'
      }).returning();

      const eventsStored = await this.scrapeRSSSource({
        ...source,
        rssUrl: data.rssUrl
      });

      console.log(`[RSSFeedService] ✅ RSS source added: ${data.name} (${eventsStored} events)`);

      return {
        success: true,
        source: {
          ...source,
          feedTitle: feedResult.feedTitle,
          feedDescription: feedResult.feedDescription,
          eventsFound: feedResult.eventsCount,
          eventsStored
        }
      };

    } catch (error: any) {
      console.error(`[RSSFeedService] ❌ Failed to add RSS source:`, error);
      return {
        success: false,
        error: error.message || 'Failed to add RSS source'
      };
    }
  }

  /**
   * Validate an RSS feed URL without storing
   */
  async validateFeed(feedUrl: string): Promise<{
    valid: boolean;
    feedTitle?: string;
    eventsCount?: number;
    error?: string;
    sampleEvents?: Array<{ title: string; date: string }>;
  }> {
    const result = await this.parseFeed(feedUrl);

    if (!result.success) {
      return {
        valid: false,
        error: result.error
      };
    }

    return {
      valid: true,
      feedTitle: result.feedTitle,
      eventsCount: result.eventsCount,
      sampleEvents: result.events.slice(0, 5).map(e => ({
        title: e.title,
        date: e.startDate.toISOString()
      }))
    };
  }

  /**
   * Get all RSS sources
   */
  async getRSSSources(): Promise<any[]> {
    return db.query.eventScrapingSources.findMany({
      where: eq(eventScrapingSources.platform, 'rss')
    });
  }
}

export const rssFeedService = new RSSFeedService();
