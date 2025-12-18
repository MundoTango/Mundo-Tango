import * as cheerio from 'cheerio';
import { db } from '../../../server/db';
import { scrapedEvents, events } from '../../../shared/schema';
import { eq, and } from 'drizzle-orm';

export interface ScrapedEventData {
  sourceUrl: string;
  sourcePlatform: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate?: Date;
  location?: string;
  city?: string;
  country?: string;
  venueAddress?: string;
  organizerName?: string;
  organizerUrl?: string;
  imageUrl?: string;
  price?: string;
  registrationUrl?: string;
  rawData?: any;
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
