/**
 * HOY MILONGA SCRAPER
 * Priority 1 - CRITICAL for Buenos Aires and other major tango cities
 * 
 * Scrapes: Buenos Aires, São Paulo, Berlin, Athens, Istanbul, London, Miami, Montevideo
 * URL Pattern: hoy-milonga.com/{city}/en/milongas
 */

import axios from 'axios';
import * as cheerio from 'cheerio';
import { db } from '@shared/db';
import { scrapedEvents } from '@shared/schema';
import { cityMatcherService } from '../../services/CityMatcherService';

interface HoyMilongaEvent {
  title: string;
  timeRange: string;
  venue: string;
  neighborhood?: string;
  city: string;
  eventType: string; // MILONGA, Clases, Artística, etc.
  classes?: string;
  description?: string;
  day: string; // e.g., "miércoles", "jueves"
}

interface ScrapedEventData {
  title: string;
  description?: string;
  startDate: Date;
  endDate?: Date;
  location?: string;
  address?: string;
  organizer?: string;
  price?: number;
  imageUrl?: string;
  externalId?: string;
  groupId?: number | null;
}

export class HoyMilongaScraper {
  private cityCodeMap: Record<string, string> = {
    'Buenos Aires': 'buenos-aires',
    'São Paulo': 'sao-paulo',
    'Berlin': 'berlin',
    'Athens': 'athens',
    'Istanbul': 'istanbul',
    'London': 'london',
    'Miami': 'miami',
    'Montevideo': 'montevideo'
  };

