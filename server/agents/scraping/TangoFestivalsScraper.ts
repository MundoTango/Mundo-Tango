/**
 * TANGO FESTIVALS SCRAPER
 * Scrapes tangofestivals.net for global tango events
 * 
 * URL: tangofestivals.net/events/
 * Data: Festivals, marathons, encuentros, workshops worldwide
 */

import axios from 'axios';
import * as cheerio from 'cheerio';
import { db } from '@shared/db';
import { scrapedEvents } from '@shared/schema';
import { cityMatcherService } from '../../services/CityMatcherService';
import { discoverTeamFromSubpages, formatTeamForDescription, hasTeamData } from './subpageDiscovery';
import { languageAwareFieldMapper, SupportedLanguage } from '../../services/LanguageAwareFieldMapper';
import { detailDiscoveryService } from '../../services/DetailDiscoveryService';
import { attachParticipantProfiles } from '../../services/ParticipantProfileHelper';

interface TangoFestivalEvent {
  title: string;
  dates: string;
  location: string;
  country: string;
  city: string;
  eventType: string;
  website?: string;
  description?: string;
  imageUrl?: string;
}

export class TangoFestivalsScraper {
  private baseUrl = 'https://tangofestivals.net';
  
  private userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'
  ];

  async scrapeAllEvents(sourceId: number): Promise<number> {
    console.log('[TangoFestivals] 🎪 Starting scrape');
    
    try {
      const events = await this.scrapeEventsPage(sourceId);
      console.log(`[TangoFestivals] 🎉 Total events scraped: ${events}`);
      return events;
    } catch (error) {
      console.error('[TangoFestivals] ❌ Failed to scrape:', error);
      return 0;
    }
  }

  async scrapeEventsPage(sourceId: number): Promise<number> {
    console.log('[TangoFestivals] 📅 Scraping events page...');

    const url = `${this.baseUrl}/events/`;
    const html = await this.fetchHTML(url);
    const $ = cheerio.load(html);
    
    const events = this.extractEvents($);
    
    if (events.length === 0) {
      console.log('[TangoFestivals] ⚠️ No events found');
      return 0;
    }

    await this.storeEvents(events, sourceId);
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

  private extractEvents($: cheerio.CheerioAPI): TangoFestivalEvent[] {
    const events: TangoFestivalEvent[] = [];

    // Look for event cards/articles
    $('article, .event, .event-card, [class*="event-item"], .festival-item, .listing-item').each((i, elem) => {
      try {
        const $card = $(elem);
        
        // Extract title
        const title = $card.find('h2, h3, h4, .title, .event-title, [class*="name"]')
          .first()
          .text()
          .trim();
        
        if (!title || title.length < 3) return;

        // Extract dates
        const datesText = $card.find('[class*="date"], .dates, time, .event-date, .when')
          .first()
          .text()
          .trim();

        // Extract location
        const locationText = $card.find('[class*="location"], .venue, .place, .where, address')
          .first()
          .text()
          .trim();

        // Extract country
        const countryText = $card.find('[class*="country"], .country-name')
          .text()
          .trim() || this.inferCountryFromLocation(locationText);

        // Extract image
        const imageUrl = $card.find('img').attr('src') || $card.find('img').attr('data-src');

        // Extract website link
        const website = $card.find('a[href*="http"]').attr('href') || 
                       $card.find('a').attr('href');

        // Extract description
        const description = $card.find('.description, .excerpt, p, .summary')
          .first()
          .text()
          .trim()
          .slice(0, 500);

        // Determine event type
        let eventType = this.determineEventType(title);

        // Parse city from location
        const city = this.parseCityFromLocation(locationText);

        events.push({
          title,
          dates: datesText || 'Date TBA',
          location: locationText || 'Location TBA',
          country: countryText,
          city,
          eventType,
          website: website?.startsWith('http') ? website : undefined,
          description,
          imageUrl
        });
      } catch (err) {
        console.error('[TangoFestivals] Error extracting event:', err);
      }
    });

    // Also try to find events in list/table format
    $('tr, li.event').each((i, elem) => {
      try {
        const $row = $(elem);
        
        // Skip headers
        if ($row.find('th').length > 0) return;
        
        const cells = $row.find('td');
        if (cells.length < 2) return;

        const title = $(cells[0]).text().trim() || $row.find('a').first().text().trim();
        if (!title || title.length < 3) return;

        const dates = $(cells[1]).text().trim();
        const location = $(cells[2])?.text().trim() || '';
        const website = $row.find('a[href]').attr('href');

        events.push({
          title,
          dates,
          location,
          country: this.inferCountryFromLocation(location),
          city: this.parseCityFromLocation(location),
          eventType: this.determineEventType(title),
          website: website?.startsWith('http') ? website : undefined
        });
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

  private determineEventType(title: string): string {
    const titleLower = title.toLowerCase();
    if (titleLower.includes('marathon')) return 'Marathon';
    if (titleLower.includes('encuentro')) return 'Encuentro';
    if (titleLower.includes('festival')) return 'Festival';
    if (titleLower.includes('camp')) return 'Tango Camp';
    if (titleLower.includes('congress')) return 'Congress';
    if (titleLower.includes('workshop')) return 'Workshop';
    if (titleLower.includes('intensive')) return 'Intensive';
    return 'Festival';
  }

  private parseCityFromLocation(location: string): string {
    if (!location) return 'Unknown';
    
    // Common patterns: "City, Country" or "Venue, City, Country"
    const parts = location.split(',').map(p => p.trim());
    
    if (parts.length >= 2) {
      return parts[parts.length - 2] || parts[0];
    }
    return parts[0] || 'Unknown';
  }

  private inferCountryFromLocation(location: string): string {
    if (!location) return 'Unknown';
    
    const locationLower = location.toLowerCase();
    const countryKeywords: Record<string, string> = {
      'argentina': 'Argentina',
      'buenos aires': 'Argentina',
      'germany': 'Germany',
      'berlin': 'Germany',
      'france': 'France',
      'paris': 'France',
      'italy': 'Italy',
      'roma': 'Italy',
      'spain': 'Spain',
      'madrid': 'Spain',
      'barcelona': 'Spain',
      'usa': 'United States',
      'united states': 'United States',
      'new york': 'United States',
      'uk': 'United Kingdom',
      'london': 'United Kingdom',
      'uruguay': 'Uruguay',
      'montevideo': 'Uruguay',
      'brazil': 'Brazil',
      'são paulo': 'Brazil',
      'netherlands': 'Netherlands',
      'amsterdam': 'Netherlands',
      'turkey': 'Turkey',
      'istanbul': 'Turkey',
      'greece': 'Greece',
      'athens': 'Greece',
      'poland': 'Poland',
      'russia': 'Russia',
      'japan': 'Japan',
      'tokyo': 'Japan',
      'australia': 'Australia',
      'sydney': 'Australia',
      'melbourne': 'Australia',
    };

    for (const [keyword, country] of Object.entries(countryKeywords)) {
      if (locationLower.includes(keyword)) {
        return country;
      }
    }
    
    // Try to get last part as country
    const parts = location.split(',').map(p => p.trim());
    return parts[parts.length - 1] || 'Unknown';
  }

  private async storeEvents(events: TangoFestivalEvent[], sourceId: number): Promise<void> {
    console.log(`[TangoFestivals] 💾 Storing ${events.length} events`);

    for (const event of events) {
      try {
        // Match city to group
        const matchResult = await cityMatcherService.matchEventLocation(event.city);
        const groupId = matchResult && typeof matchResult === 'object' && 'groupId' in matchResult 
          ? (matchResult as any).groupId 
          : null;

        // Parse date
        const startDate = this.parseDateFromString(event.dates);
        const endDate = this.parseEndDate(event.dates, startDate);
        
        // Default values
        let sourceUrl = 'tangofestivals.net';
        let sourceName = 'TangoFestivals.net';
        let enrichedDescription = event.description || `${event.eventType} in ${event.city}, ${event.country}`;
        let imageUrl = event.imageUrl;
        
        // MULTI-STAGE: Follow event website for additional data including team members
        if (event.website && event.website.startsWith('http') && !event.website.includes('tangofestivals.net')) {
          try {
            const parsedUrl = new URL(event.website);
            sourceUrl = event.website;
            sourceName = parsedUrl.hostname.replace('www.', '');
            console.log(`[TangoFestivals] 📎 Following: ${event.title} → ${sourceName}`);
            
            const eventHtml = await this.fetchHTML(event.website);
            
            // Try to extract cover image if not present
            if (!imageUrl) {
              const $ = cheerio.load(eventHtml);
              const ogImage = $('meta[property="og:image"]').attr('content');
              if (ogImage && ogImage.startsWith('http') && !ogImage.includes('logo')) {
                imageUrl = ogImage;
                console.log(`[TangoFestivals] 🖼️ Found image: ${imageUrl.substring(0, 50)}...`);
              }
            }
            
            // MULTI-PAGE: Discover team members from subpages
            try {
              const teamData = await discoverTeamFromSubpages(event.website, eventHtml);
              if (hasTeamData(teamData)) {
                const teamText = formatTeamForDescription(teamData);
                enrichedDescription = enrichedDescription + '\n\n' + teamText;
                console.log(`[TangoFestivals] 👥 Added team from subpages`);
              }
            } catch {
              // Team extraction is optional
            }
          } catch (fetchErr) {
            console.log(`[TangoFestivals] Could not fetch: ${event.website}`);
          }
        }

        // Extract participants and create profiles
        const participantData = await attachParticipantProfiles({
          title: event.title,
          description: enrichedDescription,
          organizer: sourceName !== 'TangoFestivals.net' ? sourceName : undefined
        });

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
          organizer: sourceName !== 'TangoFestivals.net' ? sourceName : undefined,
          imageUrl,
          groupId,
          status: 'approved',
          externalId: `tangofestivals-${event.title}`.toLowerCase().replace(/\s+/g, '-').slice(0, 100),
          organizerText: participantData.organizerText,
          djText: participantData.djText,
          teacherText: participantData.teacherText,
          performerText: participantData.performerText,
          participantProfiles: participantData.participantProfiles
        });
      } catch (err) {
        console.error(`[TangoFestivals] Failed to store event "${event.title}":`, err);
      }
    }
  }

  private parseDateFromString(dateStr: string): Date {
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

    const now = new Date();
    const currentYear = now.getFullYear();

    // Try to match patterns like "Jan 15, 2025" or "January 15-18"
    const dateMatch = dateStr.toLowerCase().match(/([a-z]+)\s*(\d{1,2})[,\s]*(\d{4})?/);
    
    if (dateMatch) {
      const month = monthMap[dateMatch[1]] ?? now.getMonth();
      const day = parseInt(dateMatch[2], 10) || 1;
      const year = dateMatch[3] ? parseInt(dateMatch[3], 10) : currentYear;
      
      return new Date(year, month, day, 20, 0, 0);
    }

    // Try to match just a year
    const yearMatch = dateStr.match(/(\d{4})/);
    if (yearMatch) {
      return new Date(parseInt(yearMatch[1], 10), 0, 1, 20, 0, 0);
    }

    // Default to 3 months from now for TBA
    const futureDate = new Date(now);
    futureDate.setMonth(now.getMonth() + 3);
    return futureDate;
  }

  private parseEndDate(dateStr: string, startDate: Date): Date | undefined {
    // Look for date range pattern (e.g., "Jan 15-18" or "15-18 Jan")
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

export const tangoFestivalsScraper = new TangoFestivalsScraper();
