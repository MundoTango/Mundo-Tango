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
   * Regional configs covering multiple counties for comprehensive coverage
   * These URLs aggregate events from multiple nearby areas
   */
  private regionalConfigs: Array<{region: string, urlParam: string, primaryCity: string, state: string}> = [
    { 
      region: 'San Francisco Bay Area', 
      primaryCity: 'San Francisco',
      state: 'CA',
      urlParam: 'San_Francisco,CA+Alameda,CA+San_Mateo,CA+Santa_Clara,CA+Marin,CA+Contra_Costa,CA+Sacramento,CA+Santa_Cruz,CA+Monterey,CA+Sonoma,CA+Mendocino,CA+Stanislaus,CA' 
    },
    { 
      region: 'South Florida', 
      primaryCity: 'Miami',
      state: 'FL',
      urlParam: 'Miami-Dade,FL+Broward,FL+Palm_Beach,FL' 
    },
    { 
      region: 'Greater Chicago', 
      primaryCity: 'Chicago',
      state: 'IL',
      urlParam: 'Cook,IL+Lake,IL+Du_Page,IL' 
    },
    { 
      region: 'Southern California', 
      primaryCity: 'Los Angeles',
      state: 'CA',
      urlParam: 'Los_Angeles,CA+San_Diego,CA+Santa_Barbara,CA+Orange,CA+Ventura,CA+Riverside,CA+San_Luis_Obispo,CA+Fresno,CA+Yolo,CA' 
    },
    { 
      region: 'Greater Philadelphia', 
      primaryCity: 'Philadelphia',
      state: 'PA',
      urlParam: 'Philadelphia,PA+Berks,PA+Bucks,PA+Delaware,PA+Chester,PA+Lancaster,PA+Lehigh,PA+Mercer,PA+Montgomery,PA+Northampton,%20PA' 
    },
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
   * Scrape all regional multi-county areas from TangoMango
   * These are comprehensive regional URLs that cover multiple counties
   */
  async scrapeAllRegions(): Promise<number> {
    console.log('[TangoMango] 🌎 Starting regional multi-county scraping...');
    let totalEvents = 0;

    for (const config of this.regionalConfigs) {
      try {
        const events = await this.scrapeRegion(config);
        totalEvents += events;
        console.log(`[TangoMango] ✅ ${config.region}: ${events} events`);
        
        // Rate limiting - be respectful
        await this.delay(2000); // Longer delay for regional (larger) requests
      } catch (error: any) {
        console.error(`[TangoMango] ❌ Failed ${config.region}:`, error.message);
      }
    }

    console.log(`[TangoMango] 🎉 Total regional events scraped: ${totalEvents}`);
    return totalEvents;
  }

  /**
   * Scrape a single regional multi-county area
   * Uses address parsing to extract actual city from event details
   */
  async scrapeRegion(config: {region: string, urlParam: string, primaryCity: string, state: string}): Promise<number> {
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

    console.log(`[TangoMango] Found ${eventRefs.size} unique events in ${config.region}`);

    let savedCount = 0;
    
    // Fetch and save each event 
    // Use regional parsing to extract actual city from address
    for (const ref of Array.from(eventRefs)) {
      const [date, eventId] = ref.split('|');
      
      try {
        const event = await this.fetchEventDetails(
          date, 
          parseInt(eventId), 
          {
            city: config.primaryCity, // Default fallback
            state: config.state,
            urlParam: config.urlParam
          },
          true // Enable regional parsing to extract actual city from address
        );
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

    // Update source scraping timestamp for regional source
    await this.updateRegionalSourceTimestamp(config.region, config.urlParam);

    return savedCount;
  }

  /**
   * Update regional source timestamp by URL pattern
   */
  private async updateRegionalSourceTimestamp(region: string, urlParam: string): Promise<void> {
    try {
      // Match by URL pattern since regional sources have unique URLs
      const sourceUrl = `${this.baseUrl}/index.php?show=${urlParam}`;
      await db.update(eventScrapingSources)
        .set({ lastScrapedAt: new Date() })
        .where(eq(eventScrapingSources.url, sourceUrl));
      console.log(`[TangoMango] Updated timestamp for regional source: ${region}`);
    } catch (error) {
      // Ignore errors - source might not exist in database
    }
  }

  /**
   * Comprehensive scrape: both individual cities AND regional multi-county areas
   */
  async scrapeAll(): Promise<number> {
    console.log('[TangoMango] 🚀 Starting comprehensive US scraping (cities + regions)...');
    
    // Scrape individual cities first
    const cityEvents = await this.scrapeAllCities();
    
    // Then scrape regional multi-county areas for additional coverage
    const regionalEvents = await this.scrapeAllRegions();
    
    const totalEvents = cityEvents + regionalEvents;
    console.log(`[TangoMango] 🎉 Comprehensive scrape complete: ${totalEvents} total events (${cityEvents} city + ${regionalEvents} regional)`);
    
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
   * Extract city from address string (for regional scraping)
   * Parses city name from address like "123 Main St, Oakland, CA 94612"
   */
  private extractCityFromAddress(address: string, defaultCity: string): string {
    if (!address) return defaultCity;
    
    // Try to find city pattern: ", CityName, STATE" or ", CityName STATE"
    const cityMatch = address.match(/,\s*([A-Za-z\s]+),?\s*(?:CA|FL|IL|PA|NY|TX|WA|OR|CO|AZ|NV|UT|TN|LA|NC|MO|GA|MI|OH|MN|DC)\s*\d{0,5}/i);
    if (cityMatch && cityMatch[1]) {
      const extractedCity = cityMatch[1].trim();
      // Only use if it looks like a valid city name (not street suffix)
      if (extractedCity.length > 2 && !extractedCity.match(/^(St|Ave|Blvd|Dr|Rd|Way|Ct|Pl)$/i)) {
        return extractedCity;
      }
    }
    
    return defaultCity;
  }

  /**
   * Fetch event details from loadevent.php
   * @param useRegionalParsing - If true, attempt to extract actual city from address (for regional multi-county scraping)
   */
  private async fetchEventDetails(
    date: string, 
    eventId: number, 
    config: {city: string, state: string, urlParam: string},
    useRegionalParsing: boolean = false
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
    
    // For regional scraping, try to extract actual city from address
    let city = config.city;
    if (useRegionalParsing && address) {
      city = this.extractCityFromAddress(address, config.city);
    }
    
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
      city,
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
