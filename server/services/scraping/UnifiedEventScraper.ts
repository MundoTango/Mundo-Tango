/**
 * UNIFIED EVENT SCRAPER
 * MB.MD Pattern 58: One intelligent scraper for all event websites
 * 
 * Features:
 * - AI-powered extraction from any website
 * - Complete location data: venue, address, city, state, country
 * - Source URL tracking for each scraped event
 * - Geocoding integration for address parsing
 */

import axios from 'axios';
import * as cheerio from 'cheerio';
import { db } from '@shared/db';
import { scrapedEvents, eventScrapingSources } from '@shared/schema';
import { eq } from 'drizzle-orm';
import Groq from 'groq-sdk';
import { discoverTeamFromSubpages, formatTeamForDescription, hasTeamData } from '../../agents/scraping/subpageDiscovery';
import { languageAwareFieldMapper, SupportedLanguage } from './LanguageAwareFieldMapper';
import { detailDiscoveryService } from './DetailDiscoveryService';
import { attachParticipantProfiles } from './ParticipantProfileHelper';
import { RecurringEventDetector } from './RecurringEventDetector';

export interface ScrapedEventData {
  title: string;
  description?: string;
  eventType: string; // milonga, practica, workshop, festival, marathon, encuentro, class, social
  startDate: Date;
  endDate?: Date;
  startTime?: string;  // Local time (e.g., "20:00")
  endTime?: string;    // Local time (e.g., "01:00")
  venue?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  price?: string;
  imageUrl?: string;
  organizer?: string;
  // Team members
  djs?: string[];
  teachers?: string[];
  orchestras?: string[];
  performers?: string[];
  hosts?: string[];
  sourceUrl: string;
  sourceName: string;
  externalId?: string;
}

// Valid event types for tango events
const VALID_EVENT_TYPES = ['milonga', 'practica', 'workshop', 'festival', 'marathon', 'encuentro', 'class', 'social', 'performance', 'show', 'competition'] as const;
type EventType = typeof VALID_EVENT_TYPES[number];

/**
 * Classify event type from title and description using keyword detection
 */
function classifyEventType(title: string, description?: string): EventType {
  const text = `${title} ${description || ''}`.toLowerCase();
  
  // Order matters - more specific types first
  if (text.includes('marathon')) return 'marathon';
  if (text.includes('festival')) return 'festival';
  if (text.includes('encuentro')) return 'encuentro';
  if (text.includes('competition') || text.includes('championship') || text.includes('concurso')) return 'competition';
  if (text.includes('performance') || text.includes('show') || text.includes('espectáculo')) return 'performance';
  if (text.includes('workshop') || text.includes('taller') || text.includes('intensivo')) return 'workshop';
  if (text.includes('class') || text.includes('lesson') || text.includes('clase') || text.includes('curso')) return 'class';
  if (text.includes('practica') || text.includes('práctica') || text.includes('practice')) return 'practica';
  if (text.includes('milonga') || text.includes('baile') || text.includes('dance night')) return 'milonga';
  if (text.includes('social')) return 'social';
  
  // Default: if we can't determine, it's likely a milonga (most common tango event)
  return 'milonga';
}

export interface LocationData {
  venue?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  fullAddress?: string;
}