  private userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'
  ];

  /**
   * Scrape all supported Hoy Milonga cities
   */
  async scrapeAllCities(sourceId: number): Promise<number> {
    console.log('[HoyMilonga] 🌍 Starting scrape for all cities');
    let totalEvents = 0;

    for (const [cityName, cityCode] of Object.entries(this.cityCodeMap)) {
      try {
        const events = await this.scrapeCity(cityName, cityCode, sourceId);
        totalEvents += events;
        console.log(`[HoyMilonga] ✅ ${cityName}: ${events} events`);
      } catch (error) {
        console.error(`[HoyMilonga] ❌ Failed to scrape ${cityName}:`, error);
      }
    }

    console.log(`[HoyMilonga] 🎉 Total events scraped: ${totalEvents}`);
    return totalEvents;
  }

  /**
   * Scrape a specific city
   */
  async scrapeCity(cityName: string, cityCode: string, sourceId: number): Promise<number> {
    console.log(`[HoyMilonga] 📍 Scraping ${cityName}...`);

    // Try both /es (Spanish) and /en (English) endpoints
    const languages = ['es', 'en'];
    let events: HoyMilongaEvent[] = [];

    for (const lang of languages) {
      try {
        const url = `https://hoy-milonga.com/${cityCode}/${lang}/milongas`;
        const html = await this.fetchHTML(url);
        const $ = cheerio.load(html);
        
        events = this.extractEvents($, cityName);
        if (events.length > 0) {
          console.log(`[HoyMilonga] Found ${events.length} events in ${lang} for ${cityName}`);
          break; // Use first successful language
        }
      } catch (error) {
        console.log(`[HoyMilonga] Failed to fetch ${lang} for ${cityName}, trying next...`);
      }
    }

    if (events.length === 0) {
      console.log(`[HoyMilonga] ⚠️ No events found for ${cityName}`);
      return 0;
    }

    // Convert to ScrapedEventData and store
    await this.storeEvents(events, sourceId, cityName);

    return events.length;
  }

  /**
   * Fetch HTML with User-Agent rotation
   */
  private async fetchHTML(url: string): Promise<string> {
    const userAgent = this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': userAgent,
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9,es;q=0.8'
      },
      timeout: 30000
    });

    return response.data;
  }

  /**
   * Extract events from Hoy Milonga HTML
   */
  private extractEvents($: cheerio.CheerioAPI, cityName: string): HoyMilongaEvent[] {
    const events: HoyMilongaEvent[] = [];
    const days = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo',
                  'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

    // Find all day tabs
    const dayTabs = $('.day-tab, [class*="day"], [data-day]');
    
    // If no specific day tabs, look for event cards directly
    const eventCards = $('[class*="event-card"], [class*="milonga-item"], [class*="event-item"], .event, .milonga');
    
    eventCards.each((i, elem) => {
      try {
        const $card = $(elem);
        
        // Extract title
        const title = $card.find('h2, h3, .event-title, .milonga-name, [class*="title"]')
          .first()
          .text()
          .trim();
        
        if (!title) return;

        // Extract time
        const timeText = $card.find('[class*="time"], .hour, time, [class*="hora"]')
          .first()
          .text()
          .trim();

        // Extract venue
        const venue = $card.find('[class*="venue"], [class*="location"], .place, [class*="lugar"]')
          .first()
          .text()
          .trim() || 'Unknown Venue';

        // Extract neighborhood
        const neighborhood = $card.find('[class*="neighborhood"], [class*="barrio"], .area')
          .first()
          .text()
          .trim();

        // Extract event type
        const typeElement = $card.find('[class*="type"], .category, [class*="tipo"]').first();
        const eventType = typeElement.text().trim() || 'MILONGA';

        // Extract classes info if present
        const classesText = $card.find('[class*="class"], [class*="clase"]')
          .text()
          .trim();

        // Try to determine day from parent or context
        let day = 'unknown';
        const dayContext = $card.closest('[data-day], [class*="day-"]');
        if (dayContext.length > 0) {
          const dayAttr = dayContext.attr('data-day') || dayContext.attr('class') || '';
          for (const d of days) {
            if (dayAttr.toLowerCase().includes(d)) {
              day = d;
              break;
            }
          }
        }

        events.push({
          title,
          timeRange: timeText || 'Time not specified',
          venue,
          neighborhood,
          city: cityName,
          eventType,
          classes: classesText || undefined,
          day
        });
      } catch (err) {
        console.error('[HoyMilonga] Error extracting event:', err);
      }
    });

    return events;
  }

  /**
   * Store events in database with city matching
   */
  private async storeEvents(events: HoyMilongaEvent[], sourceId: number, cityName: string): Promise<void> {
    console.log(`[HoyMilonga] 💾 Storing ${events.length} events for ${cityName}`);

    // Match city to group using CityMatcherService
        const matchResult = await cityMatcherService.matchEventLocation(
                event.venue || event.address,
                cityName,  // Pass the source city from cityCodeMap
                event.address
              );
    const groupId = matchResult?.groupId || null;

    if (groupId) {
      console.log(`[HoyMilonga] 🎯 Matched ${cityName} to group ${groupId}`);
    } else {
      console.warn(`[HoyMilonga] ⚠️ Could not match ${cityName} to any group`);
    }

    for (const event of events) {
      try {
        // Parse date from day and time
        const startDate = this.parseDateFromDayAndTime(event.day, event.timeRange);
        const endDate = this.parseEndTime(event.timeRange, startDate);

        // Build description
        const description = [
          event.eventType,
          event.classes ? `Classes: ${event.classes}` : null,
          event.neighborhood ? `Neighborhood: ${event.neighborhood}` : null
        ].filter(Boolean).join(' | ');

        // Build location string
        const location = event.neighborhood 
          ? `${event.venue}, ${event.neighborhood}, ${event.city}`
          : `${event.venue}, ${event.city}`;

        await db.insert(scrapedEvents).values({
          sourceId,
          sourceUrl: 'hoy-milonga.com',
          sourceName: 'Hoy Milonga',
          title: event.title,
          description,
          startDate,
          endDate,
          location,
          address: location,
          organizer: event.venue,
          groupId,
          status: 'pending_review',
          externalId: `hoy-milonga-${event.city}-${event.title}`.toLowerCase().replace(/\s+/g, '-')
        });
      } catch (err) {
        console.error(`[HoyMilonga] Failed to store event "${event.title}":`, err);
      }
    }
  }

  /**
   * Parse start date from day and time string
   */
  private parseDateFromDayAndTime(day: string, timeRange: string): Date {
    const now = new Date();
    
    // Map day names to day numbers (0 = Sunday)
    const dayMap: Record<string, number> = {
      'sunday': 0, 'domingo': 0,
      'monday': 1, 'lunes': 1,
      'tuesday': 2, 'martes': 2,
      'wednesday': 3, 'miércoles': 3, 'mierc': 3,
      'thursday': 4, 'jueves': 4,
      'friday': 5, 'viernes': 5,
      'saturday': 6, 'sábado': 6, 'sabado': 6
    };

    const dayLower = day.toLowerCase();
    let targetDay = dayMap[dayLower];

    // If day not found, default to today
    if (targetDay === undefined) {
      targetDay = now.getDay();
    }

    // Calculate next occurrence of this day
    const currentDay = now.getDay();
    const daysUntilTarget = (targetDay - currentDay + 7) % 7;
    const targetDate = new Date(now);
    targetDate.setDate(now.getDate() + (daysUntilTarget === 0 ? 7 : daysUntilTarget));

    // Parse time from timeRange (e.g., "18:00 - 01:00" or "20:00")
    const timeMatch = timeRange.match(/(\d{1,2}):(\d{2})/);
    if (timeMatch) {
      targetDate.setHours(parseInt(timeMatch[1], 10));
      targetDate.setMinutes(parseInt(timeMatch[2], 10));
      targetDate.setSeconds(0);
      targetDate.setMilliseconds(0);
    } else {
      // Default to 20:00 if no time found
      targetDate.setHours(20, 0, 0, 0);
    }

    return targetDate;
  }

  /**
   * Parse end time from time range string
   */
  private parseEndTime(timeRange: string, startDate: Date): Date | undefined {
    // Look for end time in format "18:00 - 01:00"
    const endTimeMatch = timeRange.match(/-(\d{1,2}):(\d{2})/);
    
    if (endTimeMatch) {
      const endDate = new Date(startDate);
      const endHour = parseInt(endTimeMatch[1], 10);
      const endMinute = parseInt(endTimeMatch[2], 10);
      
      endDate.setHours(endHour);
      endDate.setMinutes(endMinute);
      
      // If end time is before start time, it's the next day
      if (endDate <= startDate) {
        endDate.setDate(endDate.getDate() + 1);
      }
      
      return endDate;
    }
    
    return undefined;
  }
}

export const hoyMilongaScraper = new HoyMilongaScraper();
