import * as cheerio from 'cheerio';
import { db } from '../db';
import { scrapedEvents, events } from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import { languageAwareFieldMapper, SupportedLanguage } from '../../services/LanguageAwareFieldMapper';
import { detailDiscoveryService } from '../../services/DetailDiscoveryService';

export interface ScrapedEventData {
  sourceUrl: string;
  sourcePlatform: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate?: Date;
  startTime?: string;  // Local time (e.g., "20:00")
  endTime?: string;    // Local time (e.g., "01:00")
  location?: string;
  city?: string;
  country?: string;
  venueAddress?: string;
  organizerName?: string;
  organizerUrl?: string;
  imageUrl?: string;
  price?: string;
  registrationUrl?: string;
  // Team members
  djs?: string[];
  teachers?: string[];
  orchestras?: string[];
  performers?: string[];
  hosts?: string[];
  rawData?: any;
}

export interface JsonLdEvent {
  name?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  location?: {
    name?: string;
    address?: string | {
      streetAddress?: string;
      addressLocality?: string;
      addressRegion?: string;
      addressCountry?: string;
    };
  };
  organizer?: string | { name?: string };
  performer?: string | { name?: string } | Array<{ name?: string }>;
  image?: string | string[];
  offers?: { price?: number; priceCurrency?: string } | Array<{ price?: number; priceCurrency?: string }>;
}

export abstract class BaseEventScraper {
  protected sourcePlatform: string;
  
  constructor(sourcePlatform: string) {
    this.sourcePlatform = sourcePlatform;
  }

  // Abstract method that each scraper must implement
  abstract scrape(): Promise<ScrapedEventData[]>;

  // Helper to fetch and parse HTML
  protected async fetchHTML(url: string): Promise<cheerio.CheerioAPI> {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }
    });
    const html = await response.text();
    return cheerio.load(html);
  }

  /**
   * Detect language from HTML content (stateless)
   */
  protected detectLanguage(html: string): SupportedLanguage {
    return languageAwareFieldMapper.detectLanguage(html);
  }

  /**
   * Fetch detail page and extract enriched data
   */
  protected async fetchDetailPage(url: string) {
    return detailDiscoveryService.fetchDetailPage(url);
  }

  /**
   * Parse JSON-LD structured data from HTML, handling arrays and @graph
   */
  protected parseJsonLd($: cheerio.CheerioAPI): JsonLdEvent[] {
    const events: JsonLdEvent[] = [];
    
    $('script[type="application/ld+json"]').each((_, el) => {
      try {
        const jsonText = $(el).html();
        if (!jsonText) return;
        
        let jsonData = JSON.parse(jsonText);
        
        // Handle arrays and @graph entries
        const items: any[] = [];
        if (Array.isArray(jsonData)) {
          items.push(...jsonData);
        } else if (jsonData['@graph'] && Array.isArray(jsonData['@graph'])) {
          items.push(...jsonData['@graph']);
        } else {
          items.push(jsonData);
        }

        for (const item of items) {
          const type = item['@type'];
          if (type === 'DanceEvent' || type === 'Event' || type === 'MusicEvent' || type === 'SocialEvent') {
            events.push(item as JsonLdEvent);
          }
        }
      } catch (e) {
        // JSON parse error, skip
      }
    });
    
    return events;
  }

  /**
   * Extract local time from ISO date string (e.g., "2025-12-17T20:00:00" -> "20:00")
   */
  protected extractLocalTime(isoDate?: string): string | undefined {
    if (!isoDate) return undefined;
    const match = isoDate.match(/T(\d{2}:\d{2})/);
    return match ? match[1] : undefined;
  }

  /**
   * Build full address from JSON-LD location data
   */
  protected buildFullAddress(location?: JsonLdEvent['location']): string | undefined {
    if (!location) return undefined;
    
    if (typeof location.address === 'string') {
      return location.address;
    }
    
    if (location.address) {
      const addr = location.address;
      return [
        addr.streetAddress,
        addr.addressLocality,
        addr.addressRegion,
        addr.addressCountry
      ].filter(Boolean).join(', ');
    }
    
    return undefined;
  }

  /**
   * Extract team members from text using language-aware patterns
   */
  protected extractTeamMembers(text: string, language: SupportedLanguage = 'en') {
    return languageAwareFieldMapper.extractAllRoles(text, language);
  }

  // Save scraped events to database
  async saveScrapedEvents(events: ScrapedEventData[]): Promise<void> {
    for (const event of events) {
      try {
        // Check if event already exists
        const existing = await db.query.scrapedEvents.findFirst({
          where: and(
            eq(scrapedEvents.sourceUrl, event.sourceUrl),
            eq(scrapedEvents.sourcePlatform, event.sourcePlatform)
          )
        });

        if (existing) {
          // Update existing event
          await db.update(scrapedEvents)
            .set({
              ...event,
              lastScrapedAt: new Date(),
            })
            .where(eq(scrapedEvents.id, existing.id));
          console.log(`Updated scraped event: ${event.title}`);
        } else {
          // Insert new event
          await db.insert(scrapedEvents).values({
            ...event,
            lastScrapedAt: new Date(),
          });
          console.log(`Inserted new scraped event: ${event.title}`);
        }
      } catch (error) {
        console.error(`Error saving event ${event.title}:`, error);
      }
    }
  }

  // Run the full scraping process
  async run(): Promise<void> {
    console.log(`Starting ${this.sourcePlatform} scraper...`);
    try {
      const events = await this.scrape();
      console.log(`Scraped ${events.length} events from ${this.sourcePlatform}`);
      await this.saveScrapedEvents(events);
      console.log(`${this.sourcePlatform} scraper completed`);
    } catch (error) {
      console.error(`Error running ${this.sourcePlatform} scraper:`, error);
      throw error;
    }
  }
}
