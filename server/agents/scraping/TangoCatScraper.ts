/**
 * TANGO CAT SCRAPER
 * Scrapes tangocat.net for international tango festivals and marathons
 * 
 * URLs: tangocat.net/2025/ and tangocat.net/2026/
 * Data: Festivals, marathons, encuentros worldwide
 */

import axios from 'axios';
import * as cheerio from 'cheerio';
import { db } from '@shared/db';
import { scrapedEvents } from '@shared/schema';
import { cityMatcherService } from '../../services/CityMatcherService';

interface TangoCatEvent {
  title: string;
  dates: string;
  location: string;
  country: string;
  city: string;
  eventType: string;
  website?: string;
  description?: string;
}

export class TangoCatScraper {
  private baseUrl = 'https://tangocat.net';
  private years = ['2025', '2026'];
  
  private userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'
  ];

  async scrapeAllYears(sourceId: number): Promise<number> {
    console.log('[TangoCat] 🐱 Starting scrape for all years');
    let totalEvents = 0;

    for (const year of this.years) {
      try {
        const events = await this.scrapeYear(year, sourceId);
        totalEvents += events;
        console.log(`[TangoCat] ✅ ${year}: ${events} events`);
      } catch (error) {
        console.error(`[TangoCat] ❌ Failed to scrape ${year}:`, error);
      }
    }

    console.log(`[TangoCat] 🎉 Total events scraped: ${totalEvents}`);
    return totalEvents;
  }

  async scrapeYear(year: string, sourceId: number): Promise<number> {
    console.log(`[TangoCat] 📅 Scraping ${year}...`);

    const url = `${this.baseUrl}/${year}/`;
    const html = await this.fetchHTML(url);
    const $ = cheerio.load(html);
    
    const events = this.extractEvents($, year);
    
    if (events.length === 0) {
      console.log(`[TangoCat] ⚠️ No events found for ${year}`);
      return 0;
    }

    await this.storeEvents(events, sourceId, year);
    return events.length;
  }

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

  private extractEvents($: cheerio.CheerioAPI, year: string): TangoCatEvent[] {
    const events: TangoCatEvent[] = [];

    // TangoCat typically lists events in tables or list format by month
    // Look for event entries
    $('table tr, .event-row, [class*="festival"], [class*="marathon"], article').each((i, elem) => {
      try {
        const $row = $(elem);
        
        // Skip header rows
        if ($row.find('th').length > 0) return;
        
        // Extract title
        const title = $row.find('a, .title, .event-name, h3, h4')
          .first()
          .text()
          .trim();
        
        if (!title || title.length < 3) return;

        // Extract dates
        const datesText = $row.find('[class*="date"], td:first-child, .dates, time')
          .first()
          .text()
          .trim();

        // Extract location/city
        const locationText = $row.find('[class*="location"], [class*="city"], td:nth-child(3), .location')
          .text()
          .trim();

        // Extract country
        const countryText = $row.find('[class*="country"], td:nth-child(4), .country, img[alt]')
          .attr('alt') || 
          $row.find('[class*="country"], .country')
            .text()
            .trim();

        // Extract website link
        const website = $row.find('a[href*="http"]').attr('href');

        // Determine event type from title
        let eventType = 'Festival';
        const titleLower = title.toLowerCase();
        if (titleLower.includes('marathon')) eventType = 'Marathon';
        else if (titleLower.includes('encuentro')) eventType = 'Encuentro';
        else if (titleLower.includes('festival')) eventType = 'Festival';
        else if (titleLower.includes('camp')) eventType = 'Tango Camp';
        else if (titleLower.includes('congress')) eventType = 'Congress';

        // Parse city from location
        const city = locationText.split(',')[0]?.trim() || locationText;

        events.push({
          title,
          dates: datesText || `${year}`,
          location: locationText || city,
          country: countryText || 'Unknown',
          city,
          eventType,
          website,
          description: `${eventType} in ${city}, ${countryText}`
        });
      } catch (err) {
        console.error('[TangoCat] Error extracting event:', err);
      }
    });

    // Also try to find events in list format
    $('li, .event-item').each((i, elem) => {
      try {
        const $item = $(elem);
        const text = $item.text();
        
        // Skip if already processed or too short
        if (text.length < 10) return;
        
        // Look for date patterns (e.g., "Jan 15-18", "February 2025")
        const dateMatch = text.match(/([A-Z][a-z]{2,8})\s*(\d{1,2})[-–]?(\d{1,2})?,?\s*(\d{4})?/);
        
        if (dateMatch) {
          const title = $item.find('a, strong, b').first().text().trim() || 
                       text.split(/[,\-–]/).map(s => s.trim()).filter(s => s.length > 3)[0];
          
          if (title && title.length > 3) {
            const website = $item.find('a[href*="http"]').attr('href');
            
            events.push({
              title,
              dates: dateMatch[0],
              location: 'See website',
              country: 'Various',
              city: 'Various',
              eventType: 'Festival',
              website
            });
          }
        }
      } catch (err) {
        // Skip parsing errors
      }
    });

    // Deduplicate by title
    const uniqueEvents = events.filter((event, index, self) =>
      index === self.findIndex(e => e.title.toLowerCase() === event.title.toLowerCase())
    );

    return uniqueEvents;
  }

  private async storeEvents(events: TangoCatEvent[], sourceId: number, year: string): Promise<void> {
    console.log(`[TangoCat] 💾 Storing ${events.length} events for ${year}`);

    for (const event of events) {
      try {
        // Match city to group
        const matchResult = await cityMatcherService.matchEventLocation(event.city);
        const groupId = matchResult?.groupId || null;

        // Parse date from dates string
        const startDate = this.parseDateFromString(event.dates, year);
        const endDate = this.parseEndDate(event.dates, startDate);

        await db.insert(scrapedEvents).values({
          sourceId,
          sourceUrl: `tangocat.net/${year}`,
          sourceName: 'TangoCat',
          title: event.title,
          description: event.description || `${event.eventType} - ${event.location}`,
          startDate,
          endDate,
          location: event.location,
          address: `${event.city}, ${event.country}`,
          organizer: event.website ? new URL(event.website).hostname : undefined,
          groupId,
          status: 'pending_review',
          externalId: `tangocat-${year}-${event.title}`.toLowerCase().replace(/\s+/g, '-').slice(0, 100)
        });
      } catch (err) {
        console.error(`[TangoCat] Failed to store event "${event.title}":`, err);
      }
    }
  }

  private parseDateFromString(dateStr: string, year: string): Date {
    const monthMap: Record<string, number> = {
      'jan': 0, 'january': 0,
      'feb': 1, 'february': 1,
      'mar': 2, 'march': 2,
      'apr': 3, 'april': 3,
      'may': 4,
      'jun': 5, 'june': 5,
      'jul': 6, 'july': 6,
      'aug': 7, 'august': 7,
      'sep': 8, 'september': 8,
      'oct': 9, 'october': 9,
      'nov': 10, 'november': 10,
      'dec': 11, 'december': 11
    };

    const dateMatch = dateStr.toLowerCase().match(/([a-z]+)\s*(\d{1,2})/);
    
    if (dateMatch) {
      const month = monthMap[dateMatch[1]] ?? 0;
      const day = parseInt(dateMatch[2], 10) || 1;
      const eventYear = dateStr.match(/(\d{4})/) ? parseInt(dateStr.match(/(\d{4})/)?.[1] || year, 10) : parseInt(year, 10);
      
      return new Date(eventYear, month, day, 20, 0, 0);
    }

    // Default to first of year
    return new Date(parseInt(year, 10), 0, 1, 20, 0, 0);
  }

  private parseEndDate(dateStr: string, startDate: Date): Date | undefined {
    // Look for date range pattern (e.g., "Jan 15-18")
    const rangeMatch = dateStr.match(/(\d{1,2})[-–](\d{1,2})/);
    
    if (rangeMatch) {
      const endDay = parseInt(rangeMatch[2], 10);
      const endDate = new Date(startDate);
      endDate.setDate(endDay);
      
      // If end day is less than start day, it might be next month
      if (endDate < startDate) {
        endDate.setMonth(endDate.getMonth() + 1);
      }
      
      return endDate;
    }

    // Default to 3 days for festivals
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 3);
    return endDate;
  }
}

export const tangoCatScraper = new TangoCatScraper();
