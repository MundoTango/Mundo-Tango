/**
 * TANGOMANGO SCRAPER
 * Scrapes tango events from tangomango.org for US cities
 * 
 * TangoMango is a major US tango calendar covering:
 * San Francisco, New York, Los Angeles, Chicago, Seattle, Boston, Miami, 
 * Denver, Austin, Portland, San Diego, Washington DC, and 30+ more cities
 * 
 * URL Pattern: tangomango.org/index.php?show=CITY,STATE
 * Event details: tangomango.org/lib/loadevent.php?date=DATE&eventid=ID
 */

import { db } from '@shared/db';
import { scrapedEvents, eventScrapingSources } from '@shared/schema';
import { eq } from 'drizzle-orm';
import * as cheerio from 'cheerio';

interface TangoMangoEvent {
  title: string;
  date: string;
  timeRange: string;
  description: string;
  venue: string;
  address: string;
  city: string;
  state: string;
  eventType: string;
  sourceUrl: string;
  eventId: number;
  keywords: string[];
  contact?: string;
  price?: string;
}

export class TangoMangoScraper {
  private baseUrl = 'http://tangomango.org';
  
  private cityConfigs: Array<{city: string, state: string, urlParam: string}> = [
    { city: 'San Francisco', state: 'CA', urlParam: 'San_Francisco,CA' },
    { city: 'New York', state: 'NY', urlParam: 'New_York,NY' },
    { city: 'Los Angeles', state: 'CA', urlParam: 'Los_Angeles,CA' },
    { city: 'Chicago', state: 'IL', urlParam: 'Chicago,IL' },
    { city: 'Seattle', state: 'WA', urlParam: 'Seattle,WA' },
    { city: 'Boston', state: 'MA', urlParam: 'Boston,MA' },
    { city: 'Miami', state: 'FL', urlParam: 'Miami,FL' },
    { city: 'Denver', state: 'CO', urlParam: 'Denver,CO' },
    { city: 'Austin', state: 'TX', urlParam: 'Austin,TX' },
    { city: 'Portland', state: 'OR', urlParam: 'Portland,OR' },
    { city: 'San Diego', state: 'CA', urlParam: 'San_Diego,CA' },
    { city: 'Washington', state: 'DC', urlParam: 'Washington,DC' },
    { city: 'Atlanta', state: 'GA', urlParam: 'Atlanta,GA' },
    { city: 'Philadelphia', state: 'PA', urlParam: 'Philadelphia,PA' },
    { city: 'Dallas', state: 'TX', urlParam: 'Dallas,TX' },
    { city: 'Houston', state: 'TX', urlParam: 'Houston,TX' },
    { city: 'Phoenix', state: 'AZ', urlParam: 'Phoenix,AZ' },
    { city: 'Minneapolis', state: 'MN', urlParam: 'Minneapolis,MN' },
    { city: 'Detroit', state: 'MI', urlParam: 'Detroit,MI' },
    { city: 'Cleveland', state: 'OH', urlParam: 'Cleveland,OH' },
    { city: 'Pittsburgh', state: 'PA', urlParam: 'Pittsburgh,PA' },
    { city: 'Las Vegas', state: 'NV', urlParam: 'Las_Vegas,NV' },
    { city: 'Salt Lake City', state: 'UT', urlParam: 'Salt_Lake_City,UT' },
    { city: 'Nashville', state: 'TN', urlParam: 'Nashville,TN' },
    { city: 'New Orleans', state: 'LA', urlParam: 'New_Orleans,LA' },
    { city: 'Raleigh', state: 'NC', urlParam: 'Raleigh,NC' },
    { city: 'Sacramento', state: 'CA', urlParam: 'Sacramento,CA' },
    { city: 'St. Louis', state: 'MO', urlParam: 'St_Louis,MO' },
    { city: 'Tampa', state: 'FL', urlParam: 'Tampa,FL' },
    { city: 'Orlando', state: 'FL', urlParam: 'Orlando,FL' },
    { city: 'Charlotte', state: 'NC', urlParam: 'Charlotte,NC' },
    { city: 'San Antonio', state: 'TX', urlParam: 'San_Antonio,TX' },
    { city: 'Tucson', state: 'AZ', urlParam: 'Tucson,AZ' },
    { city: 'Boulder', state: 'CO', urlParam: 'Boulder,CO' },
    { city: 'Buffalo', state: 'NY', urlParam: 'Buffalo,NY' },
    { city: 'San Jose', state: 'CA', urlParam: 'San_Jose,CA' },
    { city: 'Spokane', state: 'WA', urlParam: 'Spokane,WA' },
  ];

  /**
   * Scrape all US cities from TangoMango
   */
  async scrapeAllCities(): Promise<number> {
    console.log('[TangoMango] 🇺🇸 Starting US city scraping...');
    let totalEvents = 0;

    for (const config of this.cityConfigs) {
      try {
        const events = await this.scrapeCity(config);
        totalEvents += events;
        console.log(`[TangoMango] ✅ ${config.city}, ${config.state}: ${events} events`);
        
        // Rate limiting - be respectful
        await this.delay(1000);
      } catch (error: any) {
        console.error(`[TangoMango] ❌ Failed ${config.city}:`, error.message);
      }
    }

    console.log(`[TangoMango] 🎉 Total events scraped: ${totalEvents}`);
    return totalEvents;
  }

