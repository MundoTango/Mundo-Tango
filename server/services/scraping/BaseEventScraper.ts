// ============================================================================
// BASE EVENT SCRAPER - Abstract class for BA event scrapers
// MB.MD Phase 1 - Buenos Aires Event Scraping Infrastructure
// ============================================================================

import axios, { AxiosInstance } from 'axios';
import * as cheerio from 'cheerio';
import { db } from '@shared/db';
import { scrapedEvents, type InsertScrapedEvent } from '@shared/schema';

// ============================================================================
// TYPES
// ============================================================================

export interface ScrapedEventData {
  sourceEventId?: string;
  sourceUrl: string;
  title: string;
  description?: string;
  venueName?: string;
  venueAddress?: string;
  latitude?: number;
  longitude?: number;
  startDate: Date;
  endDate?: Date;
  eventType?: string;
  priceInfo?: string;
  rawHtml?: string;
  rawData?: Record<string, any>;
}

export interface ScraperConfig {
  source: string; // 'buenosairestango' | 'tangoargentino' | 'hoymilonga'
  baseUrl: string;
  userAgent?: string;
  timeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
}

export interface ScraperStats {
  totalFetched: number;
  totalScraped: number;
  totalSaved: number;
  totalErrors: number;
  startTime: Date;
  endTime?: Date;
  duration?: number;
}

// ============================================================================
// BASE EVENT SCRAPER CLASS
// ============================================================================

export abstract class BaseEventScraper {
  protected config: ScraperConfig;
  protected httpClient: AxiosInstance;
  protected stats: ScraperStats;

  constructor(config: ScraperConfig) {
    this.config = {
      userAgent: 'Mozilla/5.0 (compatible; MundoTango/1.0; +https://mundo-tango.vercel.app)',
      timeout: 30000,
      retryAttempts: 3,
      retryDelay: 1000,
      ...config,
    };

    this.httpClient = axios.create({
      baseURL: this.config.baseUrl,
      timeout: this.config.timeout,
      headers: {
        'User-Agent': this.config.userAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'es-AR,es;q=0.9,en;q=0.8',
      },
    });

    this.stats = {
      totalFetched: 0,
      totalScraped: 0,
      totalSaved: 0,
      totalErrors: 0,
      startTime: new Date(),
    };
  }

  // ============================================================================
  // ABSTRACT METHODS - Must be implemented by subclasses
  // ============================================================================

  /**
   * Fetch the list of event URLs or pages to scrape
   */
  protected abstract fetchEventUrls(): Promise<string[]>;

  /**
   * Scrape a single event page and extract event data
   */
  protected abstract scrapeEventPage(url: string, html: string): Promise<ScrapedEventData | null>;

  /**
   * Optional: Transform/normalize the scraped data before saving
   */
  protected normalizeEventData(data: ScrapedEventData): ScrapedEventData {
    return data;
  }

  // ============================================================================
  // CORE SCRAPING METHODS
  // ============================================================================

  /**
   * Main entry point - Scrape all events from this source
   */
  async scrapeAll(): Promise<ScraperStats> {
    try {
      console.log(`[${this.config.source}] Starting scrape...`);
      this.stats.startTime = new Date();

      // Step 1: Fetch event URLs
      const eventUrls = await this.fetchEventUrls();
      this.stats.totalFetched = eventUrls.length;
      console.log(`[${this.config.source}] Found ${eventUrls.length} event URLs`);

      // Step 2: Scrape each event
      for (const url of eventUrls) {
        try {
          await this.scrapeAndSaveEvent(url);
          this.stats.totalScraped++;
          
          // Add delay to be respectful to the server
          await this.delay(1000);
        } catch (error) {
          console.error(`[${this.config.source}] Error scraping ${url}:`, error);
          this.stats.totalErrors++;
        }
      }

      // Step 3: Finalize stats
      this.stats.endTime = new Date();
      this.stats.duration = this.stats.endTime.getTime() - this.stats.startTime.getTime();

      console.log(`[${this.config.source}] Scrape completed:`, this.stats);
      return this.stats;
    } catch (error) {
      console.error(`[${this.config.source}] Fatal error during scrape:`, error);
      throw error;
    }
  }

