/**
 * HOYMILONGA HTML SCRAPER
 * MB.MD Pattern 51: Data Integrity - Scrape REAL events from hoy-milonga.com
 * 
 * Targets:
 * - Buenos Aires: https://hoy-milonga.com/buenos-aires/en
 * - Montevideo: https://www.hoy-milonga.com/montevideo/
 * - London: https://www.hoy-milonga.com/england/
 * - Istanbul: https://hoy-milonga.com/turkiye/en
 */

import axios from 'axios';
import * as cheerio from 'cheerio';
import { db } from '@shared/db';
import { scrapedEvents, eventScrapingSources, events, groups } from '@shared/schema';
import { eq, and, ilike, sql } from 'drizzle-orm';

export interface HoyMilongaEvent {
  title: string;
  date: Date;
  time?: string;
  venue?: string;
  address?: string;
  description?: string;
  organizer?: string;
  imageUrl?: string;
  eventUrl?: string;
  eventType?: 'milonga' | 'practica' | 'class' | 'festival';
}

export class HoyMilongaScraper {
  private userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  ];

  private cityUrls: Record<string, { url: string; city: string; country: string }> = {
    'buenos-aires': { 
      url: 'https://hoy-milonga.com/buenos-aires/en', 
      city: 'Buenos Aires', 
      country: 'Argentina' 
    },
    'montevideo': { 
      url: 'https://www.hoy-milonga.com/montevideo/', 
      city: 'Montevideo', 
      country: 'Uruguay' 
    },
    'london': { 
      url: 'https://www.hoy-milonga.com/england/', 
      city: 'London', 
      country: 'United Kingdom' 
    },
    'istanbul': { 
      url: 'https://hoy-milonga.com/turkiye/en', 
      city: 'Istanbul', 
      country: 'Turkey' 
    }
  };

  /**
   * Fetch HTML content from URL
   */
  private async fetchPage(url: string): Promise<string> {
    const userAgent = this.userAgents[Math.floor(Math.random() * this.userAgents.length)];

    const response = await axios.get(url, {
      headers: {
        'User-Agent': userAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
      },
      timeout: 30000,
      responseType: 'text'
    });

    return response.data;
  }

  /**
   * Parse HoyMilonga event listings
   * The site has event cards with date, title, venue info
   */
  private parseEventsFromHTML(html: string, city: string, country: string): HoyMilongaEvent[] {
    const $ = cheerio.load(html);
    const events: HoyMilongaEvent[] = [];
    const currentYear = new Date().getFullYear();

    // HoyMilonga uses different selectors - try common patterns
    // Pattern 1: Event cards/divs
    $('div[class*="event"], article[class*="event"], .event-item, .milonga-item').each((i, elem) => {
      try {
        const $elem = $(elem);
        const title = $elem.find('h2, h3, .title, .event-title').first().text().trim();
        const dateText = $elem.find('.date, .event-date, time').first().text().trim();
        const venue = $elem.find('.venue, .location, .place').first().text().trim();
        const address = $elem.find('.address').first().text().trim();
        const description = $elem.find('.description, .details, p').first().text().trim();

        if (title && dateText) {
          const parsedDate = this.parseDate(dateText, currentYear);
          if (parsedDate) {
            events.push({
              title,
              date: parsedDate,
              venue: venue || undefined,
              address: address || undefined,
              description: description || undefined,
              eventType: this.detectEventType(title),
            });
          }
        }
      } catch (err) {
        console.warn(`[HoyMilonga] Failed to parse event element ${i}`);
      }
    });

    // Pattern 2: Table-based listings
    $('table tr, .day-events, .schedule-row').each((i, elem) => {
      try {
        const $elem = $(elem);
        const cells = $elem.find('td');
        
        if (cells.length >= 2) {
          const timeOrDate = $(cells[0]).text().trim();
          const eventInfo = $(cells[1]).text().trim();
          const venue = cells.length > 2 ? $(cells[2]).text().trim() : '';

          if (eventInfo && timeOrDate) {
            const parsedDate = this.parseDate(timeOrDate, currentYear);
            if (parsedDate) {
              events.push({
                title: eventInfo,
                date: parsedDate,
                venue: venue || undefined,
                eventType: this.detectEventType(eventInfo),
              });
            }
          }
        }
      } catch (err) {
        console.warn(`[HoyMilonga] Failed to parse table row ${i}`);
      }
    });

    // Pattern 3: Look for any linked event items
    $('a[href*="event"], a[href*="milonga"]').each((i, elem) => {
      try {
        const $elem = $(elem);
        const href = $elem.attr('href') || '';
        const title = $elem.text().trim();
        
        // Look for date in parent or sibling
        const parent = $elem.parent();
        const dateText = parent.find('.date, time, [class*="date"]').first().text().trim() ||
                        parent.prev().text().trim();

        if (title && title.length > 3 && title.length < 200) {
          const parsedDate = this.parseDate(dateText, currentYear);
          if (parsedDate) {
            // Avoid duplicates
            const exists = events.some(e => e.title === title);
            if (!exists) {
              events.push({
                title,
                date: parsedDate,
                eventUrl: href.startsWith('http') ? href : undefined,
                eventType: this.detectEventType(title),
              });
            }
          }
        }
      } catch (err) {
        console.warn(`[HoyMilonga] Failed to parse link ${i}`);
      }
    });

    console.log(`[HoyMilonga] Parsed ${events.length} events from ${city}`);
    return events;
  }

  /**
   * Parse various date formats from HoyMilonga
   */
  private parseDate(dateText: string, currentYear: number): Date | null {
    if (!dateText) return null;

    // Try common formats
    const patterns = [
      // "Dec 15" or "December 15"
      /(\w+)\s+(\d{1,2})/,
      // "15 Dec" or "15 December"  
      /(\d{1,2})\s+(\w+)/,
      // "15/12" or "15-12"
      /(\d{1,2})[\/\-](\d{1,2})/,
      // ISO-ish: "2025-12-15"
      /(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/,
    ];

    const months: Record<string, number> = {
      'jan': 0, 'january': 0, 'ene': 0, 'enero': 0,
      'feb': 1, 'february': 1, 'febrero': 1,
      'mar': 2, 'march': 2, 'marzo': 2,
      'apr': 3, 'april': 3, 'abr': 3, 'abril': 3,
      'may': 4, 'mayo': 4,
      'jun': 5, 'june': 5, 'junio': 5,
      'jul': 6, 'july': 6, 'julio': 6,
      'aug': 7, 'august': 7, 'ago': 7, 'agosto': 7,
      'sep': 8, 'september': 8, 'sept': 8, 'septiembre': 8,
      'oct': 9, 'october': 9, 'octubre': 9,
      'nov': 10, 'november': 10, 'noviembre': 10,
      'dec': 11, 'december': 11, 'dic': 11, 'diciembre': 11,
    };

    const normalized = dateText.toLowerCase().trim();

    // Try month name patterns
    for (const [name, num] of Object.entries(months)) {
      if (normalized.includes(name)) {
        const dayMatch = normalized.match(/(\d{1,2})/);
        if (dayMatch) {
          const day = parseInt(dayMatch[1]);
          if (day >= 1 && day <= 31) {
            return new Date(currentYear, num, day);
          }
        }
      }
    }

    // Try numeric patterns
    const numericMatch = normalized.match(/(\d{1,2})[\/\-](\d{1,2})/);
    if (numericMatch) {
      const first = parseInt(numericMatch[1]);
      const second = parseInt(numericMatch[2]);
      // Assume day/month format (European)
      if (first <= 31 && second <= 12) {
        return new Date(currentYear, second - 1, first);
      }
    }

    return null;
  }

  /**
   * Detect event type from title
   */
  private detectEventType(title: string): HoyMilongaEvent['eventType'] {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('milonga')) return 'milonga';
    if (lowerTitle.includes('practica') || lowerTitle.includes('práctica')) return 'practica';
    if (lowerTitle.includes('class') || lowerTitle.includes('clase') || lowerTitle.includes('lesson')) return 'class';
    if (lowerTitle.includes('festival') || lowerTitle.includes('marathon')) return 'festival';
    return 'milonga'; // Default for tango events
  }

  /**
   * Scrape events from a specific city
   */
  async scrapeCity(cityKey: string): Promise<{
    success: boolean;
    eventsFound: number;
    eventsStored: number;
    city: string;
    error?: string;
  }> {
    const cityConfig = this.cityUrls[cityKey];
    if (!cityConfig) {
      return { success: false, eventsFound: 0, eventsStored: 0, city: cityKey, error: 'Unknown city' };
    }

    console.log(`[HoyMilonga] 🔄 Scraping ${cityConfig.city}...`);

    try {
      const html = await this.fetchPage(cityConfig.url);
      const events = this.parseEventsFromHTML(html, cityConfig.city, cityConfig.country);

      if (events.length === 0) {
        console.log(`[HoyMilonga] ⚠️ No events found for ${cityConfig.city} - page structure may have changed`);
        return { success: true, eventsFound: 0, eventsStored: 0, city: cityConfig.city };
      }

      // Find the city group
      const cityGroup = await db.query.groups.findFirst({
        where: and(
          eq(groups.type, 'city'),
          ilike(groups.city, cityConfig.city)
        )
      });

      let storedCount = 0;

      for (const event of events) {
        try {
          // Store in scraped_events first
          await db.insert(scrapedEvents).values({
            sourceUrl: cityConfig.url,
            sourceName: 'HoyMilonga',
            title: event.title,
            description: event.description || '',
            startDate: event.date,
            location: event.venue || cityConfig.city,
            address: event.address,
            organizer: event.organizer,
            imageUrl: event.imageUrl,
            externalId: this.generateEventId(event.title, event.date),
            status: 'approved',
            city: cityConfig.city,
            country: cityConfig.country,
            groupId: cityGroup?.id
          }).onConflictDoNothing();

          storedCount++;
        } catch (err: any) {
          if (!err.message?.includes('duplicate')) {
            console.error(`[HoyMilonga] ❌ Failed to store event:`, err.message);
          }
        }
      }

      // Update scraping source stats
      const source = await db.query.eventScrapingSources.findFirst({
        where: ilike(eventScrapingSources.name, `%HoyMilonga%${cityConfig.city}%`)
      });

      if (source) {
        await db.update(eventScrapingSources)
          .set({
            lastScrapedAt: new Date(),
            totalEventsScraped: (source.totalEventsScraped || 0) + storedCount,
            updatedAt: new Date()
          })
          .where(eq(eventScrapingSources.id, source.id));
      }

      console.log(`[HoyMilonga] ✅ ${cityConfig.city}: Found ${events.length} events, stored ${storedCount}`);

      return {
        success: true,
        eventsFound: events.length,
        eventsStored: storedCount,
        city: cityConfig.city
      };

    } catch (error: any) {
      console.error(`[HoyMilonga] ❌ Failed to scrape ${cityConfig.city}:`, error.message);
      return {
        success: false,
        eventsFound: 0,
        eventsStored: 0,
        city: cityConfig.city,
        error: error.message
      };
    }
  }

  /**
   * Generate unique event ID
   */
  private generateEventId(title: string, date: Date): string {
    const dateStr = date.toISOString().split('T')[0];
    const titleHash = this.hashString(title.toLowerCase().replace(/\s+/g, '-'));
    return `hm-${dateStr}-${titleHash}`;
  }

  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36).slice(0, 8);
  }

  /**
   * Scrape all configured cities
   */
  async scrapeAllCities(): Promise<{
    totalFound: number;
    totalStored: number;
    results: Array<{ city: string; found: number; stored: number; success: boolean }>;
  }> {
    console.log('[HoyMilonga] 🚀 Starting full scrape of all cities...');

    const results: Array<{ city: string; found: number; stored: number; success: boolean }> = [];
    let totalFound = 0;
    let totalStored = 0;

    for (const cityKey of Object.keys(this.cityUrls)) {
      const result = await this.scrapeCity(cityKey);
      results.push({
        city: result.city,
        found: result.eventsFound,
        stored: result.eventsStored,
        success: result.success
      });
      totalFound += result.eventsFound;
      totalStored += result.eventsStored;

      // Small delay between cities to be respectful
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log(`[HoyMilonga] 🏁 Complete: ${totalFound} events found, ${totalStored} stored`);

    return { totalFound, totalStored, results };
  }
}

export const hoyMilongaScraper = new HoyMilongaScraper();