class UnifiedEventScraper {
  private groq: Groq | null = null;
  private userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  ];

  constructor() {
    const groqKey = process.env.GROQ_API_KEY;
    if (groqKey) {
      this.groq = new Groq({ apiKey: groqKey });
    }
  }

  private getRandomUserAgent(): string {
    return this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
  }

  /**
   * Fetch HTML content from URL with retry logic
   */
  async fetchPage(url: string): Promise<string> {
    const maxRetries = 3;
    let lastError: Error | null = null;

    for (let i = 0; i < maxRetries; i++) {
      try {
        const response = await axios.get(url, {
          headers: {
            'User-Agent': this.getRandomUserAgent(),
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
          },
          timeout: 30000,
          responseType: 'text',
          maxRedirects: 5,
        });
        return response.data;
      } catch (error: any) {
        lastError = error;
        console.warn(`[UnifiedScraper] Retry ${i + 1}/${maxRetries} for ${url}: ${error.message}`);
        await this.delay(1000 * (i + 1));
      }
    }
    throw lastError;
  }

  /**
   * Extract events from HTML using AI
   */
  async extractEventsWithAI(html: string, sourceUrl: string, sourceName: string): Promise<ScrapedEventData[]> {
    if (!this.groq) {
      console.warn('[UnifiedScraper] Groq not configured, using fallback parsing');
      return this.extractEventsWithCheerio(html, sourceUrl, sourceName);
    }

    const $ = cheerio.load(html);
    $('script, style, nav, footer, header').remove();
    const textContent = $('body').text().replace(/\s+/g, ' ').trim().slice(0, 15000);
    const pageTitle = $('title').text();

    try {
      const completion = await this.groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: `You are an expert at extracting tango event data from websites. Extract ALL events you can find.
For each event, extract:
- title: Event name
- eventType: One of: milonga, practica, workshop, festival, marathon, encuentro, class, social, performance, show, competition
  - milonga = social dance evening
  - practica = practice session
  - workshop = teaching/learning event (1-4 hours)
  - class = regular lessons
  - festival = multi-day event with workshops and milongas
  - marathon = extended dancing event (usually 12+ hours)
  - encuentro = small intimate festival
  - social = casual gathering
- description: Event description
- startDate: ISO date string (YYYY-MM-DDTHH:mm:ss) - Use LOCAL TIME of the event location
- endDate: ISO date string if available - Use LOCAL TIME
- venue: Venue/location name
- address: Full street address
- city: City name
- state: State/province/region
- country: Country name
- price: Price info as string
- organizer: Organizer name(s)
- djs: Array of DJ names (also look for "TDJ", "musicalizador", "musicaliza")
- teachers: Array of teacher/maestro names
- orchestras: Array of live music/orchestra names
- performers: Array of performer/show artist names
- imageUrl: Image URL if found

Return a JSON array of events. If no events found, return [].
Be thorough - extract ALL events visible on the page.
IMPORTANT: Times should be in the LOCAL timezone of the event location.
IMPORTANT: Look for team members in multiple languages (Spanish: organizador, DJ, maestro; Portuguese: professor; German: veranstalter).`
          },
          {
            role: 'user',
            content: `Website: ${sourceUrl}
Page title: ${pageTitle}

Content:
${textContent}

Extract all tango events from this page as JSON array:`
          }
        ],
        temperature: 0.1,
        max_tokens: 4000,
        response_format: { type: 'json_object' },
      });

      const responseText = completion.choices[0]?.message?.content || '{}';
      const parsed = JSON.parse(responseText);
      const events = parsed.events || parsed.data || (Array.isArray(parsed) ? parsed : []);

      return events.map((event: any) => {
        const title = event.title || 'Untitled Event';
        const description = event.description;
        // Use AI-provided eventType if valid, otherwise classify from keywords
        let eventType = event.eventType?.toLowerCase();
        if (!eventType || !VALID_EVENT_TYPES.includes(eventType as any)) {
          eventType = classifyEventType(title, description);
        }
        
        // Extract local time from ISO date strings
        const extractTime = (isoDate?: string): string | undefined => {
          if (!isoDate) return undefined;
          const match = isoDate.match(/T(\d{2}:\d{2})/);
          return match ? match[1] : undefined;
        };
        
        return {
          title,
          description,
          eventType,
          startDate: event.startDate ? new Date(event.startDate) : new Date(),
          endDate: event.endDate ? new Date(event.endDate) : undefined,
          startTime: extractTime(event.startDate),
          endTime: extractTime(event.endDate),
          venue: event.venue,
          address: event.address,
          city: event.city,
          state: event.state,
          country: event.country,
          price: event.price,
          imageUrl: event.imageUrl,
          organizer: event.organizer,
          djs: event.djs || [],
          teachers: event.teachers || [],
          orchestras: event.orchestras || [],
          performers: event.performers || [],
          sourceUrl: sourceUrl,
          sourceName: sourceName,
        };
      });
    } catch (error) {
      console.error('[UnifiedScraper] AI extraction failed:', error);
      return this.extractEventsWithCheerio(html, sourceUrl, sourceName);
    }
  }

  /**
   * Fallback: Extract events using Cheerio patterns
   */
  extractEventsWithCheerio(html: string, sourceUrl: string, sourceName: string): ScrapedEventData[] {
    const $ = cheerio.load(html);
    const events: ScrapedEventData[] = [];
    const currentYear = new Date().getFullYear();

    const eventSelectors = [
      'article[class*="event"]',
      'div[class*="event"]',
      '.event-item',
      '.event-card',
      '.milonga-item',
      '.practica-item',
      '[itemtype*="Event"]',
      '.listing-item',
    ];

    for (const selector of eventSelectors) {
      $(selector).each((_, elem) => {
        try {
          const $elem = $(elem);
          const title = $elem.find('h1, h2, h3, h4, .title, .event-title, [itemprop="name"]').first().text().trim();
          
          if (!title || title.length < 3 || title.length > 300) return;

          const dateText = $elem.find('.date, time, [itemprop="startDate"], .event-date, [datetime]').first().text().trim() ||
                          $elem.find('[datetime]').first().attr('datetime') || '';
          
          const venue = $elem.find('.venue, .location, [itemprop="location"], .place').first().text().trim();
          const address = $elem.find('.address, [itemprop="address"], .street-address').first().text().trim();
          const description = $elem.find('.description, .summary, [itemprop="description"], p').first().text().trim();
          const price = $elem.find('.price, [itemprop="price"], .cost').first().text().trim();
          const imageUrl = $elem.find('img').first().attr('src') || '';

          const startDate = this.parseDate(dateText, currentYear);

          const alreadyExists = events.some(e => e.title === title);
          if (!alreadyExists) {
            events.push({
              title,
              description: description || undefined,
              eventType: classifyEventType(title, description),
              startDate: startDate || new Date(),
              venue: venue || undefined,
              address: address || undefined,
              price: price || undefined,
              imageUrl: imageUrl ? this.resolveUrl(imageUrl, sourceUrl) : undefined,
              sourceUrl,
              sourceName,
            });
          }
        } catch (err) {
          // Continue
        }
      });
    }

    return events;
  }

  /**
   * Parse location string into components using geocoding
   */
  async parseLocationWithGeocoding(locationString: string): Promise<LocationData> {
    if (!locationString) return {};

    try {
      const encodedAddress = encodeURIComponent(locationString);
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?q=${encodedAddress}&format=json&addressdetails=1&limit=1`,
        {
          headers: {
            'User-Agent': 'MundoTango/1.0 (contact@mundotango.life)',
          },
          timeout: 5000,
        }
      );

      if (response.data && response.data.length > 0) {
        const result = response.data[0];
        const addr = result.address || {};

        return {
          fullAddress: result.display_name,
          venue: addr.amenity || addr.building || addr.leisure,
          address: [addr.house_number, addr.road].filter(Boolean).join(' ') || addr.road,
          city: addr.city || addr.town || addr.village || addr.municipality,
          state: addr.state || addr.province || addr.region,
          country: addr.country,
        };
      }
    } catch (error) {
      console.warn('[UnifiedScraper] Geocoding failed:', error);
    }

    return {};
  }

  /**
   * Scrape events from a source URL
   */
  async scrapeSource(source: { id: number; url: string; name: string; city?: string; country?: string }): Promise<number> {
    console.log(`[UnifiedScraper] Scraping: ${source.name} (${source.url})`);
    
    try {
      const html = await this.fetchPage(source.url);
      const events = await this.extractEventsWithAI(html, source.url, source.name);

      console.log(`[UnifiedScraper] Found ${events.length} events from ${source.name}`);
      
      // MULTI-PAGE: Discover team members from subpages (DJs, Teachers, etc.)
      let teamDescription = '';
      try {
        const teamData = await discoverTeamFromSubpages(source.url, html);
        if (hasTeamData(teamData)) {
          teamDescription = formatTeamForDescription(teamData);
          console.log(`[UnifiedScraper] 👥 Found team data from subpages`);
        }
      } catch {
        // Team extraction is optional
      }

      let savedCount = 0;
      for (const event of events) {
        try {
          if (!event.city && source.city) {
            event.city = source.city;
          }
          if (!event.country && source.country) {
            event.country = source.country;
          }

          if (event.address && (!event.city || !event.country)) {
            const geoData = await this.parseLocationWithGeocoding(
              [event.address, event.venue, event.city, event.country].filter(Boolean).join(', ')
            );
            if (geoData.city) event.city = geoData.city;
            if (geoData.state) event.state = geoData.state;
            if (geoData.country) event.country = geoData.country;
          }

          // Append team data to description if found and not already present
          let fullDescription = event.description || '';
          if (teamDescription) {
            // Only append if description doesn't already contain team info
            const hasTeamInfo = /(?:maestros?|djs?|teachers?|performers?):/i.test(fullDescription);
            if (!hasTeamInfo) {
              fullDescription = fullDescription ? `${fullDescription}\n\n${teamDescription}` : teamDescription;
            }
          }

          // Extract participants and create profiles
          const participantData = await attachParticipantProfiles({
            title: event.title,
            description: fullDescription,
            organizer: event.organizer
          });

          // Parse price to extract numeric value (e.g., "$100" -> 100)
          const parsePrice = (priceStr?: string): string | null => {
            if (!priceStr) return null;
            const match = priceStr.match(/[\d,.]+/);
            if (match) {
              const numStr = match[0].replace(/,/g, '');
              const num = parseFloat(numStr);
              return isNaN(num) ? null : num.toString();
            }
            return null;
          };

          await db.insert(scrapedEvents).values({
            sourceUrl: event.sourceUrl,
            sourceName: event.sourceName,
            title: event.title,
            description: fullDescription,
            eventType: event.eventType,
            startDate: event.startDate,
            endDate: event.endDate,
            location: event.venue || event.address || source.city || 'Unknown',
            address: event.address || '',
            city: event.city || source.city || '',
            country: event.country || source.country || '',
            organizer: event.organizer || '',
            price: parsePrice(event.price),
            imageUrl: event.imageUrl || '',
            externalId: event.externalId || `${source.id}-${Date.now()}-${savedCount}`,
            status: 'approved',
            scrapedAt: new Date(),
            organizerText: participantData.organizerText,
            djText: participantData.djText,
            teacherText: participantData.teacherText,
            performerText: participantData.performerText,
            participantProfiles: participantData.participantProfiles,
            isRecurring: RecurringEventDetector.isRecurring(event.title)
          }).onConflictDoNothing();

          savedCount++;
        } catch (err) {
          console.warn(`[UnifiedScraper] Failed to save event: ${event.title}`);
        }
      }

      await db.update(eventScrapingSources)
        .set({ 
          lastScrapedAt: new Date(),
          totalEventsScraped: savedCount,
        })
        .where(eq(eventScrapingSources.id, source.id));

      return savedCount;
    } catch (error) {
      console.error(`[UnifiedScraper] Failed to scrape ${source.name}:`, error);
      return 0;
    }
  }

  /**
   * Scrape all active sources
   */
  async scrapeAllSources(): Promise<{ total: number; sources: number }> {
    const sources = await db.query.eventScrapingSources.findMany({
      where: eq(eventScrapingSources.isActive, true),
    });

    console.log(`[UnifiedScraper] Starting scrape of ${sources.length} sources...`);

    let totalEvents = 0;
    let successfulSources = 0;

    for (const source of sources) {
      if (!source.url) continue;

      const count = await this.scrapeSource({
        id: source.id,
        url: source.url,
        name: source.name,
        city: source.city || undefined,
        country: source.country || undefined,
      });

      if (count > 0) {
        totalEvents += count;
        successfulSources++;
      }

      await this.delay(2000);
    }

    console.log(`[UnifiedScraper] ✅ Complete! ${totalEvents} events from ${successfulSources}/${sources.length} sources`);

    return { total: totalEvents, sources: successfulSources };
  }

  /**
   * Scrape a single URL (for testing or manual scraping)
   */
  async scrapeSingleUrl(url: string, name?: string): Promise<ScrapedEventData[]> {
    const html = await this.fetchPage(url);
    return this.extractEventsWithAI(html, url, name || new URL(url).hostname);
  }

  private parseDate(dateText: string, currentYear: number): Date | null {
    if (!dateText) return null;

    try {
      const parsed = new Date(dateText);
      if (!isNaN(parsed.getTime())) return parsed;

      const months: Record<string, number> = {
        jan: 0, january: 0, feb: 1, february: 1, mar: 2, march: 2,
        apr: 3, april: 3, may: 4, jun: 5, june: 5, jul: 6, july: 6,
        aug: 7, august: 7, sep: 8, september: 8, oct: 9, october: 9,
        nov: 10, november: 10, dec: 11, december: 11
      };

      const monthMatch = dateText.toLowerCase().match(/(\w+)\s+(\d{1,2})/);
      if (monthMatch) {
        const month = months[monthMatch[1]];
        const day = parseInt(monthMatch[2]);
        if (month !== undefined && day) {
          return new Date(currentYear, month, day);
        }
      }

      const numericMatch = dateText.match(/(\d{1,2})[\/-](\d{1,2})[\/-]?(\d{2,4})?/);
      if (numericMatch) {
        const day = parseInt(numericMatch[1]);
        const month = parseInt(numericMatch[2]) - 1;
        const year = numericMatch[3] ? parseInt(numericMatch[3]) : currentYear;
        return new Date(year, month, day);
      }
    } catch {
      // Ignore
    }

    return null;
  }

  private resolveUrl(url: string, baseUrl: string): string {
    if (url.startsWith('http')) return url;
    if (url.startsWith('//')) return 'https:' + url;
    if (url.startsWith('/')) {
      const base = new URL(baseUrl);
      return `${base.protocol}//${base.host}${url}`;
    }
    return url;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const unifiedEventScraper = new UnifiedEventScraper();