  /**
   * Scrape a single event and save to database
   */
  protected async scrapeAndSaveEvent(url: string): Promise<void> {
    try {
      // Fetch the HTML
      const html = await this.fetchWithRetry(url);
      
      // Scrape the event data
      const eventData = await this.scrapeEventPage(url, html);
      
      if (!eventData) {
        console.log(`[${this.config.source}] No data extracted from ${url}`);
        return;
      }

      // Normalize data
      const normalizedData = this.normalizeEventData(eventData);

      // Save to database
      await this.saveScrapedEvent(normalizedData);
      this.stats.totalSaved++;
      
      console.log(`[${this.config.source}] Saved event: ${normalizedData.title}`);
    } catch (error) {
      console.error(`[${this.config.source}] Error processing event ${url}:`, error);
      throw error;
    }
  }

  /**
   * Save scraped event data to the database
   */
  protected async saveScrapedEvent(data: ScrapedEventData): Promise<void> {
    const eventRecord: InsertScrapedEvent = {
      source: this.config.source,
      sourceEventId: data.sourceEventId,
      sourceUrl: data.sourceUrl,
      title: data.title,
      description: data.description,
      venueName: data.venueName,
      venueAddress: data.venueAddress,
      latitude: data.latitude?.toString(),
      longitude: data.longitude?.toString(),
      startDate: data.startDate,
      endDate: data.endDate,
      eventType: data.eventType,
      priceInfo: data.priceInfo,
      rawHtml: data.rawHtml,
      rawData: data.rawData,
    };

    try {
      await db.insert(scrapedEvents).values(eventRecord)
        .onConflictDoUpdate({
          target: [scrapedEvents.source, scrapedEvents.sourceEventId],
          set: {
            title: eventRecord.title,
            description: eventRecord.description,
            venueName: eventRecord.venueName,
            venueAddress: eventRecord.venueAddress,
            startDate: eventRecord.startDate,
            endDate: eventRecord.endDate,
            rawData: eventRecord.rawData,
            updatedAt: new Date(),
          },
        });
    } catch (error) {
      console.error(`[${this.config.source}] Database error saving event:`, error);
      throw error;
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Fetch URL with retry logic
   */
  protected async fetchWithRetry(url: string, attempt = 1): Promise<string> {
    try {
      const response = await this.httpClient.get(url);
      return response.data;
    } catch (error) {
      if (attempt < (this.config.retryAttempts || 3)) {
        console.log(`[${this.config.source}] Retry ${attempt}/${this.config.retryAttempts} for ${url}`);
        await this.delay(this.config.retryDelay || 1000);
        return this.fetchWithRetry(url, attempt + 1);
      }
      throw error;
    }
  }

  /**
   * Load HTML and return Cheerio instance
   */
  protected loadHtml(html: string): cheerio.CheerioAPI {
    return cheerio.load(html);
  }

  /**
   * Delay execution (for rate limiting)
   */
  protected delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Extract date from Spanish text
   */
  protected parseSpanishDate(dateStr: string): Date | null {
    try {
      // This is a simplified parser - real implementation would handle
      // various Spanish date formats like "sábado 15 de diciembre"
      // You'll need to implement proper date parsing based on actual formats
      const date = new Date(dateStr);
      return isNaN(date.getTime()) ? null : date;
    } catch {
      return null;
    }
  }

  /**
   * Clean and normalize text
   */
  protected cleanText(text: string): string {
    return text
      .replace(/\s+/g, ' ')
      .replace(/\n+/g, ' ')
      .trim();
  }

  /**
   * Extract numeric value from price string
   */
  protected extractPrice(priceStr: string): number | null {
    const match = priceStr.match(/\d+/);
    return match ? parseInt(match[0]) : null;
  }

  // ============================================================================
  // GETTERS
  // ============================================================================

  public getStats(): ScraperStats {
    return { ...this.stats };
  }

  public getConfig(): ScraperConfig {
    return { ...this.config };
  }
}
