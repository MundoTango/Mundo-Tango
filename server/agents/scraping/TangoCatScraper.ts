/**
 * TANGO CAT SCRAPER
 * Scrapes tangocat.net for international tango festivals and marathons
 * 
 * URLs: tangocat.net/2025/ and tangocat.net/2026/
 * Data: Festivals, marathons, encuentros worldwide
 * 
 * TangoCat JSON structure:
 * {
 *   "id": 10006,
 *   "title": "Event Name",
 *   "note": "Maestros: ..., DJs: ...",
 *   "url": "https://actualwebsite.com",
 *   "l": "Country, City",
 *   "p": [latitude, longitude]
 * }
 */

import axios from 'axios';
import * as cheerio from 'cheerio';
import { db } from '@shared/db';
import { scrapedEvents } from '@shared/schema';
import { cityMatcherService } from '../../services/CityMatcherService';
import { eq } from 'drizzle-orm';

interface TangoCatJSONEvent {
  id: number;
  title?: string;
  note?: string;
  url?: string;
  l?: string;       // location: "Country, City"
  p?: number[];     // coordinates: [lat, lng]
  ds?: string;      // date start: "12/19/2025"
  de?: string;      // date end: "12/21/2025"
  isf?: boolean;    // is free?
  coords?: { lat: number; lng: number };
}

interface TangoCatEvent {
  id: number;
  title: string;
  dates: string;
  startDate?: string;  // MM/DD/YYYY from JSON ds field
  endDate?: string;    // MM/DD/YYYY from JSON de field
  location: string;
  country: string;
  city: string;
  eventType: string;
  website?: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  maestros?: string;
  djs?: string;
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
    console.log('[TangoCat] 🐱 Starting enhanced scrape for all years');
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

  /**
   * Parse the embedded JSON array from TangoCat scripts
   * TangoCat embeds event data as JSON in script tags
   * 
   * Format: [{"id":10006,"title":"...","note":"...","url":"...","l":"Country, City","p":[lat,lng],"ds":"MM/DD/YYYY","de":"MM/DD/YYYY",...}]
   */
  private parseEmbeddedJSON(scripts: string): TangoCatJSONEvent[] {
    const events: TangoCatJSONEvent[] = [];
    
    // Build a map of event ID -> event data by extracting individual fields
    // This is more reliable than trying to parse the full JSON which may have special chars
    
    // Extract all IDs first
    const idMatches = scripts.matchAll(/"id":(\d+)/g);
    const ids = new Set<number>();
    for (const m of idMatches) {
      ids.add(parseInt(m[1], 10));
    }
    
    // For each ID, extract all associated fields by finding the JSON object context
    for (const id of ids) {
      try {
        // Find the object containing this ID
        // Look for the JSON context around the ID
        const idPattern = new RegExp(`\\{"id":${id}[^\\[\\]]*?(?:\\[[^\\]]*\\])?[^\\[\\]]*?\\}`, 'g');
        
        // Alternative: build data by extracting individual fields near the ID
        const event: TangoCatJSONEvent = { id };
        
        // Search for fields associated with this ID
        // We look for patterns after "id":ID
        const idIndex = scripts.indexOf(`"id":${id}`);
        if (idIndex === -1) continue;
        
        // Look in a window around the ID (up to 2000 chars should cover most events)
        const windowStart = Math.max(0, idIndex - 50);
        const windowEnd = Math.min(scripts.length, idIndex + 2000);
        const context = scripts.substring(windowStart, windowEnd);
        
        // Extract title
        const titleMatch = context.match(/"title":"([^"]+)"/);
        if (titleMatch) event.title = titleMatch[1];
        
        // Extract location
        const locMatch = context.match(/"l":"([^"]+)"/);
        if (locMatch) event.l = locMatch[1];
        
        // Extract coordinates
        const coordMatch = context.match(/"p":\[([\d.-]+),([\d.-]+)\]/);
        if (coordMatch) {
          event.p = [parseFloat(coordMatch[1]), parseFloat(coordMatch[2])];
        }
        
        // Extract URL
        const urlMatch = context.match(/"url":"([^"]+)"/);
        if (urlMatch) event.url = urlMatch[1];
        
