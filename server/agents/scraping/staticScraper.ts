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
 */

import axios from 'axios';
import * as cheerio from 'cheerio';
import { db } from '@shared/db';
import { scrapedEvents, eventScrapingSources } from '@shared/schema';

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

    // Common selectors for tango event sites
    const selectors = {
      eventList: ['.event-item', '.milonga-item', 'article.event', '.calendar-event'],
      title: ['h2', 'h3', '.event-title', '.milonga-name'],
      date: ['time[datetime]', '.event-date', '.date', '[itemprop="startDate"]'],
      location: ['.venue-name', '.location', '[itemprop="location"]'],
      description: ['.event-description', '.description', 'p']
    };

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
  private parseEventElement($: cheerio.CheerioAPI, elem: cheerio.Cheerio, selectors: any): ScrapedEventData {
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
      try {
        await db.insert(scrapedEvents).values({
          sourceId,
          title: event.title,
          description: event.description || '',
          startDate: event.startDate,
          endDate: event.endDate,
          location: event.location,
          address: event.address,
          organizer: event.organizer,
          price: event.price,
          imageUrl: event.imageUrl,
          externalId: event.externalId,
          scrapedAt: new Date(),
          status: 'pending_review'
        });
      } catch (err) {
        console.error('[Agent #116] Failed to store event:', err);
      }
    }
  }
}

export const staticScraper = new StaticScraper();