  /**
   * Scrape a single city
   */
  async scrapeCity(config: {city: string, state: string, urlParam: string}): Promise<number> {
    const calendarUrl = `${this.baseUrl}/index.php?show=${config.urlParam}`;
    
    // Fetch calendar page
    const response = await fetch(calendarUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; MundoTangoBot/1.0; +https://mundotango.life)',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();
    
    // Extract event IDs and dates from loadevent() calls
    const eventMatches = Array.from(html.matchAll(/loadevent\(this,'(\d{4}-\d{2}-\d{2})',(\d+),event\)/g));
    const eventRefs = new Set<string>();
    
    for (const match of eventMatches) {
      const date = match[1];
      const eventId = match[2];
      eventRefs.add(`${date}|${eventId}`);
    }

    console.log(`[TangoMango] Found ${eventRefs.size} unique events in ${config.city}`);

    let savedCount = 0;
    
    // Fetch and save each event
    for (const ref of Array.from(eventRefs)) {
      const [date, eventId] = ref.split('|');
      
      try {
        const event = await this.fetchEventDetails(date, parseInt(eventId), config);
        if (event) {
          await this.saveEvent(event);
          savedCount++;
        }
        
        // Rate limiting
        await this.delay(300);
      } catch (error: any) {
        console.error(`[TangoMango] Failed to fetch event ${eventId}:`, error.message);
      }
    }

    // Update source scraping timestamp
    await this.updateSourceTimestamp(config.city);

    return savedCount;
  }

  /**
   * Fetch event details from loadevent.php
   */
  private async fetchEventDetails(
    date: string, 
    eventId: number, 
    config: {city: string, state: string, urlParam: string}
  ): Promise<TangoMangoEvent | null> {
    const detailUrl = `${this.baseUrl}/lib/loadevent.php?date=${date}&eventid=${eventId}`;
    
    const response = await fetch(detailUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; MundoTangoBot/1.0; +https://mundotango.life)',
      },
    });

    if (!response.ok) {
      return null;
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    
    // Extract title
    const title = $('.styled').first().text().trim();
    if (!title) return null;
    
    // Extract details section
    const detailsHtml = $('#details').html() || '';
    const detailsText = $('#details').text();
    
    // Parse time range from first lines
    const timeMatch = detailsText.match(/(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/);
    const timeRange = timeMatch ? `${timeMatch[1]} - ${timeMatch[2]}` : '';
    
    // Extract venue (look for address pattern)
    const addressMatch = detailsHtml.match(/(\d+[^<]+(?:St|Ave|Blvd|Dr|Rd|Way|Ct|Pl|Lane|Road|Street|Avenue|Boulevard|Drive|Court|Place)[^<]*)/i);
    const address = addressMatch ? addressMatch[1].replace(/<br>/g, ', ').trim() : '';
    
    // Extract venue name (typically before address)
    const venueMatch = detailsHtml.match(/<br>\s*([^<]+(?:Building|Center|Studio|Hall|Room|Academy|Club|Hotel|Restaurant|Ballroom)[^<]*)/i);
    const venue = venueMatch ? venueMatch[1].trim() : '';
    
    // Extract keywords for event type
    const keywordsMatch = detailsText.match(/Keywords:\s*([^;]+)/);
    const keywordsStr = keywordsMatch ? keywordsMatch[1] : '';
    const keywords = keywordsStr.split(',').map(k => k.trim()).filter(Boolean);
    
    // Determine event type from keywords
    let eventType = 'milonga';
    if (keywords.some(k => k.includes('practica'))) eventType = 'practica';
    if (keywords.some(k => k.includes('class'))) eventType = 'class';
    if (keywords.some(k => k.includes('workshop'))) eventType = 'workshop';
    if (keywords.some(k => k.includes('festival'))) eventType = 'festival';
    if (keywords.some(k => k.includes('marathon'))) eventType = 'marathon';
    
    // Extract price
    const priceMatch = detailsText.match(/\$\d+(?:\.\d{2})?/);
    const price = priceMatch ? priceMatch[0] : undefined;
    
    // Extract contact
    const emailMatch = detailsHtml.match(/mailto:([^"]+)/);
    const contact = emailMatch ? emailMatch[1] : undefined;

    return {
      title,
      date,
      timeRange,
      description: detailsText.substring(0, 1000),
      venue,
      address,
      city: config.city,
      state: config.state,
      eventType,
      sourceUrl: `${this.baseUrl}/index.php?show=${config.urlParam}`,
      eventId,
      keywords,
      contact,
      price,
    };
  }

  /**
   * Save event to database
   */
  private async saveEvent(event: TangoMangoEvent): Promise<void> {
    const externalId = `tangomango-${event.eventId}-${event.date}`;
    
    // Check for duplicates using externalId
    const existing = await db.query.scrapedEvents.findFirst({
      where: eq(scrapedEvents.externalId, externalId),
    });

    if (existing) {
      return; // Skip duplicates
    }

    // Parse date and time
    const startDate = new Date(event.date);
    if (event.timeRange) {
      const [startTime] = event.timeRange.split(' - ');
      const [hours, minutes] = startTime.split(':').map(Number);
      if (!isNaN(hours) && !isNaN(minutes)) {
        startDate.setHours(hours, minutes, 0, 0);
      }
    }

    await db.insert(scrapedEvents).values({
      title: event.title,
      description: event.description,
      startDate: startDate,
      endDate: null,
      location: event.venue || null,
      address: event.address || null,
      city: event.city,
      state: event.state,
      country: 'United States',
      eventType: event.eventType,
      sourceUrl: event.sourceUrl,
      sourceName: 'TangoMango',
      externalId: externalId,
      status: 'pending',
      scrapedAt: new Date(),
    });
  }

  /**
   * Update source last scraped timestamp
   */
  private async updateSourceTimestamp(city: string): Promise<void> {
    try {
      await db.update(eventScrapingSources)
        .set({ lastScrapedAt: new Date() })
        .where(eq(eventScrapingSources.city, city));
    } catch (error) {
      // Ignore errors - source might not exist
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const tangoMangoScraper = new TangoMangoScraper();