        // Extract dates
        const dsMatch = context.match(/"ds":"([^"]+)"/);
        if (dsMatch) event.ds = dsMatch[1];
        
        const deMatch = context.match(/"de":"([^"]+)"/);
        if (deMatch) event.de = deMatch[1];
        
        // Extract note (maestros/DJs)
        const noteMatch = context.match(/"note":"([^"]+)"/);
        if (noteMatch) {
          // Unescape the note
          event.note = noteMatch[1].replace(/\\r\\n/g, '\n').replace(/\\n/g, '\n');
        }
        
        events.push(event);
      } catch (e) {
        // Skip problematic IDs
      }
    }
    
    console.log(`[TangoCat] Parsed ${events.length} JSON event objects from ${ids.size} IDs`);
    console.log(`[TangoCat]   - With location: ${events.filter(e => e.l).length}`);
    console.log(`[TangoCat]   - With coordinates: ${events.filter(e => e.p).length}`);
    console.log(`[TangoCat]   - With dates: ${events.filter(e => e.ds).length}`);
    return events;
  }

  /**
   * Classify event type from title
   */
  private classifyEventType(title: string): string {
    const titleLower = title.toLowerCase();
    
    if (titleLower.includes('marathon')) return 'marathon';
    if (titleLower.includes('encuentro')) return 'encuentro';
    if (titleLower.includes('festival')) return 'festival';
    if (titleLower.includes('camp') || titleLower.includes('retreat')) return 'workshop';
    if (titleLower.includes('milonga')) return 'milonga';
    if (titleLower.includes('practica')) return 'practica';
    if (titleLower.includes('workshop') || titleLower.includes('class')) return 'workshop';
    if (titleLower.includes('show') || titleLower.includes('performance')) return 'show';
    if (titleLower.includes('competition') || titleLower.includes('championship')) return 'competition';
    if (titleLower.includes('concert')) return 'concert';
    
    // Default to festival for TangoCat events (they're mostly festivals/marathons)
    return 'festival';
  }

  /**
   * Parse location string "Country, City" into components
   */
  private parseLocation(locationStr: string | undefined): { country: string; city: string } {
    if (!locationStr) {
      return { country: 'Various', city: 'Various' };
    }
    
    // TangoCat format is typically "Country, City" or "Country, Region/City"
    const parts = locationStr.split(',').map(s => s.trim());
    
    if (parts.length >= 2) {
      return {
        country: parts[0],
        city: parts.slice(1).join(', ')
      };
    } else if (parts.length === 1) {
      return {
        country: parts[0],
        city: parts[0]
      };
    }
    
    return { country: 'Various', city: 'Various' };
  }

  /**
   * Parse maestros and DJs from note field
   */
  private parseNote(note: string | undefined): { maestros?: string; djs?: string } {
    if (!note) return {};
    
    const result: { maestros?: string; djs?: string } = {};
    
    // Extract Maestros
    const maestrosMatch = note.match(/Maestros?:?\s*([^,\n]+(?:,\s*[^,\n]+)*?)(?:\s*(?:DJ|$))/i);
    if (maestrosMatch) {
      result.maestros = maestrosMatch[1].trim();
    }
    
    // Extract DJs
    const djsMatch = note.match(/DJs?:?\s*(.+)/i);
    if (djsMatch) {
      result.djs = djsMatch[1].trim();
    }
    
    return result;
  }

  private extractEvents($: cheerio.CheerioAPI, year: string): TangoCatEvent[] {
    const events: TangoCatEvent[] = [];
    const seenIds = new Set<number>();
    const seenTitles = new Set<string>();

    // Get all script content
    const scripts = $('script').text();
    
    // Parse embedded JSON to get all event data
    const jsonEvents = this.parseEmbeddedJSON(scripts);
    
    // Build a map of ID -> full event data from JSON
    const eventDataMap = new Map<number, TangoCatJSONEvent>();
    for (const jsonEvent of jsonEvents) {
      eventDataMap.set(jsonEvent.id, jsonEvent);
    }
    console.log(`[TangoCat] Built event data map with ${eventDataMap.size} entries`);

    // Now extract events from /go/ links and enrich with JSON data
    $('a[href^="/go/"]').each((i, elem) => {
      const $link = $(elem);
      const href = $link.attr('href') || '';
      
      // Extract event name and ID from URL: /go/Event+Name/12345 -> Event Name, 12345
      const nameMatch = href.match(/\/go\/([^/]+)\/(\d+)/);
      if (nameMatch) {
        const name = decodeURIComponent(nameMatch[1].replace(/\+/g, ' '));
        const eventId = parseInt(nameMatch[2], 10);
        const titleLower = name.toLowerCase();
        
        if (!seenIds.has(eventId) && !seenTitles.has(titleLower) && name.length > 3) {
          seenIds.add(eventId);
          seenTitles.add(titleLower);
          
          // Get rich data from JSON
          const jsonData = eventDataMap.get(eventId);
          const eventType = this.classifyEventType(jsonData?.title || name);
          const { country, city } = this.parseLocation(jsonData?.l);
          const { maestros, djs } = this.parseNote(jsonData?.note);
          
          // Build URL - prefer actual website over TangoCat redirect
          let website = `https://tangocat.net${href}`;
          if (jsonData?.url && jsonData.url.startsWith('http') && 
              !jsonData.url.includes('facebook.com') && 
              !jsonData.url.includes('google.com')) {
            website = jsonData.url;
          }
          
          // Build description
          let description = `${eventType.charAt(0).toUpperCase() + eventType.slice(1)} in ${city}, ${country}`;
          if (maestros) description += `\n\nMaestros: ${maestros}`;
          if (djs) description += `\nDJs: ${djs}`;
          
          events.push({
            id: eventId,
            title: jsonData?.title || name,
            dates: year,
            startDate: jsonData?.ds,  // "MM/DD/YYYY" from JSON
            endDate: jsonData?.de,    // "MM/DD/YYYY" from JSON
            location: jsonData?.l || `${city}, ${country}`,
            country,
            city,
            eventType,
            website,
            description,
            latitude: jsonData?.p?.[0],
            longitude: jsonData?.p?.[1],
            maestros,
            djs
          });
        }
      }
    });

    console.log(`[TangoCat] Extracted ${events.length} events:`);
    console.log(`  - With coordinates: ${events.filter(e => e.latitude && e.longitude).length}`);
    console.log(`  - With external URLs: ${events.filter(e => !e.website?.includes('tangocat.net')).length}`);
    console.log(`  - Event types: ${[...new Set(events.map(e => e.eventType))].join(', ')}`);
    
    return events.slice(0, 100); // Increase limit
  }

  /**
   * Normalize title for comparison (removes typos, whitespace, common suffixes)
   */
  private normalizeTitle(title: string): string {
    return title.toLowerCase()
      .replace(/marathon[e]?/gi, 'marathon')  // Fix "marathone" typo
      .replace(/\d+(st|nd|rd|th)\s*(edition|anniversary)/gi, '') // Remove "10th anniversary", "8th edition"
      .replace(/[^\w\s]/g, '') // Remove punctuation
      .replace(/\s+/g, ' ')
      .trim();
  }

  private async storeEvents(events: TangoCatEvent[], sourceId: number, year: string): Promise<void> {
    console.log(`[TangoCat] 💾 Storing ${events.length} events for ${year}`);
    
    // Track normalized titles to detect in-batch duplicates
    const processedTitles = new Map<string, string>();

    for (const event of events) {
      try {
        // Check for duplicates by external ID
        const externalId = `tangocat-${event.id}`;
        const existing = await db.select({ id: scrapedEvents.id })
          .from(scrapedEvents)
          .where(eq(scrapedEvents.externalId, externalId))
          .limit(1);
        
        if (existing.length > 0) {
          console.log(`[TangoCat] ⏭️ Skipping duplicate (external ID): ${event.title}`);
          continue;
        }
        
        // Check for fuzzy title duplicates in this batch
        const normalizedTitle = this.normalizeTitle(event.title);
        const cityKey = `${normalizedTitle}|${event.city?.toLowerCase() || ''}`;
        
        if (processedTitles.has(cityKey)) {
          console.log(`[TangoCat] ⏭️ Skipping fuzzy duplicate: "${event.title}" ~ "${processedTitles.get(cityKey)}"`);
          continue;
        }
        processedTitles.set(cityKey, event.title);
        
        // Match city to group
        const matchResult = await cityMatcherService.matchEventLocation(event.city);
        const groupId = matchResult || null;

        // Parse dates - prefer JSON dates (ds/de) over year fallback
        let startDate: Date;
        let endDate: Date | undefined;
        
        if (event.startDate) {
          // JSON dates are in MM/DD/YYYY format
          startDate = this.parseDateMMDDYYYY(event.startDate);
          endDate = event.endDate ? this.parseDateMMDDYYYY(event.endDate) : undefined;
        } else {
          // Fallback to year-based parsing
          startDate = this.parseDateFromString(event.dates, year);
          endDate = this.parseEndDate(event.dates, startDate);
        }

        // MULTI-STAGE: Follow the event website link and use that as the source
        let sourceUrl = `https://tangocat.net/${year}/`;
        let sourceName = 'tangocat.net';
        let enrichedDescription = event.description || `${event.eventType} - ${event.location}`;

        if (event.website && !event.website.includes('tangocat.net')) {
          try {
            const parsedUrl = new URL(event.website);
            // Use the actual event website as the source
            sourceUrl = event.website;
            sourceName = parsedUrl.hostname.replace('www.', '');
            console.log(`[TangoCat] 📎 Source: ${event.title} → ${sourceName} (${event.eventType})`);
            
            // Try to fetch additional details from the actual event site
            try {
              const eventHtml = await this.fetchHTML(event.website);
              const enrichedData = this.extractEventDetails(eventHtml, event);
              if (enrichedData.description && enrichedData.description.length > enrichedDescription.length) {
                enrichedDescription = enrichedData.description;
              }
            } catch (fetchErr) {
              console.log(`[TangoCat] Could not fetch details from ${sourceName}, using aggregator data`);
            }
          } catch (urlErr) {
            // Invalid URL, keep TangoCat as source
            console.log(`[TangoCat] Invalid URL for ${event.title}, using TangoCat as source`);
          }
        }

        // Store with all the rich data
        await db.insert(scrapedEvents).values({
          sourceUrl,
          sourceName,
          title: event.title,
          description: enrichedDescription,
          startDate,
          endDate,
          location: event.location,
          address: `${event.city}, ${event.country}`,
          city: event.city,
          country: event.country,
          latitude: event.latitude ? String(event.latitude) : null,
          longitude: event.longitude ? String(event.longitude) : null,
          eventType: event.eventType,
          organizer: sourceName !== 'tangocat.net' ? sourceName : undefined,
          groupId,
          status: 'pending_review',
          externalId
        });
        
        console.log(`[TangoCat] ✅ Stored: ${event.title} (${event.eventType}) @ ${event.city}, ${event.country}`);
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

  /**
   * Parse date from TangoCat JSON format: "MM/DD/YYYY"
   */
  private parseDateMMDDYYYY(dateStr: string): Date {
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      const month = parseInt(parts[0], 10) - 1; // 0-indexed months
      const day = parseInt(parts[1], 10);
      const year = parseInt(parts[2], 10);
      return new Date(year, month, day, 20, 0, 0);
    }
    // Fallback to current date
    return new Date();
  }
}

export const tangoCatScraper = new TangoCatScraper();
