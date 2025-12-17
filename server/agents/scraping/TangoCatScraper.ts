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
    const seenTitles = new Set<string>();

    // TangoCat stores event data in embedded JSON within script tags
    const scripts = $('script').text();
    
    // Build a map of event ID -> URL from JSON data
    const urlMap = new Map<string, string>();
    const urlMatches = scripts.matchAll(/"id":(\d+)[^}]*?"url":"([^"]+)"/g);
    for (const match of urlMatches) {
      const id = match[1];
      const url = match[2];
      if (url.startsWith('http') && !url.includes('facebook.com') && !url.includes('google.com')) {
        urlMap.set(id, url);
      }
    }
    console.log(`[TangoCat] Found ${urlMap.size} URLs in JSON data`);
    
    // Extract events from /go/ links and match with URLs from JSON
    $('a[href^="/go/"]').each((i, elem) => {
      const $link = $(elem);
      const href = $link.attr('href') || '';
      
      // Extract event name and ID from URL: /go/Event+Name/12345 -> Event Name, 12345
      const nameMatch = href.match(/\/go\/([^/]+)\/(\d+)/);
      if (nameMatch) {
        const name = decodeURIComponent(nameMatch[1].replace(/\+/g, ' '));
        const eventId = nameMatch[2];
        const titleLower = name.toLowerCase();
        
        if (!seenTitles.has(titleLower) && name.length > 3) {
          seenTitles.add(titleLower);
          
          let eventType = 'festival';
          if (titleLower.includes('marathon')) eventType = 'marathon';
          else if (titleLower.includes('encuentro')) eventType = 'encuentro';
          else if (titleLower.includes('festival')) eventType = 'festival';
          else if (titleLower.includes('camp')) eventType = 'festival';
          
          // Look up actual URL from JSON, fallback to redirect link
          const actualUrl = urlMap.get(eventId);
          
          events.push({
            title: name,
            dates: year,
            location: 'Various',
            country: 'Various', 
            city: 'Various',
            eventType,
            website: actualUrl || `https://tangocat.net${href}`,
            description: `${eventType}`
          });
        }
      }
    });

    console.log(`[TangoCat] Found ${events.length} events (${events.filter(e => !e.website?.includes('tangocat.net')).length} with external URLs)`);
    return events.slice(0, 50);
  }

  private async storeEvents(events: TangoCatEvent[], sourceId: number, year: string): Promise<void> {
    console.log(`[TangoCat] 💾 Storing ${events.length} events for ${year}`);

    for (const event of events) {
      try {
        // Match city to group
        const matchResult = await cityMatcherService.matchEventLocation(event.city);
        const groupId = matchResult || null;

        // Parse date from dates string
        const startDate = this.parseDateFromString(event.dates, year);
        const endDate = this.parseEndDate(event.dates, startDate);

        // MULTI-STAGE: Follow the event website link and use that as the source
        let sourceUrl = `https://tangocat.net/${year}/`;
        let sourceName = 'TangoCat';
        let enrichedDescription = event.description || `${event.eventType} - ${event.location}`;

        if (event.website && !event.website.includes('facebook.com') && !event.website.includes('google.com')) {
          try {
            const parsedUrl = new URL(event.website);
            // Use the actual event website as the source
            sourceUrl = event.website;
            sourceName = parsedUrl.hostname.replace('www.', '');
            console.log(`[TangoCat] 📎 Following link: ${event.title} → ${sourceName}`);
            
            // Try to fetch additional details from the actual event site
            try {
              const eventHtml = await this.fetchHTML(event.website);
              const enrichedData = this.extractEventDetails(eventHtml, event);
              if (enrichedData.description && enrichedData.description.length > enrichedDescription.length) {
                enrichedDescription = enrichedData.description;
              }
              if (enrichedData.location && enrichedData.location !== 'See website') {
                event.location = enrichedData.location;
              }
            } catch (fetchErr) {
              console.log(`[TangoCat] Could not fetch details from ${sourceName}, using aggregator data`);
            }
          } catch (urlErr) {
            // Invalid URL, keep TangoCat as source
            console.log(`[TangoCat] Invalid URL for ${event.title}, using TangoCat as source`);
          }
        }

        await db.insert(scrapedEvents).values({
          sourceUrl,
          sourceName,
          title: event.title,
          description: enrichedDescription,
          startDate,
          endDate,
          location: event.location,
          address: `${event.city}, ${event.country}`,
          organizer: sourceName !== 'TangoCat' ? sourceName : undefined,
          groupId,
          status: 'pending_review',
          externalId: `tangocat-${year}-${event.title}`.toLowerCase().replace(/\s+/g, '-').slice(0, 100)
        });
      } catch (err) {
        console.error(`[TangoCat] Failed to store event "${event.title}":`, err);
      }
    }
  }

  /**
   * Extract additional event details from the actual event website
   */
  private extractEventDetails(html: string, event: TangoCatEvent): { description?: string; location?: string } {
    const $ = cheerio.load(html);
    
    // Remove noise
    $('script, style, nav, footer, header').remove();
    
    // Try to extract description
    let description = '';
    const descSelectors = ['[class*="description"]', '[class*="about"]', 'article p', 'main p', '.content p'];
    for (const selector of descSelectors) {
      const text = $(selector).first().text().trim();
      if (text && text.length > 50 && text.length < 2000) {
        description = text;
        break;
      }
    }
    
    // Try to extract location/venue
    let location = '';
    const locationSelectors = ['[class*="venue"]', '[class*="location"]', 'address', '[itemProp="location"]'];
    for (const selector of locationSelectors) {
      const text = $(selector).first().text().trim();
      if (text && text.length > 5 && text.length < 200) {
        location = text;
        break;
      }
    }
    
    return { description, location };
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
